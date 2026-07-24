import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { analytics, approvedIntegrationsFor, approvedServiceAreas, business, claimCanRenderOn, claimIsApproved, claims, contractorRequestCategoryIds, evaluateContractorEligibility, imageProvenance, integrationCanRender, integrations, separationPolicy, serviceAreas } from "../shared/siteData.js";
import {
  bookingActionFor,
  createFileShareAuthorization,
  formTransportFor,
  prepareMailto,
  protectedUploadPolicyFor,
  submitApprovedForm,
  uploadProtectedFile,
} from "../shared/integrationAdapters.js";
import {
  responsiveEditorialImages,
  responsiveImageWidths,
} from "../shared/imageVariants.js";
import {
  clientProjectPhotoIsApproved,
  clientProjectPhotoSlots,
  getAllApprovedClientProjectPhotos,
  getApprovedProjectCaseStudies,
  getApprovedProjectPhotos,
  getApprovedSampleReports,
  getApprovedServiceAreaPages,
  projectCaseStudyIsApproved,
  projectCaseStudySlots,
  PUBLICATION_SURFACES,
  sampleReportIsApproved,
  sampleReportRegistry,
  serviceAreaPageIsApproved,
} from "../shared/publicationRegistry.js";
import { getApprovedReviews, getLegacyOwnerReviewReviews, getRenderableReviews, reviewEntryIsApproved, reviewEntryIsLegacyOwnerReview, reviewSlots } from "../shared/reviewRegistry.js";
import {
  CONTENT_STATE,
  OWNER_REVIEW_STAGING_VISIBLE,
  ownerReviewBannerCopy,
  preferredEmails,
  provisionalBusinessDetails,
} from "../shared/ownerReview.js";
import { dedupeSearchRecords, expandedSearchTerms, searchSuggestions } from "../shared/searchVocabulary.js";
import { inspectorRoutes, enabledInspectorRoutes, inspectorNotFoundRoute, serviceAreaRouteDefinitions as inspectorAreaRoutes } from "../inspector-site-prototype/src/content/routes.js";
import { inspectorFaqItems } from "../inspector-site-prototype/src/content/faqs.js";
import { enabledInspectionScope } from "../inspector-site-prototype/src/content/inspectionScope.js";
import { resourceBySlug } from "../inspector-site-prototype/src/content/resources.js";
import { contractorRoutes, enabledContractorRoutes, contractorNotFoundRoute, projectCaseRouteDefinitions, serviceAreaRouteDefinitions as contractorAreaRoutes } from "../contractor-site-prototype/src/content/routes.js";
import { contractorFaqs } from "../contractor-site-prototype/src/content/faqs.js";
import { contractorRequestCategories, contractorServices, requestCategoryFromSearch } from "../contractor-site-prototype/src/content/services.js";

const root = resolve(import.meta.dirname, "..");
const inspector = resolve(root, "inspector-site-prototype");
const contractor = resolve(root, "contractor-site-prototype");
const output = resolve(root, "_site");
const expectedOrigin = (process.env.SITE_ORIGIN || business.inspection.origin).replace(/\/+$/, "");
const read = (path) => readFile(path, "utf8");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const routeFile = (path) => path === "/" ? "index.html" : `${path.replace(/^\/+|\/+$/g, "")}/index.html`;
const contractorPublicPath = (path) => `/contracting${path}`;
const contractorOutputFile = (path) => `contracting/${routeFile(path)}`;

const listFiles = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? listFiles(resolve(directory, entry.name)) : [resolve(directory, entry.name)]));
  return nested.flat();
};

