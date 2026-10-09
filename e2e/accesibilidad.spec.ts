import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { listarTribus } from "@/lib/tribus/datos";
import { conIdentidadVerificada } from "./ayudas";

const rutas = [
  "/",
  "/tribus",
  "/compromisos",
  "/panel",
  "/pactos",
  "/semillas",
  "/canales",
  "/fogon",
  "/netx",
  "/pasaporte",
  ...listarTribus().map((t) => `/tribus/${t.id}`),
  "/territorios/lighthouse",
  "/territorios/no-existe",
  "/ruta-que-no-existe",
];

test("hay 25 rutas auditadas", () => {
  expect(rutas).toHaveLength(25);
});

async function graves(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return r.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }));
}

test("axe sin violaciones serias o críticas: /pasaporte con sellos obtenidos, en trámite y modalidad cargada", async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem("lh-membresia")) return;
    window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro", valle: "pedido" }));
    window.localStorage.setItem("lh-sumarte", JSON.stringify({ plan: "miembro", pase: "brote", nivelPase: "brote" }));
    window.localStorage.setItem("lh-kyc", JSON.stringify({ estado: "en-tramite", enviado: "2026-10-09T12:00:00.000Z" }));
  });
  await page.goto("/pasaporte");
  await page.getByLabel("Obra presencial").check();
  expect(await graves(page)).toEqual([]);
});

test("axe sin violaciones serias o críticas: el diálogo de verificación en cada paso, con errores a la vista", async ({ page }) => {
  await page.goto("/pasaporte");
  await page.locator('[data-sello="identidad"]').getByRole("button", { name: "Verificar mi identidad" }).click();
  const dialogo = page.getByRole("dialog", { name: /Verificar mi identidad/ });
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  await expect(dialogo.getByText("Error: Escribí tu nombre completo.")).toBeVisible();
  expect(await graves(page)).toEqual([]);
  await dialogo.getByLabel("Nombre completo").fill("Ana Pérez");
  await dialogo.getByLabel("Número de documento").fill("30123456");
  await dialogo.getByLabel("Fecha de nacimiento").fill("1985-03-02");
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  expect(await graves(page)).toEqual([]);
  await dialogo.getByRole("radio", { name: "Otra" }).check();
  await dialogo.getByRole("radio", { name: "Exterior" }).check();
  expect(await graves(page)).toEqual([]);
});

test("axe sin violaciones serias o críticas: /pactos siendo miembro, con las dos pestañas", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro" })));
  await page.goto("/pactos");
  await page.getByLabel(/Rol que asumís/).selectOption({ label: "Otro" });
  for (const pestana of ["Pacto de tiempo", "Sumarte con plata"]) {
    await page.getByRole("tab", { name: pestana }).click();
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
  }
});

test("axe sin violaciones serias o críticas: /semillas con la ronda y sus errores a la vista", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro", valle: "miembro" }));
    const tiempo = { rol: "facilitacion", rolOtro: "", descripcion: "Facilito", horas: 20, paso: 2 };
    window.localStorage.setItem("lh-pactos", JSON.stringify({ comunidades: { lighthouse: { tiempo, aportes: [200] } } }));
  });
  await page.goto("/semillas");
  await page.getByRole("button", { name: "Enviar ronda" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "la ronda no se envió" })).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test("axe sin violaciones serias o críticas: /sumarte con el formulario de contacto abierto", async ({ page }) => {
  await conIdentidadVerificada(page);
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Pedir invitación" }).click();
  await expect(page.getByRole("button", { name: "Enviar pedido (simulado)" })).toBeVisible();
  // También con el error de canal a la vista.
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(page.getByText("Elegí cómo preferís que te contactemos").last()).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test("axe sin violaciones serias o críticas: /netx con un pedido en la bandeja", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Pedir una charla" }).click();
  await page.getByRole("radio", { name: "Email" }).check();
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(page.getByText("Charla pedida (simulado)")).toBeVisible();
  await page.goto("/netx");
  await expect(page.getByRole("row").filter({ hasText: "Charla para invertir en NetX" })).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test("axe sin violaciones serias o críticas: /panel/bitacora con entradas", async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
  await page.goto("/territorios/lighthouse");
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("lh-bitacora")))
    .not.toBeNull();
  await page.goto("/panel/bitacora");
  await expect(page.getByRole("row").filter({ hasText: "Estado del loteo" })).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

for (const ruta of rutas) {
  test(`axe sin violaciones serias o críticas: ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    if (ruta === "/territorios/lighthouse") {
      // El mapa se arma en el navegador: auditar con los 12 sellos ya puestos.
      await expect(page.locator('[aria-label^="Barrio "][role="button"]')).toHaveCount(12);
    }
    const r = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  });
}
