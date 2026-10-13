import { expect, test } from "./fixtura";

test("muestra los cinco indicadores, el aviso de prototipo y un solo main", async ({ page }) => {
  const respuesta = await page.goto("/netx");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "¿Vamos a vender en febrero?" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.getByText("Todos los datos de esta vista son de ejemplo.")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  for (const [n, l] of [
    ["412", "perfiles completos"],
    ["3", "tribus activas"],
    ["37", "pactos aceptados"],
    ["USD 1,2 M", "en el espejo de aportes"],
    ["640 h", "horas comprometidas por mes"],
  ]) {
    const item = page.getByRole("listitem").filter({ hasText: l }).filter({ hasText: n });
    await expect(item.first()).toBeVisible();
  }
});

test("el embudo muestra la conversión entre etapas", async ({ page }) => {
  await page.goto("/netx");
  const embudo = page.getByRole("region", { name: /Embudo/ });
  await expect(embudo.getByRole("listitem")).toHaveCount(5);
  const enTribu = embudo.getByRole("listitem").filter({ hasText: "En una tribu" });
  await expect(enTribu).toContainText("186");
  await expect(enTribu).toContainText("45% de la etapa anterior");
});

test("cumplimiento con medidores y ⚖, y tabla de tribus con encabezados", async ({ page }) => {
  await page.goto("/netx");
  await expect(page.getByText("22 / 35 · 63%")).toBeVisible();
  await expect(page.getByRole("button", { name: "Qué significa legalmente: Tierra ribereña" })).toBeVisible();
  const tabla = page.getByRole("table", { name: /Tribus por proyecto/ });
  await expect(tabla.getByRole("columnheader")).toHaveText(["Tribu", "Fincas", "Plata", "Roles", "Ritual"]);
  await expect(tabla.getByRole("row")).toHaveCount(13);
  const fila = tabla.getByRole("row", { name: /Valle Solar/ });
  await expect(fila.getByRole("cell").nth(1)).toHaveText("65%");
});

test("/netx aparece en la barra superior", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner").getByRole("link", { name: /NetX/ })).toHaveAttribute("href", "/netx");
});