const metaContent = (html, attribute, key) => html.match(new RegExp(`<meta ${attribute}="${escapeRegex(key)}" content="([^"]*)"`))?.[1];
const titleContent = (html) => html.match(/<title>([^<]+)<\/title>/)?.[1];
const canonicalContent = (html) => html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
const schemaContent = (html) => html.match(/<script id="cg-page-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
const sitemapLocations = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const escapeHtmlText = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const inspectorSourceFiles = (await listFiles(resolve(inspector, "src"))).filter((file) => /\.(jsx?|css)$/.test(file));
const contractorSourceFiles = (await listFiles(resolve(contractor, "src"))).filter((file) => /\.(jsx?|css)$/.test(file));
const inspectorSource = (await Promise.all(inspectorSourceFiles.map(read))).join("\n");
const contractorSource = (await Promise.all(contractorSourceFiles.map(read))).join("\n");
const allSource = `${inspectorSource}\n${contractorSource}`;

const forbiddenDirectClaims = [
  /\b(?:35\+?|over 35) years\b/i,
  /\bdecades of experience\b/i,
  /\bfully insured\b/i,
  /\blicensed\s*(?:&|and)\s*insured\b/i,
  /\bInterNACHI\b/i,
  /\b(?:same|next)[ -]day reports?\b/i,
  /\bMonday[–-]Saturday\b/i,
  /\bSunday by appointment\b/i,
  /\b(?:real customer|customer review|five-star|5-star)\b/i,
  /\bcompleted C&G projects?\b/i,
];
// Exclude preserved legacy client-feedback quotes from the marketing-claim scan.
const marketingSource = allSource.replace(/legacyText:\s*"[^"]*"/g, 'legacyText:""');
for (const pattern of forbiddenDirectClaims) assert.equal(pattern.test(marketingSource), false, `Production source contains an unapproved direct claim: ${pattern}`);

const now = new Date();
const gateTestDate = new Date("2026-07-23T12:00:00Z");
for (const [id, claim] of Object.entries(claims)) {
  if (claim.status === "approved") assert.equal(claimIsApproved(claim, now), true, `Approved claim ${id} is expired or invalid`);
}
assert.equal(claimIsApproved(claims.contractorLicense, now), true, "Official contractor license gate is not current at build time");
assert.ok(business.contracting.license.liveVerifiedAt, "Contractor license lacks a live verification date");
assert.match(business.contracting.license.officialLookupUrl, /^https:\/\/www\.cslb\.ca\.gov\//, "Contractor license link is not an official CSLB URL");
assert.equal(claims.contractorPublicName.publicCopy, business.contracting.publicBrandDisclosure, "Approved contractor public-name copy drifted from the business registry");
assert.deepEqual(
  claims.contractorPublicName.allowedSurfaces,
  ["inspector", "contractor", "portal"],
  "Contractor public-name approval does not match the rendered surfaces",
);
assert.deepEqual(
  claims.contractorLicense.allowedSurfaces,
  ["inspector", "contractor", "portal"],
  "Contractor license approval does not match the rendered surfaces",
);
for (const surface of ["inspector", "contractor", "portal"]) {
  assert.equal(claimCanRenderOn(claims.contractorPublicName, surface, now), true, `Contractor public name is not approved for ${surface}`);
  assert.equal(claimCanRenderOn(claims.contractorLicense, surface, now), true, `Contractor license is not approved for ${surface}`);
}
assert.equal(analytics.enabled, false, "Analytics must remain disabled until a provider is approved");
assert.equal(integrationCanRender(integrations.siteSearch), true, "Approved Pagefind search integration is not renderable");
assert.equal(integrationCanRender(integrations.inspectionFormTransport), true, "Inspection mailto transport is not renderable");
assert.equal(integrationCanRender(integrations.contractorFormTransport), true, "Contractor mailto transport is not renderable");
const ownerGatedIntegrationIds = [
  "booking",
  "secureInspectionFormTransport",
  "secureContractorFormTransport",
  "protectedUpload",
  "analytics",
  "maps",
  "reviews",
];
for (const id of ownerGatedIntegrationIds) {
  const integration = integrations[id];
  if (integration.status === "approved") {
    assert.equal(integrationCanRender(integration, now), true, `Approved ${id} integration is incomplete, expired, or unsafe`);
  } else {
    assert.equal(integrationCanRender(integration, now), false, `Pending ${id} integration became renderable`);
    assert.equal(integration.enabled, false, `Pending ${id} integration became enabled`);
    assert.equal(integration.provider, null, `Pending ${id} integration contains a provider`);
    assert.equal(integration.publicConfig, null, `Pending ${id} integration contains public configuration`);
    assert.deepEqual(integration.allowedSurfaces, [], `Pending ${id} integration exposes an allowed surface`);
  }
}
for (const surface of ["inspector", "contractor", "inspector-contact", "contractor-estimate"]) {
  const expected = Object.entries(integrations)
    .filter(([, integration]) => integrationCanRender(integration, now) && integration.allowedSurfaces?.includes(surface))
    .map(([id, integration]) => ({ id, ...integration }));
  assert.deepEqual(approvedIntegrationsFor(surface), expected, `${surface} integration surface does not match approved providers`);
}
for (const [surface, fallbackId] of [["inspector-contact", "inspectionFormTransport"], ["contractor-estimate", "contractorFormTransport"]]) {
  const secureId = surface === "inspector-contact" ? "secureInspectionFormTransport" : "secureContractorFormTransport";
  const expectedId = integrationCanRender(integrations[secureId], now) ? secureId : fallbackId;
  assert.equal(formTransportFor(surface)?.id, expectedId, `${surface} did not select the correct approved transport`);
  const uploadExpected = integrations.protectedUpload.allowedSurfaces?.includes(surface)
    && integrationCanRender(integrations.protectedUpload, now)
    && expectedId === secureId;
  assert.equal(Boolean(protectedUploadPolicyFor(surface)), uploadExpected, `${surface} protected-upload availability drifted from its gates`);
}
const bookingAction = bookingActionFor("inspector", { href: "/contact/", label: "Request an Inspection" });
assert.equal(bookingAction.external, integrationCanRender(integrations.booking, now), "Booking action does not match its approval gate");
if (!bookingAction.external) {
  assert.deepEqual(
    bookingAction,
    { external: false, href: "/contact/", label: "Request an Inspection", provider: null, privacyUrl: null },
    "Pending booking provider replaced the inspection-request fallback",
  );
}
assert.match(
  prepareMailto({ recipient: business.inspection.email, subject: "Inspection request", body: "Property details" }),
  /^mailto:[^?]+\?subject=Inspection%20request&body=Property%20details$/,
  "Approved mailto adapter did not encode a safe draft",
);
assert.equal(integrationCanRender({
  status: "approved",
  enabled: true,
  capability: "booking",
  provider: "Approved Scheduler",
  allowedSurfaces: ["inspector"],
  ownerApprovedAt: "2026-07-22T12:00:00Z",
  privacyReviewedAt: "2026-07-22T12:00:00Z",
  policyApprovedAt: "2026-07-22T12:00:00Z",
  publicConfig: {
    bookingUrl: "https://schedule.example.test/inspection",
    privacyUrl: "https://schedule.example.test/privacy",
    actionLabel: "Book an inspection online",
    availabilityPolicy: "Displayed times remain requests until C&G confirms the property, inspection scope, travel, price, and access.",
    cancellationPolicy: "Cancellation and rescheduling terms shown by the approved scheduler apply only after C&G confirms an appointment.",
  },
}, gateTestDate), true, "A fully configured booking provider cannot pass the adapter gate");
assert.equal(integrationCanRender({
  status: "approved",
  enabled: true,
  capability: "form-transport",
  provider: "Approved Processor",
  allowedSurfaces: ["inspector-contact"],
  serverSubmissionEnabled: true,
  ownerApprovedAt: "2026-07-22T12:00:00Z",
  privacyReviewedAt: "2026-07-22T12:00:00Z",
  securityReviewedAt: "2026-07-22T12:00:00Z",
  publicConfig: {
    endpoint: "https://forms.example.test/v1/submit",
    privacyUrl: "https://forms.example.test/privacy",
    formId: "inspection_request",
    method: "POST",
    encoding: "application/json",
    retentionPolicy: "Submitted requests are retained only for the approved business-record period.",
    deletionPolicy: "Deletion requests are handled under the approved legal and records policy.",
    abuseControls: "The processor applies rate limiting, bot controls, and server-side validation.",
    responseContractVersion: "form-response-v1",
  },
}, gateTestDate), true, "A fully configured HTTPS form processor cannot pass the adapter gate");
assert.equal(integrationCanRender({
  status: "approved",
  enabled: true,
  capability: "protected-upload",
  provider: "Approved Upload Broker",
  allowedSurfaces: ["inspector-contact"],
  ownerApprovedAt: "2026-07-22T12:00:00Z",
  privacyReviewedAt: "2026-07-22T12:00:00Z",
  securityReviewedAt: "2026-07-22T12:00:00Z",
  publicConfig: {
    sessionEndpoint: "https://uploads.example.test/v1/session",
    privacyUrl: "https://uploads.example.test/privacy",
    maxBytes: 10_000_000,
    maxFiles: 3,
    allowedMimeTypes: ["image/jpeg", "application/pdf"],
    allowedUploadHosts: ["objects.example.test"],
    sessionTtlSeconds: 900,
    oneTimeUploadContract: "Each upload URL accepts one file, expires after the configured session, and cannot be reused.",
    retentionPolicy: "Linked files are retained only for the approved request-review period.",
    deletionPolicy: "Expired, abandoned, revoked, and owner-deleted files follow the approved deletion schedule.",
    malwareControls: "Uploaded content is quarantined and scanned before staff access.",
  },
}, gateTestDate), true, "A fully configured protected-upload broker cannot pass the adapter gate");
assert.equal(integrationCanRender({
  status: "approved",
  enabled: true,
  capability: "form-transport",
  provider: "Invalid Surface Processor",
  allowedSurfaces: "inspector-contact",
  serverSubmissionEnabled: true,
}), false, "A string allowedSurfaces value passed the provider gate");
assert.deepEqual(createFileShareAuthorization(gateTestDate), {
  confirmed: true,
  statementVersion: "2026-07-22",
  confirmedAt: "2026-07-23T12:00:00.000Z",
}, "File-sharing authorization is not versioned and timestamped");

const approvedSecureTransportFixture = {
  status: "approved",
  enabled: true,
  capability: "form-transport",
  provider: "Approved Processor",
  allowedSurfaces: ["inspector-contact"],
  serverSubmissionEnabled: true,
  ownerApprovedAt: "2026-07-22T12:00:00Z",
  privacyReviewedAt: "2026-07-22T12:00:00Z",
  securityReviewedAt: "2026-07-22T12:00:00Z",
  publicConfig: {
    endpoint: "https://forms.example.test/v1/submit",
    privacyUrl: "https://forms.example.test/privacy",
    formId: "inspection_request",
    method: "POST",
    encoding: "application/json",
    retentionPolicy: "Submitted requests are retained only for the approved business-record period.",
    deletionPolicy: "Deletion requests are handled under the approved legal and records policy.",
    abuseControls: "The processor applies rate limiting, bot controls, and server-side validation.",
    responseContractVersion: "form-response-v1",
  },
};
const approvedUploadFixture = {
  status: "approved",
  enabled: true,
  capability: "protected-upload",
  provider: "Approved Upload Broker",
  allowedSurfaces: ["inspector-contact"],
  ownerApprovedAt: "2026-07-22T12:00:00Z",
  privacyReviewedAt: "2026-07-22T12:00:00Z",
  securityReviewedAt: "2026-07-22T12:00:00Z",
  publicConfig: {
    sessionEndpoint: "https://uploads.example.test/v1/session",
    privacyUrl: "https://uploads.example.test/privacy",
    maxBytes: 10_000_000,
    maxFiles: 3,
    allowedMimeTypes: ["image/jpeg", "application/pdf"],
    allowedUploadHosts: ["objects.example.test"],
    sessionTtlSeconds: 900,
    oneTimeUploadContract: "Each upload URL accepts one file, expires after the configured session, and cannot be reused.",
    retentionPolicy: "Linked files are retained only for the approved request-review period.",
    deletionPolicy: "Expired, abandoned, revoked, and owner-deleted files follow the approved deletion schedule.",
    malwareControls: "Uploaded content is quarantined and scanned before staff access.",
  },
};
const originalSecureInspectionTransport = integrations.secureInspectionFormTransport;
const originalProtectedUpload = integrations.protectedUpload;
try {
  integrations.secureInspectionFormTransport = approvedSecureTransportFixture;
  integrations.protectedUpload = approvedUploadFixture;

  const formPayload = { propertyAddress: "Adapter test property" };
  const formCalls = [];
  const formResult = await submitApprovedForm("inspector-contact", formPayload, {
    fetchImpl: async (url, options) => {
      formCalls.push({ url, options });
      return {
        ok: true,
        headers: { get: (name) => name.toLowerCase() === "content-type" ? "application/json" : null },
        json: async () => ({ receipt: "receipt_123456" }),
      };
    },
  });
  assert.equal(formResult.mode, "submitted", "Approved secure form did not submit through its HTTPS adapter");
  assert.equal(formResult.receipt, "receipt_123456", "Approved secure form lost its opaque receipt");
  assert.equal(formCalls.length, 1, "Approved secure form made an unexpected number of requests");
  assert.equal(formCalls[0].url, approvedSecureTransportFixture.publicConfig.endpoint, "Secure form used the wrong endpoint");
  assert.equal(formCalls[0].options.credentials, "omit", "Secure form sent browser credentials");
  assert.equal(formCalls[0].options.redirect, "error", "Secure form permits an unreviewed redirect");
  assert.deepEqual(JSON.parse(formCalls[0].options.body), {
    formId: approvedSecureTransportFixture.publicConfig.formId,
    surface: "inspector-contact",
    payload: formPayload,
  }, "Secure form request body drifted from its approved contract");

  const authorization = createFileShareAuthorization(new Date("2026-07-22T12:00:00Z"));
  const testFile = {
    name: "adapter-test.jpg",
    size: 4_096,
    type: "image/jpeg",
  };
  const uploadCalls = [];
  const uploadResult = await uploadProtectedFile("inspector-contact", testFile, {
    authorization,
    fetchImpl: async (url, options) => {
      uploadCalls.push({ url, options });
      if (uploadCalls.length === 1) {
        return {
          ok: true,
          json: async () => ({
            uploadUrl: "https://objects.example.test/one-time-upload",
            uploadId: "upload_12345678",
          }),
        };
      }
      return { ok: true };
    },
  });
  assert.equal(uploadResult.uploadId, "upload_12345678", "Protected upload lost its opaque upload ID");
  assert.equal(uploadCalls.length, 2, "Protected upload did not use exactly one session request and one upload");
  assert.equal(uploadCalls[0].url, approvedUploadFixture.publicConfig.sessionEndpoint, "Upload used the wrong broker endpoint");
  assert.equal(uploadCalls[0].options.credentials, "omit", "Upload session sent browser credentials");
  assert.equal(uploadCalls[1].url, "https://objects.example.test/one-time-upload", "Upload ignored the broker allowlisted URL");
  assert.equal(uploadCalls[1].options.referrerPolicy, "no-referrer", "File upload exposed a referrer");
  assert.equal(uploadCalls[1].options.body, testFile, "Protected upload did not send the approved file object");
  await assert.rejects(
    uploadProtectedFile("inspector-contact", testFile, {
      authorization: null,
      fetchImpl: async () => {
        throw new Error("Network should not be reached without authorization.");
      },
    }),
    /Confirm authorization/,
    "Protected upload accepted a file without current authorization",
  );
} finally {
  integrations.secureInspectionFormTransport = originalSecureInspectionTransport;
  integrations.protectedUpload = originalProtectedUpload;
}

assert.equal(reviewSlots.length, 50, "The review approval registry must contain exactly 50 slots");
assert.equal(new Set(reviewSlots.map((review) => review.id)).size, 50, "Review registry IDs are not unique");
for (const [index, review] of reviewSlots.entries()) {
  assert.equal(review.id, `review-slot-${String(index + 1).padStart(2, "0")}`, `Review slot ${index + 1} has the wrong ID`);
  if (review.status === "approved") {
    assert.equal(reviewEntryIsApproved(review, "inspector-home", now), true, `${review.id} is marked approved but fails the review gate`);
  } else if (review.status === CONTENT_STATE.legacyPendingOwnerConfirmation) {
    assert.equal(reviewEntryIsLegacyOwnerReview(review, "inspector-home"), true, `${review.id} legacy owner-review record is incomplete`);
    assert.equal(review.sourceUrl, null, `${review.id} must not claim an approved source URL`);
    assert.equal(review.exactApprovedText, null, `${review.id} must not claim production-approved text`);
    assert.equal(review.publicationPermissionAt, null, `${review.id} must not claim publication permission`);
    assert.equal(review.displayAttribution, null, `${review.id} must not claim approved attribution`);
    assert.deepEqual(review.allowedSurfaces, [], `${review.id} must not expose production allowedSurfaces`);
  } else {
    assert.equal(review.sourceUrl, null, `${review.id} contains an unapproved source`);
    assert.equal(review.exactApprovedText, null, `${review.id} contains unapproved review text`);
    assert.equal(review.publicationPermissionAt, null, `${review.id} claims publication permission`);
    assert.equal(review.displayAttribution, null, `${review.id} contains an unapproved attribution`);
    assert.deepEqual(review.allowedSurfaces, [], `${review.id} exposes an allowed surface`);
  }
}
const approvedReviews = getApprovedReviews("inspector-home", now);
assert.equal(approvedReviews.length, 0, "Legacy owner-review feedback must not pass the production review gate");
assert.ok(approvedReviews.every((review) => reviewEntryIsApproved(review, "inspector-home", now)), "An invalid review became publicly renderable");
const legacyOwnerReviewSlots = reviewSlots.filter((review) => review.status === CONTENT_STATE.legacyPendingOwnerConfirmation);
assert.equal(legacyOwnerReviewSlots.length, 20, "Exactly 20 legacy owner-review feedback slots should remain registered");
if (OWNER_REVIEW_STAGING_VISIBLE) {
  assert.equal(getLegacyOwnerReviewReviews("inspector-home").length, 20, "Exactly 20 legacy owner-review feedback entries should be available for staging");
  assert.equal(getRenderableReviews("inspector-home").mode, CONTENT_STATE.legacyPendingOwnerConfirmation, "Staging renderable feedback should use the legacy owner-review mode");
} else {
  assert.equal(getLegacyOwnerReviewReviews("inspector-home").length, 0, "Production builds must omit legacy owner-review feedback from render helpers");
  assert.equal(getRenderableReviews("inspector-home").mode, "none", "Production renderable feedback must stay empty while reviews remain unapproved");
}
assert.match(inspectorSource, /<ReviewCarousel/, "The gated review carousel is not mounted on the inspector home page");
assert.match(
  inspectorSource,
  /trust-expectation-band/,
  "The review carousel must render a production-safe empty trust band when no review is approved",
);
assert.doesNotMatch(
  inspectorSource,
  /AggregateRating|pending reviews|fake aggregate/i,
  "Review carousel source must not introduce pending or aggregate-rating claims",
);

assert.equal(sampleReportRegistry.length, 1, "Sample-report registry must expose one primary publication slot");
for (const report of sampleReportRegistry) {
  assert.equal(sampleReportIsApproved(report, undefined, now), report.status === "approved", `${report.id} status does not match its publication gate`);
}
assert.equal(clientProjectPhotoSlots.length, 24, "Client-project photo registry must contain 24 bounded slots");
assert.equal(projectCaseStudySlots.length, 12, "Project case-study registry must contain 12 bounded slots");
assert.equal(new Set(clientProjectPhotoSlots.map((record) => record.id)).size, 24, "Client-project photo IDs are not unique");
assert.equal(new Set(projectCaseStudySlots.map((record) => record.id)).size, 12, "Project case-study IDs are not unique");
for (const photo of clientProjectPhotoSlots) {
  const approvedOnAllDeclaredSurfaces = photo.status === "approved"
    && photo.allowedSurfaces.length > 0
    && photo.allowedSurfaces.every((surface) => clientProjectPhotoIsApproved(photo, surface, now));
  assert.equal(approvedOnAllDeclaredSurfaces, photo.status === "approved", `${photo.id} status does not match its photo rights and privacy gates`);
}
for (const projectCase of projectCaseStudySlots) {
  assert.equal(projectCaseStudyIsApproved(projectCase, undefined, now), projectCase.status === "approved", `${projectCase.id} status does not match its source-backed gate`);
}
const approvedProjectCases = getApprovedProjectCaseStudies(undefined, now);
assert.equal(new Set(approvedProjectCases.map((record) => record.slug)).size, approvedProjectCases.length, "Approved project case slugs are not unique");
for (const area of serviceAreas) {
  for (const surface of ["Inspector", "Contractor"]) {
    if (serviceAreaPageIsApproved(area, surface, now)) {
      assert.equal(area.status, "approved", `${area.id} ${surface} page passed without area approval`);
    }
  }
}
assert.equal(inspectorAreaRoutes.length, getApprovedServiceAreaPages("Inspector", now).length, "Inspector area routes do not match approved page records");
assert.equal(contractorAreaRoutes.length, getApprovedServiceAreaPages("Contractor", now).length, "Contractor area routes do not match approved page records");
assert.equal(projectCaseRouteDefinitions.length, approvedProjectCases.length, "Project case-study routes do not match approved records");

for (const report of getApprovedSampleReports(PUBLICATION_SURFACES.sampleReport)) {
  const sourceFile = resolve(inspector, "public", report.publicPath.replace(/^\/+/, ""));
  const content = await readFile(sourceFile);
  assert.equal(content.byteLength, report.fileBytes, `${report.id} PDF byte size does not match its approved record`);
  assert.equal(createHash("sha256").update(content).digest("hex"), report.sha256, `${report.id} PDF digest does not match its approved record`);
}
for (const photo of getAllApprovedClientProjectPhotos(now)) {
  const sourceFile = resolve(contractor, "public", photo.publicPath.replace(/^\/contracting\/+/, ""));
  const content = await readFile(sourceFile);
  assert.equal(createHash("sha256").update(content).digest("hex"), photo.sha256, `${photo.id} image digest does not match its approved record`);
}

const syntheticSampleReport = {
  id: "sample-report-primary",
  status: "approved",
  title: "Owner-approved redacted sample inspection report",
  publicPath: "/assets/sample-reports/redacted-sample.pdf",
  sha256: "a".repeat(64),
  fileBytes: 1_000_000,
  pageCount: 45,
  reportTemplateVersion: "inspection-template-v1",
  redactionApprovedAt: "2026-07-22T12:00:00Z",
  publicationPermissionAt: "2026-07-22T12:00:00Z",
  privacyReviewConfirmed: true,
  allowedSurfaces: [PUBLICATION_SURFACES.sampleReport],
};
assert.equal(sampleReportIsApproved(syntheticSampleReport, PUBLICATION_SURFACES.sampleReport, gateTestDate), true, "A complete redacted-report record cannot pass its publication gate");
const syntheticProjectPhoto = {
  id: "project-photo-01",
  status: "approved",
  publicPath: "/contracting/assets/projects/documented-repair.webp",
  sha256: "b".repeat(64),
  width: 1_200,
  height: 800,
  alt: "Documented residential finish repair after the approved work was completed",
  caption: "Permission-backed view of the documented finish-repair result.",
  depictsActualClientWork: true,
  replacesEditorialImageId: "illustrative-drywall-repair",
  sourceEvidenceId: "source:project-001",
  rightsEvidenceId: "rights:project-001",
  rightsConfirmedAt: "2026-07-22T12:00:00Z",
  privacyApprovedAt: "2026-07-22T12:00:00Z",
  allowedSurfaces: [PUBLICATION_SURFACES.contractorCaseStudy],
};
assert.equal(clientProjectPhotoIsApproved(syntheticProjectPhoto, PUBLICATION_SURFACES.contractorCaseStudy, gateTestDate), true, "A complete client-project photo cannot pass its publication gate");
const syntheticProjectCase = {
  id: "project-case-01",
  status: "approved",
  slug: "documented-finish-repair",
  title: "Documented residential finish repair",
  summary: "A source-reviewed example showing the approved condition, bounded scope, practical constraints, and supported result without promising the same outcome elsewhere.",
  startingCondition: "The approved source record documented a localized finish condition after the underlying source concern had been addressed.",
  scopeItems: ["Prepare the documented area", "Complete the approved localized finish repair"],
  constraints: ["Existing texture and lighting affected the achievable visual match"],
  approach: ["Confirm the source status", "Protect adjacent finishes", "Document the completed scope"],
  documentedResult: "The approved record supports completion of the bounded finish-repair scope shown in the permission-backed photograph.",
  categoryId: contractorRequestCategoryIds[0],
  imageIds: [syntheticProjectPhoto.id],
  sourceEvidenceId: "case-source:project-001",
  sourceConfirmedAt: "2026-07-22T12:00:00Z",
  publicationPermissionAt: "2026-07-22T12:00:00Z",
  privacyApprovedAt: "2026-07-22T12:00:00Z",
  allowedSurfaces: [PUBLICATION_SURFACES.contractorCaseStudy],
};
assert.equal(
  projectCaseStudyIsApproved(
    syntheticProjectCase,
    PUBLICATION_SURFACES.contractorCaseStudy,
    gateTestDate,
    [syntheticProjectPhoto],
  ),
  true,
  "A complete source-backed project case cannot pass its publication gate",
);
const syntheticArea = {
  id: "example-county",
  label: "Example County",
  type: "county",
  status: "approved",
  approvedForInspector: true,
  approvedForContractor: true,
  approvedForMetadata: true,
  uniquePageEnabled: true,
  ownerConfirmedAt: "2026-07-22T12:00:00Z",
  inspectorPage: {
    pageTitle: "Home inspection planning in Example County",
    metaDescription: "Plan a home inspection request in Example County with address-first coverage, property context, access details, and timing confirmation.",
    pageContent: {
      introduction: "Home inspection availability in Example County begins with the exact property address, inspection purpose, property type, access conditions, and the timing the client actually needs.",
      propertyContext: "Residential properties in Example County vary in age, construction, terrain, utilities, occupancy, and access, so the inspection scope and travel decision are confirmed for the individual property.",
      accessAndTiming: "Share utility status, occupied or vacant condition, additional structures, access limitations, and any real transaction deadline before relying on a proposed inspection date.",
      planningChecklist: ["Provide the complete property address", "Describe the property and requested inspection", "Identify access limits and the actual timing need"],
    },
  },
  contractorPage: {
    pageTitle: "Residential project review in Example County",
    metaDescription: "Prepare a residential project request in Example County with eligibility, scope, access, permit, material, and timing details for review.",
    pageContent: {
      introduction: "A residential project request in Example County starts with inspection eligibility, authority for the property, a plain-language condition, and the result the owner wants reviewed.",
      propertyContext: "Project fit depends on the actual residence, requested trades, source conditions, permit or design needs, access, occupancy, materials, and the contractor classification boundary.",
      accessAndTiming: "Describe who can authorize access, occupied conditions, known hazards, material lead times, permit status, and the true deadline without treating a preferred date as scheduled.",
      planningChecklist: ["Answer the 12-month inspection question", "Describe the condition and requested result", "Identify access, permit, material, and timing constraints"],
    },
  },
};
assert.equal(serviceAreaPageIsApproved(syntheticArea, "Inspector", gateTestDate), true, "A complete inspector area page cannot pass its publication gate");
assert.equal(serviceAreaPageIsApproved(syntheticArea, "Contractor", gateTestDate), true, "A complete contractor area page cannot pass its publication gate");
assert.notEqual(syntheticArea.inspectorPage.metaDescription, syntheticArea.contractorPage.metaDescription, "Inspector and contractor area metadata must remain distinct");
assert.deepEqual(contractorRequestCategories.map((category) => category.key), contractorRequestCategoryIds, "Shared case-study categories drifted from the contractor request form");

assert.ok(searchSuggestions.inspector.length >= 5, "Inspector search lacks suggested queries");
assert.ok(searchSuggestions.contractor.length >= 5, "Contractor search lacks suggested queries");
assert.ok(expandedSearchTerms("inspector", "breaker box").includes("electrical panel"), "Inspector search synonym expansion is missing");
assert.ok(expandedSearchTerms("contractor", "quote").includes("estimate process"), "Contractor search synonym expansion is missing");
assert.deepEqual(dedupeSearchRecords([{ url: "/one/" }, { url: "/one/" }, { url: "/two/" }]).map((record) => record.url), ["/one/", "/two/"], "Search-result deduplication failed");
for (const source of [inspectorSource, contractorSource]) {
  assert.match(source, /Suggested searches/, "A site search dialog lacks suggested searches");
  assert.match(source, /search-recovery/, "A site search dialog lacks cross-service recovery");
  assert.match(source, /separationPolicy\.notice/, "A site search dialog lacks registry-backed separation context");
}

assert.deepEqual(evaluateContractorEligibility("no"), { state: "eligible", canPrepareOrdinaryRequest: true });
assert.deepEqual(evaluateContractorEligibility("yes"), { state: "blocked", canPrepareOrdinaryRequest: false });
assert.deepEqual(evaluateContractorEligibility("unsure"), { state: "manual-review", canPrepareOrdinaryRequest: false });
assert.deepEqual(evaluateContractorEligibility(""), { state: "validation-error", canPrepareOrdinaryRequest: false });
assert.deepEqual(evaluateContractorEligibility("unknown"), { state: "validation-error", canPrepareOrdinaryRequest: false });
assert.match(contractorSource, /Has C(?:&|&amp;)G prepared a home inspection report for this property during the previous 12 months\?/i, "Estimate eligibility question is missing");
assert.match(contractorSource, /Prepare eligibility review email/, "Manual eligibility-review state is missing");
assert.match(contractorSource, /separationPolicy\.blocked/, "Blocked independent-contractor message is not wired to the registry");
assert.match(separationPolicy.blocked, /independent contractor/i, "Blocked registry copy lacks the independent-contractor direction");
assert.equal(/inspection report.{0,120}(?:project category|estimate form).{0,120}(?:prefill|auto)/is.test(contractorSource), false, "Inspection report data appears to auto-populate a contracting request");
assert.equal(contractorRequestCategories.length, contractorServices.length + 1, "Contractor request category allowlist is incomplete");
assert.equal(new Set(contractorRequestCategories.map((category) => category.key)).size, contractorRequestCategories.length, "Contractor request category keys are not unique");
for (const category of contractorRequestCategories) {
  assert.equal(requestCategoryFromSearch(`?category=${encodeURIComponent(category.key)}`), category.key, `Allowed contractor category ${category.key} is not accepted`);
}
assert.equal(requestCategoryFromSearch(""), "", "A missing category query must remain empty");
assert.equal(requestCategoryFromSearch("?category=unknown-category"), "", "An unknown contractor category query was accepted");
assert.equal(requestCategoryFromSearch("?category=drywall-surface-repair&category=exterior-details"), "", "Duplicate contractor category queries were accepted");
assert.equal(requestCategoryFromSearch("?category=drywall-surface-repair&email=visitor%40example.com"), "", "A query containing personal data was accepted for category prefill");
assert.ok(contractorSource.indexOf("Eligibility comes first") < contractorSource.indexOf("Contact and property"), "Estimate flow does not present eligibility before contact and property details");
assert.match(contractorSource, /manualReviewFields/, "Limited manual eligibility-review fields are missing");
assert.match(contractorSource, /Nothing has been sent or received/, "Truthful mailto preparation status is missing");
assert.match(contractorSource, /id="inspection-eligibility"/, "The shared 12-month-rule anchor target is missing");
assert.match(contractorSource, /eligibility\.state === "validation-error"/, "The unanswered eligibility path has no visible validation action");
assert.match(contractorSource, /key=\{categoryKey \|\| "unclassified"\}/, "Category-query changes do not reset the estimate form state");
assert.match(contractorSource, /ProjectReadinessGuide/, "Contractor Services lacks the project-readiness guide");
assert.match(contractorSource, /mobile-conversion-rail/, "Contractor site lacks the mobile conversion rail");
assert.match(contractorSource, /Nothing is uploaded or sent while you use this guide/, "Project-readiness guide lacks local-only transport truth");

for (const site of [inspector, contractor]) {
  await stat(resolve(site, "dist/index.html"));
  await stat(resolve(site, "dist/404.html"));
  await stat(resolve(site, "dist/robots.txt"));
  await stat(resolve(site, "dist/sitemap.xml"));
}

const routeRecords = [
  ...enabledInspectorRoutes.map((route) => ({ route, publicPath: route.path, outputFile: routeFile(route.path), site: "inspector" })),
  ...enabledContractorRoutes.map((route) => ({ route, publicPath: contractorPublicPath(route.path), outputFile: contractorOutputFile(route.path), site: "contractor" })),
  { route: { key: "property-services", title: "Choose a C&G Service", description: "Choose C&G home inspection or residential contracting services." }, publicPath: "/property-services/", outputFile: "property-services/index.html", site: "portal" },
];

const titles = new Map();
const descriptions = new Map();
for (const record of routeRecords) {
  const filePath = resolve(output, record.outputFile);
  await stat(filePath);
  const html = await read(filePath);
  const visibleMarkup = html.replace(/<!--[\s\S]*?-->/g, "");
  const expectedUrl = `${expectedOrigin}${record.publicPath}`;
  const title = titleContent(html);
  const description = metaContent(html, "name", "description");
  assert.ok(title, `${record.outputFile} is missing a static title`);
  assert.ok(description, `${record.outputFile} is missing a meta description`);
  assert.equal(canonicalContent(html), expectedUrl, `${record.outputFile} has the wrong canonical URL`);
  assert.equal(metaContent(html, "property", "og:url"), expectedUrl, `${record.outputFile} has the wrong Open Graph URL`);
  assert.ok(metaContent(html, "property", "og:title"), `${record.outputFile} is missing an Open Graph title`);
  assert.ok(metaContent(html, "property", "og:description"), `${record.outputFile} is missing an Open Graph description`);
  assert.ok(metaContent(html, "property", "og:image"), `${record.outputFile} is missing an approved Open Graph image`);
  assert.ok(metaContent(html, "name", "twitter:title"), `${record.outputFile} is missing a Twitter title`);
  assert.ok(metaContent(html, "name", "twitter:description"), `${record.outputFile} is missing a Twitter description`);
  assert.ok(metaContent(html, "name", "twitter:image"), `${record.outputFile} is missing a Twitter image`);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${record.outputFile} must contain exactly one prerendered H1`);
  assert.ok(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().length > 500, `${record.outputFile} lacks substantive prerendered page text`);
  if (record.route?.noindex) {
    assert.equal(metaContent(html, "name", "robots"), "noindex,follow", `${record.outputFile} must remain noindex,follow while provisional`);
  } else {
    assert.equal(metaContent(html, "name", "robots"), undefined, `${record.outputFile} is accidentally noindex`);
  }
  assert.equal(titles.has(title), false, `${record.outputFile} duplicates the title from ${titles.get(title)}`);
  assert.equal(descriptions.has(description), false, `${record.outputFile} duplicates the description from ${descriptions.get(description)}`);
  titles.set(title, record.outputFile);
  descriptions.set(description, record.outputFile);

  const rawSchema = schemaContent(html);
  assert.ok(rawSchema, `${record.outputFile} is missing JSON-LD`);
  const schema = JSON.parse(rawSchema);
  const graph = schema["@graph"] || [];
  const webPage = graph.find((entry) => entry["@type"] === "WebPage");
  assert.equal(webPage?.url, expectedUrl, `${record.outputFile} JSON-LD URL is wrong`);
  assert.equal(JSON.stringify(schema).match(/aggregateRating|reviewRating|areaServed/g), null, `${record.outputFile} JSON-LD contains unapproved rating or area data`);
  if (record.site === "contractor") {
    assert.match(visibleMarkup, new RegExp(`CSLB #${business.contracting.license.number}`), `${record.outputFile} lacks the visible license number`);
    assert.match(visibleMarkup, new RegExp(escapeRegex(business.contracting.contractorOfRecord)), `${record.outputFile} lacks the visible contractor of record`);
    const website = graph.find((entry) => entry["@type"] === "WebSite");
    assert.equal(website?.name, business.contracting.publicName, `${record.outputFile} WebSite name is inconsistent`);
    assert.equal(webPage?.isPartOf?.["@id"], website?.["@id"], `${record.outputFile} WebPage points to a missing WebSite entity`);
    const contractorEntity = graph.find((entry) => entry["@type"] === "GeneralContractor");
    if (record.route.path === "/") {
      assert.ok(contractorEntity, `${record.outputFile} lacks the approved GeneralContractor entity`);
      assert.equal(contractorEntity.name, business.contracting.contractorOfRecord, `${record.outputFile} schema contractor-of-record name is wrong`);
      assert.equal(contractorEntity.alternateName, business.contracting.publicName, `${record.outputFile} schema public brand is wrong`);
      assert.equal(contractorEntity.description, business.contracting.publicBrandDisclosure, `${record.outputFile} schema disclosure is wrong`);
      assert.equal(contractorEntity.identifier?.propertyID, "CSLB", `${record.outputFile} schema license authority is wrong`);
      assert.equal(contractorEntity.identifier?.value, business.contracting.license.number, `${record.outputFile} schema license number is wrong`);
      assert.deepEqual(contractorEntity.sameAs, [business.contracting.license.officialLookupUrl], `${record.outputFile} schema official record is wrong`);
      assert.equal(webPage?.about?.["@id"], contractorEntity["@id"], `${record.outputFile} WebPage does not reference the contractor entity`);
    } else {
      assert.equal(contractorEntity, undefined, `${record.outputFile} duplicates the root-only GeneralContractor entity`);
    }
    if (record.route.key === "about") {
      assert.match(visibleMarkup, new RegExp(escapeRegex(escapeHtmlText(business.contracting.publicBrandDisclosure))), `${record.outputFile} lacks the approved public-brand disclosure`);
      assert.doesNotMatch(visibleMarkup, /awaits owner confirmation|confirm the appropriate legal business-name disclosure/i, `${record.outputFile} contains stale pending identity language`);
    }
  }
  if (record.route.article) {
    const article = graph.find((entry) => entry["@type"] === "Article");
    const resource = resourceBySlug.get(record.route.slug);
    assert.equal(article?.headline, resource.title, `${record.outputFile} Article headline is wrong`);
    assert.equal(article?.datePublished, resource.published, `${record.outputFile} Article publish date is wrong`);
    assert.equal(article?.dateModified, resource.modified, `${record.outputFile} Article modified date is wrong`);
    assert.equal(article?.mainEntityOfPage, expectedUrl, `${record.outputFile} Article canonical URL is wrong`);
    assert.ok(html.includes(resource.disclaimer), `${record.outputFile} lacks its educational disclaimer`);
    assert.ok(resource.related.length >= 2, `${record.outputFile} lacks at least two related-resource records`);
    for (const slug of resource.related) assert.ok(html.includes(`/resources/${slug}/`), `${record.outputFile} lacks related resource ${slug}`);
  }
  if (record.route.key === "faq") {
    const faq = graph.find((entry) => entry["@type"] === "FAQPage");
    const expectedCount = record.site === "inspector" ? inspectorFaqItems.length : contractorFaqs.length;
    assert.equal(faq?.mainEntity?.length, expectedCount, `${record.outputFile} FAQ schema does not match visible answers`);
  }
  if (record.route.path !== "/" && record.site !== "portal") {
    assert.ok(graph.some((entry) => entry["@type"] === "BreadcrumbList"), `${record.outputFile} lacks breadcrumb JSON-LD`);
    assert.match(html, /aria-label="Breadcrumb"/, `${record.outputFile} lacks a visible breadcrumb`);
  }
}

const rootSitemap = sitemapLocations(await read(resolve(output, "sitemap.xml")));
const contractorSitemap = sitemapLocations(await read(resolve(output, "contracting/sitemap.xml")));
const expectedRootSitemap = [
  ...enabledInspectorRoutes.filter((route) => route.sitemap !== false).map((route) => `${expectedOrigin}${route.path}`),
  `${expectedOrigin}/property-services/`,
];
const expectedContractorSitemap = enabledContractorRoutes
  .filter((route) => route.sitemap !== false)
  .map((route) => `${expectedOrigin}/contracting${route.path}`);
assert.deepEqual(rootSitemap, expectedRootSitemap, "Root sitemap does not exactly match enabled inspector and chooser routes");
assert.deepEqual(contractorSitemap, expectedContractorSitemap, "Contractor sitemap does not exactly match enabled contractor routes");
assert.equal(new Set(rootSitemap).size, rootSitemap.length, "Root sitemap contains duplicate routes");
assert.equal(new Set(contractorSitemap).size, contractorSitemap.length, "Contractor sitemap contains duplicate routes");
assert.equal(rootSitemap.some((url) => url.includes("/contracting/")), false, "Contractor routes leaked into the root sitemap");
assert.equal(contractorSitemap.some((url) => !url.startsWith(`${expectedOrigin}/contracting/`)), false, "Non-contractor route leaked into contractor sitemap");

const disabledInspectorRoutes = inspectorRoutes.filter((route) => !route.enabled);
const disabledContractorRoutes = contractorRoutes.filter((route) => !route.enabled);
const publicRouteMarkup = (await Promise.all(routeRecords.map((record) => read(resolve(output, record.outputFile))))).join("\n");
const publicJavaScriptFiles = (await listFiles(output)).filter((file) => file.endsWith(".js"));
const publicJavaScript = (await Promise.all(publicJavaScriptFiles.map(read))).join("\n");
const disabledSampleReportBundleStrings = getApprovedSampleReports().length
  ? []
  : [
      "sample-report-primary",
      "sampleReportPlaceholder",
      "Owner-review placeholder",
      "Owner-approved redacted example",
      "No fabricated inspection report is published here.",
      "Production navigation stays off until a PDF is approved",
      "Client and property identifiers must be removed before publication",
      "Open the redacted PDF",
      "/sample-report/",
      "Sample Home Inspection Report | C&G",
      "See how a C&G home inspection report organizes photographs, observations, limitations, and practical follow-up recommendations.",
      "Owner-approved, properly redacted sample report is required.",
    ];
const forbiddenProductionBundleStrings = [
  CONTENT_STATE.provisionalOwnerReview,
  CONTENT_STATE.legacyPendingOwnerConfirmation,
  "owner-review-banner",
  "provisional-label",
  "Legacy feedback pending owner confirmation",
  ownerReviewBannerCopy,
  preferredEmails.inspections,
  preferredEmails.contracting,
  preferredEmails.contact,
  provisionalBusinessDetails.sampleReportPlaceholder.title,
  provisionalBusinessDetails.sampleReportPlaceholder.copy,
  provisionalBusinessDetails.inspectorCertification.copy,
  provisionalBusinessDetails.insurance.copy,
  provisionalBusinessDetails.reportTurnaround.short,
  provisionalBusinessDetails.reportTurnaround.full,
  provisionalBusinessDetails.businessHours.weekdaysAndSaturday,
  provisionalBusinessDetails.businessHours.sunday,
  provisionalBusinessDetails.responseTime.copy,
  provisionalBusinessDetails.weekendAppointments.copy,
  ...legacyOwnerReviewSlots.map((review) => review.legacyText),
  ...disabledSampleReportBundleStrings,
].filter(Boolean);
if (OWNER_REVIEW_STAGING_VISIBLE) {
  for (const expected of [
    ownerReviewBannerCopy,
    legacyOwnerReviewSlots[0]?.legacyText,
    provisionalBusinessDetails.sampleReportPlaceholder.title,
    preferredEmails.inspections,
  ].filter(Boolean)) {
    assert.ok(publicJavaScript.includes(expected), `Owner-review staging bundle lost required registry content: ${expected}`);
  }
} else {
  for (const forbidden of forbiddenProductionBundleStrings) {
    assert.equal(publicJavaScript.includes(forbidden), false, `Production JavaScript bundle leaked owner-review content: ${forbidden}`);
  }
}
for (const record of routeRecords.filter((item) => item.site === "inspector")) {
  const html = await read(resolve(output, record.outputFile));
  assert.match(html, /href="\/contracting\/"/, `${record.outputFile} lacks the top-level contractor link`);
  assert.match(html, /12-month separation policy/, `${record.outputFile} lacks cross-service separation context`);
  assert.match(html, /data-pagefind-body="true"/, `${record.outputFile} lacks the inspector search body boundary`);
}
for (const record of routeRecords.filter((item) => item.site === "contractor")) {
  const html = await read(resolve(output, record.outputFile));
  assert.match(html, /href="\/"/, `${record.outputFile} lacks the reciprocal home-inspection link`);
  assert.match(html, /Separate service · 12-month rule/, `${record.outputFile} lacks cross-service separation context`);
  assert.match(html, /data-pagefind-body="true"/, `${record.outputFile} lacks the contractor search body boundary`);
}
for (const route of [...disabledInspectorRoutes, ...disabledContractorRoutes]) {
  assert.equal(rootSitemap.includes(`${expectedOrigin}${route.path}`) || contractorSitemap.includes(`${expectedOrigin}/contracting${route.path}`), false, `Disabled route ${route.path} leaked into a sitemap`);
  assert.equal(new RegExp(`href="[^"]*${escapeRegex(route.path)}"`).test(publicRouteMarkup), false, `Disabled route ${route.path} leaked into public navigation`);
}
if (getApprovedSampleReports().length) {
  await stat(resolve(output, "sample-report/index.html"));
} else if (OWNER_REVIEW_STAGING_VISIBLE) {
  const sampleReportHtml = await read(resolve(output, "sample-report/index.html"));
  assert.match(sampleReportHtml, /provisional|Owner review|pending redaction/i, "Owner-review sample-report page must remain labeled provisional");
  assert.equal(rootSitemap.includes(`${expectedOrigin}/sample-report/`), false, "Provisional sample-report must stay out of the production sitemap");
  assert.doesNotMatch(sampleReportHtml, /href="[^"]*\.pdf"/i, "Provisional sample-report must not link a PDF download");
} else {
  await assert.rejects(stat(resolve(output, "sample-report/index.html")), "Disabled sample report route was emitted");
}

for (const [file, route] of [["404.html", inspectorNotFoundRoute], ["contracting/404.html", contractorNotFoundRoute]]) {
  const html = await read(resolve(output, file));
  assert.match(html, /<meta name="robots" content="noindex,follow"/, `${file} must be noindex,follow`);
  assert.equal(titleContent(html), escapeHtmlText(route.title), `${file} has the wrong title`);
  assert.match(html, /<h1(?:\s|>)/, `${file} lacks the intended not-found experience`);
  assert.equal((html.match(/id="cg-page-schema"/g) || []).length, 1, `${file} must contain one JSON-LD script`);
  const schema = JSON.parse(schemaContent(html));
  const expected404Url = file === "404.html" ? `${expectedOrigin}/404.html` : `${expectedOrigin}/contracting/404.html`;
  assert.equal(schema["@graph"]?.find((entry) => entry["@type"] === "WebPage")?.url, expected404Url, `${file} JSON-LD URL is wrong`);
}

const legacyInspectorRoutes = ["", "services", "about", "areas", "faq", "resources", "contact"];
for (const route of legacyInspectorRoutes) {
  const html = await read(resolve(output, "inspections", route, "index.html"));
  assert.match(html, /Inspection page moved/, `Legacy /inspections/${route} redirect is missing`);
  assert.match(html, /location\.replace/, `Legacy /inspections/${route} redirect is not functional`);
  assert.match(html, /noindex,follow/, `Legacy /inspections/${route} redirect must remain noindex,follow`);
}

const assembledInspector = await read(resolve(output, "index.html"));
const assembledInspectorServices = await read(resolve(output, "services/index.html"));
const assembledInspectorAbout = await read(resolve(output, "about/index.html"));
const assembledInspectorContact = await read(resolve(output, "contact/index.html"));
const assembledContractor = await read(resolve(output, "contracting/index.html"));
const assembledContractorServices = await read(resolve(output, "contracting/services/index.html"));
const assembledEstimate = await read(resolve(output, "contracting/estimate/index.html"));
const assembledPortal = await read(resolve(output, "property-services/index.html"));
for (const [label, html] of [["inspector", assembledInspector], ["contractor", assembledContractor], ["chooser", assembledPortal]]) assert.ok(html.includes(separationPolicy.notice.replaceAll("&", "&amp;")), `${label} lacks the canonical separation notice`);
if (approvedReviews.length) {
  assert.match(assembledInspector, /Published with permission|review-section|review-copy/i, "Approved reviews did not render on the inspector home page");
} else if (OWNER_REVIEW_STAGING_VISIBLE && getLegacyOwnerReviewReviews("inspector-home").length) {
  assert.match(assembledInspector, /Legacy feedback pending owner confirmation|review-section|review-copy/i, "Owner-review legacy feedback did not render on the inspector home page");
  assert.doesNotMatch(assembledInspector, /Published with permission/i, "Legacy feedback must not use the production permission label");
  assert.doesNotMatch(assembledInspector, /itemprop="review"|reviewRating|"@type"\s*:\s*"Review"/i, "Legacy feedback must not emit Review schema");
} else {
  assert.equal(/Published with permission|review-section|review-copy|Legacy feedback pending owner confirmation/i.test(assembledInspector), false, "The inspector home page rendered a review before approval");
}
assert.equal(OWNER_REVIEW_STAGING_VISIBLE, /^(1|true|yes)$/i.test(String(process.env.VITE_OWNER_REVIEW_STAGING || process.env.OWNER_REVIEW_STAGING || "")), "OWNER_REVIEW_STAGING_VISIBLE must follow OWNER_REVIEW_STAGING / VITE_OWNER_REVIEW_STAGING and default off");
if (!OWNER_REVIEW_STAGING_VISIBLE) {
  for (const [label, html] of [
    ["inspector home", assembledInspector],
    ["inspector about", assembledInspectorAbout],
    ["inspector contact", assembledInspectorContact],
    ["contractor home", assembledContractor],
  ]) {
    assert.doesNotMatch(html, /owner-review-banner|provisional-label|Provisional biography|Legacy feedback pending owner confirmation|provisional_owner_review|within 24 hours|Monday through Saturday|inspections@cginspection\.net|contracting@cginspection\.net/i, `Production ${label} leaked owner-review staging content`);
    assert.doesNotMatch(html, /itemprop="review"|reviewRating|"@type"\s*:\s*"Review"|"@type"\s*:\s*"AggregateRating"/i, `Production ${label} must not emit Review or AggregateRating schema`);
  }
} else {
  assert.match(assembledInspector, /owner-review-banner|Owner review/i, "Staging inspector home should show the owner-review banner");
  assert.match(assembledContractor, /owner-review-banner|Owner review/i, "Staging contractor home should show the owner-review banner");
}
assert.match(assembledContractorServices, /id="project-readiness-guide"/, "Contractor Services lacks the prerendered readiness guide");
assert.match(assembledContractorServices, /id="request-worksheet"/, "Contractor Services lacks the printable request worksheet");
assert.match(assembledContractorServices, /Private planning tool/, "Contractor Services lacks the local-only planning context");
assert.match(assembledContractorServices, /Print blank worksheet/, "Contractor Services lacks the worksheet print action");
assert.ok(assembledEstimate.includes("previous 12 months"), "Contractor estimate path lacks the 12-month eligibility boundary");
assert.match(assembledEstimate, /First, confirm inspection eligibility|Eligibility comes first/, "Contractor estimate does not prerender the eligibility-first entry step");
assert.equal(/Full name/.test(assembledEstimate), false, "Contractor estimate prerender collects contact details before eligibility");
assert.match(assembledEstimate, /Nothing is uploaded or sent while you use this guide/, "Contractor estimate lacks first-step transport truth");
assert.match(assembledInspector, /Know what you’re/, "Inspector is not mounted at the site root");
assert.match(assembledContractor, /Practical repairs\. <em>Built to last\.<\/em>/, "Contractor is not mounted at /contracting/");
assert.match(assembledPortal, /Which service are/, "Property-services chooser is missing its single decision question");

const inspectorRequestActionIndex = assembledInspectorContact.indexOf('href="#inspection-request"');
const inspectorRequestTargetIndex = assembledInspectorContact.indexOf('id="inspection-request"');
assert.ok(inspectorRequestActionIndex >= 0 && inspectorRequestActionIndex < inspectorRequestTargetIndex, "Inspector Contact does not present Start request before the form target");
assert.equal([...assembledInspectorContact.matchAll(/id="inspection-request"/g)].length, 1, "Inspector Contact must render exactly one request target");
assert.match(assembledInspectorContact, /<form[^>]*aria-labelledby="inspection-request"/, "Inspector Contact form is not labeled by its visible request heading");
for (const legend of ["Contact", "Property", "Timing and context"]) assert.match(assembledInspectorContact, new RegExp(`<legend>${escapeRegex(legend)}<\\/legend>`), `Inspector Contact lacks the ${legend} form group`);
assert.equal(/<form[^>]*\saction=/i.test(assembledInspectorContact), false, "Inspector Contact unexpectedly posts to a server action");
assert.match(inspectorSource, /Nothing has been sent yet/, "Inspector Contact lacks truthful mailto preparation copy");
assert.match(inspectorSource, /errorSummaryRef\.current\?\.focus\(\)/, "Inspector Contact error summary no longer receives focus");
assert.match(inspectorSource, /href=\{`#inspection-\$\{field\}`\}/, "Inspector Contact error summary no longer links to invalid fields");
assert.match(inspectorSource, /onChange=\{handleChange\}/, "Inspector Contact does not clear stale prepared state after edits");
assert.match(inspectorSource, /name === "phone" && preferredContact === "phone"/, "Inspector Contact does not expose phone as conditionally required");

assert.equal(/Pending biography|modules remain hidden|years-of-experience modules/i.test(assembledInspectorAbout), false, "Inspector About exposes internal implementation-status copy");
assert.match(assembledInspectorAbout, /Clarence Gloss brings a practical, construction-informed perspective|That construction-informed perspective shapes both the on-site conversation/, "Inspector About lacks the approved construction-informed baseline");
assert.match(assembledInspectorAbout, /What clients can expect/, "Inspector About lacks the client-expectations section");
for (const expectation of ["Confirm the scope", "Inspect what is visible and accessible", "Make the report useful", "Review the next questions"]) assert.ok(assembledInspectorAbout.includes(expectation), `Inspector About lacks the ${expectation} expectation`);
assert.match(assembledInspectorAbout, /href="\/services\/"[^>]*>See What the Inspection Covers/, "Inspector About lacks its Services pathway");
assert.match(assembledInspectorAbout, /href="\/ethics\/"[^>]*>Read the independence policy/, "Inspector About lacks its Ethics pathway");

const contractorDirectoryActionIndex = assembledContractorServices.indexOf('href="/contracting/services/#service-directory"');
const contractorDirectoryTargetIndex = assembledContractorServices.indexOf('id="service-directory"');
assert.ok(contractorDirectoryActionIndex >= 0 && contractorDirectoryActionIndex < contractorDirectoryTargetIndex, "Contractor Services does not present Choose a category before the directory target");
assert.equal([...assembledContractorServices.matchAll(/id="service-directory"/g)].length, 1, "Contractor Services must render exactly one directory target");
assert.match(assembledContractorServices, /<nav[^>]*class="service-directory-grid"[^>]*aria-labelledby="service-directory"/, "Contractor Services category directory lacks its accessible label");
assert.match(assembledContractorServices, /href="\/contracting\/projects\/"[^>]*>See illustrated project types/, "Contractor Services lacks its Project Types pathway");
assert.match(assembledContractorServices, /href="\/contracting\/estimate\/\?category=other-or-not-sure"[^>]*>Start without choosing a category/, "Contractor Services lacks its uncertain-category estimate pathway");
assert.match(assembledContractorServices, /href="\/contracting\/estimate\/"[^>]*>Review eligibility/, "Contractor Services hero lacks its eligibility pathway");
assert.match(contractorSource, /window\.location\.hash\.slice\(1\)/, "Contractor router does not restore fragment targets from browser history");
assert.match(contractorSource, /target\?\.scrollIntoView\(\)/, "Contractor router does not scroll restored fragment targets into view");
assert.match(contractorSource, /target\?\.focus\(\{ preventScroll: true \}\)/, "Contractor router does not restore focus to fragment targets");
assert.match(contractorSource, /if \(target\) \{\s*target\.scrollIntoView\(\);\s*target\.focus\(\{ preventScroll: true \}\);\s*\} else document\.getElementById\("main-content"\)/, "Contractor route focus can override a restored fragment target");
for (const service of contractorServices) {
  const directoryLinks = [...assembledContractorServices.matchAll(new RegExp(`href="/contracting/services/#${escapeRegex(service.id)}"`, "g"))];
  const detailTargets = [...assembledContractorServices.matchAll(new RegExp(`id="${escapeRegex(service.id)}"`, "g"))];
  assert.equal(directoryLinks.length, 1, `Contractor Services must render exactly one directory link for ${service.title}`);
  assert.equal(detailTargets.length, 1, `Contractor Services must render exactly one detail target for ${service.title}`);
  assert.ok(directoryLinks[0].index < detailTargets[0].index, `Contractor Services directory link must precede the ${service.title} detail target`);
  assert.match(assembledContractorServices, new RegExp(`aria-labelledby="${escapeRegex(service.id)}-title"`), `${service.title} detail target lacks an accessible label`);
}

assert.match(assembledInspectorServices, /data-scope-atlas="true"/, "Inspector Services lacks the visual scope atlas");
assert.match(assembledInspectorServices, /Editorial illustrations · not C&amp;G client photography|Representative editorial imagery; not C&amp;G client or project photography\./, "Inspector Services lacks the editorial-image disclosure");
assert.equal(enabledInspectionScope.length, 19, "Inspector scope registry does not contain the expected enabled sections");
for (const section of enabledInspectionScope) {
  assert.ok(assembledInspectorServices.includes(escapeHtmlText(section.title)), `Inspector Services did not render ${section.title}`);
  assert.match(assembledInspectorServices, new RegExp(`id="${escapeRegex(section.id)}"`), `Inspector Services lacks the ${section.id} detail target`);
  assert.match(assembledInspectorServices, new RegExp(`href="#${escapeRegex(section.id)}"`), `Inspector Services atlas lacks a link to ${section.id}`);
}
assert.equal(/Optional pool and spa service/i.test(assembledInspectorServices), false, "Pending pool/spa service leaked into Inspector Services");

for (const image of ["attic-inspection.jpg", "report-laptop.jpg"]) {
  const provenance = imageProvenance.find((record) => basename(record.file) === image);
  assert.ok(provenance?.approvedFor.includes("inspector-services"), `${image} is not approved for inspector-services`);
}

const approvedInspectorAreas = approvedServiceAreas("Inspector").map((area) => area.label);
const approvedContractorAreas = approvedServiceAreas("Contractor").map((area) => area.label);
assert.equal(new Set(approvedInspectorAreas).size, approvedInspectorAreas.length, "Inspector service-area labels are duplicated");
assert.equal(new Set(approvedContractorAreas).size, approvedContractorAreas.length, "Contractor service-area labels are duplicated");
for (const area of serviceAreas.filter((item) => item.status !== "approved")) {
  assert.equal(new RegExp(`\\b${escapeRegex(area.label)}\\b`, "i").test(publicRouteMarkup), false, `Unapproved service area rendered publicly: ${area.label}`);
}
if (!serviceAreas.some((area) => area.status === "approved" && /Los Angeles/i.test(area.label))) {
  assert.equal(/\bLos Angeles area\b/i.test(publicRouteMarkup), false, "Unapproved Los Angeles-area wording rendered publicly");
}

const placeholderPatterns = [/\bTODO\b/, /\bTBD\b/, /lorem ipsum/i, /\[city\]/i, /\[insert[^\]]*\]/i, /555[-.) ]?\d{3}[- ]?\d{4}/];
for (const pattern of placeholderPatterns) assert.equal(pattern.test(publicRouteMarkup), false, `Public output contains placeholder content: ${pattern}`);
if (
  formTransportFor("inspector-contact")?.provider === "mailto"
  && formTransportFor("contractor-estimate")?.provider === "mailto"
) assert.equal(/(?:form|request|message) (?:was|has been) sent/i.test(publicRouteMarkup), false, "Public mailto flow falsely claims server receipt");
assert.equal(/(?:same-day|next-day) reports? (?:are )?(?:available|guaranteed)|free (?:estimate|site visit)s? (?:are )?(?:available|included)|emergency service (?:is )?available/i.test(publicRouteMarkup), false, "Public output contains an unsupported schedule, price, or emergency promise");
assert.ok(contractorSource.includes("Nothing has been sent or received"), "Mailto transport truth is missing from the eligible state");
if (formTransportFor("contractor-estimate")?.provider === "mailto") {
  assert.ok(assembledEstimate.includes("Nothing is uploaded or sent"), "Estimate submit control lacks mailto transport truth");
} else {
  assert.ok(assembledEstimate.includes("Send request securely"), "Approved contractor processor lacks secure submit copy");
}
if (!approvedReviews.length) {
  assert.equal(/itemprop="review"|reviewRating|"@type"\s*:\s*"Review"/i.test(publicRouteMarkup), false, "Unapproved production Review schema rendered publicly");
  assert.equal(getApprovedReviews("inspector-home", now).length, 0, "Production review gate must stay empty while legacy feedback is pending");
}
if (!integrationCanRender(integrations.booking, now)) assert.equal(/calendly/i.test(publicRouteMarkup), false, "A pending booking provider leaked into public output");
if (
  !integrationCanRender(integrations.secureInspectionFormTransport, now)
  && !integrationCanRender(integrations.secureContractorFormTransport, now)
) assert.equal(/formspree|typeform|jotform/i.test(publicRouteMarkup), false, "A pending form provider leaked into public output");
if (!integrationCanRender(integrations.maps, now)) assert.equal(/google\.com\/maps\/embed/i.test(publicRouteMarkup), false, "A pending map provider leaked into public output");
if (!integrationCanRender(integrations.reviews, now)) assert.equal(/review-widget/i.test(publicRouteMarkup), false, "A pending review provider leaked into public output");
if (!integrationCanRender(integrations.analytics, now)) assert.equal(/googletagmanager|google-analytics|plausible\.io|cdn\.usefathom/i.test(publicRouteMarkup), false, "A pending analytics provider leaked into public output");

