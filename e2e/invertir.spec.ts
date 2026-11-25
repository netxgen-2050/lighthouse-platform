import { expect, test } from "./fixtura";
import { ANIOS_DEL_HORIZONTE } from "../lib/bien-comun/barrio";
import { enteroEn } from "../lib/bien-comun/formato";
import { barriosEnFinanciamiento, curvaPorTrimestre } from "../lib/invertir/barrios";
import { porcentajeEn, usdEn } from "../lib/lotes/formato";

// Invertir (rediseno-invertir): los valores que se esperan salen de los módulos, nunca escritos a mano.
const norte = barriosEnFinanciamiento()[0];
const meta = usdEn(norte.meta, "es");
const prima = porcentajeEn(norte.primaObjetivo, "es");
const main = (page: import("@playwright/test").Page) => page.locator("main");

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("es pública: aviso para entrar y ningún número, ni en pantalla ni en el HTML", async ({ page, request }) => {
    const r = await page.goto("/invertir");
    expect(r?.status()).toBe(200);
    await expect(page).toHaveURL(/\/invertir$/);
    await expect(page.getByRole("heading", { level: 1, name: "Invertir" })).toBeVisible();
    await expect(main(page)).toHaveCount(1);
    await expect(page.getByText("Invertir se ve con una cuenta")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sumate para ver el barrio" })).toBeVisible();
    const html = await (await request.get("/invertir")).text();
    expect(html).not.toContain(meta);
    expect(html).not.toContain("Curva de devolución");
    expect(html).not.toContain("Libro del barrio");
    expect(html).not.toContain(`>${prima}<`);
    expect(html).not.toContain("objetivo · ejemplo");
  });
});

test("con sesión: sellos antes del primer indicador, meta, 'sin dato' en lo juntado y el mes de devolución", async ({ page }) => {
  await page.goto("/invertir");
  const sellos = page.locator('[data-sellos="invertir"]');
  await expect(sellos).toContainText("Propuesta v0.1 · en discusión");
  await expect(sellos).toContainText("Prototipo interno · datos de ejemplo");
  await expect(sellos).toContainText("venta simulada · aprobación municipal pendiente");
  await expect(sellos).toContainText("No es una oferta");
  const ySello = (await sellos.boundingBox())!.y;
  const yIndicador = (await page.getByText("Meta de la obra (infraestructura)").boundingBox())!.y;
  expect(ySello).toBeLessThan(yIndicador);
  await expect(page.locator('[data-estado="enFinanciamiento"]')).toContainText("En financiamiento");
  await expect(main(page)).toContainText(meta);
  const juntado = page.locator("dl").filter({ hasText: "Lo juntado" });
  await expect(juntado).toContainText("sin dato");
  const mes = norte.mesDevolucion === null ? `no en ${enteroEn(ANIOS_DEL_HORIZONTE, "es")} años` : `mes ${enteroEn(norte.mesDevolucion, "es")}`;
  await expect(page.locator("dl").filter({ hasText: "Mes en que se terminaría de devolver" })).toContainText(mes);
  await expect(page.locator("dl").filter({ hasText: "De cada pago va al común" })).toContainText(porcentajeEn(norte.parteParaElComun, "es"));
});

test("con sesión: la prima objetivo con su etiqueta y el ⚖ de 'No es una oferta'", async ({ page }) => {
  await page.goto("/invertir");
  const p = page.locator('[data-dato="prima"]');
  await expect(p).toContainText(prima);
  await expect(p).toContainText("objetivo · ejemplo · en discusión, no es una promesa");
  const sello = page.locator('[data-sellos="invertir"]');
  await sello.getByRole("button", { name: /No es una oferta/ }).click();
  await expect(page.getByText("no se ofrece ni se vende nada", { exact: false }).first()).toBeVisible();
  await expect(page.getByText(/borrador/i).first()).toBeVisible();
});

test("con sesión: la curva con su tabla equivalente y el libro con 'mes 3'", async ({ page }) => {
  await page.goto("/invertir");
  const svg = page.locator('svg[data-curva="devolucion"]');
  await expect(svg).toHaveAttribute("role", "img");
  await expect(svg.locator("title")).toHaveText("Curva de devolución · caso de ejemplo");
  await page.getByText("Ver la tabla de la curva por trimestre").click();
  await expect(page.locator('table[data-tabla="curva"] tbody tr')).toHaveCount(curvaPorTrimestre(norte.curva).length);
  const libro = page.getByRole("table", { name: "Libro del barrio · caso de ejemplo" });
  await expect(libro.locator("tbody tr")).toHaveCount(norte.libro.length);
  await expect(libro.locator("tbody tr").first()).toContainText("mes 3");
});

test("con sesión: enlaza a /bien-comun y nunca habla de rendimiento", async ({ page }) => {
  await page.goto("/invertir");
  await expect(page.getByRole("link", { name: "Leer la propuesta del bien común" })).toHaveAttribute("href", "/bien-comun");
  const texto = await main(page).innerText();
  expect(texto).not.toMatch(/rendimiento|APY|\bTIR\b|ganancia|recupero|valorizaci/i);
});

test("el menú trae Invertir y lleva a la página", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Invertir", exact: true }).first().click();
  await expect(page).toHaveURL(/\/invertir$/);
});

test("en inglés: títulos y textos traducidos", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "lh-idioma", value: "en", url: baseURL! }]);
  await page.goto("/invertir");
  await expect(page.getByRole("heading", { level: 1, name: "Invest" })).toBeVisible();
  await expect(page.getByText("Proposal v0.1 · under discussion")).toBeVisible();
  await expect(page.getByText("Not an offer").first()).toBeVisible();
  await expect(page.getByText("Repayment curve · sample case").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "How it works" })).toBeVisible();
  await expect(page.locator("dl").filter({ hasText: "Raised so far" })).toContainText("no data");
});

test("a 390 px no hay scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/invertir");
  await expect(page.getByRole("heading", { name: "Libro del barrio · caso de ejemplo" })).toBeVisible();
  const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(desborda).toBe(false);
});
