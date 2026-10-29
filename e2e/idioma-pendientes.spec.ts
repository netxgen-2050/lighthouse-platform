import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";
import { textosEnEspanol } from "./ayudas-idioma";
import { sembrarRespuestaDeLaTribu } from "./ayudas";

// idioma-pendientes: consultas del Fogón y cambios a un pacto con la plataforma en inglés.

const miReparto = (page: Page) => page.getByRole("region", { name: "My split" });

async function axeSinGraves(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}

test.describe("Consultas del Fogón en inglés", () => {
  test.use({ locale: "en-US" });

  test("la lista sale en inglés, sin el aviso de página sin traducir, y pasa axe", async ({ page }) => {
    await page.goto("/fogon");
    await page.getByRole("link", { name: "See the consultations" }).click();
    await expect(page).toHaveURL(/\/fogon\/consultas$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1, name: "Consultations" })).toBeVisible();
    await expect(page.getByText("This page is only available in Spanish for now.")).toHaveCount(0);
    await expect(page.getByText("Internal prototype · sample data")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(4);
    const u1 = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "What does the Lighthouse optimize for?" }) });
    await expect(u1).toBeVisible();
    await expect(u1.getByText("Translated from Spanish")).toBeVisible();
    await expect(u1).toContainText("Priorities");
    await expect(u1).toContainText("Team");
    await expect(u1).toContainText("Open vote");
    await expect(u1).toContainText("Closes on November 15, 2026");
    await expect(u1).toContainText("5 of 7 people have already split their credits");
    const u3 = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Uses of the 120 ha cone (phase 1)" }) });
    await expect(u3).toContainText("Secret vote");
    expect(await textosEnEspanol(page, "main")).toEqual([]);
    await axeSinGraves(page);
  });

  test("una consulta abierta: votar, créditos, aviso de voto abierto y guardar, todo en inglés", async ({ page }) => {
    await page.goto("/fogon/consultas/u1");
    await expect(page.getByRole("heading", { level: 1, name: "What does the Lighthouse optimize for?" })).toBeVisible();
    await expect(miReparto(page)).toBeVisible();
    await expect(page.getByText("The whole roll will see your split")).toBeVisible();
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Add a vote to Ecological regeneration" }).click();
    await expect(page.getByText("You have 91 of 100 credits left")).toBeVisible();
    await expect(miReparto(page).getByText("Unused · 91 %")).toBeVisible();
    await expect(page.getByRole("status")).toContainText("Ecological regeneration: 3 votes, 9 credits. You have 91 left.");
    await page.getByRole("button", { name: "Save my split" }).click();
    await expect(page.getByRole("status")).toContainText("Your split was saved (simulated).");
    await expect(miReparto(page)).toContainText("✓ Saved");
    await expect(miReparto(page)).not.toContainText("Unsaved");
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("al cerrar, el resultado, la dona y el acta salen en inglés, con la tabla y pasan axe", async ({ page }) => {
    await page.goto("/fogon/consultas/u1");
    await page.getByRole("button", { name: "Simulate the closing" }).click();
    await expect(page.getByText("Consultation closed (simulated).")).toBeAttached();
    const resultado = page.getByRole("region", { name: "Group result" });
    await expect(resultado).toBeVisible();
    await expect(resultado.locator("figcaption", { hasText: "Group votes" })).toBeVisible();
    await resultado.getByText("View as table").click();
    await expect(resultado.getByRole("columnheader", { name: "Value" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Minutes (sample)" })).toContainText("Ecological regeneration");
    await expect(page.getByRole("heading", { name: "Who split how" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Sample person 1" })).toHaveCount(0);
    await expect(page.getByRole("rowheader", { name: "Sample person 1" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Did not split" })).toBeVisible();
    const acta = page.getByRole("region", { name: "Minutes (sample)" });
    await expect(acta).toContainText(
      "The result is advisory: it does not replace the decisions reserved by the contract or the statute.",
    );
    await expect(acta).not.toContainText("El resultado es consultivo");
    await acta.getByRole("button", { name: /What it means legally: Advisory result/ }).click();
    await expect(acta).toContainText("Draft: text under review");
    await expect(acta).toContainText("guides a decision");
    await expect(acta).not.toContainText("orienta una decisión");
    expect(await textosEnEspanol(page, "main")).toEqual([]);
    await axeSinGraves(page);
  });

  test("modo presupuesto (U4): monto, sugerencia del equipo y monto del resultado salen en inglés", async ({ page }) => {
    await page.goto("/fogon/consultas/u4");
    await expect(page.getByText("Amount to split: USD 20,000")).toBeVisible();
    await expect(page.getByText("Team suggestion: Franz decides")).toBeVisible();
    await page.getByRole("button", { name: "Simulate the closing" }).click();
    const resultado = page.getByRole("region", { name: "Group result" });
    await expect(resultado).toBeVisible();
    await expect(resultado).toContainText("Amount: USD 5,555.56");
    await expect(page.getByRole("region", { name: "Minutes (sample)" })).toContainText("Native plant nursery");
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

});

test.describe("Consultas del Fogón en español", () => {
  test("nada cambia: título, estados y acción", async ({ page }) => {
    await page.goto("/fogon/consultas/u1");
    await expect(page.getByRole("heading", { level: 1, name: "¿Para qué optimiza el Lighthouse?" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Guardar mi reparto" })).toBeVisible();
    await expect(page.getByText("Traducido del inglés")).toHaveCount(0);
  });
});

/** Un pacto de tiempo aceptado (versión 1, con fecha) antes de abrir la página. Solo la primera vez, así recargar no lo pisa. */
async function conPactoAceptado(page: Page) {
  await page.addInitScript(() => {
    if (window.localStorage.getItem("lh-membresia")) return;
    window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro" }));
    const v = { rol: "facilitacion", rolOtro: "", descripcion: "Facilito reuniones", horas: 10 };
    const tiempo = { ...v, paso: 2, version: 1, historial: [{ ...v, version: 1, aceptado: "2026-10-16T10:00:00.000Z" }] };
    window.localStorage.setItem("lh-pactos", JSON.stringify({ pestana: "tiempo", comunidades: { lighthouse: { tiempo, aportes: [] } } }));
  });
}

test.describe("Cambios a un pacto en inglés", () => {
  test.use({ locale: "en-US" });

  test("cambio rechazado: se ve y se anuncia en inglés, sigue la versión vigente y queda en Mi recorrido", async ({ page }) => {
    await conPactoAceptado(page);
    await page.goto("/pactos");
    await page.getByRole("button", { name: "Propose a change" }).click();
    await page.getByLabel(/Proposed monthly commitment/).fill("30");
    await page.getByRole("button", { name: "Send change to the community" }).click();
    await expect(page.getByTestId("esperando-respuesta-cambio")).toHaveText("Waiting for the answer from Lighthouse");
    await sembrarRespuestaDeLaTribu(page, "no-acepta", "Not for now");
    // Es un cambio a un pacto ya aceptado: el aviso es el del cambio (no el del pacto nuevo) y lleva el motivo de la comunidad.
    const frase = /did not accept the change to your pact: Not for now/;
    // Una copia es visible y otra va a la región viva (que se anuncia).
    await expect(page.getByText(frase)).toHaveCount(2);
    await expect(page.getByRole("status").filter({ hasText: frase })).toHaveCount(1);
    await expect(page.getByTestId("version-pacto")).toHaveText("Version 1");
    await expect(page.getByRole("button", { name: "Propose a change" })).toBeVisible();
    await page.goto("/panel");
    await expect(page.getByText(/did not accept the change to your pact/)).toBeVisible();
    await expect(page.getByText(/no aceptó el cambio/)).toHaveCount(0);
  });

  test("historial: etiquetas de versión, horas y fecha en inglés", async ({ page }) => {
    await conPactoAceptado(page);
    await page.goto("/pactos");
    await page.getByRole("button", { name: "Propose a change" }).click();
    await page.getByLabel(/Proposed monthly commitment/).fill("20");
    await page.getByRole("button", { name: "Send change to the community" }).click();
    await sembrarRespuestaDeLaTribu(page, "acepta");
    await expect(page.getByTestId("version-pacto")).toHaveText("Version 2");
    await page.getByText(/Version history \(2\)/).click();
    const versiones = page.getByRole("list", { name: "Accepted versions" }).getByRole("listitem");
    await expect(versiones).toHaveCount(2);
    await expect(versiones.nth(0)).toContainText("Version 2");
    await expect(versiones.nth(0)).toContainText("20 h/month");
    await expect(versiones.nth(1)).toContainText("Version 1");
    await expect(versiones.nth(1)).toContainText("10 h/month");
    await expect(versiones.nth(1)).toContainText("October 16, 2026");
    await expect(page.getByText("date: no data")).toHaveCount(0);
    await page.goto("/panel");
    await expect(page.getByText(/accepted the change to your pact/)).toBeVisible();
  });
});