for (const [surface, routes] of [["inspector", enabledInspectorRoutes], ["contractor", enabledContractorRoutes]]) {
  const expectedCount = routes.filter((route) => !route.noindex).length;
  const directory = resolve(output, "pagefind", surface);
  await stat(resolve(directory, "pagefind.js"));
  await stat(resolve(directory, "pagefind-entry.json"));
  const fragments = (await readdir(resolve(directory, "fragment"))).filter((file) => file.endsWith(".pf_fragment"));
  assert.equal(fragments.length, expectedCount, `Pagefind ${surface} index does not exactly match crawlable enabled routes`);
}
assert.equal(integrations.siteSearch.publicConfig.inspectorBundle, "/pagefind/inspector/pagefind.js", "Inspector Pagefind bundle path drifted");
assert.equal(integrations.siteSearch.publicConfig.contractorBundle, "/pagefind/contractor/pagefind.js", "Contractor Pagefind bundle path drifted");

assert.ok(contractorServices.length >= 7, "Contractor service registry is incomplete");
for (const service of contractorServices) {
  assert.ok(service.examples.length >= 4, `${service.title} lacks detailed examples`);
  assert.ok(service.boundaries.length >= 3, `${service.title} lacks detailed boundaries`);
  assert.ok(publicRouteMarkup.includes(service.title), `${service.title} did not render`);
  assert.match(publicRouteMarkup, new RegExp(`\\?category=${escapeRegex(service.id)}`), `${service.title} lacks a category-aware estimate link`);
}
assert.ok(inspectorFaqItems.length >= 20, "Inspector FAQ registry is incomplete");
assert.ok(contractorFaqs.length >= 15, "Contractor FAQ registry is incomplete");

