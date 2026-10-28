import { expect, test, type Page } from "./fixtura";
import { conIdentidadVerificada } from "./ayudas";
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
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Find your tribe.");
    await expect(page.getByText("Internal prototype · sample data")).toBeVisible();
    for (const camino of ["See the tribes", "Find my tribe", "Congress · Feb 2027"]) {
      await expect(page.getByRole("heading", { level: 3, name: camino })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Explore the Lighthouse" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Choose how to join" })).toBeVisible();
    await expect(page.getByRole("link", { name: /See the tribes/ })).toContainText(/\d+ neighborhoods and the tribes forming them\./);
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("el camino recomendado dice 'Recommended for you'", async ({ page }) => {
    await page.goto("/?camino=congreso");
    await expect(page.getByText("Recommended for you")).toBeVisible();
  });
});

test("?lang=en&utm_source=deck muestra la portada en inglés y guarda el origen", async ({ page }) => {
  await page.goto("/?lang=en&utm_source=deck");
  await expect(page).toHaveURL(/\/\?utm_source=deck$/);
  await expect(html(page)).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Find your tribe.");
  await expect
    .poll(async () => JSON.parse((await page.evaluate(() => window.localStorage.getItem("lh-origen"))) ?? "{}").fuente)
    .toBe("deck");
});

// ===== Sumarte =====

