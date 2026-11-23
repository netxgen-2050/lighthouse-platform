import AxeBuilder from "@axe-core/playwright";
import { aceptarPaso } from "./ayudas";
import type { Route } from "@playwright/test";
import { expect, test, type Page } from "./fixtura";

// Corre contra el build con NEXT_PUBLIC_LH_LOGIN=neon-auth (proyecto "neon-auth" de playwright.config.ts), sin Neon Auth
// configurado en el servidor: lo que responde Neon Auth se simula desde el navegador interceptando /api/auth/**.

test.use({ rol: "ninguno", consentimiento: "ninguno" });

const barra = (page: Page) => page.getByRole("banner");
const dialogo = (page: Page, nombre: "Crear tu cuenta" | "Entrar") => page.getByRole("dialog", { name: nombre });
// Dentro del diálogo del paso: la página tiene otros campos "Tu email (opcional)" (reportes).
const campoEmail = (page: Page) => page.getByRole("dialog").getByLabel("Tu email", { exact: true });
// Los alert de la página (anunciador de rutas de Next) no cuentan: solo el del diálogo.
const alerta = (page: Page) => page.getByRole("dialog").getByRole("alert");
const campoCodigo =(page: Page) => page.getByRole("dialog").getByLabel("Código", { exact: true });

/** Anota los pedidos de la página a `/api/auth/` (para probar que no sale ninguno antes de aceptar). */
function espiarAuth(page: Page): string[] {
  const pedidos: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/auth/")) pedidos.push(`${r.method()} ${new URL(r.url()).pathname}`);
  });
  return pedidos;
}

type Respuestas = { pedirCodigo?: { status: number; cuerpo: unknown }; entrar?: { status: number; cuerpo: unknown } };

async function simularNeonAuth(page: Page, r: Respuestas) {
  await page.route("**/api/auth/**", async (ruta: Route) => {
    const { pathname } = new URL(ruta.request().url());
    const elegida = pathname.includes("send-verification-otp") ? r.pedirCodigo : pathname.includes("sign-in/email-otp") ? r.entrar : undefined;
    const { status, cuerpo } = elegida ?? { status: 200, cuerpo: null };
    await ruta.fulfill({ status, contentType: "application/json", body: JSON.stringify(cuerpo) });
  });
}

async function abrirFormulario(page: Page) {
  await page.goto("/");
  await barra(page).getByRole("button", { name: "Entrar" }).click();
  await aceptarPaso(page);
  await expect(campoEmail(page)).toBeVisible();
}

