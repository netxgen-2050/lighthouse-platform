import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const html = (page: Page) => page.locator("html");
const fondo = (page: Page) => page.evaluate(() => getComputedStyle(document.body).backgroundColor);

function evento(id: string, tipo: string, texto: string) {
  return { id, tipo, texto, fecha: "2026-10-01T10:00:00Z", enlace: "/tribus", notificacion: true, leida: false };
}

test("/configuracion tiene todas las secciones y un único main", async ({ page }) => {
  await page.goto("/configuracion");
  await expect(page.getByRole("heading", { level: 1, name: "Configuración" })).toBeVisible();
  for (const seccion of ["Apariencia", "Notificaciones", "Asistente", "Moneda de referencia", "Idioma", "Tus datos"]) {
    await expect(page.getByRole("heading", { level: 2, name: seccion })).toBeVisible();
  }
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver la Bitácora" })).toHaveAttribute("href", "/panel/bitacora");
});

test("idioma: español elegido e inglés deshabilitado como próximamente", async ({ page }) => {
  await page.goto("/configuracion");
  await expect(page.getByRole("radio", { name: "Español" })).toBeChecked();
  await expect(page.getByRole("radio", { name: /English/ })).toBeDisabled();
  await expect(page.getByText("próximamente")).toBeVisible();
});

test("tema oscuro: toda la app cambia a la paleta oscura y sigue así al recargar y en otras páginas", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/configuracion");
  const claro = await fondo(page);
  await page.getByRole("radio", { name: "Oscuro" }).check();
  await expect(html(page)).toHaveAttribute("data-tema", "oscuro");
  const oscuro = await fondo(page);
  expect(oscuro).not.toBe(claro);
  await page.reload();
  await expect(html(page)).toHaveAttribute("data-tema", "oscuro");
  await expect(page.getByRole("radio", { name: "Oscuro" })).toBeChecked();
  expect(await fondo(page)).toBe(oscuro);
  await page.goto("/tribus");
  await expect(html(page)).toHaveAttribute("data-tema", "oscuro");
  expect(await fondo(page)).toBe(oscuro);
});

test("tema claro gana sobre un sistema oscuro; el del sistema lo sigue", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/configuracion");
  await expect(html(page)).toHaveAttribute("data-tema", "oscuro");
  await page.getByRole("radio", { name: "Claro" }).check();
  await expect(html(page)).toHaveAttribute("data-tema", "claro");
  await page.getByRole("radio", { name: "El del sistema" }).check();
  await expect(html(page)).toHaveAttribute("data-tema", "oscuro");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(html(page)).toHaveAttribute("data-tema", "claro");
});

test("texto grande agranda el texto y se mantiene al recargar", async ({ page }) => {
  await page.goto("/configuracion");
  const tamano = () => page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
  expect(await tamano()).toBe(16);
  await page.getByRole("radio", { name: "Grande" }).check();
  await expect(html(page)).toHaveAttribute("data-texto", "grande");
  expect(await tamano()).toBeGreaterThan(16);
  await page.reload();
  await expect(html(page)).toHaveAttribute("data-texto", "grande");
  expect(await tamano()).toBeGreaterThan(16);
});

test("reducir animaciones se aplica y se mantiene", async ({ page }) => {
  await page.goto("/configuracion");
  await page.getByLabel("Reducir animaciones").check();
  await expect(html(page)).toHaveAttribute("data-movimiento", "reducido");
  await page.reload();
  await expect(html(page)).toHaveAttribute("data-movimiento", "reducido");
  await expect(page.getByLabel("Reducir animaciones")).toBeChecked();
});

