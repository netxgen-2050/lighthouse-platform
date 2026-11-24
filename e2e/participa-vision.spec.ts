import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";

const graves = async (page: Page) => {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return r.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }));
};

/** Baja por toda la página para que cada sección haya hecho su fundido de entrada antes de medir colores. */
const recorrerTodo = async (page: Page) => {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, document.body.scrollHeight);
  });
  await expect(page.locator('.vision-aparece[data-fase="oculto"]')).toHaveCount(0);
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
};

test("la visión: título, subtítulo, marca y las cuatro secciones", async ({ page }) => {
  await page.goto("/participa?ver=vision");
  await expect(page.getByRole("link", { name: "Visión" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 2, name: "Lighthouse 2050" })).toBeVisible();
  await expect(page.getByText("Una luz en el borde del desierto", { exact: true })).toBeVisible();
  await expect(page.getByText("Visión, no promesa · borrador", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: /Amanecer sobre el río Negro/ })).toBeVisible();
  for (const titulo of ["Postal desde 2050", "De dónde venimos", "Lo que creemos", "Lo que pedimos"]) {
    await expect(page.getByRole("heading", { level: 3, name: titulo })).toBeAttached();
  }
  await expect(page.locator("main")).toHaveCount(1);
  // El texto canónico: una frase de cada sección.
  await expect(page.getByText(/640 kilómetros sin recibir un solo afluente/)).toBeAttached();
  await expect(page.getByText("Lo que no sabemos, lo decimos.")).toBeAttached();
});

test("lo que creemos: siete principios en tarjetas con la primera frase en negrita", async ({ page }) => {
  await page.goto("/participa?ver=vision");
  const tarjetas = page.locator('section[aria-labelledby="vision-creemos"] li');
  await expect(tarjetas).toHaveCount(7);
  await expect(tarjetas.first().locator("strong")).toHaveText("El agua es el centro.");
  expect(await tarjetas.first().locator("strong").evaluate((el) => Number(getComputedStyle(el).fontWeight))).toBeGreaterThanOrEqual(600);
});

test("el texto se lee en una columna de 60 a 75 caracteres y la capitular existe", async ({ page }) => {
  await page.goto("/participa?ver=vision");
  const parrafo = page.locator("#vision-origen").locator("xpath=..").locator("p").nth(1);
  await parrafo.scrollIntoViewIfNeeded();
  const medida = await parrafo.evaluate((el) => {
    const estilo = getComputedStyle(el);
    const canvas = document.createElement("canvas").getContext("2d")!;
    canvas.font = `${estilo.fontWeight} ${estilo.fontSize} ${estilo.fontFamily}`;
    const promedio = canvas.measureText("abcdefghijklmnñopqrstuvwxyz ").width / 28;
    return { ancho: el.getBoundingClientRect().width, promedio, letra: parseFloat(estilo.fontSize), interlineado: parseFloat(estilo.lineHeight) };
  });
  const caracteres = medida.ancho / medida.promedio;
  expect(caracteres).toBeGreaterThanOrEqual(55);
  expect(caracteres).toBeLessThanOrEqual(80);
  expect(medida.letra).toBeGreaterThanOrEqual(18);
  expect(medida.interlineado / medida.letra).toBeCloseTo(1.6, 1);
  const capitular = await page.locator(".vision-capitular").evaluate((el) => getComputedStyle(el, "::first-letter").float);
  expect(capitular).toBe("left");
});

test("el título usa la tipografía de títulos con el eje SOFT", async ({ page }) => {
  await page.goto("/participa?ver=vision");
  const t = await page.locator("#vision-titulo").evaluate((el) => {
    const e = getComputedStyle(el);
    return { ajustes: e.fontVariationSettings, tamano: parseFloat(e.fontSize), familia: e.fontFamily };
  });
  expect(t.ajustes).toContain("SOFT");
  expect(t.tamano).toBeGreaterThanOrEqual(46);
  expect(t.familia.toLowerCase()).toContain("fraunces");
});

