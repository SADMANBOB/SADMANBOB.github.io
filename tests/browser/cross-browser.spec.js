import { expect, test } from "@playwright/test";
import { openStablePage, representativeRoutes } from "./site-fixture.js";

test.describe("cross-browser production-route smoke @smoke", () => {
  for (const route of representativeRoutes) {
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
