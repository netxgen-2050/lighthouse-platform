import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";
import { abrirModoDePrueba } from "./ayudas";
import { FILAS } from "../lib/sumarte/datos";

// sumarte-planes-v2: a 390 px la página entra sin scroll de costado, el plan se lee como una lista, no hay tabla y los tres
// planes se eligen de a uno con un selector; a 1440 px se ven los tres en columnas, con la tabla de comparación debajo.
const desborde = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const PLANES = ["explorador", "amigo", "fundador"] as const;

test.describe("Sumarte a 390 px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const plan of PLANES) {
    test(`con el plan ${plan}: un plan por vez, sin scroll horizontal y sin tabla`, async ({ page }) => {
      await page.goto(`/sumarte?plan=${plan}`);
      await expect(page.locator("#planes").getByRole("article").filter({ visible: true })).toHaveCount(1);
      expect(await desborde(page)).toBeLessThanOrEqual(0);
      await expect(page.getByRole("table")).toHaveCount(0);
      const grupo = page.getByRole("radiogroup", { name: "Plan" });
      await expect(grupo.getByRole("radio")).toHaveCount(3);
      await grupo.scrollIntoViewIfNeeded();
      await expect(grupo.locator("label[data-marcado='true']")).toBeInViewport();
    });
  }

  test("?plan=miembro muestra Amigo y la dirección pasa a plan=amigo", async ({ page }) => {
    await page.goto("/sumarte?plan=miembro");
    await expect(page.getByRole("radio", { name: "Amigo", exact: true })).toBeChecked();
    await expect(page.getByRole("heading", { level: 2, name: /^Amigo/ })).toBeVisible();
    await expect(page).toHaveURL(/plan=amigo/);
    expect(await desborde(page)).toBeLessThanOrEqual(0);
  });

  test("Aliados es una tarjeta debajo del plan, también sin scroll horizontal", async ({ page }) => {
    await page.goto("/sumarte?plan=amigo");
    const aliados = page.getByRole("region", { name: "Aliados" });
    await aliados.scrollIntoViewIfNeeded();
    await expect(aliados).toBeVisible();
    await expect(aliados.getByRole("button", { name: "Hablemos" })).toBeVisible();
    const [plan, franja] = [(await page.getByRole("article").filter({ visible: true }).boundingBox())!.y, (await aliados.boundingBox())!.y];
    expect(franja).toBeGreaterThan(plan);
    expect(await desborde(page)).toBeLessThanOrEqual(0);
  });

  test("el plan se lee en una lista con texto, no solo con ✓ y —", async ({ page }) => {
    await page.goto("/sumarte?plan=amigo");
    const lista = page.getByRole("region", { name: "Qué incluye y qué no" }).filter({ visible: true });
    await expect(lista).toBeVisible();
    const filas = lista.getByRole("listitem");
    await expect(filas).toHaveCount(FILAS.length);
    await expect(filas.filter({ hasText: "Visita guiada al sitio" })).toContainText("No incluido");
    await expect(filas.filter({ hasText: "Bitácora de obra y masterplan" })).toContainText("Próximamente");
    await expect(filas.filter({ hasText: "FARO de prepago, para canjear por servicios" })).toContainText("Incluido");
    for (const fila of await filas.all()) await expect(fila).toContainText(/Incluido|No incluido|Próximamente/);
  });

  test("las flechas del teclado cambian de plan también en el celular", async ({ page }) => {
    await page.goto("/sumarte?plan=explorador");
    await page.getByRole("radio", { name: "Explorador", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Amigo", exact: true })).toBeChecked();
    await expect(page).toHaveURL(/plan=amigo/);
    await expect(page.getByRole("heading", { level: 2, name: /^Amigo/ })).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Fundador", exact: true })).toBeChecked();
    await expect(page).toHaveURL(/plan=fundador/);
    await page.reload();
    await expect(page.getByRole("radio", { name: "Fundador", exact: true })).toBeChecked();
  });

  test("el bloque del FARO es el del plan elegido: Amigo o Fundador, y ninguno con Explorador", async ({ page }) => {
    await page.goto("/sumarte?plan=amigo");
    await expect(page.locator("#faro-amigo")).toBeVisible();
    await expect(page.locator("#faro-fundador")).toBeHidden();
    await expect(page.getByText("Borrador · a definir").filter({ visible: true })).toHaveCount(1);
    await page.goto("/sumarte?plan=explorador");
    await expect(page.locator("#faro-amigo")).toBeHidden();
    await expect(page.locator("#faro-fundador")).toBeHidden();
  });

  test.describe("sin sesión", () => {
    test.use({ rol: "ninguno" });

    test("el cajón Modo de prueba está al final y cerrado; al abrirlo aparece Entrar como…", async ({ page }) => {
      test.skip(Boolean(process.env.BASE_URL || process.env.NEXT_PUBLIC_PRIVY_APP_ID), "Con Privy no hay modo de prueba");
      await page.goto("/sumarte");
      const cajon = page.locator("details:has(#entrar-como)");
      await expect(cajon).toBeVisible();
      await expect(cajon).not.toHaveAttribute("open", "");
      await expect(page.getByRole("heading", { name: "Entrar como…" })).toBeHidden();
      // Va al final de la página: debajo de las tarjetas de lote e invertir.
      const [cajonY, invertirY] = [(await cajon.boundingBox())!.y, (await page.locator("#invertir").boundingBox())!.y];
      expect(cajonY).toBeGreaterThan(invertirY);
      await abrirModoDePrueba(page);
      await expect(page.getByRole("heading", { name: "Entrar como…" })).toBeVisible();
      expect(await desborde(page)).toBeLessThanOrEqual(0);
    });
  });

  for (const esquema of ["light", "dark"] as const) {
    test(`axe sin violaciones serias o críticas en ${esquema}, con cada plan`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: esquema });
      for (const plan of PLANES) {
        await page.goto(`/sumarte?plan=${plan}`);
        await expect(page.locator("#planes").getByRole("article").filter({ visible: true })).toHaveCount(1);
        const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(graves.map((v) => ({ id: v.id, plan, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
      }
    });
  }
});

test.describe("Sumarte a 1440 px", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("tres columnas de igual ancho, una al lado de la otra, con 'El más elegido' en Amigo", async ({ page }) => {
    await page.goto("/sumarte");
    const tarjetas = page.getByTestId("tabla-de-precios").getByRole("article");
    await expect(tarjetas).toHaveCount(3);
    const cajas = await Promise.all([0, 1, 2].map(async (i) => (await tarjetas.nth(i).boundingBox())!));
    expect(cajas[0].x).toBeLessThan(cajas[1].x);
    expect(cajas[1].x).toBeLessThan(cajas[2].x);
    // Una al lado de la otra (misma fila) y del mismo ancho.
    expect(Math.abs(cajas[0].y - cajas[1].y)).toBeLessThan(2);
    expect(Math.abs(cajas[1].y - cajas[2].y)).toBeLessThan(2);
    expect(Math.abs(cajas[0].width - cajas[1].width)).toBeLessThan(2);
    expect(Math.abs(cajas[1].width - cajas[2].width)).toBeLessThan(2);
    await expect(tarjetas.nth(1)).toContainText("El más elegido");
    await expect(tarjetas.nth(0)).not.toContainText("El más elegido");
    await expect(tarjetas.nth(2)).not.toContainText("El más elegido");
    // Nunca solo con color: Amigo lleva borde propio además de la etiqueta.
    expect(await tarjetas.nth(1).evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe("2px");
    // El selector de planes del celular no se ve en compu.
    await expect(page.getByRole("radiogroup", { name: "Plan" })).toBeHidden();
    expect(await desborde(page)).toBeLessThanOrEqual(0);
  });

  test("'Anual' cambia solo el precio de Amigo", async ({ page }) => {
    await page.goto("/sumarte");
    const tarjetas = page.getByTestId("tabla-de-precios").getByRole("article");
    const antes = [await tarjetas.nth(0).innerText(), await tarjetas.nth(2).innerText()];
    await page.getByRole("button", { name: /^Mensual/ }).click();
    const amigoMensual = await tarjetas.nth(1).innerText();
    await page.getByRole("button", { name: /^Anual/ }).click();
    const amigoAnual = await tarjetas.nth(1).innerText();
    expect(amigoMensual).not.toEqual(amigoAnual);
    expect(amigoAnual).toContain("/año");
    expect(amigoMensual).toContain("/mes");
    expect(await tarjetas.nth(0).innerText()).toEqual(antes[0]);
    expect(await tarjetas.nth(2).innerText()).toEqual(antes[1]);
  });

  test("la franja de Aliados va debajo de los planes y la tabla de comparación, con el encabezado fijo", async ({ page }) => {
    await page.goto("/sumarte");
    const planes = (await page.getByTestId("tabla-de-precios").boundingBox())!;
    const aliados = (await page.getByRole("region", { name: "Aliados" }).boundingBox())!;
    expect(aliados.y).toBeGreaterThan(planes.y + planes.height - 1);
    const tabla = page.getByRole("table");
    await expect(tabla).toBeVisible();
    await expect(page.getByRole("region", { name: "Qué incluye y qué no" })).toHaveCount(0);
    const encabezado = tabla.locator("thead");
    expect(await encabezado.evaluate((el) => getComputedStyle(el).position)).toBe("sticky");
    await expect(tabla.getByRole("columnheader")).toHaveCount(3);
    await expect(tabla.getByRole("columnheader", { name: "Amigo" })).toHaveClass(/bg-surface-2/);
    await expect(tabla.getByRole("columnheader", { name: "Amigo" })).toHaveClass(/font-bold/);
    await expect(tabla.getByRole("columnheader", { name: "Explorador" })).not.toHaveClass(/bg-surface-2/);
    for (const celda of await tabla.locator("tbody td").all()) await expect(celda).toContainText(/Incluido|No incluido|Próximamente/);
  });

  test("a 1440 px se ven los dos bloques del FARO en borrador", async ({ page }) => {
    await page.goto("/sumarte");
    await expect(page.locator("#faro-amigo")).toBeVisible();
    await expect(page.locator("#faro-fundador")).toBeVisible();
    await expect(page.getByText("Borrador · a definir")).toHaveCount(2);
  });

  for (const esquema of ["light", "dark"] as const) {
    test(`axe sin violaciones serias o críticas en ${esquema}, con cada plan`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: esquema });
      for (const plan of PLANES) {
        await page.goto(`/sumarte?plan=${plan}`);
        await expect(page.locator("#planes").getByRole("article")).toHaveCount(3);
        const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(graves.map((v) => ({ id: v.id, plan, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
      }
    });
  }
});
