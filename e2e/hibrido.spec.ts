import { expect, test, type Page } from "./fixtura";
import { formatearNumero } from "../lib/idioma/formatos";
import { ESCENARIOS_COSTO, cobertura, coberturaDeEscenario, lotesDelSector } from "../lib/lotes/escenarios";
import { porcentajeEn, usdEn } from "../lib/lotes/formato";
import { lineasDelResumen } from "../lib/lotes/hibrido";
import { MODELO_LOTES, aporteDe, paquetePromedio, precioPaquete } from "../lib/lotes/modelo";
import { estadoDeLote } from "../lib/territorios/loteo-estados";
import { lotesDelGrupo } from "../lib/territorios/loteo";

// Qué es tuyo y qué es de todos (modelo-hibrido-procomun). Los valores que se esperan salen de los módulos del modelo,
// nunca escritos a mano: si el loteo o el modelo cambian, estos tests no se rompen.
const RUTA = "/lotes/hibrido";
const LEI = "Leí lo que comparto y lo que me comprometo a pagar";
const lote = lotesDelGrupo("norte").find((l) => estadoDeLote(l.id) === "disponible")!;

test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

const main = (page: Page) => page.locator("main");
const seccion = (page: Page, nombre: string | RegExp) => page.getByRole("region", { name: nombre });
/** La fila de un rubro de la tabla, por el nombre exacto de su celda de encabezado ("Agua" no es "Aguas grises y negras"). */
const filaDe = (page: Page, rubro: string) =>
  page
    .getByRole("table", { name: /Qué es privado y qué es común/ })
    .getByRole("row")
    .filter({ has: page.getByRole("rowheader", { name: rubro, exact: true }) });

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("se lee sin entrar: título, un solo h1 y el aviso de prototipo", async ({ page }) => {
    const r = await page.goto(RUTA);
    expect(r?.status()).toBe(200);
    await expect(page).toHaveURL(/\/lotes\/hibrido$/);
    await expect(page.getByRole("heading", { level: 1, name: "Qué es tuyo y qué es de todos" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByText("Prototipo interno · datos de ejemplo").first()).toBeVisible();
    await expect(page.getByRole("note", { name: "Estado administrativo" })).toContainText("Aprobación municipal");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  });

  test("cada rubro dice Privado o Común en texto, con quién lo paga y cuánto cuesta", async ({ page }) => {
    await page.goto(RUTA);
    const tabla = page.getByRole("table", { name: /Qué es privado y qué es común/ });
    await expect(tabla.getByRole("row")).toHaveCount(10);
    for (const privado of ["Tu lote", "Tu casa, si la construís"]) {
      const fila = filaDe(page, privado);
      await expect(fila).toContainText("Privado");
      await expect(fila).toContainText("Quien compra");
      await expect(fila).toContainText("USD");
    }
    for (const comun of ["Caminos", "Agua", "Aguas grises y negras", "Basura", "Escuela", "Restauración", "Producción"]) {
      const fila = filaDe(page, comun);
      await expect(fila, comun).toContainText("Común");
      await expect(fila, comun).toContainText("Presupuesto común");
      await expect(fila, comun).toContainText("sin dato");
    }
    await expect(page.getByText(/El costo de cada rubro común todavía no está calculado: sin dato/)).toBeVisible();
  });

  test("quién cuida lo común: consorcio y Fundación que todavía no existe, con su ⚖ en borrador", async ({ page }) => {
    await page.goto(RUTA);
    for (const r of ["Caminos", "Agua", "Aguas grises y negras", "Basura"]) {
      await expect(filaDe(page, r)).toContainText("Consorcio de propietarios");
    }
    for (const r of ["Escuela", "Restauración", "Producción"]) {
      await expect(filaDe(page, r)).toContainText("Fundación (todavía no existe)");
    }
    await expect(main(page)).toContainText("Es una propuesta para el equipo, a verificar con abogado");
    const boton = page.getByRole("button", { name: /Qué significa legalmente: Consorcio y Fundación/ });
    await boton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("tooltip")).toContainText("Ninguna de las dos existe todavía");
    await page.keyboard.press("Escape");
  });

  test("cuánto aporta cada lote: el aporte único, las expensas y el 'sin dato' del aporte incluido", async ({ page }) => {
    await page.goto(RUTA);
    const s = seccion(page, "Cuánto aporta cada lote");
    await expect(s).toContainText(`el ${porcentajeEn(MODELO_LOTES.aporteUnico, "es")} de lo que se paga`);
    await expect(s).toContainText(usdEn(aporteDe(paquetePromedio()), "es"));
    await expect(s).toContainText(`${usdEn(MODELO_LOTES.expensaAnual, "es")} por lote por año`);
    await expect(s).toContainText("Si el aporte se suma al precio o va incluido: sin dato");
    await expect(s).toContainText("Los primeros 4 lotes no se suman");
  });

  test("tres escenarios con fuente, la marca de ejemplo, lo que cubre la venta y ninguna cifra de faltante", async ({ page }) => {
    await page.goto(RUTA);
    const s = seccion(page, "Por qué la venta sola no alcanza");
    await expect(s).toContainText("falta el dato de Vagner");
    await expect(s).toContainText("el 100 % de la tierra");
    await expect(s).toContainText("más de USD");
    await expect(s).toContainText("(Gus, 8-nov, estimación)");
    await expect(s.getByText("Seguros y tasas: sin dato · a confirmar con Vagner")).toBeVisible();
    for (const [nombre, fuente] of [
      ["Arranque", "masterplan de permacultura del primer año"],
      ["Simulación de octubre", "NS_Tokenomics sim/RESULTS.md"],
      ["Alternativa alta", "NS_Tokenomics sim/lot_sale_sim.py"],
    ]) {
      const tarjeta = s.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 4, name: nombre }) });
      await expect(tarjeta, nombre).toContainText("de ejemplo, no es un presupuesto");
      await expect(tarjeta, nombre).toContainText(fuente);
    }
    // Lo que cubre la venta sale del módulo, para cada escenario.
    for (const e of ESCENARIOS_COSTO) {
      const c = coberturaDeEscenario(e.id)!;
      const tarjeta = s.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 4, name: e.nombre.es }) });
      await expect(tarjeta).toContainText(`${usdEn(e.costoAnual, "es")} por año`);
      await expect(tarjeta).toContainText(
        `suman ${usdEn(c.duranteLaVenta, "es")} por año: cubren el ${porcentajeEn(c.fraccionDuranteLaVenta, "es")} de este costo`,
      );
      await expect(tarjeta).toContainText(
        `${usdEn(c.despues, "es")} por año, el ${porcentajeEn(c.fraccionDespues, "es")} de este costo`,
      );
    }
    await expect(s.getByText(/El resto saldría de: token del bien común, ingresos del bien común/).first()).toBeVisible();
    const texto = await main(page).innerText();
    expect(texto).not.toMatch(/USD 42\.000|USD 46\.800/);
  });

  test("lo que hay que preguntarle a Vagner", async ({ page }) => {
    await page.goto(RUTA);
    const s = seccion(page, "Por qué la venta sola no alcanza");
    await expect(s.getByRole("heading", { level: 3, name: "Lo que hay que preguntarle a Vagner" })).toBeVisible();
    await expect(s).toContainText("CAPEX");
    await expect(s).toContainText("OPEX");
    await expect(s).toContainText("Desde qué año");
  });

  test("calculadora con el teclado: elegir escenario, cambiar costo, expensa y lotes, y la región anuncia el resultado", async ({ page }) => {
    await page.goto(RUTA);
    const s = seccion(page, "Por qué la venta sola no alcanza");
    const resultado = s.getByRole("status");
    await expect(resultado).toHaveAttribute("aria-live", "polite");
    const [arranque, simulacion] = ESCENARIOS_COSTO;
    const lotes = lotesDelSector();

    // Punto de partida: el escenario "Arranque", con la expensa y los lotes del módulo.
    const inicial = cobertura({ costoAnual: arranque.costoAnual, expensa: MODELO_LOTES.expensaAnual, lotes })!;
    await expect(resultado).toContainText(
      `Durante la venta entran ${usdEn(inicial.duranteLaVenta, "es")} por año: el ${porcentajeEn(inicial.fraccionDuranteLaVenta, "es")} del costo`,
    );

    // Con el teclado: la flecha lleva al escenario siguiente y su costo pasa al campo.
    await s.getByRole("radio", { name: /Arranque/ }).focus();
    await page.keyboard.press("ArrowDown");
    await expect(s.getByRole("radio", { name: /Simulación de octubre/ })).toBeChecked();
    await expect(s.getByLabel("Costo anual del bien común (USD por año)")).toHaveValue(String(simulacion.costoAnual));
    const c2 = cobertura({ costoAnual: simulacion.costoAnual, expensa: MODELO_LOTES.expensaAnual, lotes })!;
    await expect(resultado).toContainText(`el ${porcentajeEn(c2.fraccionDuranteLaVenta, "es")} del costo`);

    // Cambiar los tres valores recalcula.
    await s.getByLabel("Costo anual del bien común (USD por año)").fill("100000");
    // Al editar el costo a mano, ningún escenario queda marcado con su monto viejo.
    await expect(s.getByRole("radio", { checked: true })).toHaveCount(0);
    await s.getByLabel("Expensa por lote (USD por año)").fill("500");
    await s.getByLabel("Cantidad de lotes").fill("10");
    const c3 = cobertura({ costoAnual: 100000, expensa: 500, lotes: 10 })!;
    await expect(resultado).toContainText(`Durante la venta entran ${usdEn(c3.duranteLaVenta, "es")} por año`);
    await expect(resultado).toContainText(
      `Después de la venta entran ${usdEn(c3.despues, "es")} por año: el ${porcentajeEn(c3.fraccionDespues, "es")} del costo`,
    );
    await expect(resultado).toContainText("El resto saldría de");

    // Un valor que no sirve da "sin dato", nunca cero.
    await s.getByLabel("Cantidad de lotes").fill("0");
    await expect(resultado).toContainText("Con estos valores no hay dato");
    await expect(resultado).not.toContainText("0 %");
  });

  test("la calculadora no guarda nada", async ({ page }) => {
    await page.goto(RUTA);
    const pedidos: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET") pedidos.push(`${r.method()} ${r.url()}`);
    });
    const s = seccion(page, "Por qué la venta sola no alcanza");
    await s.getByLabel("Cantidad de lotes").fill("7");
    await expect(s.getByRole("status")).toContainText("Durante la venta entran");
    expect(pedidos).toEqual([]);
    expect(await page.evaluate(() => Object.keys(window.localStorage).filter((k) => /hibrido|calculadora|lotes/i.test(k)))).toEqual([]);
    await page.reload();
    await expect(s.getByLabel("Cantidad de lotes")).toHaveValue(String(lotesDelSector()));
  });

  test("resguardos: cada uno dice Todavía no está hecho, con su ⚖; el del río dice que no está verificado", async ({ page }) => {
    await page.goto(RUTA);
    const s = seccion(page, "Resguardos que pide el modelo");
    for (const nombre of ["Servidumbres", "Mismo reglamento y aporte", "Preferencia de reventa", "Franja del río"]) {
      const item = s.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 3, name: nombre }) });
      await expect(item, nombre).toContainText("Todavía no está hecho");
      await expect(item.getByRole("button", { name: /Qué significa legalmente: Resguardos del modelo híbrido/ })).toBeVisible();
    }
    const rio = s.getByRole("listitem").filter({ hasText: "Franja del río" });
    await expect(rio).toContainText("Ninguna venta sobre la franja del río");
    await expect(rio).toContainText("no considera la costa ni la línea de inundación");
    await expect(rio).toContainText("todavía no está verificado (sin dato)");
  });

  test("dice bien común y nunca procomún", async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const texto = await main(page).innerText();
    expect(texto).toContain("bien común");
    expect(texto.toLowerCase()).not.toContain("procomún");
  });

  test("a 390 px no hay scroll horizontal en la página", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(RUTA);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });

  test("/lotes y la ficha de un lote enlazan a la página", async ({ page }) => {
    await page.goto("/lotes");
    await page.getByRole("link", { name: "Ver qué es tuyo y qué es de todos" }).click();
    await expect(page).toHaveURL(/\/lotes\/hibrido$/);
    await page.goto(`/lotes/${lote.id}`);
    await page.getByRole("link", { name: "Ver qué es tuyo y qué es de todos" }).click();
    await expect(page).toHaveURL(/\/lotes\/hibrido$/);
    await expect(page.getByRole("heading", { level: 1, name: "Qué es tuyo y qué es de todos" })).toBeVisible();
  });

  test("el rail marca Lotes", async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole("link", { name: "Lotes", exact: true })).toHaveAttribute("aria-current", "page");
  });
});

