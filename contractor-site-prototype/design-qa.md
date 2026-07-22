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

## Adaptive image framing regression — 2026-07-22

### Evidence and state

- Source visual truth: accepted contractor concepts and photography listed above, plus the live pre-fix rendering on the custom domain.
- Rendered implementation: `/tmp/cg-contractor-adaptive-image.png`, 1280 × 720 desktop capture of the home-page About section.
- State: `/contracting/`, About preview visible, default theme, navigation closed.
- Responsive states measured: 1280 × 720, 768 × 900, and 390 × 900 at DPR 1 for breakpoint checks.

### Findings and comparison history

1. Initial finding — P1: split-section images with HTML width/height attributes ignored their intended CSS aspect ratios. The home About image rendered about 552 × 1024, the Process readiness image about 552 × 1086, and the About story image about 500 × 1024.
2. Fix: restored `height: auto` in the global image reset. The home About and Process readiness images now use balanced 4:3 desktop frames and source-native 3:2 frames at stacked widths; the intentionally portrait-led About story keeps its art-directed 0.95 desktop and 1.15 stacked ratios.
3. Post-fix evidence: home About and Process readiness render about 552 × 414 on desktop, 680 × 453 at 768px, and 356 × 237 at 390px. The About story renders about 500 × 526 on desktop and remains focal-point safe at smaller widths. No horizontal overflow was detected.
4. Final pass: no actionable P0, P1, or P2 differences remain.

### Required fidelity surfaces

- Fonts and typography: unchanged; Newsreader and DM Sans remain consistent.
- Spacing and layout rhythm: passed; split sections no longer inherit image-file pixel heights.
- Colors and tokens: unchanged; graphite, mineral paper, and copper remain consistent.
- Image quality and fidelity: passed; people, tools, plans, and room context remain visible at every tested breakpoint.
- Copy and content: unchanged.
- Focused region comparison: the desktop About capture is sufficient because the regression was isolated to media geometry; all other fidelity surfaces were unchanged.

### Browser checks

- Meaningful DOM and page identity: passed.
- Framework error overlay: none.
- Console warnings/errors: none.
- Responsive checks: all three target widths passed without horizontal overflow.

final result: passed
