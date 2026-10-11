import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run against the built site (`npm run build` first).
// CHROMIUM_PATH points at a preinstalled Chromium (e.g. in cloud sandboxes);
// without it Playwright uses its own browser (`npx playwright install chromium`).
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4322',
    launchOptions: process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npx astro preview --port 4322 --ignore-lock',
    url: 'http://localhost:4322',
    reuseExistingServer: !process.env.CI,
  },
});
