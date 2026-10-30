import { conAdhesionAlLighthouse } from "./ayudas";
import { expect, test, type Page } from "./fixtura";

// Las teselas satelitales son externas: los tests no dependen de ellas.
test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

const ficha = (page: Page) => page.getByRole("complementary", { name: "Ficha del territorio" });
const vistas = (page: Page) => page.getByRole("group", { name: "Vista del mapa" });
const mapa = (page: Page) => page.getByRole("region", { name: /^Mapa del Macrolote 7 · vista/ });
const frentes = (page: Page) => page.locator('[aria-label^="Frente "][role="button"]');
const listaFrentes = (page: Page) => ficha(page).getByRole("list", { name: "Dónde podés ayudar" });

test("vista por defecto: Ahora, con frentes y sin barrios", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(vistas(page).getByRole("button", { name: /Ahora · frentes de trabajo/ })).toHaveAttribute("aria-pressed", "true");
  await expect(vistas(page).getByRole("button", { name: /Plan · zonas/ })).toHaveAttribute("aria-pressed", "false");
  await expect(frentes(page)).toHaveCount(4);
  await expect(page.locator('[aria-label^="Barrio "]')).toHaveCount(0);
  await expect(mapa(page)).toHaveAttribute("aria-label", /vista Ahora · fase 0 \(hoy\)/);
});

test("enlace compartible: ?vista=vision muestra los 12 barrios", async ({ page }) => {
  await page.goto("/territorios/lighthouse?vista=vision");
  await expect(vistas(page).getByRole("button", { name: /Visión · tribus por barrio/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[aria-label^="Barrio "][role="button"]')).toHaveCount(12);
  await expect(frentes(page)).toHaveCount(0);
});

test("vista desconocida abre Ahora", async ({ page }) => {
  await page.goto("/territorios/lighthouse?vista=red");
  await expect(vistas(page).getByRole("button", { name: /Ahora/ })).toHaveAttribute("aria-pressed", "true");
});

test("enlace viejo a un barrio abre Visión con el barrio elegido", async ({ page }) => {
  await page.goto("/territorios/lighthouse?sel=barrio-6");
  await expect(vistas(page).getByRole("button", { name: /Visión/ })).toHaveAttribute("aria-pressed", "true");
  await expect(ficha(page).getByRole("heading", { name: "Valle Solar" })).toBeVisible();
});

test("con vista explícita, un barrio no se elige en Ahora", async ({ page }) => {
  await page.goto("/territorios/lighthouse?vista=ahora&sel=barrio-6");
  await expect(vistas(page).getByRole("button", { name: /Ahora/ })).toHaveAttribute("aria-pressed", "true");
  await expect(ficha(page).getByRole("heading", { name: "Dónde podés ayudar" })).toBeVisible();
});

test("cambiar de vista escribe la URL, limpia la selección y no rearma el mapa", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(frentes(page)).toHaveCount(4);
  await page.evaluate(() => document.querySelector(".leaflet-tile-pane")!.setAttribute("data-marca", "1"));
  await listaFrentes(page).getByRole("button", { name: /Agua y cuenca/ }).click();
  await expect(page).toHaveURL(/sel=agua-cuenca/);
  await vistas(page).getByRole("button", { name: /Plan · zonas/ }).click();
  await expect(page).toHaveURL(/vista=plan/);
  await expect(page).not.toHaveURL(/sel=/);
  // Con Tab no hay sellos de otra vista: en Plan no existen los de frentes.
  await expect(frentes(page)).toHaveCount(0);
  await expect(page.locator(".leaflet-tile-pane[data-marca='1']")).toHaveCount(1);
});

test("fase 1 con el teclado: suma Primer obrador y Parque agrovoltaico", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(page.getByRole("radio", { name: /^Fase 0 · hoy/ })).toBeChecked();
  await page.getByRole("radio", { name: /^Fase 0/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: /^Fase 1/ })).toBeChecked();
  await expect(page).toHaveURL(/fase=1/);
  await expect(frentes(page)).toHaveCount(6);
  await expect(listaFrentes(page).getByRole("button", { name: /Primer obrador/ })).toBeVisible();
  await expect(listaFrentes(page).getByRole("button", { name: /Parque agrovoltaico/ })).toBeVisible();
});

test("fase de hoy sin ?fase=: la 0 está elegida y dice hoy", async ({ page }) => {
  await page.goto("/territorios/lighthouse?fase=9");
  await expect(page.getByRole("radio", { name: /hoy/ })).toBeChecked();
});

test("elegir un frente desde la lista con el teclado", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await listaFrentes(page).getByRole("button", { name: /Agua y cuenca/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[aria-label^="Frente 1:"]')).toBeVisible();
  await expect(page.locator('[aria-label^="Frente 1:"] .mapa-sello-elegido')).toHaveCount(1);
  await expect(ficha(page).getByRole("heading", { name: "Agua y cuenca" })).toBeVisible();
  await expect(ficha(page).getByText("Equipo: Agua del Lighthouse")).toBeVisible();
  await expect(ficha(page).getByText(/Necesidad: Medir el caudal/)).toBeVisible();
  await expect(ficha(page).getByText(/Falta: 1 hidróloga/)).toBeVisible();
  await expect(ficha(page).getByText(/Para: antes de diciembre/)).toBeVisible();
  await expect(ficha(page).getByText(/el punto no marca una obra real/)).toBeVisible();
  await expect(page).toHaveURL(/sel=agua-cuenca/);
});

test("frentes sin lugar y frentes que vienen en el panel", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  const sin = ficha(page).getByRole("list", { name: "Sin lugar en el mapa" });
  await expect(sin.getByText(/Papeles y fideicomiso/)).toBeVisible();
  await expect(sin.getByText(/Comunicación/)).toBeVisible();
  await expect(page.locator('[aria-label*="Papeles"]')).toHaveCount(0);
  const despues = ficha(page).getByRole("list", { name: "Más adelante" });
  await expect(despues.getByText(/Primer obrador · .* · Más adelante · fase 1/)).toBeVisible();
});