test("al final, el llamado a los equipos lleva a la pestaña Equipos", async ({ page }) => {
  await page.goto("/participa?ver=vision");
  await expect(page.getByText("Lo que siembres hoy le va a dar sombra a alguien en 2050.")).toBeAttached();
  const enlace = page.getByRole("link", { name: "Conocé los equipos" });
  await enlace.scrollIntoViewIfNeeded();
  await expect(enlace).toHaveAttribute("href", "/participa");
  await enlace.click();
  await expect(page).toHaveURL(/\/participa$/);
  await expect(page.getByRole("navigation", { name: "Secciones de Participa" }).getByRole("link", { name: "Equipos" })).toHaveAttribute("aria-current", "page");
  await expect(page.locator("[data-equipo]")).toHaveCount(9);
});

test("con movimiento reducido no hay fundido: todo se ve de entrada", async ({ browser }) => {
  const contexto = await browser.newContext({ reducedMotion: "reduce" });
  const page = await contexto.newPage();
  await page.goto("/participa?ver=vision");
  const cierre = page.locator(".vision-cierre");
  await expect(cierre).toBeAttached();
  expect(await cierre.locator("xpath=..").evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  await contexto.close();
});

test("sin preferencia de movimiento, lo que está más abajo aparece con un fundido al llegar", async ({ page }) => {
  await page.goto("/participa?ver=vision");
  const bloque = page.locator(".vision-aparece").last();
  await expect(bloque).toHaveAttribute("data-fase", "oculto");
  await expect(bloque).toHaveCSS("opacity", "0");
  await bloque.scrollIntoViewIfNeeded();
  await expect(bloque).toHaveAttribute("data-fase", "visto");
  await expect(bloque).toHaveCSS("opacity", "1");
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US" });

  test("el manifiesto, el llamado y la marca en inglés", async ({ page }) => {
    await page.goto("/participa?ver=vision");
    await expect(page.getByRole("heading", { level: 2, name: "Lighthouse 2050" })).toBeVisible();
    await expect(page.getByText("A light at the edge of the desert", { exact: true })).toBeVisible();
    await expect(page.getByText("A vision, not a promise · draft", { exact: true })).toBeVisible();
    for (const titulo of ["A postcard from 2050", "Where we come from", "What we believe", "What we ask"]) {
      await expect(page.getByRole("heading", { level: 3, name: titulo })).toBeAttached();
    }
    const enlace = page.getByRole("link", { name: "Meet the teams" });
    await expect(enlace).toHaveAttribute("href", "/participa");
    await expect(page.getByText("What you sow today will give someone shade in 2050.")).toBeAttached();
    await expect(page.getByText("Postal desde 2050")).toHaveCount(0);
  });
});

test.describe("celular a 390 px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("se lee sin scroll horizontal, con el título entero y las tarjetas en una columna", async ({ page }) => {
    await page.goto("/participa?ver=vision");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    const titulo = page.locator("#vision-titulo");
    await expect(titulo).toBeVisible();
    const caja = (await titulo.boundingBox())!;
    expect(caja.x + caja.width).toBeLessThanOrEqual(390);
    const tarjetas = page.locator('section[aria-labelledby="vision-creemos"] li');
    await tarjetas.first().scrollIntoViewIfNeeded();
    const a = (await tarjetas.nth(0).boundingBox())!;
    const b = (await tarjetas.nth(1).boundingBox())!;
    expect(b.y).toBeGreaterThan(a.y + a.height - 1);
    await recorrerTodo(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

for (const tema of ["claro", "oscuro"] as const) {
  test(`axe sin violaciones serias o críticas en la visión, tema ${tema}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: tema === "oscuro" ? "dark" : "light" });
    await page.goto("/participa?ver=vision");
    if (tema === "oscuro") await expect(page.locator("html")).toHaveAttribute("data-tema", "oscuro");
    await recorrerTodo(page);
    expect(await graves(page)).toEqual([]);
  });
}
