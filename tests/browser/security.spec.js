import { expect, test } from "@playwright/test";
import { LOOPBACK_CONTENT_SECURITY_POLICY } from "./loopback-security.js";

const searchCases = [
  {
    name: "inspector",
    path: "/",
    openLabel: "Search inspection guidance",
    query: "images",
    status: /Showing \d+ inspection results?\./,
    resultsLabel: "Inspection search results",
  },
  {
    name: "contractor",
    path: "/contracting/",
    openLabel: "Search contractor guidance",
    query: "details",
    status: /Showing \d+ contractor results?\./,
    resultsLabel: "Contractor search results",
  },
];

test.describe("strict CSP and Pagefind runtime @smoke", () => {
  for (const searchCase of searchCases) {
    test(`${searchCase.name} search loads its same-origin worker under CSP`, async ({ page }) => {
      const runtimeErrors = [];
      const failedRequests = [];
      const workerUrls = [];
      page.on("pageerror", (error) => runtimeErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") runtimeErrors.push(message.text());
      });
      page.on("requestfailed", (request) => {
        failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText || "failed"}`);
      });
      page.on("worker", (worker) => workerUrls.push(worker.url()));

      const response = await page.goto(searchCase.path, { waitUntil: "load" });
      expect(response?.ok(), `${searchCase.path} did not load`).toBe(true);
      await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute(
        "content",
        LOOPBACK_CONTENT_SECURITY_POLICY,
      );

      await page.getByRole("button", { name: searchCase.openLabel }).click();
      const searchForm = page.locator(".site-search-form");
      await searchForm.getByRole("searchbox").fill(searchCase.query);
      await searchForm.getByRole("button", { name: "Search", exact: true }).click();
      await expect(page.getByText(searchCase.status)).toBeVisible();
      const results = page.getByRole("list", { name: searchCase.resultsLabel });
      await expect(results).toBeVisible();
      const summaries = await results.locator("p").allTextContents();
      expect(summaries.length).toBeGreaterThan(0);
      for (const summary of summaries) {
        expect(summary, `${searchCase.name} search contains a glued lower-to-title word boundary`).not.toMatch(/[a-z0-9)\].!?;:,][A-Z][a-z]/);
        expect(summary, `${searchCase.name} search contains a glued acronym-to-title word boundary`).not.toMatch(/[A-Z]{2,}[A-Z][a-z]{2,}/);
      }

      await searchForm.getByRole("searchbox").fill("payment");
      await searchForm.getByRole("button", { name: "Search", exact: true }).click();
      await expect.poll(
        async () => (await results.locator("p").allTextContents()).join(" "),
        { message: `${searchCase.name} payment summaries did not finish rendering` },
      ).toContain("IDs");
      const paymentSummaries = await results.locator("p").allTextContents();
      expect(paymentSummaries.join(" ")).not.toMatch(/\bI Ds\b|\bFA Qs\b|\bPD Fs\b/);
      await expect.poll(
        () => workerUrls,
        { message: `${searchCase.name} Pagefind worker did not start` },
      ).toContainEqual(expect.stringContaining(`/pagefind/${searchCase.name}/pagefind-worker.js`));
      expect(failedRequests, `${searchCase.name} search emitted failed requests`).toEqual([]);
      expect(runtimeErrors, `${searchCase.name} search emitted CSP or runtime errors`).toEqual([]);
    });
  }

  test("legacy inspection redirect preserves query and fragment under CSP", async ({ page }) => {
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });

    await page.goto("/inspections/services/?source=legacy#roof", { waitUntil: "load" });
    await expect(page).toHaveURL(/\/services\/\?source=legacy#roof$/);
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute(
      "content",
      LOOPBACK_CONTENT_SECURITY_POLICY,
    );
    expect(runtimeErrors, "Legacy redirect emitted CSP or runtime errors").toEqual([]);
  });
});
