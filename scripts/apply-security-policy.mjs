import assert from "node:assert/strict";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import {
  CONTENT_SECURITY_POLICY,
  contentSecurityPolicyMetaTag,
} from "../shared/securityPolicy.js";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "_site");
const policyMeta = contentSecurityPolicyMetaTag();

const listHtmlFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const entryPath = resolve(directory, entry.name);
    if (entry.isDirectory()) return listHtmlFiles(entryPath);
    return entry.name.endsWith(".html") ? [entryPath] : [];
  }));
  return files.flat();
};

assert.equal(CONTENT_SECURITY_POLICY.includes("'unsafe-inline'"), false);
assert.equal(
  /(?:^|[\s;])'unsafe-eval'(?:[\s;]|$)/.test(CONTENT_SECURITY_POLICY),
  false,
);
assert.equal(/[*>]|https?:/.test(CONTENT_SECURITY_POLICY), false);

const htmlFiles = await listHtmlFiles(output);
assert.ok(htmlFiles.length > 0, "No assembled HTML files were found for CSP application");

for (const file of htmlFiles) {
  const original = await readFile(file, "utf8");
  const withoutExistingPolicy = original.replace(
    /\s*<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>\s*/gi,
    "\n",
  );
  const charset = /<meta\s+charset=["'][^"']+["']\s*\/?>/i;
  assert.match(
    withoutExistingPolicy,
    charset,
    `${relative(output, file)} has no charset meta before CSP application`,
  );
  const secured = withoutExistingPolicy.replace(
    charset,
    (match) => `${match}\n    ${policyMeta}`,
  );
  await writeFile(file, secured);
}

console.log(`PASS: applied the strict production CSP to ${htmlFiles.length} assembled HTML files.`);
