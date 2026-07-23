# Inspector production design QA

Final result: passed

## Services visual-atlas comparison — 2026-07-22

### Source and rendered evidence

- Reference URL: `https://sites.google.com/view/cgcustom/services`
- Captured reference: `/tmp/cg-old-services-reference-1440x900.png`
- Reference capture pixels: 1086 × 894. The Google Sites browser chrome and canvas constrain the visible content, so the source is treated as visual direction rather than a pixel-identical viewport target.
- Rendered visual guide: `/tmp/cg-services-stable-cards-1024x768.png`, 1024 × 768 CSS pixels.
- Rendered category atlas: `/tmp/cg-services-stable-cards-final-1024x768.png`, 1024 × 768 CSS pixels.
- Rendered mobile guide: `/tmp/cg-services-current-mobile-atlas-390x844.png`, 390 × 844 CSS pixels.
- Rendered mobile cards: `/tmp/cg-services-current-mobile-cards-390x844.png`, 390 × 844 CSS pixels.
- Combined comparison input: `/tmp/cg-services-comparison-final.png`, 1920 × 700 pixels.
- State: `/services/`, default theme, navigation closed, visual guide or first category group in view.
- Density normalization: the reference and implementation captures were fitted into equal comparison panels without stretching; aspect ratios were preserved.

### Fidelity ledger

1. Composition: passed. The new page preserves the reference's image-led service overview and scannable category collection while introducing clearer grouped hierarchy and more deliberate spacing.
2. Typography: passed. The existing inspection site's serif display and compact sans-serif system remain authoritative; no second visual system was introduced.
3. Color and surface: passed. Charcoal, warm cream, and restrained gold remain consistent with the inspection site.
4. Imagery: passed. Only registry-approved editorial assets appear. The page explicitly states that they are not C&G client or project photographs.
5. Content hierarchy: passed. Eighteen physical inspection categories are grouped into Site & envelope, Structure & access, Core systems, and Interior living areas. The nineteenth canonical entry is rendered as a visually distinct scope boundary.
6. Interaction: passed. Every visual card links to its canonical detail section, the matching disclosure opens from the fragment, and disclosure triggers remain native buttons with `aria-expanded`, `aria-controls`, and labelled regions.
7. Responsive behavior: passed. The atlas uses four columns on wide desktop, two on tablet, and one on phone. Media frames preserve their intended crop, and no horizontal overflow was found.
8. Trust and compliance: passed. The design does not publish same-day-report, licensing, insurance, service-area, optional pool/spa, testimonial, or client-project claims from the reference.

### Deliberate improvements from the reference

- Replaced a long undifferentiated four-column list with four meaningful system groups and a separate limitations panel.
- Kept the complete scope available through progressive disclosure instead of forcing every line into the visual cards.
- Connected each summary card to the canonical `inspectionScope` registry so visible copy cannot drift into a second source of truth.
- Added explicit editorial-image disclosure and retained the existing responsive image-frame rules.
- Excluded the reference's pool/spa card and unsupported report-turnaround, credential, service-area, and business claims because they remain unverified.

### Browser and functional checks

- Exact viewport matrix: 360 × 800, 390 × 844, 768 × 1024, 1024 × 768, 1280 × 800, and 1440 × 900.
- Routes checked at every viewport: `/`, `/services/`, `/resources/how-to-read-a-home-inspection-report/`, `/contact/`, `/contracting/services/`, and `/contracting/estimate/`.
- Matrix result: 36 of 36 route-size checks passed with one H1, a non-empty title, no duplicate IDs, no broken loaded images, no horizontal overflow, and no console entries.
- Services interaction: category fragment navigation opened the matching detail; pointer toggling and same-fragment close/reopen passed.
- Mobile navigation: open state, Escape close, returned focus, and hidden closed state passed at 390 × 844.
- Inspection contact validation: empty submission produced a focused alert summary and eight invalid controls.
- Contractor estimate validation: empty submission produced a focused alert summary, nineteen invalid controls, and no success status.
- Root build: passed.
- Root verify: passed — 28 enabled routes, 19 inspector scope entries, 8 contractor entries, 10 image records, eligibility guards, structured data, sitemaps, forms, privacy truth, and legacy redirects.

### Visual iteration history

