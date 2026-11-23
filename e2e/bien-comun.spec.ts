import { expect, test, type Page } from "./fixtura";
import { enteroEn, faroEn } from "../lib/bien-comun/formato";
import { CAMBIOS_DESDE_V_ANTERIOR, DECISIONES, FARO_POR_M2, POLITICA, PUENTES, PUERTAS } from "../lib/bien-comun/modelo";

// La propuesta v0.1 del bien común (bien-comun-propuesta): propuesta en discusión. Los valores que se esperan salen del
// módulo, nunca escritos a mano.
const RUTA = "/bien-comun";
const ENLACE = "El token del bien común: ver la propuesta en discusión";

test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

const main = (page: Page) => page.locator("main");
const textoFueraDeCambios = (page: Page) =>
  main(page).evaluate((el) => {
    const copia = el.cloneNode(true) as HTMLElement;
    copia.querySelector('[aria-labelledby="h-cambios"]')?.remove();
    return copia.textContent ?? "";
  });
const plano = async (page: Page) => (await main(page).innerText()).replace(/\s+/g, " ");

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("se lee sin entrar: un h1 y el sello de propuesta en discusión antes de cualquier número", async ({ page }) => {
    const r = await page.goto(RUTA);
    expect(r?.status()).toBe(200);
    await expect(page).toHaveURL(/\/bien-comun$/);
    await expect(page.getByRole("heading", { level: 1, name: "El bien común de Lighthouse VRN" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByText("Prototipo interno · datos de ejemplo").first()).toBeVisible();
    const sello = "Propuesta v0.1 · en discusión con el equipo · números de ejemplo · lo legal, a verificar con abogado";
    await expect(main(page)).toContainText(sello);
    await expect(main(page)).toContainText("19 de noviembre de 2026");
    await expect(main(page)).toContainText("NS_Tokenomics doc 34");
    await expect(main(page)).toContainText("no es una oferta");
    const texto = await plano(page);
    expect(texto.indexOf(sello)).toBeGreaterThanOrEqual(0);
    // Antes del sello no hay ningún dígito.
    expect(texto.slice(0, texto.indexOf(sello))).not.toMatch(/\d/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  });

  test("la frase dice que FARO no levanta capital y que nada está acordado", async ({ page }) => {
    await page.goto(RUTA);
    const s = page.getByRole("region", { name: /En una frase/ });
    await expect(s).toContainText("no levanta capital");
    await expect(s).toContainText("Nada de esto está acordado");
  });

  test("el diagrama tiene dos carriles y una lista de tres puentes, cada uno con de dónde sale y adónde va", async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole("region", { name: /Carril A/ })).toBeVisible();
    await expect(page.getByRole("region", { name: /Carril B/ })).toBeVisible();
    const puentes = page.getByRole("region", { name: "Los tres puentes" }).getByRole("listitem");
    await expect(puentes).toHaveCount(PUENTES.length);
    for (let i = 0; i < PUENTES.length; i++) {
      await expect(puentes.nth(i)).toContainText("De:");
      await expect(puentes.nth(i)).toContainText("A:");
    }
    // La parte de cada pago se lee del módulo de lotes (5 %), nunca escrita en la pantalla.
    await expect(puentes.first()).toContainText(/\d+ %/);
  });

  test("las tres puertas dicen que ninguna es una inversión y no hay botón de compra", async ({ page }) => {
    await page.goto(RUTA);
    const s = page.getByRole("region", { name: "Las tres puertas para tener FARO" });
    await expect(s.getByRole("listitem")).toHaveCount(PUERTAS.length);
    await expect(s).toContainText("Ninguna puerta es una inversión");
    await expect(s).toContainText(faroEn(FARO_POR_M2.valor, "es"));
    await expect(main(page).getByRole("button", { name: /comprar|prepagar|pagar|reservar/i })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Qué no tiene FARO" }).getByRole("listitem")).toHaveCount(5);
    await expect(page.getByRole("region", { name: "Qué no tiene FARO" })).toContainText("respaldo en la tierra");
    await expect(page.getByRole("region", { name: "Qué no tiene FARO" })).toContainText("premio en FARO por bloquear");
    await expect(page.getByRole("region", { name: "Qué da FARO" })).toContainText("adherir al manifiesto");
  });

  test("la política son seis tarjetas, y la transferencia dice los meses del módulo", async ({ page }) => {
    await page.goto(RUTA);
    const tarjetas = page.locator("[data-politica]");
    await expect(tarjetas).toHaveCount(Object.keys(POLITICA).length);
    await expect(tarjetas).toHaveCount(6);
    await expect(page.locator('[data-politica="transferencia"]')).toContainText(
      `a los ${enteroEn(POLITICA.transferencia.revisionMeses, "es")} meses`,
    );
  });

  test("ocho decisiones, cada una con la recomendación de Gus y el estado abierta", async ({ page }) => {
    await page.goto(RUTA);
    const tabla = page.getByRole("table", { name: new RegExp(`${DECISIONES.length} decisiones`) });
    await expect(tabla.getByRole("row")).toHaveCount(DECISIONES.length + 1);
    await expect(tabla.getByText("abierta", { exact: true })).toHaveCount(DECISIONES.length);
    await expect(tabla.getByRole("columnheader", { name: "Recomendación de Gus" })).toBeVisible();
  });

  test("qué cambió son cuatro líneas, y tramo y staking solo aparecen ahí", async ({ page }) => {
    await page.goto(RUTA);
    const cambios = page.getByRole("region", { name: "Qué cambió" });
    await expect(cambios.getByRole("listitem")).toHaveCount(CAMBIOS_DESDE_V_ANTERIOR.ids.length);
    await expect(cambios.getByRole("listitem")).toHaveCount(4);
    await expect(cambios).toContainText("tramos");
    await expect(cambios).toContainText("staking");
    expect(await textoFueraDeCambios(page)).not.toMatch(/tramo|staking|precio de FARO/i);
  });

  test("en inglés, tranche y staking tampoco aparecen fuera de 'What changed'", async ({ page }) => {
    await page.goto(`${RUTA}?lang=en`);
    const cambios = page.getByRole("region", { name: "What changed" });
    await expect(cambios.getByRole("listitem")).toHaveCount(CAMBIOS_DESDE_V_ANTERIOR.ids.length);
    await expect(cambios).toContainText("tranches");
    await expect(cambios).toContainText("Staking");
    expect(await textoFueraDeCambios(page)).not.toMatch(/tranche|staking|price of FARO|FARO price/i);
  });

  test("en inglés, las tarjetas de la política (con su fuente) no tienen español suelto", async ({ page }) => {
    await page.goto(`${RUTA}?lang=en`);
    const tarjetas = page.locator("[data-politica]");
    await expect(tarjetas).toHaveCount(Object.keys(POLITICA).length);
    for (const id of Object.keys(POLITICA) as (keyof typeof POLITICA)[]) {
      const tarjeta = page.locator(`[data-politica="${id}"]`);
      await expect(tarjeta).toContainText(POLITICA[id].fuente.en);
      await expect(tarjeta).not.toContainText(POLITICA[id].fuente.es);
    }
    const texto = (await tarjetas.allInnerTexts()).join(" ");
    expect(texto).not.toMatch(/lámina|opción|Objeción|Regla |quema|suavizado|oferta atada|circulación|precio que defender/i);
  });

  test("las parcelas comunes se leen del plano, no son tokens y no se venden; Ostrom marca cada principio como idea", async ({ page }) => {
    await page.goto(RUTA);
    const s = page.getByRole("region", { name: "Las parcelas comunes" });
    await expect(s).toContainText("no son tokens");
    await expect(s).toContainText("Ninguna parcela común se vende");
    await expect(s).toContainText("Cocinas comunitarias");
    const tabla = page.getByRole("table", { name: /principios de Ostrom/ });
    await expect(tabla.getByRole("row")).toHaveCount(9);
    await expect(tabla.getByText("idea", { exact: true })).toHaveCount(8);
  });

  test("preguntas para el abogado, con su ⚖ en las palabras legales", async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole("region", { name: "Preguntas para el abogado" }).getByRole("listitem")).toHaveCount(6);
    for (const nombre of ["Token Tierra", "Token Inversor", "Fideicomiso del barrio", "Tesoro del común"]) {
      await expect(page.getByRole("button", { name: `Qué significa legalmente: ${nombre}` })).toBeVisible();
    }
    for (const nombre of ["Esto no es una oferta", "Expensas", "Prima objetivo", "Boleto de compraventa", "Valor negociable"]) {
      await expect(main(page).getByRole("button", { name: `Qué significa legalmente: ${nombre}` }).first()).toBeVisible();
    }
  });

  test("el NFT del lote tiene su propia sección, fuera de las parcelas comunes, y nombra la metadata", async ({ page }) => {
    await page.goto(RUTA);
    const parcelas = page.getByRole("region", { name: "Las parcelas comunes" });
    await expect(parcelas).not.toContainText("NFT");
    const nft = page.getByRole("region", { name: /NFT del lote/ });
    await expect(nft).toContainText("metadata");
    await expect(nft).toContainText("No reemplaza la escritura");
    await expect(nft.getByRole("button", { name: "Qué significa legalmente: NFT del lote" })).toBeVisible();
  });

  test("no promete nada ni usa palabras viejas: sin procomún, tribu ni Hadron", async ({ page }) => {
    await page.goto(RUTA);
    const texto = await main(page).innerText();
    expect(texto).not.toMatch(/procom[uú]n|tribu|Hadron/i);
    expect(texto).not.toMatch(/ganancia|valorizaci[oó]n/i);
    await expect(main(page).getByRole("link", { name: "Ver qué es tuyo y qué es de todos" })).toHaveAttribute("href", "/lotes/hibrido");
  });

  test("se recorre entera con Tab, hasta el último enlace", async ({ page }) => {
    await page.goto(RUTA);
    const ultimo = main(page).getByRole("link", { name: "Ver qué es tuyo y qué es de todos" });
    let llegó = false;
    for (let i = 0; i < 150 && !llegó; i++) {
      await page.keyboard.press("Tab");
      llegó = await ultimo.evaluate((el) => el === document.activeElement);
    }
    expect(llegó).toBe(true);
  });

  test("a 390 px no hay scroll horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(RUTA);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });

  test("?lang=en se lee en inglés, con el sello antes de cualquier número y sin scroll horizontal a 390 px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${RUTA}?lang=en`);
    await expect(page.getByRole("heading", { level: 1, name: "The commons of Lighthouse VRN" })).toBeVisible();
    const sello = "Proposal v0.1 · under discussion with the team · sample numbers · legal points to be verified with a lawyer";
    const texto = await plano(page);
    expect(texto).toContain(sello);
    expect(texto.slice(0, texto.indexOf(sello))).not.toMatch(/\d/);
    expect(texto).toContain("November 19, 2026");
    expect(texto).toContain("commons");
    for (const suelto of [/Propuesta/, /bien común/i, /sin dato/i, /A verificar/, /abierta/, /¿|¡/]) {
      expect(texto, String(suelto)).not.toMatch(suelto);
    }
    await expect(page.getByRole("table", { name: new RegExp(`${DECISIONES.length} decisions`) }).getByText("open", { exact: true })).toHaveCount(
      DECISIONES.length,
    );
    expect(texto).not.toMatch(/procom[uú]n|\btribe|\btribu|Hadron/i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
});

test("el rail lleva a Bien común, y desde Lotes y Sumarte hay un enlace", async ({ page }) => {
  await page.goto("/lotes");
  await expect(page.getByRole("link", { name: ENLACE })).toHaveAttribute("href", "/bien-comun");
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Bien común" }).click();
  await expect(page).toHaveURL(/\/bien-comun$/);
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Bien común" })).toHaveAttribute("aria-current", "page");
  await page.goto("/lotes/hibrido");
  await expect(page.getByRole("link", { name: ENLACE })).toHaveAttribute("href", "/bien-comun");
  await page.goto("/sumarte");
  await expect(page.getByRole("link", { name: ENLACE })).toHaveAttribute("href", "/bien-comun");
});
