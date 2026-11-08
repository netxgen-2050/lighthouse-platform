import { expect, test, type Page } from "./fixtura";
import { faroEn, usdConDecimales } from "../lib/bien-comun/formato";
import { MONTO_MINIMO_USD, TRAMOS, cotizar, disponiblePorTramo } from "../lib/bien-comun/modelo";

// El bien común con tokens (bien-comun-tokens): simulación para el equipo. Los valores que se esperan salen del módulo,
// nunca escritos a mano.
const RUTA = "/bien-comun";

test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

const main = (page: Page) => page.locator("main");

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("se lee sin entrar: un h1, el aviso de simulación antes de cualquier número y el aviso de prototipo", async ({ page }) => {
    const r = await page.goto(RUTA);
    expect(r?.status()).toBe(200);
    await expect(page).toHaveURL(/\/bien-comun$/);
    await expect(page.getByRole("heading", { level: 1, name: "El bien común de Lighthouse VRN" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByText("Prototipo interno · datos de ejemplo").first()).toBeVisible();
    const aviso = "no se emite ningún token, nada se cobra y nada está decidido";
    await expect(main(page)).toContainText(aviso);
    const texto = (await main(page).innerText()).replace(/\s+/g, " ");
    expect(texto.indexOf(aviso)).toBeLessThan(texto.search(/\d/));
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  });

  test("Ostrom: ocho principios, cada uno marcado como idea", async ({ page }) => {
    await page.goto(RUTA);
    const tabla = page.getByRole("table", { name: /principios de Ostrom/ });
    await expect(tabla.getByRole("row")).toHaveCount(9);
    await expect(tabla.getByText("idea", { exact: true })).toHaveCount(8);
  });

  test("dos tipos de token: el NFT del lote y FARO con su nombre provisorio, con su ⚖", async ({ page }) => {
    await page.goto(RUTA);
    await expect(main(page).getByRole("heading", { level: 3, name: /NFT del lote/ })).toBeVisible();
    await expect(main(page)).toContainText("FARO, nombre provisorio");
    await expect(main(page)).toContainText("No reemplaza la escritura");
    for (const nombre of ["NFT del lote", "Token del bien común"]) {
      await expect(page.getByRole("button", { name: `Qué significa legalmente: ${nombre}` }).first()).toBeVisible();
    }
  });

  test("las parcelas comunes se leen del plano y no se venden", async ({ page }) => {
    await page.goto(RUTA);
    const s = page.getByRole("region", { name: "Las parcelas comunes" });
    await expect(s).toContainText("No se vende");
    await expect(s.getByRole("listitem").first()).toBeVisible();
    await expect(s).toContainText("Cocinas comunitarias");
  });

  test("el reparto de FARO tiene los cuatro grupos en una tabla", async ({ page }) => {
    await page.goto(RUTA);
    const tabla = page.getByRole("table", { name: /Reparto de FARO por grupo/ });
    await expect(tabla.getByRole("row")).toHaveCount(5);
    for (const g of ["Lotes y familias", "Venta temprana por tramos", "Tesoro del bien común", "NetXGen"]) {
      await expect(tabla.getByRole("rowheader", { name: new RegExp(g) })).toBeVisible();
    }
    await expect(page.getByRole("button", { name: "Qué significa legalmente: Parte de NetXGen" })).toBeVisible();
  });

  test("los tramos y el avance de ejemplo salen del módulo", async ({ page }) => {
    await page.goto(RUTA);
    const tabla = page.getByRole("table", { name: /Tramos de la venta temprana/ });
    await expect(tabla.getByRole("row")).toHaveCount(TRAMOS.length + 1);
    await expect(tabla).toContainText(usdConDecimales(TRAMOS[0].precio, "es", 2));
    await expect(main(page)).toContainText("Avance de ejemplo");
  });

  test("la calculadora se maneja con el teclado y anuncia el resultado; no hay botón de compra", async ({ page }) => {
    await page.goto(RUTA);
    const campo = page.getByLabel("Cuánto pondrías (USD)");
    await campo.focus();
    await expect(campo).toBeFocused();
    const usd = disponiblePorTramo()[0] * TRAMOS[0].precio + 1000;
    await page.keyboard.type(String(Math.round(usd)));
    const c = cotizar(Math.round(usd));
    if (!c.ok) throw new Error("la cotización de prueba debería andar");
    const resultado = page.getByRole("status").filter({ hasText: "Resultado" });
    await expect(resultado).toHaveAttribute("aria-live", "polite");
    await expect(resultado).toContainText(`Recibirías ${faroEn(c.faro, "es")}`);
    await expect(resultado).toContainText("Precio promedio");
    await expect(resultado).toContainText("Tramos que toca: 1, 2");
    await expect(resultado).toContainText("Iría al tesoro del bien común");
    await expect(main(page)).toContainText("No se puede comprar: es una simulación.");
    await expect(main(page).getByRole("button", { name: /comprar|pagar|reservar/i })).toHaveCount(0);
    const claves = await page.evaluate(() => Object.keys(window.localStorage).filter((k) => k.includes("bien") || k.includes("faro")));
    expect(claves).toEqual([]);
  });

  test("con un monto menor al mínimo, dice el monto mínimo y no da resultado", async ({ page }) => {
    await page.goto(RUTA);
    const campo = page.getByLabel("Cuánto pondrías (USD)");
    await campo.fill(String(MONTO_MINIMO_USD - 1));
    const resultado = page.getByRole("status").filter({ hasText: "Resultado" });
    await expect(resultado).toContainText("Monto mínimo");
    await expect(resultado).not.toContainText("Recibirías");
  });

  test("staking en dos opciones, CAPEX y OPEX con montos sin dato, referentes a verificar y riesgos", async ({ page }) => {
    await page.goto(RUTA);
    const staking = page.getByRole("table", { name: /dos opciones de staking/ });
    await expect(staking.getByRole("row")).toHaveCount(3);
    await expect(staking).toContainText("diluye a quien no bloquea");
    await expect(main(page)).toContainText("Para conversar: la opción A premia el compromiso sin emitir más.");
    await expect(main(page)).toContainText("Montos: sin dato · a confirmar con Vagner");
    for (const r of ["Commons Stack", "RealT", "Nouns", "Harberger", "CityDAO"]) {
      await expect(main(page).getByRole("listitem").filter({ hasText: r })).toContainText("a verificar");
    }
    await expect(main(page)).toContainText("valor negociable ante la CNV");
    await expect(main(page)).toContainText("El NFT no es la escritura");
  });

  test("no promete nada: ni ganancia, ni retorno, ni valorización, y todo es simulación", async ({ page }) => {
    await page.goto(RUTA);
    const texto = await main(page).innerText();
    expect(texto).not.toMatch(/ganancia|retorno|valorizaci[oó]n/i);
    expect(texto).not.toMatch(/RAIZ/);
    await expect(main(page).getByRole("link", { name: "Ver qué es tuyo y qué es de todos" })).toHaveAttribute("href", "/lotes/hibrido");
  });

  test("a 390 px no hay scroll horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(RUTA);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });

  test("?lang=en se lee en inglés, sin español suelto, y no hay scroll horizontal a 390 px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${RUTA}?lang=en`);
    await expect(page.getByRole("heading", { level: 1, name: "The commons of Lighthouse VRN" })).toBeVisible();
    const texto = await main(page).innerText();
    expect(texto).toContain("commons");
    expect(texto).toContain("Simulation to talk about in the team");
    for (const suelto of [/Simulación/, /bien común/i, /Todavía/, /sin dato/i, /A verificar/, /Tramo\b/, /Escribí/, /¿|¡/]) {
      expect(texto, String(suelto)).not.toMatch(suelto);
    }
    await page.getByLabel("How much would you put in (USD)").fill("500");
    await expect(page.getByRole("status").filter({ hasText: "Result" })).toContainText("You would receive");
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
});

test("el rail lleva a Bien común, y desde Lotes y Sumarte hay un enlace", async ({ page }) => {
  await page.goto("/lotes");
  await expect(page.getByRole("link", { name: "El token del bien común: ver la simulación" })).toHaveAttribute("href", "/bien-comun");
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Bien común" }).click();
  await expect(page).toHaveURL(/\/bien-comun$/);
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Bien común" })).toHaveAttribute("aria-current", "page");
  await page.goto("/lotes/hibrido");
  await expect(page.getByRole("link", { name: "El token del bien común: ver la simulación" })).toHaveAttribute("href", "/bien-comun");
  await page.goto("/sumarte");
  await expect(page.getByRole("link", { name: "El token del bien común: ver la simulación" })).toHaveAttribute("href", "/bien-comun");
});
