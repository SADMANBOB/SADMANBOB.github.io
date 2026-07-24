import {
  getApprovedSampleReports,
  getApprovedServiceAreaPages,
  PUBLICATION_SURFACES,
} from "../../../shared/publicationRegistry.js";
import {
  OWNER_REVIEW_STAGING_VISIBLE,
  provisionalBusinessDetails,
} from "../../../shared/ownerReview.js";

const SAMPLE_REPORT_CLIENT_ENABLED =
  typeof __CG_SAMPLE_REPORT_CLIENT_ENABLED__ !== "undefined"
    ? __CG_SAMPLE_REPORT_CLIENT_ENABLED__
    : OWNER_REVIEW_STAGING_VISIBLE
      || getApprovedSampleReports(PUBLICATION_SURFACES.sampleReport).length > 0;
const approvedSampleReport = SAMPLE_REPORT_CLIENT_ENABLED
  ? getApprovedSampleReports(PUBLICATION_SURFACES.sampleReport)[0] || null
  : null;
const approvedAreaPages = getApprovedServiceAreaPages("Inspector");
const sampleReportPlaceholder = SAMPLE_REPORT_CLIENT_ENABLED && OWNER_REVIEW_STAGING_VISIBLE
  ? {
      provisional: true,
      title: provisionalBusinessDetails.sampleReportPlaceholder.title,
      copy: provisionalBusinessDetails.sampleReportPlaceholder.copy,
    }
  : null;
const sampleReportForRoute = approvedSampleReport || sampleReportPlaceholder;

const coreRoutes = [
  {
    key: "home",
    path: "/",
    label: "Home",
    title: "C&G Certified Home Inspector | Los Angeles & Riverside Counties",
    description:
      "Serving Los Angeles County and Riverside County. Clear home inspections with practical next steps for buyers, sellers, and homeowners.",
    enabled: true,
    navigation: true,
    sitemap: true,
    breadcrumbs: [],
  },
  {
    key: "services",
    path: "/services/",
    label: "Services",
    title: "Home Inspection Services | C&G",
    description:
      "Explore the visible and accessible systems commonly reviewed during a C&G home inspection, along with report expectations, limitations, and preparation guidance.",
    enabled: true,
    navigation: true,
    sitemap: true,
    breadcrumbs: [{ label: "Services", path: "/services/" }],
  },
  {
    key: "about",
    path: "/about/",
    label: "About",
    title: "About Clarence Gloss | C&G Home Inspection",
    description:
      "Meet Clarence Gloss and learn about C&G's construction-informed, plain-language approach to residential home inspections.",
    enabled: true,
    navigation: true,
    sitemap: true,
    breadcrumbs: [{ label: "About", path: "/about/" }],
  },
  {
    key: "areas",
    path: "/areas/",
    label: "Areas We Serve",
    title: "Home Inspection Service Areas | Los Angeles & Riverside Counties | C&G",
    description:
      "Serving Los Angeles County and Riverside County, subject to address, scheduling, travel, and project-scope confirmation.",
    enabled: true,
    navigation: true,
    sitemap: true,
    breadcrumbs: [{ label: "Areas We Serve", path: "/areas/" }],
  },
  {
    key: "faq",
    path: "/faq/",
    label: "FAQ",
    title: "Home Inspection FAQ | C&G",
    description:
      "Answers about inspection scope, access, attendance, reports, limitations, pricing, scheduling, and follow-up.",
    enabled: true,
    navigation: true,
    sitemap: true,
    breadcrumbs: [{ label: "FAQ", path: "/faq/" }],
  },
  {
    key: "resources",
    path: "/resources/",
    label: "Resources",
    title: "Home Inspection Resources | C&G",
    description:
      "Practical guides for preparing for a home inspection, understanding the report, and planning responsible follow-up.",
    enabled: true,
    navigation: true,
    sitemap: true,
    breadcrumbs: [{ label: "Resources", path: "/resources/" }],
  },
  {
    key: "contact",
    path: "/contact/",
    label: "Contact",
    title: "Request a Home Inspection | C&G",
    description:
      "Tell us about the property, your timing, and the type of inspection you need. We’ll review the details and follow up about availability.",
    enabled: true,
    navigation: true,
    sitemap: true,
    breadcrumbs: [{ label: "Contact", path: "/contact/" }],
  },
  {
    key: "ethics",
    path: "/ethics/",
    label: "Inspection Ethics",
    title: "Inspection Ethics and Independence | C&G",
    description:
      "Read C&G's inspection-independence policy, including the separation between home inspections and contracting services.",
    enabled: true,
    navigation: false,
    footer: true,
    sitemap: true,
    breadcrumbs: [{ label: "Inspection Ethics", path: "/ethics/" }],
  },
  {
    key: "privacy",
    path: "/privacy/",
    label: "Privacy",
    title: "Privacy | C&G Certified Home Inspector",
    description:
      "Learn what information the C&G inspection website receives, how contact requests are prepared, and how inspection information stays separate from contracting solicitation.",
    enabled: true,
    navigation: false,
    footer: true,
    sitemap: true,
    breadcrumbs: [{ label: "Privacy", path: "/privacy/" }],
  },
  ...(SAMPLE_REPORT_CLIENT_ENABLED ? [{
    key: "sample-report",
    path: "/sample-report/",
    label: "Sample Report",
    title: "Sample Home Inspection Report | C&G",
    description:
      "See how a C&G home inspection report organizes photographs, observations, limitations, and practical follow-up recommendations.",
    enabled: Boolean(sampleReportForRoute),
    navigation: false,
    footer: Boolean(approvedSampleReport),
    sitemap: Boolean(approvedSampleReport),
    noindex: Boolean(sampleReportPlaceholder && !approvedSampleReport),
    disabledReason: "Owner-approved, properly redacted sample report is required.",
    sampleReport: sampleReportForRoute,
    breadcrumbs: [{ label: "Sample Report", path: "/sample-report/" }],
  }] : []),
];

