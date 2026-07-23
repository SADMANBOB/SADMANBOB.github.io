import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { analytics, approvedServiceAreas, business, claimIsApproved, claims, evaluateContractorEligibility, imageProvenance, integrationCanRender, integrations, separationPolicy, serviceAreas } from "../shared/siteData.js";
import { inspectorRoutes, enabledInspectorRoutes, inspectorNotFoundRoute } from "../inspector-site-prototype/src/content/routes.js";
import { inspectorFaqItems } from "../inspector-site-prototype/src/content/faqs.js";
import { enabledInspectionScope } from "../inspector-site-prototype/src/content/inspectionScope.js";
import { resourceBySlug } from "../inspector-site-prototype/src/content/resources.js";
import { contractorRoutes, enabledContractorRoutes, contractorNotFoundRoute } from "../contractor-site-prototype/src/content/routes.js";
import { contractorFaqs } from "../contractor-site-prototype/src/content/faqs.js";
import { contractorRequestCategories, contractorServices, requestCategoryFromSearch } from "../contractor-site-prototype/src/content/services.js";

const root = resolve(import.meta.dirname, "..");
const inspector = resolve(root, "inspector-site-prototype");
const contractor = resolve(root, "contractor-site-prototype");
const output = resolve(root, "_site");
const expectedOrigin = (process.env.SITE_ORIGIN || business.inspection.origin).replace(/\/+$/, "");
const read = (path) => readFile(path, "utf8");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const routeFile = (path) => path === "/" ? "index.html" : `${path.replace(/^\/+|\/+$/g, "")}/index.html`;
const contractorPublicPath = (path) => `/contracting${path}`;
const contractorOutputFile = (path) => `contracting/${routeFile(path)}`;

const listFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? listFiles(resolve(directory, entry.name)) : [resolve(directory, entry.name)]));
  return nested.flat();
};

