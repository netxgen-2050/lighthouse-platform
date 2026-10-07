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
  ...listarTribus().map((t) => `/tribus/${t.id}`),
  "/territorios/lighthouse",
  "/territorios/no-existe",
  "/ruta-que-no-existe",
];

test("hay 21 rutas auditadas", () => {
  expect(rutas).toHaveLength(21);
});

for (const ruta of rutas) {
  test(`axe sin violaciones serias o críticas: ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    if (ruta === "/territorios/lighthouse") {
      // El mapa se arma en el navegador: auditar con los 12 sellos ya puestos.
      await expect(page.locator('[aria-label^="Barrio "][role="link"]')).toHaveCount(12);
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
