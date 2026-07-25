// Bot and abuse controls for the public lead forms.
//
// GitHub Pages serves static files only, so there is no server-side rate limit
// or request inspection available. These controls are therefore client-side
// hints: they raise the cost of naive form-filling bots, while an approved form
// processor is still expected to apply its own server-side spam controls.
//
// Nothing here is a substitute for provider-side abuse handling. It is
// deliberately narrow: only a populated concealed field or a finite fill time
// below the stated threshold blocks. Missing or non-finite timing data passes.

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
