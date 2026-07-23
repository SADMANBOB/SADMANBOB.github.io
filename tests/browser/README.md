# Browser QA

The browser suite discovers every enabled inspection and contracting route,
adds the property-services chooser, and checks the complete route set in
Chromium, Firefox, and WebKit. When an approved registry record enables a new
area, report, or case-study route, that route enters the smoke suite
automatically.

- Every enabled route is checked at 1280 × 800 for its primary landmark, single
  page heading, loaded fonts, runtime errors, and horizontal overflow.
- Representative inspection and contracting routes repeat responsive checks at
  all six approved viewport sizes.
- Chromium and WebKit compare those representative screenshots at a strict
  two-percent difference limit.
- Screenshot filenames include the operating system because native text
  rasterization and font metrics differ between Darwin and Linux.
- Firefox remains a semantic and responsive-layout check because local macOS
  ARM Firefox cannot launch reliably in the current environment.

Run the committed comparisons:

```sh
npm run test:browsers
```

Refresh Darwin baselines only after visually reviewing an intentional UI
change:

```sh
npm run test:browsers -- --project=chromium --project=webkit --update-snapshots=all
```

Linux baselines must be generated with the same
`mcr.microsoft.com/playwright:v1.61.1-noble` image pinned in the quality
workflow, reviewed as images, and committed before restoring strict comparison
mode. Pull-request CI must never update snapshots automatically.
