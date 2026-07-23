import { createReadStream } from "node:fs";
import { access, readFile, readdir, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, posix, resolve, sep } from "node:path";
import { parse } from "parse5";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "_site");
const mode = process.argv[2] || "static";

const budgets = {
  total: 24 * 1024 * 1024,
  file: 512 * 1024,
  html: 160 * 1024,
  css: 96 * 1024,
  js: 384 * 1024,
  image: 512 * 1024,
  pdf: 8 * 1024 * 1024,
};

const contentTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".wasm", "application/wasm"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

const walk = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => entry.isDirectory() ? walk(resolve(directory, entry.name)) : [resolve(directory, entry.name)]));
  return nested.flat();
};

const relativeOutputPath = (file) => file.slice(output.length + 1).split(sep).join("/");
const pagePath = (relative) => relative === "index.html"
  ? "/"
  : relative.endsWith("/index.html")
    ? `/${relative.slice(0, -"index.html".length)}`
    : `/${relative}`;
const normalizeText = (value) => value.replace(/\s+/g, " ").trim();
const attr = (node, name) => node?.attrs?.find((item) => item.name === name)?.value;

const descendants = (node, predicate, found = []) => {
  if (predicate(node)) found.push(node);
  for (const child of node.childNodes || []) descendants(child, predicate, found);
  if (node.content) descendants(node.content, predicate, found);
  return found;
};

const elements = (document, tagName) => descendants(document, (node) => node.tagName === tagName);
const firstElement = (document, tagName) => elements(document, tagName)[0];
const textContent = (node) => (node.childNodes || [])
  .map((child) => child.nodeName === "#text" ? child.value : textContent(child))
  .join("");
const visibleText = (node) => {
  if (attr(node, "aria-hidden") === "true") return "";
  if (node.nodeName === "#text") return node.value;
  if (node.tagName === "img") return attr(node, "alt") || "";
  return (node.childNodes || []).map(visibleText).join(" ");
};
const meta = (document, key, value) => elements(document, "meta")
  .find((node) => attr(node, key)?.toLowerCase() === value.toLowerCase());
const canonical = (document) => elements(document, "link")
  .find((node) => (attr(node, "rel") || "").split(/\s+/).includes("canonical"));
const hasAncestor = (node, tagName) => {
  let current = node.parentNode;
  while (current) {
    if (current.tagName === tagName) return true;
    current = current.parentNode;
  }
  return false;
};
const valuesMatch = (left, right) => left.length === right.length && left.every((value, index) => value === right[index]);
const xmlLocations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

const outputCandidate = (pathname, outputFiles) => {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.replace(/^\/+/, "");
  const candidates = decoded.endsWith("/")
    ? [`${relative}index.html`]
    : [relative, `${relative}/index.html`, `${relative}.html`];
  return candidates.find((candidate) => outputFiles.has(candidate));
};

