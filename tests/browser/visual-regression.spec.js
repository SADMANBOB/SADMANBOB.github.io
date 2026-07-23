import { resolve } from "node:path";
import { expect, test } from "@playwright/test";
import { openStablePage, representativeRoutes, responsiveViewports } from "./site-fixture.js";

const regressionStyle = resolve("tests/browser/visual-reset.css");

test.describe("automated responsive regression matrix @visual", () => {
  for (const route of representativeRoutes) {
    for (const viewport of responsiveViewports) {
      test(`${route.name} at ${viewport.name}`, async ({ browserName, page }, testInfo) => {
        testInfo.annotations.push({
          type: "evidence-boundary",
          description: browserName === "firefox"
            ? "Automated Firefox responsive-layout assertion only; passing is not manual visual signoff or public deployment proof."
            : "Automated screenshot comparison only; passing is not manual visual signoff or public deployment proof.",
        });
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await openStablePage(page, route);

        if (browserName === "firefox") {
          const overflow = await page.evaluate(() => ({
            body: document.body.scrollWidth - document.body.clientWidth,
            document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          }));
          expect(overflow, `${route.path} has horizontal overflow at ${viewport.name}`).toEqual({
            body: 0,
            document: 0,
          });
          await expect(page.locator("main")).toBeVisible();
          return;
        }

        await expect(page).toHaveScreenshot(`${route.name}-${viewport.name}.png`, {
          fullPage: false,
          stylePath: regressionStyle,
        });
      });
    }
  }
});
