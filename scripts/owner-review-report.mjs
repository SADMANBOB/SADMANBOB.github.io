import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  claims,
  claimIsApproved,
  serviceAreas,
} from "../shared/siteData.js";
import {
  getApprovedReviews,
  getLegacyOwnerReviewReviews,
  reviewSlots,
} from "../shared/reviewRegistry.js";
import {
  CONTENT_STATE,
  photographyReplacementSlots,
  preferredEmails,
  provisionalBusinessDetails,
  typicalContractorProjects,
} from "../shared/ownerReview.js";
import {
  getApprovedSampleReports,
  getApprovedServiceAreaPages,
} from "../shared/publicationRegistry.js";

const now = new Date();
const legacyReviews = getLegacyOwnerReviewReviews("inspector-home");
const provisionalClaims = Object.entries(claims)
  .filter(([, claim]) => claim.status === CONTENT_STATE.provisionalOwnerReview)
  .map(([id, claim]) => ({
    id,
    status: claim.status,
    draftCopy: claim.draftCopy || claim.draftFull || claim.draftShort || null,
    productionVisible: claim.productionVisible !== false,
  }));

const report = {
  generatedAt: now.toISOString(),
  title: "C&G owner-review staging report",
  stagingIsolation: {
    flagDefaultsOff: true,
    enableLocally: "OWNER_REVIEW_STAGING=1 VITE_OWNER_REVIEW_STAGING=1 npm run build:owner-review",
    productionSafeBuild: "npm run build",
    confirmAbsentFromProduction: [
      "Run npm run build with staging unset (default).",
      "Confirm _site/index.html and _site/contracting/index.html omit owner-review-banner, provisional-label, legacy feedback, preferred domain emails, and sample-report.",
      "Confirm _site/sitemap.xml omits /sample-report/.",
      "Run npm run verify (production-safe) and expect OWNER_REVIEW_STAGING_VISIBLE=false isolation asserts to pass.",
    ],
    promoteAfterOwnerApproval: [
      "Move approved claim status to approved / verified with evidence fields filled.",
      "Promote individual legacy reviews to status=approved with exactApprovedText, publicationPermissionAt, allowedSurfaces, and displayAttribution.",
      "Approve customerTestimonials claim only after reviews are source-backed.",
      "Add redacted sample PDF to the sample-report registry and set status=approved.",
      "Switch public email only after preferred domain mailboxes are confirmed operational.",
      "Keep infrared/moisture claims productionVisible:false unless intentionally published.",
    ],
    disableBeforeDeploy: "Unset OWNER_REVIEW_STAGING and VITE_OWNER_REVIEW_STAGING (or set them to 0). Deploy only from a production-safe npm run build / npm run release:verify on main.",
    localReviewCommand: "OWNER_REVIEW_STAGING=1 VITE_OWNER_REVIEW_STAGING=1 npm run build && cd _site && python3 -m http.server 4177",
  },
  summary: {
    stagingVisibleDuringReport: true,
    verifiedServiceAreas: serviceAreas.filter((area) => area.status === "approved" && area.contentState === "verified").map((area) => area.id),
    productionApprovedReviews: getApprovedReviews("inspector-home", now).length,
    legacyReviewsVisibleInStaging: legacyReviews.length,
    provisionalClaims: provisionalClaims.length,
    inspectorAreaPages: getApprovedServiceAreaPages("Inspector", now).length,
    contractorAreaPages: getApprovedServiceAreaPages("Contractor", now).length,
    approvedSampleReports: getApprovedSampleReports(undefined, now).length,
  },
  verified: {
    serviceAreas: serviceAreas
      .filter((area) => area.status === "approved")
      .map((area) => ({
        id: area.id,
        label: area.label,
        communities: area.communities,
        inspectorPage: Boolean(area.inspectorPage),
        contractorPage: Boolean(area.contractorPage),
      })),
    contractorLicense: claimIsApproved(claims.contractorLicense, now),
    contractorPublicName: claimIsApproved(claims.contractorPublicName, now),
  },
  legacyPendingOwnerConfirmation: {
    reviewClaimStatus: claims.customerTestimonials.status,
    reviews: legacyReviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      initials: review.initials,
      role: review.role,
      location: review.location,
      text: review.text,
    })),
    remainingEmptySlots: reviewSlots.filter((slot) => slot.status === "pending").length,
  },
  provisionalOwnerReview: {
    businessDetails: provisionalBusinessDetails,
    preferredEmails,
    typicalContractorProjects,
    claims: provisionalClaims,
    photographyReplacementSlots,
    sampleReportPlaceholder: provisionalBusinessDetails.sampleReportPlaceholder,
  },
  productionGatesStillClosed: [
    "getApprovedReviews remains empty until status=approved + customerTestimonials claim approved",
    "claimIsApproved ignores provisional_owner_review and legacy_pending_owner_confirmation",
    "sampleReportIsApproved remains false until a redacted PDF record is approved",
    "secure form transports remain mailto until HTTPS endpoints are approved",
    "preferred domain emails are provisional; Gmail remains the live public fallback",
  ],
  ownerApprovalChecklist: [
    "Confirm LA County and Riverside County wording and community lists",
    "Approve or revise each of the 20 legacy feedback entries",
    "Approve report turnaround, hours, weekend, and response-time wording",
    "Supply credential organization/number/URL or keep credentials unpublished",
    "Supply insurance wording with evidence or keep insurance unpublished",
    "Approve or revise Clarence biography",
    "Decide pool/spa, manufactured homes, moisture meters, and infrared publication",
    "Provide redacted sample-report PDF",
    "Confirm domain email addresses are operational before switching from Gmail",
    "Approve HTTPS form processor endpoint and privacy policy",
    "Replace editorial photography using documented slots",
    "Approve typical contractor project category list",
  ],
};

