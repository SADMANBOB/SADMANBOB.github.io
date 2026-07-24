/**
 * Owner-review staging content.
 *
 * Content states used across the repository:
 * - verified: confirmed facts (published through normal approved gates)
 * - legacy_pending_owner_confirmation: imported from the old site, not independently verified
 * - provisional_owner_review: draft language for staging completeness; not production-approved
 *
 * Production helpers (claimIsApproved, getApprovedReviews, sampleReportIsApproved, etc.)
 * must continue to ignore provisional and legacy records.
 *
 * OWNER_REVIEW_STAGING_VISIBLE defaults OFF for production-safe builds.
 * Enable explicitly with OWNER_REVIEW_STAGING=1 or VITE_OWNER_REVIEW_STAGING=1.
 */

export const CONTENT_STATE = Object.freeze({
  verified: "verified",
  legacyPendingOwnerConfirmation: "legacy_pending_owner_confirmation",
  provisionalOwnerReview: "provisional_owner_review",
});

const readStagingFlag = () => {
  const fromImportMeta =
    typeof import.meta !== "undefined"
    && import.meta.env
    && import.meta.env.VITE_OWNER_REVIEW_STAGING;
  const fromProcess =
    typeof process !== "undefined"
    && process.env
    && (process.env.VITE_OWNER_REVIEW_STAGING || process.env.OWNER_REVIEW_STAGING);
  return /^(1|true|yes)$/i.test(String(fromImportMeta ?? fromProcess ?? ""));
};

/** Staging builds may render provisional/legacy content with explicit labels. Defaults false. */
export const OWNER_REVIEW_STAGING_VISIBLE = readStagingFlag();

/** Short homepage / hero service-area line. */
export const serviceAreaShort = "Serving Los Angeles County and Riverside County.";

/** Canonical public qualification used across both sites. */
export const serviceAreaQualification =
  "Serving Los Angeles County and Riverside County, subject to address, scheduling, travel, and project-scope confirmation.";

/**
 * Evidence-safe Clarence biography for production.
 * Does not assert years, employers, degrees, certifications, or awards.
 */
export const clarenceBiographyPublic = Object.freeze({
  short:
    "Clarence combines inspection discipline, construction knowledge, and straightforward communication to help property owners make informed decisions.",
  full:
    "Clarence Gloss brings a practical, construction-informed perspective to inspections and residential improvement work. His approach focuses on careful observation, clear communication, and helping clients understand what needs attention now, what can wait, and what may require a specialist.",
});

export const preferredEmails = Object.freeze({
  status: CONTENT_STATE.provisionalOwnerReview,
  inspections: "inspections@cginspection.net",
  contracting: "contracting@cginspection.net",
  contact: "contact@cginspection.net",
  liveFallback: "clarencegloss@gmail.com",
  note: "Preferred domain mailboxes stay provisional until confirmed operational. Public forms and pages continue to use the Gmail fallback until domain delivery is verified.",
});

