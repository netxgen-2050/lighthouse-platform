import { expect, test, type Page } from "./fixtura";
import { formatearNumero } from "../lib/idioma/formatos";
import { fuenteDelLoteo, listarLotes } from "../lib/territorios/loteo";
import { resumenDelLoteo } from "../lib/territorios/loteo-textos";

// Las teselas satelitales son externas: los tests no dependen de ellas.
test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

const ficha = (page: Page) => page.getByRole("complementary", { name: "Ficha del territorio" });
const vistas = (page: Page) => page.getByRole("group", { name: "Vista del mapa" });
const lista = (page: Page) => page.getByRole("list", { name: "Lotes del sector norte" });
const noEsBoceto = fuenteDelLoteo() !== "ilustrativa";

test("la vista Lotes está marcada por defecto y el mapa se llama Lotes", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(vistas(page).getByRole("button", { name: /Lotes · sector norte/ })).toHaveAttribute("aria-pressed", "true");
  await expect(vistas(page).getByRole("button", { name: /Ahora/ })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("region", { name: /^Mapa del Macrolote 7 · vista Lotes/ })).toBeVisible();
  await expect(page.locator('[aria-label^="Barrio "]')).toHaveCount(0);
});

test("el resumen y la marca salen de los datos y la lista tiene todos los lotes", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(ficha(page).getByText(resumenDelLoteo("es"))).toBeVisible();
  await expect(ficha(page).getByText("Loteo provisorio, ilustrativo")).toBeVisible();
  await expect(lista(page).getByRole("button")).toHaveCount(listarLotes().length);
  await expect(page.getByText("Estados de ejemplo.").first()).toBeVisible();
  const leyenda = page.getByRole("group", { name: "Leyenda del mapa" });
  for (const estado of ["Disponible", "Reservado", "Vendido"]) await expect(leyenda).toContainText(estado);
  await expect(ficha(page).getByText("Este loteo todavía no dice qué se vende en cada fase (sin dato).")).toBeVisible();
});

test("con el boceto, dice de dónde viene y qué no considera", async ({ page }) => {
  test.skip(noEsBoceto, "solo mientras el archivo sea el boceto");
  await page.goto("/territorios/lighthouse");
  await expect(ficha(page).getByText(/lo reemplaza el plano de Martín/)).toBeVisible();
  await expect(ficha(page).getByText(/no considera la línea de inundación, la costa ni el relieve/)).toBeVisible();
  await expect(ficha(page).getByText("25 lotes de 1.344 a 2.200 m² en un sector de 102 ha")).toBeVisible();
});

test("elegir un lote con el teclado: Tab, Enter, panel y URL", async ({ page }) => {
  test.skip(noEsBoceto, "el lote 7 y su superficie son del boceto");
  await page.goto("/territorios/lighthouse");
  await lista(page).getByRole("button", { name: /^Lote 6 ·/ }).focus();
  await page.keyboard.press("Tab");
  await expect(lista(page).getByRole("button", { name: /^Lote 7 ·/ })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/sel=lote-7/);
  await expect(ficha(page).getByRole("heading", { name: "Lote 7" })).toBeVisible();
  await expect(ficha(page).getByText("1.344 m²")).toBeVisible();
  await expect(ficha(page).getByText(/Disponible/)).toBeVisible();
  await expect(ficha(page).getByText("Loteo provisorio, ilustrativo")).toBeVisible();
  await expect(ficha(page).getByText(/supuesto de trabajo, no otorgada/)).toBeVisible();
  await expect(ficha(page).getByRole("button", { name: /comprar|reservar|señar|buy|reserve/i })).toHaveCount(0);
  await expect(ficha(page).getByRole("link", { name: /comprar|reservar|señar|buy|reserve/i })).toHaveCount(0);
});

test("cada lote de la lista dice su número, superficie y estado", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  const l = listarLotes()[0];
  const m2 = l.superficieM2 === undefined ? "sin dato" : `${formatearNumero(l.superficieM2, "es")} m²`;
  await expect(lista(page).getByRole("button", { name: `Lote ${l.numero} · ${m2} · Disponible` })).toBeVisible();
});

test("enlace a un lote vendido: abre Lotes con el lote elegido y dice Vendido", async ({ page }) => {
  test.skip(noEsBoceto, "lote-13 vendido es un estado de ejemplo del boceto");
  await page.goto("/territorios/lighthouse?sel=lote-13");
  await expect(vistas(page).getByRole("button", { name: /Lotes/ })).toHaveAttribute("aria-pressed", "true");
  await expect(ficha(page).getByRole("heading", { name: "Lote 13" })).toBeVisible();
  await expect(ficha(page).getByText(/Vendido/)).toBeVisible();
  await expect(lista(page).getByRole("button", { name: /^Lote 13 ·/ })).toHaveAttribute("aria-pressed", "true");
});

test("en las otras vistas no hay lista de lotes y el enlace a un lote no lo elige", async ({ page }) => {
  await page.goto("/territorios/lighthouse?vista=ahora&sel=lote-7");
  await expect(vistas(page).getByRole("button", { name: /Ahora/ })).toHaveAttribute("aria-pressed", "true");
  await expect(lista(page)).toHaveCount(0);
  await expect(ficha(page).getByRole("heading", { name: "Dónde podés ayudar" })).toBeVisible();
});

test("celular 390 px: sin scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/territorios/lighthouse");
  await expect(lista(page).getByRole("button").first()).toBeVisible();
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(sobra).toBeLessThanOrEqual(0);
});

test("el estado administrativo de Soluna y el de Norte se distinguen en la página", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  const soluna = page.getByRole("region", { name: "Estado administrativo · Chacras de Soluna" });
  const norte = page.getByRole("region", { name: "Estado administrativo · Lighthouse VRN" });
  await expect(soluna).toContainText("Aprobación municipal: pendiente");
  await expect(norte).toContainText("Lighthouse VRN · sector norte");
  await expect(norte).toContainText("Loteo provisorio");
  await expect(norte).toContainText("Aprobación municipal: supuesto de trabajo, no otorgada");
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US" });

  test("marca, estados y lote vendido en inglés", async ({ page }) => {
    await page.goto("/territorios/lighthouse");
    await expect(page.getByRole("complementary", { name: "Territory details" }).getByText("Provisional, illustrative subdivision")).toBeVisible();
    const leyenda = page.getByRole("group", { name: "Map legend" });
    for (const estado of ["Available", "Reserved", "Sold"]) await expect(leyenda).toContainText(estado);
    await expect(page.getByRole("region", { name: /^Map of Macrolote 7 · Lots view/ })).toBeVisible();
    await expect(page.getByRole("region", { name: "Administrative status · Lighthouse VRN" })).toContainText("working assumption, not granted");
    test.skip(noEsBoceto, "lote-13 vendido es un estado de ejemplo del boceto");
    await page.goto("/territorios/lighthouse?sel=lote-13");
    await expect(page.getByRole("complementary", { name: "Territory details" }).getByText(/Sold/)).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Territory details" }).getByRole("heading", { name: "Lot 13" })).toBeVisible();
  });
});
