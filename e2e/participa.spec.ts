import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { POSICIONES } from "@/lib/equipos/posiciones";
import { conAdhesionAlLighthouse } from "./ayudas";
import { expect, test, type Locator, type Page } from "./fixtura";

const posiciones = (id: string) => POSICIONES[`comun-${id}`].length;
const forma = (page: Page, id: string): Locator => page.locator(`[data-equipo="comun-${id}"]`);
const dialogo = (page: Page): Locator => page.getByRole("dialog");
const graves = async (page: Page) => {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return r.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }));
};

test("abrir Participa: tarjeta del común, pestaña Equipos marcada y el mapa ilustrado con nueve equipos", async ({ page }) => {
  await page.goto("/participa");
  await expect(page.getByRole("heading", { level: 1, name: "Participa" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Lighthouse VRN/ }).first()).toHaveAttribute("href", "/tribus/lighthouse");
  const nav = page.getByRole("navigation", { name: "Secciones de Participa" });
  await expect(nav.getByRole("link", { name: "Equipos" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Visión" })).not.toHaveAttribute("aria-current", "page");
  await expect(page.locator("svg.mapa-ilus").first()).toHaveAttribute("role", "group");
  await expect(page.locator("svg.mapa-ilus").first().locator("title")).toHaveText(/Mapa ilustrado del territorio/);
  await expect(page.getByText("Ilustración · no es un plano")).toBeVisible();
  await expect(page.locator("[data-equipo]")).toHaveCount(9);
  // La misma lista, como botones, debajo del mapa.
  await expect(page.locator("[data-lista-equipo]")).toHaveCount(9);
  await expect(page.locator("main")).toHaveCount(1);
  // Participa está marcado en el menú.
  await expect(page.getByRole("link", { name: "Participa", exact: true }).first()).toHaveAttribute("aria-current", "page");
});

test("cada forma tiene su nombre y la cantidad de posiciones en texto", async ({ page }) => {
  await page.goto("/participa");
  for (const [id, nombre] of [
    ["agua", "Agua"],
    ["gobernanza", "Gobernanza"],
    ["permacultura", "Permacultura y regeneración"],
    ["plataforma", "Tecnología"],
  ] as const) {
    const n = posiciones(id);
    await expect(forma(page, id)).toHaveAttribute("role", "button");
    await expect(forma(page, id)).toHaveAttribute("tabindex", "0");
    await expect(forma(page, id)).toHaveAttribute("aria-label", new RegExp(`^${nombre}, ${n} posiciones abiertas`));
    // El botón de la lista lleva el nombre y, debajo, las posiciones abiertas en texto.
    await expect(page.getByRole("button", { name: new RegExp(`^${nombre}\\s*${n} posiciones abiertas$`) })).toBeVisible();
  }
});

test("hover: la forma se destaca y aparece el globo con el nombre y las posiciones abiertas", async ({ page }) => {
  await page.goto("/participa");
  await forma(page, "agua").scrollIntoViewIfNeeded();
  await forma(page, "agua").hover();
  await expect(forma(page, "agua")).toHaveAttribute("data-activa", "");
  await expect(page.getByText(`Agua · ${posiciones("agua")} posiciones abiertas`, { exact: true })).toBeVisible();
  await expect(page.locator("svg.mapa-ilus").first()).toHaveAttribute("data-activo", "comun-agua");
  await page.mouse.move(2, 2);
  await expect(forma(page, "agua")).not.toHaveAttribute("data-activa", "");
});

test("con Tab: llegar a una forma la destaca igual que el puntero", async ({ page }) => {
  await page.goto("/participa");
  let llego = false;
  for (let i = 0; i < 60 && !llego; i++) {
    await page.keyboard.press("Tab");
    llego = await page.evaluate(() => document.activeElement?.getAttribute("data-equipo") !== null && document.activeElement?.hasAttribute("data-equipo") === true);
  }
  expect(llego).toBe(true);
  const id = await page.evaluate(() => document.activeElement?.getAttribute("data-equipo"));
  await expect(page.locator(`[data-equipo="${id}"]`)).toHaveAttribute("data-activa", "");
  await expect(page.locator("p[aria-hidden='true']").filter({ hasText: "posiciones abiertas" })).toBeVisible();
});

test("clic en Gobernanza abre el detalle con al menos dos posiciones de ejemplo; Escape cierra y devuelve el foco", async ({ page }) => {
  await page.goto("/participa");
  await forma(page, "gobernanza").click();
  const d = dialogo(page);
  await expect(d).toBeVisible();
  await expect(d.getByRole("heading", { level: 2, name: "Gobernanza" })).toBeVisible();
  await expect(page).toHaveURL(/\/participa\?equipo=gobernanza$/);
  await expect(d.getByText("Decide sobre:")).toBeVisible();
  await expect(d.getByRole("heading", { level: 3, name: "Frentes de trabajo" })).toBeVisible();
  await expect(d.getByRole("heading", { level: 3, name: "Posiciones abiertas" })).toBeVisible();
  const tarjetas = d.locator("[data-posicion]");
  expect(await tarjetas.count()).toBeGreaterThanOrEqual(2);
  expect(await tarjetas.count()).toBe(posiciones("gobernanza"));
  await expect(tarjetas.first().getByText("Ejemplo · a definir")).toBeVisible();
  await expect(tarjetas.first().getByText("Dedicación:")).toBeVisible();
  await expect(tarjetas.first().getByText("Qué buscamos:")).toBeVisible();
  await expect(tarjetas.first().getByText("Modalidad:")).toBeVisible();
  await expect(d.getByText(/no son ofertas de empleo/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(d).toBeHidden();
  await expect(page).toHaveURL(/\/participa$/);
  await expect(forma(page, "gobernanza")).toBeFocused();
});

test("con el teclado: Enter y Espacio abren el detalle y el foco queda atrapado adentro", async ({ page }) => {
  await page.goto("/participa");
  await forma(page, "legal").focus();
  await page.keyboard.press("Enter");
  const d = dialogo(page);
  await expect(d.getByRole("heading", { level: 2, name: "Legal" })).toBeVisible();
  // El foco da vueltas adentro del diálogo; nunca cae en la página de atrás (a lo sumo sale a la barra del navegador).
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(() => {
        const el = document.activeElement;
        return el === document.body || el?.closest("dialog") != null;
      }),
    ).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(forma(page, "legal")).toBeFocused();
  await page.keyboard.press("Space");
  await expect(d.getByRole("heading", { level: 2, name: "Legal" })).toBeVisible();
  await d.getByRole("button", { name: /^Cerrar el detalle de Legal$/ }).click();
  await expect(d).toBeHidden();
  await expect(forma(page, "legal")).toBeFocused();
});

test("la lista de abajo abre el mismo detalle y Escape devuelve el foco al botón", async ({ page }) => {
  await page.goto("/participa");
  const boton = page.locator('[data-lista-equipo="comun-cuidado"]');
  await boton.click();
  await expect(dialogo(page).getByRole("heading", { level: 2, name: "Cuidado y conflictos" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(boton).toBeFocused();
});

test("link directo: /participa?equipo=agua abre el detalle del equipo Agua", async ({ page }) => {
  await page.goto("/participa?equipo=agua");
  const d = dialogo(page);
  await expect(d.getByRole("heading", { level: 2, name: "Agua" })).toBeVisible();
  await expect(d.getByText("Diseño de diques y medias lunas")).toBeVisible();
  await expect(d.getByText("Agua y cuenca")).toBeVisible();
  await page.goto("/participa?equipo=no-existe");
  await expect(dialogo(page)).toBeHidden();
  await expect(page.locator("[data-equipo]")).toHaveCount(9);
});

test("Visión: las 12 comunidades de ejemplo con la marca y el aviso", async ({ page }) => {
  await page.goto("/participa?ver=vision");
  await expect(page.getByRole("link", { name: "Visión" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText(/^Ejemplo, a definir: estas comunidades son ejemplos para pensar hacia dónde va el Lighthouse/)).toBeVisible();
  await expect(page.locator("main ul > li > a[href^='/tribus/']:not([aria-label])")).toHaveCount(12);
  await expect(page.getByRole("heading", { level: 2, name: "Comunidades activas" })).toBeVisible();
  await expect(page.locator("[data-equipo]")).toHaveCount(0);
});

test("/tribus redirige a /participa y /tribus?ver=tribus a /participa?ver=vision; /tribus/lighthouse sigue", async ({ page }) => {
  await page.goto("/tribus");
  await expect(page).toHaveURL(/\/participa$/);
  await page.goto("/tribus?ver=tribus");
  await expect(page).toHaveURL(/\/participa\?ver=vision$/);
  await page.goto("/tribus/lighthouse");
  await expect(page).toHaveURL(/\/tribus\/lighthouse$/);
  await expect(page.getByRole("link", { name: "Participa", exact: true }).first()).toHaveAttribute("aria-current", "page");
  await page.goto("/tribus/lighthouse/manifiesto");
  await expect(page).toHaveURL(/\/tribus\/lighthouse\/manifiesto$/);
  await expect(page.getByRole("link", { name: "Participa", exact: true }).first()).toHaveAttribute("aria-current", "page");
});

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("la página se ve y el detalle ofrece Entrá para sumarte", async ({ page }) => {
    await page.goto("/participa?equipo=agua");
    await expect(page).toHaveURL(/\/participa\?equipo=agua$/);
    await expect(dialogo(page).getByRole("link", { name: "Entrá para sumarte" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Quiero sumarme/ })).toHaveCount(0);
  });
});

test("sin adhesión al Lighthouse: el detalle muestra el aviso con el enlace al manifiesto y no el botón", async ({ page }) => {
  await page.goto("/participa?equipo=agua");
  const d = dialogo(page);
  await expect(d.getByText("Para sumarte, primero sumate como aspirante al Lighthouse")).toBeVisible();
  await expect(d.getByRole("link", { name: "Ir al manifiesto del Lighthouse" })).toHaveAttribute("href", "/tribus/lighthouse/manifiesto");
  await expect(page.getByRole("button", { name: /Quiero sumarme/ })).toHaveCount(0);
});

test.describe("explorador", () => {
  test.use({ rol: "persona", plan: "explorador" });

  test("sin la capacidad de adherir ve el mismo aviso del manifiesto", async ({ page }) => {
    await conAdhesionAlLighthouse(page);
    await page.goto("/participa?equipo=agua");
    await expect(dialogo(page).getByText(/Podés leer el manifiesto sin cuenta/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Quiero sumarme/ })).toHaveCount(0);
  });
});

test.describe("con adhesión al Lighthouse", () => {
  test.beforeEach(async ({ page }) => {
    await conAdhesionAlLighthouse(page);
  });

  test("pedir sumarse desde el detalle, que siga al recargar y que la membresía no cambie", async ({ page }) => {
    await page.goto("/participa?equipo=agua");
    const d = dialogo(page);
    const boton = d.getByRole("button", { name: "Quiero sumarme a Agua" });
    await expect(boton).toHaveAttribute("aria-expanded", "false");
    await boton.click();
    await expect(boton).toHaveAttribute("aria-expanded", "true");
    await expect(d.getByText(/lo administra y facilita Hifa/)).toBeVisible();
    await d.getByRole("button", { name: "Confirmar" }).click();
    await expect(d.getByText("Pediste sumarte a Agua · aspirante")).toBeVisible();
    await expect(d.getByRole("button", { name: /Quiero sumarme/ })).toHaveCount(0);

    await page.reload();
    await expect(dialogo(page).getByText("Pediste sumarte a Agua · aspirante")).toBeVisible();
    // Otros equipos siguen pudiendo pedirse.
    await page.goto("/participa?equipo=legal");
    await expect(dialogo(page).getByRole("button", { name: /Quiero sumarme/ })).toBeVisible();

    const guardado = await page.evaluate(() => ({
      equipos: window.localStorage.getItem("lh-equipos"),
      membresia: window.localStorage.getItem("lh-membresia"),
    }));
    expect(JSON.parse(guardado.equipos!)).toEqual({ "comun-agua": "pedido" });
    expect(JSON.parse(guardado.membresia!)).toEqual({ lighthouse: "pedido" });
  });

  test("con el teclado: la confirmación lleva el foco a su título y Cancelar lo devuelve al botón", async ({ page }) => {
    await page.goto("/participa?equipo=agua");
    const d = dialogo(page);
    const boton = d.getByRole("button", { name: "Quiero sumarme a Agua" });
    await boton.focus();
    await page.keyboard.press("Enter");
    await expect(d.getByText("Sumarte a Agua como aspirante")).toBeFocused();
    await d.getByRole("button", { name: "Cancelar" }).focus();
    await page.keyboard.press("Enter");
    await expect(boton).toBeFocused();
    await expect(boton).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => window.localStorage.getItem("lh-equipos"))).toBeNull();
  });

  test("Mis datos: la descarga incluye el pedido", async ({ page }) => {
    await page.goto("/participa?equipo=agua");
    const d = dialogo(page);
    await d.getByRole("button", { name: /Quiero sumarme/ }).click();
    await d.getByRole("button", { name: "Confirmar" }).click();
    await expect(d.getByText(/Pediste sumarte/)).toBeVisible();
    await page.goto("/mis-datos");
    const descarga = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar mis datos" }).click();
    const archivo = await descarga;
    const json = JSON.parse(await readFile((await archivo.path())!, "utf8"));
    expect(json.datos.equipos).toEqual({ "comun-agua": "pedido" });
  });
});

test.describe("movimiento reducido", () => {
  test.use({ reducedMotion: "reduce" });

  test("con la preferencia del sistema no hay animaciones: solo contorno, etiqueta y globo", async ({ page }) => {
    await page.goto("/participa");
    await forma(page, "marketing").hover();
    await expect(forma(page, "marketing")).toHaveAttribute("data-activa", "");
    await expect(page.getByText(`Marketing y comunicación · ${posiciones("marketing")} posiciones abiertas`, { exact: true })).toBeVisible();
    const estilos = await forma(page, "marketing").evaluate((g) => ({
      haz: getComputedStyle(g.querySelector(".anim-haz")!).animationName,
      cuerpo: getComputedStyle(g.querySelector(".forma-cuerpo")!).transform,
      contorno: getComputedStyle(g.querySelector(".forma-contorno")!).opacity,
    }));
    expect(estilos.haz).toBe("none");
    expect(estilos.cuerpo).toBe("none");
    expect(estilos.contorno).toBe("1");
  });
});

test("con Reducir animaciones en Configuración tampoco hay animaciones", async ({ page }) => {
  await page.goto("/configuracion");
  await page.getByLabel("Reducir animaciones").check();
  await expect(page.locator("html")).toHaveAttribute("data-movimiento", "reducido");
  await page.goto("/participa");
  await expect(page.locator("html")).toHaveAttribute("data-movimiento", "reducido");
  await forma(page, "gobernanza").hover();
  const estilos = await forma(page, "gobernanza").evaluate((g) => ({
    fuego: getComputedStyle(g.querySelector(".anim-fuego")!).animationName,
    cuerpo: getComputedStyle(g.querySelector(".forma-cuerpo")!).transform,
  }));
  expect(estilos.fuego).toBe("none");
  expect(estilos.cuerpo).toBe("none");
});

test("sin preferencia de movimiento, activar la forma la eleva y anima su detalle", async ({ page }) => {
  await page.goto("/participa");
  await forma(page, "marketing").hover();
  const estilos = await forma(page, "marketing").evaluate((g) => ({
    haz: getComputedStyle(g.querySelector(".anim-haz")!).animationName,
    cuerpo: getComputedStyle(g.querySelector(".forma-cuerpo")!).transform,
  }));
  expect(estilos.haz).not.toBe("none");
  expect(estilos.cuerpo).not.toBe("none");
});

test("zoom del mapa con los botones + y −", async ({ page }) => {
  await page.goto("/participa");
  const region = page.getByRole("region", { name: /Mapa de equipos/ });
  const ancho = async () => (await region.locator("svg.mapa-ilus").boundingBox())!.width;
  const base = await ancho();
  await page.getByRole("button", { name: "Acercar" }).click();
  expect(await ancho()).toBeGreaterThan(base * 1.4);
  await expect(region).toHaveAttribute("tabindex", "0");
  await page.getByRole("button", { name: "Alejar" }).click();
  expect(Math.round(await ancho())).toBe(Math.round(base));
  await expect(page.getByRole("button", { name: "Alejar" })).toBeDisabled();
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US" });

  test("pestañas, formas, globo y detalle en inglés", async ({ page }) => {
    await page.goto("/participa");
    const nav = page.getByRole("navigation", { name: "Take part sections" });
    await expect(nav.getByRole("link", { name: "Teams" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByText("Illustration · not a plan")).toBeVisible();
    await forma(page, "agua").hover();
    await expect(page.getByText(`Water · ${posiciones("agua")} open positions`, { exact: true })).toBeVisible();
    await forma(page, "agua").click();
    const d = dialogo(page);
    await expect(d.getByRole("heading", { level: 2, name: "Water" })).toBeVisible();
    await expect(d.getByRole("heading", { level: 3, name: "Open positions" })).toBeVisible();
    await expect(d.getByText("Design of check dams and half-moon basins")).toBeVisible();
    await expect(d.getByText("Sample · to be defined").first()).toBeVisible();
    await expect(d.getByText(/not job offers/)).toBeVisible();
  });
});

test.describe("celular a 390 px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("el mapa entra entero, el detalle es una hoja inferior y no hay scroll horizontal", async ({ page }) => {
    await page.goto("/participa");
    const svg = page.locator("svg.mapa-ilus").first();
    await svg.scrollIntoViewIfNeeded();
    expect((await svg.boundingBox())!.width).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await forma(page, "token").click();
    const d = dialogo(page);
    await expect(d.getByRole("heading", { level: 2, name: "Tokenomics y Semillas" })).toBeVisible();
    // Esperar a que termine la entrada de la hoja.
    await expect(async () => {
      const caja = (await d.boundingBox())!;
      expect(caja.width).toBeLessThanOrEqual(390);
      expect(caja.y).toBeGreaterThan(0);
      expect(Math.round(caja.y + caja.height)).toBeLessThanOrEqual(844);
    }).toPass();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    expect(await d.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  });

  test("Visión a 390 px sin scroll horizontal", async ({ page }) => {
    await page.goto("/participa?ver=vision");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

for (const tema of ["claro", "oscuro"] as const) {
  test(`axe sin violaciones serias o críticas en /participa, con y sin el detalle abierto, tema ${tema}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: tema === "oscuro" ? "dark" : "light" });
    await page.goto("/participa");
    if (tema === "oscuro") await expect(page.locator("html")).toHaveAttribute("data-tema", "oscuro");
    expect(await graves(page), "mapa").toEqual([]);
    await forma(page, "plataforma").click();
    await expect(dialogo(page)).toBeVisible();
    // Sin la entrada animada del panel: axe mide los colores ya asentados.
    await page.waitForTimeout(500);
    expect(await graves(page), "detalle").toEqual([]);
    await page.keyboard.press("Escape");
    await page.goto("/participa?ver=vision");
    expect(await graves(page), "visión").toEqual([]);
  });
}
