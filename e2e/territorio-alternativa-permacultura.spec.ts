import { expect, test, type Page } from "./fixtura";
import { textosEnEspanol } from "./ayudas-idioma";

// Las teselas satelitales son externas: los tests no dependen de ellas.
test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

const ALTERNATIVA = "Alternativa: masterplan de permacultura (borrador)";
const ficha = (page: Page) => page.getByRole("complementary", { name: "Ficha del territorio" });
const marcador = (page: Page, inicio: string) => page.locator(`[aria-label^="${inicio}"]`);

async function abrirAlternativa(page: Page) {
  await page.goto("/territorios/lighthouse");
  await expect(marcador(page, "Barrio ")).toHaveCount(12);
  await page.getByRole("button", { name: ALTERNATIVA }).click();
  await expect(marcador(page, "Primera hectárea")).toHaveCount(1);
}

test("cambiar a la alternativa: botón presionado, URL y sin sellos de barrio", async ({ page }) => {
  await abrirAlternativa(page);
  await expect(page.getByRole("button", { name: ALTERNATIVA })).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/vista=permacultura/);
  await expect(marcador(page, "Barrio ")).toHaveCount(0);
  await expect(marcador(page, "Terreno común del Lighthouse")).toHaveCount(0);
  await expect(marcador(page, "Núcleo común")).toHaveCount(1);
  for (const n of [1, 2, 3, 4]) await expect(marcador(page, `Cluster ${n}`)).toHaveCount(1);
});

test("enlace compartido abre la alternativa", async ({ page }) => {
  await page.goto("/territorios/lighthouse?vista=permacultura");
  await expect(marcador(page, "Primera hectárea")).toHaveCount(1);
  await expect(page.getByRole("button", { name: ALTERNATIVA })).toHaveAttribute("aria-pressed", "true");
});

test("volver a la distribución ilustrativa", async ({ page }) => {
  await abrirAlternativa(page);
  await page.getByRole("button", { name: "Distribución ilustrativa" }).click();
  await expect(marcador(page, "Barrio ")).toHaveCount(12);
  await expect(page).not.toHaveURL(/vista=/);
});

test("resumen con proporción ecológica y avisos de borrador", async ({ page }) => {
  await abrirAlternativa(page);
  const f = ficha(page);
  await expect(f.getByRole("heading", { name: "Masterplan de permacultura" })).toBeVisible();
  const texto = await f.getByText("Proporción ecológica:").locator("..").innerText();
  const porcentaje = Number(texto.match(/(\d+) %/)?.[1]);
  expect(porcentaje).toBeGreaterThanOrEqual(50);
  await expect(f.getByText("Borrador del Agente de Regeneración · preliminar e ilustrativo")).toBeVisible();
  await expect(f.getByText(/Hace falta relevamiento, observación del sitio y diseño humano/)).toBeVisible();
});

test("teclado: Tab hasta la primera hectárea y Enter la elige", async ({ page }) => {
  await abrirAlternativa(page);
  const sello = marcador(page, "Primera hectárea");
  await sello.focus();
  await page.keyboard.press("Enter");
  const f = ficha(page);
  await expect(f.getByRole("heading", { name: "Primera hectárea · área foco" })).toBeVisible();
  await expect(f.getByText(/1,0 ha/)).toBeVisible();
});

test("elegir la columna verde desde la lista", async ({ page }) => {
  await abrirAlternativa(page);
  await page.getByRole("button", { name: "Columna verde del cañadón" }).click();
  const f = ficha(page);
  await expect(f.getByRole("heading", { name: "Columna verde del cañadón" })).toBeVisible();
  await expect(f.getByText("Zona 4–5 · bien común")).toBeVisible();
  await expect(f.getByText(/\d+,\d ha/)).toBeVisible();
});

test("un cluster no es un lote: sin consultar, reservar ni comprar", async ({ page }) => {
  await abrirAlternativa(page);
  await page.getByRole("button", { name: "Cluster 1 · ~16 familias", exact: true }).click();
  const f = ficha(page);
  await expect(f.getByRole("heading", { name: "Cluster 1 · ~16 familias" })).toBeVisible();
  await expect(f.getByRole("button", { name: /consultar|reservar|comprar/i })).toHaveCount(0);
  await expect(f.getByRole("link", { name: /consultar|reservar|comprar/i })).toHaveCount(0);
});

test("leyenda en texto con los grupos de la alternativa", async ({ page }) => {
  await abrirAlternativa(page);
  const leyenda = page.getByRole("group", { name: "Leyenda del mapa" });
  for (const t of ["Agua y bienes comunes", "Producción", "Asentamiento", "Implementación por etapas", "Monte silvestre", "Caminos", "Sectores", "Obras de agua"]) {
    await expect(leyenda.getByText(t, { exact: true })).toBeVisible();
  }
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US" });

  test("selector, ficha y leyenda en inglés, sin español suelto", async ({ page }) => {
    await page.goto("/territorios/lighthouse?vista=permacultura");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("button", { name: "Alternative: permaculture masterplan (draft)" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("heading", { name: "Permaculture masterplan" })).toBeVisible();
    await page.getByRole("button", { name: "Green spine of the ravine" }).click();
    await expect(page.getByText("Zone 4–5 · commons")).toBeVisible();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });
});

test("un solo main", async ({ page }) => {
  await abrirAlternativa(page);
  await expect(page.locator("main")).toHaveCount(1);
});
