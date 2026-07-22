# Inspector production design QA

Final result: passed

## Visual source and evidence

- Accepted source: the generated “Know what you’re buying” concept retained in the local design workspace.
- Current evidence: 1093 × 900 desktop and 390 × 844 mobile captures retained in the local launch-audit folder.

## Fidelity ledger

1. Composition: passed. The implementation keeps the dark editorial hero, left-aligned “Know what you’re buying” statement, high-contrast booking action, and prominent inspection imagery.
2. Typography: passed. The large serif hierarchy, gold italic emphasis, compact sans-serif navigation, and quiet supporting copy remain faithful to the selected direction.
3. Color and surface: passed. Charcoal, warm cream, and restrained gold are used consistently across the full page-based system.
4. Imagery and branding: passed. The supplied C&G logo and established inspection imagery remain the visual anchors; every image has useful alternative text.
5. Content hierarchy: passed. Home is a focused entry point while Services, About, Areas, FAQ, Resources, and Contact hold deeper information on separate routes.
6. Responsive behavior: passed. The 1093 × 900 desktop view and 390 × 844 mobile view remain readable with no horizontal overflow, and the compact header exposes a working mobile menu.
7. Trust and compliance: passed. Fictional testimonials and unverified license, insurance, experience-duration, and turnaround claims were removed. The contractor sister-site bridge states the 12-month separation policy instead of promising a repair handoff.

## Functional checks

- Routes pass: `/`, `/services`, `/about`, `/areas`, `/faq`, `/resources`, `/contact`.
- Direct route reload and route-specific title/canonical updates pass.
- Mobile navigation opens and exposes booking and sister-site actions.
- Route changes move focus to the main content region.
- Booking CTAs resolve to the existing C&G Google Form.
- Phone links resolve to `tel:+13105056581`.
- Sister-site links resolve to `https://sadmanbob.github.io/contracting/`.
- Console warning/error check returned no entries.
- Production build passes with Vite 6.4.3 and zero npm audit findings.

## Deliberate differences from concept

- The concept’s “inspection-to-repair” handoff was removed because California Business and Professions Code §7197 prohibits repair offers or work on a property inspected by the same inspector/company during the prior 12 months.
- Same-day/next-day, 35-year, licensed, and insured claims were replaced with proof-neutral service language until owner documentation supports them.
- The prototype review carousel was replaced by an “Observe / Explain / Prioritize” clarity section so no invented customer proof can be mistaken for a real endorsement.
