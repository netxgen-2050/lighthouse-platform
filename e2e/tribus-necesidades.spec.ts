import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";

const necesidad = (page: Page, id: string) => page.locator(`#necesidad-${id}`);
const abrir = async (page: Page, id: string) => {
  await necesidad(page, id).locator("summary").click();
  return necesidad(page, id);
};

test("Riego de Semilla Viva: ficha completa y aval del círculo", async ({ page }) => {
  await page.goto("/tribus/semilla");
  const n = await abrir(page, "semilla-riego");
  await expect(n).toContainText("Diseñar el riego por goteo de la huerta intensiva");
  await expect(n).toContainText("~20 h");
  await expect(n).toContainText("De diseño");
  await expect(n).toContainText("15 de diciembre de 2026");
  await expect(n).toContainText("Diseño de permacultura");
  await expect(n).toContainText("Abierta");
  await expect(n).toContainText("Avalada por el círculo Huerta intensiva (ejemplo)");
});

test("horas y fecha que faltan dicen sin dato, nunca 0", async ({ page }) => {
  await page.goto("/tribus/valle");
  const ev = await abrir(page, "valle-eventos");
  await expect(ev).toContainText("Horas aproximadas: sin dato");
  await expect(ev).not.toContainText("0 h");
  await page.goto("/tribus/monte");
  const m = await abrir(page, "monte-maquinaria");
  await expect(m).toContainText("Para cuándo: sin dato");
  await expect(m).toContainText("Tomada");
});

test("valle: hecha, círculo de la tribu, transversal con Hifa, máximos y sin máximo", async ({ page }) => {
  await page.goto("/tribus/valle");
  await expect(necesidad(page, "valle-bioconstruccion").locator("summary")).toContainText("Hecha");
  const bio = await abrir(page, "valle-bioconstruccion");
  await expect(bio).not.toContainText("Máximo");
  const sol = await abrir(page, "valle-solar");
  await expect(sol).toContainText("Círculo: Energía solar");
  await expect(sol).toContainText("Máximo por persona: 10 h · las horas de más no generan Semillas");
  await expect(sol).toContainText("Máximo total de la tarea: 20 h");
  await expect(sol).not.toContainText("Avalada");
  await expect(sol).not.toContainText("Esperando el aval");
  const ev = await abrir(page, "valle-eventos");
  await expect(ev).toContainText("Círculo: Comunicación del común");
  await expect(ev).toContainText("Lo administra y facilita Hifa (experimental, ejemplo)");
  await expect(ev).toContainText("responde el super admin");
  await expect(page.locator("main")).toHaveCount(1);
});

test("máximo total en Semillas", async ({ page }) => {
  await page.goto("/tribus/agua");
  const p = await abrir(page, "agua-plomeria");
  await expect(p).toContainText("Máximo por persona: 60 Semillas");
  await expect(p).toContainText("Máximo total de la tarea: 150 Semillas");
  await expect(page.locator("main")).not.toContainText(/brotes|germin/i);
});

test("Marketing de Puerto espera el aval", async ({ page }) => {
  await page.goto("/tribus/puerto");
  await expect(necesidad(page, "puerto-marketing").locator("summary")).toContainText("Abierta · esperando aval");
  const n = await abrir(page, "puerto-marketing");
  await expect(n).toContainText("Esperando el aval del círculo Mercado");
});

test("teclado: Tab hasta Plomería y Enter la abre", async ({ page }) => {
  await page.goto("/tribus/agua");
  await necesidad(page, "agua-plomeria").locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(necesidad(page, "agua-plomeria")).toContainText("Conectar la cisterna nueva con la red del núcleo común");
});

test("el ancla abre la necesidad", async ({ page }) => {
  await page.goto("/tribus/agua#necesidad-agua-tratamiento");
  await expect(necesidad(page, "agua-tratamiento")).toHaveAttribute("open", "");
});

test("barrio vacante sin cambios", async ({ page }) => {
  await page.goto("/tribus/grano");
  for (const t of ["Agricultura extensiva", "Animales", "Molienda"]) await expect(page.getByText(t, { exact: true })).toBeVisible();
  await expect(page.locator("details")).toHaveCount(0);
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US" });
  test("Irrigation de Semilla Viva", async ({ page }) => {
    await page.goto("/tribus/semilla");
    const n = await abrir(page, "semilla-riego");
    await expect(n).toContainText("Design work");
    await expect(n).toContainText("Open");
    await expect(n).toContainText("December 15, 2026");
    await expect(n).toContainText("Endorsed by the Intensive garden circle (example)");
  });
});

test("axe en /tribus/valle con una necesidad abierta", async ({ page }) => {
  await page.goto("/tribus/valle");
  await abrir(page, "valle-solar");
  const r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
});
