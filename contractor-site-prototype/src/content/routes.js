export const contractorRoutes = [
  { key: "home", path: "/", label: "Home", title: "C&G Contracting Services | Residential Repair and Finish Work", description: "Share a residential repair, finish-work, punch-list, or property-maintenance project with C&G Contracting Services for scope and eligibility review.", enabled: true },
  { key: "services", path: "/services/", label: "Services", title: "Residential Contracting Services | C&G", description: "Review residential repair, drywall, finish carpentry, punch-list, maintenance, exterior-detail, and small multi-trade project categories.", enabled: true },
  { key: "process", path: "/process/", label: "Process", title: "Contracting Process | C&G", description: "See how a C&G project moves from eligibility and scope review through a written estimate, scheduling, work, and final walkthrough.", enabled: true },
  { key: "about", path: "/about/", label: "About", title: "About C&G Contracting Services", description: "Learn how C&G Contracting Services defines residential project scope, identifies the contractor of record, and keeps inspection work separate.", enabled: true },
  { key: "projects", path: "/projects/", label: "Project Types", title: "Residential Project Types | C&G Contracting Services", description: "See representative residential repair and finish-work categories and learn what information helps C&G evaluate a project request.", enabled: true },
  { key: "faq", path: "/faq/", label: "FAQ", title: "Contractor FAQ | C&G Contracting Services", description: "Answers about project fit, estimates, eligibility, materials, permits, concealed conditions, specialty work, and scheduling.", enabled: true },
  { key: "estimate", path: "/estimate/", label: "Request Estimate", title: "Request a Residential Project Estimate | C&G", description: "Share project, property, access, timing, material, permit, and inspection-eligibility details for C&G review.", enabled: true },
  { key: "privacy", path: "/privacy/", label: "Privacy", title: "Contractor Privacy | C&G", description: "Read how information supplied in a C&G contracting project request is handled in the current website flow.", enabled: true },
];

export const enabledContractorRoutes = contractorRoutes.filter((route) => route.enabled);
export const contractorNavigation = enabledContractorRoutes.filter((route) => !["privacy"].includes(route.key));
export const contractorFooterRoutes = enabledContractorRoutes.filter((route) => !["home", "estimate"].includes(route.key));
export const contractorNotFoundRoute = { key: "notFound", path: null, label: "Page not found", title: "Page Not Found | C&G Contracting Services", description: "Return to C&G Contracting Services for residential repair and improvement information.", enabled: false, noindex: true };

export function findContractorRoute(path) {
  const normalized = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}/`;
  return enabledContractorRoutes.find((route) => route.path === normalized) || contractorNotFoundRoute;
}
