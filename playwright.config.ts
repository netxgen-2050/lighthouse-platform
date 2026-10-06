import { defineConfig, devices } from "@playwright/test";

// BASE_URL apunta al preview de Vercel; sin BASE_URL se prueba contra un build local.
const puerto = process.env.PORT ?? "3000";
const baseURL = process.env.BASE_URL ?? `http://localhost:${puerto}`;
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: process.env.BASE_URL ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    extraHTTPHeaders: bypass
      ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" }
      : undefined,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: `pnpm build && pnpm start -p ${puerto}`, url: baseURL, reuseExistingServer: true, timeout: 180_000 },
});
