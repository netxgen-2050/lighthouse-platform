import { expect, test, type Page } from "@playwright/test";

async function comoMiembro(page: Page, comunidades: string[] = ["lighthouse"]) {
  await page.addInitScript((ids) => {
    // Solo la primera vez: así recargar no pisa lo que la pantalla guardó.
    if (window.localStorage.getItem("lh-membresia")) return;
    window.localStorage.setItem("lh-membresia", JSON.stringify(Object.fromEntries(ids.map((id) => [id, "miembro"]))));
  }, comunidades);
}

async function llenarPacto(page: Page) {
  await page.getByLabel(/Rol que asumís/).selectOption({ label: "Facilitación" });
  await page.getByLabel("Tu descripción: qué vas a hacer").fill("Facilito las asambleas");
}

test("sin ser miembro de ninguna comunidad se explica cómo empezar y se enlaza a /tribus", async ({ page }) => {
  const respuesta = await page.goto("/pactos");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Tus pactos con la comunidad" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.getByText("Para proponer un pacto primero tenés que pertenecer a una comunidad")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver las comunidades" })).toHaveAttribute("href", "/tribus");
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.locator("main")).toHaveCount(1);
});

test("un pedido de membresía sin aceptar no alcanza", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "pedido" })));
  await page.goto("/pactos");
  await expect(page.getByText("Para proponer un pacto primero tenés que pertenecer a una comunidad")).toBeVisible();
});

test("siendo miembro: primero la comunidad, dos pestañas y sin pacto de convivencia", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  await expect(page.getByLabel("¿En qué comunidad es el pacto?")).toHaveValue("lighthouse");
  await expect(page.getByRole("tab")).toHaveText(["Pacto de tiempo", "Sumarte con plata"]);
  await expect(page.getByRole("tab", { name: "Pacto de tiempo" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Pacto de convivencia")).toHaveCount(0);
  await expect(page.locator("main")).toHaveCount(1);
});

test("?comunidad elige la comunidad, y una comunidad donde no sos miembro se ignora", async ({ page }) => {
  await comoMiembro(page, ["lighthouse", "semilla"]);
  await page.goto("/pactos?comunidad=semilla");
  await expect(page.getByLabel("¿En qué comunidad es el pacto?")).toHaveValue("semilla");
  await expect(page.getByLabel(/Rol que asumís en Semilla Viva/)).toBeVisible();
  await page.goto("/pactos?comunidad=barda");
  await expect(page.getByLabel("¿En qué comunidad es el pacto?")).toHaveValue("lighthouse");
});

test("elegir un rol muestra su descripción y el campo para la descripción propia", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  await expect(page.getByLabel("Tu descripción: qué vas a hacer")).toHaveCount(0);
  await page.getByLabel(/Rol que asumís/).selectOption({ label: "Facilitación" });
  await expect(page.getByTestId("rol-descripcion")).toContainText("Conduce reuniones");
  await expect(page.getByLabel("Tu descripción: qué vas a hacer")).toBeVisible();
  await page.getByLabel(/Rol que asumís/).selectOption({ label: "Otro" });
  await expect(page.getByLabel("¿Qué rol es?")).toBeVisible();
});

test("las Semillas por mes son horas × valor de referencia y no hay caja ni cobro", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  const semillas = page.getByTestId("semillas-mes");
  await expect(page.getByText("Compromiso mensual: 10 h/mes")).toBeVisible();
  await expect(semillas).toHaveText("50 semillas");
  await page.getByLabel(/Compromiso mensual/).fill("20");
  await expect(page.getByText("Compromiso mensual: 20 h/mes")).toBeVisible();
  await expect(semillas).toHaveText("101 semillas");
  await expect(page.getByText("horas × valor de referencia de la hora")).toBeVisible();
  await expect(page.getByText("referencia, por ahora")).toBeVisible();
  await expect(page.getByText(/caja|cobrás|parte que aportás/i)).toHaveCount(0);
});

test("no se puede enviar sin rol y descripción", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  await expect(page.getByRole("button", { name: "Enviar a la comunidad" })).toBeDisabled();
  await llenarPacto(page);
  await expect(page.getByRole("button", { name: "Enviar a la comunidad" })).toBeEnabled();
});

test("enviar, aceptar y seguir aceptado al recargar", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  await expect(page.getByText("Pacto aceptado")).toHaveCount(0);
  await llenarPacto(page);
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Enviado a la comunidad" })).toHaveAttribute("aria-current", "step");
  await page.getByRole("button", { name: "Simular: la comunidad acepta" }).click();
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Aceptado por quien administra la comunidad" })).toHaveAttribute(
    "aria-current",
    "step",
  );
  await page.reload();
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar a la comunidad" })).toHaveCount(0);
});

