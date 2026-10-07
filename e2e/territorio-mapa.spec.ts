import { expect, test, type Page } from "@playwright/test";

// Las teselas satelitales son externas: los tests no dependen de ellas.
test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

const region = (page: Page) => page.getByRole("region", { name: "Mapa del Macrolote 7" });
const ficha = (page: Page) => page.getByRole("complementary", { name: "Ficha del territorio" });
const marcador = (page: Page, inicio: string) => page.locator(`[aria-label^="${inicio}"]`);

async function abrir(page: Page) {
  await page.goto("/territorios/lighthouse");
  await expect(marcador(page, "Barrio ")).toHaveCount(12);
}

test("ver el macrolote: 12 barrios, común y aviso de distribución ilustrativa", async ({ page }) => {
  await abrir(page);
  await expect(region(page)).toBeVisible();
  await expect(marcador(page, "Terreno común del Lighthouse")).toHaveCount(1);
  await expect(region(page).getByText(/distribuidos al azar, solo de forma ilustrativa/)).toBeVisible();
  await expect(region(page).getByText(/Esri, Maxar, Earthstar Geographics/)).toBeVisible();
});

test("leyenda con texto para cada estado", async ({ page }) => {
  await abrir(page);
  const leyenda = region(page).getByRole("list", { name: "Leyenda del mapa" });
  for (const t of [
    "Barrio con tribu activa",
    "Barrio con tribu en formación",
    "Barrio que busca tribu",
    "Terreno común",
    "Finca disponible",
    "Finca reservada",
    "Finca cantera",
  ]) {
    await expect(leyenda.getByText(t, { exact: true })).toBeVisible();
  }
});

test("sin selección: resumen y conteos, sin el listado de tribus", async ({ page }) => {
  await abrir(page);
  const valor = async (etiqueta: string) =>
    Number(await ficha(page).locator("dl > div", { hasText: etiqueta }).locator("dd").innerText());
  expect(await valor("Activas")).toBe(5);
  expect(await valor("En formación")).toBe(5);
  expect(await valor("Vacantes")).toBe(2);
  await expect(page.getByRole("heading", { name: "Tribus del territorio" })).toHaveCount(1);
  await expect(page.locator("main a[href^='/tribus/']")).toHaveCount(0);
});

test("elegir Valle Solar en el mapa y ir a la tribu", async ({ page }) => {
  await abrir(page);
  await marcador(page, "Barrio 6 ").click();
  await expect(ficha(page).getByRole("heading", { name: "Valle Solar" })).toBeVisible();
  await expect(ficha(page).getByText("Estado: Activa")).toBeVisible();
  await expect(page).toHaveURL(/\/territorios\/lighthouse$/);
  await ficha(page).getByRole("link", { name: "Conocer la tribu" }).click();
  await expect(page).toHaveURL(/\/tribus\/valle$/);
});

test("teclado: Tab hasta el barrio 6 y Enter lo elige", async ({ page }) => {
  await abrir(page);
  const barrio6 = marcador(page, "Barrio 6 ");
  for (let i = 0; i < 60; i++) {
    await page.keyboard.press("Tab");
    if (await barrio6.evaluate((el) => el === document.activeElement)) break;
  }
  await expect(barrio6).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(ficha(page).getByRole("heading", { name: "Valle Solar" })).toBeVisible();
});

test("elegir el terreno común", async ({ page }) => {
  await abrir(page);
  await marcador(page, "Terreno común del Lighthouse").click();
  await expect(ficha(page).getByRole("heading", { name: "Terreno común del Lighthouse" })).toBeVisible();
  await expect(ficha(page).getByText(/118,8 ha/)).toBeVisible();
});

test("finca disponible: datos, consulta simulada y aclaración de agencia", async ({ page }) => {
  await abrir(page);
  await page.getByText(/Fincas disponibles de Soluna/).click();
  await page.getByRole("button", { name: "Finca 502", exact: true }).click();
  await expect(ficha(page).getByRole("heading", { name: "Finca 502" })).toBeVisible();
  await expect(ficha(page).getByText("9.130 m²")).toBeVisible();
  await expect(ficha(page).getByText("Estado: Disponible")).toBeVisible();
  await expect(ficha(page).getByText(/NetX actúa como agencia/)).toBeVisible();
  await expect(ficha(page).getByRole("button", { name: /Qué significa legalmente: NetX como agencia/ })).toBeVisible();
  await ficha(page).getByRole("button", { name: "Consultar por este lote" }).click();
  await expect(ficha(page).getByText("Consulta enviada (simulado)")).toBeVisible();
  await page.reload();
  await page.getByText(/Fincas disponibles de Soluna/).click();
  await page.getByRole("button", { name: "Finca 502", exact: true }).click();
  await expect(ficha(page).getByText("Consulta enviada (simulado)")).toBeVisible();
});

test("finca reservada: sin botón de consulta", async ({ page }) => {
  // Las reservadas no están en la lista; se llega a ellas con un clic en el mapa o con ?sel= (enlace compartible).
  await page.goto("/territorios/lighthouse?sel=finca-501");
  await expect(ficha(page).getByRole("heading", { name: "Finca 501" })).toBeVisible();
  await expect(ficha(page).getByText("Estado: Reservada")).toBeVisible();
  await expect(ficha(page).getByRole("button", { name: "Consultar por este lote" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Finca 501", exact: true })).toHaveCount(0);
});

test("lista Elegir en el mapa: Barrio 3 busca tribu", async ({ page }) => {
  await abrir(page);
  await page.getByRole("button", { name: "Barrio 3", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(ficha(page).getByRole("heading", { name: "Barrio 3 busca tribu" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Barrio 3", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(ficha(page)).toHaveAttribute("aria-live", "polite");
});

test("sin teselas el mapa sigue funcionando", async ({ page }) => {
  await abrir(page);
  await marcador(page, "Barrio 6 ").click();
  await expect(ficha(page).getByRole("heading", { name: "Valle Solar" })).toBeVisible();
});

test("un solo main", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(page.locator("main")).toHaveCount(1);
});

test("celular 390 px: mapa a lo ancho, ficha debajo y sin scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await abrir(page);
  const mapa = region(page).locator(".mapa-leaflet");
  const cajaMapa = (await mapa.boundingBox())!;
  const cajaFicha = (await ficha(page).boundingBox())!;
  expect(cajaFicha.y).toBeGreaterThan(cajaMapa.y + cajaMapa.height - 1);
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(sobra).toBeLessThanOrEqual(0);
});
