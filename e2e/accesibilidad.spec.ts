import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { listarTribus } from "@/lib/tribus/datos";

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
  "/bandeja",
  ...listarTribus().map((t) => `/tribus/${t.id}`),
  "/territorios/lighthouse",
  "/territorios/no-existe",
  "/ruta-que-no-existe",
];

test("hay 26 rutas auditadas", () => {
  expect(rutas).toHaveLength(26);
});

test("axe sin violaciones serias o críticas: /pasaporte con datos cargados", async ({ page }) => {
  await page.goto("/pasaporte");
  await page.getByRole("group", { name: "Nacionalidad" }).getByLabel("Otra").check();
  await page.getByLabel("País de nacionalidad").fill("Noruega");
  await page.getByLabel("Exterior").check();
  await page.getByLabel("Remoto").check();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
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
