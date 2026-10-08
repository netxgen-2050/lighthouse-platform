import { expect, test, type Page } from "@playwright/test";

async function conPacto(page: Page, horas: number, paso = 2) {
  await page.goto("/semillas");
  await page.evaluate(
    ([h, p]) =>
      window.localStorage.setItem(
        "lh-pactos",
        JSON.stringify({
          pestana: "tiempo",
          comunidades: { lighthouse: { tiempo: { rol: "facilitacion", rolOtro: "", descripcion: "Facilito", horas: h, paso: p }, aportes: [] } },
        }),
      ),
    [horas, paso],
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
  await expect(page.getByText("Todavía no tenés un pacto de tiempo aceptado")).toBeVisible();
  await expect(page.getByRole("link", { name: "Proponé un pacto de tiempo" })).toHaveAttribute("href", "/pactos");
  await expect(page.getByTestId("semillas-tiempo")).toHaveCount(0);
  await expect(page.getByTestId("medidor")).toContainText("sin dato");
  await expect(page.getByText("Sin dato de tu residencia fiscal")).toBeVisible();
  await expect(page.getByText("Registrá tu ticket del Congreso")).toBeVisible();
});

test("sin personas de ejemplo: no aparecen Lucía ni Lucas", async ({ page }) => {
  await page.goto("/semillas");
  await expect(page.getByText(/Lucía|Lucas/)).toHaveCount(0);
});

test("con residencia en el exterior cargada, la plata no está disponible", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("lh-pasaporte", JSON.stringify({ residencia: "exterior" }));
  });
  await page.goto("/semillas");
  await expect(page.getByText("No disponible por residencia fiscal")).toBeVisible();
  await expect(page.getByText("No disponible hoy")).toBeVisible();
  await expect(page.getByText("Vive afuera")).toBeVisible();
});

test("la escalera muestra los cinco pasos con su estado en texto", async ({ page }) => {
  await page.goto("/semillas");
  const pasos = page.getByRole("listitem").filter({ has: page.locator("p.font-medium") });
  await expect(pasos).toHaveCount(5);
  await expect(page.getByText("Explorador/a")).toBeVisible();
  await expect(page.getByText("Parte del proyecto")).toBeVisible();
});

test("con un pacto de 20 h/mes aceptado se ve el medidor de 120", async ({ page }) => {
  await conPacto(page, 20);
  await expect(page.getByTestId("semillas-tiempo")).toHaveText("303 semillas");
  await expect(page.getByTestId("medidor")).toHaveText("303 de 120 semillas");
  await expect(page.getByText("Lista", { exact: true })).toBeVisible();
});

test("con un pacto chico el estado es En camino", async ({ page }) => {
  await conPacto(page, 4);
  await expect(page.getByTestId("medidor")).toHaveText("60 de 120 semillas");
  await expect(page.getByText("En camino", { exact: true })).toBeVisible();
});

test("el ticket del Congreso aparece en Presencia", async ({ page }) => {
  await page.goto("/semillas");
  await page.evaluate(() => window.localStorage.setItem("lh-congreso-ticket", "LH27-8F3K-2Q"));
  await page.reload();
  await expect(page.getByText("Ticket registrado")).toBeVisible();
});

test("un ticket inválido no cuenta y el Pase se nombra como en /sumarte", async ({ page }) => {
  await page.goto("/semillas");
  await page.evaluate(() => {
    window.localStorage.setItem("lh-congreso-ticket", "1234");
    window.localStorage.setItem("lh-sumarte", JSON.stringify({ pase: "raiz" }));
  });
  await page.reload();
  await expect(page.getByText("Ticket registrado")).toHaveCount(0);
  await expect(page.getByText("Pase Fundador Raíz activo")).toBeVisible();
});

test("con un Pase activo, la frase 'un servicio que no suma semillas' lleva el ⚖ de Pase Fundador", async ({ page }) => {
  await page.goto("/semillas");
  await page.evaluate(() => window.localStorage.setItem("lh-sumarte", JSON.stringify({ pase: "brote" })));
  await page.reload();
  const plata = page.locator("div").filter({ has: page.getByText("Plata", { exact: true }) }).last();
  await expect(plata).toContainText("un servicio que no suma semillas");
  const boton = plata.getByRole("button", { name: "Qué significa legalmente: Pase Fundador" });
  await expect(boton).toBeVisible();
  await boton.focus();
  await expect(page.getByRole("tooltip")).toContainText("Pase Fundador");
});

test("un pacto enviado pero no aceptado no suma semillas de tiempo", async ({ page }) => {
  await conPacto(page, 20, 1);
  await expect(page.getByRole("link", { name: "Proponé un pacto de tiempo" })).toBeVisible();
  await expect(page.getByTestId("semillas-tiempo")).toHaveCount(0);
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
  await expect(page.getByTestId("factor")).toHaveText("1,0");
  await expect(page.getByTestId("semillas-tiempo")).toHaveText("303 semillas");
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
  await page.goto("/semillas");
  const origenApp = new URL(page.url()).origin;
  const pedidos: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    // vercel.live es la barra de comentarios que Vercel inyecta en los previews, no la app.
    if (u.hostname === "vercel.live") return;
    // Cuentan los envíos (no GET) y cualquier pedido a otro origen distinto de la app.
    // Los GET al propio origen (navegación, recarga, prefetch de Next) no mandan datos.
    if (r.method() !== "GET" || u.origin !== origenApp) pedidos.push(`${r.method()} ${r.url()}`);
  });
  await conPacto(page, 20);
  for (const grupo of ["Cumplió su rol, Martina", "Aporte al grupo, Martina", "Cumplió su rol, Joaquín", "Aporte al grupo, Joaquín"]) {
    await page.getByRole("group", { name: grupo }).getByRole("button", { name: "3 de 5" }).click();
  }
  await page.getByRole("button", { name: "Enviar ronda" }).click();
  await expect(page.getByTestId("factor")).toHaveText("1,0");
  expect(pedidos).toEqual([]);
});
