import { expect, test, type Page } from "./fixtura";
import { textosEnEspanol } from "./ayudas-idioma";

const decision = (page: Page, titulo: string | RegExp) =>
  page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: titulo }) });

test.describe("Fogón en inglés", () => {
  test.use({ locale: "en-US" });

  test("filtros, decisiones de ejemplo traducidas con su nota y nada de español suelto", async ({ page }) => {
    await page.goto("/fogon");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1, name: "What is being decided" })).toBeVisible();
    await expect(page.getByText("This page is only available in Spanish for now.")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Residents' Assembly" })).toBeVisible();
    const huerta = decision(page, "2027 community garden plan");
    await expect(huerta).toBeVisible();
    await expect(huerta.getByText("Translated from Spanish")).toBeVisible();
    await expect(huerta).toContainText("Sample votes: In favor 14 · Against 1 · Abstention 3");
    // Los nombres de tribus no se traducen.
    await expect(huerta).toContainText("Círculo de Tierra");
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("votar In favor registra el voto igual que en español y el estado se lee en inglés", async ({ page }) => {
    await page.goto("/fogon");
    const huerta = decision(page, "2027 community garden plan");
    await huerta.getByRole("button", { name: "Vote" }).click();
    await huerta.getByRole("button", { name: "In favor" }).click();
    await expect(huerta.getByText("Your vote: In favor (simulated)")).toBeVisible();
    await expect(huerta).toContainText("In favor 15");
    await expect(page.getByRole("status")).toContainText("Your vote was recorded: In favor");
    await expect(huerta.getByRole("button", { name: "Change vote" })).toBeFocused();
    // El voto es el mismo que en español: se guarda con la clave, no con el texto.
    const guardado = await page.evaluate(() => window.localStorage.getItem("lh-fogon"));
    expect(JSON.parse(guardado ?? "{}")).toEqual({ votos: { huerta: "favor" } });
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("sin residencia cargada dice en inglés que falta el dato", async ({ page }) => {
    await page.goto("/fogon");
    await expect(page.getByText("No data on your residency", { exact: true })).toHaveCount(2);
    await expect(page.getByRole("link", { name: "Add it in My data" })).toBeVisible();
  });

  test("el voto guardado desde la plataforma en español se ve en inglés", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("lh-fogon", JSON.stringify({ votos: { huerta: "contra" } }));
    });
    await page.goto("/fogon");
    await expect(decision(page, "2027 community garden plan").getByText("Your vote: Against (simulated)")).toBeVisible();
  });
});

test.describe("Fogón: Pase Fundador en inglés", () => {
  test.use({ locale: "en-US", plan: "miembro" });

  test("el Fideicomiso sin Pase explica el motivo y enlaza a Sumarte", async ({ page }) => {
    await page.goto("/fogon");
    await page.getByRole("button", { name: "Trust" }).click();
    const p = decision(page, /construction budget/);
    await expect(p).toContainText("Only Founder Pass holders vote");
    await expect(p.getByRole("link", { name: "See the Founder Pass in Join" })).toHaveAttribute("href", "/sumarte");
  });
});

test.describe("Compromisos y Mercado en inglés", () => {
  test.use({ locale: "en-US" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/compromisos");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();
  });

  test("la validación se lee en inglés, queda asociada al campo y el foco va a ese campo", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Commitments" })).toBeVisible();
    await page.getByRole("button", { name: "Register" }).click();
    const campo = page.getByLabel("Description");
    await expect(page.getByText("Error: Write a description.")).toBeVisible();
    await expect(campo).toBeFocused();
    await expect(campo).toHaveAttribute("aria-invalid", "true");
    await expect(campo).toHaveAccessibleDescription("Error: Write a description.");
  });

  test("las ofertas de ejemplo van traducidas con su nota; nombres de tribus y barrios no se tocan", async ({ page }) => {
    const mercado = page.getByRole("region", { name: "Market" });
    const oferta = mercado.getByRole("listitem").filter({ hasText: "Support setting up family vegetable gardens" });
    await expect(oferta).toBeVisible();
    await expect(oferta.getByText("Translated from Spanish")).toBeVisible();
    await expect(oferta).toContainText("I offer · Time · 6 h/month");
    await expect(oferta).toContainText("Posted by: Community (sample)");
    await expect(mercado.getByText("Soon, an artificial intelligence will suggest the best match")).toBeVisible();
    await expect(mercado.getByRole("listitem").filter({ hasText: "Native fruit tree seedlings" })).toContainText("30 seedlings");
  });

  test("lo que publica la persona se ve tal cual, con lang es, sin nota de traducción", async ({ page }) => {
    await page.getByRole("radio", { name: "I offer" }).check();
    await page.getByRole("radio", { name: "Goods" }).check();
    await page.getByLabel("Description").fill("Plantines de lavanda");
    await page.getByLabel("Indicative quantity").fill("20 plantines");
    await page.getByRole("button", { name: "Register" }).click();
    const suya = page.getByRole("region", { name: "Your commitments" });
    await expect(suya.locator('[lang="es"]', { hasText: "Plantines de lavanda" })).toBeVisible();
    await expect(suya).toContainText("I offer · Goods · Plantines de lavanda · 20 plantines");
    const mercado = page.getByRole("region", { name: "Market" });
    const propia = mercado.getByRole("listitem").filter({ hasText: "Plantines de lavanda" });
    await expect(propia.locator('[lang="es"]', { hasText: "Plantines de lavanda" })).toBeVisible();
    await expect(propia.getByText("Translated from Spanish")).toHaveCount(0);
    await expect(propia).toContainText("Posted by: You");
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("filtrar el mercado anuncia el resultado en inglés", async ({ page }) => {
    await page.getByLabel("Filter by type").selectOption("necesito");
    await page.getByLabel("Filter by means of exchange").selectOption("tiempo");
    await expect(page.getByText("I need, Time: 1 post")).toBeAttached();
    await expect(page.getByRole("region", { name: "Market" }).getByRole("listitem")).toHaveCount(1);
  });
});

test.describe("Canales en inglés", () => {
  test.use({ locale: "en-US", plan: "explorador" });

  test("/canales lleva al pasaporte en inglés, donde una persona Explorer ve las puertas en inglés", async ({ page }) => {
    await page.goto("/canales");
    await expect(page).toHaveURL(/\/pasaporte$/);
    await expect(page.getByRole("heading", { level: 1, name: "Your passport" })).toBeVisible();
    await expect(page.getByText("This page is only available in Spanish for now.")).toHaveCount(0);
    await expect(page.locator('[data-sello="fundador"]')).toContainText("Founders channel");
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });
});
