import { expect, test, type Page } from "@playwright/test";

const camino = (page: Page, id: string) => page.locator(`[data-camino="${id}"]`);

async function cargarArgentino(page: Page) {
  await page.getByLabel("Argentina").first().check();
  await page.getByRole("group", { name: /Residencia fiscal/ }).getByLabel("Argentina").check();
  await page.getByRole("radio", { name: "No calificado" }).check();
  await page.getByLabel("Obra presencial").check();
  await page.getByLabel("Horas por mes").fill("60");
}

async function cargarNoruega(page: Page) {
  await page.getByRole("group", { name: "Nacionalidad" }).getByLabel("Otra").check();
  await page.getByLabel("País de nacionalidad").fill("Noruega");
  await page.getByLabel("Exterior").check();
  await page.getByLabel("País de residencia fiscal").fill("Noruega");
  await page.getByRole("radio", { name: "No calificado" }).check();
  await page.getByLabel("Remoto").check();
}

test("sin datos: formulario vacío y caminos que piden completar", async ({ page }) => {
  const r = await page.goto("/pasaporte");
  expect(r?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Tu pasaporte para sumarte" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("[data-camino]")).toHaveCount(5);
  for (const id of ["sumarte", "chacra", "aporte"]) {
    await expect(camino(page, id)).toContainText("Completá tus datos");
  }
});

test("residente argentino en obra", async ({ page }) => {
  await page.goto("/pasaporte");
  await cargarArgentino(page);
  await expect(camino(page, "sumarte")).toContainText("Abierto");
  await expect(camino(page, "sumarte")).toContainText("15 lugares para inversores no calificados");
  await expect(camino(page, "sumarte")).toContainText("quedan 4");
  await expect(camino(page, "chacra")).toContainText("Abierto");
  await expect(camino(page, "aporte")).toContainText("Horas de obra");
  await expect(camino(page, "aporte")).toContainText("60 h/mes");
});

test("residente en el exterior y remoto, y ⚖ de tierra ribereña con teclado", async ({ page }) => {
  await page.goto("/pasaporte");
  await cargarNoruega(page);
  await expect(camino(page, "sumarte")).toContainText("Por ahora, no");
  await expect(camino(page, "sumarte")).toContainText("residencia fiscal es del exterior");
  await expect(camino(page, "chacra")).toContainText("Con condiciones");
  await expect(camino(page, "aporte")).toContainText("Aporte remoto");
  // Se llega con Tab desde el ⚖ anterior (el foco por código no cuenta como teclado).
  await camino(page, "chacra").getByRole("button").first().focus();
  await page.keyboard.press("Tab");
  await expect(camino(page, "chacra").getByRole("button", { name: /Tierra ribereña/ })).toBeFocused();
  await expect(page.getByRole("tooltip")).toContainText("Tierra ribereña");
  await expect(page.getByRole("tooltip")).toContainText("Ley 26.737");
});

test("cambio en vivo y datos que sobreviven a recargar", async ({ page }) => {
  await page.goto("/pasaporte");
  await cargarNoruega(page);
  await expect(camino(page, "sumarte")).toContainText("Por ahora, no");
  await page.getByRole("group", { name: /Residencia fiscal/ }).getByLabel("Argentina").check();
  await expect(camino(page, "sumarte")).toContainText("Abierto");
  await page.reload();
  await expect(page.getByLabel("País de nacionalidad")).toHaveValue("Noruega");
  await expect(camino(page, "sumarte")).toContainText("Abierto");
  await expect(camino(page, "aporte")).toContainText("Aporte remoto");
});

test("horas fuera de rango: mensaje, aria-invalid y se repite al recargar", async ({ page }) => {
  await page.goto("/pasaporte");
  await page.getByLabel("Obra presencial").check();
  const horas = page.getByLabel("Horas por mes");
  await horas.fill("800");
  await expect(page.getByText(/Ingresá un número de horas entre 0 y/)).toBeVisible();
  await expect(horas).toHaveAttribute("aria-invalid", "true");
  await page.reload();
  await expect(page.getByLabel("Horas por mes")).toHaveValue("800");
  await expect(page.getByText(/Ingresá un número de horas entre 0 y/)).toBeVisible();
  await page.getByLabel("Horas por mes").fill("60");
  await expect(page.getByText(/Ingresá un número de horas entre 0 y/)).toHaveCount(0);
  await expect(page.getByLabel("Horas por mes")).toHaveAttribute("aria-invalid", "false");
});

test("al volver a Argentina se borra el país escrito", async ({ page }) => {
  await page.goto("/pasaporte");
  await cargarNoruega(page);
  await page.getByRole("group", { name: "Nacionalidad" }).getByLabel("Argentina").check();
  await page.getByRole("group", { name: /Residencia fiscal/ }).getByLabel("Argentina").check();
  await page.reload();
  await page.getByRole("group", { name: "Nacionalidad" }).getByLabel("Otra").check();
  await expect(page.getByLabel("País de nacionalidad")).toHaveValue("");
  await page.getByRole("group", { name: /Residencia fiscal/ }).getByLabel("Exterior").check();
  await expect(page.getByLabel("País de residencia fiscal")).toHaveValue("");
});

test("desde el rail se llega a /pasaporte", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Pasaporte" }).first().click();
  await expect(page).toHaveURL(/\/pasaporte$/);
  await expect(page.getByRole("link", { name: "Pasaporte" }).first()).toHaveAttribute("aria-current", "page");
});
