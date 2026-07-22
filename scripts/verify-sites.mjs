import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const inspector = resolve(root, "inspector-site-prototype");
const contractor = resolve(root, "contractor-site-prototype");

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

console.log("PASS: routes, trust guards, compliance copy, estimate safeguard, metadata files, and image budgets verified.");
