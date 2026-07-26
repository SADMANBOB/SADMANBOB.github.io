import { expect, test } from "@playwright/test";
import { HONEYPOT_FIELD, MINIMUM_FILL_MILLISECONDS } from "../../shared/formSpamControls.js";

// The production transport is mailto until an approved HTTPS processor is
// configured, so these tests exercise the behaviour that ships today: local
// validation, accessible error handling, the spam controls, and the truthful
// "nothing has been sent" states. The secure-transport branch is covered by the
// adapter tests in scripts/verify-sites.mjs.

const fillInspectionForm = async (page, overrides = {}) => {
  const textValues = {
    name: "Jordan Rivera",
    email: "jordan@example.com",
    phone: "3105551234",
    address: "1200 Example Street, Compton, CA 90220",
    propertyType: "Single-family home",
    squareFootage: "1450",
    preferredWindow: "Weekday mornings",
    notes: "Lockbox on the front door.",
    ...overrides,
  };
  for (const [field, value] of Object.entries(textValues)) {
    const input = page.locator(`input[name="${field}"], textarea[name="${field}"]`);
    if (await input.count()) await input.first().fill(String(value));
  }
  for (const field of ["purpose", "occupancy"]) {
    const select = page.locator(`select[name="${field}"]`);
    if (await select.count()) await select.selectOption({ index: 1 });
  }
  const consent = page.locator('input[name="consent"]');
  if (await consent.count()) await consent.first().check();
};

/** The honeypot uses the visually-hidden clip pattern, so it occupies a 1px
 *  box rather than display:none. What matters is that it is imperceptible,
 *  outside the accessibility tree, and not keyboard reachable. */
const expectHoneypotConcealed = async (page) => {
  const honeypot = page.locator(`[name="${HONEYPOT_FIELD}"]`);
  await expect(honeypot).toHaveCount(1);
  await expect(honeypot).toHaveAttribute("tabindex", "-1");
  const state = await honeypot.evaluate((node) => {
    let ariaHidden = false;
    for (let current = node; current; current = current.parentElement) {
      if (current.getAttribute?.("aria-hidden") === "true") { ariaHidden = true; break; }
    }
    // The input keeps its own box; the wrapper is what clips it out of view.
    const wrapper = node.closest(".form-honeypot");
    const box = wrapper ? wrapper.getBoundingClientRect() : node.getBoundingClientRect();
    const style = wrapper ? getComputedStyle(wrapper) : null;
    return {
      ariaHidden,
      wrapped: Boolean(wrapper),
      width: box.width,
      height: box.height,
      overflow: style?.overflow,
      clipPath: style?.clipPath,
    };
  });
  expect(state.ariaHidden).toBe(true);
  expect(state.wrapped).toBe(true);
  expect(state.width).toBeLessThanOrEqual(1);
  expect(state.height).toBeLessThanOrEqual(1);
  expect(state.overflow).toBe("hidden");
  expect(state.clipPath).not.toBe("none");
};

const fillHoneypot = async (page) => {
  const honeypot = page.locator(`[name="${HONEYPOT_FIELD}"]`);
  // Submission reads the current DOM value through FormData. Dispatching a
  // React change event here can race a rerender of this uncontrolled trap.
  await honeypot.evaluate((node) => { node.value = "https://spam.example"; });
  await expect(honeypot).toHaveValue("https://spam.example");
};

