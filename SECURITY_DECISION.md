# C&G production security decision

This document records the security boundary for the production C&G websites.
It does not approve any pending business claim, integration, provider, or
publication record. The executable publication gates in `shared/siteData.js`
and the other registries remain authoritative.

## Deployed threat boundary

Production is a static GitHub Pages deployment at
`https://www.cginspection.net`. The published surface contains HTML, CSS,
JavaScript, images, fonts, the same-origin Pagefind search runtime, and a
same-origin Pagefind Web Worker. There is no application server, database,
authenticated account area, public analytics provider, form processor, or
file-upload service in the approved production configuration.

The browser and GitHub Pages are therefore the primary runtime boundary.
Repository write access and the GitHub Actions deployment path are privileged:
code accepted into `main` can become public site code.

## Content Security Policy

Every generated HTML document receives exactly this CSP as an early
`http-equiv="Content-Security-Policy"` meta element:

```text
default-src 'none'; base-uri 'none'; object-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; worker-src 'self'; child-src 'self'; frame-src 'none'; media-src 'none'; manifest-src 'none'; form-action 'self' mailto:; upgrade-insecure-requests
```

The policy intentionally has no wildcard source, third-party runtime origin,
`'unsafe-inline'`, or general `'unsafe-eval'`. `script-src 'self'` permits the
versioned site and Pagefind scripts. Pagefind loads its same-origin worker,
same-origin index fragments, and WebAssembly runtime; `worker-src 'self'`,
`child-src 'self'`, `connect-src 'self'`, and the narrowly scoped
`'wasm-unsafe-eval'` token support that runtime. `data:` is limited to images.
Form navigation is limited to the site itself and the current `mailto:`
fallback.

`npm run build` runs the dedicated `npm run build:security` phase after the
site and search output are assembled. `npm run verify` checks the policy and
rejects executable inline scripts, inline styles, inline event handlers,
JavaScript URLs, or generated pages that are missing the exact policy. Keep the
security phase after Pagefind so every final HTML file is covered.

### GitHub Pages limitation

A meta policy cannot enforce `frame-ancestors`, CSP reporting directives, or
other response headers. GitHub Pages does not provide repository-controlled
arbitrary HTTP response headers, so those controls cannot be claimed here.
`frame-src 'none'` prevents the site from loading frames but does not prevent
another site from framing C&G. Moving behind an owner-approved,
header-capable edge would be required to add `frame-ancestors 'none'`,
reporting, and related headers. No such provider is approved by this decision.

## Deployment dependency integrity

Production workflows must reference every GitHub Action by a reviewed,
immutable 40-character commit SHA. A nearby version comment may preserve human
readability, but a mutable major or release tag is not an acceptable execution
reference. This applies to both `.github/workflows/deploy-pages.yml` and
`.github/workflows/quality.yml`; future action upgrades must verify and review
the replacement commit before changing the pin. The custom domain and existing
quality or publication gates must remain unchanged during an action upgrade.

## Forms and abuse controls

The public forms perform local validation and currently open a pre-addressed
mail draft. They do not transmit form data to GitHub Pages or store it in the
site. Honeypot and minimum-completion-time checks reduce low-effort automated
submissions, but they execute in the visitor's browser and are therefore
observable and bypassable. They are usability filters, not a server-side
security boundary.

If the owner later approves an HTTPS processor, that provider must add
server-side validation, rate limiting, abuse detection, retention and deletion
rules, privacy handling, and receipt behavior. No endpoint, credential, upload
broker, analytics identifier, or provider is approved by this document.

## Dependency review

The production dependency audits for the root deployment and both site
packages report zero vulnerabilities when run with `--omit=dev`.

The root development audit currently reports 10 transitive advisories
(7 high, 1 moderate, and 2 low), all reachable through the development-only
`@lhci/cli@0.15.1` Lighthouse toolchain. That package is not shipped in the
static site. The affected utilities process local or CI Lighthouse inputs, not
public requests handled by the deployed website. `0.15.1` is the current
available LHCI release, and npm's suggested forced downgrade to an older LHCI
release is not an acceptable security fix. Do not add overrides or weaken the
audit gate solely to hide this result. Re-evaluate the chain when LHCI publishes
a compatible update, and keep the production audit at zero.

Reproduce the dependency boundary with:

```sh
npm audit --omit=dev --audit-level=low
npm --prefix inspector-site-prototype audit --omit=dev --audit-level=low
npm --prefix contractor-site-prototype audit --omit=dev --audit-level=low
npm audit --audit-level=low
```

## Owner actions

- Keep GitHub organization/repository access least-privileged, require
  multi-factor authentication, and review branch protection and Pages
  environment approvals in GitHub.
- Verify the `www.cginspection.net` property in Google Search Console through
  an owner-controlled account, then submit
  `https://www.cginspection.net/sitemap.xml` and monitor indexing/security
  notices. Record the verification method privately; do not commit a token,
  DNS value, or account identifier unless its publication is deliberately
  approved.
- Reassess the CSP if any analytics, form, map, review, booking, media, upload,
  or other third-party runtime is proposed. Do not loosen the policy before the
  provider and its privacy/security behavior are approved.
- Continue the evidence and publication review in `OWNER_VERIFICATION.md`.

## Release checks

Before publishing:

```sh
SITE_ORIGIN=https://www.cginspection.net npm run build
SITE_ORIGIN=https://www.cginspection.net npm run verify
SITE_ORIGIN=https://www.cginspection.net npm run quality
npm run readiness
npm run release:verify
npm run audit:a11y
npm run test:browsers:smoke
npm run test:visual
git diff --check
```

Review dependency audit output and the exact workflow pins separately; neither
is replaced by a successful static build.