export const provisionalBusinessDetails = Object.freeze({
  reportTurnaround: Object.freeze({
    status: CONTENT_STATE.provisionalOwnerReview,
    short: "Most reports delivered within 24 hours.",
    full: "Most inspection reports are delivered within 24 hours. Larger, more complex, or specialty properties may require up to 48 hours.",
  }),
  businessHours: Object.freeze({
    status: CONTENT_STATE.provisionalOwnerReview,
    weekdaysAndSaturday: "Monday through Saturday, 8:00 a.m. to 6:00 p.m.",
    sunday: "Sunday appointments may be available by request.",
  }),
  responseTime: Object.freeze({
    status: CONTENT_STATE.provisionalOwnerReview,
    copy: "Calls, emails, and website inquiries are typically answered within one business day.",
  }),
  weekendAppointments: Object.freeze({
    status: CONTENT_STATE.provisionalOwnerReview,
    copy: "Saturday appointments are available. Limited Sunday appointments may be available by request.",
  }),
  inspectorCertification: Object.freeze({
    status: CONTENT_STATE.provisionalOwnerReview,
    copy: "Professional home inspection credentials and continuing-education details are being finalized for publication.",
    organization: null,
    credentialNumber: null,
    certificateUrl: null,
    expiresAt: null,
  }),
  insurance: Object.freeze({
    status: CONTENT_STATE.provisionalOwnerReview,
    copy: "Insurance and professional coverage details are available upon confirmation and will be published after owner review.",
  }),
  biography: Object.freeze({
    status: CONTENT_STATE.provisionalOwnerReview,
    short: clarenceBiographyPublic.short,
    full: `${clarenceBiographyPublic.full} Through C&G Certified Home Inspector and C&G Contracting Services, Clarence works with homeowners, buyers, sellers, agents, investors, and property professionals across Los Angeles and Riverside counties.`,
  }),
  poolSpa: Object.freeze({
    status: CONTENT_STATE.provisionalOwnerReview,
    copy: "Visible pool and spa components may be observed as an optional add-on when access, conditions, and scheduling allow. This is not a specialist pool inspection unless explicitly arranged.",
    productionVisible: false,
  }),
  manufacturedHomes: Object.freeze({
    status: CONTENT_STATE.provisionalOwnerReview,
    copy: "Manufactured-home inspections may be accepted after property-specific review. Scope and access requirements must be confirmed before scheduling.",
    productionVisible: false,
  }),
  infrared: Object.freeze({
    status: CONTENT_STATE.provisionalOwnerReview,
    copy: "Infrared imaging may be used when available and appropriate as a supplemental observation tool. It does not replace invasive testing or specialist evaluation.",
    productionVisible: false,
  }),
  moistureMeters: Object.freeze({
    status: CONTENT_STATE.provisionalOwnerReview,
    copy: "Moisture meters may be used when conditions warrant to support observations of suspected moisture intrusion. Readings are limited to accessible areas and are not a guarantee that hidden moisture is absent.",
    productionVisible: false,
  }),
  sampleReportPlaceholder: Object.freeze({
    status: CONTENT_STATE.provisionalOwnerReview,
    title: "Sample report pending redaction",
    copy: "A redacted sample report will be added after client information and property-identifying details have been removed.",
    productionNavigation: false,
  }),
});

/** Planning categories shown publicly; not a promise that every item fits every property. */
export const typicalContractorProjects = Object.freeze({
  status: "planning",
  qualification:
    "Project acceptance depends on scope, location, scheduling, licensing requirements, access, materials, and the relationship between the property and any prior C&G inspection.",
  categories: Object.freeze([
    "Interior repairs",
    "Drywall repair and patching",
    "Finish carpentry",
    "Doors, trim, and hardware",
    "Painting and surface preparation",
    "Punch-list work",
    "Rental turnover repairs",
    "Small remodeling projects",
    "Kitchen and bathroom updates",
    "Exterior repairs",
    "Property maintenance",
    "Pre-sale repair preparation",
    "Eligible inspection-related repairs after the separation period",
  ]),
});

export const photographyReplacementSlots = Object.freeze([
  Object.freeze({ id: "clarence-portrait", label: "Clarence portrait", intendedSurface: "inspector-about", priority: "high" }),
  Object.freeze({ id: "inspector-at-work", label: "Inspector at work", intendedSurface: "inspector-home", priority: "high" }),
  Object.freeze({ id: "exterior-inspection", label: "Exterior inspection", intendedSurface: "inspector-services", priority: "medium" }),
  Object.freeze({ id: "electrical-panel-inspection", label: "Electrical panel inspection", intendedSurface: "inspector-services", priority: "medium" }),
  Object.freeze({ id: "roof-or-attic-observation", label: "Roof or attic observation", intendedSurface: "inspector-services", priority: "medium" }),
  Object.freeze({ id: "contractor-project", label: "Contractor project", intendedSurface: "contractor-projects", priority: "high" }),
  Object.freeze({ id: "before-and-after-project", label: "Before-and-after project", intendedSurface: "contractor-projects", priority: "high" }),
  Object.freeze({ id: "finished-detail-work", label: "Finished detail work", intendedSurface: "contractor-home", priority: "medium" }),
]);

export const ownerReviewBannerCopy =
  "Owner-review staging build. Verified geography is live. Legacy feedback and provisional business details remain labeled and require Clarence’s approval before production promotion.";

export function isProvisional(record) {
  return record?.status === CONTENT_STATE.provisionalOwnerReview;
}

export function isLegacyPending(record) {
  return record?.status === CONTENT_STATE.legacyPendingOwnerConfirmation;
}

export function provisionalVisible(record) {
  return OWNER_REVIEW_STAGING_VISIBLE
    && isProvisional(record)
    && record.productionVisible !== false;
}

export function provisionalToolsVisible(record) {
  return OWNER_REVIEW_STAGING_VISIBLE && isProvisional(record);
}
