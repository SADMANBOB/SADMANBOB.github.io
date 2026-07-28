import { expect, test } from "@playwright/test";
import { business } from "../../shared/siteData.js";
import { enabledRoutes, openStablePage } from "./site-fixture.js";

test.describe("cross-browser production-route smoke @smoke", () => {
  for (const route of enabledRoutes) {
    test(`${route.name} renders its prerendered identity without overflow`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await openStablePage(page, route);

      await expect(page).toHaveTitle(/\S+/);
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("main h1")).toHaveCount(1);
      const overflow = await page.evaluate(() => ({
        body: document.body.scrollWidth - document.body.clientWidth,
        document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      expect(overflow, `${route.path} has horizontal overflow`).toEqual({ body: 0, document: 0 });
    });
  }
});

test.describe("responsive navigation and contact recovery @smoke", () => {
  test("root chooser sends each service choice to the correct home", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openStablePage(page, { name: "chooser", path: "/" });

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Which service are you looking for?");

    const inspectionChoice = page.getByRole("link", { name: "Explore Home Inspection", exact: true });
    await expect(inspectionChoice).toHaveAttribute("href", "/inspection/");
    await inspectionChoice.click();
    await expect(page).toHaveURL(/\/inspection\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Know what you’re buying.");

    await page.goto("/");
    const contractingChoice = page.getByRole("link", { name: "Explore Contracting Services", exact: true });
    await expect(contractingChoice).toHaveAttribute("href", "/contracting/");
    await contractingChoice.click();
    await expect(page).toHaveURL(/\/contracting\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Practical repairs. Built to last.");
  });

  test("inspection navigation collapses at 840px before links can wrap", async ({ page }) => {
    await page.setViewportSize({ width: 840, height: 900 });
    await openStablePage(page, { name: "inspector-home", path: "/inspection/" });

    const menuButton = page.locator("button.menu-toggle");
    const navigation = page.getByRole("navigation", { name: "Main navigation", exact: true });
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAccessibleName("Open navigation");
    await expect(navigation).toBeHidden();
    await menuButton.click();
    await expect(navigation).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await expect(menuButton).toHaveAccessibleName("Close navigation");
  });

  test("inspection contact offers a prepared existing-report question path", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openStablePage(page, { name: "inspector-contact", path: "/contact/" });

    const reportLink = page.getByRole("link", { name: "Prepare a report-question email", exact: true });
    await expect(reportLink).toBeVisible();
    const href = await reportLink.getAttribute("href");
    expect(href).toContain(`mailto:${business.inspection.email}`);
    expect(decodeURIComponent(href)).toContain("Question about an existing C&G inspection report");
    expect(decodeURIComponent(href)).toContain("Report section or page:");
    expect(decodeURIComponent(href)).toContain("Please do not attach the full report");
  });
});
