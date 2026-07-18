import { defineConfig } from "@playwright/test";

const PORT = 3001;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Serialized: the Next dev server used by webServer below hits Windows
  // EPERM rename collisions when two tests trigger concurrent on-demand
  // compilation of different routes against the same dev server.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    // Production server, not `next dev`: the dev server's on-demand
    // per-route compilation hits Windows EPERM rename races under this
    // environment when navigating between routes during the test run.
    command: `next build && next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