const staticChecks = async () => {
  await access(resolve(output, "index.html"));
  const files = await walk(output);
  const outputFiles = new Map();
  let totalBytes = 0;
  for (const file of files) {
    const relative = relativeOutputPath(file);
    const fileStat = await stat(file);
    outputFiles.set(relative, { file, bytes: fileStat.size });
    totalBytes += fileStat.size;
  }

  const failures = [];
  const check = (condition, message) => {
    if (!condition) failures.push(message);
  };

  check(totalBytes <= budgets.total, `Assembled output is ${(totalBytes / 1024 / 1024).toFixed(2)} MiB; budget is ${budgets.total / 1024 / 1024} MiB`);
  for (const [relative, record] of outputFiles) {
    const extension = extname(relative).toLowerCase();
    let limit = budgets.file;
    if (extension === ".html") limit = budgets.html;
    else if (extension === ".css") limit = budgets.css;
    else if (extension === ".js") limit = budgets.js;
    else if ([".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"].includes(extension)) limit = budgets.image;
    else if (extension === ".pdf") limit = budgets.pdf;
    check(record.bytes <= limit, `${relative} is ${(record.bytes / 1024).toFixed(1)} KiB; ${extension || "file"} budget is ${limit / 1024} KiB`);
  }

  const htmlRecords = [];
  for (const [relative, record] of outputFiles) {
    if (!relative.endsWith(".html")) continue;
    const source = await readFile(record.file, "utf8");
    const document = parse(source);
    const robots = attr(meta(document, "name", "robots"), "content")?.toLowerCase() || "";
    const expectedNoindex = relative.endsWith("404.html") || relative.startsWith("inspections/");
    const isCrawlable = !robots.split(/\s*,\s*/).includes("noindex");
    const ids = new Map();
    for (const node of descendants(document, (item) => Boolean(attr(item, "id")))) {
      const id = attr(node, "id");
      ids.set(id, (ids.get(id) || 0) + 1);
    }
    for (const [id, count] of ids) check(count === 1, `${relative} contains duplicate id="${id}"`);

    const doctype = descendants(document, (node) => node.nodeName === "#documentType")[0];
    const html = firstElement(document, "html");
    const title = normalizeText(textContent(firstElement(document, "title") || { childNodes: [] }));
    const description = attr(meta(document, "name", "description"), "content") || "";
    const canonicalUrl = attr(canonical(document), "href") || "";
    const h1s = elements(document, "h1");
    const mains = elements(document, "main");

    check(Boolean(doctype), `${relative} is missing a doctype`);
    check(Boolean(attr(html, "lang")), `${relative} is missing html[lang]`);
    check(Boolean(meta(document, "name", "viewport")), `${relative} is missing the viewport meta tag`);
    check(Boolean(elements(document, "meta").find((node) => attr(node, "charset"))), `${relative} is missing a charset declaration`);
    check(Boolean(title), `${relative} has an empty title`);
    check(expectedNoindex === !isCrawlable, `${relative} has an unexpected robots indexing state`);

    if (isCrawlable) {
      check(description.length >= 40 && description.length <= 220, `${relative} meta description must be 40–220 characters`);
      check(Boolean(canonicalUrl), `${relative} is missing a canonical URL`);
      check(h1s.length === 1, `${relative} must contain exactly one h1`);
      check(mains.length === 1, `${relative} must contain exactly one main landmark`);
      check(Boolean(meta(document, "property", "og:title")), `${relative} is missing og:title`);
      check(Boolean(meta(document, "property", "og:description")), `${relative} is missing og:description`);
      check(Boolean(meta(document, "property", "og:image")), `${relative} is missing og:image`);
      check(Boolean(meta(document, "name", "twitter:card")), `${relative} is missing twitter:card`);
      check(Boolean(meta(document, "name", "twitter:title")), `${relative} is missing twitter:title`);
      check(Boolean(meta(document, "name", "twitter:description")), `${relative} is missing twitter:description`);
      check(Boolean(meta(document, "name", "twitter:image")), `${relative} is missing twitter:image`);

      const skipLink = elements(document, "a").find((node) => normalizeText(visibleText(node)).toLowerCase().startsWith("skip "));
      const skipTarget = attr(skipLink, "href")?.slice(1);
      check(Boolean(skipTarget && ids.has(skipTarget)), `${relative} needs a working skip link`);

      const schemas = elements(document, "script").filter((node) => attr(node, "type") === "application/ld+json");
      check(schemas.length > 0, `${relative} is missing JSON-LD`);
      for (const schema of schemas) {
        try {
          JSON.parse(textContent(schema));
        } catch {
          check(false, `${relative} contains invalid JSON-LD`);
        }
      }
    }

    for (const image of elements(document, "img")) {
      check(attr(image, "alt") !== undefined, `${relative} contains an image without alt text`);
      check(Boolean(attr(image, "width") && attr(image, "height")), `${relative} contains an image without intrinsic width and height`);
    }
    for (const button of elements(document, "button")) {
      check(Boolean(attr(button, "type")), `${relative} contains a button without an explicit type`);
      check(Boolean(normalizeText(attr(button, "aria-label") || visibleText(button))), `${relative} contains an unnamed button`);
    }
    for (const link of elements(document, "a")) {
      check(Boolean(normalizeText(attr(link, "aria-label") || visibleText(link))), `${relative} contains an unnamed link`);
      if (attr(link, "target") === "_blank") {
        const rel = (attr(link, "rel") || "").split(/\s+/);
        check(rel.includes("noopener") || rel.includes("noreferrer"), `${relative} contains target="_blank" without noopener or noreferrer`);
      }
    }
    for (const node of descendants(document, (item) => Boolean(attr(item, "tabindex")))) {
      check(Number(attr(node, "tabindex")) <= 0, `${relative} contains a positive tabindex`);
    }
    for (const attributeName of ["aria-controls", "aria-describedby", "aria-labelledby"]) {
      for (const node of descendants(document, (item) => Boolean(attr(item, attributeName)))) {
        for (const id of attr(node, attributeName).split(/\s+/).filter(Boolean)) {
          check(ids.has(id), `${relative} contains ${attributeName} referencing missing id="${id}"`);
        }
      }
    }

    const labels = elements(document, "label");
    const labelTargets = new Set(labels.map((label) => attr(label, "for")).filter(Boolean));
    for (const control of descendants(document, (node) => ["input", "select", "textarea"].includes(node.tagName))) {
      const type = (attr(control, "type") || "").toLowerCase();
      if (["button", "hidden", "reset", "submit"].includes(type)) continue;
      const id = attr(control, "id");
      const named = Boolean(
        attr(control, "aria-label")
        || attr(control, "aria-labelledby")
        || (id && labelTargets.has(id))
        || hasAncestor(control, "label")
      );
      check(named, `${relative} contains an unlabeled ${control.tagName}${id ? `#${id}` : ""}`);
    }

    htmlRecords.push({
      canonicalUrl,
      document,
      ids,
      isCrawlable,
      publicPath: pagePath(relative),
      relative,
      source,
      title,
      description,
    });
  }

  const crawlable = htmlRecords.filter((record) => record.isCrawlable);
  const titleOwners = new Map();
  const descriptionOwners = new Map();
  for (const record of crawlable) {
    check(!titleOwners.has(record.title), `${record.relative} duplicates the title from ${titleOwners.get(record.title)}`);
    check(!descriptionOwners.has(record.description), `${record.relative} duplicates the description from ${descriptionOwners.get(record.description)}`);
    titleOwners.set(record.title, record.relative);
    descriptionOwners.set(record.description, record.relative);
  }

  const rootSitemapSource = await readFile(resolve(output, "sitemap.xml"), "utf8");
  const contractorSitemapSource = await readFile(resolve(output, "contracting/sitemap.xml"), "utf8");
  const rootLocations = xmlLocations(rootSitemapSource);
  const contractorLocations = xmlLocations(contractorSitemapSource);
  check(rootLocations.length > 0, "Root sitemap has no URLs");
  check(contractorLocations.length > 0, "Contractor sitemap has no URLs");
  const siteOrigin = new URL(rootLocations[0]).origin;
  const expectedRootLocations = crawlable
    .filter((record) => !record.publicPath.startsWith("/contracting/"))
    .map((record) => record.canonicalUrl)
    .sort();
  const expectedContractorLocations = crawlable
    .filter((record) => record.publicPath.startsWith("/contracting/"))
    .map((record) => record.canonicalUrl)
    .sort();
  check(valuesMatch([...new Set(rootLocations)].sort(), expectedRootLocations), "Root sitemap does not exactly match crawlable non-contractor canonical pages");
  check(valuesMatch([...new Set(contractorLocations)].sort(), expectedContractorLocations), "Contractor sitemap does not exactly match crawlable contractor canonical pages");
  check(new Set(rootLocations).size === rootLocations.length, "Root sitemap contains duplicate URLs");
  check(new Set(contractorLocations).size === contractorLocations.length, "Contractor sitemap contains duplicate URLs");

  const canonicalByUrl = new Map(crawlable.map((record) => [record.canonicalUrl, record]));
  for (const location of [...rootLocations, ...contractorLocations]) {
    let parsed;
    try {
      parsed = new URL(location);
    } catch {
      check(false, `Sitemap contains an invalid URL: ${location}`);
      continue;
    }
    check(parsed.origin === siteOrigin, `Sitemap URL uses the wrong origin: ${location}`);
    check(Boolean(canonicalByUrl.get(location)), `Sitemap URL has no matching crawlable canonical page: ${location}`);
  }

  const rootRobots = await readFile(resolve(output, "robots.txt"), "utf8");
  const contractorRobots = await readFile(resolve(output, "contracting/robots.txt"), "utf8");
  check(/User-agent:\s*\*/i.test(rootRobots) && /Allow:\s*\/\s*$/im.test(rootRobots), "Root robots.txt does not allow crawling");
  check(rootRobots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`), "Root robots.txt points to the wrong sitemap");
  check(/User-agent:\s*\*/i.test(contractorRobots) && /Allow:\s*\/contracting\/\s*$/im.test(contractorRobots), "Contractor robots.txt does not allow its route prefix");
  check(contractorRobots.includes(`Sitemap: ${siteOrigin}/contracting/sitemap.xml`), "Contractor robots.txt points to the wrong sitemap");
  check(!/Disallow:\s*\/\s*$/im.test(`${rootRobots}\n${contractorRobots}`), "A robots file blocks the entire site");

  const htmlByRelative = new Map(htmlRecords.map((record) => [record.relative, record]));
  const validateReference = (reference, sourceRelative, sourcePublicPath, label) => {
    if (!reference || /^(?:data|javascript|mailto|tel):/i.test(reference)) return;
    let resolvedUrl;
    try {
      resolvedUrl = new URL(reference, new URL(sourcePublicPath, `${siteOrigin}/`));
    } catch {
      check(false, `${sourceRelative} contains an invalid ${label}: ${reference}`);
      return;
    }
    if (!["http:", "https:"].includes(resolvedUrl.protocol) || resolvedUrl.origin !== siteOrigin) return;
    const candidate = outputCandidate(resolvedUrl.pathname, outputFiles);
    check(Boolean(candidate), `${sourceRelative} links to missing internal ${label}: ${reference}`);
    if (!candidate || !resolvedUrl.hash || !candidate.endsWith(".html")) return;
    const target = htmlByRelative.get(candidate);
    const fragment = decodeURIComponent(resolvedUrl.hash.slice(1));
    check(Boolean(target?.ids.has(fragment)), `${sourceRelative} links to missing fragment #${fragment} in ${candidate}`);
  };

  for (const record of htmlRecords) {
    for (const node of descendants(record.document, (item) => Boolean(item.tagName))) {
      for (const [attributeName, label] of [["href", "href"], ["src", "asset"]]) {
        const reference = attr(node, attributeName);
        if (reference) validateReference(reference, record.relative, record.publicPath, label);
      }
      const srcset = attr(node, "srcset");
      if (srcset) {
        for (const candidate of srcset.split(",").map((item) => item.trim().split(/\s+/)[0])) {
          validateReference(candidate, record.relative, record.publicPath, "srcset asset");
        }
      }
    }
  }
  for (const [relative, record] of outputFiles) {
    if (!relative.endsWith(".css")) continue;
    const source = await readFile(record.file, "utf8");
    for (const match of source.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/g)) {
      validateReference(match[2], relative, `/${relative}`, "CSS asset");
    }
  }

  if (failures.length) {
    console.error(`Quality gates failed with ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log("Static quality gates passed.");
  console.log(`- ${htmlRecords.length} HTML documents checked`);
  console.log(`- ${crawlable.length} crawlable canonical pages reconciled with sitemaps`);
  console.log(`- ${outputFiles.size} output files and internal references checked`);
  console.log(`- ${(totalBytes / 1024 / 1024).toFixed(2)} MiB assembled output (${budgets.total / 1024 / 1024} MiB budget)`);
};

const fileForRequest = async (pathname) => {
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.replace(/^\/+/, "");
  const candidates = decoded.endsWith("/") ? [`${relative}index.html`] : [relative, `${relative}/index.html`];
  for (const candidate of candidates) {
    const file = resolve(output, candidate);
    if (file !== output && !file.startsWith(`${output}${sep}`)) continue;
    try {
      const fileStat = await stat(file);
      if (fileStat.isFile()) return { file, fileStat };
    } catch {
      // Try the next static-file candidate.
    }
  }
  return null;
};

const startStaticServer = async () => {
  const server = createServer(async (request, response) => {
    try {
      const requested = await fileForRequest(new URL(request.url, "http://quality.local").pathname);
      if (!requested) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-length": requested.fileStat.size,
        "content-type": contentTypes.get(extname(requested.file).toLowerCase()) || "application/octet-stream",
      });
      if (request.method === "HEAD") response.end();
      else createReadStream(requested.file).pipe(response);
    } catch (error) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      response.end(error instanceof Error ? error.message : "Server error");
    }
  });
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  return server;
};

const browserA11yChecks = async () => {
  await access(resolve(output, "index.html"));
  const [{ chromium }, { default: AxeBuilder }] = await Promise.all([
    import("playwright"),
    import("@axe-core/playwright"),
  ]);
  const routes = [...new Set([
    ...xmlLocations(await readFile(resolve(output, "sitemap.xml"), "utf8")),
    ...xmlLocations(await readFile(resolve(output, "contracting/sitemap.xml"), "utf8")),
  ].map((location) => new URL(location).pathname))].sort();
  const server = await startStaticServer();
  const address = server.address();
  const localOrigin = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  let warnings = 0;
  try {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.route("**/*", async (route) => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.origin === localOrigin) await route.continue();
      else await route.abort();
    });
    for (const route of routes) {
      const response = await page.goto(`${localOrigin}${route}`, { waitUntil: "domcontentloaded" });
      if (!response || !response.ok()) {
        failures.push(`${route}: returned ${response?.status() || "no response"}`);
        continue;
      }
      await page.locator("h1").first().waitFor({ state: "visible" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      const blocking = results.violations.filter((violation) => violation.impact === "critical"
        || (violation.impact === "serious" && violation.id !== "color-contrast"));
      warnings += results.violations.length - blocking.length;
      for (const violation of blocking) {
        const targets = violation.nodes.flatMap((node) => node.target).slice(0, 4).join(", ");
        failures.push(`${route}: ${violation.id} (${violation.impact}) at ${targets}`);
      }
    }
    await context.close();
  } finally {
    await browser.close();
    await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
  }
  if (failures.length) {
    console.error(`Browser accessibility audit failed with ${failures.length} blocking issue${failures.length === 1 ? "" : "s"}:`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Browser accessibility audit passed across ${routes.length} sitemap routes.`);
  if (warnings) console.log(`- ${warnings} non-blocking contrast/moderate/minor axe finding${warnings === 1 ? "" : "s"} reported for follow-up`);
};

if (mode === "static") await staticChecks();
else if (mode === "browser-a11y") await browserA11yChecks();
else throw new Error(`Unknown quality-gates mode: ${mode}`);