1. Initial atlas implemented with approved editorial media, grouped service cards, direct scope links, and a distinct boundary panel.
2. Tablet review found unused vertical space beneath the narrower editorial frame. The frame now fills the shared row height and crops with `object-fit: cover`.
3. Phone review increased card-title, detail, and action text sizes while retaining the one-column reading order.
4. Accessibility review darkened the atlas disclosure, group metadata, and card numbering to measured contrast ratios from 5.54:1 to 6.12:1, and added a 10.09:1 dark focus indicator on light cards and disclosures.
5. Interaction review found that a manually closed disclosure would stay closed when its already-current fragment link was activated again. Same-fragment activation now prevents the redundant navigation, reopens the canonical disclosure, and scrolls it into view.
6. Final source/implementation comparison and post-build browser regression found no actionable P0, P1, or P2 differences.

final result: passed

## Phases 1–5 experience-overhaul comparison — 2026-07-22

### Source and rendered evidence

- Accepted service-grid direction: `/var/folders/bh/40rsv2ms3hl_mlrd4rhqx_d00000gn/T/codex-clipboard-6276a94c-6e44-4696-a4e9-21ccd258e504.png`.
- Final inspection services render: `/tmp/cg-final-services-cards-1440x900.png`, 1440 × 900 CSS pixels.
- Final inspection mobile render: `/tmp/cg-final-inspector-390x844.png`, 390 × 844 CSS pixels.
- Final contracting mobile render: `/tmp/cg-final-contractor-390x844.png`, 390 × 844 CSS pixels.
- Above-fold copy: the existing inspector and contractor hero positioning remains intact. The only shared additions above the fold are the reciprocal service switcher, the separate-service disclosure, and local site search.

### Final comparison ledger

1. Composition: the reference's image-led, category-by-category scan pattern is preserved in a more structured atlas, with grouped sections, consistent cards, and a separate scope-boundary treatment.
2. Hierarchy: service switching is now the first utility decision, primary navigation remains business-specific, and page-level calls to action appear after decision-support content instead of competing with it.
3. Color and typography: the inspection site retains charcoal, cream, gold, serif display type, and compact sans-serif copy; the contractor site retains copper and graphite so the businesses feel related without becoming visually interchangeable.
4. Imagery: registry-approved editorial imagery keeps the established framing. Every non-client image remains described as editorial, and no unverified project or customer photograph is presented as C&G work.
5. Navigation and conversion: both headers expose the sibling service, identify it as a separate service, repeat the twelve-month separation rule, and provide context-matched contact or estimate actions.
6. Content and trust: process-based “Why C&G” material, educational inspection scenarios, contractor capability cards, and illustrative project briefs add decision support without inventing credentials, outcomes, customers, or reviews.
7. Search: each business has its own Pagefind index, so an inspection search cannot leak contractor pages and a contractor search cannot leak inspection pages.
8. Mobile behavior: the utility switcher, disclosure, menus, cards, forms, search dialogs, image frames, and calls to action collapse without horizontal overflow at the approved phone and tablet widths.

### Intentional deviations from the reference and inspiration sites

- Customer reviews and testimonials were not fabricated. Educational scenarios and illustrative project briefs are explicitly labelled as examples, not customer stories, actual findings, completed projects, or promised outcomes.
- Unsupported credentials, awards, experience counts, turnaround promises, service areas, pool/spa scope, and business-relationship claims remain absent until their registry records are approved.
- The source's long undifferentiated grid was changed to system groups and progressive disclosure to improve scanning, keyboard use, and small-screen reading.
- Inspection and contractor search results are intentionally isolated because the businesses have different scope, conversion, and legal boundaries.
- The inspection and contractor visual systems remain distinct instead of adopting another company's branding, copy, images, statistics, or proof.

### Final browser evidence

- Exact responsive matrix passed at 360 × 800, 390 × 844, 768 × 1024, 1024 × 768, 1280 × 800, and 1440 × 900 on both home routes, with visible reciprocal links and no horizontal overflow.
- The complete route sweep passed 56 of 56 checks: 28 enabled sitemap routes at 390 × 844 and 1440 × 900, each with one H1, a non-empty title, no duplicate IDs, no broken loaded images, and no horizontal overflow.
- Inspector search for “water heater” returned seven inspection-only URLs. Contractor search for “drywall” returned four contractor-only URLs. Escape closed each dialog and returned focus to its trigger.
- Inspector and contractor mobile menus opened with focus on the first link, closed on Escape, and returned focus to the menu button.
- Empty contractor-estimate submission produced a focused alert summary with 22 linked errors and no broken error-summary targets.
- Inspector scope fragment navigation, disclosure close, and same-fragment re-open all passed.

final result: passed
