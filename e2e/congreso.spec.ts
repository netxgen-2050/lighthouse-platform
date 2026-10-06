import { expect, test } from "@playwright/test";

test("agenda de 5 días en orden, con ⚖ de obra en el día 3", async ({ page }) => {
  await page.goto("/congreso");
  await expect(page.getByRole("heading", { name: "Congreso · Febrero 2027" })).toBeVisible();
  const dias = page.locator("ol > li");
  await expect(dias).toHaveCount(5);
  for (let i = 0; i < 5; i++) await expect(dias.nth(i)).toContainText(`Día ${i + 1}`);
  await expect(dias.nth(0)).toContainText("Llegada y visita al Lighthouse");
  await expect(dias.nth(2)).toContainText("Minga: primera jornada de obra");
  await expect(dias.nth(4)).toContainText("Fogón de cierre");
  await expect(dias.nth(2).getByRole("button", { name: "Qué significa legalmente: Horas de obra" })).toBeVisible();
});

test("sin montos ni USD", async ({ page }) => {
  await page.goto("/congreso");
  const texto = await page.locator("main").innerText();
  expect(texto).not.toMatch(/USD/i);
  expect(texto).not.toMatch(/[$€]/);
});

test("código válido se registra y sobrevive a la recarga; se puede quitar", async ({ page }) => {
  await page.goto("/congreso");
  await expect(page.getByText("Modo demostración: el registro queda solo en este navegador.")).toBeVisible();
  await page.getByLabel(/Código de tu ticket/).fill("lh27-8f3k-2q");
  await page.getByRole("button", { name: "Registrar" }).click();
  await expect(page.getByText("Ticket LH27-8F3K-2Q registrado")).toBeVisible();
  await expect(page.getByText("Genesis pendiente")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Ticket LH27-8F3K-2Q registrado")).toBeVisible();
  await page.getByRole("button", { name: "Quitar ticket" }).click();
  await expect(page.getByLabel(/Código de tu ticket/)).toHaveValue("");
});

test("código inválido muestra error asociado al campo y no guarda", async ({ page }) => {
  await page.goto("/congreso");
  const campo = page.getByLabel(/Código de tu ticket/);
  await campo.fill("1234");
  await page.getByRole("button", { name: "Registrar" }).click();
  const id = await campo.getAttribute("aria-describedby");
  expect(id).toBeTruthy();
  await expect(page.locator(`#${id}`)).toContainText("formato");
  expect(await page.evaluate(() => window.localStorage.length)).toBe(0);
});
