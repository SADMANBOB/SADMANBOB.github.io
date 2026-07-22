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
cd inspector-site-prototype && VITE_BASE_PATH=/inspections/ npm run build
cd contractor-site-prototype && VITE_BASE_PATH=/contracting/ npm run build
```

Pushing `main` deploys the portal and both sites to GitHub Pages.

## Public facts and boundaries

- Phone: `(310) 505-6581`
- Email: `clarencegloss@gmail.com`
- Contractor of record: Coastal Construction Services
- California contractor license: CSLB #987643, B — General Building
- License verification: <https://www.cslb.ca.gov/987643>
- Home inspection and contracting are separate services. The contracting service does not offer or perform repairs on a property for which C&G prepared a home inspection report during the previous 12 months.

No fictional testimonials, fabricated project claims, or unverified turnaround/insurance claims are published.
