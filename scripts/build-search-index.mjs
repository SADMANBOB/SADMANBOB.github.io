import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import * as pagefind from "pagefind";
import { enabledInspectorRoutes } from "../inspector-site-prototype/src/content/routes.js";
import { enabledContractorRoutes } from "../contractor-site-prototype/src/content/routes.js";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "_site");
const searchOutput = resolve(output, "pagefind");

const routeFile = (path) =>
  path === "/" ? "index.html" : `${path.replace(/^\/+|\/+$/g, "")}/index.html`;

const plans = [
  {
    name: "inspector",
    routes: enabledInspectorRoutes.map((route) => ({
      publicPath: route.path,
      file: resolve(output, routeFile(route.path)),
    })),
  },
  {
    name: "contractor",
    routes: enabledContractorRoutes.map((route) => ({
      publicPath: `/contracting${route.path}`,
      file: resolve(output, "contracting", routeFile(route.path)),
    })),
  },
];

const formatErrors = (errors = []) => errors.map((error) => String(error)).join("\n");

async function buildIndex({ name, routes }) {
  assert.ok(routes.length > 0, `Pagefind ${name} index has no enabled routes`);
  assert.equal(
    new Set(routes.map((route) => route.publicPath)).size,
    routes.length,
    `Pagefind ${name} index contains duplicate public routes`,
  );

  const created = await pagefind.createIndex({
    rootSelector: "main",
    forceLanguage: "en",
    keepIndexUrl: false,
    writePlayground: false,
  });
  assert.equal(created.errors?.length || 0, 0, formatErrors(created.errors));
  assert.ok(created.index, `Pagefind did not create the ${name} index`);

  for (const route of routes) {
    const content = await readFile(route.file, "utf8");
    assert.match(content, /<main(?:\s|>)/, `${route.file} lacks the main content required for search indexing`);
    const result = await created.index.addHTMLFile({
      url: route.publicPath,
      content,
    });
    assert.equal(result.errors?.length || 0, 0, formatErrors(result.errors));
    assert.ok(result.file, `Pagefind did not index ${route.publicPath}`);
  }

  const result = await created.index.writeFiles({
    outputPath: resolve(searchOutput, name),
  });
  assert.equal(result.errors?.length || 0, 0, formatErrors(result.errors));
  await created.index.deleteIndex();
  return routes.length;
}

await rm(searchOutput, { recursive: true, force: true });

try {
  const counts = [];
  for (const plan of plans) counts.push([plan.name, await buildIndex(plan)]);
  console.log(`PASS: built Pagefind indexes for ${counts.map(([name, count]) => `${count} ${name} routes`).join(" and ")}.`);
} finally {
  await pagefind.close();
}
