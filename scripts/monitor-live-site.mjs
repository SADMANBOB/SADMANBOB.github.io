import assert from "node:assert/strict";

const origin = (process.env.SITE_ORIGIN || "https://www.cginspection.net").replace(/\/+$/, "");
const canonicalOrigin = (process.env.CANONICAL_ORIGIN || origin).replace(/\/+$/, "");
const localStaticFixture = /^(1|true)$/i.test(process.env.LOCAL_STATIC_FIXTURE || "");
const timeoutMilliseconds = 15_000;
const checks = [
  {
    path: "/",
    status: 200,
    canonical: `${canonicalOrigin}/`,
    includes: ["Which service are", "you looking <em>for?</em>", "Explore Home Inspection", "Explore Contracting Services"],
  },
  {
    path: "/inspection/",
    status: 200,
    canonical: `${canonicalOrigin}/inspection/`,
    includes: ["C&amp;G Certified Home Inspector", "Know what you’re"],
  },
  {
    path: "/contracting/",
    status: 200,
    canonical: `${canonicalOrigin}/contracting/`,
    includes: ["C&amp;G Contracting Services", "Practical repairs."],
  },
  {
    path: "/contact/",
    status: 200,
    canonical: `${canonicalOrigin}/contact/`,
    includes: ["Start your inspection request.", "Save inspection contact"],
  },
  {
    path: "/contracting/estimate/",
    status: 200,
    canonical: `${canonicalOrigin}/contracting/estimate/`,
    includes: ["First, confirm inspection eligibility.", "Save contractor contact"],
  },
  {
    path: "/assets/cg-inspection.vcf",
    status: 200,
    includes: ["BEGIN:VCARD", "FN:C&G Certified Home Inspector", "TEL;TYPE=work,voice;VALUE=uri:tel:+13105056581"],
  },
  {
    path: "/assets/cg-contracting.vcf",
    status: 200,
    includes: ["BEGIN:VCARD", "FN:C&G Contracting Services", "TEL;TYPE=work,voice;VALUE=uri:tel:+13105056581"],
  },
  {
    path: "/cg-live-monitor-route-that-does-not-exist/",
    status: 404,
    includes: ["Which C&amp;G service can help?", "Home Inspection", "Contracting Services"],
  },
];

const inspect = async ({ path, status, canonical, includes }) => {
  const url = new URL(path, `${origin}/`);
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      Accept: path.endsWith(".vcf") ? "text/vcard,text/plain;q=0.9,*/*;q=0.8" : "text/html,*/*;q=0.8",
      "User-Agent": "C-and-G-live-monitor/1.0",
    },
    signal: AbortSignal.timeout(timeoutMilliseconds),
  });
  const body = await response.text();

  assert.equal(response.status, status, `${path} returned HTTP ${response.status}; expected ${status}`);
  assert.equal(response.url, url.href, `${path} unexpectedly resolved to ${response.url}`);
  for (const expected of localStaticFixture && status === 404 ? [] : includes) {
    assert.ok(body.includes(expected), `${path} is missing expected production content: ${expected}`);
  }
  if (canonical) {
    assert.ok(
      body.includes(`<link rel="canonical" href="${canonical}"`),
      `${path} has no canonical for ${canonical}`,
    );
  }
  assert.equal(
    /owner-review-banner|provisional_owner_review|Legacy feedback pending owner confirmation/i.test(body),
    false,
    `${path} leaked owner-review staging content`,
  );
  return `${response.status} ${path}`;
};

const results = await Promise.all(checks.map(inspect));
console.log(`PASS: live C&G monitor verified ${results.length} production surfaces at ${origin}`);
for (const result of results) console.log(`- ${result}`);
