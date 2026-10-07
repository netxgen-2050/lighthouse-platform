import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { listarTribus } from "@/lib/tribus/datos";

const rutas = [
  "/",
  "/tribus",
  "/compromisos",
  ...listarTribus().map((t) => `/tribus/${t.id}`),
  "/territorios/lighthouse",
  "/territorios/no-existe",
  "/ruta-que-no-existe",
];

test("hay 17 rutas auditadas", () => {
  expect(rutas).toHaveLength(18);
});

for (const ruta of rutas) {
  test(`axe sin violaciones serias o críticas: ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    const r = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  });
}
