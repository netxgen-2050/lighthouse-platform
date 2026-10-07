import { expect, test } from "@playwright/test";

test("muestra título, aviso de prototipo, estado y tres pestañas", async ({ page }) => {
  const respuesta = await page.goto("/pactos");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Tus pactos con la tribu" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.getByRole("tab")).toHaveText(["Pacto de tiempo", "Sumarte con plata", "Pacto de convivencia"]);
  await expect(page.getByRole("tab", { name: "Pacto de tiempo" })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("main")).toHaveCount(1);
});

test("cambiar de pestaña", async ({ page }) => {
  await page.goto("/pactos");
  await page.getByRole("tab", { name: "Sumarte con plata" }).click();
  await expect(page.getByRole("tab", { name: "Sumarte con plata" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: "Pacto de tiempo" })).toHaveAttribute("aria-selected", "false");
  await expect(page.getByText("Por ahora no podés sumarte con plata al fideicomiso")).toBeVisible();
  await page.getByRole("tab", { name: "Pacto de convivencia" }).click();
  await expect(page.getByText("Nada de agroquímicos ni semillas transgénicas")).toBeVisible();
});

test("cambiar las horas duplica las semillas y la fórmula sigue visible", async ({ page }) => {
  await page.goto("/pactos");
  const semillas = page.getByTestId("semillas-mes");
  await expect(page.getByText("Compromiso mensual: 10 h/mes")).toBeVisible();
  await expect(semillas).toHaveText("25 semillas");
  await page.getByLabel(/Compromiso mensual/).fill("20");
  await expect(page.getByText("Compromiso mensual: 20 h/mes")).toBeVisible();
  await expect(semillas).toHaveText("50 semillas");
  await expect(page.getByText("horas × valor hora × parte en semilla × evaluación")).toBeVisible();
  await page.getByLabel(/Parte que aportás/).fill("100");
  await expect(semillas).toHaveText("101 semillas");
  await expect(page.getByText("USD 0/mes")).toBeVisible();
});

test("enviar, aceptar y seguir aceptado al recargar", async ({ page }) => {
  await page.goto("/pactos");
  await expect(page.getByText("Pacto aceptado")).toHaveCount(0);
  await page.getByRole("button", { name: "Enviar a la tribu" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "En revisión" })).toHaveAttribute("aria-current", "step");
  await page.getByRole("button", { name: "Simular: la tribu acepta" }).click();
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar a la tribu" })).toHaveCount(0);
});

test("no manda datos a un servidor", async ({ page }) => {
  const pedidos: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") pedidos.push(r.url());
  });
  await page.goto("/pactos");
  await page.getByRole("button", { name: "Enviar a la tribu" }).click();
  await expect(page.getByRole("button", { name: "Simular: la tribu acepta" })).toBeVisible();
  expect(pedidos).toEqual([]);
});