test("el pacto aceptado se guarda por comunidad y suma en /semillas", async ({ page }) => {
  await comoMiembro(page, ["lighthouse", "semilla"]);
  await page.goto("/pactos?comunidad=semilla");
  await llenarPacto(page);
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await page.getByRole("button", { name: "Simular: la comunidad acepta" }).click();
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
  await page.getByLabel("¿En qué comunidad es el pacto?").selectOption("lighthouse");
  await expect(page.getByText("Pacto aceptado")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Enviar a la comunidad" })).toBeVisible();
  await page.goto("/semillas");
  await expect(page.getByTestId("semillas-tiempo")).toHaveText("150 semillas");
});

test("sumarte con plata: USD 200 se registran como 200 Semillas de plata, simulado", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  await page.getByRole("tab", { name: "Sumarte con plata" }).click();
  await expect(page.getByRole("tab", { name: "Sumarte con plata" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByLabel("Monto (USD)")).toHaveValue("200");
  await page.getByLabel("Monto (USD)").fill("200");
  await page.getByRole("button", { name: "Registrar aporte (simulado)" }).click();
  await expect(page.getByTestId("semillas-plata")).toHaveText("200 Semillas de plata (simulado)");
  await page.reload();
  await page.getByRole("tab", { name: "Sumarte con plata" }).click();
  await expect(page.getByTestId("semillas-plata")).toHaveText("200 Semillas de plata (simulado)");
  await expect(page.getByText(/caja|cobrás/i)).toHaveCount(0);
});

test("un monto inválido no se registra", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  await page.getByRole("tab", { name: "Sumarte con plata" }).click();
  await page.getByLabel("Monto (USD)").fill("0");
  await expect(page.getByRole("button", { name: "Registrar aporte (simulado)" })).toBeDisabled();
});

test("tooltip 🌱 de Semillas con teclado: Tab lo abre y Escape lo cierra", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  const boton = page.getByRole("button", { name: "Qué significa en la economía de la comunidad: Semillas" });
  await expect(boton).toBeVisible();
  await boton.focus();
  await expect(boton).toBeFocused();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toContainText("potencial de acceso");
  await expect(tooltip).toContainText("Borrador: texto a revisar");
  await page.keyboard.press("Escape");
  await expect(tooltip).toHaveCount(0);
  // Es distinto del ⚖ legal.
  await expect(page.getByRole("button", { name: /Qué significa legalmente: Semillas/ })).toHaveCount(0);
});

test("con modalidad de obra cargada se avisa lo legal con ⚖", async ({ page }) => {
  await comoMiembro(page);
  await page.addInitScript(() => window.localStorage.setItem("lh-pasaporte", JSON.stringify({ modalidad: "obra" })));
  await page.goto("/pactos");
  await expect(page.getByText("Horas de obra presenciales")).toBeVisible();
  await expect(page.getByRole("button", { name: "Qué significa legalmente: Horas de obra" })).toBeVisible();
});

test("sin personas de ejemplo: no aparecen Lucía ni Lucas ni Oslo", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  await expect(page.getByText(/Lucía|Lucas|Oslo/)).toHaveCount(0);
});

test("no manda datos a un servidor", async ({ page }) => {
  await comoMiembro(page);
  const pedidos: string[] = [];
  page.on("request", (r) => {
    // La barra de comentarios de Vercel (vercel.live) solo existe en los previews: no es la app.
    if (r.method() !== "GET" && !new URL(r.url()).hostname.endsWith("vercel.live")) pedidos.push(r.url());
  });
  await page.goto("/pactos");
  await llenarPacto(page);
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await expect(page.getByRole("button", { name: "Simular: la comunidad acepta" })).toBeVisible();
  expect(pedidos).toEqual([]);
});

test("pestañas con teclado: flechas, Inicio y Fin", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  const tiempo = page.getByRole("tab", { name: "Pacto de tiempo" });
  const plata = page.getByRole("tab", { name: "Sumarte con plata" });
  await tiempo.focus();
  await page.keyboard.press("ArrowRight");
  await expect(plata).toHaveAttribute("aria-selected", "true");
  await expect(plata).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(tiempo).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(plata).toBeFocused();
  await page.keyboard.press("Home");
  await expect(tiempo).toBeFocused();
});

test("si el navegador no guarda, la pantalla responde y avisa", async ({ page }) => {
  await comoMiembro(page);
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("sin almacenamiento");
    };
  });
  await page.goto("/pactos");
  await page.getByRole("tab", { name: "Sumarte con plata" }).click();
  await expect(page.getByRole("tab", { name: "Sumarte con plata" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("alert").filter({ hasText: "no permite guardar" })).toBeVisible();
});
