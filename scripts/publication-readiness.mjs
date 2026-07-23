import {
  claimIsApproved,
  claims,
  integrationCanRender,
  integrations,
  serviceAreas,
} from "../shared/siteData.js";
import {
  getApprovedReviews,
  getLegacyOwnerReviewReviews,
  reviewSlots,
} from "../shared/reviewRegistry.js";
import {
  CONTENT_STATE,
  OWNER_REVIEW_STAGING_VISIBLE,
  photographyReplacementSlots,
  preferredEmails,
  provisionalBusinessDetails,
  typicalContractorProjects,
} from "../shared/ownerReview.js";
import {
  clientProjectPhotoSlots,
  getApprovedSampleReports,
  getApprovedServiceAreaPages,
  projectCaseStudySlots,
  sampleReportRegistry,
} from "../shared/publicationRegistry.js";

const now = new Date();
const publicIdentitySurfaces = ["inspector", "contractor", "portal"];
const pendingIntegrations = Object.entries(integrations)
  .filter(([, integration]) => !integrationCanRender(integration, now))
  .map(([id, integration]) => ({
    id,
    gate: integration.ownerGate || "approval and public configuration",
  }));

const report = {
  generatedAt: now.toISOString(),
  publicationCritical: {
    contractorLicenseCurrent: publicIdentitySurfaces.every((surface) =>
      claimIsApproved(claims.contractorLicense, now)
      && claims.contractorLicense.allowedSurfaces.includes(surface)),
    contractorPublicNameApproved:
      claims.contractorPublicName.publicCopy
      && publicIdentitySurfaces.every((surface) =>
        claimIsApproved(claims.contractorPublicName, now)
        && claims.contractorPublicName.allowedSurfaces.includes(surface)),
  },
  publicReady: {
    reviews: getApprovedReviews("inspector-home", now).length,
    sampleReports: getApprovedSampleReports(undefined, now).length,
    clientProjectPhotos: clientProjectPhotoSlots.filter((slot) => slot.status === "approved").length,
    projectCaseStudies: projectCaseStudySlots.filter((slot) => slot.status === "approved").length,
    inspectorServiceAreaPages: getApprovedServiceAreaPages("Inspector", now).length,
    contractorServiceAreaPages: getApprovedServiceAreaPages("Contractor", now).length,
  },
  ownerReviewStaging: {
    stagingVisible: OWNER_REVIEW_STAGING_VISIBLE,
    defaultsOffForProduction: true,
    legacyReviewsRegistered: reviewSlots.filter((review) => review.status === CONTENT_STATE.legacyPendingOwnerConfirmation).length,
    legacyReviewsVisible: getLegacyOwnerReviewReviews("inspector-home").length,
    provisionalClaims: Object.values(claims).filter((claim) => claim.status === CONTENT_STATE.provisionalOwnerReview).length,
    preferredEmailsStatus: preferredEmails.status,
    typicalProjectsStatus: typicalContractorProjects.status,
    photographySlotsDocumented: photographyReplacementSlots.length,
    sampleReportPlaceholder: provisionalBusinessDetails.sampleReportPlaceholder.status,
  },
  capacity: {
    reviewSlots: reviewSlots.length,
    sampleReportSlots: sampleReportRegistry.length,
    clientProjectPhotoSlots: clientProjectPhotoSlots.length,
    projectCaseStudySlots: projectCaseStudySlots.length,
    serviceAreaRecords: serviceAreas.length,
  },
  ownerPending: {
    claims: Object.entries(claims)
      .filter(([, claim]) => !claimIsApproved(claim, now))
      .map(([id, claim]) => ({ id, status: claim.status, evidenceType: claim.evidenceType })),
    integrations: pendingIntegrations,
    serviceAreas: serviceAreas
      .filter((area) => area.status !== "approved")
      .map((area) => ({
        id: area.id,
        label: area.label,
        status: area.status,
      })),
  },
};

console.log(JSON.stringify(report, null, 2));

if (process.argv.includes("--require-all")) {
  const pendingCount = Object.values(report.ownerPending).reduce((sum, records) => sum + records.length, 0);
  const emptyProofSurfaces = Object.values(report.publicReady).filter((count) => count === 0).length;
  if (pendingCount || emptyProofSurfaces) process.exitCode = 1;
}

if (
  process.argv.includes("--require-publication")
  && Object.values(report.publicationCritical).some((ready) => ready !== true)
) process.exitCode = 1;