test.describe("el paso de consentimiento es la única puerta", () => {
  test("desde la barra: cerrar el paso sin aceptar no manda ningún pedido a /api/auth/ ni muestra el formulario", async ({ page }) => {
    const pedidos = espiarAuth(page);
    await page.goto("/");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    await expect(dialogo(page, "Entrar")).toBeVisible();
    await expect(campoEmail(page)).toHaveCount(0);
    // Con una sola casilla tampoco.
    await page.getByRole("checkbox", { name: /Leí y acepto la política de privacidad/ }).check();
    await dialogo(page, "Entrar").getByRole("button", { name: "Aceptar y entrar" }).click();
    await expect(dialogo(page, "Entrar").getByRole("alert")).toBeVisible();
    await expect(campoEmail(page)).toHaveCount(0);
    await dialogo(page, "Entrar").getByRole("button", { name: "Cancelar" }).click();
    await expect(dialogo(page, "Entrar")).toBeHidden();
    await expect(campoEmail(page)).toHaveCount(0);
    expect(pedidos).toEqual([]);
  });

  test("desde Sumarte (Crear tu cuenta): lo mismo", async ({ page }) => {
    const pedidos = espiarAuth(page);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await expect(dialogo(page, "Crear tu cuenta")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialogo(page, "Crear tu cuenta")).toBeHidden();
    await expect(campoEmail(page)).toHaveCount(0);
    expect(pedidos).toEqual([]);
  });

  test("al aceptar aparece el formulario, en el mismo diálogo y con el foco en el email", async ({ page }) => {
    await page.goto("/");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    await aceptarPaso(page);
    await expect(dialogo(page, "Entrar")).toBeVisible();
    await expect(campoEmail(page)).toBeFocused();
    await expect(page.getByRole("button", { name: "Mandame el código" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar con Google" })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: /Leí y acepto la política de privacidad/ })).toHaveCount(0);
  });
});

test.describe("el formulario", () => {
  test("pedir el código lleva al paso 2 (todo con teclado) y se puede volver con 'Usar otro email'", async ({ page }) => {
    await simularNeonAuth(page, { pedirCodigo: { status: 200, cuerpo: { success: true } } });
    await abrirFormulario(page);
    await page.keyboard.type("ana@ejemplo.test");
    await page.keyboard.press("Enter");
    await expect(page.getByText("Te mandamos un código a")).toContainText("ana@ejemplo.test");
    await expect(campoCodigo(page)).toBeFocused();
    await expect(page.getByRole("button", { name: "Mandar otro código" })).toBeVisible();
    await page.getByRole("button", { name: "Usar otro email" }).click();
    await expect(campoEmail(page)).toBeFocused();
  });

  test("un código equivocado muestra su error con role=alert y sigue sin sesión", async ({ page }) => {
    await simularNeonAuth(page, {
      pedirCodigo: { status: 200, cuerpo: { success: true } },
      entrar: { status: 401, cuerpo: { code: "INVALID_OTP", message: "Invalid OTP" } },
    });
    await abrirFormulario(page);
    await campoEmail(page).fill("ana@ejemplo.test");
    await page.getByRole("button", { name: "Mandame el código" }).click();
    await campoCodigo(page).fill("000000");
    await page.getByRole("dialog").getByRole("button", { name: "Entrar", exact: true }).click();
    await expect(alerta(page)).toHaveText("El código no es correcto o venció. Pedí uno nuevo.");
    await expect(campoCodigo(page)).toBeFocused();
    await expect(campoCodigo(page)).toHaveAttribute("aria-describedby", /.+/);
    await expect(barra(page).getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("Neon Auth responde 500: error general y las páginas públicas siguen", async ({ page }) => {
    await simularNeonAuth(page, { pedirCodigo: { status: 500, cuerpo: { message: "boom" } } });
    await abrirFormulario(page);
    await campoEmail(page).fill("ana@ejemplo.test");
    await page.getByRole("button", { name: "Mandame el código" }).click();
    await expect(alerta(page)).toHaveText("No pudimos iniciar sesión. Probá de nuevo.");
    await page.getByRole("button", { name: "Cancelar" }).last().click();
    await page.goto("/tribus");
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("el manejador responde 503: 'El login no está disponible en este momento.'", async ({ page }) => {
    await simularNeonAuth(page, { pedirCodigo: { status: 503, cuerpo: { ok: false } } });
    await abrirFormulario(page);
    await campoEmail(page).fill("ana@ejemplo.test");
    await page.getByRole("button", { name: "Mandame el código" }).click();
    await expect(alerta(page)).toHaveText("El login no está disponible en este momento.");
  });

  test("sin Neon Auth configurado en el servidor (sin interceptar), el manejador real responde 503 y se avisa", async ({ page }) => {
    await abrirFormulario(page);
    await campoEmail(page).fill("ana@ejemplo.test");
    await page.getByRole("button", { name: "Mandame el código" }).click();
    await expect(alerta(page)).toHaveText("El login no está disponible en este momento.");
  });

  test("un email mal escrito se avisa sin llamar a Neon Auth", async ({ page }) => {
    const pedidos = espiarAuth(page);
    await abrirFormulario(page);
    const antes = pedidos.length;
    await campoEmail(page).fill("esto-no-es-un-email");
    await page.getByRole("button", { name: "Mandame el código" }).click();
    await expect(alerta(page)).toContainText("email válido");
    expect(pedidos.length).toBe(antes);
  });

  test("axe sin violaciones serias o críticas con el formulario abierto (paso 1 y paso 2)", async ({ page }) => {
    await simularNeonAuth(page, { pedirCodigo: { status: 200, cuerpo: { success: true } } });
    await abrirFormulario(page);
    const analizar = async () => {
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }));
    };
    expect(await analizar()).toEqual([]);
    await campoEmail(page).fill("ana@ejemplo.test");
    await page.getByRole("button", { name: "Mandame el código" }).click();
    await expect(campoCodigo(page)).toBeVisible();
    expect(await analizar()).toEqual([]);
  });
});
