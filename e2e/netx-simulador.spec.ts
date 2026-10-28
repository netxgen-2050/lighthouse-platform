import { expect, test, type Page } from "./fixtura";

const tablaClases = (page: Page) => page.getByRole("table", { name: "Lo que pone y lo que recibe cada clase" });
const fila = (page: Page, clase: string) => tablaClases(page).getByRole("row").filter({ hasText: clase });
const control = (page: Page, etiqueta: string | RegExp) => page.getByLabel(etiqueta);

async function irAlSimulador(page: Page) {
  await page.goto("/netx/simulador");
  await expect(page.getByRole("heading", { level: 1, name: "Simulador de la tokenomics" })).toBeVisible();
}

async function elegirAgrovoltaica(page: Page) {
  await page.getByRole("radio", { name: "Agrovoltaica · 5 MW" }).check();
}

async function abrirAnioPorAnio(page: Page) {
  await page.getByText("Ver año por año").click();
}

test("(a) el simulador vive en la Vista NetX: /fogon ya no lo enlaza y /fogon/simulador redirige", async ({ page }) => {
  await page.goto("/fogon");
  await expect(page.getByRole("link", { name: "Simular los parámetros de la tokenomics" })).toHaveCount(0);
  await expect(page.locator('a[href="/fogon/simulador"]')).toHaveCount(0);
  await page.goto("/fogon/simulador");
  await expect(page).toHaveURL(/\/netx\/simulador$/);
  await expect(page.getByRole("heading", { level: 1, name: "Simulador de la tokenomics" })).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Secciones de la Vista NetX" }).getByRole("link", { name: "Simulador" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByRole("link", { name: "← Vista NetX" })).toHaveAttribute("href", "/netx");
  await expect(page.getByText("← Fogón")).toHaveCount(0);
  await expect(page.getByText("Fogón de decisiones")).toHaveCount(0);
  await expect(page.getByText("Modelo de NS_Tokenomics doc 28 (diseño B)")).toBeVisible();
});

test.describe("con rol persona", () => {
  test.use({ rol: "persona" });
  test("(a2) ve el simulador, también entrando por la dirección vieja", async ({ page }) => {
    await page.goto("/fogon/simulador");
    await expect(page).toHaveURL(/\/netx\/simulador$/);
    await expect(page.getByRole("heading", { level: 1, name: "Simulador de la tokenomics" })).toBeVisible();
  });
});

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });
  test("(a3) /netx/simulador lleva a Sumarte", async ({ page }) => {
    await page.goto("/netx/simulador");
    await expect(page).toHaveURL(/\/sumarte/);
  });
});

test("(b) se ven los dos avisos arriba de los controles", async ({ page }) => {
  await irAlSimulador(page);
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(
    page.getByText(
      "Prototipo interno · valores de partida, no son una oferta ni un pronóstico · el diseño legal no lo revisó un abogado",
    ),
  ).toBeVisible();
});

test("(c) con los valores de partida del viñedo se ven los números de referencia", async ({ page }) => {
  await irAlSimulador(page);
  await expect(fila(page, "Procomún")).toContainText("USD 306.970");
  const unidades = fila(page, "Unidades de Regeneración");
  await expect(unidades).toContainText("USD 484.500");
  await expect(unidades).toContainText("USD 1.290.250");
  await expect(unidades).toContainText("2,66x");
  await expect(unidades).toContainText("9,2 %");
  await expect(fila(page, "NetX")).toContainText("USD 128.250");
  await expect(page.getByText("USD 1.000 en Unidades del viñedo devuelven USD 2.663")).toBeVisible();
  await expect(page.getByText("Procomún USD 306.970, Unidades TIR 9,2 %, NetX USD 128.250")).toBeVisible();
  await expect(page.getByText(/Modelo: NS_Tokenomics\/sim\/series_waterfall_sim\.py · v0\.1/)).toBeVisible();
});

