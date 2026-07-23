import { copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { business, separationPolicy } from "../shared/siteData.js";
import { enabledInspectorRoutes } from "../inspector-site-prototype/src/content/routes.js";
import { enabledContractorRoutes } from "../contractor-site-prototype/src/content/routes.js";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "_site");
const inspectorDist = resolve(root, "inspector-site-prototype/dist");
const contractorDist = resolve(root, "contractor-site-prototype/dist");
const portal = resolve(root, "portal");
const siteOrigin = (process.env.SITE_ORIGIN || business.inspection.origin).replace(/\/+$/, "");

const inspectorRoutes = enabledInspectorRoutes
  .filter((route) => route.sitemap !== false)
  .map((route) => route.path);
const contractorRoutes = enabledContractorRoutes
  .filter((route) => route.sitemap !== false)
  .map((route) => `/contracting${route.path}`);
const legacyInspectorRoutes = [
  ["", "/"],
  ["services", "/services/"],
  ["about", "/about/"],
  ["areas", "/areas/"],
  ["faq", "/faq/"],
  ["resources", "/resources/"],
  ["contact", "/contact/"],
];

const sitemap = (routes) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((route) => `  <url><loc>${siteOrigin}${route}</loc></url>`).join("\n")}
</urlset>
`;

const redirectPage = (target) => {
  const absoluteTarget = `${siteOrigin}${target}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex,follow" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <link rel="canonical" href="${absoluteTarget}" />
    <title>Inspection page moved | C&amp;G</title>
  </head>
  <body>
    <p>This inspection page has moved. <a href="${target}">Continue to C&amp;G Certified Home Inspector</a>.</p>
    <script>location.replace(${JSON.stringify(target)} + location.search + location.hash);</script>
  </body>
</html>
`;
};

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(inspectorDist, output, { recursive: true });

await mkdir(resolve(output, "contracting"), { recursive: true });
await cp(contractorDist, resolve(output, "contracting"), { recursive: true });

await mkdir(resolve(output, "property-services"), { recursive: true });
const portalHtml = (await readFile(resolve(portal, "index.html"), "utf8"))
  .replaceAll("{{SITE_ORIGIN}}", siteOrigin)
  .replaceAll("{{PHONE_DISPLAY}}", business.inspection.phoneDisplay)
  .replaceAll("{{PHONE_HREF}}", business.inspection.phoneHref)
  .replaceAll("{{EMAIL}}", business.inspection.email)
  .replaceAll("{{CONTRACTOR_OF_RECORD}}", business.contracting.contractorOfRecord)
  .replaceAll("{{LICENSE_NUMBER}}", business.contracting.license.number)
  .replaceAll("{{LICENSE_CLASSIFICATION}}", business.contracting.license.classification)
  .replaceAll("{{LICENSE_URL}}", business.contracting.license.officialLookupUrl.replaceAll("&", "&amp;"))
  .replaceAll("{{SEPARATION_NOTICE}}", separationPolicy.notice.replaceAll("&", "&amp;"));
await writeFile(resolve(output, "property-services/index.html"), portalHtml);
await copyFile(resolve(portal, "styles.css"), resolve(output, "property-services/styles.css"));

for (const [legacyRoute, target] of legacyInspectorRoutes) {
  const directory = resolve(output, "inspections", legacyRoute);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), redirectPage(target));
}

await writeFile(resolve(output, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\nSitemap: ${siteOrigin}/contracting/sitemap.xml\n`);
await writeFile(resolve(output, "sitemap.xml"), sitemap([...inspectorRoutes, "/property-services/"]));
await writeFile(resolve(output, "contracting/robots.txt"), `User-agent: *\nAllow: /contracting/\n\nSitemap: ${siteOrigin}/contracting/sitemap.xml\n`);
await writeFile(resolve(output, "contracting/sitemap.xml"), sitemap(contractorRoutes));
await writeFile(resolve(output, ".nojekyll"), "");
