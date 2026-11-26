import { expect, test } from "./fixtura";
import { ANIOS_DEL_HORIZONTE } from "../lib/bien-comun/barrio";
import { enteroEn } from "../lib/bien-comun/formato";
import { barriosEnFinanciamiento, curvaPorTrimestre } from "../lib/invertir/barrios";
import { porcentajeEn, usdEn } from "../lib/lotes/formato";

// Invertir (ux-invertir): los valores que se esperan salen de los módulos, nunca escritos a mano.
const norte = barriosEnFinanciamiento()[0];
const meta = usdEn(norte.meta, "es");
const prima = porcentajeEn(norte.primaObjetivo, "es");
const main = (page: import("@playwright/test").Page) => page.locator("main");

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("es pública: estado vacío con acción para entrar y ningún número, ni en pantalla ni en el HTML", async ({ page, request }) => {
    const r = await page.goto("/invertir");
    expect(r?.status()).toBe(200);
    await expect(page).toHaveURL(/\/invertir$/);
    await expect(page.getByRole("heading", { level: 1, name: "Invertir" })).toBeVisible();
    await expect(main(page)).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2, name: "Invertir se ve con una cuenta" })).toBeVisible();
    await expect(page.locator("[data-estado-vacio]")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sumate para ver el barrio" })).toBeVisible();
    const html = await (await request.get("/invertir")).text();
    expect(html).not.toContain(meta);
    expect(html).not.toContain("Curva de devolución");
    expect(html).not.toContain("Libro del barrio");
    expect(html).not.toContain(`>${prima}<`);
    expect(html).not.toContain("objetivo · ejemplo");
  });
});

test("con sesión: meta como número principal, un solo aviso legal, 'sin dato' en lo juntado y el mes de devolución", async ({ page }) => {
  await page.goto("/invertir");
  // La cinta fija del layout (ux-base) dice prototipo y venta simulada; la página no repite sellos.
  const cinta = page.locator("[data-cinta-prototipo]");
  await expect(cinta).toContainText("Prototipo interno · datos de ejemplo");
  await expect(cinta).toContainText("venta simulada · aprobación municipal pendiente");
  const aviso = page.locator('[data-sellos="invertir"]');
  await expect(aviso).toHaveCount(1);
  await expect(aviso).toContainText("Propuesta v0.1 en discusión · no es una oferta");
  await expect(main(page).getByText(/no es una oferta/i)).toHaveCount(1);
  await expect(main(page).getByText(/Propuesta v0\.1/)).toHaveCount(1);
  const ySello = (await aviso.boundingBox())!.y;
  const yMeta = (await page.getByText("Meta de la obra (infraestructura)").boundingBox())!.y;
  expect(yMeta).toBeLessThan(ySello);
  await expect(page.locator('[data-estado="enFinanciamiento"]')).toContainText("En financiamiento");
  await expect(main(page)).toContainText(meta);
  const juntado = page.locator("dl").filter({ hasText: "Lo juntado" });
  await expect(juntado).toContainText("sin dato");
  const mes = norte.mesDevolucion === null ? `no en ${enteroEn(ANIOS_DEL_HORIZONTE, "es")} años` : `mes ${enteroEn(norte.mesDevolucion, "es")}`;
  await expect(page.locator("dl").filter({ hasText: "Mes en que se terminaría de devolver" })).toContainText(mes);
  await expect(page.locator("dl").filter({ hasText: "De cada pago va al común" })).toContainText(porcentajeEn(norte.parteParaElComun, "es"));
});

