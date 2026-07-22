# Contractor production design QA

Final result: passed

## Visual source and evidence

- Accepted source: generated desktop, lower-page, and mobile contractor concepts retained in the local design workspace.
- Current evidence: 1093 × 900 desktop and 390 × 844 mobile captures retained in the local launch-audit folder.

## Fidelity ledger

1. Composition: passed. The implementation preserves the split editorial hero, quiet mineral background, graphite header, strong left-aligned statement, and open service-row rhythm.
2. Typography: passed. Newsreader provides the architectural serif voice while DM Sans keeps navigation, legal, and project information compact and readable.
3. Color and surface: passed. Graphite, mineral paper, and copper remain the dominant tokens; there are no gradients, novelty badges, or generic card walls.
4. Imagery: passed. Original contractor photography was generated for the site and used as editorial brand imagery without claiming that it depicts a completed C&G project.
5. Content hierarchy: passed. Services, process, about, estimate, contractor-of-record information, and the 12-month service boundary each have a clear place without crowding the home page.
6. Responsive behavior: passed. The 1093 × 900 desktop view and 390 × 844 mobile view remain readable with no horizontal overflow; the mobile navigation opens and closes correctly.
7. Trust and compliance: passed. CSLB #987643 and the B — General Building classification are visible and linked to CSLB. The estimate flow blocks requests for C&G-inspected properties within the prior 12 months.

## Functional checks

- Routes pass: `/`, `/services`, `/process`, `/about`, `/estimate`.
- Direct route reload and route-specific title/canonical updates pass.
- Mobile navigation pass; `aria-expanded` and computed visibility update correctly.
- Estimate fields and native required controls render with accessible labels.
- Selecting “Yes” for a C&G inspection in the previous 12 months blocks the request before an email action.
- Phone, email, CSLB, inspector sister-site, and internal links resolve correctly.
- Console warning/error check returned no entries.
- Production build passes with Vite 6.4.3 and zero npm audit findings.

## Deliberate differences from concept

- The hero uses a single craftsperson performing finish work instead of two people reviewing plans, which is more action-oriented and avoids implying a specific past project.
- A slim, persistent CSLB line was added under the header because California internet advertising requires the license number.
- The lower pages include explicit scope-fit language and a 12-month inspection separation policy that were not fully represented in the visual concept.
