import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const inspector = resolve(root, "inspector-site-prototype");
const contractor = resolve(root, "contractor-site-prototype");
const output = resolve(root, "_site");
const expectedOrigin = (process.env.SITE_ORIGIN || "https://sadmanbob.github.io").replace(/\/+$/, "");

const read = (path) => readFile(path, "utf8");
const inspectorSource = await read(resolve(inspector, "src/App.jsx"));
const contractorSource = await read(resolve(contractor, "src/App.jsx"));

const inspectorForbidden = [
  /fictional/i,
  /sampleReview/,
  /demoReview/,
  /same-day or next-day/i,
  /35 years/i,
  /licensed & insured/i,
];

for (const pattern of inspectorForbidden) {
  assert.equal(pattern.test(inspectorSource), false, `Inspector source contains prohibited production copy: ${pattern}`);
}

assert.match(inspectorSource, /previous 12 months/i, "Inspector separation policy is missing");
assert.match(contractorSource, /CSLB #\$\{licenseNumber\}/, "Contractor license display is missing");
assert.match(contractorSource, /Coastal Construction Services/, "Contractor of record is missing");
assert.match(contractorSource, /previous 12 months/i, "Contractor separation policy is missing");
assert.match(contractorSource, /inspected === "yes"/, "Estimate eligibility safeguard is missing");

const routeSets = [
  [inspector, ["services", "about", "areas", "faq", "resources", "contact"]],
  [contractor, ["services", "process", "about", "estimate"]],
];

for (const [site, routes] of routeSets) {
  await stat(resolve(site, "dist/index.html"));
  await stat(resolve(site, "dist/404.html"));
  await stat(resolve(site, "dist/robots.txt"));
  await stat(resolve(site, "dist/sitemap.xml"));
  for (const route of routes) await stat(resolve(site, `dist/${route}/index.html`));
}

const assembledRoutes = [
  "index.html",
  "services/index.html",
  "about/index.html",
  "areas/index.html",
  "faq/index.html",
  "resources/index.html",
  "contact/index.html",
  "contracting/index.html",
  "contracting/services/index.html",
  "contracting/process/index.html",
  "contracting/about/index.html",
  "contracting/estimate/index.html",
  "property-services/index.html",
  "property-services/styles.css",
  "robots.txt",
  "sitemap.xml",
  "contracting/robots.txt",
  "contracting/sitemap.xml",
];

for (const route of assembledRoutes) await stat(resolve(output, route));

const metadataRoutes = [
  ["index.html", "/", "inspector-home"],
  ["services/index.html", "/services/", "inspector"],
  ["about/index.html", "/about/", "inspector"],
  ["areas/index.html", "/areas/", "inspector"],
  ["faq/index.html", "/faq/", "inspector"],
  ["resources/index.html", "/resources/", "inspector"],
  ["contact/index.html", "/contact/", "inspector"],
  ["contracting/index.html", "/contracting/", "contractor-home"],
  ["contracting/services/index.html", "/contracting/services/", "contractor"],
  ["contracting/process/index.html", "/contracting/process/", "contractor"],
  ["contracting/about/index.html", "/contracting/about/", "contractor"],
  ["contracting/estimate/index.html", "/contracting/estimate/", "contractor"],
  ["property-services/index.html", "/property-services/", "portal"],
];

const inspectorHomeTitle = (await read(resolve(output, "index.html"))).match(/<title>([^<]+)<\/title>/)?.[1];
const contractorHomeTitle = (await read(resolve(output, "contracting/index.html"))).match(/<title>([^<]+)<\/title>/)?.[1];

for (const [file, route, section] of metadataRoutes) {
  const html = await read(resolve(output, file));
  const expectedUrl = `${expectedOrigin}${route}`;
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title, `${file} is missing a static title`);
  assert.ok(html.includes(`<link rel="canonical" href="${expectedUrl}"`), `${file} has the wrong canonical URL`);
  assert.ok(html.includes(`<meta property="og:url" content="${expectedUrl}"`), `${file} has the wrong Open Graph URL`);
  assert.match(html, /<meta name="description" content="[^"]+"/, `${file} is missing a static description`);
  if (section !== "portal") {
    assert.match(html, /<meta name="twitter:title" content="[^"]+"/, `${file} is missing a Twitter title`);
    assert.match(html, /<meta name="twitter:description" content="[^"]+"/, `${file} is missing a Twitter description`);
  }
  if (section === "inspector") assert.notEqual(title, inspectorHomeTitle, `${file} repeats the inspector homepage title`);
  if (section === "contractor") assert.notEqual(title, contractorHomeTitle, `${file} repeats the contractor homepage title`);
}

const assembledInspector = await read(resolve(output, "index.html"));
const assembledContractor = await read(resolve(output, "contracting/index.html"));
const assembledPortal = await read(resolve(output, "property-services/index.html"));
assert.match(assembledInspector, /Know what you’re buying/, "Inspector is not mounted at the site root");
assert.match(assembledContractor, /Practical repairs\. Built to last\./, "Contractor is not mounted at /contracting/");
assert.match(assembledPortal, /C&amp;G Property Services/, "Property-services chooser is missing");

for (const route of ["", "services", "about", "areas", "faq", "resources", "contact"]) {
  const redirect = await read(resolve(output, "inspections", route, "index.html"));
  assert.match(redirect, /Inspection page moved/, `Legacy /inspections/${route} redirect is missing`);
  assert.match(redirect, /location\.replace/, `Legacy /inspections/${route} redirect is not functional`);
}

assert.match(await read(resolve(output, "sitemap.xml")), new RegExp(`${expectedOrigin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/property-services/`));

const imageBudgets = [
  resolve(inspector, "public/assets/hero-inspector.jpg"),
  resolve(inspector, "public/assets/report-laptop.jpg"),
  resolve(inspector, "public/assets/attic-inspection.jpg"),
  resolve(inspector, "public/assets/contracting-review.jpg"),
  resolve(contractor, "public/assets/contractor-hero.jpg"),
  resolve(contractor, "public/assets/finish-work.jpg"),
  resolve(contractor, "public/assets/project-planning.jpg"),
];

for (const image of imageBudgets) {
  const { size } = await stat(image);
  assert.ok(size < 450_000, `${image} exceeds the 450 KB editorial image budget`);
}

console.log("PASS: root inspection routes, contractor routes, chooser, legacy redirects, trust guards, compliance copy, metadata files, and image budgets verified.");
