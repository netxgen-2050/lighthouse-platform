import AxeBuilder from "@axe-core/playwright";
import { EMAILS, expect, test, type Page } from "./fixtura";

// Sin el fixture de login: la persona no entró.
test.use({ rol: "ninguno" });

const barra = (page: Page) => page.getByRole("banner");
const rail = (page: Page) => page.getByRole("navigation", { name: "Principal" });

test.describe("páginas públicas sin sesión", () => {
  test("Territorio: se ve el mapa, la ficha lateral y el panel de tribus", async ({ page }) => {
    await page.goto("/territorios/lighthouse");
    await expect(page.getByRole("heading", { name: "Mapa del Macrolote 7" })).toBeVisible();
    const ficha = page.getByRole("complementary", { name: "Ficha del territorio" });
    await expect(ficha).toBeVisible();
    await expect(ficha.getByRole("heading", { name: "Tribus del territorio" })).toBeVisible();
    await expect(ficha.getByRole("button", { name: "Entrá para adherir" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenida al Lighthouse" })).toHaveCount(0);
    await expect(page.getByText("Prototipo interno · datos de ejemplo").first()).toBeVisible();
  });

  test("Inicio y Tribus se ven sin entrar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /Encontrá tu tribu/ })).toBeVisible();
    await page.goto("/tribus");
    await expect(page.getByRole("heading", { level: 1, name: "Tribus del Lighthouse" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrá para proponer una comunidad" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Proponer una comunidad para el Barrio/ })).toHaveCount(0);
  });

  test("Pactos sigue mostrando la pantalla de entrada", async ({ page }) => {
    await page.goto("/pactos");
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenida al Lighthouse" })).toBeVisible();
    await page.goto("/tribus/valle/postular");
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenida al Lighthouse" })).toBeVisible();
  });

  test("Adherir sin entrar: se lee el manifiesto y en lugar de Adherir hay un llamado a entrar", async ({ page }) => {
    await page.goto("/tribus/valle");
    await expect(page.getByRole("link", { name: "Leer el manifiesto de la tribu" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrá para adherir" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Adherir al manifiesto de la tribu" })).toHaveCount(0);

    await page.getByRole("link", { name: "Leer el manifiesto de la tribu" }).click();
    await expect(page).toHaveURL(/\/tribus\/valle\/manifiesto$/);
    await expect(page.getByRole("region", { name: "Texto del manifiesto" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrá para adherir" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Adherir", exact: true })).toHaveCount(0);
  });

  test("Consultar por un lote sin entrar: aparece el llamado a entrar", async ({ page }) => {
    await page.goto("/territorios/lighthouse");
    await page.getByText(/Fincas disponibles de Soluna/).click();
    await page.getByRole("button", { name: /^Finca / }).first().click();
    const ficha = page.getByRole("complementary", { name: "Ficha del territorio" });
    await expect(ficha.getByRole("button", { name: "Entrá para consultar por este lote" })).toBeVisible();
    await expect(ficha.getByRole("button", { name: "Consultar por este lote", exact: true })).toHaveCount(0);
  });

  test("un barrio vacante pide entrar para proponer una comunidad", async ({ page }) => {
    await page.goto("/territorios/lighthouse");
    await page.getByRole("button", { name: /^Barrio \d+$/ }).first().click();
    const ficha = page.getByRole("complementary", { name: "Ficha del territorio" });
    await expect(ficha).toBeVisible();
    // El botón "Barrio N" a secas es el de un barrio vacante (los que tienen tribu llevan su nombre).
    await expect(ficha.getByRole("button", { name: "Entrá para proponer una comunidad" })).toBeVisible();
    await expect(ficha.getByRole("link", { name: "Conocer la tribu" })).toHaveCount(0);
  });
});

test.describe("navegación sin sesión", () => {
  test("el rail muestra Descubrir completo y el resto con candado y 'Entrá para ver'", async ({ page }) => {
    await page.goto("/");
    for (const nombre of ["Inicio", "Territorio", "Tribus"]) {
      const enlace = rail(page).getByRole("link", { name: nombre, exact: true });
      await expect(enlace).toBeVisible();
    }
    const pactos = rail(page).getByRole("link", { name: /Pactos/ });
    await expect(pactos).toContainText("Entrá para ver");
    await expect(rail(page).getByRole("link", { name: /Sumarte/ })).toContainText("Entrá para ver");
    await expect(rail(page).getByRole("link", { name: "Inicio", exact: true })).not.toContainText("Entrá para ver");
    await pactos.click();
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenida al Lighthouse" })).toBeVisible();
  });

  test("la barra superior solo muestra Entrar; Reportar no aparece y Hifa sí", async ({ page }) => {
    await page.goto("/");
    await expect(barra(page).getByRole("button", { name: "Entrar" })).toBeVisible();
    await expect(barra(page).getByRole("button", { name: "Menú de la persona" })).toHaveCount(0);
    await expect(barra(page).getByRole("link", { name: /NetX/ })).toHaveCount(0);
    await expect(barra(page).getByRole("link")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Reportar un problema o una idea" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Hablar con Hifa" })).toBeVisible();
  });

  test("Entrar muestra la pantalla de entrada en la misma página y, al entrar, la persona sigue ahí", async ({ page }) => {
    await page.goto("/tribus/valle");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("heading", { name: "Entrar como…" })).toBeVisible();
    await expect(page).toHaveURL(/\/tribus\/valle$/);
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(barra(page).getByRole("button", { name: "Menú de la persona" })).toBeVisible();
    await expect(page).toHaveURL(/\/tribus\/valle$/);
    await expect(page.getByRole("heading", { level: 1, name: "Valle Solar" })).toBeVisible();
  });

  test("Entrar desde una página que pide sesión no cambia de página", async ({ page }) => {
    await page.goto("/pactos");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("heading", { name: "Entrar como…" })).toBeVisible();
    await expect(page).toHaveURL(/\/pactos$/);
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(barra(page).getByRole("button", { name: "Menú de la persona" })).toBeVisible();
    await expect(page).toHaveURL(/\/pactos$/);
  });

  test("Seguir explorando cierra la pantalla de entrada pedida en una página pública", async ({ page }) => {
    await page.goto("/tribus/valle");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    await page.getByRole("button", { name: "Seguir explorando" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Valle Solar" })).toBeVisible();
  });

  test("Entrá para consultar por este lote: al entrar vuelve a la misma finca elegida", async ({ page }) => {
    await page.goto("/territorios/lighthouse");
    await page.getByText(/Fincas disponibles de Soluna/).click();
    await page.getByRole("button", { name: /^Finca / }).first().click();
    const ficha = page.getByRole("complementary", { name: "Ficha del territorio" });
    const titulo = await ficha.getByRole("heading", { level: 2 }).first().innerText();
    await ficha.getByRole("button", { name: "Entrá para consultar por este lote" }).click();
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(page).toHaveURL(/\/territorios\/lighthouse\?sel=/);
    await expect(ficha.getByRole("heading", { level: 2, name: titulo })).toBeVisible();
    await expect(ficha.getByRole("button", { name: "Consultar por este lote", exact: true })).toBeVisible();
  });

  test("Hifa funciona sin entrar, pero pasarlo al equipo pide entrar", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Hablar con Hifa" }).click();
    const chat = page.getByRole("dialog", { name: "Chat con Hifa" });
    await chat.getByLabel("Escribile a Hifa").fill("una idea");
    await chat.getByRole("button", { name: "Enviar", exact: true }).click();
    await expect(chat.getByRole("button", { name: "Sí, pasalo" })).toHaveCount(0);
    await expect(chat.getByRole("button", { name: "Entrá para pasárselo al equipo" })).toBeVisible();
    await expect(chat.getByRole("button", { name: "No, gracias" })).toBeVisible();
  });
});

test.describe("sin datos guardados sin sesión", () => {
  test("recorrer las páginas públicas no crea claves en el navegador", async ({ page }) => {
    for (const ruta of ["/", "/territorios/lighthouse", "/tribus", "/tribus/valle", "/tribus/valle/manifiesto"]) {
      await page.goto(ruta);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByText("Prototipo interno · datos de ejemplo").first()).toBeVisible();
    }
    // Se elige algo en el mapa y se abre Hifa: tampoco se guarda.
    await page.goto("/territorios/lighthouse");
    await page.getByRole("button", { name: /^Barrio \d+/ }).first().click();
    await page.getByRole("button", { name: "Hablar con Hifa" }).click();
    await page.getByLabel("Escribile a Hifa").fill("hola");
    await page.getByRole("button", { name: "Enviar", exact: true }).click();
    const claves = await page.evaluate(() => Object.keys(window.localStorage));
    expect(claves.filter((c) => c.startsWith("u:") || c.startsWith("lh-bitacora") || c.startsWith("lh-hifa"))).toEqual([]);
    expect(claves).toEqual([]);
  });
});

test.describe("accesibilidad sin sesión", () => {
  for (const ruta of ["/", "/territorios/lighthouse", "/tribus", "/tribus/valle", "/tribus/valle/manifiesto"]) {
    test(`axe sin violaciones serias o críticas en ${ruta}`, async ({ page }) => {
      await page.goto(ruta);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
      await expect(page.locator("main")).toHaveCount(1);
      const r = await new AxeBuilder({ page }).analyze();
      expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    });
  }
});
