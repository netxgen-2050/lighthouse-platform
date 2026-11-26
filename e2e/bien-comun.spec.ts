import { expect, test, type Page } from "./fixtura";
import { esperarHidratacion } from "./ayudas";
import {
  ENTRADAS_DE_PARTIDA,
  alComunPorAnio,
  cobrandoConLasCuotas,
  coberturaAFechaFija,
  montoALevantar,
  parteDelPresupuestoQueCubren,
} from "../lib/bien-comun/barrio";
import { enteroEn, faroEn } from "../lib/bien-comun/formato";
import { porcentajeEn } from "../lib/lotes/formato";
import { CAMBIOS_DESDE_V_ANTERIOR, DECISIONES, FARO_POR_M2, POLITICA, PUENTES, PUERTAS } from "../lib/bien-comun/modelo";

// La propuesta v0.1 del bien común (bien-comun-propuesta): propuesta en discusión. Los valores que se esperan salen del
// módulo, nunca escritos a mano.
const RUTA = "/bien-comun";
const ENLACE = "El bien común y los tokens: ver la propuesta en discusión";

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
// Las secciones largas vienen plegadas (ux-bien-comun): para leer su contenido se despliegan todas.
// Se espera la hidratación: si React vuelve a dibujar después, no pisa lo desplegado.
const desplegarTodo = async (page: Page) => {
  await esperarHidratacion(page);
  await page.evaluate(() => document.querySelectorAll("details").forEach((d) => (d.open = true)));
};
const irYDesplegar = async (page: Page, ruta: string) => {
  await page.goto(ruta);
  await desplegarTodo(page);
};

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
    await irYDesplegar(page, RUTA);
    const tarjetas = page.locator("[data-politica]");
    await expect(tarjetas).toHaveCount(Object.keys(POLITICA).length);
    await expect(tarjetas).toHaveCount(6);
    await expect(page.locator('[data-politica="transferencia"]')).toContainText(
      `a los ${enteroEn(POLITICA.transferencia.revisionMeses, "es")} meses`,
    );
  });

  test("ocho decisiones, cada una con la recomendación de Gus y el estado abierta", async ({ page }) => {
    await irYDesplegar(page, RUTA);
    const tabla = page.getByRole("table", { name: new RegExp(`${DECISIONES.length} decisiones`) });
    await expect(tabla.getByRole("row")).toHaveCount(DECISIONES.length + 1);
    await expect(tabla.locator('[data-estado="abierta"]')).toHaveCount(DECISIONES.length);
    await expect(tabla.getByText("Abierta", { exact: true })).toHaveCount(DECISIONES.length);
    await expect(tabla.getByRole("columnheader", { name: "Recomendación de Gus" })).toBeVisible();
  });

  test("qué cambió son cuatro líneas, y tramo y staking solo aparecen ahí", async ({ page }) => {
    await irYDesplegar(page, RUTA);
    const cambios = page.getByRole("region", { name: "Qué cambió" });
    await expect(cambios.getByRole("listitem")).toHaveCount(CAMBIOS_DESDE_V_ANTERIOR.ids.length);
    await expect(cambios.getByRole("listitem")).toHaveCount(4);
    await expect(cambios).toContainText("tramos");
    await expect(cambios).toContainText("staking");
    expect(await textoFueraDeCambios(page)).not.toMatch(/tramo|staking|precio de FARO/i);
  });

  test("en inglés, tranche y staking tampoco aparecen fuera de 'What changed'", async ({ page }) => {
    await irYDesplegar(page, `${RUTA}?lang=en`);
    const cambios = page.getByRole("region", { name: "What changed" });
    await expect(cambios.getByRole("listitem")).toHaveCount(CAMBIOS_DESDE_V_ANTERIOR.ids.length);
    await expect(cambios).toContainText("tranches");
    await expect(cambios).toContainText("Staking");
    expect(await textoFueraDeCambios(page)).not.toMatch(/tranche|staking|price of FARO|FARO price/i);
  });

  test("en inglés, las tarjetas de la política (con su fuente) no tienen español suelto", async ({ page }) => {
    await irYDesplegar(page, `${RUTA}?lang=en`);
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

  test("las parcelas comunes se leen del plano, no son tokens y no se venden; Ostrom marca cada principio en discusión", async ({ page }) => {
    await irYDesplegar(page, RUTA);
    const s = page.getByRole("region", { name: "Las parcelas comunes" });
    await expect(s).toContainText("no son tokens");
    await expect(s).toContainText("Ninguna parcela común se vende");
    await expect(s).toContainText("Cocinas comunitarias");
    const tabla = page.getByRole("table", { name: /principios de Ostrom/ });
    await expect(tabla.getByRole("row")).toHaveCount(9);
    await expect(tabla.locator('[data-estado="enDiscusion"]')).toHaveCount(8);
  });

  test("preguntas para el abogado, con su ⚖ en las palabras legales", async ({ page }) => {
    await irYDesplegar(page, RUTA);
    await expect(page.getByRole("region", { name: "Preguntas para el abogado" }).getByRole("listitem")).toHaveCount(6);
    for (const nombre of ["Token Tierra", "Token Inversor", "Fideicomiso del barrio", "Tesoro del común"]) {
      await expect(page.getByRole("button", { name: `Qué significa legalmente: ${nombre}` })).toBeVisible();
    }
    for (const nombre of ["Esto no es una oferta", "Expensas", "Prima objetivo", "Boleto de compraventa", "Valor negociable"]) {
      await expect(main(page).getByRole("button", { name: `Qué significa legalmente: ${nombre}` }).first()).toBeVisible();
    }
  });

  test("el NFT del lote tiene su propia sección, fuera de las parcelas comunes, y nombra la metadata", async ({ page }) => {
    await irYDesplegar(page, RUTA);
    const parcelas = page.getByRole("region", { name: "Las parcelas comunes" });
    await expect(parcelas).not.toContainText("NFT");
    const nft = page.getByRole("region", { name: /NFT del lote/ });
    await expect(nft).toContainText("metadata");
    await expect(nft).toContainText("No reemplaza la escritura");
    await expect(nft.getByRole("button", { name: "Qué significa legalmente: NFT del lote" })).toBeVisible();
  });

  test("no promete nada ni usa palabras viejas: sin procomún, tribu ni Hadron", async ({ page }) => {
    await irYDesplegar(page, RUTA);
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

  test("a 390 px no hay scroll horizontal, ni con todas las secciones desplegadas", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(RUTA);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await desplegarTodo(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });

  test("primera vista: lo central abierto y lo largo plegado con su resumen", async ({ page }) => {
    await page.goto(RUTA);
    for (const id of ["h-frase", "h-carriles", "h-puertas"]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator(`#${id}`).locator("xpath=ancestor::details")).toHaveCount(0);
    }
    for (const id of ["h-politica", "h-decisiones", "h-cambios", "h-ostrom", "h-parcelas", "h-nft", "h-abogado"]) {
      const d = page.locator("details", { has: page.locator(`#${id}`) });
      await expect(d).toHaveCount(1);
      expect(await d.evaluate((el) => (el as HTMLDetailsElement).open)).toBe(false);
      await expect(d.locator("summary")).toContainText(/\S+\s+\S+/);
    }
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("compu: el índice sigue visible al hacer scroll y marca la sección que se lee", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(RUTA);
    const indice = page.getByRole("navigation", { name: "En esta página" });
    await expect(indice).toBeVisible();
    await page.locator("#h-puertas").scrollIntoViewIfNeeded();
    await page.evaluate(() => document.getElementById("h-puertas")?.scrollIntoView());
    await expect(indice).toBeVisible();
    await expect(indice.getByRole("link", { name: "Las tres puertas para tener FARO" })).toHaveAttribute("aria-current", "location");
    await expect(indice.locator('[aria-current="location"]')).toHaveCount(1);
  });

  test("compu: elegir una sección plegada en el índice la despliega", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(RUTA);
    await esperarHidratacion(page);
    await page.getByRole("navigation", { name: "En esta página" }).getByRole("link", { name: "Preguntas para el abogado" }).click();
    const d = page.locator("details", { has: page.locator("#h-abogado") });
    await expect.poll(() => d.evaluate((el) => (el as HTMLDetailsElement).open)).toBe(true);
    await expect(page.locator("#h-abogado")).toBeInViewport();
  });

  test("celular: En esta página abre la hoja y un enlace lleva a su sección desplegada", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(RUTA);
    await esperarHidratacion(page);
    await expect(page.getByRole("navigation", { name: "En esta página" })).toHaveCount(0);
    await page.getByRole("button", { name: "En esta página" }).click();
    const hoja = page.getByRole("dialog");
    await expect(hoja).toBeVisible();
    await hoja.getByRole("link", { name: "Preguntas para el abogado" }).click();
    await expect(hoja).toHaveCount(0);
    const d = page.locator("details", { has: page.locator("#h-abogado") });
    await expect.poll(() => d.evaluate((el) => (el as HTMLDetailsElement).open)).toBe(true);
    await expect(page.locator("#h-abogado")).toBeInViewport();
  });

  test("una sola capa de cajas: ninguna caja con borde contiene a otra", async ({ page }) => {
    await irYDesplegar(page, RUTA);
    const anidadas = await page.evaluate(() => {
      const conBorde = (el: Element) => {
        const s = getComputedStyle(el);
        return parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== "none" && parseFloat(s.borderRadius) > 0;
      };
      return Array.from(document.querySelectorAll("main *"))
        .filter((el) => conBorde(el) && !(el instanceof HTMLButtonElement) && !(el instanceof HTMLInputElement) && el.getClientRects().length > 0)
        .filter((el) => {
          let p = el.parentElement;
          while (p && p.tagName !== "MAIN") {
            if (conBorde(p) && !(p instanceof HTMLButtonElement) && !(p instanceof HTMLInputElement)) return true;
            p = p.parentElement;
          }
          return false;
        })
        .map((el) => el.outerHTML.slice(0, 80));
    });
    expect(anidadas).toEqual([]);
  });

  test("el texto corrido mide al menos 16 px", async ({ page }) => {
    await irYDesplegar(page, RUTA);
    const chicos = await page.evaluate(() =>
      Array.from(document.querySelectorAll("main p, main li, main td, main th"))
        // Fuera: el aviso de estado y el índice (componentes de la interfaz de ux-base) y la calculadora del barrio (sin cambios).
        .filter((el) => el.getClientRects().length > 0 && !el.closest('[role="note"], nav, [data-resultados], form, [aria-labelledby="h-barrio"]'))
        .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
        .map((el) => (el.textContent ?? "").slice(0, 50)),
    );
    expect(chicos).toEqual([]);
  });

  test("?lang=en se lee en inglés, con el sello antes de cualquier número y sin scroll horizontal a 390 px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${RUTA}?lang=en`);
    await expect(page.getByRole("heading", { level: 1, name: "The commons of Lighthouse VRN" })).toBeVisible();
    await desplegarTodo(page);
    const sello = "Proposal v0.1 · under discussion with the team · sample numbers · legal points to be verified with a lawyer";
    const texto = await plano(page);
    expect(texto).toContain(sello);
    expect(texto.slice(0, texto.indexOf(sello))).not.toMatch(/\d/);
    expect(texto).toContain("November 19, 2026");
    expect(texto).toContain("commons");
    for (const suelto of [/Propuesta/, /bien común/i, /sin dato/i, /A verificar/, /abierta/, /¿|¡/]) {
      expect(texto, String(suelto)).not.toMatch(suelto);
    }
    // A 390 px las decisiones son una lista de filas de dos líneas, no una tabla.
    await desplegarTodo(page);
    await expect(page.getByRole("list", { name: new RegExp(`${DECISIONES.length} decisions`) }).getByText("Open", { exact: true })).toHaveCount(
      DECISIONES.length,
    );
    expect(texto).not.toMatch(/procom[uú]n|\btribe|\btribu|Hadron/i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });
});

