import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";
import { abrirModoDePrueba } from "./ayudas";

// ux-sumarte: a 390 px la página entra sin scroll de costado, el plan se lee como una lista y no hay tabla cortada.
const desborde = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

test.describe("Sumarte a 390 px", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const plan of ["explorador", "miembro", "fundador", "comunidad"]) {
    test(`con el plan ${plan}: sin scroll horizontal y sin tabla`, async ({ page }) => {
      await page.goto(`/sumarte?plan=${plan}`);
      await expect(page.locator("#planes").getByRole("article")).toHaveCount(1);
      expect(await desborde(page)).toBeLessThanOrEqual(0);
      await expect(page.getByRole("table")).toHaveCount(0);
      // El selector entra o se desliza, y el plan elegido está siempre a la vista.
      const grupo = page.getByRole("radiogroup", { name: "Plan" });
      await grupo.scrollIntoViewIfNeeded();
      await expect(grupo.locator("label[data-marcado='true']")).toBeInViewport();
    });
  }

  test("el plan se lee en una lista con texto, no solo con ✓ y —", async ({ page }) => {
    await page.goto("/sumarte?plan=miembro");
    const lista = page.getByRole("region", { name: "Qué incluye y qué no" });
    await expect(lista).toBeVisible();
    const filas = lista.getByRole("listitem");
    await expect(filas).toHaveCount(8);
    await expect(filas.filter({ hasText: "Canal de fundadores y encuentros con el Consejo" })).toContainText("No incluido");
    await expect(filas.filter({ hasText: "Salas de comunidad y foros de la red" })).toContainText("Incluido");
    // Cada fila dice su estado con palabras.
    for (const fila of await filas.all()) await expect(fila).toContainText(/Incluido|No incluido/);
  });

  test("las flechas del teclado cambian de plan también en el celular", async ({ page }) => {
    await page.goto("/sumarte?plan=explorador");
    await page.getByRole("radio", { name: "Explorador", exact: true }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: "Miembro", exact: true })).toBeChecked();
    await expect(page.getByRole("heading", { level: 2, name: /^Miembro de la red/ })).toBeVisible();
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
      // Va al final de la página: debajo de las secciones de lote e invertir.
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
      for (const plan of ["explorador", "miembro", "fundador", "comunidad"]) {
        await page.goto(`/sumarte?plan=${plan}`);
        await expect(page.locator("#planes").getByRole("article")).toHaveCount(1);
        const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(graves.map((v) => ({ id: v.id, plan, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
      }
    });
  }
});

test.describe("Sumarte a 1440 px", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("la tabla fija su encabezado y resalta la columna del plan elegido", async ({ page }) => {
    await page.goto("/sumarte?plan=miembro");
    const tabla = page.getByRole("table");
    await expect(tabla).toBeVisible();
    await expect(page.getByRole("region", { name: "Qué incluye y qué no" })).toHaveCount(0);
    const encabezado = tabla.locator("thead");
    expect(await encabezado.evaluate((el) => getComputedStyle(el).position)).toBe("sticky");
    await expect(tabla.getByRole("columnheader", { name: "Miembro" })).toHaveClass(/bg-surface-2/);
    await expect(tabla.getByRole("columnheader", { name: "Miembro" })).toHaveClass(/font-bold/);
    await expect(tabla.getByRole("columnheader", { name: "Explorador" })).not.toHaveClass(/bg-surface-2/);
    // Con Comunidad no hay columna que resaltar.
    await page.getByRole("radio", { name: "Comunidad", exact: true }).check({ force: true });
    await expect(tabla.locator("th.bg-surface-2")).toHaveCount(0);
    expect(await desborde(page)).toBeLessThanOrEqual(0);
  });

  for (const esquema of ["light", "dark"] as const) {
    test(`axe sin violaciones serias o críticas en ${esquema}, con cada plan`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: esquema });
      for (const plan of ["explorador", "miembro", "fundador", "comunidad"]) {
        await page.goto(`/sumarte?plan=${plan}`);
        await expect(page.locator("#planes").getByRole("article")).toHaveCount(1);
        const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
        expect(graves.map((v) => ({ id: v.id, plan, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
      }
    });
  }
});