test("apagar rondas: esas notificaciones dejan de contarse y de verse", async ({ page }) => {
  await page.addInitScript((lista) => {
    if (!window.localStorage.getItem("lh-actividad")) window.localStorage.setItem("lh-actividad", JSON.stringify(lista));
  }, [evento("1", "ronda-abierta", "Se abrió una ronda de prueba"), evento("2", "pacto-aceptado", "Aceptaron tu pacto de prueba")]);
  const campanita = page.getByRole("banner").locator('a[href="/bandeja"]');
  await page.goto("/bandeja");
  await expect(campanita).toHaveAttribute("aria-label", "2 notificaciones sin leer");
  await page.goto("/configuracion");
  await page.getByRole("checkbox", { name: /Rondas de reconocimiento/ }).uncheck();
  await expect(campanita).toHaveAttribute("aria-label", "1 notificación sin leer");
  await campanita.click();
  await expect(page).toHaveURL(/\/bandeja$/);
  await expect(page.getByRole("link", { name: "Aceptaron tu pacto de prueba" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Se abrió una ronda de prueba" })).toHaveCount(0);
  // Al prenderlo de nuevo vuelve.
  await page.goto("/configuracion");
  await page.getByRole("checkbox", { name: /Rondas de reconocimiento/ }).check();
  await expect(campanita).toHaveAttribute("aria-label", "2 notificaciones sin leer");
});

test("ocultar a Hifa: el botón desaparece en todas las páginas y vuelve al prenderlo", async ({ page }) => {
  const hifa = page.getByRole("button", { name: "Hablar con Hifa" });
  await page.goto("/configuracion");
  await expect(hifa).toBeVisible();
  await page.getByRole("checkbox", { name: /Mostrar a Hifa/ }).uncheck();
  await expect(hifa).toHaveCount(0);
  for (const ruta of ["/", "/tribus", "/sumarte"]) {
    await page.goto(ruta);
    await expect(page.getByRole("button", { name: "Reportar un problema" })).toBeVisible();
    await expect(hifa).toHaveCount(0);
  }
  await page.goto("/configuracion");
  await page.getByRole("checkbox", { name: /Mostrar a Hifa/ }).check();
  await expect(hifa).toBeVisible();
});

test("moneda ARS: /sumarte muestra los precios en pesos con la nota del tipo de cambio de ejemplo", async ({ page }) => {
  await page.goto("/sumarte");
  await expect(page.getByText("USD 1.500").first()).toBeVisible();
  await expect(page.getByText("Tipo de cambio de ejemplo")).toHaveCount(0);
  await page.goto("/configuracion");
  await page.getByRole("radio", { name: /Pesos argentinos/ }).check();
  await page.goto("/sumarte");
  await expect(page.getByText("ARS 2.100.000").first()).toBeVisible();
  await expect(page.getByRole("article", { name: /Miembro de la red/ })).toContainText("ARS 140.000/año");
  await expect(page.getByText(/Tipo de cambio de ejemplo: 1 USD = 1\.400 ARS/)).toBeVisible();
  await expect(page.getByText("USD 1.500")).toHaveCount(0);
});

test("moneda ARS: /pactos muestra el aporte registrado en pesos con la nota", async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem("lh-membresia")) return;
    window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro" }));
    window.localStorage.setItem("lh-configuracion", JSON.stringify({ moneda: "ARS" }));
    window.localStorage.setItem("lh-pactos", JSON.stringify({ pestana: "plata", comunidades: { lighthouse: { aportes: [200] } } }));
  });
  await page.goto("/pactos");
  await expect(page.getByText(/ARS 280\.000 · 200 Semillas/)).toBeVisible();
  await expect(page.getByText(/Tipo de cambio de ejemplo/)).toBeVisible();
});

test("borrar todo vuelve también las preferencias a lo inicial", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/configuracion");
  await page.getByRole("radio", { name: "Oscuro" }).check();
  await expect(html(page)).toHaveAttribute("data-tema", "oscuro");
  page.once("dialog", (d) => void d.accept());
  await page.getByRole("button", { name: "Borrar todo lo guardado en este navegador" }).click();
  await expect(page.getByRole("status").filter({ hasText: "se borró todo" })).toBeVisible();
  await expect(html(page)).toHaveAttribute("data-tema", "claro");
  expect(await page.evaluate(() => window.localStorage.getItem("lh-configuracion"))).toBeNull();
});

test("solo teclado: se cambia el tema con las flechas y el menú del avatar lleva a Configuración", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menú de la persona" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("link", { name: "Configuración" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/configuracion$/);
  await page.getByRole("radio", { name: "Claro" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { name: "Oscuro" })).toBeChecked();
  await expect(html(page)).toHaveAttribute("data-tema", "oscuro");
});

async function graves(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return r.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }));
}

test("axe sin violaciones serias o críticas: /configuracion en claro y en oscuro", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/configuracion");
  expect(await graves(page)).toEqual([]);
  await page.getByRole("radio", { name: "Oscuro" }).check();
  expect(await graves(page)).toEqual([]);
  await page.getByRole("radio", { name: "Grande" }).check();
  expect(await graves(page)).toEqual([]);
});

for (const ruta of ["/", "/tribus", "/sumarte", "/pactos", "/bandeja", "/panel", "/perfil", "/pasaporte", "/semillas", "/compromisos"]) {
  test(`axe sin violaciones serias o críticas en tema oscuro: ${ruta}`, async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem("lh-configuracion", JSON.stringify({ tema: "oscuro" })));
    await page.goto(ruta);
    await expect(html(page)).toHaveAttribute("data-tema", "oscuro");
    expect(await graves(page)).toEqual([]);
  });
}

test("axe: el menú del avatar abierto en /configuracion", async ({ page }) => {
  await page.goto("/configuracion");
  await page.getByRole("button", { name: "Menú de la persona" }).click();
  await expect(page.locator("#menu-persona")).toBeVisible();
  expect(await graves(page)).toEqual([]);
});

test("celular 390 x 844: /configuracion no tiene scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/configuracion");
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});
