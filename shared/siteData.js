const PUBLIC_CLIENT_BUNDLE =
  typeof __CG_PUBLIC_CLIENT_BUNDLE__ !== "undefined"
  && __CG_PUBLIC_CLIENT_BUNDLE__;

export const separationPolicy = {
  notice:
    "Home inspection and construction are separate services. C&G Contracting Services does not offer or perform repairs on a property for which C&G prepared a home inspection report during the previous 12 months. If you are unsure whether this applies, contact C&G before submitting a project request.",
  blocked:
    "C&G Contracting Services cannot offer or perform repairs on this property within 12 months of a C&G home inspection. Please contact an independent contractor for repair estimates or work.",
};

export const business = {
  inspection: {
    publicName: "C&G Certified Home Inspector",
    shortName: "C&G",
    phoneDisplay: "(310) 505-6581",
    phoneHref: "tel:+13105056581",
    phoneE164: "+1-310-505-6581",
    email: "clarencegloss@gmail.com",
    schedulingUrl: null,
    origin: "https://www.cginspection.net",
    positioning: "Serving Los Angeles County and Riverside County.",
  },
  contracting: {
    publicName: "C&G Contracting Services",
    contractorOfRecord: "Coastal Construction Services",
    publicBrandDisclosure:
      "C&G Contracting Services is the public-facing brand for contracting work performed by Coastal Construction Services, CSLB #987643.",
    publicBrandAuthorizedAt: "2026-07-23",
    phoneDisplay: "(310) 505-6581",
    phoneHref: "tel:+13105056581",
    phoneE164: "+1-310-505-6581",
    email: "clarencegloss@gmail.com",
    origin: "https://www.cginspection.net/contracting/",
    positioning:
      "Serving Los Angeles County and Riverside County, subject to address, scheduling, travel, and project-scope confirmation.",
    license: {
      number: "987643",
      classification: "B — General Building",
      status: "approved",
      officialLookupUrl: "https://www.cslb.ca.gov/987643",
      liveVerifiedAt: "2026-07-23",
      expiresAt: "2027-10-31",
    },
  },
};

export const contractorRequestCategoryIds = Object.freeze([
  "interior-repair-finish-work",
  "drywall-surface-repair",
  "doors-trim-finish-carpentry",
  "punch-list-coordination",
  "property-maintenance-turnover",
  "exterior-details",
  "small-multi-trade-projects",
  "other-or-not-sure",
]);

