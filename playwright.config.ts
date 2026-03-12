import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command:
      "NODE_OPTIONS='--require ./node-compat.cjs' next dev --turbopack --port 3000",
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 120000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
