import { expect, test } from "@playwright/test";

test("ficha: título, ubicación y superficie", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1, name: "Lighthouse" })).toBeVisible();
  await expect(page.getByText("BioPueblo Mainqué")).toBeVisible();
  await expect(page.getByText("~1.000 ha (ilustrativa)")).toBeVisible();
});

test("territorio inexistente: 404 con vuelta", async ({ page }) => {
  const r = await page.goto("/territorios/no-existe");
  expect(r?.status()).toBe(404);
  // Con dynamicParams = false Next muestra la página global de "no encontrado" (ver app/not-found.tsx).
  await expect(page.getByRole("heading", { level: 1, name: /No encontramos/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Volver/ })).toBeVisible();
});

test("resumen suma 12 y coincide con la lista", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  const valor = async (etiqueta: string) =>
    Number(await page.locator("dl > div", { hasText: etiqueta }).locator("dd").innerText());
  const activas = await valor("Activas");
  const formacion = await valor("En formación");
  const vacantes = await valor("Vacantes");
  expect(activas + formacion + vacantes).toBe(12);
  const items = page.locator("main ul > li > a");
  await expect(items).toHaveCount(12);
  await expect(items.filter({ hasText: "Estado: Activa" })).toHaveCount(activas);
  await expect(items.filter({ hasText: "Estado: En formación" })).toHaveCount(formacion);
  await expect(items.filter({ hasText: "Estado: Busca tribu" })).toHaveCount(vacantes);
});

test("barrio 6 lleva a Valle Solar con teclado", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  const barrio6 = page.locator("main ul > li > a", { hasText: "Barrio 6" });
  await barrio6.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/tribus\/valle$/);
  await expect(page.getByRole("heading", { name: "Valle Solar" })).toBeVisible();
});

test("bienes comunes por nombre, sin plata ni lotes", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(page.getByRole("heading", { name: "Bienes comunes" })).toBeVisible();
  for (const n of [
    "Agua: toma, cisterna y riego",
    "Energía: parque solar comunitario",
    "Núcleo común: bioquincho y cocina",
    "Vivero y banco de semillas",
  ]) {
    await expect(page.getByText(n)).toBeVisible();
  }
  const texto = await page.locator("body").innerText();
  expect(texto).not.toMatch(/USD/);
  expect(texto).not.toMatch(/\$/);
  expect(texto).not.toMatch(/\d+\s?h\b/);
  const bajo = texto.toLowerCase();
  for (const p of ["lote", "parcela", "reservar", "comprar"]) {
    expect(bajo).not.toContain(p);
  }
  await expect(page.getByRole("progressbar")).toHaveCount(0);
});

test("aviso de ejemplo y un solo main", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(page.getByText("Tribus, personas y cifras de ejemplo.")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
});

test("navegación: Territorio desde la portada", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Territorio" }).click();
  await expect(page).toHaveURL(/\/territorios\/lighthouse$/);
  await expect(
    page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Territorio" }),
  ).toHaveAttribute("aria-current", "page");
});