export const serviceAreaRouteDefinitions = approvedAreaPages.map((area) => ({
  key: `area-${area.id}`,
  path: `/areas/${area.id}/`,
  label: area.label,
  title: area.pageTitle,
  description: area.metaDescription,
  enabled: true,
  navigation: false,
  sitemap: true,
  serviceArea: area,
  breadcrumbs: [
    { label: "Areas We Serve", path: "/areas/" },
    { label: area.label, path: `/areas/${area.id}/` },
  ],
}));

export const articleRouteDefinitions = [
  ["preparing-for-a-home-inspection", "Preparing for a Home Inspection | C&G", "Prepare access, utilities, systems, pets, and property details so a home inspection can begin with fewer preventable limitations."],
  ["how-to-read-a-home-inspection-report", "How to Read a Home Inspection Report | C&G", "Understand observations, photographs, limitations, priorities, and specialist recommendations in a home inspection report."],
  ["home-inspection-vs-appraisal", "Home Inspection vs. Appraisal | C&G", "Learn how a condition-focused home inspection differs from a value-focused appraisal and why neither service replaces the other."],
  ["visible-and-accessible-conditions", "What Visible and Accessible Means | C&G", "Learn how access, safety, storage, finishes, weather, and property conditions affect a visual, non-invasive home inspection."],
  ["questions-to-ask-your-inspector", "Questions to Ask Your Home Inspector | C&G", "Use practical questions about scope, limitations, reports, conflicts, timing, credentials, and follow-up when choosing an inspector."],
  ["pre-listing-inspection-guide", "Pre-Listing Inspection Guide | C&G", "Prepare for a pre-listing inspection, understand its limits, and plan responsible report sharing and independent follow-up."],
  ["drainage-and-grading-basics", "Drainage and Grading Basics | C&G", "Understand visible water pathways, roof runoff, grading, hardscape, and the limits of a standard home inspection."],
  ["water-heater-basics", "Water Heater Basics | C&G", "Review the visible water-heater components commonly discussed in a home inspection and learn when specialist evaluation may be useful."],
  ["electrical-safety-basics", "Electrical Safety Basics | C&G", "Learn the visible electrical-system observations a home inspection may include and why the service is not a complete code or load analysis."],
  ["what-to-do-after-the-inspection", "What to Do After the Inspection | C&G", "Read the full report, clarify findings, seek qualified evaluations, and plan independent estimates and maintenance after an inspection."],
].map(([slug, title, description]) => ({
  key: `resource-${slug}`,
  path: `/resources/${slug}/`,
  label: title.split(" | ")[0],
  slug,
  title,
  description,
  enabled: true,
  navigation: false,
  sitemap: true,
  article: true,
  breadcrumbs: [
    { label: "Resources", path: "/resources/" },
    { label: title.split(" | ")[0], path: `/resources/${slug}/` },
  ],
}));

export const inspectorRoutes = [...coreRoutes, ...serviceAreaRouteDefinitions, ...articleRouteDefinitions];
export const enabledInspectorRoutes = inspectorRoutes.filter((route) => route.enabled);
export const inspectorNavigation = inspectorRoutes.filter((route) => route.enabled && route.navigation);
export const inspectorFooterRoutes = inspectorRoutes.filter((route) => route.enabled && route.footer);

const normalizedPath = (path = "/") => {
  const clean = path.split(/[?#]/, 1)[0] || "/";
  return clean === "/" ? "/" : `/${clean.replace(/^\/+|\/+$/g, "")}/`;
};

export const findInspectorRoute = (path) =>
  enabledInspectorRoutes.find((route) => route.path === normalizedPath(path)) || null;

export const inspectorNotFoundRoute = {
  key: "notFound",
  path: null,
  title: "Page Not Found | C&G Certified Home Inspector",
  description: "The requested C&G inspection page is not available.",
  breadcrumbs: [],
};
