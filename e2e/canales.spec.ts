import { expect, test } from "./fixtura";

test("/canales redirige a /pasaporte", async ({ page }) => {
  await page.goto("/canales");
  await expect(page).toHaveURL(/\/pasaporte$/);
  await expect(page.getByRole("heading", { level: 1, name: "Tu pasaporte" })).toBeVisible();
});

test("el enlace de Sumarte lleva al pasaporte, donde el Pase Brote abre el canal de fundadores", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Quiero el Pase Brote" }).click();
  await expect(page.getByText("Pase Brote activo (simulado)")).toBeVisible();
  await page.getByRole("link", { name: "Ver qué te abre cada sello de tu pasaporte" }).click();
  await expect(page).toHaveURL(/\/pasaporte$/);
  const fundador = page.locator('[data-sello="fundador"]');
  await expect(fundador).toContainText("Obtenido");
  await expect(fundador).toContainText("Canal de fundadores");
  await expect(page.locator('[data-sello="miembro-red"]')).toContainText("Obtenido");
});