const metaContent = (html, attribute, key) => html.match(new RegExp(`<meta ${attribute}="${escapeRegex(key)}" content="([^"]*)"`))?.[1];
const titleContent = (html) => html.match(/<title>([^<]+)<\/title>/)?.[1];
const canonicalContent = (html) => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const schemaContent = (html) => html.match(/<script id="cg-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
const sitemapLocations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const escapeHtmlText = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const inspectorSourceFiles = (await listFiles(resolve(inspector, "src"))).filter((file) => /\.(jsx?|css)$/.test(file));
const contractorSourceFiles = (await listFiles(resolve(contractor, "src"))).filter((file) => /\.(jsx?|css)$/.test(file));
const inspectorSource = (await Promise.all(inspectorSourceFiles.map(read))).join("\n");
const contractorSource = (await Promise.all(contractorSourceFiles.map(read))).join("\n");
const allSource = `${inspectorSource}\n${contractorSource}`;

const forbiddenDirectClaims = [
  /\b(?:35\+?|over 35) years\b/i,
  /\bdecades of experience\b/i,
  /\bfully insured\b/i,
  /\blicensed\s*(?:&|and)\s*insured\b/i,
  /\bInterNACHI\b/i,
  /\b(?:same|next)[ -]day reports?\b/i,
  /\bMonday[–-]Saturday\b/i,
  /\bSunday by appointment\b/i,
  /\b(?:real customer|customer review|five-star|5-star)\b/i,
  /\bcompleted C&G projects?\b/i,
];
for (const pattern of forbiddenDirectClaims) assert.equal(pattern.test(allSource), false, `Production source contains an unapproved direct claim: ${pattern}`);

for (const [id, claim] of Object.entries(claims)) {
  if (claim.status === "approved") assert.equal(claimIsApproved(claim, new Date("2026-07-22T12:00:00Z")), true, `Approved claim ${id} is expired or invalid`);
}
assert.equal(claimIsApproved(claims.contractorLicense, new Date("2026-07-22T12:00:00Z")), true, "Official contractor license gate is not current");
assert.ok(business.contracting.license.liveVerifiedAt, "Contractor license lacks a live verification date");
assert.match(business.contracting.license.officialLookupUrl, /^https:\/\/www\.cslb\.ca\.gov\//, "Contractor license link is not an official CSLB URL");
assert.equal(analytics.enabled, false, "Analytics must remain disabled until a provider is approved");
assert.equal(integrationCanRender(integrations.siteSearch), true, "Approved Pagefind search integration is not renderable");
assert.equal(integrationCanRender(integrations.inspectionFormTransport), true, "Inspection mailto transport is not renderable");
assert.equal(integrationCanRender(integrations.contractorFormTransport), true, "Contractor mailto transport is not renderable");
for (const id of ["booking", "analytics", "maps", "reviews"]) {
  const integration = integrations[id];
  assert.equal(integrationCanRender(integration), false, `Pending ${id} integration became renderable`);
  assert.equal(integration.enabled, false, `Pending ${id} integration became enabled`);
  assert.equal(integration.provider, null, `Pending ${id} integration contains a provider`);
  assert.equal(integration.publicConfig, null, `Pending ${id} integration contains public configuration`);
}

assert.deepEqual(evaluateContractorEligibility("no"), { state: "eligible", canPrepareOrdinaryRequest: true });
assert.deepEqual(evaluateContractorEligibility("yes"), { state: "blocked", canPrepareOrdinaryRequest: false });
assert.deepEqual(evaluateContractorEligibility("unsure"), { state: "manual-review", canPrepareOrdinaryRequest: false });
assert.deepEqual(evaluateContractorEligibility(""), { state: "validation-error", canPrepareOrdinaryRequest: false });
assert.deepEqual(evaluateContractorEligibility("unknown"), { state: "validation-error", canPrepareOrdinaryRequest: false });
assert.match(contractorSource, /Has C(?:&|&amp;)G prepared a home inspection report for this property during the previous 12 months\?/i, "Estimate eligibility question is missing");
assert.match(contractorSource, /Prepare eligibility review email/, "Manual eligibility-review state is missing");
assert.match(contractorSource, /separationPolicy\.blocked/, "Blocked independent-contractor message is not wired to the registry");
assert.match(separationPolicy.blocked, /independent contractor/i, "Blocked registry copy lacks the independent-contractor direction");
assert.equal(/inspection report.{0,120}(?:project category|estimate form).{0,120}(?:prefill|auto)/is.test(contractorSource), false, "Inspection report data appears to auto-populate a contracting request");
assert.equal(contractorRequestCategories.length, contractorServices.length + 1, "Contractor request category allowlist is incomplete");
assert.equal(new Set(contractorRequestCategories.map((category) => category.key)).size, contractorRequestCategories.length, "Contractor request category keys are not unique");
for (const category of contractorRequestCategories) {
  assert.equal(requestCategoryFromSearch(`?category=${encodeURIComponent(category.key)}`), category.key, `Allowed contractor category ${category.key} is not accepted`);
}
assert.equal(requestCategoryFromSearch(""), "", "A missing category query must remain empty");
assert.equal(requestCategoryFromSearch("?category=unknown-category"), "", "An unknown contractor category query was accepted");
assert.equal(requestCategoryFromSearch("?category=drywall-surface-repair&category=exterior-details"), "", "Duplicate contractor category queries were accepted");
assert.equal(requestCategoryFromSearch("?category=drywall-surface-repair&email=visitor%40example.com"), "", "A query containing personal data was accepted for category prefill");
assert.ok(contractorSource.indexOf("Eligibility comes first") < contractorSource.indexOf("Contact and property"), "Estimate flow does not present eligibility before contact and property details");
assert.match(contractorSource, /manualReviewFields/, "Limited manual eligibility-review fields are missing");
assert.match(contractorSource, /Nothing has been sent or received/, "Truthful mailto preparation status is missing");
assert.match(contractorSource, /id="inspection-eligibility"/, "The shared 12-month-rule anchor target is missing");
assert.match(contractorSource, /eligibility\.state === "validation-error"/, "The unanswered eligibility path has no visible validation action");
assert.match(contractorSource, /key=\{categoryKey \|\| "unclassified"\}/, "Category-query changes do not reset the estimate form state");

for (const site of [inspector, contractor]) {
  await stat(resolve(site, "dist/index.html"));
  await stat(resolve(site, "dist/404.html"));
  await stat(resolve(site, "dist/robots.txt"));
  await stat(resolve(site, "dist/sitemap.xml"));
}

const routeRecords = [
  ...enabledInspectorRoutes.map((route) => ({ route, publicPath: route.path, outputFile: routeFile(route.path), site: "inspector" })),
  ...enabledContractorRoutes.map((route) => ({ route, publicPath: contractorPublicPath(route.path), outputFile: contractorOutputFile(route.path), site: "contractor" })),
  { route: { key: "property-services", title: "C&G Property Services", description: "Choose C&G home inspection or residential contracting services." }, publicPath: "/property-services/", outputFile: "property-services/index.html", site: "portal" },
];

const titles = new Map();
const descriptions = new Map();
for (const record of routeRecords) {
  const filePath = resolve(output, record.outputFile);
  await stat(filePath);
  const html = await read(filePath);
  const visibleMarkup = html.replace(/<!--[\s\S]*?-->/g, "");
  const expectedUrl = `${expectedOrigin}${record.publicPath}`;
  const title = titleContent(html);
  const description = metaContent(html, "name", "description");
  assert.ok(title, `${record.outputFile} is missing a static title`);
  assert.ok(description, `${record.outputFile} is missing a meta description`);
  assert.equal(canonicalContent(html), expectedUrl, `${record.outputFile} has the wrong canonical URL`);
  assert.equal(metaContent(html, "property", "og:url"), expectedUrl, `${record.outputFile} has the wrong Open Graph URL`);
  assert.ok(metaContent(html, "property", "og:title"), `${record.outputFile} is missing an Open Graph title`);
  assert.ok(metaContent(html, "property", "og:description"), `${record.outputFile} is missing an Open Graph description`);
  assert.ok(metaContent(html, "property", "og:image"), `${record.outputFile} is missing an approved Open Graph image`);
  assert.ok(metaContent(html, "name", "twitter:title"), `${record.outputFile} is missing a Twitter title`);
  assert.ok(metaContent(html, "name", "twitter:description"), `${record.outputFile} is missing a Twitter description`);
  assert.ok(metaContent(html, "name", "twitter:image"), `${record.outputFile} is missing a Twitter image`);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${record.outputFile} must contain exactly one prerendered H1`);
  assert.ok(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length > 500, `${record.outputFile} lacks substantive prerendered page text`);
  assert.equal(metaContent(html, "name", "robots"), undefined, `${record.outputFile} is accidentally noindex`);
  assert.equal(titles.has(title), false, `${record.outputFile} duplicates the title from ${titles.get(title)}`);
  assert.equal(descriptions.has(description), false, `${record.outputFile} duplicates the description from ${descriptions.get(description)}`);
  titles.set(title, record.outputFile);
  descriptions.set(description, record.outputFile);

  const rawSchema = schemaContent(html);
  assert.ok(rawSchema, `${record.outputFile} is missing JSON-LD`);
  const schema = JSON.parse(rawSchema);
  const graph = schema["@graph"] || [];
  const webPage = graph.find((entry) => entry["@type"] === "WebPage");
  assert.equal(webPage?.url, expectedUrl, `${record.outputFile} JSON-LD URL is wrong`);
  assert.equal(JSON.stringify(schema).match(/aggregateRating|reviewRating|areaServed/g), null, `${record.outputFile} JSON-LD contains unapproved rating or area data`);
  if (record.site === "contractor") {
    assert.match(visibleMarkup, new RegExp(`CSLB #${business.contracting.license.number}`), `${record.outputFile} lacks the visible license number`);
    assert.match(visibleMarkup, new RegExp(escapeRegex(business.contracting.contractorOfRecord)), `${record.outputFile} lacks the visible contractor of record`);
    assert.equal(graph.some((entry) => entry["@type"] === "GeneralContractor"), false, `${record.outputFile} must not claim GeneralContractor identity until the public-name relationship is approved`);
  }
  if (record.route.article) {
    const article = graph.find((entry) => entry["@type"] === "Article");
    const resource = resourceBySlug.get(record.route.slug);
    assert.equal(article?.headline, resource.title, `${record.outputFile} Article headline is wrong`);
    assert.equal(article?.datePublished, resource.published, `${record.outputFile} Article publish date is wrong`);
    assert.equal(article?.dateModified, resource.modified, `${record.outputFile} Article modified date is wrong`);
    assert.equal(article?.mainEntityOfPage, expectedUrl, `${record.outputFile} Article canonical URL is wrong`);
    assert.ok(html.includes(resource.disclaimer), `${record.outputFile} lacks its educational disclaimer`);
    assert.ok(resource.related.length >= 2, `${record.outputFile} lacks at least two related-resource records`);
    for (const slug of resource.related) assert.ok(html.includes(`/resources/${slug}/`), `${record.outputFile} lacks related resource ${slug}`);
  }
  if (record.route.key === "faq") {
    const faq = graph.find((entry) => entry["@type"] === "FAQPage");
    const expectedCount = record.site === "inspector" ? inspectorFaqItems.length : contractorFaqs.length;
    assert.equal(faq?.mainEntity?.length, expectedCount, `${record.outputFile} FAQ schema does not match visible answers`);
  }
  if (record.route.path !== "/" && record.site !== "portal") {
    assert.ok(graph.some((entry) => entry["@type"] === "BreadcrumbList"), `${record.outputFile} lacks breadcrumb JSON-LD`);
    assert.match(html, /aria-label="Breadcrumb"/, `${record.outputFile} lacks a visible breadcrumb`);
  }
}

const rootSitemap = sitemapLocations(await read(resolve(output, "sitemap.xml")));
const contractorSitemap = sitemapLocations(await read(resolve(output, "contracting/sitemap.xml")));
const expectedRootSitemap = [...enabledInspectorRoutes.map((route) => `${expectedOrigin}${route.path}`), `${expectedOrigin}/property-services/`];
const expectedContractorSitemap = enabledContractorRoutes.map((route) => `${expectedOrigin}/contracting${route.path}`);
assert.deepEqual(rootSitemap, expectedRootSitemap, "Root sitemap does not exactly match enabled inspector and chooser routes");
assert.deepEqual(contractorSitemap, expectedContractorSitemap, "Contractor sitemap does not exactly match enabled contractor routes");
assert.equal(new Set(rootSitemap).size, rootSitemap.length, "Root sitemap contains duplicate routes");
assert.equal(new Set(contractorSitemap).size, contractorSitemap.length, "Contractor sitemap contains duplicate routes");
assert.equal(rootSitemap.some((url) => url.includes("/contracting/")), false, "Contractor routes leaked into the root sitemap");
assert.equal(contractorSitemap.some((url) => !url.startsWith(`${expectedOrigin}/contracting/`)), false, "Non-contractor route leaked into contractor sitemap");

const disabledInspectorRoutes = inspectorRoutes.filter((route) => !route.enabled);
const disabledContractorRoutes = contractorRoutes.filter((route) => !route.enabled);
const publicRouteMarkup = (await Promise.all(routeRecords.map((record) => read(resolve(output, record.outputFile))))).join("\n");
for (const record of routeRecords.filter((item) => item.site === "inspector")) {
  const html = await read(resolve(output, record.outputFile));
  assert.match(html, /href="\/contracting\/"/, `${record.outputFile} lacks the top-level contractor link`);
  assert.match(html, /12-month separation policy/, `${record.outputFile} lacks cross-service separation context`);
  assert.match(html, /data-pagefind-body="true"/, `${record.outputFile} lacks the inspector search body boundary`);
}
for (const record of routeRecords.filter((item) => item.site === "contractor")) {
  const html = await read(resolve(output, record.outputFile));
  assert.match(html, /href="\/"/, `${record.outputFile} lacks the reciprocal home-inspection link`);
  assert.match(html, /Separate service · 12-month rule/, `${record.outputFile} lacks cross-service separation context`);
  assert.match(html, /data-pagefind-body="true"/, `${record.outputFile} lacks the contractor search body boundary`);
}
for (const route of [...disabledInspectorRoutes, ...disabledContractorRoutes]) {
  assert.equal(rootSitemap.includes(`${expectedOrigin}${route.path}`) || contractorSitemap.includes(`${expectedOrigin}/contracting${route.path}`), false, `Disabled route ${route.path} leaked into a sitemap`);
  assert.equal(new RegExp(`href="[^"]*${escapeRegex(route.path)}"`).test(publicRouteMarkup), false, `Disabled route ${route.path} leaked into public navigation`);
}
await assert.rejects(stat(resolve(output, "sample-report/index.html")), "Disabled sample report route was emitted");

for (const [file, route] of [["404.html", inspectorNotFoundRoute], ["contracting/404.html", contractorNotFoundRoute]]) {
  const html = await read(resolve(output, file));
  assert.match(html, /<meta name="robots" content="noindex,follow"/, `${file} must be noindex,follow`);
  assert.equal(titleContent(html), escapeHtmlText(route.title), `${file} has the wrong title`);
  assert.match(html, /<h1(?:\s|>)/, `${file} lacks the intended not-found experience`);
}

const legacyInspectorRoutes = ["", "services", "about", "areas", "faq", "resources", "contact"];
for (const route of legacyInspectorRoutes) {
  const html = await read(resolve(output, "inspections", route, "index.html"));
  assert.match(html, /Inspection page moved/, `Legacy /inspections/${route} redirect is missing`);
  assert.match(html, /location\.replace/, `Legacy /inspections/${route} redirect is not functional`);
  assert.match(html, /noindex,follow/, `Legacy /inspections/${route} redirect must remain noindex,follow`);
}

const assembledInspector = await read(resolve(output, "index.html"));
const assembledInspectorServices = await read(resolve(output, "services/index.html"));
const assembledInspectorContact = await read(resolve(output, "contact/index.html"));
const assembledContractor = await read(resolve(output, "contracting/index.html"));
const assembledEstimate = await read(resolve(output, "contracting/estimate/index.html"));
const assembledPortal = await read(resolve(output, "property-services/index.html"));
for (const [label, html] of [["inspector", assembledInspector], ["contractor", assembledContractor], ["chooser", assembledPortal]]) assert.ok(html.includes(separationPolicy.notice.replaceAll("&", "&amp;")), `${label} lacks the canonical separation notice`);
assert.ok(assembledEstimate.includes("previous 12 months"), "Contractor estimate path lacks the 12-month eligibility boundary");
assert.match(assembledEstimate, /Eligibility comes first/, "Contractor estimate does not prerender the eligibility-first entry step");
assert.equal(/Full name/.test(assembledEstimate), false, "Contractor estimate prerender collects contact details before eligibility");
assert.match(assembledEstimate, /Nothing is uploaded or sent while you use this guide/, "Contractor estimate lacks first-step transport truth");
assert.match(assembledInspector, /Know what you’re/, "Inspector is not mounted at the site root");
assert.match(assembledContractor, /Practical repairs\. <em>Built to last\.<\/em>/, "Contractor is not mounted at /contracting/");
assert.match(assembledPortal, /Which service are/, "Property-services chooser is missing its single decision question");

const inspectorRequestActionIndex = assembledInspectorContact.indexOf('href="#inspection-request"');
const inspectorRequestTargetIndex = assembledInspectorContact.indexOf('id="inspection-request"');
assert.ok(inspectorRequestActionIndex >= 0 && inspectorRequestActionIndex < inspectorRequestTargetIndex, "Inspector Contact does not present Start request before the form target");
assert.equal([...assembledInspectorContact.matchAll(/id="inspection-request"/g)].length, 1, "Inspector Contact must render exactly one request target");
assert.match(assembledInspectorContact, /<form[^>]*aria-labelledby="inspection-request"/, "Inspector Contact form is not labeled by its visible request heading");
for (const legend of ["Contact", "Property", "Timing and context"]) assert.match(assembledInspectorContact, new RegExp(`<legend>${escapeRegex(legend)}<\\/legend>`), `Inspector Contact lacks the ${legend} form group`);
assert.equal(/<form[^>]*\saction=/i.test(assembledInspectorContact), false, "Inspector Contact unexpectedly posts to a server action");
assert.match(inspectorSource, /Nothing has been sent yet/, "Inspector Contact lacks truthful mailto preparation copy");
assert.match(inspectorSource, /errorSummaryRef\.current\?\.focus\(\)/, "Inspector Contact error summary no longer receives focus");
assert.match(inspectorSource, /href=\{`#inspection-\$\{field\}`\}/, "Inspector Contact error summary no longer links to invalid fields");
assert.match(inspectorSource, /onChange=\{handleChange\}/, "Inspector Contact does not clear stale prepared state after edits");
assert.match(inspectorSource, /name === "phone" && preferredContact === "phone"/, "Inspector Contact does not expose phone as conditionally required");

assert.match(assembledInspectorServices, /data-scope-atlas="true"/, "Inspector Services lacks the visual scope atlas");
assert.match(assembledInspectorServices, /Representative editorial imagery; not C&amp;G client or project photography\./, "Inspector Services lacks the editorial-image disclosure");
assert.equal(enabledInspectionScope.length, 19, "Inspector scope registry does not contain the expected enabled sections");
for (const section of enabledInspectionScope) {
  assert.ok(assembledInspectorServices.includes(escapeHtmlText(section.title)), `Inspector Services did not render ${section.title}`);
  assert.match(assembledInspectorServices, new RegExp(`id="${escapeRegex(section.id)}"`), `Inspector Services lacks the ${section.id} detail target`);
  assert.match(assembledInspectorServices, new RegExp(`href="#${escapeRegex(section.id)}"`), `Inspector Services atlas lacks a link to ${section.id}`);
}
assert.equal(/Optional pool and spa service/i.test(assembledInspectorServices), false, "Pending pool/spa service leaked into Inspector Services");

for (const image of ["attic-inspection.jpg", "report-laptop.jpg"]) {
  const provenance = imageProvenance.find((record) => basename(record.file) === image);
  assert.ok(provenance?.approvedFor.includes("inspector-services"), `${image} is not approved for inspector-services`);
}

const approvedInspectorAreas = approvedServiceAreas("Inspector").map((area) => area.label);
const approvedContractorAreas = approvedServiceAreas("Contractor").map((area) => area.label);
assert.deepEqual(approvedInspectorAreas, [], "Unexpected inspector service area became approved");
assert.deepEqual(approvedContractorAreas, [], "Unexpected contractor service area became approved");
for (const area of serviceAreas.filter((item) => item.status !== "approved")) {
  assert.equal(new RegExp(`\\b${escapeRegex(area.label)}\\b`, "i").test(publicRouteMarkup), false, `Unapproved service area rendered publicly: ${area.label}`);
}
assert.equal(/\bLos Angeles area\b/i.test(publicRouteMarkup), false, "Unapproved Los Angeles-area wording rendered publicly");

const placeholderPatterns = [/\bTODO\b/, /\bTBD\b/, /lorem ipsum/i, /\[city\]/i, /\[insert[^\]]*\]/i, /555[-.) ]?\d{3}[- ]?\d{4}/];
for (const pattern of placeholderPatterns) assert.equal(pattern.test(publicRouteMarkup), false, `Public output contains placeholder content: ${pattern}`);
assert.equal(/(?:form|request|message) (?:was|has been) sent/i.test(publicRouteMarkup), false, "Public mailto flow falsely claims server receipt");
assert.equal(/(?:same-day|next-day) reports? (?:are )?(?:available|guaranteed)|free (?:estimate|site visit)s? (?:are )?(?:available|included)|emergency service (?:is )?available/i.test(publicRouteMarkup), false, "Public output contains an unsupported schedule, price, or emergency promise");
assert.ok(contractorSource.includes("Nothing has been sent or received"), "Mailto transport truth is missing from the eligible state");
assert.ok(assembledEstimate.includes("Nothing is uploaded or sent"), "Estimate submit control lacks transport truth");
assert.equal(/class="[^"]*testimonial|itemprop="review"|reviewRating|"@type":"Review"/i.test(publicRouteMarkup), false, "Unapproved testimonial content rendered publicly");
assert.equal(/calendly|formspree|typeform|jotform|google\.com\/maps\/embed|review-widget|googletagmanager|google-analytics|plausible\.io|cdn\.usefathom/i.test(publicRouteMarkup), false, "A pending booking, form, map, review, or analytics provider leaked into public output");

