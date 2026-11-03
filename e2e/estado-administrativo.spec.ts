import { expect, test, type Page } from "./fixtura";
import { VISTAS_CON_LOTES } from "../lib/legal/vistas-con-lotes";
import { listarLotes } from "../lib/territorios/loteo";

test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

const ficha = (page: Page) => page.getByRole("complementary", { name: "Ficha del territorio" });

// Cada ruta muestra el estado administrativo de cada uno de sus proyectos (`lib/legal/vistas-con-lotes.ts`).
for (const { ruta, proyectos } of VISTAS_CON_LOTES) {
  test(`la vista con lotes ${ruta} muestra el estado administrativo`, async ({ page }) => {
    await page.goto(ruta);
    if (proyectos.includes("soluna")) {
      const aviso = page.getByRole("region", { name: "Estado administrativo · Chacras de Soluna" });
      await expect(aviso, `La ruta ${ruta} muestra lotes pero no tiene el aviso`).toBeVisible();
      await expect(aviso).toContainText("Chacras de Soluna");
      await expect(aviso).toContainText("Loteo en trámite");
      await expect(aviso).toContainText("Ord. 173/2026 de Mainqué");
      await expect(aviso).toContainText("Expediente: sin dato");
      await expect(aviso).toContainText("Aprobación municipal: pendiente");
    }
    if (proyectos.includes("lighthouse-norte")) {
      const aviso = page.getByRole("region", { name: "Estado administrativo · Lighthouse VRN" });
      await expect(aviso, `La ruta ${ruta} muestra lotes pero no tiene el aviso`).toBeVisible();
      await expect(aviso).toContainText("Loteo provisorio");
      await expect(aviso).toContainText("supuesto de trabajo, no otorgada");
    }
  });
}

test("el aviso completo de Lighthouse VRN dice que la aprobación es un supuesto, no otorgada", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  const aviso = page.getByRole("region", { name: "Estado administrativo · Lighthouse VRN" });
  await expect(aviso).toBeVisible();
  await expect(aviso).toContainText("Lighthouse VRN · sector norte");
  await expect(aviso).toContainText("Loteo provisorio");
  await expect(aviso).toContainText("supuesto de trabajo, no otorgada");
  await expect(aviso).not.toContainText(/aprobada/);
});

test("un lote: aviso compacto de Norte con su ⚖", async ({ page }) => {
  await page.goto(`/territorios/lighthouse?sel=${listarLotes()[0].id}`);
  const nota = ficha(page).getByRole("note", { name: "Estado administrativo" });
  await expect(nota).toContainText("Loteo provisorio");
  await expect(nota).toContainText("supuesto de trabajo, no otorgada");
  await expect(nota.getByRole("button", { name: /Qué significa legalmente/ })).toBeVisible();
});

test("el aviso completo está antes del mapa", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  const aviso = (await page.getByRole("region", { name: "Estado administrativo · Chacras de Soluna" }).boundingBox())!;
  const aviso2 = (await page.getByRole("region", { name: "Estado administrativo · Lighthouse VRN" }).boundingBox())!;
  expect(aviso2.y).toBeLessThan(
    (await page.getByRole("region", { name: "Mapa del Macrolote 7" }).boundingBox())!.y,
  );
  const mapa = (await page.getByRole("region", { name: "Mapa del Macrolote 7" }).boundingBox())!;
  expect(aviso.y).toBeLessThan(mapa.y);
});

test("finca 502 disponible: aviso compacto, ⚖ en borrador y sin compra ni reserva", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await page.getByText(/Fincas disponibles de Soluna/).click();
  await page.getByRole("button", { name: "Finca 502", exact: true }).click();
  await expect(ficha(page).getByRole("heading", { name: "Finca 502" })).toBeVisible();
  const nota = ficha(page).getByRole("note", { name: "Estado administrativo" });
  await expect(nota).toContainText("Loteo en trámite · Ord. 173/2026");
  await nota.getByRole("button", { name: /Qué significa legalmente: Estado del loteo/ }).hover();
  const tip = page.getByRole("tooltip").filter({ hasText: "Estado del loteo" });
  await expect(tip).toContainText("Borrador: texto a revisar");
  await expect(page.getByRole("button", { name: /comprar|reservar|señar/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /comprar|reservar|señar/i })).toHaveCount(0);
  await expect(ficha(page).getByRole("button", { name: "Consultar por este lote" })).toBeVisible();
});

test("finca 501 reservada: también muestra el aviso compacto", async ({ page }) => {
  await page.goto("/territorios/lighthouse?sel=finca-501");
  await expect(ficha(page).getByRole("heading", { name: "Finca 501" })).toBeVisible();
  await expect(ficha(page).getByRole("note", { name: "Estado administrativo" })).toContainText(
    "Loteo en trámite · Ord. 173/2026",
  );
});

test("celular 390 px: el aviso se lee entero, sin scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/territorios/lighthouse");
  for (const nombre of ["Estado administrativo · Chacras de Soluna", "Estado administrativo · Lighthouse VRN"]) {
    const aviso = page.getByRole("region", { name: nombre });
    await expect(aviso).toBeVisible();
    const caja = (await aviso.boundingBox())!;
    expect(caja.x + caja.width).toBeLessThanOrEqual(390);
  }
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(sobra).toBeLessThanOrEqual(0);
});