test.describe("en inglés", () => {
  test.use({ rol: "ninguno" });

  test("?lang=en se lee en inglés, sin español suelto, y no hay scroll horizontal a 390 px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${RUTA}?lang=en`);
    await expect(page.getByRole("heading", { level: 1, name: "What is yours and what belongs to everyone" })).toBeVisible();
    const texto = await main(page).innerText();
    expect(texto).toContain("commons");
    expect(texto).toContain("Private");
    expect(texto).toContain("Not done yet");
    expect(texto).toContain("no data");
    expect(texto).toContain("sample, not a budget");
    for (const suelto of [
      /\bsin dato\b/i,
      /Todavía/,
      /Privado/,
      /\bComún\b/,
      /procomún|bien común/i,
      /Presupuesto/,
      /Resguardos/,
      /\bFranja\b/,
      /Arranque/,
      /Simulación/,
      /Consorcio/,
      /¿|¡/,
    ]) {
      expect(texto, String(suelto)).not.toMatch(suelto);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
  });

  test("la calculadora y los cuatro resguardos se leen en inglés", async ({ page }) => {
    await page.goto(`${RUTA}?lang=en`);
    const s = page.getByRole("region", { name: "Why selling alone is not enough" });
    await expect(s.getByLabel("Number of lots")).toBeVisible();
    await s.getByLabel("Number of lots").fill("0");
    await expect(s.getByRole("status")).toContainText("there is no data");
    const r = page.getByRole("region", { name: "Safeguards the model asks for" });
    await expect(r.getByText(/Status: Not done yet/)).toHaveCount(4);
    await expect(r).toContainText("does not consider the shore or the flood line");
  });
});