for (const [surface, expectedCount] of [["inspector", enabledInspectorRoutes.length], ["contractor", enabledContractorRoutes.length]]) {
  const directory = resolve(output, "pagefind", surface);
  await stat(resolve(directory, "pagefind.js"));
  await stat(resolve(directory, "pagefind-entry.json"));
  const fragments = (await readdir(resolve(directory, "fragment"))).filter((file) => file.endsWith(".pf_fragment"));
  assert.equal(fragments.length, expectedCount, `Pagefind ${surface} index does not exactly match enabled routes`);
}
assert.equal(integrations.siteSearch.publicConfig.inspectorBundle, "/pagefind/inspector/pagefind.js", "Inspector Pagefind bundle path drifted");
assert.equal(integrations.siteSearch.publicConfig.contractorBundle, "/pagefind/contractor/pagefind.js", "Contractor Pagefind bundle path drifted");

assert.ok(contractorServices.length >= 7, "Contractor service registry is incomplete");
for (const service of contractorServices) {
  assert.ok(service.examples.length >= 4, `${service.title} lacks detailed examples`);
  assert.ok(service.boundaries.length >= 3, `${service.title} lacks detailed boundaries`);
  assert.ok(publicRouteMarkup.includes(service.title), `${service.title} did not render`);
  assert.match(publicRouteMarkup, new RegExp(`\\?category=${escapeRegex(service.id)}`), `${service.title} lacks a category-aware estimate link`);
}
assert.ok(inspectorFaqItems.length >= 20, "Inspector FAQ registry is incomplete");
assert.ok(contractorFaqs.length >= 15, "Contractor FAQ registry is incomplete");

