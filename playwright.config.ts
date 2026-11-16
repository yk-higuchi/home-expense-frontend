import { defineConfig, devices } from "@playwright/test";

const browser = {
  ...devices["Desktop Chrome"],
  ...(process.env.CI ? {} : { channel: "chrome" }),
  contextOptions: { reducedMotion: "reduce" as const },
};

export default defineConfig({
  reporter: process.env.CI ? "github" : "list",
  forbidOnly: Boolean(process.env.CI),
  projects: [
    {
      name: "storybook",
      testDir: "e2e/storybook",
      use: { ...browser, baseURL: "http://localhost:6007" },
    },
    {
      name: "app",
      testDir: "e2e/app",
      fullyParallel: false,
      use: {
        ...browser,
        baseURL: process.env.APP_URL ?? "http://localhost:3000",
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: process.argv.includes("--project=storybook")
    ? {
        command: "node scripts/serve-static.mjs packages/ui/storybook-static 6007",
        url: "http://localhost:6007/index.json",
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
