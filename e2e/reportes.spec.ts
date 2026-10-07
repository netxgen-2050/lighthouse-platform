import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const NOMBRE_BOTON = "Reportar un problema o una idea";

async function abrir(page: Page) {
  await page.getByRole("button", { name: NOMBRE_BOTON }).click();
  const dialogo = page.getByRole("dialog", { name: "Reportar un problema o una idea" });
  await expect(dialogo).toBeVisible();
  return dialogo;
}

for (const ruta of ["/", "/tribus/valle", "/sumarte", "/netx"]) {
  test(`el botón Reportar sigue visible abajo a la derecha al final de ${ruta}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(ruta);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const boton = page.getByRole("button", { name: NOMBRE_BOTON });
    await expect(boton).toBeInViewport();
    const caja = (await boton.boundingBox())!;
    expect(caja.x + caja.width).toBeGreaterThan(1280 - 80);
    expect(caja.y + caja.height).toBeGreaterThan(720 - 80);
  });
}

test("celular 390 x 844: el botón se ve, no tapa el rail y no hay scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const boton = page.getByRole("button", { name: NOMBRE_BOTON });
  await expect(boton).toBeInViewport();
  const b = (await boton.boundingBox())!;
  const r = (await page.getByRole("navigation", { name: "Principal" }).boundingBox())!;
  expect(b.x).toBeGreaterThanOrEqual(r.x + r.width);
  const desborde = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(desborde).toBe(false);
});

test("sin escribir qué pasó muestra el error y no envía nada", async ({ page }) => {
  let pedidos = 0;
  await page.route("**/api/reportes", (ruta) => {
    pedidos += 1;
    return ruta.fulfill({ status: 200, json: { ok: true, numero: 1 } });
  });
  await page.goto("/");
  const dialogo = await abrir(page);
  await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(dialogo.getByRole("alert")).toContainText("Contanos qué pasó");
  await expect(dialogo.getByLabel(/¿Qué pasó\?/)).toBeFocused();
  expect(pedidos).toBe(0);
});

test("teclado: Enter abre, Escape cierra y el foco vuelve al botón", async ({ page }) => {
  await page.goto("/");
  const boton = page.getByRole("button", { name: NOMBRE_BOTON });
  await boton.focus();
  await page.keyboard.press("Enter");
  const dialogo = page.getByRole("dialog");
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByRole("radio").first()).toBeVisible();
  const foco = await page.evaluate(() => document.activeElement?.closest("dialog") !== null);
  expect(foco).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect(boton).toBeFocused();
});

test("el diálogo muestra el contexto: ruta, pantalla y versión", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/tribus/valle");
  const dialogo = await abrir(page);
  await expect(dialogo).toContainText("/tribus/valle");
  await expect(dialogo).toContainText("1280 × 720 px");
  await expect(dialogo).toContainText("Versión:");
});

test("envío correcto: muestra el número del issue", async ({ page }) => {
  let enviado: Record<string, unknown> = {};
  await page.route("**/api/reportes", (ruta) => {
    enviado = ruta.request().postDataJSON();
    return ruta.fulfill({ status: 200, json: { ok: true, numero: 42 } });
  });
  await page.goto("/");
  const dialogo = await abrir(page);
  await dialogo.getByLabel(/¿Qué pasó\?/).fill("Se rompe el mapa");
  await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(dialogo.getByText("¡Gracias! Quedó registrado (#42)")).toBeVisible();
  expect(enviado.quePaso).toBe("Se rompe el mapa");
  expect(enviado.tipo).toBe("bug");
});

test("sin token: avisa, ofrece copiar y conserva el texto", async ({ page }) => {
  await page.route("**/api/reportes", (ruta) =>
    ruta.fulfill({ status: 503, json: { ok: false, configurado: false } }),
  );
  await page.goto("/");
  const dialogo = await abrir(page);
  await dialogo.getByLabel(/¿Qué pasó\?/).fill("Texto que no se debe perder");
  await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(dialogo.getByRole("alert")).toContainText("No se pudo registrar");
  await expect(dialogo.getByRole("button", { name: "Copiar el reporte" })).toBeVisible();
  await expect(dialogo.getByLabel(/¿Qué pasó\?/)).toHaveValue("Texto que no se debe perder");
});

test("axe: el diálogo abierto no tiene violaciones serias o críticas", async ({ page }) => {
  await page.goto("/");
  await abrir(page);
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test("el diálogo muestra la URL completa que se adjunta", async ({ page }) => {
  await page.goto("/tribus/valle");
  const dialogo = await abrir(page);
  await expect(dialogo).toContainText(new URL(page.url()).href);
});

test("cerrar y reabrir mientras se envía no habilita un segundo envío", async ({ page }) => {
  let pedidos = 0;
  await page.route("**/api/reportes", async (ruta) => {
    pedidos += 1;
    await new Promise((r) => setTimeout(r, 1200));
    await ruta.fulfill({ status: 200, json: { ok: true, numero: 7 } });
  });
  await page.goto("/");
  const dialogo = await abrir(page);
  await dialogo.getByLabel(/¿Qué pasó\?/).fill("Algo");
  await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(dialogo.getByRole("button", { name: "Enviando…" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await abrir(page);
  await expect(dialogo.getByRole("button", { name: "Enviando…" })).toBeDisabled();
  await expect(dialogo.getByText("¡Gracias! Quedó registrado (#7)")).toBeVisible();
  expect(pedidos).toBe(1);
});

test("si falla copiar al portapapeles, lo avisa", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denegado")) },
      configurable: true,
    });
  });
  await page.route("**/api/reportes", (ruta) =>
    ruta.fulfill({ status: 503, json: { ok: false, configurado: false } }),
  );
  await page.goto("/");
  const dialogo = await abrir(page);
  await dialogo.getByLabel(/¿Qué pasó\?/).fill("Algo");
  await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
  await dialogo.getByRole("button", { name: "Copiar el reporte" }).click();
  await expect(dialogo.getByText("No se pudo copiar")).toBeVisible();
});

test("el token no aparece en el HTML ni en el código que recibe el navegador", async ({ page }) => {
  const textos: string[] = [];
  page.on("response", async (res) => {
    const tipo = res.headers()["content-type"] ?? "";
    if (/html|javascript|json/.test(tipo)) textos.push(await res.text().catch(() => ""));
  });
  await page.goto("/");
  await abrir(page);
  await page.waitForLoadState("networkidle");
  expect(textos.length).toBeGreaterThan(0);
  for (const t of textos) {
    expect(t).not.toContain("REPORTES_GITHUB_TOKEN");
    expect(t).not.toMatch(/ghp_|github_pat_/);
  }
});