test("(d) con el teclado, la flecha arriba en la regalía la lleva a 5,5 % y cambia el año 7", async ({ page }) => {
  await irAlSimulador(page);
  await abrirAnioPorAnio(page);
  const anio7 = () =>
    page
      .getByRole("table", { name: /Año por año/ })
      .getByRole("row")
      .filter({ has: page.getByRole("rowheader", { name: "7", exact: true }) });
  await expect(anio7()).toContainText("16.750");
  const regalia = control(page, "Regalía de regeneración");
  for (let i = 0; i < 60; i++) {
    if (await regalia.evaluate((el) => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(regalia).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(page.locator("output").filter({ hasText: "5,5 % de los ingresos brutos" })).toBeVisible();
  await expect(anio7()).toContainText("18.325");
  await expect(anio7()).not.toContainText("16.750");
});

test("(e) el reparto del excedente a 30 % muestra 70 % procomún · 30 % Unidades", async ({ page }) => {
  await irAlSimulador(page);
  await expect(page.getByText("80 % procomún · 20 % Unidades")).toBeVisible();
  await control(page, /Reparto del excedente/).fill("30");
  await expect(page.getByText("70 % procomún · 30 % Unidades")).toBeVisible();
});

test("(f) Volver a los valores de partida restablece todo y lo anuncia", async ({ page }) => {
  await irAlSimulador(page);
  await control(page, "Regalía de regeneración").fill("10");
  await control(page, "Tope de las Unidades").fill("12");
  await expect(page.locator("output").filter({ hasText: "10 % de los ingresos brutos" })).toBeVisible();
  await expect(fila(page, "Unidades de Regeneración")).not.toContainText("USD 1.290.250");
  await page.getByRole("button", { name: "Volver a los valores de partida" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Volviste a los valores de partida" })).toBeVisible();
  await expect(page.locator("output").filter({ hasText: "5 % de los ingresos brutos" })).toBeVisible();
  await expect(page.locator("output").filter({ hasText: /^9 % anual$/ })).toBeVisible();
  await expect(fila(page, "Unidades de Regeneración")).toContainText("USD 1.290.250");
});

test("(g) la agrovoltaica muestra la fila de Notas Verdes y sus valores de partida", async ({ page }) => {
  await irAlSimulador(page);
  await expect(fila(page, "Notas Verdes")).toHaveCount(0);
  await elegirAgrovoltaica(page);
  await expect(fila(page, "Notas Verdes")).toContainText("USD 3.688.622");
  await expect(page.locator("output").filter({ hasText: /^10 % anual$/ })).toBeVisible();
  await expect(page.locator("output").filter({ hasText: /^1 % anual del capital$/ })).toBeVisible();
  await expect(page.locator("output").filter({ hasText: /^5 % anual$/ }).first()).toBeVisible();
  await expect(page.getByText("USD 1.000 en Unidades de la agrovoltaica devuelven USD 2.835")).toBeVisible();
});

test("(h) rendimiento 0 deja la TIR de las Unidades en sin dato con su nota; un caso muy rentable no", async ({ page }) => {
  await irAlSimulador(page);
  await control(page, "Rendimiento del viñedo en madurez").fill("0");
  await expect(fila(page, "Unidades de Regeneración")).toContainText("sin dato");
  await expect(
    page.getByText("«sin dato» en la TIR: la clase no recupera lo que puso, así que no hay una tasa que calcular."),
  ).toBeVisible();

  await elegirAgrovoltaica(page);
  await control(page, "Costo del parque solar").fill("400000");
  await control(page, "Precio de la energía").fill("150");
  await control(page, /Reparto del excedente/).fill("50");
  await expect(tablaClases(page)).not.toContainText("sin dato");
  await expect(page.getByText("«sin dato» en la TIR")).toHaveCount(0);
});

test("(i) SAFU: 1.250 con 20 %, 1.333 con 25 % y la tabla por clase no cambia; la vivienda dice sin dato", async ({ page }) => {
  await irAlSimulador(page);
  await expect(page.getByText("USD 1.000 en SAFU se convierten en USD 1.250")).toBeVisible();
  await expect(page.getByText("cálculo de la plataforma, no está en el modelo")).toBeVisible();
  const antes = await tablaClases(page).innerText();
  await control(page, "Descuento del SAFU al convertir").fill("25");
  await expect(page.getByText("USD 1.000 en SAFU se convierten en USD 1.333")).toBeVisible();
  expect(await tablaClases(page).innerText()).toBe(antes);
  await expect(page.getByText("Entrada: sin dato")).toBeVisible();
  await expect(page.getByText("Canon anual: sin dato")).toBeVisible();
  await expect(page.getByText("Asamblea de residentes + Consejo, después de la aprobación municipal")).toBeVisible();
});

test("(i2) supuestos a confirmar con Vagner y múltiplo de salida", async ({ page }) => {
  await irAlSimulador(page);
  await expect(page.getByText("Supuestos del modelo · a confirmar con Vagner")).toBeVisible();
  const multiploSalida = control(page, "Múltiplo de salida");
  await expect(page.locator("output").filter({ hasText: /^6 veces$/ })).toBeVisible();
  const antes = await fila(page, "Unidades de Regeneración").innerText();
  await multiploSalida.fill("0");
  await expect(page.locator("output").filter({ hasText: /^0 veces$/ })).toBeVisible();
  expect(await fila(page, "Unidades de Regeneración").innerText()).not.toBe(antes);

  await page.getByRole("button", { name: "Volver a los valores de partida" }).click();
  await expect(page.locator("output").filter({ hasText: /^6 veces$/ })).toBeVisible();
  expect(await fila(page, "Unidades de Regeneración").innerText()).toBe(antes);

  await elegirAgrovoltaica(page);
  await expect(page.getByText("Supuestos del modelo · a confirmar con Vagner")).toBeVisible();
  await expect(page.locator("output").filter({ hasText: /^60 % del capital$/ })).toBeVisible();
  await expect(page.locator("output").filter({ hasText: /^7 % anual$/ })).toBeVisible();
  await expect(page.locator("output").filter({ hasText: /^3 veces$/ })).toBeVisible();
  await expect(page.getByText("Unidades: el resto (30 %)")).toBeVisible();
  await expect(page.getByText("Parte de Notas Verdes")).toBeVisible();
});

test("(i3) la curva escalada del viñedo se puede apagar", async ({ page }) => {
  await irAlSimulador(page);
  const casilla = page.getByLabel("La curva de los primeros años escala con el rendimiento en madurez");
  await expect(casilla).toBeChecked();
  await control(page, "Rendimiento del viñedo en madurez").fill("3.5");
  const antes = await fila(page, "Unidades de Regeneración").innerText();
  await casilla.uncheck();
  expect(await fila(page, "Unidades de Regeneración").innerText()).not.toBe(antes);
  await elegirAgrovoltaica(page);
  await expect(page.getByLabel("La curva de los primeros años escala con el rendimiento en madurez")).toHaveCount(0);
});

test("(j) a 390 px no hay scroll horizontal, con el año por año abierto, en los dos escenarios", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await irAlSimulador(page);
  await abrirAnioPorAnio(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await elegirAgrovoltaica(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("(k) mover los controles no hace ningún pedido a /api/", async ({ page }) => {
  await irAlSimulador(page);
  await page.waitForLoadState("networkidle");
  const pedidos: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/")) pedidos.push(r.url());
  });
  await control(page, "Regalía de regeneración").fill("8");
  await control(page, "Precio del vino").fill("9");
  await elegirAgrovoltaica(page);
  await page.getByRole("button", { name: "Volver a los valores de partida" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Volviste a los valores de partida" })).toBeVisible();
  expect(pedidos).toEqual([]);
});

test("(l) recargar vuelve a los valores de partida", async ({ page }) => {
  await irAlSimulador(page);
  await control(page, "Regalía de regeneración").fill("10");
  await expect(page.locator("output").filter({ hasText: "10 % de los ingresos brutos" })).toBeVisible();
  await page.reload();
  await expect(page.locator("output").filter({ hasText: "5 % de los ingresos brutos" })).toBeVisible();
});

test("el gráfico lista las clases y la tabla equivalente", async ({ page }) => {
  await irAlSimulador(page);
  await expect(page.getByText(/1 · Procomún · Fundación · \d+ %/)).toBeVisible();
  await page.getByText("Ver como tabla").click();
  await expect(page.getByRole("figure").getByRole("columnheader", { name: "Clase" })).toBeVisible();
});

test("el ⚖ de Primera pérdida explica en palabras simples y se marca como borrador", async ({ page }) => {
  await irAlSimulador(page);
  await fila(page, "Primera pérdida").getByRole("button").click();
  await expect(page.getByText(/Plata catalítica/)).toBeVisible();
  await expect(page.getByText("Borrador: texto a revisar")).toBeVisible();
});

test("(d2) con la regalía en 10 %, lo de la Fundación sube en cada año con ventas", async ({ page }) => {
  await irAlSimulador(page);
  await abrirAnioPorAnio(page);
  const filas = page.getByRole("table", { name: /Año por año/ }).getByRole("row");
  const fundacion = async () => {
    const out: number[] = [];
    for (let anio = 4; anio <= 15; anio++) {
      const f = filas.filter({ has: page.getByRole("rowheader", { name: String(anio), exact: true }) });
      const celdas = await f.getByRole("cell").allInnerTexts();
      out.push(Number(celdas[2].replace(/\./g, "")));
    }
    return out;
  };
  const antes = await fundacion();
  await control(page, "Regalía de regeneración").fill("10");
  await expect(page.locator("output").filter({ hasText: "10 % de los ingresos brutos" })).toBeVisible();
  const despues = await fundacion();
  despues.forEach((v, i) => expect(v).toBeGreaterThan(antes[i]));
  await expect(fila(page, "Procomún")).not.toContainText("USD 306.970");
});

test("(m) una clase sin capital muestra — y la nota lo explica", async ({ page }) => {
  await irAlSimulador(page);
  await expect(fila(page, "Procomún").getByRole("cell").first()).toHaveText("—");
  await expect(fila(page, "NetX").getByRole("cell").first()).toHaveText("—");
  await elegirAgrovoltaica(page);
  await control(page, "Parte de Notas Verdes").fill("0");
  await expect(page.getByText(/una clase con 0 % del capital tampoco puso nada/)).toBeVisible();
});
