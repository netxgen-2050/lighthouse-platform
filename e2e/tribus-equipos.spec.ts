import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { conAdhesionAlLighthouse } from "./ayudas";
import { expect, test, type Locator, type Page } from "./fixtura";

const tarjeta = (page: Page, nombre: string): Locator =>
  page.locator("main li").filter({ has: page.getByRole("heading", { level: 3, name: nombre, exact: true }) });

test("pestaña por defecto: Equipos · ahora, marcada como actual, con la lista de equipos", async ({ page }) => {
  await page.goto("/tribus");
  const nav = page.getByRole("navigation", { name: "Secciones de Tribus" });
  await expect(nav.getByRole("link", { name: "Equipos · ahora" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Tribus · visión" })).not.toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 3 })).toHaveCount(8);
  await expect(page.getByText("Un equipo puede volverse una tribu más adelante; el proceso está por definir.")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
});

test("un valor raro de ver muestra los equipos", async ({ page }) => {
  await page.goto("/tribus?ver=xyz");
  await expect(page.getByRole("link", { name: "Equipos · ahora" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 3, name: "Agua del Lighthouse" })).toBeVisible();
});

test("cambiar de pestaña con el teclado", async ({ page }) => {
  await page.goto("/tribus");
  const visión = page.getByRole("link", { name: "Tribus · visión" });
  let llego = false;
  for (let i = 0; i < 40 && !llego; i++) {
    await page.keyboard.press("Tab");
    llego = await visión.evaluate((el) => el === document.activeElement);
  }
  expect(llego).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/tribus\?ver=tribus$/);
  await expect(page.getByRole("link", { name: "Tribus · visión" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("heading", { level: 2, name: "Tribus activas" })).toBeVisible();
});

test("Tribus · visión: las 12 tribus con la marca y el aviso", async ({ page }) => {
  await page.goto("/tribus?ver=tribus");
  await expect(page.getByText(/^Ejemplo, a definir: estas tribus son ejemplos para pensar hacia dónde va el Lighthouse, no tribus reales/)).toBeVisible();
  await expect(page.locator("main ul > li > a[href^='/tribus/']:not([aria-label])")).toHaveCount(12);
  await expect(page.locator("main a[href^='/tribus/']").getByText("Ejemplo · a definir")).toHaveCount(12);
});

test("ficha de una tribu y de una vacante: marca Ejemplo · a definir", async ({ page }) => {
  await page.goto("/tribus/valle");
  await expect(page.getByText("Ejemplo · a definir")).toBeVisible();
  await page.goto("/tribus/grano");
  await expect(page.getByText("Ejemplo · a definir")).toBeVisible();
});

test("Agua muestra su frente con lo que falta y para cuándo", async ({ page }) => {
  await page.goto("/tribus");
  const agua = tarjeta(page, "Agua del Lighthouse");
  await expect(agua.getByText("Agua y cuenca")).toBeVisible();
  await expect(agua.getByText("1 hidróloga, 2 personas para mediciones de campo")).toBeVisible();
  await expect(agua.getByText("antes de diciembre")).toBeVisible();
  await expect(agua.getByText("En el mapa del Lighthouse (ilustrativo)")).toBeVisible();
});

test("Legal dice Sin lugar en el mapa", async ({ page }) => {
  await page.goto("/tribus");
  const legal = tarjeta(page, "Legal y fideicomiso");
  await expect(legal.getByText("Papeles y fideicomiso")).toBeVisible();
  await expect(legal.getByText("Sin lugar en el mapa")).toBeVisible();
});

test("Primer obrador aparece como Más adelante · fase 1", async ({ page }) => {
  await page.goto("/tribus");
  const c = tarjeta(page, "Gestión de contratistas");
  const obrador = c.locator("li").filter({ hasText: "Primer obrador" });
  await expect(obrador.getByText("Más adelante · fase 1")).toBeVisible();
  await expect(c.locator("li").filter({ hasText: "Acceso y camino" }).getByText("Más adelante")).toHaveCount(0);
});

test("Línea de base dice sin dato donde falta quién", async ({ page }) => {
  await page.goto("/tribus");
  const linea = tarjeta(page, "Permacultura y suelo").locator("li").filter({ hasText: "Línea de base" });
  await expect(linea.getByText("Quién falta:")).toBeVisible();
  await expect(linea).toContainText("Quién falta: sin dato");
});

test("un equipo sin frentes lo dice", async ({ page }) => {
  await page.goto("/tribus");
  await expect(tarjeta(page, "Tokenomics y Semillas").getByText("Sin frentes abiertos por ahora")).toBeVisible();
});

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("ve Entrá para sumarte en vez del botón", async ({ page }) => {
    await page.goto("/tribus");
    const agua = tarjeta(page, "Agua del Lighthouse");
    await expect(agua.getByRole("link", { name: "Entrá para sumarte" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Quiero sumarme/ })).toHaveCount(0);
  });
});

test("sin adhesión al Lighthouse: ve el aviso con el enlace al manifiesto y no el botón", async ({ page }) => {
  await page.goto("/tribus");
  const agua = tarjeta(page, "Agua del Lighthouse");
  await expect(agua.getByText("Para sumarte, primero sumate como aspirante al Lighthouse")).toBeVisible();
  await expect(agua.getByRole("link", { name: "Ir al manifiesto del Lighthouse" })).toHaveAttribute(
    "href",
    "/tribus/lighthouse/manifiesto",
  );
  await expect(page.getByRole("button", { name: /Quiero sumarme/ })).toHaveCount(0);
});

test.describe("explorador", () => {
  test.use({ rol: "persona", plan: "explorador" });

  test("sin la capacidad de adherir ve el mismo aviso del manifiesto", async ({ page }) => {
    await conAdhesionAlLighthouse(page);
    await page.goto("/tribus");
    const agua = tarjeta(page, "Agua del Lighthouse");
    await expect(agua.getByText(/Podés leer el manifiesto sin cuenta/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Quiero sumarme/ })).toHaveCount(0);
  });
});

test.describe("con adhesión al Lighthouse", () => {
  test.beforeEach(async ({ page }) => {
    await conAdhesionAlLighthouse(page);
  });

  test("pedir sumarse, que siga al recargar y que la membresía no cambie", async ({ page }) => {
    await page.goto("/tribus");
    const agua = tarjeta(page, "Agua del Lighthouse");
    const boton = agua.getByRole("button", { name: "Quiero sumarme a Agua del Lighthouse" });
    await expect(boton).toHaveAttribute("aria-expanded", "false");
    await boton.click();
    await expect(boton).toHaveAttribute("aria-expanded", "true");
    await expect(agua.getByText(/lo administra y facilita Hifa/)).toBeVisible();
    await agua.getByRole("button", { name: "Confirmar" }).click();
    await expect(agua.getByText("Pediste sumarte a Agua del Lighthouse · aspirante")).toBeVisible();
    await expect(agua.getByRole("button", { name: /Quiero sumarme/ })).toHaveCount(0);

    await page.reload();
    await expect(tarjeta(page, "Agua del Lighthouse").getByText("Pediste sumarte a Agua del Lighthouse · aspirante")).toBeVisible();
    // Otros equipos siguen pudiendo pedirse.
    await expect(tarjeta(page, "Legal y fideicomiso").getByRole("button", { name: /Quiero sumarme/ })).toBeVisible();

    const guardado = await page.evaluate(() => ({
      equipos: window.localStorage.getItem("lh-equipos"),
      membresia: window.localStorage.getItem("lh-membresia"),
    }));
    expect(JSON.parse(guardado.equipos!)).toEqual({ "comun-agua": "pedido" });
    expect(JSON.parse(guardado.membresia!)).toEqual({ lighthouse: "pedido" });
  });

  test("con el teclado: se abre la confirmación con el foco en su título y Cancelar devuelve el foco", async ({ page }) => {
    await page.goto("/tribus");
    const agua = tarjeta(page, "Agua del Lighthouse");
    const boton = agua.getByRole("button", { name: "Quiero sumarme a Agua del Lighthouse" });
    await boton.focus();
    await page.keyboard.press("Enter");
    await expect(agua.getByText("Sumarte a Agua del Lighthouse como aspirante")).toBeFocused();
    await agua.getByRole("button", { name: "Cancelar" }).focus();
    await page.keyboard.press("Enter");
    await expect(boton).toBeFocused();
    await expect(boton).toHaveAttribute("aria-expanded", "false");
    const guardado = await page.evaluate(() => window.localStorage.getItem("lh-equipos"));
    expect(guardado).toBeNull();
  });

  test("si la adhesión se retira entre abrir y confirmar, no se escribe nada", async ({ page }) => {
    await page.goto("/tribus");
    const agua = tarjeta(page, "Agua del Lighthouse");
    await agua.getByRole("button", { name: /Quiero sumarme/ }).click();
    await page.evaluate(() => window.localStorage.removeItem("lh-membresia"));
    await agua.getByRole("button", { name: "Confirmar" }).click();
    await expect(agua.getByText("Para sumarte, primero sumate como aspirante al Lighthouse")).toBeVisible();
    expect(await page.evaluate(() => window.localStorage.getItem("lh-equipos"))).toBeNull();
  });

  test("Mis datos: la descarga incluye el pedido", async ({ page }) => {
    await page.goto("/tribus");
    const agua = tarjeta(page, "Agua del Lighthouse");
    await agua.getByRole("button", { name: /Quiero sumarme/ }).click();
    await agua.getByRole("button", { name: "Confirmar" }).click();
    await expect(agua.getByText(/Pediste sumarte/)).toBeVisible();
    await page.goto("/mis-datos");
    const descarga = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar mis datos" }).click();
    const archivo = await descarga;
    const json = JSON.parse(await readFile((await archivo.path())!, "utf8"));
    expect(json.datos.equipos).toEqual({ "comun-agua": "pedido" });
  });
});

test("axe sin violaciones serias o críticas en las dos pestañas", async ({ page }) => {
  for (const ruta of ["/tribus", "/tribus?ver=tribus"]) {
    await page.goto(ruta);
    await expect(page.getByRole("navigation", { name: "Secciones de Tribus" })).toBeVisible();
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) })), ruta).toEqual([]);
  }
});

test.describe("en inglés a 390 px", () => {
  test.use({ locale: "en-US", viewport: { width: 390, height: 844 } });

  test("pestañas y tarjetas en inglés y sin scroll horizontal", async ({ page }) => {
    await page.goto("/tribus");
    await expect(page.getByRole("navigation", { name: "Tribes sections" }).getByRole("link", { name: "Teams · now" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByRole("link", { name: "Tribes · vision" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Lighthouse water" })).toBeVisible();
    await expect(page.getByText("No place on the map").first()).toBeVisible();
    await expect(page.getByText("Later on · phase 1").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.goto("/tribus?ver=tribus");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});