test("con sesión: la prima objetivo está en Cómo funciona y el ⚖ de 'no es una oferta' explica", async ({ page }) => {
  await page.goto("/invertir");
  await expect(page.getByRole("tab", { name: "Cómo funciona", selected: true })).toBeVisible();
  const p = page.locator('[data-dato="prima"]');
  await expect(p).toContainText(prima);
  await expect(p).toContainText("objetivo · ejemplo · en discusión, no es una promesa");
  await page.locator('[data-sellos="invertir"]').getByRole("button", { name: /no es una oferta/i }).click();
  await expect(page.getByText("no se ofrece ni se vende nada", { exact: false }).first()).toBeVisible();
  await expect(page.getByText(/borrador/i).first()).toBeVisible();
});

test("pestañas: Cómo funciona por defecto, la elegida va a la URL y las flechas mueven entre pestañas", async ({ page }) => {
  await page.goto("/invertir");
  const como = page.getByRole("tab", { name: "Cómo funciona" });
  const curva = page.getByRole("tab", { name: "Curva" });
  const libro = page.getByRole("tab", { name: "Libro" });
  await expect(como).toHaveAttribute("aria-selected", "true");
  await como.focus();
  await page.keyboard.press("ArrowRight");
  await expect(curva).toBeFocused();
  await expect(curva).toHaveAttribute("aria-selected", "true");
  await expect(page).toHaveURL(/\/invertir\?ver=curva$/);
  await expect(page.locator('svg[data-curva="devolucion"]')).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(libro).toBeFocused();
  await expect(page).toHaveURL(/\?ver=libro$/);
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowLeft");
  await expect(como).toBeFocused();
  await expect(page).toHaveURL(/\/invertir$/);
});

test("abrir /invertir?ver=curva muestra la curva elegida, con su tabla equivalente", async ({ page }) => {
  await page.goto("/invertir?ver=curva");
  await expect(page.getByRole("tab", { name: "Curva", selected: true })).toBeVisible();
  const svg = page.locator('svg[data-curva="devolucion"]');
  await expect(svg).toHaveAttribute("role", "img");
  await expect(svg.locator("title")).toHaveText("Curva de devolución · caso de ejemplo");
  await page.getByText("Ver la tabla de la curva por trimestre").click();
  await expect(page.locator('table[data-tabla="curva"] tbody tr')).toHaveCount(curvaPorTrimestre(norte.curva).length);
});

test("libro: 8 filas, 'Ver todo' muestra todas y el filtro 'Va al común' deja solo esas", async ({ page }) => {
  await page.goto("/invertir?ver=libro");
  const libro = page.getByRole("table", { name: "Libro del barrio · caso de ejemplo" });
  await expect(libro.locator("tbody tr")).toHaveCount(8);
  await expect(libro.locator("tbody tr").first()).toContainText("mes 3");
  await page.getByText(`Ver todo el libro (${enteroEn(norte.libro.length, "es")} movimientos)`).click();
  await expect(libro.locator("tbody tr")).toHaveCount(norte.libro.length);

  const alComun = norte.libro.filter((m) => m.motivo === "comun").length;
  const filtro = page.getByRole("button", { name: "Va al común", exact: true });
  await filtro.click();
  await expect(filtro).toHaveAttribute("aria-pressed", "true");
  await expect(libro.locator("tbody tr")).toHaveCount(alComun);
  await expect(libro.locator("tbody tr").filter({ hasNotText: "Va al común" })).toHaveCount(0);
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
  await expect(page.getByText("Proposal v0.1 under discussion · not an offer")).toBeVisible();
  await expect(page.getByRole("tab", { name: "How it works" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Curve" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Ledger" })).toBeVisible();
  await expect(page.locator("dl").filter({ hasText: "Raised so far" })).toContainText("no data");
  await page.getByRole("tab", { name: "Curve" }).click();
  await expect(page.getByText("Repayment curve · sample case").first()).toBeAttached();
});

for (const ver of ["", "?ver=curva", "?ver=libro"]) {
  test(`a 390 px no hay scroll horizontal (${ver || "Cómo funciona"})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/invertir${ver}`);
    await expect(page.getByRole("tab", { selected: true })).toBeVisible();
    const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(desborda).toBe(false);
  });
}