const provenanceByBasename = new Map(imageProvenance.map((record) => [basename(record.file), record]));
const approvedClientPhotosByPublicPath = new Map(
  getAllApprovedClientProjectPhotos(now).map((record) => [record.publicPath, record]),
);
for (const record of imageProvenance) {
  assert.equal(record.status, "approved", `Pending image ${record.id} is registered for production`);
  assert.ok(record.source && record.licenseOrPermission && record.approvedAt, `Image ${record.id} lacks complete provenance fields`);
  assert.equal(record.depictsActualClientWork, false, `Editorial image ${record.id} must not claim client work`);
  const { size } = await stat(resolve(root, record.file));
  assert.ok(size < 450_000, `${record.file} exceeds the 450 KB editorial image budget`);
}

assert.equal(Object.keys(responsiveEditorialImages).length, imageProvenance.length, "Responsive-image registry does not cover every approved editorial image");
assert.deepEqual(responsiveImageWidths, [640, 960, 1440], "Responsive-image width contract drifted");
for (const image of Object.values(responsiveEditorialImages)) {
  assert.equal(image.classification, "generated_editorial", `${image.id} responsive variants changed the source classification`);
  assert.equal(image.depictsActualClientWork, false, `${image.id} responsive variants imply actual client work`);
  const sourceRoot = image.surface === "contractor" ? resolve(contractor, "public") : resolve(inspector, "public");
  const outputRoot = image.surface === "contractor" ? resolve(output, "contracting") : output;
  for (const format of ["avif", "webp"]) {
    assert.deepEqual(image.variants[format].map((variant) => variant.width), responsiveImageWidths, `${image.id} ${format} widths are incomplete`);
    for (const variant of image.variants[format]) {
      const sourceStats = await stat(resolve(sourceRoot, variant.path));
      const outputStats = await stat(resolve(outputRoot, variant.path));
      assert.ok(sourceStats.size > 0, `${image.id} ${format} source variant is empty`);
      assert.equal(outputStats.size, sourceStats.size, `${image.id} ${format} variant changed during assembly`);
    }
  }
}
for (const [site, fontFiles] of [
  ["inspector", ["dm-sans-variable.woff2", "libre-baskerville-variable.woff2", "libre-baskerville-italic-variable.woff2"]],
  ["contractor", ["dm-sans-variable.woff2", "newsreader-variable.woff2"]],
]) {
  const sourceRoot = site === "inspector" ? resolve(inspector, "public/assets/fonts") : resolve(contractor, "public/assets/fonts");
  const outputRoot = site === "inspector" ? resolve(output, "assets/fonts") : resolve(output, "contracting/assets/fonts");
  for (const font of fontFiles) {
    const sourceStats = await stat(resolve(sourceRoot, font));
    const outputStats = await stat(resolve(outputRoot, font));
    assert.ok(sourceStats.size > 0, `${site} font ${font} is empty`);
    assert.equal(outputStats.size, sourceStats.size, `${site} font ${font} changed during assembly`);
  }
}
assert.equal(/fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(allSource), false, "A production stylesheet still requests third-party fonts");
assert.match(assembledInspector, /<source type="image\/avif"[^>]*srcSet="\/assets\/optimized\/hero-inspector-/, "Inspector hero lacks AVIF responsive sources");
assert.match(assembledInspector, /<source type="image\/webp"[^>]*srcSet="\/assets\/optimized\/hero-inspector-/, "Inspector hero lacks WebP responsive sources");
assert.match(assembledContractor, /<source type="image\/avif"[^>]*srcSet="\/contracting\/assets\/optimized\/contractor-hero-/, "Contractor hero lacks AVIF responsive sources");
assert.match(assembledContractor, /<source type="image\/webp"[^>]*srcSet="\/contracting\/assets\/optimized\/contractor-hero-/, "Contractor hero lacks WebP responsive sources");

for (const record of routeRecords) {
  const html = await read(resolve(output, record.outputFile));
  for (const match of html.matchAll(/<img\s+([^>]+)>/g)) {
    const attributes = match[1];
    const source = attributes.match(/src="([^"]+)"/)?.[1] || "";
    const alt = attributes.match(/alt="([^"]*)"/)?.[1];
    assert.notEqual(alt, undefined, `${record.outputFile} image ${source} lacks alt text`);
    assert.match(attributes, /width="\d+"/, `${record.outputFile} image ${source} lacks width`);
    assert.match(attributes, /height="\d+"/, `${record.outputFile} image ${source} lacks height`);
    if (source.startsWith("/contracting/assets/projects/")) {
      const approvedPhoto = approvedClientPhotosByPublicPath.get(source);
      assert.ok(approvedPhoto, `${record.outputFile} client-project image ${source} lacks an approved publication record`);
      assert.ok(alt, `${record.outputFile} client-project image ${source} has empty alt text`);
    } else if (/\.(?:jpg|jpeg)$/i.test(source)) {
      const provenance = provenanceByBasename.get(basename(source));
      assert.ok(provenance, `${record.outputFile} image ${source} lacks a provenance record`);
      assert.equal(provenance.status, "approved", `${record.outputFile} image ${source} is not approved`);
      assert.ok(alt, `${record.outputFile} informative image ${source} has empty alt text`);
    }
  }
}
assert.match(await read(resolve(output, "contracting/projects/index.html")), /not photographs of client work|not photographs of completed C&amp;G client projects/i, "Illustrative project page lacks the required disclosure");

const inspectorPrivacy = await read(resolve(output, "privacy/index.html"));
const contractorPrivacy = await read(resolve(output, "contracting/privacy/index.html"));
assert.match(inspectorPrivacy, /No analytics provider/i, "Inspector privacy does not match the disabled analytics state");
assert.match(contractorPrivacy, /No analytics provider/i, "Contractor privacy does not match the disabled analytics state");
assert.match(inspectorPrivacy, /GitHub Pages/i, "Inspector privacy lacks the actual static host");
assert.match(contractorPrivacy, /GitHub Pages/i, "Contractor privacy lacks the actual static host");

assert.match(await read(resolve(output, "robots.txt")), new RegExp(`Sitemap: ${escapeRegex(expectedOrigin)}/sitemap\\.xml`), "Root robots.txt has the wrong sitemap");
assert.match(await read(resolve(output, "robots.txt")), new RegExp(`Sitemap: ${escapeRegex(expectedOrigin)}/contracting/sitemap\\.xml`), "Root robots.txt does not advertise the contractor sitemap");
assert.match(await read(resolve(output, "contracting/robots.txt")), new RegExp(`Sitemap: ${escapeRegex(expectedOrigin)}/contracting/sitemap\\.xml`), "Contractor robots.txt has the wrong sitemap");

console.log(`PASS: verified ${routeRecords.length} enabled routes, ${enabledInspectorRoutes.length} inspector entries, ${enabledContractorRoutes.length} contractor entries, ${imageProvenance.length} image records, eligibility guards, structured data, sitemaps, forms, privacy truth, and legacy redirects.`);
