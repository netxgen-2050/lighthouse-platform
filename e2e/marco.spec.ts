import { expect, test } from "@playwright/test";

test("navegar de la portada a Tribus marca aria-current", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "Tribus" }).click();
  await expect(page).toHaveURL(/\/tribus$/);
  await expect(nav.getByRole("link", { name: "Tribus" })).toHaveAttribute("aria-current", "page");
});

test("en una tribu, Tribus sigue marcado", async ({ page }) => {
  await page.goto("/tribus/valle");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Tribus" })).toHaveAttribute("aria-current", "page");
});

test("encabezado con la marca", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner")).toContainText("NetX");
  await expect(page.getByRole("banner")).toContainText("Tribus · Territorios regenerativos");
});

test("saltar al contenido es el primer foco y mueve el foco al main", async ({ page }) => {
  await page.goto("/tribus");
  await page.keyboard.press("Tab");
  const salto = page.getByRole("link", { name: "Saltar al contenido" });
  await expect(salto).toBeFocused();
  await expect(salto).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
});

for (const ruta of ["/", "/tribus", "/tribus/grano"]) {
  test(`pie visible en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    const pie = page.getByRole("contentinfo");
    await expect(pie).toContainText("Prototipo en desarrollo. Datos de ejemplo.");
    await expect(pie).toContainText(String(new Date().getFullYear()));
  });
}

test("portada con titular y botón a /tribus", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Encontrá tu tribu\.\s*Construí en común\./);
  await page.getByRole("link", { name: "Ver las tribus" }).click();
  await expect(page).toHaveURL(/\/tribus$/);
});
