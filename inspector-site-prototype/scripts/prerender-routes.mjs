import { copyFile, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const dist = resolve("dist");
const routes = ["services", "about", "areas", "faq", "resources", "contact"];

await Promise.all(routes.map(async (route) => {
  const directory = resolve(dist, route);
  await mkdir(directory, { recursive: true });
  await copyFile(resolve(dist, "index.html"), resolve(directory, "index.html"));
}));

await copyFile(resolve(dist, "index.html"), resolve(dist, "404.html"));

await Promise.all([
  "hero-inspector.png",
  "report-laptop.png",
  "attic-inspection.png",
  "contracting-review.png",
  "cg-logo.png",
].map((file) => rm(resolve(dist, "assets", file), { force: true })));
