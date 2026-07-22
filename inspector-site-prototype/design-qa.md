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

## Adaptive image framing regression — 2026-07-22

### Comparison target

- Source visual truth: `/var/folders/bh/40rsv2ms3hl_mlrd4rhqx_d00000gn/T/TemporaryItems/NSIRD_screencaptureui_9UZYAO/Screenshot 2026-07-22 at 9.40.45 AM.png`
- Source pixels: 1904 × 2264; user-supplied Chrome capture with unknown CSS viewport and density.
- Normalized live-before evidence: `/tmp/cg-image-before.png`, 1280 × 720 capture at a 1280 × 720 CSS viewport and browser-reported DPR 2.
- Rendered implementation: `/tmp/cg-image-after.png`, 1280 × 720 capture at the same CSS viewport and state.
- Combined comparison input: `/tmp/cg-adaptive-image-comparison.png`, 1604 × 1571.
- Responsive evidence: `/tmp/cg-adaptive-image-mobile.png`, 390 × 844 CSS viewport at DPR 1.
- State: `/contact/`, sister-service section visible, default theme, navigation closed.

### Findings and comparison history

1. Initial finding — P1: the `height="1024"` presentation attribute remained authoritative because the global image reset did not specify `height: auto`. At the 1280px live viewport, `.sister-image-wrap img` rendered 548.5 × 1024 despite its intended aspect-ratio rule, producing the extreme portrait crop shown by the user.
2. Fix: restored responsive intrinsic sizing in the global image reset, gave the sister-service image a 4:3 desktop frame, and changed it to the source-native 3:2 frame below 800px. `object-fit: cover` remains for clean edge-to-edge framing, with a centered focal position.
3. Post-fix evidence: the same desktop image renders 548.5 × 411.4 at 4:3; at 768px it renders 600 × 400; at 390px it renders 360 × 240. All three people, the plans, and the tablet remain visible, with no horizontal overflow.
4. Final pass: no actionable P0, P1, or P2 differences remain.

### Required fidelity surfaces

- Fonts and typography: unchanged; Libre Baskerville and DM Sans hierarchy and wrapping remain intact.
- Spacing and layout rhythm: passed; the corrected media height now balances the adjacent copy instead of forcing a 1248px-tall section.
- Colors and tokens: unchanged; charcoal, cream, and gold tokens remain consistent.
- Image quality and fidelity: passed; the original 1536 × 1024 asset is sharp, uncropped at stacked widths, and only lightly art-directed at desktop.
- Copy and content: unchanged; service-separation language and CTA remain intact.
- Focused region comparison: required because the defect was localized to image geometry; the combined comparison clearly shows the subject/context restored.

### Browser checks

- Page identity and meaningful DOM: passed.
- Framework error overlay: none.
- Console warnings/errors: none.
- Interaction: `Review inspection services` navigated from `/contact/` to `/services/` and updated the title and H1.
- Responsive checks: 1280 × 720, 768 × 900, and 390 × 844 passed with no horizontal overflow.

final result: passed
