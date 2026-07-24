// Local-business structured data helpers.
//
// Every field emitted here must be traceable to an approved record in
// siteData.js. The omissions below are deliberate and are asserted against the
// assembled output by scripts/verify-sites.mjs:
//
//   address / geo           no street address or coordinates are approved, and
//                           inventing either is a false local-search signal
//   openingHours            no hours are approved (OWNER_VERIFICATION.md)
//   priceRange              no pricing is approved
//   aggregateRating/review  no review has passed the review registry, so there
//                           is nothing to aggregate
//   foundingDate            no defensible start date is confirmed
//   numberOfEmployees       not confirmed
//
// `sameAs` is permitted only for the official CSLB licence lookup, which is an
// authoritative government record. It must never carry a social or directory
// profile, because none has been confirmed.
//
// The inspection business and the contracting business are separate nodes with
// separate @ids. They are never merged, because home inspection and contracting
// are separate services under the 12-month separation policy.

import { approvedServiceAreas, business } from "./siteData.js";

/**
 * Counties are the approved granularity. Individual cities appear in page copy
 * as representative communities, but only the counties carry an approved
 * metadata flag, so only counties enter structured data. This also avoids
 * implying a physical office in each city.
 */
export function approvedAreaServed() {
  return approvedServiceAreas("Metadata").map((area) => ({
    "@type": "AdministrativeArea",
    name: area.label,
  }));
}

/**
 * C&G Certified Home Inspector.
 *
 * ProfessionalService rather than HomeAndConstructionBusiness: a home
 * inspection is an advisory service and the inspector performs no construction.
 * Claiming a construction subtype would also blur the inspection/contracting
 * separation the site is built around.
 */
export function inspectionBusinessNode({ origin, id, description }) {
  return {
    "@type": "ProfessionalService",
    "@id": id,
    name: business.inspection.publicName,
    url: `${origin}/`,
    telephone: business.inspection.phoneE164,
    email: business.inspection.email,
    image: `${origin}/assets/cg-logo-mark.png`,
    logo: `${origin}/assets/cg-logo-mark.png`,
    description,
    serviceType: "Home inspection",
    areaServed: approvedAreaServed(),
  };
}

/**
 * The CSLB licence held by the contractor of record.
 *
 * Emitted as hasCredential with recognizedBy naming the issuing state board, so
 * the licence reads as a third-party-issued credential rather than a
 * self-assertion. The existing `identifier` PropertyValue is retained alongside
 * it because it already carries owner approval.
 */
export function contractorLicenceCredential() {
  const { license } = business.contracting;
  return {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "license",
    name: `California contractor license ${license.number}, classification ${license.classification}`,
    identifier: license.number,
    url: license.officialLookupUrl,
    recognizedBy: {
      "@type": "GovernmentOrganization",
      name: "California Contractors State License Board",
      url: "https://www.cslb.ca.gov/",
    },
  };
}

// Property names that must never appear anywhere in an emitted JSON-LD graph.
export const PROHIBITED_SCHEMA_FIELDS = Object.freeze([
  "address",
  "aggregateRating",
  "review",
  "reviews",
  "ratingValue",
  "openingHours",
  "openingHoursSpecification",
  "priceRange",
  "geo",
  "foundingDate",
  "numberOfEmployees",
  "award",
  "makesOffer",
  "hasOfferCatalog",
]);

// `sameAs` is allowed, but only pointing at the official licence record.
export const ALLOWED_SAME_AS = Object.freeze([
  business.contracting.license.officialLookupUrl,
]);