// Los números del barrio (bien-comun-numeros-barrio): solo con sesión. Los valores esperados salen del cálculo, no se escriben.
const usdEs = (n: number) => `USD ${enteroEn(n, "es")}`;
const usdEnIngles = (n: number) => `USD ${enteroEn(n, "en")}`;
const okDe = <T extends { ok: boolean }>(r: T) => {
  if (!r.ok) throw new Error("se esperaba ok");
  return r as Extract<T, { ok: true }>;
};
const CASO_BASE = ENTRADAS_DE_PARTIDA;

test.describe("números del barrio sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("no hay calculadora ni números del barrio, solo un aviso para entrar", async ({ page }) => {
    await page.goto(RUTA);
    const s = page.getByRole("region", { name: "Los números del barrio" });
    await expect(s).toContainText("solo para personas con sesión");
    await expect(s.getByRole("link", { name: "Entrá para ver los números del barrio" })).toBeVisible();
    await expect(page.getByLabel("Precio del lote (USD)")).toHaveCount(0);
    const monto = okDe(montoALevantar(CASO_BASE)).valor;
    expect(await plano(page)).not.toContain(enteroEn(monto, "es"));
    expect(await plano(page)).not.toContain("barrio_stack_sim");
  });
});

test.describe("números del barrio con sesión", () => {
  const seccion = (page: Page) => page.getByRole("region", { name: "Los números del barrio" });
  const resultados = (page: Page) => seccion(page).locator("[data-resultados]");

  test("valores de partida, fuente y aviso de ejemplo", async ({ page }) => {
    await page.goto(RUTA);
    const s = seccion(page);
    await expect(s.getByLabel("Precio del lote (USD)")).toHaveValue(String(CASO_BASE.precioLote));
    await expect(s.getByLabel("Lotes vendidos por trimestre")).toHaveValue(String(CASO_BASE.ritmo));
    await expect(s.getByLabel(/Cantidad de cuotas/)).toHaveValue(String(CASO_BASE.cuotas));
    await expect(s.getByLabel("Infraestructura por lote (USD)")).toHaveValue(String(CASO_BASE.infraestructuraPorLote));
    await expect(s.getByLabel("Prima anual del inversor (%)")).toHaveValue(String(CASO_BASE.prima * 100));
    await expect(s).toContainText("barrio_stack_sim.py v0.1");
    await expect(s).toContainText("números de ejemplo");
    await expect(s).toContainText("sin dato");
    await expect(s).toContainText(`de partida: ${enteroEn(CASO_BASE.precioLote, "es")}`);
  });

  test("caso base: monto, mes 48, total y cobertura a 12 meses", async ({ page }) => {
    await page.goto(RUTA);
    const r = resultados(page);
    const cobrando = okDe(cobrandoConLasCuotas(CASO_BASE));
    await expect(r).toContainText(usdEs(okDe(montoALevantar(CASO_BASE)).valor));
    await expect(r).toContainText(`mes ${cobrando.mes}`);
    await expect(r).toContainText(usdEs(cobrando.totalRecibido));
    await expect(r).toContainText(porcentajeEn(okDe(coberturaAFechaFija(CASO_BASE, 12)).valor, "es"));
  });

  test("precio 40000 pasa al mes que calcula el módulo y lo anuncia en la región en vivo", async ({ page }) => {
    await page.goto(RUTA);
    await seccion(page).getByLabel("Precio del lote (USD)").fill("40000");
    const esperado = okDe(cobrandoConLasCuotas({ ...CASO_BASE, precioLote: 40_000 })).mes;
    await expect(resultados(page)).toContainText(`mes ${esperado}`);
    // La región en vivo es corta (monto, mes y total); la tabla queda fuera.
    const enVivo = resultados(page).locator('[aria-live="polite"]');
    await expect(enVivo).toContainText(`mes ${esperado}`);
    await expect(enVivo.locator("table")).toHaveCount(0);
  });

  test("1 lote por trimestre: no en 6 años y ningún mes", async ({ page }) => {
    await page.goto(RUTA);
    await seccion(page).getByLabel("Lotes vendidos por trimestre").fill("1");
    await expect(resultados(page)).toContainText("no en 6 años");
    await expect(resultados(page)).not.toContainText(/mes \d/);
  });

  test("campo vacío: dice qué revisar y los resultados dicen sin dato, nunca 0", async ({ page }) => {
    await page.goto(RUTA);
    const s = seccion(page);
    await s.getByLabel("Precio del lote (USD)").fill("");
    await expect(s).toContainText("Revisá el precio del lote");
    await expect(s.getByLabel("Precio del lote (USD)")).toHaveAttribute("aria-invalid", "true");
    const r = resultados(page);
    await expect(r.locator('[data-dato="monto"]')).toContainText("sin dato");
    await expect(r.locator('[data-dato="mes"]')).toContainText("sin dato");
    await expect(r.locator('[data-dato="total"]')).toContainText("sin dato");
    await expect(r.getByRole("table")).toHaveCount(0);
    await expect(r.locator('[data-dato="fija"]')).toContainText("sin dato");
    await expect(r.locator('[data-dato="fideicomiso"]')).toContainText("sin dato");
  });

  test("recargar vuelve a los valores de partida; el botón también", async ({ page }) => {
    await page.goto(RUTA);
    const campo = seccion(page).getByLabel("Precio del lote (USD)");
    await campo.fill("40000");
    await page.reload();
    await expect(seccion(page).getByLabel("Precio del lote (USD)")).toHaveValue(String(CASO_BASE.precioLote));
    await seccion(page).getByLabel("Cantidad de cuotas (0 es pago al contado)").fill("0");
    await seccion(page).getByRole("button", { name: "Volver a los valores de partida" }).click();
    await expect(seccion(page).getByLabel(/Cantidad de cuotas/)).toHaveValue(String(CASO_BASE.cuotas));
  });

  test("la tabla del común tiene seis años y el total de cada uno", async ({ page }) => {
    await page.goto(RUTA);
    const tabla = seccion(page).getByRole("table", { name: /llega al común/ });
    const filas = okDe(alComunPorAnio(CASO_BASE)).filas;
    await expect(tabla.getByRole("row")).toHaveCount(filas.length + 1);
    expect(filas).toHaveLength(6);
    for (const f of filas) await expect(tabla).toContainText(usdEs(f.total));
    await expect(seccion(page)).toContainText(porcentajeEn(parteDelPresupuestoQueCubren(), "es"));
    await expect(seccion(page)).not.toContainText("FARO");
  });

  test("en inglés se usa con teclado, sin español suelto", async ({ page }) => {
    await page.goto(`${RUTA}?lang=en`);
    const s = page.getByRole("region", { name: "The neighborhood numbers" });
    const campo = s.getByLabel("Lot price (USD)");
    await campo.focus();
    await expect(campo).toBeFocused();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.type("40000");
    await page.keyboard.press("Tab");
    await expect(s.getByLabel("Lots sold per quarter")).toBeFocused();
    const esperado = okDe(cobrandoConLasCuotas({ ...CASO_BASE, precioLote: 40_000 })).mes;
    await expect(s).toContainText(`month ${esperado}`);
    await expect(s).toContainText(usdEnIngles(okDe(montoALevantar(CASO_BASE)).valor));
    const texto = await s.innerText();
    for (const suelto of [/sin dato/i, /Revisá/, /de partida/, /\bmes\b/, /Volver/, /Prima anual/]) {
      expect(texto, String(suelto)).not.toMatch(suelto);
    }
    await expect(s).toContainText("no data");
  });

  test("a 390 px no hay scroll horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(RUTA);
    await expect(seccion(page).getByLabel("Precio del lote (USD)")).toBeVisible();
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
