import { business } from "../../../shared/siteData.js";
import { contractorFaqs } from "./faqs.js";

export function buildContractorSchema(route, origin) {
  const pageUrl = `${origin.replace(/\/+$/, "")}${route.path === "/" ? "/" : route.path}`;
  const graph = [{ "@type": "WebPage", "@id": `${pageUrl}#webpage`, url: pageUrl, name: route.title, description: route.description, isPartOf: { "@id": `${origin.replace(/\/+$/, "")}/#website` } }];
  if (route.path !== "/") {
    graph.push({ "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: business.contracting.publicName, item: `${origin.replace(/\/+$/, "")}/` }, { "@type": "ListItem", position: 2, name: route.label, item: pageUrl }] });
  }
  if (route.key === "faq") {
    graph.push({
      "@type": "FAQPage",
      mainEntity: contractorFaqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
