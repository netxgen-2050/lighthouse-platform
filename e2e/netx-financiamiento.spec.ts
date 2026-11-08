import { leccionAporte, leccionExpensas } from "../lib/lotes/modelo";
import { lotesDelGrupo } from "../lib/territorios/loteo";
import { expect, test, type Page } from "./fixtura";

const RUTA = "/netx/financiamiento";
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
const H2 = [
  "La plata entra por etapas",
  "Quién es quién con la plata",
  "Cómo paga una serie",
  "Dinero temprano",
  "Recorridos de inversores",
  "¿Y si sale mal?",
  "El modelo híbrido",
  "Supuestos a confirmar",
];

const main = (page: Page) => page.locator("main");
async function textoMain(page: Page) {
  await expect(page.getByRole("heading", { level: 1, name: "Modelo de financiamiento" })).toBeVisible();
  return main(page).innerText();
}
const seccion = (page: Page, nombre: string) => page.getByRole("region", { name: nombre, exact: true });

test.describe("estructura", () => {
  test("un solo h1, un solo main, pestaña actual y aviso antes del primer USD", async ({ page }) => {
    const r = await page.goto(RUTA);
    expect(r?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Modelo de financiamiento" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    const nav = page.getByRole("navigation", { name: "Secciones de la Vista NetX" });
    await expect(nav.getByRole("link")).toHaveText(["Resumen", "Modelo de financiamiento", "Simulador", "Comunidad y embudo"]);
    await expect(nav.getByRole("link", { name: "Modelo de financiamiento" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
    const texto = await textoMain(page);
    const aviso = texto.indexOf("valores de partida, no son una oferta ni un pronóstico");
    expect(aviso).toBeGreaterThan(-1);
    expect(aviso).toBeLessThan(texto.indexOf("USD"));
  });

  test("ocho h2 en orden y el índice lleva a cada uno", async ({ page }) => {
    await page.goto(RUTA);
    await expect(main(page).getByRole("heading", { level: 2 })).toHaveText(H2);
    const indice = page.getByRole("navigation", { name: "Índice de la página" });
    await expect(indice.getByRole("link")).toHaveText(H2);
    await indice.getByRole("link", { name: "El modelo híbrido" }).click();
    await expect(page).toHaveURL(/#m-hibrido$/);
    await expect(page.getByRole("heading", { level: 2, name: "El modelo híbrido" })).toBeInViewport();
    await expect(indice.getByRole("link", { name: "Juego A o Juego B" })).toHaveCount(0);
  });

  test("desde el Resumen, 'Ver el modelo completo' abre la pestaña", async ({ page }) => {
    await page.goto("/netx");
    await page.getByRole("link", { name: "Ver el modelo completo" }).click();
    await expect(page).toHaveURL(/\/netx\/financiamiento$/);
    await expect(page.getByRole("heading", { level: 1, name: "Modelo de financiamiento" })).toBeVisible();
  });
});

test.describe("contenido", () => {
  test("etapas: Semilla con la meta del SAFE y el contrato sin dato", async ({ page }) => {
    await page.goto(RUTA);
    const s = seccion(page, "La plata entra por etapas");
    await expect(s).toContainText("USD 375.000 a 500.000");
    await expect(s).toContainText("sin dato (a cotizar)");
    await expect(s).toContainText("chicos e inciertos");
    await expect(s).toContainText("3 a 5 % del capex, una vez");
    await expect(s).toContainText("USD 8.550 por año (viñedo) · USD 40.000 por año (agrovoltaica)");
  });

  test("bolsillos: la Fundación es del modelo híbrido, todavía no existe y NetX nunca toma un porcentaje", async ({ page }) => {
    await page.goto(RUTA);
    const fila = seccion(page, "Quién es quién con la plata").getByRole("row", { name: /Fundación/ });
    await expect(fila).toContainText("en el modelo híbrido, la tierra común queda en ella (todavía no existe)");
    await expect(fila).toContainText("todavía no existe");
    await expect(fila).toContainText("nunca un porcentaje");
  });

  test("cascada: siete pasos en orden; S1 sin modelo", async ({ page }) => {
    await page.goto(RUTA);
    const s = seccion(page, "Cómo paga una serie");
    const pasos = s.getByRole("list").first().getByRole("listitem");
    await expect(pasos).toHaveCount(7);
    await expect(pasos.nth(0)).toContainText("Costos de operación");
    await expect(pasos.nth(6)).toContainText("80 % bien común · 20 % Unidades");
    await expect(s.getByRole("listitem").filter({ hasText: "Centro de materia orgánica" })).toContainText("sin modelo todavía");
    await expect(s.getByRole("link", { name: "Viñedo · 10 ha" })).toHaveAttribute("href", "/netx/simulador");
  });

  test("dinero temprano: conversión del SAFU y forma legal a verificar con abogado", async ({ page }) => {
    await page.goto(RUTA);
    const s = seccion(page, "Dinero temprano");
    await expect(s).toContainText("USD 1.000 en SAFU se convierten en USD 1.250 de Unidades de la Serie Madre");
    await expect(s.getByRole("table")).toContainText("a verificar con abogado");
  });

  test("recorridos: A y B", async ({ page }) => {
    await page.goto(RUTA);
    const s = seccion(page, "Recorridos de inversores");
    await expect(s).toContainText("USD 13.439 · 17.908 · 23.674");
    await expect(s).toContainText("Entrada a la vivienda: sin dato");
    await expect(s).toContainText("USD 2.663 en 15 años (TIR 9,2 %)");
    await expect(s).toContainText("302 botellas");
    await expect(s).toContainText("USD 850 el año 15");
  });

  test("riesgo: 61 %, el hallazgo de la primera pérdida y la tabla de rangos", async ({ page }) => {
    await page.goto(RUTA);
    const s = seccion(page, "¿Y si sale mal?");
    await expect(s).toContainText("61 % de los futuros: la primera pérdida");
    await expect(s).toContainText("El lugar de la primera pérdida está mal");
    await s.getByText("Ver como tabla").click();
    const tabla = s.getByRole("table", { name: /TIR de las Unidades por serie/ });
    await expect(tabla).toBeVisible();
    await expect(tabla.getByRole("row", { name: /Agrovoltaica/ })).toContainText("1,2 %");
    await expect(tabla.getByRole("row", { name: /Agrovoltaica/ })).toContainText("8,5 %");
    await expect(tabla.getByRole("row", { name: /Agrovoltaica/ })).toContainText("14,0 %");
    await expect(tabla.getByRole("row", { name: /Viñedo/ })).toContainText("−2,6 %");
  });

  test("El modelo híbrido: tres bloques, lecciones leídas del módulo, quién cobra y la comisión", async ({ page }) => {
    await page.goto(RUTA);
    const s = seccion(page, "El modelo híbrido");
    await expect(s.getByRole("heading", { level: 3, name: "Lotes privados" })).toBeVisible();
    await expect(s.getByRole("heading", { level: 3, name: "Bien común" })).toBeVisible();
    await expect(s.getByRole("heading", { level: 3, name: "Series y NetX" })).toBeVisible();
    await expect(s).toContainText("La venta es una simulación sobre un supuesto de trabajo");
    await expect(s).toContainText("Quién cobra la venta: sin dato");
    await expect(s).toContainText("Comisión por vender lotes: NetX no puede cobrarla sin matrícula de corredor");
    await expect(s).toContainText("una Fundación que todavía no existe");
    // Las lecciones salen de lib/lotes/modelo.ts con los lotes del sector norte, sin números escritos en el test.
    const lotes = lotesDelGrupo("norte").length;
    await expect(s).toContainText(leccionAporte(lotes, "es")!);
    await expect(s).toContainText(leccionExpensas(lotes, "es")!);
    await expect(s.getByRole("link", { name: "Ver qué es tuyo y qué es de todos" })).toHaveAttribute("href", "/lotes/hibrido");
    // El bloque del manifiesto se conserva al final de la sección.
    await expect(s.getByRole("group", { name: "Las decisiones, con la vida en el centro" })).toBeVisible();
  });

  test("palabras que no van; 'diseño B' solo junto a doc 28", async ({ page }) => {
    await page.goto(RUTA);
    const texto = await textoMain(page);
    for (const p of ["capitalista", "extractivista", "colonialista"]) expect(texto.toLowerCase()).not.toContain(p);
    expect(texto).not.toMatch(/reservá|reservar tu/);
    for (const p of ["Juego A", "Juego B", "atajo", "vender lotes no es", "procomún"]) expect(texto).not.toContain(p);
    const apariciones = texto.match(/diseño B/g) ?? [];
    expect(apariciones).toHaveLength(1);
    expect(texto).toContain("doc 28 (diseño B)");
  });

  test("supuestos: lo de Vagner y la vivienda", async ({ page }) => {
    await page.goto(RUTA);
    const vagner = page.getByRole("region", { name: "A confirmar con Vagner" });
    await expect(vagner).toContainText("USD 31.000");
    await expect(vagner).toContainText("3 · 6 · 9 %");
    await expect(vagner).toContainText("1 a 1,5 % anual");
    await expect(vagner).toContainText("6 veces (viñedo) · 3 veces (agrovoltaica)");
    await expect(page.getByText("Entrada y canon anual de la vivienda: sin dato (después de la aprobación)")).toBeVisible();
  });

  test("los ⚖ de Serie Madre y Fundación se abren con el teclado", async ({ page }) => {
    await page.goto(RUTA);
    for (const [nombre, texto] of [
      [/Qué significa legalmente: Serie Madre/, "invierte en todas las demás"],
      [/Qué significa legalmente: Fundación de la tierra/, "a verificar con abogado"],
    ] as const) {
      const boton = page.getByRole("button", { name: nombre }).first();
      await boton.focus();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("tooltip")).toContainText(texto);
      await page.keyboard.press("Escape");
    }
  });

  test("a 390 px no hay desborde horizontal", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(RUTA);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });
});

test.describe("rol persona", () => {
  test.use({ rol: "persona" });

  test("ve la pestaña completa", async ({ page }) => {
    await page.goto(RUTA);
    await expect(page.getByRole("heading", { level: 1, name: "Modelo de financiamiento" })).toBeVisible();
    await expect(main(page).getByRole("heading", { level: 2 })).toHaveText(H2);
    const nav = page.getByRole("navigation", { name: "Secciones de la Vista NetX" });
    await expect(nav.getByRole("link")).toHaveText(["Resumen", "Modelo de financiamiento", "Simulador", "Comunidad y embudo"]);
  });
});

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("termina en Sumarte y la respuesta no trae ningún email", async ({ page, request }) => {
    await page.goto(RUTA);
    await expect(page).toHaveURL(/\/sumarte/);
    const cuerpo = await (await request.get(RUTA)).text();
    expect(cuerpo).not.toMatch(EMAIL);
  });
});