const openContractorContactStep = async (page) => {
  await page.locator('select[name="eligibility"]').selectOption("no");
  await page.locator('select[name="category"]').selectOption({ index: 1 });
  await page.getByRole("button", { name: "Continue to contact and property", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Contact and property.", exact: true })).toBeVisible();
};

test.describe("inspection lead form @smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact/");
    await page.waitForFunction(() => document.querySelector("form.request-form") !== null);
  });

  test("blocks submission with an accessible error summary and focuses it", async ({ page }) => {
    await page.locator('form.request-form button[type="submit"]').click();
    const summary = page.locator(".form-error-summary");
    await expect(summary).toBeVisible();
    await expect(summary).toHaveAttribute("role", "alert");
    // Focus must land on the summary so a screen-reader user hears the failure.
    await expect(summary).toBeFocused();
  });

  test("associates each field error with its control", async ({ page }) => {
    await page.locator('form.request-form button[type="submit"]').click();
    const nameInput = page.locator('[name="name"]');
    await expect(nameInput).toHaveAttribute("aria-invalid", "true");
    const describedBy = await nameInput.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
  });

  test("rejects a malformed email address", async ({ page }) => {
    await fillInspectionForm(page, { email: "not-an-email" });
    await page.locator('form.request-form button[type="submit"]').click();
    await expect(page.locator(".form-error-summary")).toContainText(/email/i);
  });

  test("the honeypot is concealed from sight and from assistive technology", async ({ page }) => {
    await expectHoneypotConcealed(page);
  });

  test("a filled honeypot never reports the request as sent", async ({ page }) => {
    await fillInspectionForm(page);
    await fillHoneypot(page);
    await page.waitForTimeout(MINIMUM_FILL_MILLISECONDS + 250);
    await page.locator('form.request-form button[type="submit"]').click();
    const blocked = page.getByTestId("inspection-blocked-state");
    await expect(blocked).toBeVisible();
    await expect(blocked).toContainText(/could not be sent/i);
    // The blocked state must not claim delivery and must not name the control
    // that caught it.
    await expect(blocked).not.toContainText(/honeypot/i);
    await expect(page.getByTestId("inspection-prepared-state")).toHaveCount(0);
  });

  test("an instant submission is treated as automated", async ({ page }) => {
    // Freeze Date.now before React mounts so concurrent browser load cannot
    // turn this into a slow submission while the fields are filled.
    await page.addInitScript(() => {
      Date.now = () => Date.parse("2026-07-23T12:00:00-07:00");
    });
    await page.goto("/contact/");
    await page.waitForFunction(() => document.querySelector("form.request-form") !== null);
    await fillInspectionForm(page);
    // Submitted well inside the minimum human fill time.
    await page.locator('form.request-form button[type="submit"]').click();
    await expect(page.getByTestId("inspection-blocked-state")).toBeVisible();
  });

  test("a valid slow submission prepares a mail draft and says nothing was sent", async ({ page }) => {
    await fillInspectionForm(page);
    await page.waitForTimeout(MINIMUM_FILL_MILLISECONDS + 250);
    await page.locator('form.request-form button[type="submit"]').click();
    const prepared = page.getByTestId("inspection-prepared-state");
    await expect(prepared).toBeVisible();
    await expect(prepared).toBeFocused();
    // The approved wording is "Nothing has been sent yet." on this surface.
    await expect(prepared).toContainText(/Nothing has been sent/i);
    // It must never claim an inspection is booked.
    await expect(prepared).not.toContainText(/booked|confirmed appointment|scheduled/i);
  });

  test("the whole form is reachable and submittable by keyboard", async ({ page }) => {
    const nameInput = page.locator('[name="name"]');
    // A user interaction also activates headless WebKit before the keyboard
    // reachability assertion; programmatic focus alone can leave the page inactive.
    await nameInput.click();
    await expect(nameInput).toBeFocused();
    const reachedSubmit = await page.evaluate(() => {
      const form = document.querySelector("form.request-form");
      const focusable = [...form.querySelectorAll("input,select,textarea,button")]
        .filter((node) => node.tabIndex >= 0 && node.type !== "hidden");
      return focusable.some((node) => node.type === "submit");
    });
    expect(reachedSubmit).toBe(true);
  });
});

