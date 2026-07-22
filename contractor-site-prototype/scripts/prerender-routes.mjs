import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const dist = resolve("dist");
const siteOrigin = (process.env.VITE_SITE_ORIGIN || "https://sadmanbob.github.io").replace(/\/+$/, "");
const routes = {
  services: {
    title: "Residential Repair Services | C&G Contracting Services",
    description: "Explore residential repair, finish work, doors, trim, punch-list coordination, and property maintenance services from C&G.",
  },
  process: {
    title: "Our Process | C&G Contracting Services",
    description: "See how C&G moves from an initial project request to a clear scope, written estimate, scheduling, and final walkthrough.",
  },
  about: {
    title: "About C&G Contracting Services",
    description: "Learn about C&G’s practical, construction-informed approach and verify California contractor license information.",
  },
  estimate: {
    title: "Request an Estimate | C&G Contracting Services",
    description: "Share your residential repair or improvement project with C&G Contracting Services.",
  },
};

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll('"', "&quot;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;");

const setMeta = (html, attribute, key, content) => {
  const matcher = new RegExp(`<meta ${attribute}="${key}" content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}" />`;
  return matcher.test(html)
    ? html.replace(matcher, tag)
    : html.replace("</head>", `    ${tag}\n  </head>`);
};

const renderRoute = (indexHtml, route, metadata) => {
  const url = `${siteOrigin}/contracting/${route}/`;
  let html = indexHtml.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`);
  html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`);
  html = setMeta(html, "name", "description", metadata.description);
  html = setMeta(html, "property", "og:title", metadata.title);
  html = setMeta(html, "property", "og:description", metadata.description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "name", "twitter:title", metadata.title);
  html = setMeta(html, "name", "twitter:description", metadata.description);
  return html;
};

const indexHtml = await readFile(resolve(dist, "index.html"), "utf8");

await Promise.all(Object.entries(routes).map(async ([route, metadata]) => {
  const directory = resolve(dist, route);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, "index.html"), renderRoute(indexHtml, route, metadata));
}));

await copyFile(resolve(dist, "index.html"), resolve(dist, "404.html"));

await Promise.all([
  "contractor-hero.png",
  "finish-work.png",
  "project-planning.png",
].map((file) => rm(resolve(dist, "assets", file), { force: true })));
