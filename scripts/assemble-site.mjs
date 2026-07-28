import { copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { business, separationPolicy } from "../shared/siteData.js";
import { isLocalFilesystemArtifact } from "../shared/outputHygiene.js";
import { enabledInspectorRoutes } from "../inspector-site-prototype/src/content/routes.js";
import { enabledContractorRoutes } from "../contractor-site-prototype/src/content/routes.js";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "_site");
const inspectorDist = resolve(root, "inspector-site-prototype/dist");
const contractorDist = resolve(root, "contractor-site-prototype/dist");
const portal = resolve(root, "portal");
const legacyRedirectScript = resolve(root, "shared/legacyRedirect.js");
const siteOrigin = (process.env.SITE_ORIGIN || business.inspection.origin).replace(/\/+$/, "");

const inspectorRoutes = enabledInspectorRoutes
  .filter((route) => route.sitemap !== false)
  .map((route) => route.path);
const contractorRoutes = enabledContractorRoutes
  .filter((route) => route.sitemap !== false)
  .map((route) => `/contracting${route.path}`);
const legacyInspectorRoutes = [
  ["", "/inspection/"],
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

const redirectPage = (target, {
  title = "Page moved | C&amp;G",
  message = "This page has moved.",
  linkLabel = "Continue to C&amp;G",
} = {}) => {
  const absoluteTarget = `${siteOrigin}${target}`;
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex,follow" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <link rel="canonical" href="${absoluteTarget}" />
    <title>${title}</title>
  </head>
  <body data-redirect-target="${target}">
    <p>${message} <a href="${target}">${linkLabel}</a>.</p>
    <script src="/assets/legacy-redirect.js"></script>
  </body>
</html>
`;
};

const hydratePortalTemplate = (template) => template
  .replaceAll("{{SITE_ORIGIN}}", siteOrigin)
  .replaceAll("{{PHONE_DISPLAY}}", business.inspection.phoneDisplay)
  .replaceAll("{{PHONE_HREF}}", business.inspection.phoneHref)
  .replaceAll("{{EMAIL}}", business.inspection.email)
  .replaceAll("{{CONTRACTOR_OF_RECORD}}", business.contracting.contractorOfRecord)
  .replaceAll("{{LICENSE_NUMBER}}", business.contracting.license.number)
  .replaceAll("{{LICENSE_CLASSIFICATION}}", business.contracting.license.classification)
  .replaceAll("{{LICENSE_URL}}", business.contracting.license.officialLookupUrl.replaceAll("&", "&amp;"))
  .replaceAll("{{SEPARATION_NOTICE}}", separationPolicy.notice.replaceAll("&", "&amp;"));

const escapeVcardText = (value) => String(value)
  .replaceAll("\\", "\\\\")
  .replaceAll("\n", "\\n")
  .replaceAll(",", "\\,")
  .replaceAll(";", "\\;");
const foldVcardLine = (line) => {
  const folded = [];
  let current = "";
  for (const character of line) {
    if (Buffer.byteLength(current + character, "utf8") > 75) {
      folded.push(current);
      current = ` ${character}`;
    } else {
      current += character;
    }
  }
  folded.push(current);
  return folded.join("\r\n");
};
const vcardFor = ({ name, phoneHref, email, url, note }) => [
  "BEGIN:VCARD",
  "VERSION:4.0",
  `FN:${escapeVcardText(name)}`,
  `ORG:${escapeVcardText(name)}`,
  `TEL;TYPE=work,voice;VALUE=uri:${phoneHref}`,
  `EMAIL;TYPE=work:${email}`,
  `URL:${url}`,
  `NOTE:${escapeVcardText(note)}`,
  "END:VCARD",
  "",
].map(foldVcardLine).join("\r\n");

// macOS sidecars must never reach the deployed artifact, so every copy into _site is filtered.
const copyWithoutLocalArtifacts = (from, to) =>
  cp(from, to, { recursive: true, filter: (source) => !isLocalFilesystemArtifact(source) });

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await copyWithoutLocalArtifacts(inspectorDist, output);
await mkdir(resolve(output, "assets"), { recursive: true });
await copyFile(legacyRedirectScript, resolve(output, "assets/legacy-redirect.js"));
await writeFile(resolve(output, "assets/cg-inspection.vcf"), vcardFor({
  name: business.inspection.publicName,
  phoneHref: business.inspection.phoneHref,
  email: business.inspection.email,
  url: `${siteOrigin}/inspection/`,
  note: `${business.inspection.positioning} Home inspection and residential contracting are separate services.`,
}));
await writeFile(resolve(output, "assets/cg-contracting.vcf"), vcardFor({
  name: business.contracting.publicName,
  phoneHref: business.contracting.phoneHref,
  email: business.contracting.email,
  url: `${siteOrigin}/contracting/`,
  note: `${business.contracting.positioning} Contractor of record: ${business.contracting.contractorOfRecord}, CSLB #${business.contracting.license.number}.`,
}));

await mkdir(resolve(output, "contracting"), { recursive: true });
await copyWithoutLocalArtifacts(contractorDist, resolve(output, "contracting"));

await mkdir(resolve(output, "property-services"), { recursive: true });
const portalHtml = hydratePortalTemplate(await readFile(resolve(portal, "index.html"), "utf8"));
const rootNotFoundHtml = hydratePortalTemplate(await readFile(resolve(portal, "404.html"), "utf8"));
await writeFile(resolve(output, "index.html"), portalHtml);
await writeFile(resolve(output, "property-services/index.html"), redirectPage("/", {
  title: "Service chooser moved | C&amp;G",
  message: "The C&amp;G service chooser is now the site home.",
  linkLabel: "Choose a service",
}));
// GitHub Pages serves this root document for missing paths on either service,
// so it must not imply that a missing contractor route belongs to inspection.
await writeFile(resolve(output, "404.html"), rootNotFoundHtml);
await copyFile(resolve(portal, "styles.css"), resolve(output, "property-services/styles.css"));

for (const [legacyRoute, target] of legacyInspectorRoutes) {
  const directory = resolve(output, "inspections", legacyRoute);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), redirectPage(target, {
    title: "Inspection page moved | C&amp;G",
    message: "This inspection page has moved.",
    linkLabel: "Continue to C&amp;G Certified Home Inspector",
  }));
}

// Robots directives are only honoured at the origin root, so a single authoritative
// /robots.txt advertises both sitemaps. A nested /contracting/robots.txt is never read
// by a crawler and is therefore not emitted.
await writeFile(resolve(output, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin}/sitemap.xml\nSitemap: ${siteOrigin}/contracting/sitemap.xml\n`);
await writeFile(resolve(output, "sitemap.xml"), sitemap(["/", ...inspectorRoutes]));
await writeFile(resolve(output, "contracting/sitemap.xml"), sitemap(contractorRoutes));
await writeFile(resolve(output, ".nojekyll"), "");
