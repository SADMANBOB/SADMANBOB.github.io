import { business } from "../../../shared/siteData.js";
import { inspectionBusinessNode } from "../../../shared/localBusinessSchema.js";
import { inspectorFaqItems } from "./faqs.js";
import { resourceBySlug } from "./resources.js";

// The published meta description for the site root. Reused verbatim as the
// business description so structured data never states anything the page does
// not already say.
const INSPECTION_BUSINESS_DESCRIPTION =
  "Construction-informed home inspections with clear explanations, detailed photos, and practical next steps for buyers, sellers, and homeowners in approved service areas.";

export const normalizeOrigin = (origin) => (origin || business.inspection.origin).replace(/\/+$/, "");
export const inspectorAbsoluteUrl = (path, origin) => `${normalizeOrigin(origin)}${path}`;

const breadcrumbSchema = (route, origin) => {
  if (!route.breadcrumbs?.length) return null;
  const items = [{ label: "Home", path: "/" }, ...route.breadcrumbs];
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: inspectorAbsoluteUrl(item.path, origin),
    })),
  };
};

export function buildInspectorSchema(route, origin) {
  const url = inspectorAbsoluteUrl(route.path || "/", origin);
  const siteOrigin = normalizeOrigin(origin);
  const businessId = `${siteOrigin}/#business`;
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: route.title,
      description: route.description,
      isPartOf: {
        "@type": "WebSite",
        "@id": `${siteOrigin}/#website`,
        url: `${siteOrigin}/`,
        name: business.inspection.publicName,
      },
    },
  ];

  // The business node is emitted on the site root and on the county service-area
  // pages. Those are the local-intent entry points, and the shared @id keeps
  // every copy identical rather than creating competing organisation nodes.
  if (route.path === "/" || route.serviceArea) {
    graph[0].about = { "@id": businessId };
    graph.push(inspectionBusinessNode({
      origin: siteOrigin,
      id: businessId,
      description: INSPECTION_BUSINESS_DESCRIPTION,
    }));
  }

  const breadcrumbs = breadcrumbSchema(route, origin);
  if (breadcrumbs) graph.push(breadcrumbs);

  if (route.key === "faq") {
    graph.push({
      "@type": "FAQPage",
      mainEntity: inspectorFaqItems.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    });
  }

  if (route.article) {
    const resource = resourceBySlug.get(route.slug);
    graph.push({
      "@type": "Article",
      headline: resource.title,
      description: route.description,
      datePublished: resource.published,
      dateModified: resource.modified,
      author: { "@type": "Organization", name: resource.author },
      publisher: { "@type": "Organization", name: business.inspection.publicName },
      mainEntityOfPage: url,
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
