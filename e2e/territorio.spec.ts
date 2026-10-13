import { expect, test } from "./fixtura";

test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

test("ficha: título, ubicación y superficie", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1, name: "Lighthouse" })).toBeVisible();
  await expect(page.getByText("BioPueblo Mainqué")).toBeVisible();
  await expect(page.getByText("~993 ha", { exact: false }).first()).toBeVisible();
});

test("territorio inexistente: 404 con vuelta", async ({ page }) => {
  const r = await page.goto("/territorios/no-existe");
  expect(r?.status()).toBe(404);
  // Con dynamicParams = false Next muestra la página global de "no encontrado" (ver app/not-found.tsx).
  await expect(page.getByRole("heading", { level: 1, name: /No encontramos/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Volver/ })).toBeVisible();
});

test("el listado completo de tribus ya no está en la página", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(page.getByRole("heading", { name: "Mapa del Macrolote 7" })).toBeVisible();
  await expect(page.locator("main a[href^='/tribus/']:not([href$='/manifiesto'])")).toHaveCount(0);
});

test("barrio 6 por la lista con teclado lleva a Valle Solar", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await page.getByRole("region", { name: "Elegir en el mapa" }).getByRole("button", { name: /^Barrio 6/ }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("link", { name: "Conocer la tribu" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/tribus\/valle$/);
  await expect(page.getByRole("heading", { name: "Valle Solar" })).toBeVisible();
});

test("bienes comunes por nombre", async ({ page }) => {
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
