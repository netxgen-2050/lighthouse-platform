import { expect, test, type Page } from "@playwright/test";

async function conPacto(page: Page, horas: number, parteSemilla = 50) {
  await page.goto("/semillas");
  await page.evaluate(
    ([h, p]) => window.localStorage.setItem("lh-pactos", JSON.stringify({ horas: h, parteSemilla: p, paso: 2 })),
    [horas, parteSemilla],
  );
  await page.reload();
}

test("muestra título, aviso de prototipo y un único main", async ({ page }) => {
  const respuesta = await page.goto("/semillas");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Lo que sembraste y lo que te abre" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Semillas" })).toBeVisible();
});

test("sin pacto: Tiempo invita a proponerlo y no muestra número", async ({ page }) => {
  await page.goto("/semillas");
  await expect(page.getByText("Todavía no tenés un pacto aceptado")).toBeVisible();
  await expect(page.getByRole("link", { name: "Proponé un pacto de tiempo" })).toHaveAttribute("href", "/pactos");
  await expect(page.getByTestId("semillas-tiempo")).toHaveCount(0);
  await expect(page.getByTestId("medidor")).toContainText("sin dato");
  await expect(page.getByText("No disponible por residencia fiscal")).toBeVisible();
  await expect(page.getByText("Registrá tu ticket del Congreso")).toBeVisible();
});

test("la escalera muestra los cinco pasos con su estado en texto", async ({ page }) => {
  await page.goto("/semillas");
  const pasos = page.getByRole("listitem").filter({ has: page.locator("p.font-medium") });
  await expect(pasos).toHaveCount(5);
  await expect(page.getByText("Explorador/a")).toBeVisible();
  await expect(page.getByText("Parte del proyecto")).toBeVisible();
  await expect(page.getByText("No disponible hoy")).toBeVisible();
  await expect(page.getByText("Vive afuera")).toBeVisible();
});

test("con un pacto de 20 h/mes aceptado se ve el medidor de 120", async ({ page }) => {
  await conPacto(page, 20);
  await expect(page.getByTestId("semillas-tiempo")).toHaveText("150 semillas");
  await expect(page.getByTestId("medidor")).toHaveText("150 de 120 semillas");
  await expect(page.getByText("Lista", { exact: true })).toBeVisible();
});

test("con un pacto chico el estado es En camino", async ({ page }) => {
  await conPacto(page, 10);
  await expect(page.getByTestId("medidor")).toHaveText("75 de 120 semillas");
  await expect(page.getByText("En camino", { exact: true })).toBeVisible();
});

test("el ticket del Congreso aparece en Presencia", async ({ page }) => {
  await page.goto("/semillas");
  await page.evaluate(() => window.localStorage.setItem("lh-congreso-ticket", "LH27-8F3K-2Q"));
  await page.reload();
  await expect(page.getByText("Ticket registrado")).toBeVisible();
});

test("ronda de reconocimiento: hay que puntuar las cuatro notas y se ve el factor", async ({ page }) => {
  await conPacto(page, 20);
  const enviar = page.getByRole("button", { name: "Enviar ronda" });
  await expect(enviar).toBeDisabled();
  for (const grupo of ["Cumplió su rol, Martina", "Aporte al grupo, Martina", "Cumplió su rol, Joaquín", "Aporte al grupo, Joaquín"]) {
    await page.getByRole("group", { name: grupo }).getByRole("button", { name: "5 de 5" }).click();
  }
  await expect(page.getByText("Puntaje: 5 de 5")).toHaveCount(4);
  await enviar.click();
  await expect(page.getByText("Ronda enviada (simulado)")).toBeVisible();
  await expect(page.getByTestId("factor")).toHaveText("1,67");
  await expect(page.getByTestId("semillas-tiempo")).toHaveText("252 semillas");
  await page.reload();
  await expect(page.getByText("Ronda enviada (simulado)")).toBeVisible();
});

test("las notas se pueden poner con teclado", async ({ page }) => {
  await page.goto("/semillas");
  const tres = page.getByRole("group", { name: "Cumplió su rol, Martina" }).getByRole("button", { name: "3 de 5" });
  await tres.focus();
  await page.keyboard.press("Enter");
  await expect(tres).toHaveAttribute("aria-pressed", "true");
});

test("no manda datos a un servidor", async ({ page }) => {
  const pedidos: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") pedidos.push(r.url());
  });
  await conPacto(page, 20);
  for (const grupo of ["Cumplió su rol, Martina", "Aporte al grupo, Martina", "Cumplió su rol, Joaquín", "Aporte al grupo, Joaquín"]) {
    await page.getByRole("group", { name: grupo }).getByRole("button", { name: "3 de 5" }).click();
  }
  await page.getByRole("button", { name: "Enviar ronda" }).click();
  await expect(page.getByTestId("factor")).toHaveText("1");
  expect(pedidos).toEqual([]);
});