test("frente que viene: dice Más adelante y no ofrece sumarse", async ({ page }) => {
  await conAdhesionAlLighthouse(page);
  await page.goto("/territorios/lighthouse?fase=1");
  await listaFrentes(page).getByRole("button", { name: /Primer obrador/ }).click();
  await expect(ficha(page).getByText("Más adelante · fase 1", { exact: true })).toBeVisible();
  await expect(ficha(page).getByRole("button", { name: /Quiero sumarme/ })).toHaveCount(0);
});

test("sumarse desde el mapa", async ({ page }) => {
  await conAdhesionAlLighthouse(page);
  await page.goto("/territorios/lighthouse");
  await page.locator('[aria-label^="Frente 3:"]').click();
  await ficha(page).getByRole("button", { name: "Quiero sumarme a este frente" }).click();
  await ficha(page).getByRole("button", { name: "Confirmar" }).click();
  await expect(ficha(page).getByText(/Pediste sumarte a .*Permacultura.* · aspirante/)).toBeVisible();
});

test("Plan: zonas sin tribus y la fuente que todavía no está", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await vistas(page).getByRole("button", { name: /Plan · zonas/ }).click();
  await expect(page.locator('[aria-label^="Barrio "]')).toHaveCount(0);
  await expect(page.locator('[aria-label="Terreno común del Lighthouse"]')).toHaveCount(1);
  await expect(ficha(page).getByText("Masterplan de Martín: todavía no está")).toBeVisible();
  await expect(ficha(page).getByText(/Fuente:.*Distribución ilustrativa/)).toBeVisible();
  await expect(ficha(page).getByText(/todavía no dice qué se hace en cada fase \(sin dato\)/)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Barrio 6/ })).toHaveCount(0);
});

test("Visión: barrio 6 con la marca de tribus de ejemplo", async ({ page }) => {
  await page.goto("/territorios/lighthouse?vista=vision");
  await expect(ficha(page).getByText("En la fase 0 todavía no hay tribus: hay equipos.")).toBeVisible();
  await page.getByRole("region", { name: "Elegir en el mapa" }).getByRole("button", { name: /^Barrio 6/ }).click();
  await expect(ficha(page).getByRole("heading", { name: "Valle Solar" })).toBeVisible();
  await expect(ficha(page).getByText("Estado: Activa")).toBeVisible();
  await expect(ficha(page).getByText("Tribus de ejemplo, a definir")).toBeVisible();
  await expect(ficha(page).getByRole("link", { name: "Conocer la tribu" })).toBeVisible();
});

test("finca 502 en la vista Ahora", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await page.getByText(/Fincas disponibles de Soluna/).click();
  await page.getByRole("button", { name: "Finca 502", exact: true }).click();
  await expect(ficha(page).getByRole("heading", { name: "Finca 502" })).toBeVisible();
  await expect(ficha(page).getByRole("button", { name: "Consultar por este lote" })).toBeVisible();
});

test("Ver en el mapa desde Equipos", async ({ page }) => {
  await page.goto("/tribus");
  await page.getByRole("link", { name: /Ver en el mapa.*Agua y cuenca/ }).click();
  await expect(page).toHaveURL(/\/territorios\/lighthouse\?vista=ahora&sel=agua-cuenca/);
  await expect(ficha(page).getByRole("heading", { name: "Agua y cuenca" })).toBeVisible();
});

test("celular 390 px: selector y etapa en el ancho, ficha debajo, sin scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/territorios/lighthouse");
  await expect(frentes(page)).toHaveCount(4);
  const caja = (await page.locator(".mapa-leaflet").boundingBox())!;
  const cajaFicha = (await ficha(page).boundingBox())!;
  expect(cajaFicha.y).toBeGreaterThan(caja.y + caja.height - 1);
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(sobra).toBeLessThanOrEqual(0);
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US" });

  test("selector, etapa, leyenda y frentes en inglés", async ({ page }) => {
    await page.goto("/territorios/lighthouse");
    await expect(page.getByRole("group", { name: "Map view" }).getByRole("button", { name: /Now · work fronts/ })).toBeVisible();
    await expect(page.getByRole("group", { name: "Stage" })).toBeVisible();
    await expect(page.getByRole("radio", { name: /^Phase 0 · today/ })).toBeChecked();
    await expect(page.getByRole("complementary", { name: "Territory details" }).getByRole("heading", { name: "Where you can help" })).toBeVisible();
    await expect(page.getByText("Work front (number, solid border)")).toBeVisible();
    await expect(page.locator('[aria-label^="Front 1: Water and watershed"]')).toHaveCount(1);
  });
});
