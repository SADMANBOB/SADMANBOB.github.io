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
  },
  contracting: {
    publicName: "C&G Contracting Services",
    contractorOfRecord: "Coastal Construction Services",
    phoneDisplay: "(310) 505-6581",
    phoneHref: "tel:+13105056581",
    phoneE164: "+1-310-505-6581",
    email: "clarencegloss@gmail.com",
    origin: "https://www.cginspection.net/contracting/",
    license: {
      number: "987643",
      classification: "B — General Building",
      status: "approved",
      officialLookupUrl:
        "https://www.cslb.ca.gov/OnlineServices/CheckLicenseII/LicenseDetail.aspx?LicNum=987643",
      liveVerifiedAt: "2026-07-22",
      expiresAt: "2027-10-31",
    },
  },
};

export const claims = {
  internachiCertification: {
    status: "pending",
    evidenceType: "current directory listing or certificate",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  generalLiabilityInsurance: {
    status: "pending",
    evidenceType: "current declarations or certificate and approved wording",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  errorsAndOmissionsInsurance: {
    status: "pending",
    evidenceType: "current declarations or certificate and approved wording",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
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
    status: "pending",
    evidenceType: "owner-approved operational promise",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  weekendAvailability: {
    status: "pending",
    evidenceType: "owner-approved hours and availability policy",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  poolSpaInspection: {
    status: "pending",
    evidenceType: "scope, qualifications, agreement, report support, and legal review",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  manufacturedHomes: {
    status: "pending",
    evidenceType: "owner confirmation and supported inspection agreement",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  moistureMeters: {
    status: "pending",
    evidenceType: "actual tool and operating-practice confirmation",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  temperatureSensors: {
    status: "pending",
    evidenceType: "actual tool and operating-practice confirmation",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  contractorLicense: {
    status: "approved",
    evidenceType: "official CSLB license detail",
    evidenceUrl: business.contracting.license.officialLookupUrl,
    verifiedAt: business.contracting.license.liveVerifiedAt,
    expiresAt: business.contracting.license.expiresAt,
    allowedSurfaces: ["contractor"],
  },
  contractorPublicName: {
    status: "pending",
    evidenceType: "legal-name, DBA, or approved public-brand explanation",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
  customerTestimonials: {
    status: "pending",
    evidenceType: "verifiable source, permission, and exact approved text",
    verifiedAt: null,
    expiresAt: null,
    allowedSurfaces: [],
  },
};

export function claimIsApproved(claim, onDate = new Date()) {
  if (!claim || claim.status !== "approved") return false;
  if (!claim.expiresAt) return true;
  const endOfDate = new Date(`${claim.expiresAt}T23:59:59Z`);
  return endOfDate >= onDate;
}

export const serviceAreas = [
  {
    id: "los-angeles-county",
    label: "Los Angeles County",
    type: "county",
    status: "current_public_needs_owner_confirmation",
    approvedForInspector: false,
    approvedForContractor: false,
    approvedForMetadata: false,
    uniquePageEnabled: false,
    ownerConfirmedAt: null,
  },
  {
    id: "city-of-compton",
    label: "City of Compton",
    type: "city",
    status: "pending",
    approvedForInspector: false,
    approvedForContractor: false,
    approvedForMetadata: false,
    uniquePageEnabled: false,
    ownerConfirmedAt: null,
  },
  {
    id: "riverside-county",
    label: "Riverside County",
    type: "county",
    status: "pending",
    approvedForInspector: false,
    approvedForContractor: false,
    approvedForMetadata: false,
    uniquePageEnabled: false,
    ownerConfirmedAt: null,
  },
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
    provider: null,
    publicConfig: null,
    allowedSurfaces: [],
    fallback: "/contact/",
    ownerGate: "approved scheduling provider, public booking URL, availability policy, and privacy review",
  },
  inspectionFormTransport: {
    status: "approved",
    enabled: true,
    provider: "mailto",
    publicConfig: null,
    allowedSurfaces: ["inspector-contact"],
    serverSubmissionEnabled: false,
  },
  contractorFormTransport: {
    status: "approved",
    enabled: true,
    provider: "mailto",
    publicConfig: null,
    allowedSurfaces: ["contractor-estimate"],
    serverSubmissionEnabled: false,
  },
  analytics: {
    status: "pending",
    enabled: false,
    provider: null,
    publicConfig: null,
    allowedSurfaces: [],
    ownerGate: "approved provider, site ID, consent decision, event taxonomy, and privacy wording",
  },
  maps: {
    status: "pending",
    enabled: false,
    provider: null,
    publicConfig: null,
    allowedSurfaces: [],
    ownerGate: "approved public business address or service-area policy and privacy review",
  },
  reviews: {
    status: "pending",
    enabled: false,
    provider: null,
    publicConfig: null,
    allowedSurfaces: [],
    ownerGate: "verifiable source, customer permission, exact approved text, and display policy",
  },
};

export function integrationCanRender(integration) {
  if (!integration || integration.status !== "approved" || integration.enabled !== true) return false;
  if (integration.provider === "Pagefind") return Boolean(integration.publicConfig?.inspectorBundle && integration.publicConfig?.contractorBundle);
  if (integration.provider === "mailto") return integration.serverSubmissionEnabled === false;
  return Boolean(integration.provider && integration.publicConfig);
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
