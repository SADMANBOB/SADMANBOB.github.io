# Browser QA

The browser suite runs the six approved viewport sizes against representative
inspection and contracting routes in Chromium, Firefox, and WebKit.

- Every browser checks the primary landmark, single page heading, loaded fonts,
  runtime errors, and horizontal overflow at every viewport.
- Chromium and WebKit also compare screenshots at a strict two-percent
  difference limit.
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
