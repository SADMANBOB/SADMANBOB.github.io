import { expect } from "@playwright/test";
import { enabledContractorRoutes } from "../../contractor-site-prototype/src/content/routes.js";
import { enabledInspectorRoutes } from "../../inspector-site-prototype/src/content/routes.js";

export const responsiveViewports = Object.freeze([
  { name: "phone-360x800", width: 360, height: 800 },
  { name: "phone-390x844", width: 390, height: 844 },
  { name: "tablet-768x1024", width: 768, height: 1024 },
  { name: "tablet-1024x768", width: 1024, height: 768 },
  { name: "desktop-1280x800", width: 1280, height: 800 },
  { name: "desktop-1440x900", width: 1440, height: 900 },
]);

export const representativeRoutes = Object.freeze([
  { name: "inspector-home", path: "/" },
  { name: "inspector-services", path: "/services/" },
  { name: "inspector-faq", path: "/faq/" },
  { name: "inspector-contact", path: "/contact/" },
  { name: "contractor-services", path: "/contracting/services/" },
  { name: "contractor-estimate", path: "/contracting/estimate/" },
]);

const routeName = (surface, path) => {
  const slug = path === "/" ? "home" : path.replace(/^\/+|\/+$/g, "").replaceAll("/", "-");
  return `${surface}-${slug}`;
};

export const enabledRoutes = Object.freeze([
  ...enabledInspectorRoutes.map((route) => Object.freeze({
    name: routeName("inspector", route.path),
    path: route.path,
  })),
  Object.freeze({
    name: "property-services",
    path: "/property-services/",
  }),
  ...enabledContractorRoutes.map((route) => Object.freeze({
    name: routeName("contractor", route.path),
    path: `/contracting${route.path}`,
  })),
]);

export async function openStablePage(page, route) {
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.addInitScript(() => {
    const fixedNow = Date.parse("2026-07-23T12:00:00-07:00");
    const RealDate = Date;
    class FixedDate extends RealDate {
      constructor(...args) {
        super(...(args.length ? args : [fixedNow]));
      }
      static now() {
        return fixedNow;
      }
    }
    window.Date = FixedDate;
  });

  const response = await page.goto(route.path, { waitUntil: "load" });
  expect(response, `${route.path} returned no response`).not.toBeNull();
  expect(response.ok(), `${route.path} returned ${response.status()}`).toBe(true);
  await expect(page.locator("main h1").first()).toBeVisible();
  await page.evaluate(async () => {
    const settle = new Promise((resolveWait) => window.setTimeout(resolveWait, 3_000));
    await Promise.race([document.fonts.ready, settle]);
    await Promise.race([
      Promise.all([...document.images].map((image) =>
        image.complete ? Promise.resolve() : new Promise((resolveImage) => {
          image.addEventListener("load", resolveImage, { once: true });
          image.addEventListener("error", resolveImage, { once: true });
        }))),
      settle,
    ]);
    window.scrollTo(0, 0);
  });
  await expect.poll(() => runtimeErrors, { message: `${route.path} emitted runtime errors` }).toEqual([]);
  return runtimeErrors;
}
