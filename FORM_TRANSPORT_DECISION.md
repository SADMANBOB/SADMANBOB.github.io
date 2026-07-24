# Lead form transport: owner decision required

The secure HTTPS submission path is implemented, tested and gated. It stays
disabled and production continues to use the mail-draft transport until the
items in "What the owner must supply" below are recorded in
`shared/siteData.js`.

Nothing in this document changes what the live site does today.

## Why this matters

The mail-draft transport hands the visitor a pre-filled `mailto:` draft. On a
phone with no configured mail app, that is a dead end on the highest-intent page
of the site. This is the largest single conversion risk in the project, and it
is a configuration decision rather than an engineering one.

## What already works

Both forms — `ContactRequestForm` (inspection) and `EstimateRequestForm`
(contracting) — already implement:

| Requirement | Status |
| --- | --- |
| HTTPS submission when approved | `submitApprovedForm` in `shared/integrationAdapters.js` |
| Mail-draft fallback | active in production today |
| Accessible labels | every control labelled; verified by the static gate |
| Accessible validation | `aria-invalid`, `aria-describedby`, `role="alert"` summary |
| Focus moves to the first error | error summary receives focus on failure |
| Required vs optional marked | required fields marked; optional hint per field |
| Loading state | submit button disabled with "Sending securely…" |
| Success state | `role="status"`, focus moved, receipt shown when returned |
| Failure state | `role="alert"`, recoverable, answers retained |
| Retry | explicit "Try again" control on both forms |
| Timeout | 15 s deadline via `AbortController` |
| Duplicate-submission prevention | disabled button plus an in-flight ref guard |
| Bot mitigation | honeypot field plus a minimum fill-time check |
| CAPTCHA integration point | `verificationToken` passthrough, no provider required |
| Server error sanitisation | processor text never surfaced to the visitor |
| No false booking claim | success copy promises follow-up, never an appointment |
| No silent failure | every path ends in a visible, announced state |
| Phone and email fallback | shown on every failure and blocked state |
| 12-month eligibility gate | unchanged, still evaluated before contact details |

### Timeout

Without a deadline, a stalled endpoint left the submit button disabled
indefinitely with no way to retry, losing the lead silently. `submitApprovedForm`
now aborts after `FORM_SUBMISSION_TIMEOUT_MS` (15 s) and surfaces the ordinary
recoverable failure state. A caller-supplied `signal` is still honoured.

### Spam controls and their limits

`shared/formSpamControls.js` adds a honeypot field and a 3-second minimum fill
time. Both fail open: a real visitor is never blocked for anything a human could
plausibly do, because a false positive silently loses a lead.

These are client-side hints only. GitHub Pages serves static files, so there is
no server-side rate limiting available. **An approved processor must apply its
own server-side abuse controls.** A blocked submission never claims delivery and
never names the control that caught it.

## What the owner must supply

The secure transport activates only when `secureInspectionFormTransport` and
`secureContractorFormTransport` in `shared/siteData.js` are approved. Each needs:

1. **Provider name** — e.g. Formspree, Basin, Web3Forms, or a first-party
   serverless endpoint.
2. **HTTPS endpoint** — must be `https:`, no credentials in the URL. The adapter
   rejects anything else.
3. **Allowed origin** — the provider must accept CORS from
   `https://www.cginspection.net` only.
4. **Recipient inbox** — currently `clarencegloss@gmail.com`. A domain mailbox
   is preferred but not required.
5. **Retention policy** — how long the provider stores submissions, and whether
   they can be deleted on request.
6. **Privacy wording** — the exact sentence naming the processor. The privacy
   page currently states that no third party receives form data; that sentence
   becomes false the moment this is enabled and **must** be updated in the same
   change.
7. **Spam-protection choice** — the provider's own server-side control, and
   whether a CAPTCHA is wanted. If so, its public site key goes in
   `publicConfig` and the token flows through `verificationToken`.
8. **Success and error contract** — the adapter accepts an optional
   `receipt` string matching `/^[a-z0-9_-]{6,128}$/i`.

### Hard constraints

- **No secret may be placed in client JavaScript.** The bundle is public. Only a
  publishable endpoint or public site key is acceptable. A provider requiring a
  private API key in the browser must be rejected.
- **Do not enable the transport before the privacy copy is updated.** The
  verification suite asserts the privacy page matches the actual transport, so
  enabling one without the other fails the build by design.
- **Uploads stay disabled.** `protectedUpload` remains pending and needs its own
  broker, host allowlist, MIME allowlist, size limits, malware controls and
  retention terms.

## Recommendation

A provider that accepts a plain HTTPS POST with a publishable form id and
applies its own spam filtering fits the existing adapter with no code change —
only registry configuration. Whichever is chosen, it must be selected and paid
for by the owner; no account was created as part of this work.