test.describe("Sumarte en inglés", () => {
  test.use({ locale: "en-US", rol: "ninguno" });

  test("encabezado, cuatro planes con sus nombres y montos con coma de miles", async ({ page }) => {
    await page.goto("/sumarte");
    await expect(html(page)).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1, name: "Choose how to join" })).toBeVisible();
    await expect(page.getByText("Internal prototype · sample data")).toBeVisible();
    for (const plan of ["Explorer", "Member of the network", "Founder Pass", "Tribe Plan"]) {
      await expect(page.getByRole("heading", { level: 2, name: new RegExp(`^${plan}`) })).toBeVisible();
    }
    const pase = tarjeta(page, /Founder Pass/);
    await expect(pase).toContainText("USD 1,500 · one-time payment");
    await expect(pase).toContainText("USD 450 in common and stay credits");
    await pase.getByRole("radio", { name: /Root/ }).check({ force: true });
    await expect(pase).toContainText("USD 5,000 · one-time payment");
    await expect(pase.getByRole("button", { name: "I want the Root Pass" })).toBeVisible();
    await expect(page.getByText("142 of 300")).toBeVisible();
    await expect(page.getByText("USD 46,000 of USD 75,000")).toBeVisible();
    await expect(page.getByRole("heading", { name: "What each plan includes" })).toBeVisible();
    await expect(page.locator("tbody tr")).toHaveCount(8);
    await expect(page.getByRole("heading", { name: "For investors" })).toBeVisible();
    await expect(page.getByText("Translated from Spanish")).toHaveCount(0);
  });

  test("facturación mensual y anual", async ({ page }) => {
    await page.goto("/sumarte");
    const miembro = tarjeta(page, /Member of the network/);
    await page.getByRole("button", { name: /^Monthly/ }).click();
    await expect(miembro).toContainText("USD 10/month");
    await page.getByRole("button", { name: /^Yearly/ }).click();
    await expect(miembro).toContainText("USD 100/year");
    await expect(miembro).toContainText("2 months free");
    await expect(tarjeta(page, /Tribe Plan/)).toContainText("2 months free");
  });

  test("el contenido no deja español suelto", async ({ page }) => {
    await page.goto("/sumarte");
    await expect(page.getByRole("heading", { name: "For investors" })).toBeVisible();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("Semillas se escribe 'Semillas (seeds)' la primera vez y sin traducción automática", async ({ page }) => {
    await page.goto("/sumarte");
    const miembro = tarjeta(page, /Member of the network/);
    await expect(miembro.locator('[translate="no"]', { hasText: "Semillas (seeds)" })).toBeVisible();
  });

  test("el ⚖ de 'Founder Pass' se ve en español con 'Only available in Spanish'", async ({ page }) => {
    await page.goto("/sumarte");
    const pase = tarjeta(page, /Founder Pass/);
    await pase.getByRole("button", { name: "What it means legally (only in Spanish): Pase Fundador" }).click();
    await expect(page.getByText("Only available in Spanish").first()).toBeVisible();
  });

  test("el texto con peso legal queda en español marcado hasta idioma-legal", async ({ page }) => {
    await page.goto("/sumarte");
    const pase = tarjeta(page, /Founder Pass/);
    const aviso = pase.locator('[lang="es"]', { hasText: "No es una inversión" });
    await expect(aviso).toBeVisible();
    await expect(pase.getByText("(only available in Spanish)")).toBeAttached();
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
    await expect(page.getByText("Pacts is unlocked with the Member plan.")).toBeVisible();
    await expect(page.getByText("Choose a plan to join and we'll take you back to where you were.")).toBeVisible();
    await expect(page.getByText("Your current plan:")).toContainText("Explorer");
  });

  test("elegir Member guarda el plan y se lee 'Your plan (simulated)'", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Become a member" }).click();
    await expect(tarjeta(page, /Member of the network/).getByText("Your plan (simulated)")).toBeVisible();
    await page.reload();
    await expect(tarjeta(page, /Member of the network/).getByText("Your plan (simulated)")).toBeVisible();
    await expect(page.getByText("Your current plan:")).toContainText("Member");
  });

  test("el Plan Tribu muestra el estado de las tribus en inglés", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Add my tribe" }).click();
    await expect(page.getByRole("group", { name: "Which tribe will you lead?" })).toBeVisible();
    await expect(page.getByText("(Active)").first()).toBeVisible();
    await page.getByRole("radio", { name: /Propose a new tribe/ }).check();
    await expect(page.getByRole("button", { name: "Become leader of this tribe" })).toBeEnabled();
  });

  test("pesos: los montos y la nota del tipo de cambio van en inglés", async ({ page }) => {
    await page.addInitScript(() => {
      if (window.localStorage.getItem("lh-configuracion") === null) {
        window.localStorage.setItem("lh-configuracion", JSON.stringify({ moneda: "ARS" }));
      }
    });
    await page.goto("/sumarte");
    await expect(page.getByText(/Amounts in Argentine pesos \(ARS\)\./)).toBeVisible();
    await expect(page.getByText(/Sample exchange rate: 1 USD = 1,400 ARS\. This is not a real quote\./)).toBeVisible();
    await expect(tarjeta(page, /Founder Pass/)).toContainText("ARS 2,100,000 · one-time payment");
  });

  test("pedir una invitación: formulario, error y confirmación en inglés", async ({ page }) => {
    await conIdentidadVerificada(page);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Request an invitation" }).click();
    await expect(page.getByText("Invitation to the circle · Lote 7")).toBeVisible();
    await page.getByRole("button", { name: "Send request (simulated)" }).click();
    await expect(page.getByText("Choose how you'd like us to contact you").last()).toBeVisible();
    await page.getByRole("radio", { name: "Email" }).check();
    await page.getByLabel("Message (optional)").fill("Hello");
    await expect(page.getByText("5 of 500 characters.")).toBeVisible();
    await page.getByRole("button", { name: "Send request (simulated)" }).click();
    await expect(page.getByText("Request received (simulated). It would be seen by: NetX team.")).toBeVisible();
    await expect(page.getByText("Invitation requested (simulated)")).toBeVisible();
    await expect(page.getByText("23 of 35")).toBeVisible();
  });

  test("sin identidad verificada, el diálogo de verificación se abre en inglés", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Request an invitation" }).click();
    const dialogo = page.getByRole("dialog", { name: /Verify my identity/ });
    await expect(dialogo).toBeVisible();
    expect(await dialogo.evaluate((el) => Boolean(el.closest('[lang="es"]')))).toBe(false);
    await expect(dialogo).toContainText("To request an invitation to invest we first need to verify your identity.");
    // El primer paso sin llenar: el error sale en inglés y el foco va al campo.
    await dialogo.getByRole("button", { name: "Next" }).click();
    await expect(dialogo.getByText("Error: Enter your full name.")).toBeVisible();
    await expect(dialogo.getByLabel("Full name")).toBeFocused();
  });
});

test.describe("Sumarte en español no cambia", () => {
  test("el aviso de nivel, los montos y el pedido siguen en español", async ({ page }) => {
    await page.goto("/sumarte");
    await expect(html(page)).toHaveAttribute("lang", "es");
    await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
    await expect(tarjeta(page, /Pase Fundador/)).toContainText("USD 1.500 · pago único");
    await expect(page.getByText("USD 46.000 de USD 75.000")).toBeVisible();
  });
});
