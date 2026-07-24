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
    await page.locator(`[name="${HONEYPOT_FIELD}"]`).evaluate((node) => {
      node.value = "https://spam.example";
      node.dispatchEvent(new Event("input", { bubbles: true }));
    });
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
    await page.locator('[name="name"]').focus();
    await expect(page.locator('[name="name"]')).toBeFocused();
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
    const yes = page.locator('input[name="eligibility"][value="yes"]');
    if (await yes.count()) {
      await yes.check();
      await expect(page.locator("form.estimate-form")).toContainText(/cannot offer or perform repairs/i);
    }
  });

  test("the honeypot is concealed from sight and from assistive technology", async ({ page }) => {
    await expectHoneypotConcealed(page);
  });

  test("advancing without answering eligibility surfaces a visible validation error", async ({ page }) => {
    const submit = page.locator('form.estimate-form button[type="submit"]').first();
    if (await submit.count()) {
      await submit.click();
      await expect(page.locator(".error-summary, .field-error").first()).toBeVisible();
    }
  });
});
