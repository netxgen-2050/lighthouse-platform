import { expect, test, type Page } from "./fixtura";
import { textosEnEspanol } from "./ayudas-idioma";

const html = (page: Page) => page.locator("html");

/** Deja la membresía y un pacto aceptado antes de abrir la página (solo la primera vez, así recargar no los pisa). */
async function conPactoAceptado(page: Page, descripcion = "Facilito reuniones") {
  await page.addInitScript((d) => {
    if (window.localStorage.getItem("lh-membresia")) return;
    window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro" }));
    const v = { rol: "facilitacion", rolOtro: "", descripcion: d, horas: 20 };
    const tiempo = { ...v, paso: 2, version: 1, historial: [{ ...v, version: 1, aceptado: "2026-10-16T10:00:00.000Z" }] };
    window.localStorage.setItem("lh-pactos", JSON.stringify({ pestana: "tiempo", comunidades: { lighthouse: { tiempo, aportes: [200] } } }));
  }, descripcion);
}

test.describe("Pasaporte en inglés", () => {
  test.use({ locale: "en-US", plan: "explorador" });

  test("sellos en inglés, Genesis sin traducir y nada de español suelto", async ({ page }) => {
    await page.goto("/pasaporte");
    await expect(html(page)).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1, name: "Your passport" })).toBeVisible();
    await expect(page.locator('[data-sello="explorador"]')).toContainText("Obtained");
    await expect(page.locator('[data-sello="residente"]')).toContainText("Not available yet");
    await expect(page.locator('[data-sello="fundador"]')).toContainText("Founder Pass");
    await expect(page.locator('[data-sello="genesis"] [translate="no"]', { hasText: "Genesis" })).toBeVisible();
    await expect(page.getByText("This page is only available in Spanish for now.")).toHaveCount(0);
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("el diálogo de verificación muestra el error de la fecha en inglés y lleva el foco al campo", async ({ page }) => {
    await page.goto("/pasaporte");
    await page.getByRole("button", { name: "Complete my verification (KYC)" }).click();
    const dialogo = page.getByRole("dialog", { name: /Verify my identity/ });
    await dialogo.getByLabel("Full name").fill("Ana Perez");
    await dialogo.getByLabel("ID number").fill("30123456");
    await dialogo.getByRole("button", { name: "Next" }).click();
    await expect(dialogo.getByText("Error: Enter your date of birth.")).toBeVisible();
    await expect(dialogo.getByLabel("Date of birth")).toBeFocused();
    expect(await textosEnEspanol(page, "dialog")).toEqual([]);
  });
});

test.describe("Semillas en inglés", () => {
  test.use({ locale: "en-US" });

  test("el nombre no se traduce: Semillas (seeds) la primera vez y el 🌱 en borrador", async ({ page }) => {
    await conPactoAceptado(page);
    await page.goto("/semillas");
    await expect(page).toHaveTitle(/Semillas/);
    await expect(page.getByText(/^Semillas \(seeds\) are not sold/)).toBeVisible();
    await expect(page.getByText("Seeds", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "What it means in the community economy: Semillas" }).first().focus();
    await expect(page.getByRole("tooltip")).toContainText("Draft: text under review");
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("la ronda de reconocimiento y los números van en inglés", async ({ page }) => {
    await conPactoAceptado(page);
    await page.goto("/semillas");
    await expect(page.getByRole("heading", { name: /Recognition round/ })).toBeVisible();
    await page.getByRole("button", { name: "Send round" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Error: the round was not sent." })).toBeVisible();
    await expect(page.getByTestId("factor")).toHaveCount(0);
  });
});

test.describe("Pactos en inglés", () => {
  test.use({ locale: "en-US" });

  test("lo que escribió la persona se muestra tal cual, marcado como español", async ({ page }) => {
    await conPactoAceptado(page, "Facilito reuniones y cuido los acuerdos");
    await page.goto("/pactos");
    await expect(page.getByRole("heading", { level: 1, name: "Your pacts with the community" })).toBeVisible();
    await page.getByText(/Version history/).click();
    const texto = page.getByRole("list", { name: "Accepted versions" }).locator('[lang="es"]', { hasText: "Facilito reuniones y cuido los acuerdos" });
    await expect(texto).toBeVisible();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("el pacto de plata muestra el aporte y la primera mención explica Semillas", async ({ page }) => {
    await conPactoAceptado(page);
    await page.goto("/pactos");
    await expect(page.getByText(/Semillas \(seeds\) belong to each community/)).toBeVisible();
    await page.getByRole("tab", { name: "Join with money" }).click();
    await expect(page.getByText("Recorded in Lighthouse")).toBeVisible();
    await expect(page.getByTestId("semillas-plata")).toContainText("200 Semillas from money (simulated)");
  });
});

test.describe("en español nada cambia", () => {
  test("Pasaporte, Semillas y Pactos conservan sus títulos", async ({ page }) => {
    await page.goto("/pasaporte");
    await expect(page.getByRole("heading", { level: 1, name: "Tu pasaporte" })).toBeVisible();
    await page.goto("/semillas");
    await expect(page.getByRole("heading", { level: 1, name: "Lo que sembraste y lo que te abre" })).toBeVisible();
    await page.goto("/pactos");
    await expect(page.getByRole("heading", { level: 1, name: "Tus pactos con la comunidad" })).toBeVisible();
  });
});
