import {
  business,
  claimCanRenderOn,
  claims,
} from "../../../shared/siteData.js";
import { contractorFaqs } from "./faqs.js";

export function buildContractorSchema(route, origin) {
  const siteUrl = `${origin.replace(/\/+$/, "")}/`;
  const pageUrl = `${origin.replace(/\/+$/, "")}${route.path === "/" ? "/" : route.path}`;
  const websiteId = `${siteUrl}#website`;
  const contractorId = `${siteUrl}#contractor`;
  const graph = [
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: route.title,
      description: route.description,
      isPartOf: { "@id": websiteId },
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteUrl,
      name: business.contracting.publicName,
    },
  ];
  const publicIdentityApproved =
    claimCanRenderOn(claims.contractorPublicName, "contractor")
    && claimCanRenderOn(claims.contractorLicense, "contractor")
    && claims.contractorPublicName.publicCopy === business.contracting.publicBrandDisclosure;
  if (route.path === "/" && publicIdentityApproved) {
    graph[0].about = { "@id": contractorId };
    graph.push({
      "@type": "GeneralContractor",
      "@id": contractorId,
      name: business.contracting.contractorOfRecord,
      alternateName: business.contracting.publicName,
      url: siteUrl,
      telephone: business.contracting.phoneE164,
      email: business.contracting.email,
      description: business.contracting.publicBrandDisclosure,
      identifier: {
        "@type": "PropertyValue",
        name: "California contractor license",
        propertyID: "CSLB",
        value: business.contracting.license.number,
      },
      sameAs: [business.contracting.license.officialLookupUrl],
    });
  }
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