test.describe("resumen en la ficha y aceptación al reservar", () => {
  test("la ficha muestra 'Lo que compartís y lo que pagás' en tres líneas, leídas del módulo", async ({ page }) => {
    await page.goto(`/lotes/${lote.id}`);
    const s = seccion(page, "Lo que compartís y lo que pagás");
    const lineas = lineasDelResumen("es", {
      aporte: usdEn(null, "es"),
      expensa: usdEn(MODELO_LOTES.expensaAnual, "es"),
    });
    await expect(s.getByRole("listitem")).toHaveCount(3);
    await expect(s).toContainText(lineas[0]);
    await expect(s).toContainText(lineas[2]);
    await expect(s).toContainText(`las expensas (${usdEn(MODELO_LOTES.expensaAnual, "es")} por año)`);
    // La línea 2 muestra el aporte del módulo para la opción elegida (por defecto, solo el lote).
    const aporte = usdEn(aporteDe(precioPaquete(lote.superficieM2, "solo-lote")!), "es");
    await expect(s).toContainText(`aporte único al bien común (${aporte})`);
    await page.getByRole("radio", { name: /Casa familiar/ }).check();
    const conCasa = usdEn(aporteDe(precioPaquete(lote.superficieM2, "familiar")!), "es");
    await expect(s).toContainText(`aporte único al bien común (${conCasa})`);
    await expect(s.getByRole("link", { name: "Ver qué es tuyo y qué es de todos" })).toHaveAttribute("href", "/lotes/hibrido");
  });

  test("sin marcar la casilla, Reservar queda deshabilitado y dice por qué; marcándola con el teclado, el boleto muestra la versión", async ({
    page,
  }) => {
    await page.goto(`/lotes/${lote.id}`);
    const reservar = page.getByRole("button", { name: "Reservar (simulado)" });
    await expect(reservar).toBeDisabled();
    await expect(page.getByText("Para reservar, marcá que leíste lo que compartís y lo que pagás.")).toBeVisible();
    await page.getByLabel(LEI).focus();
    await page.keyboard.press("Space");
    await expect(reservar).toBeEnabled();
    await reservar.focus();
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: "Simular el pago" }).click();
    await page.getByRole("button", { name: "Confirmar el pago simulado" }).click();
    const boleto = page.getByRole("region", { name: /Boleto de ejemplo/ });
    await expect(boleto).toContainText("Texto de lo que se comparte y se paga que aceptaste: hibrido-v");
  });

  test("el número de lotes del sector sale del loteo", () => {
    expect(formatearNumero(lotesDelSector(), "es")).toBe(formatearNumero(lotesDelGrupo("norte").length, "es"));
  });
});
