# C&G owner verification queue

This file is a handoff index. The executable gates in `shared/siteData.js` and
`shared/reviewRegistry.js` remain authoritative. The full field-by-field
activation workflow is in `OWNER_CONTENT_INTAKE.md`, and
`node scripts/publication-readiness.mjs` prints the current machine-readable
queue. A pending item must not be
published merely because information was supplied informally; update the
matching registry only after the evidence, exact wording, allowed surfaces, and
expiration or recheck date have been recorded.

## Business identity and credentials

- Approved for website publication on 2026-07-23:
  `C&G Contracting Services is the public-facing brand for contracting work
  performed by Coastal Construction Services, CSLB #987643.` This approval
  does not assert that C&G is a DBA, division, company, or separate legal
  entity. Reopen this item before using any of those terms or if the public
  brand, contractor of record, or license changes.
- Confirm any home-inspector certification or directory claim from a current
  primary record.
- Approve exact wording and current evidence for general-liability and
  errors-and-omissions insurance, if either will be published.
- Confirm the defensible start date and exact wording for any years-of-
  experience claim.
- Confirm and approve evidence-backed wording for the teaching credential,
  City of Compton experience, and insurance-company experience.
- Recheck CSLB license `987643` against the official record when its registry
  verification date or expiration changes.

## Services and operating promises

- Los Angeles County and Riverside County were approved on 2026-07-23 for the
  inspection site, contracting site, and metadata, and their county pages are
  published. Reopen those records if the coverage, qualification, or allowed
  surfaces change. Compton may appear as a representative Los Angeles County
  community, but the separate City of Compton landing page remains pending and
  unpublished until its individual registry flags are approved.
- Approve any report-delivery timing promise, including same-day or next-day
  wording.
- Approve any weekend or named-day availability promise.
- Approve the agreement, report support, qualifications, and legal wording
  before publishing a pool or spa inspection service.
- Confirm whether manufactured homes are supported by the inspection
  agreement and report.
- Confirm the tools and operating practice before publishing moisture-meter or
  temperature-sensor claims.

## Reviews and project evidence

- Fill any of the 50 pending review slots only with a verifiable source URL,
  exact customer-approved text, display attribution, publication-permission
  date, and allowed surface. The carousel remains absent while no slot passes
  every gate.
- Approve the review display policy and any third-party review provider before
  enabling a provider integration.
- Replace editorial project illustrations with real C&G project photographs
  only after ownership or usage permission, customer/property privacy,
  caption, alt text, and allowed surfaces are recorded.
- Fill a case-study slot only after its condition, scope, constraints,
  approach, documented result, source confirmation, permission, privacy
  approval, and referenced photo records all pass.
- Add the sample-report PDF only after page-by-page and metadata redaction,
  owner publication approval, privacy review, page count, template reference,
  and SHA-256 digest are recorded.
- Confirm the retained asset/permission record for the current generated
  editorial image set.

## Integrations and privacy

- Booking: approve the provider, public booking URL, availability policy, and
  privacy wording.
- Analytics: approve the provider, public site ID, consent decision, event
  taxonomy, retention, and privacy wording.
- Maps: approve a public business-address or service-area policy and the
  provider's privacy implications.
- Reviews: approve the provider and public configuration only after the review
  evidence and permission workflow is operating.
- Forms: decide whether the current local-validation and mail-draft transport
  should remain or be replaced by an approved HTTPS form processor. The secure
  adapter is present but stays disabled until provider, endpoint, privacy,
  retention, abuse-control, and receipt behavior are approved.
- Dropbox File Requests: create the request in a client-owned Dropbox account
  with two-factor authentication and a dedicated empty destination folder.
  Record the public `https://www.dropbox.com/request/...` URL, acknowledge that
  the reusable link can be used by anyone who has it, and explicitly
  acknowledge that activation places that URL in the public client bundle.
  Showing the action after a confirmed form submission is UI sequencing, not
  access control. Approve the up-to-10 image guidance plus retention, deletion,
  privacy, and abuse-response procedures. Until the HTTPS form processor is
  enabled and that public-link risk is accepted, send the request link manually
  after reviewing the inquiry. Do not place Dropbox credentials in this
  repository.
- Protected uploads remain a separate, higher-control option. Enabling that
  path requires a one-time upload broker, host and MIME allowlists, file limits,
  malware controls, retention/deletion, and privacy terms. GitHub Pages never
  receives private files or stores an upload credential.
- Obtain owner and professional review of the final privacy, retention,
  contract, deposit, warranty, cancellation, and business-name wording where
  applicable.

## Publication signoff

- Review every enabled route at the specified desktop, tablet, and mobile
  sizes.
- Confirm the production domain, canonical origin, DNS, and GitHub Pages
  environment.
- Check that the scheduled `Live site monitor` workflow remains enabled. GitHub
  automatically disables scheduled workflows in a public repository after 60
  days without repository activity; re-enable it when needed or add a separate
  owner-controlled uptime monitor for durable coverage.
- Verify the `www.cginspection.net` property in an owner-controlled Google
  Search Console account, submit
  `https://www.cginspection.net/sitemap.xml`, and monitor indexing and security
  notices. Keep verification tokens, DNS values, and account identifiers out
  of the repository unless their publication is deliberately approved.
- Confirm that pending records remain non-renderable after every registry
  update and before each production deployment.
