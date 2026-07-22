import { copyFile, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const dist = resolve("dist");
const routes = ["services", "process", "about", "estimate"];

await Promise.all(routes.map(async (route) => {
  const directory = resolve(dist, route);
  await mkdir(directory, { recursive: true });
  await copyFile(resolve(dist, "index.html"), resolve(directory, "index.html"));
}));

await copyFile(resolve(dist, "index.html"), resolve(dist, "404.html"));

await Promise.all([
  "contractor-hero.png",
  "finish-work.png",
  "project-planning.png",
].map((file) => rm(resolve(dist, "assets", file), { force: true })));
