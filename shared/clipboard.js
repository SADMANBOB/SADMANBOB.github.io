const validCopyText = (value) =>
  typeof value === "string"
  && value.length > 0
  && value.length <= 25_000
  && !value.includes("\u0000");

export async function copyPlainText(
  value,
  {
    navigatorImpl = globalThis.navigator,
    documentImpl = globalThis.document,
  } = {},
) {
  if (!validCopyText(value)) throw new Error("There are no request details to copy.");

  if (typeof navigatorImpl?.clipboard?.writeText === "function") {
    try {
      await navigatorImpl.clipboard.writeText(value);
      return;
    } catch {
      // Some browsers expose the modern API but deny it in the current
      // context. The user-triggered legacy path can still succeed.
    }
  }

  if (!documentImpl?.body || typeof documentImpl.createElement !== "function") {
    throw new Error("Copy is unavailable in this browser.");
  }

  const field = documentImpl.createElement("textarea");
  field.value = value;
  field.readOnly = true;
  field.setAttribute("aria-hidden", "true");
  field.style.position = "fixed";
  field.style.inset = "-9999px auto auto -9999px";
  const previouslyFocused = documentImpl.activeElement;
  documentImpl.body.append(field);
  let copied = false;
  try {
    field.select();
    copied = typeof documentImpl.execCommand === "function"
      && documentImpl.execCommand("copy");
  } finally {
    field.remove();
    if (typeof previouslyFocused?.focus === "function") {
      try {
        previouslyFocused.focus({ preventScroll: true });
      } catch {
        previouslyFocused.focus();
      }
    }
  }
  if (!copied) throw new Error("Copy is unavailable in this browser.");
}