const provenanceByBasename = new Map(imageProvenance.map((record) => [basename(record.file), record]));
for (const record of imageProvenance) {
  assert.equal(record.status, "approved", `Pending image ${record.id} is registered for production`);
  assert.ok(record.source && record.licenseOrPermission && record.approvedAt, `Image ${record.id} lacks complete provenance fields`);
  assert.equal(record.depictsActualClientWork, false, `Editorial image ${record.id} must not claim client work`);
  const { size } = await stat(resolve(root, record.file));
  assert.ok(size < 450_000, `${record.file} exceeds the 450 KB editorial image budget`);
}

for (const record of routeRecords) {
  const html = await read(resolve(output, record.outputFile));
  for (const match of html.matchAll(/<img\s+([^>]+)>/g)) {
    const attributes = match[1];
    const source = attributes.match(/src="([^"]+)"/)?.[1] || "";
    const alt = attributes.match(/alt="([^"]*)"/)?.[1];
    assert.notEqual(alt, undefined, `${record.outputFile} image ${source} lacks alt text`);
    assert.match(attributes, /width="\d+"/, `${record.outputFile} image ${source} lacks width`);
    assert.match(attributes, /height="\d+"/, `${record.outputFile} image ${source} lacks height`);
    if (source.endsWith(".jpg")) {
      const provenance = provenanceByBasename.get(basename(source));
      assert.ok(provenance, `${record.outputFile} image ${source} lacks a provenance record`);
      assert.equal(provenance.status, "approved", `${record.outputFile} image ${source} is not approved`);
      assert.ok(alt, `${record.outputFile} informative image ${source} has empty alt text`);
    }
  }
}
assert.match(await read(resolve(output, "contracting/projects/index.html")), /not photographs of completed C&amp;G client projects/i, "Illustrative project page lacks the required disclosure");

