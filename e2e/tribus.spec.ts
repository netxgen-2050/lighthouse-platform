import { expect, test } from "@playwright/test";
import { listarTribus } from "@/lib/tribus/datos";

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

// Comportamiento actual (la decisión de si debe ser así queda para Gus):
// con el panel abierto, Tab a otro control y Escape cierra el panel y el foco vuelve al ⚖.
test("el ⚖ abierto: Tab a otro control y Escape lo cierra y devuelve el foco al ⚖", async ({ page }) => {
  await page.goto("/tribus/valle");
  const boton = page.getByRole("button", { name: "Qué significa legalmente: Ritual de entrada" });
  await boton.click();
  await expect(page.getByRole("dialog", { name: "Ritual de entrada" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(boton).not.toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(boton).toBeFocused();
});

test("abrir un ⚖ cierra el anterior y Escape devuelve el foco al ⚖ en uso", async ({ page }) => {
  await page.goto("/tribus/valle");
  const ritual = page.getByRole("button", { name: "Qué significa legalmente: Ritual de entrada" });
  const personeria = page.getByRole("button", { name: "Qué significa legalmente: Comunidad con personería" });
  await ritual.click();
  await expect(page.getByRole("dialog", { name: "Ritual de entrada" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(personeria).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(page.getByRole("dialog", { name: "Comunidad con personería" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(personeria).toBeFocused();
});

test("el ⚖ cierra con un clic afuera", async ({ page }) => {
  await page.goto("/tribus/valle");
  await page.getByRole("button", { name: "Qué significa legalmente: Ritual de entrada" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("heading", { name: "Valle Solar" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("el ⚖ se alcanza con Tab y abre con Enter y con Space", async ({ page }) => {
  await page.goto("/tribus/valle");
  const boton = page.getByRole("button", { name: "Qué significa legalmente: Ritual de entrada" });
  let llego = false;
  for (let i = 0; i < 60 && !llego; i++) {
    await page.keyboard.press("Tab");
    llego = await boton.evaluate((el) => el === document.activeElement);
  }
  expect(llego).toBe(true);
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Ritual de entrada" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.keyboard.press("Space");
  await expect(page.getByRole("dialog", { name: "Ritual de entrada" })).toBeVisible();
});

test("sin plata ni avales en pantalla (listado y las 12 tribus)", async ({ page }) => {
  const rutas = ["/tribus", ...listarTribus().map((t) => `/tribus/${t.id}`)];
  expect(rutas).toHaveLength(13);
  for (const ruta of rutas) {
    await page.goto(ruta);
    const texto = await page.locator("body").innerText();
    expect(texto, ruta).not.toMatch(/USD/);
    expect(texto.toLowerCase(), ruta).not.toContain("avales");
  }
});
