# C&G websites

This repository contains two related but visually distinct production websites:

- `inspector-site-prototype/` — C&G Certified Home Inspector
- `contractor-site-prototype/` — C&G Contracting Services
- `portal/` — a small service chooser for the root domain

## Local development

```sh
cd inspector-site-prototype && npm install && npm run dev
cd contractor-site-prototype && npm install && npm run dev
```

## Production builds

```sh
SITE_ORIGIN=https://www.cginspection.net npm run build
SITE_ORIGIN=https://www.cginspection.net npm run verify
SITE_ORIGIN=https://www.cginspection.net npm run quality
npm run monitor:live
```

Pushing `main` deploys the portal and both sites to GitHub Pages.

`npm run quality` rebuilds both sites, runs the authoritative verification
suite, and checks the assembled HTML, metadata, sitemaps, robots files,
internal links, fragments, accessible names, and output-size budgets. Pull
requests also run axe and Lighthouse audits in the pinned Chromium version
defined by the root lockfile.

The production build finishes with `npm run build:security`, which applies the
strict CSP to every assembled HTML file after Pagefind is generated.
`npm run verify` treats the exact policy and the absence of executable inline
code as release gates. See [`SECURITY_DECISION.md`](SECURITY_DECISION.md) for
the deployed threat boundary, CSP rationale and limitations, dependency-audit
decision, and remaining owner actions.

`npm run monitor:live` checks the deployed chooser, both services, both
lead-form entry pages, both downloadable contact cards, canonicals,
staging-content absence, and the neutral root 404. GitHub runs the same
read-only check every six hours and on demand while the scheduled workflow is
active. [GitHub automatically
disables schedules in a public repository after 60 days without repository
activity](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule),
so the owner must re-enable it or use an external uptime service if the
repository will be quiet that long.

## Temporary editorial photography

The current people-focused photography is a generated editorial placeholder set chosen to represent Black inspectors, contractors, craftspeople, and homeowners. It must not be described as employee, customer, or completed-project photography.

Replacement-ready image slots:

- Inspector: `hero-inspector.jpg`, `attic-inspection.jpg`, and `contracting-review.jpg`
- Contractor: `contractor-hero.jpg`, `finish-work.jpg`, and `project-planning.jpg`
- Illustrative contractor gallery: `illustrative-drywall-repair.jpg`, `illustrative-exterior-trim.jpg`, and `illustrative-finish-carpentry.jpg`

The three gallery cards include a public illustrative-imagery disclosure. Keep that disclosure until every gallery image has been replaced with verified C&amp;G project photography. Preserve the existing filenames and dimensions when swapping assets, and keep each editorial JPG below 450 KB.

## Public facts and boundaries

- Phone: `(310) 505-6581`
- Email: `clarencegloss@gmail.com`
- Contractor of record: Coastal Construction Services
- California contractor license: CSLB #987643, B — General Building
- License verification: <https://www.cslb.ca.gov/987643>
- Home inspection and contracting are separate services. The contracting service does not offer or perform repairs on a property for which C&G prepared a home inspection report during the previous 12 months.

No fictional testimonials, fabricated project claims, or unverified turnaround/insurance claims are published.

## Approval-gated additions

- `shared/reviewRegistry.js` contains 50 review slots. Every slot is pending by
  default, and the automatic carousel renders nothing until the testimonial
  claim plus the source URL, exact text, display attribution, permission date,
  and page surface are approved.
- `shared/siteData.js` gates booking, forms, analytics, maps, reviews, service
  areas, credentials, and business claims. Pending providers have no public
  configuration or renderable surface.
- `OWNER_VERIFICATION.md` is the owner handoff queue. It summarizes the
  evidence and decisions still required without changing any public gate.
