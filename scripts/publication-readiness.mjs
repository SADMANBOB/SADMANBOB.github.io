import {
  claimIsApproved,
  claims,
  integrationCanRender,
  integrations,
  serviceAreas,
} from "../shared/siteData.js";
import {
  getApprovedReviews,
  reviewSlots,
} from "../shared/reviewRegistry.js";
import {
  clientProjectPhotoSlots,
  getAllApprovedClientProjectPhotos,
  getApprovedProjectCaseStudies,
  getApprovedSampleReports,
  getApprovedServiceAreaPages,
  projectCaseStudySlots,
  sampleReportRegistry,
  serviceAreaPageIsApproved,
} from "../shared/publicationRegistry.js";

const now = new Date();
const pendingIntegrations = Object.entries(integrations)
  .filter(([, integration]) => !integrationCanRender(integration, now))
  .map(([id, integration]) => ({
    id,
    gate: integration.ownerGate || "approval and public configuration",
  }));

const report = {
  generatedAt: now.toISOString(),
  publicationCritical: {
    contractorLicenseCurrent: claimIsApproved(claims.contractorLicense, now),
    contractorPublicNameApproved: claimIsApproved(claims.contractorPublicName, now),
  },
  publicReady: {
    reviews: getApprovedReviews("inspector-home", now).length,
    sampleReports: getApprovedSampleReports(undefined, now).length,
    clientProjectPhotos: getAllApprovedClientProjectPhotos(now).length,
    projectCaseStudies: getApprovedProjectCaseStudies(undefined, now).length,
    inspectorServiceAreaPages: getApprovedServiceAreaPages("Inspector", now).length,
    contractorServiceAreaPages: getApprovedServiceAreaPages("Contractor", now).length,
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
      .map(([id, claim]) => ({ id, evidenceType: claim.evidenceType })),
    integrations: pendingIntegrations,
    serviceAreas: serviceAreas
      .filter((area) =>
        !serviceAreaPageIsApproved(area, "Inspector", now)
        || !serviceAreaPageIsApproved(area, "Contractor", now))
      .map((area) => ({
        id: area.id,
        label: area.label,
        status: area.status,
        inspectorPageReady: serviceAreaPageIsApproved(area, "Inspector", now),
        contractorPageReady: serviceAreaPageIsApproved(area, "Contractor", now),
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
