import { defineConfig, devices } from "@playwright/test";

// BASE_URL apunta al preview de Vercel; sin BASE_URL se prueba contra un build local.
const puerto = process.env.PORT ?? "3000";
const baseURL = process.env.BASE_URL ?? `http://localhost:${puerto}`;
const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const LISTA_DE_PRUEBA =
  "super@prueba.test=superadmin:usuario;admin@prueba.test=admin-tribu:usuario;persona@prueba.test=persona:inversor";

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  retries: process.env.BASE_URL ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    // Contra un preview de Vercel: el secreto para entrar y sin la barra de comentarios de Vercel
    // (vercel-live-feedback), que no es la app y atrapa el foco del teclado.
    extraHTTPHeaders: process.env.BASE_URL
      ? {
          "x-vercel-skip-toolbar": "1",
          ...(bypass ? { "x-vercel-protection-bypass": bypass, "x-vercel-set-bypass-cookie": "true" } : {}),
        }
      : undefined,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `pnpm build && pnpm start -p ${puerto}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 180_000,
        // El e2e local no depende de Vercel ni de Privy: entra con el modo de prueba y una lista de emails inventados
        // (los emails reales del equipo nunca van al repo). Sin app id de Privy, la app solo ofrece el modo de prueba.
        env: {
          LH_AUTH_PRUEBA: "1",
          LH_PERSONAS: LISTA_DE_PRUEBA,
          NEXT_PUBLIC_PRIVY_APP_ID: "",
          PRIVY_APP_SECRET: "",
          VERCEL_ENV: "",
        },
      },
});