export const claims = {
  ...(PUBLIC_CLIENT_BUNDLE ? {} : {
  internachiCertification: {
    status: "provisional_owner_review",
    evidenceType: "current directory listing or certificate",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
    draftCopy: "Professional home inspection credentials and continuing-education details are being finalized for publication.",
    organization: null,
    credentialNumber: null,
    certificateUrl: null,
  },
  generalLiabilityInsurance: {
    status: "provisional_owner_review",
    evidenceType: "current declarations or certificate and approved wording",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
    draftCopy: "Insurance and professional coverage details are available upon confirmation and will be published after owner review.",
  },
  errorsAndOmissionsInsurance: {
    status: "provisional_owner_review",
    evidenceType: "current declarations or certificate and approved wording",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
    draftCopy: "Insurance and professional coverage details are available upon confirmation and will be published after owner review.",
  },
  yearsExperience35Plus: {
    status: "pending",
    evidenceType: "owner confirmation and defensible start date",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  teachingCredential: {
    status: "pending",
    evidenceType: "credential and approved status wording",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  cityOfComptonExperience: {
    status: "pending",
    evidenceType: "owner confirmation and approved role description",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  insuranceCompanyExperience: {
    status: "pending",
    evidenceType: "owner confirmation and approved non-confidential wording",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  sameDayReports: {
    status: "pending",
    evidenceType: "owner-approved operational promise",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  nextDayReports: {
    status: "provisional_owner_review",
    evidenceType: "owner-approved operational promise",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
    draftCopy: "Most inspection reports are delivered within 24 hours. Larger, more complex, or specialty properties may require up to 48 hours.",
    draftShort: "Most reports delivered within 24 hours.",
  },
  weekendAvailability: {
    status: "provisional_owner_review",
    evidenceType: "owner-approved hours and availability policy",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
    draftCopy: "Saturday appointments are available. Limited Sunday appointments may be available by request.",
    hoursCopy: "Monday through Saturday, 8:00 a.m. to 6:00 p.m.",
    sundayCopy: "Sunday appointments may be available by request.",
  },
  responseTime: {
    status: "provisional_owner_review",
    evidenceType: "owner-approved response expectation",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
    draftCopy: "Calls, emails, and website inquiries are typically answered within one business day.",
  },
  clarenceBiography: {
    status: "provisional_owner_review",
    evidenceType: "owner-approved biography wording",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
    draftShort: "Clarence Gloss combines inspection discipline, construction knowledge, and clear communication to help property owners make informed decisions.",
    draftFull: "Clarence Gloss brings a practical, construction-informed perspective to property inspections and residential improvement work. His approach emphasizes careful observation, clear communication, and helping clients understand which findings require immediate attention and which can be planned for over time. Through C&G Certified Home Inspector and C&G Contracting Services, Clarence works with homeowners, buyers, sellers, agents, investors, and property professionals across Los Angeles and Riverside counties.",
  },
  poolSpaInspection: {
    status: "provisional_owner_review",
    evidenceType: "scope, qualifications, agreement, report support, and legal review",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
    productionVisible: false,
    draftCopy: "Visible pool and spa components may be observed as an optional add-on when access, conditions, and scheduling allow. This is not a specialist pool inspection unless explicitly arranged.",
  },
  manufacturedHomes: {
    status: "provisional_owner_review",
    evidenceType: "owner confirmation and supported inspection agreement",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
    productionVisible: false,
    draftCopy: "Manufactured-home inspections may be accepted after property-specific review. Scope and access requirements must be confirmed before scheduling.",
  },
  moistureMeters: {
    status: "provisional_owner_review",
    evidenceType: "actual tool and operating-practice confirmation",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
    productionVisible: false,
    draftCopy: "Moisture meters may be used when conditions warrant to support observations of suspected moisture intrusion. Readings are limited to accessible areas and are not a guarantee that hidden moisture is absent.",
  },
  temperatureSensors: {
    status: "pending",
    evidenceType: "actual tool and operating-practice confirmation",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  infraredImaging: {
    status: "provisional_owner_review",
    evidenceType: "actual tool and operating-practice confirmation",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
    productionVisible: false,
    draftCopy: "Infrared imaging may be used when available and appropriate as a supplemental observation tool. It does not replace invasive testing or specialist evaluation.",
  },
  }),
  contractorLicense: {
    status: "approved",
    evidenceType: "official CSLB license detail",
    evidenceUrl: business.contracting.license.officialLookupUrl,
    verifiedAt: business.contracting.license.liveVerifiedAt,
    expiresAt: business.contracting.license.expiresAt,
    allowedSurfaces: ["inspector", "contractor", "portal"],
  },
  contractorPublicName: {
    status: "approved",
    publicCopy: business.contracting.publicBrandDisclosure,
    evidenceType: "explicit publisher authorization of the public-brand and contractor-of-record wording",
    evidenceReference: "Site-owner publishing workflow authorization recorded 2026-07-23",
    verifiedAt: business.contracting.publicBrandAuthorizedAt,
    expiresAt: null,
    allowedSurfaces: ["inspector", "contractor", "portal"],
  },
  ...(PUBLIC_CLIENT_BUNDLE ? {} : {
  customerTestimonials: {
    status: "legacy_pending_owner_confirmation",
    evidenceType: "verifiable source, permission, and exact approved text",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
    note: "Legacy feedback imported for owner-review staging. Production getApprovedReviews remains empty until each review is approved.",
  },
  }),
};

export function claimIsApproved(claim, onDate = new Date()) {
  if (!claim || claim.status !== "approved") return false;
  if (!(onDate instanceof Date) || !Number.isFinite(onDate.getTime())) return false;
  if (
    !Array.isArray(claim.allowedSurfaces)
    || claim.allowedSurfaces.length === 0
    || new Set(claim.allowedSurfaces).size !== claim.allowedSurfaces.length
    || claim.allowedSurfaces.some((surface) => typeof surface !== "string" || !surface.trim())
  ) return false;
  if (typeof claim.verifiedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(claim.verifiedAt)) return false;
  const verifiedAt = new Date(`${claim.verifiedAt}T00:00:00Z`);
  if (!Number.isFinite(verifiedAt.getTime()) || verifiedAt > onDate) return false;
  if (!claim.expiresAt) return true;
  if (typeof claim.expiresAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(claim.expiresAt)) return false;
  const endOfDate = new Date(`${claim.expiresAt}T23:59:59Z`);
  return Number.isFinite(endOfDate.getTime()) && endOfDate >= onDate;
}

export const claimCanRenderOn = (claim, surface, onDate = new Date()) =>
  claimIsApproved(claim, onDate)
  && typeof surface === "string"
  && claim.allowedSurfaces.includes(surface);

/** Staging-only: provisional draft copy may render with explicit owner-review labeling. */
export function claimDraftForOwnerReview(claim) {
  if (!claim || claim.status !== "provisional_owner_review") return null;
  if (claim.productionVisible === false) return null;
  return claim.draftCopy || claim.draftFull || claim.draftShort || null;
}

const SERVICE_AREA_QUALIFICATION =
  "Serving Los Angeles County and Riverside County, subject to address, scheduling, travel, and project-scope confirmation.";

const losAngelesCommunities = Object.freeze([
  "Los Angeles",
  "Pasadena",
  "Glendale",
  "Burbank",
  "Alhambra",
  "West Covina",
  "Compton",
  "Long Beach",
  "Hawthorne",
  "Inglewood",
  "Bellflower",
  "Norwalk",
  "Paramount",
  "Lynwood",
  "Downey",
  "Carson",
  "Gardena",
  "Torrance",
  "Bell Gardens",
]);

const riversideCommunities = Object.freeze([
  "Riverside",
  "Moreno Valley",
  "Corona",
  "Jurupa Valley",
  "Eastvale",
  "Perris",
]);

const losAngelesDescription =
  "Serving residential clients throughout Los Angeles County, including Central Los Angeles, South Los Angeles, the San Gabriel Valley, the Gateway Cities, the South Bay, and nearby communities.";

const riversideDescription =
  "Serving residential clients throughout Riverside County, including Riverside, Moreno Valley, Corona, Jurupa Valley, Eastvale, Perris, and surrounding communities.";

const mapsLinkFor = (query) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

const pendingServiceAreas = PUBLIC_CLIENT_BUNDLE ? [] : [
  {
    id: "city-of-compton",
    label: "City of Compton",
    type: "city",
    status: "pending",
    contentState: "legacy_pending_owner_confirmation",
    approvedForInspector: false,
    approvedForContractor: false,
    approvedForMetadata: false,
    uniquePageEnabled: false,
    ownerConfirmedAt: null,
    inspectorPage: null,
    contractorPage: null,
    note: "Compton is listed as a representative Los Angeles County community. A separate city landing page remains unpublished.",
  },
];

export const serviceAreas = [
  {
    id: "los-angeles-county",
    label: "Los Angeles County",
    type: "county",
    status: "approved",
    contentState: "verified",
    approvedForInspector: true,
    approvedForContractor: true,
    approvedForMetadata: true,
    uniquePageEnabled: true,
    ownerConfirmedAt: "2026-07-23T19:00:00Z",
    description: losAngelesDescription,
    communities: losAngelesCommunities,
    qualification: SERVICE_AREA_QUALIFICATION,
    mapsUrl: mapsLinkFor("Los Angeles County, California"),
    inspectorPage: {
      pageTitle: "Home Inspections in Los Angeles County | C&G",
      metaDescription:
        "Request a C&G home inspection in Los Angeles County. Serving Los Angeles County and Riverside County, subject to address and scheduling confirmation.",
      pageContent: {
        introduction:
          "C&G Certified Home Inspector serves residential clients throughout Los Angeles County, including Central Los Angeles, South Los Angeles, the San Gabriel Valley, the Gateway Cities, the South Bay, and nearby communities. Share the full property address so coverage, travel, and timing can be confirmed before an appointment is accepted.",
        propertyContext:
          "Los Angeles County includes a wide range of housing ages, access patterns, and neighborhood conditions. A request for Compton, Long Beach, Pasadena, Torrance, or another listed community begins with the specific address—not a county-wide assumption that every property is automatically accepted.",
        accessAndTiming:
          `${SERVICE_AREA_QUALIFICATION} Share occupancy, access notes, and preferred timing so the inspection conversation starts with accurate logistics.`,
        planningChecklist: [
          "Full street address and city within Los Angeles County",
          "Property type, approximate size, and inspection purpose",
          "Occupancy, access instructions, and preferred timing window",
        ],
      },
    },
    contractorPage: {
      pageTitle: "Residential Contracting in Los Angeles County | C&G",
      metaDescription:
        "Request residential repair review from C&G Contracting Services in Los Angeles County. Serving Los Angeles and Riverside counties, subject to project confirmation.",
      pageContent: {
        introduction:
          "C&G Contracting Services reviews residential repair, finish-work, punch-list, and small multi-trade projects throughout Los Angeles County, including Central Los Angeles, South Los Angeles, the San Gabriel Valley, the Gateway Cities, the South Bay, and nearby communities. Tell us what needs attention and we will review whether it fits our current services.",
        propertyContext:
          "Communities such as Compton, Downey, Hawthorne, Long Beach, and Torrance may present different access, finish, and permit contexts. A clear description of the current condition and desired result helps C&G decide whether the project fits current capabilities.",
        accessAndTiming:
          `${SERVICE_AREA_QUALIFICATION} We review eligibility, scope, and next steps before any estimate visit is scheduled.`,
        planningChecklist: [
          "Full property address and authority to request work",
          "Plain-language description of the condition and desired result",
          "Occupancy, access, timing, and the 12-month inspection eligibility answer",
        ],
      },
    },
  },
  {
    id: "riverside-county",
    label: "Riverside County",
    type: "county",
    status: "approved",
    contentState: "verified",
    approvedForInspector: true,
    approvedForContractor: true,
    approvedForMetadata: true,
    uniquePageEnabled: true,
    ownerConfirmedAt: "2026-07-23T19:00:00Z",
    description: riversideDescription,
    communities: riversideCommunities,
    qualification: SERVICE_AREA_QUALIFICATION,
    mapsUrl: mapsLinkFor("Riverside County, California"),
    inspectorPage: {
      pageTitle: "Home Inspections in Riverside County | C&G",
      metaDescription:
        "Request a C&G home inspection in Riverside County, including Riverside, Moreno Valley, Corona, and nearby communities. Coverage confirmed address by address.",
      pageContent: {
        introduction:
          "C&G Certified Home Inspector serves residential clients throughout Riverside County, including Riverside, Moreno Valley, Corona, Jurupa Valley, Eastvale, Perris, and surrounding communities. Coverage is confirmed from the actual property address before an appointment is accepted.",
        propertyContext:
          "Riverside County properties vary in age, access, and travel distance from the Los Angeles County core. Sharing the complete address, property type, and timing needs early helps C&G confirm whether the inspection can be scheduled.",
        accessAndTiming:
          `${SERVICE_AREA_QUALIFICATION} A submitted request is not a confirmed appointment until C&G accepts the scope and timing.`,
        planningChecklist: [
          "Full street address and city within Riverside County",
          "Property type, approximate size, and inspection purpose",
          "Preferred timing and any access or occupancy constraints",
        ],
      },
    },
    contractorPage: {
      pageTitle: "Residential Contracting in Riverside County | C&G",
      metaDescription:
        "Share a residential repair request with C&G Contracting Services in Riverside County. Serving Los Angeles and Riverside counties, subject to project confirmation.",
      pageContent: {
        introduction:
          "C&G Contracting Services reviews residential repair and improvement requests throughout Riverside County, including Riverside, Moreno Valley, Corona, Jurupa Valley, Eastvale, Perris, and surrounding communities. Tell us about the property and the result you want, and we will review the next step.",
        propertyContext:
          "A clear project brief matters as much as location. Describe the condition, desired result, access, and any known source issues so C&G can decide whether the work fits the current B — General Building practice.",
        accessAndTiming:
          `${SERVICE_AREA_QUALIFICATION} We confirm eligibility and scope before discussing price or scheduling.`,
        planningChecklist: [
          "Full property address and requester authority",
          "Condition summary, affected areas, and desired result",
          "Timing needs plus the 12-month C&G inspection eligibility answer",
        ],
      },
    },
  },
  ...pendingServiceAreas,
];

export const approvedServiceAreas = (surface) =>
  serviceAreas.filter((area) => area.status === "approved" && area[`approvedFor${surface}`] === true);

export const imageProvenance = [
  {
    id: "inspector-hero",
    file: "inspector-site-prototype/public/assets/hero-inspector.jpg",
    type: "generated_editorial",
    approvedFor: ["inspector-home", "property-services"],
    depictsActualClientWork: false,
    alt: "Home inspector using a diagnostic meter beside a stucco home",
    source: "existing repository asset classified as generated/editorial by the master build brief",
    licenseOrPermission: "preserved for listed surfaces under the master build brief; owner asset-record confirmation pending",
    approvedAt: "2026-07-22",
    status: "approved",
  },
  {
    id: "inspector-report",
    file: "inspector-site-prototype/public/assets/report-laptop.jpg",
    type: "generated_editorial",
    approvedFor: ["inspector-home", "inspector-services"],
    depictsActualClientWork: false,
    alt: "Home inspection report and tools on a desk",
    source: "existing repository asset classified as generated/editorial by the master build brief",
    licenseOrPermission: "preserved for listed surfaces under the master build brief; owner asset-record confirmation pending",
    approvedAt: "2026-07-22",
    status: "approved",
  },
  {
    id: "inspector-attic",
    file: "inspector-site-prototype/public/assets/attic-inspection.jpg",
    type: "generated_editorial",
    approvedFor: ["inspector-home", "inspector-services"],
    depictsActualClientWork: false,
    alt: "Inspector measuring visible attic framing with a flashlight",
    source: "existing repository asset classified as generated/editorial by the master build brief",
    licenseOrPermission: "preserved for listed surfaces under the master build brief; owner asset-record confirmation pending",
    approvedAt: "2026-07-22",
    status: "approved",
  },
  {
    id: "cross-service-planning",
    file: "inspector-site-prototype/public/assets/contracting-review.jpg",
    type: "generated_editorial",
    approvedFor: ["inspector-home", "inspector-contact"],
    depictsActualClientWork: false,
    alt: "Construction professionals reviewing plans in a kitchen",
    source: "existing repository asset classified as generated/editorial by the master build brief",
    licenseOrPermission: "preserved for listed surfaces under the master build brief; owner asset-record confirmation pending",
    approvedAt: "2026-07-22",
    status: "approved",
  },
  {
    id: "contractor-hero",
    file: "contractor-site-prototype/public/assets/contractor-hero.jpg",
    type: "generated_editorial",
    approvedFor: ["contractor-home", "contractor-about", "property-services"],
    depictsActualClientWork: false,
    alt: "Contractor carefully measuring interior wood trim",
    source: "existing repository asset classified as generated/editorial by the master build brief",
    licenseOrPermission: "preserved for listed surfaces under the master build brief; owner asset-record confirmation pending",
    approvedAt: "2026-07-22",
    status: "approved",
  },
  {
    id: "contractor-finish-work",
    file: "contractor-site-prototype/public/assets/finish-work.jpg",
    type: "generated_editorial",
    approvedFor: ["contractor-process"],
    depictsActualClientWork: false,
    alt: "Craftsperson checking the alignment of a wood door and hardware",
    source: "existing repository asset classified as generated/editorial by the master build brief",
    licenseOrPermission: "preserved for listed surfaces under the master build brief; owner asset-record confirmation pending",
    approvedAt: "2026-07-22",
    status: "approved",
  },
  {
    id: "contractor-project-planning",
    file: "contractor-site-prototype/public/assets/project-planning.jpg",
    type: "generated_editorial",
    approvedFor: ["contractor-home"],
    depictsActualClientWork: false,
    alt: "Construction professionals reviewing a residential project plan",
    source: "existing repository asset classified as generated/editorial by the master build brief",
    licenseOrPermission: "preserved for listed surfaces under the master build brief; owner asset-record confirmation pending",
    approvedAt: "2026-07-22",
    status: "approved",
  },
  ...[
    ["illustrative-drywall-repair", "illustrative-drywall-repair.jpg", "Repair professional smoothing a small drywall patch in a protected living space"],
    ["illustrative-exterior-trim", "illustrative-exterior-trim.jpg", "Contractor measuring weathered wood trim beneath an exterior window"],
    ["illustrative-finish-carpentry", "illustrative-finish-carpentry.jpg", "Finish carpenter checking trim alignment beside an interior doorway"],
  ].map(([id, file, alt]) => ({
    id,
    file: `contractor-site-prototype/public/assets/${file}`,
    type: "generated_editorial",
    approvedFor: ["contractor-home", "contractor-services", "contractor-project-types"],
    depictsActualClientWork: false,
    alt,
    source: "existing repository asset classified as generated/editorial by the master build brief",
    licenseOrPermission: "preserved for listed surfaces under the master build brief; owner asset-record confirmation pending",
    approvedAt: "2026-07-22",
    status: "approved",
  })),
];

export const analytics = {
  enabled: false,
  provider: null,
  track: () => {},
};

export const integrations = {
  siteSearch: {
    status: "approved",
    enabled: true,
    capability: "site-search",
    provider: "Pagefind",
    allowedSurfaces: ["inspector", "contractor"],
    publicConfig: {
      inspectorBundle: "/pagefind/inspector/pagefind.js",
      contractorBundle: "/pagefind/contractor/pagefind.js",
    },
    privacyMode: "same-origin static index; search terms stay in the visitor's browser",
  },
  booking: {
    status: "pending",
    enabled: false,
    capability: "booking",
    provider: null,
    publicConfig: null,
    allowedSurfaces: [],
    ownerApprovedAt: null,
    privacyReviewedAt: null,
    policyApprovedAt: null,
    fallback: "/contact/",
    ownerGate: "approved scheduling provider, public booking URL, availability policy, and privacy review",
  },
  inspectionFormTransport: {
    status: "approved",
    enabled: true,
    capability: "form-transport",
    provider: "mailto",
    publicConfig: null,
    allowedSurfaces: ["inspector-contact"],
    serverSubmissionEnabled: false,
  },
  contractorFormTransport: {
    status: "approved",
    enabled: true,
    capability: "form-transport",
    provider: "mailto",
    publicConfig: null,
    allowedSurfaces: ["contractor-estimate"],
    serverSubmissionEnabled: false,
  },
  secureInspectionFormTransport: {
    status: "pending",
    enabled: false,
    capability: "form-transport",
    provider: null,
    publicConfig: null,
    allowedSurfaces: [],
    serverSubmissionEnabled: false,
    ownerApprovedAt: null,
    privacyReviewedAt: null,
    securityReviewedAt: null,
    fallbackIntegration: "inspectionFormTransport",
    ownerGate: "approved HTTPS form processor, endpoint, privacy policy, retention policy, abuse controls, and success/error contract",
  },
  secureContractorFormTransport: {
    status: "pending",
    enabled: false,
    capability: "form-transport",
    provider: null,
    publicConfig: null,
    allowedSurfaces: [],
    serverSubmissionEnabled: false,
    ownerApprovedAt: null,
    privacyReviewedAt: null,
    securityReviewedAt: null,
    fallbackIntegration: "contractorFormTransport",
    ownerGate: "approved HTTPS form processor, endpoint, privacy policy, retention policy, abuse controls, and success/error contract",
  },
  protectedUpload: {
    status: "pending",
    enabled: false,
    capability: "protected-upload",
    provider: null,
    publicConfig: null,
    allowedSurfaces: [],
    ownerApprovedAt: null,
    privacyReviewedAt: null,
    securityReviewedAt: null,
    ownerGate: "approved upload broker, one-time upload contract, file allowlist, size limits, retention/deletion policy, malware controls, and privacy review",
  },
  analytics: {
    status: "pending",
    enabled: false,
    capability: "analytics",
    provider: null,
    publicConfig: null,
    allowedSurfaces: [],
    ownerGate: "approved provider, site ID, consent decision, event taxonomy, and privacy wording",
  },
  maps: {
    status: "pending",
    enabled: false,
    capability: "map",
    provider: null,
    publicConfig: null,
    allowedSurfaces: [],
    ownerGate: "approved public business address or service-area policy and privacy review",
  },
  reviews: {
    status: "pending",
    enabled: false,
    capability: "reviews",
    provider: null,
    publicConfig: null,
    allowedSurfaces: [],
    ownerGate: "verifiable source, customer permission, exact approved text, and display policy",
  },
};

const approvedHttpsUrl = (value) => {
  if (typeof value !== "string" || value !== value.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && Boolean(url.hostname)
      && !url.username
      && !url.password;
  } catch {
    return false;
  }
};

const FORM_SURFACES = Object.freeze(["inspector-contact", "contractor-estimate"]);
const BOOKING_SURFACES = Object.freeze(["inspector"]);
const safeApprovalText = (value, min = 20, max = 1_000) =>
  typeof value === "string"
  && value === value.trim()
  && value.length >= min
  && value.length <= max
  && !/[<>\u0000-\u001F]/.test(value);
const validApprovalTimestamp = (value, onDate) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) return false;
  const timestamp = new Date(value);
  return Number.isFinite(timestamp.getTime()) && timestamp <= onDate;
};
const hasApprovedSurfaces = (surfaces, allowlist) =>
  Array.isArray(surfaces)
  && surfaces.length > 0
  && new Set(surfaces).size === surfaces.length
  && surfaces.every((surface) => allowlist.includes(surface));

export function integrationCanRender(integration, onDate = new Date()) {
  if (!integration || integration.status !== "approved" || integration.enabled !== true) return false;
  if (!(onDate instanceof Date) || !Number.isFinite(onDate.getTime())) return false;
  if (integration.provider === "Pagefind") return Boolean(integration.publicConfig?.inspectorBundle && integration.publicConfig?.contractorBundle);
  if (integration.provider === "mailto") return integration.serverSubmissionEnabled === false;
  if (typeof integration.provider !== "string" || !integration.provider.trim()) return false;
  if (integration.capability === "booking") {
    return approvedHttpsUrl(integration.publicConfig?.bookingUrl)
      && approvedHttpsUrl(integration.publicConfig?.privacyUrl)
      && safeApprovalText(integration.publicConfig?.actionLabel, 4, 60)
      && safeApprovalText(integration.publicConfig?.availabilityPolicy)
      && safeApprovalText(integration.publicConfig?.cancellationPolicy)
      && hasApprovedSurfaces(integration.allowedSurfaces, BOOKING_SURFACES)
      && validApprovalTimestamp(integration.ownerApprovedAt, onDate)
      && validApprovalTimestamp(integration.privacyReviewedAt, onDate)
      && validApprovalTimestamp(integration.policyApprovedAt, onDate);
  }
  if (integration.capability === "form-transport") {
    return integration.serverSubmissionEnabled === true
      && integration.publicConfig?.method === "POST"
      && integration.publicConfig?.encoding === "application/json"
      && approvedHttpsUrl(integration.publicConfig?.endpoint)
      && approvedHttpsUrl(integration.publicConfig?.privacyUrl)
      && typeof integration.publicConfig?.formId === "string"
      && /^[a-z0-9][a-z0-9_-]{2,80}$/i.test(integration.publicConfig.formId)
      && safeApprovalText(integration.publicConfig?.retentionPolicy)
      && safeApprovalText(integration.publicConfig?.deletionPolicy)
      && safeApprovalText(integration.publicConfig?.abuseControls)
      && safeApprovalText(integration.publicConfig?.responseContractVersion, 3, 80)
      && hasApprovedSurfaces(integration.allowedSurfaces, FORM_SURFACES)
      && validApprovalTimestamp(integration.ownerApprovedAt, onDate)
      && validApprovalTimestamp(integration.privacyReviewedAt, onDate)
      && validApprovalTimestamp(integration.securityReviewedAt, onDate);
  }
  if (integration.capability === "protected-upload") {
    return approvedHttpsUrl(integration.publicConfig?.sessionEndpoint)
      && approvedHttpsUrl(integration.publicConfig?.privacyUrl)
      && Number.isInteger(integration.publicConfig?.maxBytes)
      && integration.publicConfig.maxBytes > 0
      && integration.publicConfig.maxBytes <= 25_000_000
      && Number.isInteger(integration.publicConfig?.maxFiles)
      && integration.publicConfig.maxFiles > 0
      && integration.publicConfig.maxFiles <= 5
      && Array.isArray(integration.publicConfig?.allowedMimeTypes)
      && integration.publicConfig.allowedMimeTypes.length > 0
      && integration.publicConfig.allowedMimeTypes.every((type) => [
        "image/avif",
        "image/heic",
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ].includes(type))
      && Array.isArray(integration.publicConfig?.allowedUploadHosts)
      && integration.publicConfig.allowedUploadHosts.length > 0
      && integration.publicConfig.allowedUploadHosts.every((host) => typeof host === "string" && /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(host))
      && Number.isInteger(integration.publicConfig?.sessionTtlSeconds)
      && integration.publicConfig.sessionTtlSeconds >= 60
      && integration.publicConfig.sessionTtlSeconds <= 3_600
      && safeApprovalText(integration.publicConfig?.oneTimeUploadContract)
      && safeApprovalText(integration.publicConfig?.retentionPolicy)
      && safeApprovalText(integration.publicConfig?.deletionPolicy)
      && safeApprovalText(integration.publicConfig?.malwareControls)
      && hasApprovedSurfaces(integration.allowedSurfaces, FORM_SURFACES)
      && validApprovalTimestamp(integration.ownerApprovedAt, onDate)
      && validApprovalTimestamp(integration.privacyReviewedAt, onDate)
      && validApprovalTimestamp(integration.securityReviewedAt, onDate);
  }
  return false;
}

export function approvedIntegrationsFor(surface) {
  return Object.entries(integrations)
    .filter(([, integration]) => integrationCanRender(integration) && integration.allowedSurfaces?.includes(surface))
    .map(([id, integration]) => ({ id, ...integration }));
}

export function evaluateContractorEligibility(value) {
  if (value === "no") return { state: "eligible", canPrepareOrdinaryRequest: true };
  if (value === "yes") return { state: "blocked", canPrepareOrdinaryRequest: false };
  if (value === "unsure") return { state: "manual-review", canPrepareOrdinaryRequest: false };
  return { state: "validation-error", canPrepareOrdinaryRequest: false };
}
