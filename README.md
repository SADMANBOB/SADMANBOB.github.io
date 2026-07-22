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
```

Pushing `main` deploys the portal and both sites to GitHub Pages.

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
