import { expect, test, type Page } from "@playwright/test";

const sellos = (page: Page) =>
  page.getByRole("region", { name: "Mapa del Lighthouse" }).getByRole("link", { name: /^Barrio \d+/ });

test("el mapa aparece con los doce barrios", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(page.getByRole("region", { name: "Mapa del Lighthouse" })).toBeVisible();
  await expect(sellos(page)).toHaveCount(12);
  for (let n = 1; n <= 12; n++) {
    await expect(sellos(page).filter({ hasText: /./ }).and(page.locator(`[aria-label^="Barrio ${n} "]`))).toHaveCount(1);
  }
});

test("Tab hasta el barrio 6 y Enter lleva a /tribus/valle", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(sellos(page)).toHaveCount(12);
  const barrio6 = page.locator('[aria-label^="Barrio 6 "]');
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    if (await barrio6.evaluate((el) => el === document.activeElement)) break;
  }
  await expect(barrio6).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/tribus\/valle$/);
});

test("un sello vacante muestra + y dice Busca tribu", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  const vacante = sellos(page).filter({ hasText: "+" }).first();
  await expect(vacante).toBeVisible();
  await expect(vacante).toHaveAttribute("aria-label", /Barrio \d+ · Busca tribu/);
});

test("leyenda, nota y atribución", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  const region = page.getByRole("region", { name: "Mapa del Lighthouse" });
  for (const t of ["Tribu activa", "En formación", "Busca tribu", "Núcleo común"]) {
    await expect(region.getByText(t, { exact: true })).toBeVisible();
  }
  await expect(region.getByText("Ubicación, forma y barrios ilustrativos, a la espera del GIS de ARQVA")).toBeVisible();
  await expect(region.getByText("© colaboradores de OpenStreetMap")).toBeVisible();
});

test("sin lotes ni plata dentro del mapa", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  const region = page.getByRole("region", { name: "Mapa del Lighthouse" });
  await expect(sellos(page)).toHaveCount(12);
  const texto = (await region.innerText()) + (await sellos(page).evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")).join(" ")));
  expect(texto).not.toMatch(/USD|\$/);
  for (const p of ["finca", "lote", "reservar", "comprar"]) {
    expect(texto.toLowerCase()).not.toContain(p);
  }
});

test("sin mapa base los sellos siguen funcionando", async ({ page }) => {
  await page.route("**://tile.openstreetmap.org/**", (r) => r.abort());
  await page.goto("/territorios/lighthouse");
  await expect(sellos(page)).toHaveCount(12);
  await sellos(page).and(page.locator('[aria-label^="Barrio 6 "]')).click();
  await expect(page).toHaveURL(/\/tribus\/valle$/);
});

test("un solo main", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(page.locator("main")).toHaveCount(1);
});
