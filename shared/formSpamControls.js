// Bot and abuse controls for the public lead forms.
//
// GitHub Pages serves static files only, so there is no server-side rate limit
// or request inspection available. These controls are therefore client-side
// hints: they raise the cost of naive form-filling bots without ever blocking a
// real visitor, and an approved form processor is still expected to apply its
// own server-side spam controls.
//
// Nothing here is a substitute for provider-side abuse handling. It is
// deliberately conservative: a false positive would silently lose a lead, so
// every rule below fails open for anything a human could plausibly do.

// A field that is visually hidden and hidden from assistive technology. Real
// users never see it and screen readers never announce it, so any value in it
// came from something filling every input on the page.
export const HONEYPOT_FIELD = "cg-contact-reference";

// Naive bots submit within milliseconds of load. A human cannot complete these
// forms, which require an address and several selections, in under this time.
export const MINIMUM_FILL_MILLISECONDS = 3000;

export const honeypotFieldProps = Object.freeze({
  type: "text",
  name: HONEYPOT_FIELD,
  tabIndex: -1,
  autoComplete: "off",
  "aria-hidden": "true",
  defaultValue: "",
});

/**
 * @returns {{ blocked: boolean, reason: string | null }}
 */
export function evaluateSubmissionSignals({ honeypotValue, elapsedMilliseconds }) {
  if (String(honeypotValue || "").trim()) {
    return { blocked: true, reason: "honeypot" };
  }
  if (Number.isFinite(elapsedMilliseconds) && elapsedMilliseconds < MINIMUM_FILL_MILLISECONDS) {
    return { blocked: true, reason: "too-fast" };
  }
  return { blocked: false, reason: null };
}

// A blocked submission must never tell the sender which control caught it, and
// must never claim the request was delivered. The forms surface this as an
// ordinary failure with the phone and email fallbacks.
export const SPAM_BLOCKED_MESSAGE =
  "This request could not be sent automatically. Please call or email C&G directly and the request will be handled the same way.";
