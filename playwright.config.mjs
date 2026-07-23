import { defineConfig, devices } from "@playwright/test";

const ci = Boolean(process.env.CI);
const reportDirectory = ci ? "playwright-report" : "/tmp/cg-playwright-report";
const resultDirectory = ci ? "test-results/playwright" : "/tmp/cg-playwright-results";

export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  forbidOnly: ci,
  failOnFlakyTests: ci,
  retries: 0,
  workers: ci ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 8_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.02,
      scale: "css",
      threshold: 0.3,
    },
  },
  outputDir: resultDirectory,
  snapshotPathTemplate: "{testDir}/__screenshots__/{testFileName}/{arg}-{projectName}{ext}",
  reporter: ci
    ? [["line"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"], ["html", { open: "never", outputFolder: reportDirectory }]],
  use: {
    baseURL: "http://127.0.0.1:4177",
    colorScheme: "light",
    locale: "en-US",
    reducedMotion: "reduce",
    serviceWorkers: "block",
    timezoneId: "America/Los_Angeles",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command: "node tests/browser/static-server.mjs",
    url: "http://127.0.0.1:4177/",
    reuseExistingServer: false,
    timeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
