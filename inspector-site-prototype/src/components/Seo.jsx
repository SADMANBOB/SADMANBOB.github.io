import { useEffect } from "react";
import { buildInspectorSchema } from "../content/seo.js";

export function Seo({ route, canonicalUrl, siteOrigin }) {
  useEffect(() => {
    document.title = route.title;
    const setMeta = (attribute, key, content) => {
      let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };
    setMeta("name", "description", route.description);
    setMeta("property", "og:title", route.title);
    setMeta("property", "og:description", route.description);
    setMeta("property", "og:type", route.article ? "article" : "website");
    setMeta("property", "og:url", canonicalUrl);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", route.title);
    setMeta("name", "twitter:description", route.description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    let schema = document.getElementById("cg-page-schema");
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "cg-page-schema";
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify(buildInspectorSchema(route, siteOrigin));
  }, [canonicalUrl, route, siteOrigin]);

  return null;
}
