import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const dist = resolve("dist");
const siteOrigin = (process.env.VITE_SITE_ORIGIN || "https://sadmanbob.github.io").replace(/\/+$/, "");
const routes = {
  services: {
    title: "Inspection Services | C&G Certified Home Inspector",
    description: "Explore C&G inspection services, typical inspection areas, photo-rich reports, and practical recommendations.",
  },
  about: {
    title: "About C&G | Certified Home Inspector",
    description: "Meet C&G Certified Home Inspector and learn about the construction-informed approach behind every inspection.",
  },
  areas: {
    title: "Areas We Serve | C&G Certified Home Inspector",
    description: "C&G Certified Home Inspector serves Los Angeles County, the San Gabriel Valley, the South Bay, and surrounding communities.",
  },
  faq: {
    title: "FAQ | C&G Certified Home Inspector",
    description: "Straightforward answers about C&G home inspections, reports, scheduling, and what to expect.",
  },
  resources: {
    title: "Home Inspection Resources | C&G Certified Home Inspector",
    description: "Practical home inspection guidance for preparing, reviewing a report, and planning next steps.",
  },
  contact: {
    title: "Contact C&G | Schedule a Home Inspection",
    description: "Schedule a C&G home inspection or contact the team about a property in Los Angeles County and surrounding communities.",
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
  const url = `${siteOrigin}/${route}/`;
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
  "hero-inspector.png",
  "report-laptop.png",
  "attic-inspection.png",
  "contracting-review.png",
  "cg-logo.png",
].map((file) => rm(resolve(dist, "assets", file), { force: true })));