const inspectorPrivacy = await read(resolve(output, "privacy/index.html"));
const contractorPrivacy = await read(resolve(output, "contracting/privacy/index.html"));
assert.match(inspectorPrivacy, /No analytics provider/i, "Inspector privacy does not match the disabled analytics state");
assert.match(contractorPrivacy, /No analytics provider/i, "Contractor privacy does not match the disabled analytics state");
assert.match(inspectorPrivacy, /GitHub Pages/i, "Inspector privacy lacks the actual static host");
assert.match(contractorPrivacy, /GitHub Pages/i, "Contractor privacy lacks the actual static host");

assert.match(await read(resolve(output, "robots.txt")), new RegExp(`Sitemap: ${escapeRegex(expectedOrigin)}/sitemap\\.xml`), "Root robots.txt has the wrong sitemap");
assert.match(await read(resolve(output, "contracting/robots.txt")), new RegExp(`Sitemap: ${escapeRegex(expectedOrigin)}/contracting/sitemap\\.xml`), "Contractor robots.txt has the wrong sitemap");

console.log(`PASS: verified ${routeRecords.length} enabled routes, ${enabledInspectorRoutes.length} inspector entries, ${enabledContractorRoutes.length} contractor entries, ${imageProvenance.length} image records, eligibility guards, structured data, sitemaps, forms, privacy truth, and legacy redirects.`);