const outputPath = resolve(import.meta.dirname, "..", "OWNER_REVIEW_STAGING_REPORT.json");
const markdownPath = resolve(import.meta.dirname, "..", "OWNER_REVIEW_STAGING_REPORT.md");

const markdown = `# C&G owner-review staging report

Generated: ${report.generatedAt}

## Operating instructions

### Enable owner-review staging locally

\`\`\`bash
OWNER_REVIEW_STAGING=1 VITE_OWNER_REVIEW_STAGING=1 npm run build:owner-review
# or
npm run build:owner-review
\`\`\`

Serve the assembled site:

\`\`\`bash
${report.stagingIsolation.localReviewCommand}
\`\`\`

Then open http://127.0.0.1:4177/

### Produce a production-safe build

\`\`\`bash
# Staging must be unset / not 1|true|yes
npm run build
\`\`\`

\`OWNER_REVIEW_STAGING_VISIBLE\` defaults **off**. Do not leave staging env vars set in CI or deploy scripts.

### Confirm staging content is absent from production output

1. Build with staging unset.
2. Confirm \`_site/index.html\` and \`_site/contracting/index.html\` omit \`owner-review-banner\`, \`provisional-label\`, legacy feedback copy, preferred domain emails, and the sample-report route.
3. Confirm \`_site/sitemap.xml\` does not list \`/sample-report/\`.
4. Run \`npm run verify\` and expect the production isolation asserts to pass.

### Promote individual claims and reviews after owner approval

${report.stagingIsolation.promoteAfterOwnerApproval.map((item, index) => `${index + 1}. ${item}`).join("\n")}

### Disable staging mode before deployment

${report.stagingIsolation.disableBeforeDeploy}

## Summary

- Staging visible while generating this report: yes (report script forces staging on)
- Verified service areas: ${report.summary.verifiedServiceAreas.join(", ") || "none"}
- Production-approved reviews: ${report.summary.productionApprovedReviews}
- Legacy reviews shown in staging: ${report.summary.legacyReviewsVisibleInStaging}
- Provisional claims: ${report.summary.provisionalClaims}
- Inspector area pages: ${report.summary.inspectorAreaPages}
- Contractor area pages: ${report.summary.contractorAreaPages}

## Verified geography

${report.verified.serviceAreas.map((area) => `- **${area.label}** (\`${area.id}\`) — ${area.communities.length} representative communities`).join("\n")}

## Legacy feedback pending confirmation

Status on every imported review: \`${CONTENT_STATE.legacyPendingOwnerConfirmation}\`

${legacyReviews.map((review, index) => `${index + 1}. ${review.rating}/5 — ${review.initials}, ${review.role}, ${review.location}\n   > ${review.text}`).join("\n\n")}

## Provisional business details requiring approval

${provisionalClaims.map((claim) => `- \`${claim.id}\`${claim.productionVisible ? "" : " (hidden from ordinary production surfaces)"}: ${claim.draftCopy || "(structured draft only)"}`).join("\n")}

### Preferred emails (provisional)

- ${preferredEmails.inspections}
- ${preferredEmails.contracting}
- ${preferredEmails.contact}

${preferredEmails.note}

## Production gates that remain closed

${report.productionGatesStillClosed.map((item) => `- ${item}`).join("\n")}

## Owner approval checklist

${report.ownerApprovalChecklist.map((item, index) => `${index + 1}. ${item}`).join("\n")}
`;

await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(markdownPath, markdown);
console.log(JSON.stringify({ json: outputPath, markdown: markdownPath, summary: report.summary }, null, 2));
