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
  await expect(page.getByText("Sin dato de tu residencia fiscal")).toBeVisible();
  await page.getByRole("tab", { name: "Pacto de convivencia" }).click();
  await expect(page.getByText("Nada de agroquímicos ni semillas transgénicas")).toBeVisible();
});

test("con residencia en el exterior cargada, sumarse con plata no está disponible", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("lh-pasaporte", JSON.stringify({ residencia: "exterior", paisResidencia: "Noruega" }));
  });
  await page.goto("/pactos");
  await page.getByRole("tab", { name: "Sumarte con plata" }).click();
  await expect(page.getByText("Por ahora no podés sumarte con plata al fideicomiso")).toBeVisible();
  await expect(page.getByText("(Noruega)")).toBeVisible();
});

test("sin personas de ejemplo: no aparecen Lucía ni Lucas ni Oslo", async ({ page }) => {
  await page.goto("/pactos");
  await expect(page.getByText(/Lucía|Lucas|Oslo/)).toHaveCount(0);
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
    // La barra de comentarios de Vercel (vercel.live) solo existe en los previews: no es la app.
    if (r.method() !== "GET" && !new URL(r.url()).hostname.endsWith("vercel.live")) pedidos.push(r.url());
  });
  await page.goto("/pactos");
  await page.getByRole("button", { name: "Enviar a la tribu" }).click();
  await expect(page.getByRole("button", { name: "Simular: la tribu acepta" })).toBeVisible();
  expect(pedidos).toEqual([]);
});

test("pestañas con teclado: flechas, Inicio y Fin", async ({ page }) => {
  await page.goto("/pactos");
  const tiempo = page.getByRole("tab", { name: "Pacto de tiempo" });
  const plata = page.getByRole("tab", { name: "Sumarte con plata" });
  const convivencia = page.getByRole("tab", { name: "Pacto de convivencia" });
  await tiempo.focus();
  await page.keyboard.press("ArrowRight");
  await expect(plata).toHaveAttribute("aria-selected", "true");
  await expect(plata).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(tiempo).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(convivencia).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(tiempo).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await page.keyboard.press("Home");
  await expect(tiempo).toBeFocused();
});

test("si el navegador no guarda, la pantalla responde y avisa", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("sin almacenamiento");
    };
  });
  await page.goto("/pactos");
  await page.getByRole("tab", { name: "Pacto de convivencia" }).click();
  await expect(page.getByRole("tab", { name: "Pacto de convivencia" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("alert").filter({ hasText: "no permite guardar" })).toBeVisible();
});