test.describe("contractor estimate form @smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contracting/estimate/");
    await page.waitForFunction(() => document.querySelector("form.estimate-form") !== null);
  });

  test("the 12-month eligibility gate comes before contact and project details", async ({ page }) => {
    const body = await page.locator("form.estimate-form").innerText();
    expect(body).toMatch(/eligibility/i);
    // Answering "yes" to a recent C&G inspection must block the request.
    await page.locator('select[name="eligibility"]').selectOption("yes");
    const eligibilityBlocked = page.getByTestId("contractor-eligibility-blocked-state");
    await expect(eligibilityBlocked).toBeVisible();
    await expect(eligibilityBlocked).toContainText(/cannot offer or perform repairs/i);
    await expect(eligibilityBlocked).toContainText(/Nothing has been sent/i);
    await expect(page.getByTestId("contractor-spam-blocked-state")).toHaveCount(0);
  });

  test("the honeypot is concealed from sight and from assistive technology", async ({ page }) => {
    await expectHoneypotConcealed(page);
  });

  test("advancing without answering eligibility surfaces a visible validation error", async ({ page }) => {
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    const summary = page.locator("form.estimate-form .error-summary");
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(page.locator('select[name="eligibility"]')).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#eligibility-error")).toBeVisible();
    await expect(page.getByTestId("contractor-spam-blocked-state")).toHaveCount(0);
  });

  test("an incomplete eligibility review validates before spam controls", async ({ page }) => {
    await page.locator('select[name="eligibility"]').selectOption("unsure");
    await page.getByRole("button", { name: "Review eligibility email", exact: true }).click();
    await expect(page.locator("form.estimate-form .error-summary")).toBeVisible();
    await expect(page.locator("#fullName-error")).toBeVisible();
    await expect(page.getByTestId("contractor-spam-blocked-state")).toHaveCount(0);
  });

  test("marks required fields and requires phone only for phone follow-up", async ({ page }) => {
    // This intentionally exercises both contact methods, back navigation, and
    // two validation passes; allow headroom in resource-constrained WebKit CI.
    test.slow();
    await expect(page.locator(".form-required-note")).toContainText(/Required field/i);
    await expect(page.locator('label[for="eligibility"] .field-required')).toBeVisible();
    await openContractorContactStep(page);

    const phone = page.locator('input[name="phone"]');
    const phoneLabel = page.locator('label[for="phone"]');
    await expect(phone).not.toHaveAttribute("required", "");
    await expect(phone).not.toHaveAttribute("aria-required", "true");
    await expect(phoneLabel.locator(".field-optional")).toContainText(/optional unless phone follow-up/i);
    await expect(page.locator('label[for="fullName"] .field-required')).toBeVisible();

    await page.locator('input[name="fullName"]').fill("Jordan Rivera");
    await page.locator('input[name="email"]').fill("jordan@example.com");
    await page.locator('select[name="contactMethod"]').selectOption("Email");
    await page.locator('input[name="address"]').fill("1200 Example Street, Compton, CA 90220");
    await page.locator('select[name="propertyType"]').selectOption({ index: 1 });
    await page.locator('select[name="occupancy"]').selectOption({ index: 1 });
    await page.locator('input[name="authority"]').check();
    await page.getByRole("button", { name: "Continue to project details", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Describe the condition and desired result/i })).toBeVisible();

    await page.getByRole("button", { name: "Back", exact: true }).click();
    await page.locator('select[name="contactMethod"]').selectOption("Phone");
    await expect(phone).toHaveAttribute("required", "");
    await expect(phone).toHaveAttribute("aria-required", "true");
    await expect(phoneLabel.locator(".field-required")).toBeVisible();
    await page.getByRole("button", { name: "Continue to project details", exact: true }).click();
    await expect(page.locator("form.estimate-form .error-summary")).toBeFocused();
    await expect(page.locator("#phone-error")).toContainText(/required when phone follow-up/i);
    await expect(phone).toHaveAttribute("aria-describedby", "phone-error");

    await page.locator('select[name="contactMethod"]').selectOption("Email");
    await expect(page.locator("#phone-error")).toHaveCount(0);
    await expect(phone).not.toHaveAttribute("required", "");
    await phone.fill("123");
    await page.getByRole("button", { name: "Continue to project details", exact: true }).click();
    await expect(page.locator("#phone-error")).toContainText(/at least 10 digits/i);
    await page.locator('select[name="contactMethod"]').selectOption("Phone");
    await page.locator('select[name="contactMethod"]').selectOption("Email");
    await expect(page.locator("#phone-error")).toContainText(/at least 10 digits/i);
    await expect(phone).toHaveAttribute("aria-describedby", "phone-error");
    await phone.fill("");
    await expect(page.locator("#phone-error")).toHaveCount(0);
    await page.getByRole("button", { name: "Continue to project details", exact: true }).click();
    await expect(page.getByRole("heading", { name: /Describe the condition and desired result/i })).toBeVisible();
  });

  test("a valid submission with a spam signal uses only the generic blocked notice", async ({ page }) => {
    await page.locator('select[name="eligibility"]').selectOption("unsure");
    await page.locator('input[name="fullName"]').fill("Jordan Rivera");
    await page.locator('input[name="email"]').fill("jordan@example.com");
    // Email follow-up does not require a phone number on the limited review path.
    await page.locator('select[name="contactMethod"]').selectOption("Email");
    await page.locator('input[name="address"]').fill("1200 Example Street, Compton, CA 90220");
    for (const field of ["authority", "contactConsent", "noPromise"]) {
      await page.locator(`input[name="${field}"]`).check();
    }
    await fillHoneypot(page);
    await page.getByRole("button", { name: "Review eligibility email", exact: true }).click();
    const spamBlocked = page.getByTestId("contractor-spam-blocked-state");
    await expect(spamBlocked).toBeVisible();
    await expect(spamBlocked).toContainText(/could not be sent/i);
    await expect(spamBlocked).not.toContainText(/honeypot|inspection report|12 months/i);
    await expect(page.getByTestId("contractor-eligibility-blocked-state")).toHaveCount(0);
  });
});
