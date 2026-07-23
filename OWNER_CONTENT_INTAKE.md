# C&G verified-content activation runbook

The public site now has activation paths for reviews, a redacted sample report,
permission-backed project photography, source-backed case studies, online
booking, secure form processing, protected uploads, and unique service-area
pages. None of those paths treats “supplied,” “found online,” or “looks
reasonable” as approval.

Run `node scripts/publication-readiness.mjs` for the current machine-readable
readiness report. Run it with `--require-all` only when intentionally checking
whether every owner-dependent proof surface has been completed.

## Reviews

Authority:

- `shared/reviewRegistry.js`
- `shared/siteData.js` → `claims.customerTestimonials`

For each approved review, record the HTTPS source, exact text authorized for
publication, safe display attribution, permission timestamp, and allowed
surface. The global testimonial claim must also be approved. Do not copy a
review from a platform merely because it is publicly visible; confirm the
display policy and publication permission first.

The carousel renders no markup until both the global claim and at least one
slot pass every check.

## Redacted sample report

Authority: `shared/publicationRegistry.js` → `sampleReportRegistry`.

Before activation:

1. Create a redacted PDF outside the repository.
2. Review every page for names, contact details, property address and
   identifying imagery, access or alarm information, transaction details,
   signatures, metadata, and hidden PDF layers.
3. Obtain owner publication approval and privacy-review confirmation.
4. Place the approved file under
   `inspector-site-prototype/public/assets/sample-reports/`.
5. Record its lowercase SHA-256 digest, page count, template reference,
   exact byte size, approval timestamps, and the `inspector-sample-report`
   surface. The published PDF must be 8 MiB or smaller and no more than 250
   pages; optimize images and remove hidden or unused objects before approval.

The route, footer link, sitemap entry, and viewer page stay absent until the
record passes the registry. Verification also checks that the approved PDF
exists and matches its recorded digest.

## Project photography and case studies

Authority:

- `shared/publicationRegistry.js` → `clientProjectPhotoSlots`
- `shared/publicationRegistry.js` → `projectCaseStudySlots`

Every photo needs an approved public path, intrinsic pixel width and height,
lowercase SHA-256 digest, source-evidence ID, rights-evidence ID, accurate alt
text and caption, confirmation that it depicts actual client work, rights
confirmation, property/privacy approval, and an allowed surface. To
replace an existing editorial image, record its exact image-provenance ID in
`replacesEditorialImageId` and approve the corresponding home, about, projects,
or case-study surface. Remove or crop faces, addresses, license plates,
documents, keys, security systems, and other identifiers unless specific
publication permission covers them.

Every case study must independently document the starting condition, exact
scope, constraints, work approach, supported result, service category, source
confirmation and evidence ID, publication permission, privacy approval, and
approved photo IDs. The case-study category must match a current request
category, and every approved slug must be unique. The route and index card are
generated only when all referenced photos also pass.

## Online booking

Authority: `shared/siteData.js` → `integrations.booking`.

Activation requires:

- the actual provider name;
- an HTTPS public booking URL;
- the provider privacy URL;
- an approved action label;
- allowed surfaces;
- owner-approved availability and cancellation policy text;
- owner, privacy, and policy approval timestamps; and
- `status: "approved"` plus `enabled: true`.

Until then, primary actions route to the request page and do not imply that a
date has been reserved.

## Secure forms

Authority:

- `shared/siteData.js` → `integrations.secureInspectionFormTransport`
- `shared/siteData.js` → `integrations.secureContractorFormTransport`
- `shared/integrationAdapters.js`

The browser contains no secret. The approved processor must expose an HTTPS
POST endpoint that accepts JSON, enforce abuse controls server-side, publish a
privacy policy, define retention/deletion, and return only an optional opaque
receipt. Record the public endpoint, provider, privacy URL, form ID, allowed
surface, response-contract version, retention and deletion policy, abuse
controls, and owner/privacy/security approval timestamps.

The existing mail-draft path remains the truthful fallback until a processor
passes. Once approved, both forms automatically select the secure transport and
change their states and disclosures accordingly.

## Protected uploads

Authority:

- `shared/siteData.js` → `integrations.protectedUpload`
- `shared/integrationAdapters.js`

GitHub Pages cannot safely hold upload credentials or receive private files.
The approved broker must issue short-lived, one-time HTTPS upload URLs. Record
its public session endpoint, privacy URL, allowed upload hosts, MIME allowlist,
maximum bytes, maximum file count, allowed form surfaces, retention/deletion
policy, malware controls, one-time session contract, session expiry between 60
and 3,600 seconds, and owner/privacy/security approval timestamps.

The browser validates type and size, requests a one-time session, uploads
directly with omitted credentials and no referrer, and sends the opaque upload
ID plus a versioned authorization record with the form. The broker must retain
that authorization with the upload session, reject unlinked or expired upload
IDs, and delete abandoned uploads under its approved retention policy.
Unchecking authorization removes uploaded IDs from the request. Upload controls
stay absent unless both a secure form processor and the upload broker are
approved for the same surface.

## Unique service-area pages

Authority:

- `shared/siteData.js` → `serviceAreas`
- `shared/publicationRegistry.js` → `serviceAreaPageIsApproved`

Approve inspection coverage, contracting coverage, and metadata separately.
Each enabled page additionally needs owner confirmation and a surface-specific
`inspectorPage` or `contractorPage` record with its own unique title,
description, locally accurate introductory/property/access copy, and at least
three useful planning items. Inspection and contracting pages must not reuse the
same copy. Thin location swaps do not pass.

Approved pages are automatically added to prerendering, internal routing,
metadata, breadcrumbs, and the correct sitemap.

## Release checklist

After any approval update:

1. Run `npm run build`.
2. Run `npm run verify`.
3. Run `npm run quality`.
4. Run `npm run audit:a11y`.
5. Run the cross-browser visual suite.
6. Inspect all new public pages at the specified desktop, tablet, and mobile
   sizes.
7. Confirm pending records still produce no public markup, metadata, schema, or
   sitemap entry.
