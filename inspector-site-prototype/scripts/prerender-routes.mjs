import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { enabledInspectorRoutes, inspectorNotFoundRoute } from "../src/content/routes.js";
import { buildInspectorSchema } from "../src/content/seo.js";

const dist = resolve("dist");
const ssrBundle = resolve("dist-ssr/prerender.js");
const siteOrigin = (process.env.VITE_SITE_ORIGIN || "https://sadmanbob.github.io").replace(/\/+$/, "");
const { render } = await import(`${pathToFileURL(ssrBundle).href}?build=${Date.now()}`);

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const setMeta = (html, attribute, key, content) => {
  const matcher = new RegExp(`<meta ${attribute}="${key}" content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  return matcher.test(html) ? html.replace(matcher, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
};

const setHead = (shell, route, path, body, { noindex = false } = {}) => {
  const url = `${siteOrigin}${path}`;
  const imageUrl = `${siteOrigin}/assets/hero-inspector.jpg`;
  let html = shell.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(route.title)}</title>`);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`);
  html = setMeta(html, "name", "description", route.description);
  html = setMeta(html, "property", "og:title", route.title);
  html = setMeta(html, "property", "og:description", route.description);
  html = setMeta(html, "property", "og:type", route.article ? "article" : "website");
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "property", "og:image", imageUrl);
  html = setMeta(html, "name", "twitter:card", "summary_large_image");
  html = setMeta(html, "name", "twitter:title", route.title);
  html = setMeta(html, "name", "twitter:description", route.description);
  html = setMeta(html, "name", "twitter:image", imageUrl);
  if (noindex) html = setMeta(html, "name", "robots", "noindex,follow");
  const schema = JSON.stringify(buildInspectorSchema({ ...route, path }, siteOrigin)).replaceAll("<", "\\u003c");
  html = html.replace("</head>", `    <script id="cg-page-schema" type="application/ld+json">${schema}</script>\n  </head>`);
  return html.replace('<div id="root"></div>', `<div id="root">${body}</div>`);
};

const shell = await readFile(resolve(dist, "index.html"), "utf8");

for (const route of enabledInspectorRoutes) {
  const body = render(route.path);
  const noindex = Boolean(route.noindex || route.sampleReport?.provisional);
  const html = setHead(shell, route, route.path, body, { noindex });
  if (route.path === "/") await writeFile(resolve(dist, "index.html"), html);
  else {
    const directory = resolve(dist, route.path.replace(/^\/+|\/+$/g, ""));
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, "index.html"), html);
  }
}

const notFoundBody = render("/__not-found__/");
await writeFile(resolve(dist, "404.html"), setHead(shell, inspectorNotFoundRoute, "/404.html", notFoundBody, { noindex: true }));

await Promise.all([
  "hero-inspector.png",
  "report-laptop.png",
  "attic-inspection.png",
  "contracting-review.png",
  "cg-logo.png",
].map((file) => rm(resolve(dist, "assets", file), { force: true })));
await rm(resolve("dist-ssr"), { recursive: true, force: true });
