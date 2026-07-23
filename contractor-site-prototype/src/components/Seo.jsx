import { useEffect } from "react";
import { buildContractorSchema } from "../content/seo.js";

const ensureMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) { element = document.createElement("meta"); document.head.append(element); }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
};

export function Seo({ route, origin }) {
  useEffect(() => {
    const canonical = `${origin.replace(/\/+$/, "")}${route.path === "/" ? "/" : route.path}`;
    document.title = route.title;
    ensureMeta('meta[name="description"]', { name: "description", content: route.description });
    ensureMeta('meta[property="og:title"]', { property: "og:title", content: route.title });
    ensureMeta('meta[property="og:description"]', { property: "og:description", content: route.description });
    ensureMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
    ensureMeta('meta[name="twitter:title"]', { name: "twitter:title", content: route.title });
    ensureMeta('meta[name="twitter:description"]', { name: "twitter:description", content: route.description });
    if (route.noindex) ensureMeta('meta[name="robots"]', { name: "robots", content: "noindex,follow" });
    else document.head.querySelector('meta[name="robots"]')?.remove();
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.append(link); }
    link.href = canonical;
    let script = document.head.querySelector('script[data-site-schema="contractor"]');
    if (!script) { script = document.createElement("script"); script.type = "application/ld+json"; script.dataset.siteSchema = "contractor"; document.head.append(script); }
    script.textContent = JSON.stringify(buildContractorSchema(route, origin));
  }, [origin, route]);
  return null;
}
