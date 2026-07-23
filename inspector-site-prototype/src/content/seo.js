import { business } from "../../../shared/siteData.js";
import { inspectorFaqItems } from "./faqs.js";
import { resourceBySlug } from "./resources.js";

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
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: route.title,
      description: route.description,
      isPartOf: {
        "@type": "WebSite",
        "@id": `${normalizeOrigin(origin)}/#website`,
        url: `${normalizeOrigin(origin)}/`,
        name: business.inspection.publicName,
      },
    },
  ];

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
