import { expect, test } from "@playwright/test";

test("listado: 12 tarjetas en orden con estado escrito", async ({ page }) => {
  await page.goto("/tribus");
  const links = page.locator("main ul > li > a");
  await expect(links).toHaveCount(12);
  await expect(links.first()).toContainText("Barrio 1");
  await expect(links.last()).toContainText("Barrio 12");
  await expect(links.first()).toHaveAttribute("href", "/tribus/semilla");
  await expect(page.getByText("Estado: Activa").first()).toBeVisible();
  await expect(page.getByText("Estado: En formación").first()).toBeVisible();
  await expect(page.getByText("Estado: Busca tribu").first()).toBeVisible();
  await expect(page.getByText("Tribus, personas y cifras de ejemplo.")).toBeVisible();
});

test("valle: tribu activa", async ({ page }) => {
  await page.goto("/tribus/valle");
  await expect(page.getByRole("heading", { name: "Valle Solar" })).toBeVisible();
  for (const h of ["Lo que tiene", "Lo que busca", "Lo que aporta al pozo común", "Cómo se entra"]) {
    await expect(page.getByRole("heading", { name: h })).toBeVisible();
  }
  await expect(page.getByText("Asociación civil")).toBeVisible();
});

test("avelan: áreas abiertas marcadas con texto", async ({ page }) => {
  await page.goto("/tribus/avelan");
  for (const a of ["Nutrición", "Energía", "Encuentros"]) {
    await expect(page.getByText(`${a} (abierta)`)).toBeVisible();
  }
  await expect(page.getByText("Educación (abierta)")).toHaveCount(0);
});

test("grano: barrio vacante", async ({ page }) => {
  await page.goto("/tribus/grano");
  await expect(page.getByRole("heading", { name: "Barrio 3 busca tribu" })).toBeVisible();
  for (const n of ["Agricultura extensiva", "Animales", "Molienda"]) {
    await expect(page.getByText(n)).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Lo que tiene" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Lo que aporta al pozo común" })).toHaveCount(0);
});

test("id desconocido: 404 con vuelta al listado", async ({ page }) => {
  const r = await page.goto("/tribus/no-existe");
  expect(r?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Volver a las tribus" })).toHaveAttribute("href", "/tribus");
});

test("el ⚖ se opera con teclado", async ({ page }) => {
  await page.goto("/tribus/valle");
  const boton = page.getByRole("button", { name: "Qué significa legalmente: Ritual de entrada" });
  await boton.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Ritual de entrada" })).toBeVisible();
  await expect(page.getByText("Ley 23.592")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(boton).toBeFocused();
});

test("sin plata ni avales en pantalla", async ({ page }) => {
  for (const ruta of ["/tribus", "/tribus/valle", "/tribus/avelan", "/tribus/grano"]) {
    await page.goto(ruta);
    const texto = await page.locator("body").innerText();
    expect(texto).not.toMatch(/USD/);
    expect(texto.toLowerCase()).not.toContain("avales");
  }
});
