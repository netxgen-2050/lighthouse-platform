import { expect, test, type Page } from "./fixtura";
import { textosEnEspanol } from "./ayudas-idioma";

const html = (page: Page) => page.locator("html");
const tarjeta = (page: Page, titulo: RegExp) =>
  page.getByRole("article").filter({ has: page.getByRole("heading", { name: titulo }) });

// ===== Portada =====

test.describe("portada en inglés", () => {
  test.use({ locale: "en-US" });

  test("título, los tres caminos y los enlaces", async ({ page }) => {
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Regenerating from the water.");
    await expect(page.getByText("Internal prototype · sample data")).toBeVisible();
    for (const camino of ["Where would I live and what does it cost?", "What do I fund and how am I paid back?", "What belongs to everyone and who decides?"]) {
      await expect(page.getByRole("heading", { level: 3, name: camino })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Explore the territory", exact: true }).first()).toHaveAttribute("href", "/explorar/territorio");
    await expect(page.getByRole("link", { name: "Choose how to join" })).toBeVisible();
    await expect(page.getByRole("link", { name: /What belongs to everyone/ })).toContainText(/\d+ neighborhoods and the communities forming them\./);
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("el camino recomendado dice 'Recommended for you'", async ({ page }) => {
    await page.goto("/?camino=lotes");
    await expect(page.getByText("Recommended for you")).toBeVisible();
  });
});

test("?lang=en&utm_source=deck muestra la portada en inglés y guarda el origen", async ({ page }) => {
  await page.goto("/?lang=en&utm_source=deck");
  await expect(page).toHaveURL(/\/\?utm_source=deck$/);
  await expect(html(page)).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Regenerating from the water.");
  await expect
    .poll(async () => JSON.parse((await page.evaluate(() => window.localStorage.getItem("lh-origen"))) ?? "{}").fuente)
    .toBe("deck");
});

// ===== Sumarte =====

test.describe("Sumarte en inglés", () => {
  test.use({ locale: "en-US", rol: "ninguno" });

  test("encabezado, tres planes con sus nombres, Aliados y montos con coma de miles", async ({ page }) => {
    await page.goto("/sumarte");
    await expect(html(page)).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1, name: "Choose how to join" })).toBeVisible();
    await expect(page.getByText("Internal prototype · sample data")).toBeVisible();
    // El selector de un plan por vez es del celular: en compu está en la página pero oculto.
    const selector = page.locator('[role="radiogroup"][aria-label="Plan"]');
    await expect(selector.locator('input[type="radio"]')).toHaveCount(3);
    for (const plan of ["Explorer", "Friend", "Founder"]) {
      await expect(selector.locator("label", { hasText: plan })).toBeAttached();
    }
    await expect(page.getByRole("heading", { level: 2, name: "Explorer" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /^Friend/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Founder" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Allies" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Let's talk" })).toBeVisible();
    const fundador = tarjeta(page, /^Founder/);
    await expect(fundador).toContainText("USD 1,500 · one-time payment");
    await expect(fundador).toContainText("63 of 100 passes left");
    await expect(tarjeta(page, /^Friend/)).toContainText("Most chosen");
    await expect(page.getByRole("heading", { name: "What each plan includes" })).toBeVisible();
    await expect(page.locator("tbody tr")).toHaveCount(10);
    await expect(page.getByRole("heading", { name: "Invest", exact: true })).toBeVisible();
    await expect(page.getByText("Translated from Spanish")).toHaveCount(0);
  });

  test("facturación mensual y anual", async ({ page }) => {
    await page.goto("/sumarte?plan=amigo");
    const amigo = tarjeta(page, /^Friend/);
    await page.getByRole("button", { name: /^Monthly/ }).click();
    await expect(amigo).toContainText("USD 9/month");
    await page.getByRole("button", { name: /^Yearly/ }).click();
    await expect(amigo).toContainText("USD 90/year");
    await expect(amigo).toContainText("2 months free");
  });

  test("las reglas del FARO de prepago se leen en inglés, en borrador", async ({ page }) => {
    await page.goto("/sumarte?plan=amigo");
    const faro = page.locator("#faro-amigo");
    await expect(faro.getByText("Draft · to be defined")).toBeVisible();
    await expect(faro.getByRole("listitem")).toHaveCount(5);
    await expect(faro).toContainText("1 FARO = USD 1 (to be defined) at list price");
    await expect(faro).toContainText("It gives no voice");
  });

  test("el contenido no deja español suelto, con cada plan", async ({ page }) => {
    for (const plan of ["explorador", "amigo", "fundador"]) {
      await page.goto(`/sumarte?plan=${plan}`);
      await expect(page.getByRole("heading", { name: "Invest", exact: true })).toBeVisible();
      expect(await textosEnEspanol(page, "main")).toEqual([]);
    }
  });

  test("el ⚖ del FARO de prepago ya está en inglés", async ({ page }) => {
    await page.goto("/sumarte?plan=amigo");
    await expect(page.locator("#faro-amigo").getByRole("button", { name: "What it means legally: Prepaid FARO" })).toBeVisible();
  });

  test("sin cuenta, el panel de ayuda y el aviso de registro están en inglés", async ({ page }) => {
    await page.goto("/sumarte");
    await expect(page.getByText("You haven't joined yet: choose a plan.")).toBeVisible();
    await expect(page.getByText(/When you choose a plan you sign up or sign in/)).toBeVisible();
    await expect(page.getByText(/use "Sign in" above/)).toBeVisible();
  });
});

test.describe("Sumarte en inglés con una cuenta Explorer", () => {
  test.use({ locale: "en-US", rol: "persona", plan: "explorador" });

  test("abrir /pactos por dirección lleva a Sumarte con el aviso en inglés", async ({ page }) => {
    await page.goto("/pactos");
    await expect(page).toHaveURL(/\/sumarte\?volver=%2Fpactos$/);
    await expect(page.getByText("Pacts is unlocked with the Friend plan.")).toBeVisible();
    await expect(page.getByText("Choose a plan to join and we'll take you back to where you were.")).toBeVisible();
    await expect(page.getByText("Your current plan:")).toContainText("Explorer");
  });

  test("elegir Friend guarda el plan, se lee 'Your plan (simulated)' y se puede dar de baja", async ({ page }) => {
    await page.goto("/sumarte?plan=amigo");
    await page.getByRole("button", { name: "Become a Friend" }).click();
    await expect(tarjeta(page, /^Friend/).getByText("Your plan (simulated)")).toBeVisible();
    await page.reload();
    await expect(tarjeta(page, /^Friend/).getByText("Your plan (simulated)")).toBeVisible();
    await expect(page.getByText("Your current plan:")).toContainText("Friend");
    await tarjeta(page, /^Friend/).getByRole("button", { name: "Cancel my plan (simulated)" }).click();
    await expect(page.getByText("Your current plan:")).toContainText("Explorer");
  });

  test("pesos: los montos y la nota del tipo de cambio van en inglés", async ({ page }) => {
    await page.addInitScript(() => {
      if (window.localStorage.getItem("lh-configuracion") === null) {
        window.localStorage.setItem("lh-configuracion", JSON.stringify({ moneda: "ARS" }));
      }
    });
    await page.goto("/sumarte?plan=fundador");
    await expect(page.getByText(/Amounts in Argentine pesos \(ARS\)\./)).toBeVisible();
    await expect(page.getByText(/Sample exchange rate: 1 USD = 1,400 ARS\. This is not a real quote\./)).toBeVisible();
    await expect(tarjeta(page, /^Founder/)).toContainText("ARS 2,100,000 · one-time payment");
  });

  test("Aliados: el pedido de contacto en inglés se guarda siempre en español", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Let's talk" }).click();
    await page.getByRole("button", { name: "Send request (simulated)" }).click();
    await expect(page.getByText("Choose how you'd like us to contact you").last()).toBeVisible();
    await page.getByRole("radio", { name: "Email" }).check();
    await page.getByLabel("Message (optional)").fill("Hello");
    await expect(page.getByText("5 of 500 characters.")).toBeVisible();
    await page.getByRole("button", { name: "Send request (simulated)" }).click();
    await expect(page.getByText("Request received (simulated). It would be seen by: NetX team.")).toBeVisible();
    await expect(page.getByText("Request sent (simulated)")).toBeVisible();
    const guardado = await page.evaluate(() =>
      Object.keys(window.localStorage)
        .filter((k) => k.includes("lh-contactos"))
        .map((k) => window.localStorage.getItem(k))
        .join(""),
    );
    expect(guardado).toContain("Aliados");
  });
});

test.describe("Sumarte en español no cambia de idioma", () => {
  test("el aviso de nivel, los montos y los planes siguen en español", async ({ page }) => {
    await page.goto("/sumarte?plan=fundador");
    await expect(html(page)).toHaveAttribute("lang", "es");
    await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
    await expect(tarjeta(page, /^Fundador/)).toContainText("USD 1.500 · pago único");
    await expect(tarjeta(page, /^Fundador/)).toContainText("Quedan 63 de 100 pases");
  });
});
