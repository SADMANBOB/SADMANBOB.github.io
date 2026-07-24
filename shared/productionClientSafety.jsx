import { useId } from "react";

/**
 * Production-only client facade.
 *
 * Vite resolves owner-review and legacy-review imports to this module unless an
 * explicit owner-review staging build is requested. Keep this surface limited
 * to approved public copy and fail-closed empty review state.
 */

export const OWNER_REVIEW_STAGING_VISIBLE = false;

export const serviceAreaShort = "Serving Los Angeles County and Riverside County.";

export const serviceAreaQualification =
  "Serving Los Angeles County and Riverside County, subject to address, scheduling, travel, and project-scope confirmation.";

export const clarenceBiographyPublic = Object.freeze({
  short:
    "Clarence combines inspection discipline, construction knowledge, and straightforward communication to help property owners make informed decisions.",
  full:
    "Clarence Gloss brings a practical, construction-informed perspective to inspections and residential improvement work. His approach focuses on careful observation, clear communication, and helping clients understand what needs attention now, what can wait, and what may require a specialist.",
});

export const preferredEmails = Object.freeze({
  status: "",
  inspections: "",
  contracting: "",
  contact: "",
  liveFallback: "clarencegloss@gmail.com",
  note: "",
});

const emptyRecord = Object.freeze({ status: "", copy: "", short: "", full: "" });

export const provisionalBusinessDetails = Object.freeze({
  reportTurnaround: emptyRecord,
  businessHours: Object.freeze({ status: "", weekdaysAndSaturday: "", sunday: "" }),
  responseTime: emptyRecord,
  weekendAppointments: emptyRecord,
  inspectorCertification: emptyRecord,
  insurance: emptyRecord,
  biography: emptyRecord,
  poolSpa: emptyRecord,
  manufacturedHomes: emptyRecord,
  infrared: emptyRecord,
  moistureMeters: emptyRecord,
  sampleReportPlaceholder: Object.freeze({
    status: "",
    title: "",
    copy: "",
    productionNavigation: false,
  }),
});

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

export const ownerReviewBannerCopy = "";

const EMPTY_REVIEWS = Object.freeze([]);
const EMPTY_REVIEW_STATE = Object.freeze({
  mode: "none",
  label: "",
  intro: "",
  reviews: EMPTY_REVIEWS,
});

export function getRenderableReviews() {
  return EMPTY_REVIEW_STATE;
}

export function legacyReviewAggregate() {
  return null;
}

export function ReviewCarousel({
  heading = "Client feedback",
  intro,
  emptyCopy = "Approved client reviews will appear here after owner confirmation. Until then, the report focuses on clear findings, photographs, and practical next steps.",
}) {
  const headingId = useId();
  useId();
  const resolvedIntro = intro || emptyCopy;

  return (
    <section className="trust-expectation-band" aria-labelledby={headingId}>
      <div className="container">
        <header className="review-header">
          <div>
            <p className="eyebrow">What the report is designed to provide</p>
            <h2 id={headingId}>{heading}</h2>
          </div>
          <p className="review-intro">{resolvedIntro}</p>
        </header>
      </div>
    </section>
  );
}
