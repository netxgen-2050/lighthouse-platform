import { expect, test, type Page } from "./fixtura";

type PactoDeEjemplo = { horas?: number; paso?: number; aportes?: number[] };

/** Deja la membresía y los pactos guardados antes de abrir /semillas (solo la primera vez, así recargar no los pisa). */
async function preparar(page: Page, miembro: string[], pactos: Record<string, PactoDeEjemplo> = {}) {
  await page.addInitScript(
    ([ids, p]) => {
      if (window.localStorage.getItem("lh-membresia")) return;
      window.localStorage.setItem("lh-membresia", JSON.stringify(Object.fromEntries((ids as string[]).map((id) => [id, "miembro"]))));
      const comunidades = Object.fromEntries(
        Object.entries(p as Record<string, PactoDeEjemplo>).map(([id, v]) => [
          id,
          {
            tiempo: { rol: "facilitacion", rolOtro: "", descripcion: "Facilito", horas: v.horas ?? 20, paso: v.paso ?? 2 },
            aportes: v.aportes ?? [],
          },
        ]),
      );
      window.localStorage.setItem("lh-pactos", JSON.stringify({ pestana: "tiempo", comunidades }));
    },
    [miembro, pactos] as const,
  );
}

const GRUPOS = ["Rol, Martina", "Aporte al grupo, Martina", "Rol, Joaquín", "Aporte al grupo, Joaquín"];

async function puntuar(page: Page, n: number, conExplicacion = true) {
  for (const grupo of GRUPOS) {
    const g = page.getByRole("group", { name: grupo });
    await g.getByRole("button", { name: `${n} de 5` }).click();
    if (conExplicacion) await g.getByLabel("¿Por qué le das esta puntuación?").fill(`Porque sí, ${grupo}`);
  }
}

test("muestra título, aviso de prototipo y un único main", async ({ page }) => {
  const respuesta = await page.goto("/semillas");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Lo que sembraste y lo que te abre" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Semillas" })).toBeVisible();
});

test("sin ser miembro de ninguna comunidad se explica cómo empezar y no hay ronda", async ({ page }) => {
  await page.goto("/semillas");
  await expect(page.getByText("Todavía no sos miembro de ninguna comunidad")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver las comunidades" })).toHaveAttribute("href", "/tribus");
  await expect(page.getByRole("heading", { name: /Ronda de reconocimiento/ })).toHaveCount(0);
  await expect(page.getByTestId("semillas-tiempo")).toHaveCount(0);
  await expect(page.getByTestId("medidor")).toContainText("sin dato");
});

test("sin personas de ejemplo: no aparecen Lucía ni Lucas", async ({ page }) => {
  await preparar(page, ["lighthouse"], { lighthouse: {} });
  await page.goto("/semillas");
  await expect(page.getByText(/Lucía|Lucas/)).toHaveCount(0);
});

test("dos comunidades: una tarjeta por cada una con sus Semillas y su total", async ({ page }) => {
  await preparar(page, ["lighthouse", "valle"], { lighthouse: { horas: 20 }, valle: { paso: 0, aportes: [200] } });
  await page.goto("/semillas");
  const lh = page.getByTestId("tarjeta-lighthouse");
  const valle = page.getByTestId("tarjeta-valle");
  await expect(page.getByRole("list", { name: "Comunidades donde sos miembro" }).getByRole("listitem")).toHaveCount(2);
  await expect(lh.getByRole("heading", { name: "Lighthouse" })).toBeVisible();
  await expect(valle.getByRole("heading", { name: "Valle Solar" })).toBeVisible();
  await expect(page.getByTestId("total-lighthouse")).toHaveText("303 semillas");
  await expect(valle).toContainText("Tiempo");
  await expect(page.getByTestId("total-valle")).toHaveText("200 semillas");
  // Lo que falta es "sin dato", no 0.
  await expect(valle.locator("dd").nth(0)).toHaveText("sin dato");
  await expect(lh.locator("dd").nth(1)).toHaveText("sin dato");
});

test("elegir otra comunidad cambia el detalle", async ({ page }) => {
  await preparar(page, ["lighthouse", "valle"], { lighthouse: { horas: 20 } });
  await page.goto("/semillas");
  await expect(page.getByRole("heading", { name: "Detalle de Lighthouse" })).toBeVisible();
  await expect(page.getByTestId("semillas-tiempo")).toHaveText("303 semillas");
  await page.getByRole("button", { name: "Ver el detalle de Valle Solar" }).click();
  await expect(page.getByRole("heading", { name: "Detalle de Valle Solar" })).toBeVisible();
  await expect(page.getByTestId("semillas-tiempo")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Proponé un pacto de tiempo" })).toHaveAttribute("href", "/pactos?comunidad=valle");
});

test("sin pacto: Tiempo invita a proponerlo y no muestra número", async ({ page }) => {
  await preparar(page, ["lighthouse"]);
  await page.goto("/semillas");
  await expect(page.getByText("Todavía no tenés un pacto de tiempo aceptado")).toBeVisible();
  await expect(page.getByRole("link", { name: "Proponé un pacto de tiempo" })).toHaveAttribute("href", "/pactos?comunidad=lighthouse");
  await expect(page.getByTestId("semillas-tiempo")).toHaveCount(0);
  await expect(page.getByTestId("total-lighthouse")).toHaveText("sin dato");
  await expect(page.getByTestId("medidor")).toContainText("sin dato");
  await expect(page.getByText("Sin dato de tu residencia fiscal")).toBeVisible();
  await expect(page.getByText("Registrá tu ticket del Congreso")).toBeVisible();
});

test("con residencia en el exterior cargada, la plata no está disponible", async ({ page }) => {
  await preparar(page, ["lighthouse"]);
  await page.addInitScript(() => {
    window.localStorage.setItem("lh-pasaporte", JSON.stringify({ residencia: "exterior" }));
  });
  await page.goto("/semillas");
  await expect(page.getByText("No disponible por residencia fiscal")).toBeVisible();
});

test("ya no hay escalera: solo el medidor y el enlace al pasaporte", async ({ page }) => {
  await page.goto("/semillas");
  await expect(page.getByRole("heading", { name: "Lo que se te abre" })).toHaveCount(0);
  await expect(page.getByText("Parte del proyecto")).toHaveCount(0);
  await page.getByRole("link", { name: "Ver lo que te abre tu pasaporte" }).click();
  await expect(page).toHaveURL(/\/pasaporte$/);
});

test("con un pacto de 20 h/mes aceptado se ve el medidor de 120", async ({ page }) => {
  await preparar(page, ["lighthouse"], { lighthouse: { horas: 20 } });
  await page.goto("/semillas");
  await expect(page.getByTestId("semillas-tiempo")).toHaveText("303 semillas");
  await expect(page.getByTestId("medidor")).toHaveText("303 de 120 semillas");
  await expect(page.getByText("Lista", { exact: true })).toBeVisible();
});

test("con un pacto chico el estado es En camino", async ({ page }) => {
  await preparar(page, ["lighthouse"], { lighthouse: { horas: 4 } });
  await page.goto("/semillas");
  await expect(page.getByTestId("medidor")).toHaveText("60 de 120 semillas");
  await expect(page.getByText("En camino", { exact: true })).toBeVisible();
});

test("el ticket del Congreso aparece en Presencia del Lighthouse", async ({ page }) => {
  await preparar(page, ["lighthouse"]);
  await page.goto("/semillas");
  await page.evaluate(() => window.localStorage.setItem("lh-congreso-ticket", "LH27-8F3K-2Q"));
  await page.reload();
  await expect(page.getByText("Ticket registrado")).toBeVisible();
});

test("un ticket inválido no cuenta y el Pase se nombra como en /sumarte", async ({ page }) => {
  await preparar(page, ["lighthouse"]);
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
  await preparar(page, ["lighthouse"]);
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

test("un pacto enviado pero no aceptado no suma semillas de tiempo ni habilita la ronda", async ({ page }) => {
  await preparar(page, ["lighthouse"], { lighthouse: { horas: 20, paso: 1 } });
  await page.goto("/semillas");
  await expect(page.getByRole("link", { name: "Proponé un pacto de tiempo" })).toBeVisible();
  await expect(page.getByTestId("semillas-tiempo")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Enviar ronda" })).toHaveCount(0);
});

test("tooltip 🌱 de Semillas con teclado: Tab lo abre y Escape lo cierra", async ({ page }) => {
  await page.goto("/semillas");
  const boton = page.getByRole("button", { name: "Qué significa en la economía de la comunidad: Semillas" });
  await expect(boton).toBeVisible();
  await boton.focus();
  await expect(page.getByRole("tooltip")).toContainText("Cada comunidad tiene sus propias Semillas");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Qué significa legalmente: Semillas/ })).toHaveCount(0);
});

test("sin pacto aceptado en la comunidad no se ve la ronda y se ve cómo habilitarla", async ({ page }) => {
  await preparar(page, ["lighthouse", "valle"], { lighthouse: { horas: 20 } });
  await page.goto("/semillas");
  await page.getByRole("button", { name: "Ver el detalle de Valle Solar" }).click();
  await expect(page.getByRole("heading", { name: "Ronda de reconocimiento · Valle Solar" })).toBeVisible();
  await expect(page.getByText("La ronda es solo para quienes tienen un pacto aceptado en Valle Solar")).toBeVisible();
  await expect(page.getByRole("link", { name: "proponé tu pacto de tiempo en Valle Solar" })).toHaveAttribute("href", "/pactos?comunidad=valle");
  await expect(page.getByRole("button", { name: "Enviar ronda" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Cómo te reconocieron" })).toHaveCount(0);
});

test("la ronda tiene los criterios Rol y Aporte al grupo, cada uno con su explicación", async ({ page }) => {
  await preparar(page, ["valle"], { valle: {} });
  await page.goto("/semillas");
  const rol = page.getByRole("group", { name: "Rol, Martina" });
  await expect(rol).toContainText("Cómo cumple con las responsabilidades de su trabajo.");
  const aporte = page.getByRole("group", { name: "Aporte al grupo, Martina" });
  await expect(aporte).toContainText("Su apertura, su energía y cómo sus comportamientos se alinean con la cultura del grupo.");
  await expect(rol.getByLabel("¿Por qué le das esta puntuación?")).toBeVisible();
  await expect(page.getByText("Cumplió su rol")).toHaveCount(0);
});

test("sin explicación: se ve el error y la ronda no se envía", async ({ page }) => {
  await preparar(page, ["valle"], { valle: {} });
  await page.goto("/semillas");
  await puntuar(page, 4);
  const aporte = page.getByRole("group", { name: "Aporte al grupo, Joaquín" });
  await aporte.getByLabel("¿Por qué le das esta puntuación?").fill("");
  await page.getByRole("button", { name: "Enviar ronda" }).click();
  await expect(aporte.getByText("Error: escribí por qué le das esta puntuación.")).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "la ronda no se envió" })).toBeVisible();
  await expect(aporte.getByLabel("¿Por qué le das esta puntuación?")).toBeFocused();
  await expect(page.getByText("Ronda enviada (simulado)")).toHaveCount(0);
  // Escribir la explicación quita el error y deja enviar.
  await aporte.getByLabel("¿Por qué le das esta puntuación?").fill("Porque sí");
  await expect(aporte.getByText("Error:")).toHaveCount(0);
  await page.getByRole("button", { name: "Enviar ronda" }).click();
  await expect(page.getByText("Ronda enviada (simulado)")).toBeVisible();
});

test("sin puntuar también se avisa y no se envía", async ({ page }) => {
  await preparar(page, ["valle"], { valle: {} });
  await page.goto("/semillas");
  await page.getByRole("button", { name: "Enviar ronda" }).click();
  await expect(page.getByText("Error: elegí una puntuación de 1 a 5.").first()).toBeVisible();
  await expect(page.getByRole("alert").filter({ hasText: "Faltan 4 puntuaciones" })).toBeVisible();
  // El foco cae en "1 de 5" y el error de la puntuación está asociado a ese botón.
  const primero = page.getByRole("group", { name: "Rol, Martina" }).getByRole("button", { name: "1 de 5" });
  await expect(primero).toBeFocused();
  await expect(primero).toHaveAccessibleDescription(/Error: elegí una puntuación de 1 a 5\./);
  await expect(page.getByText("Ronda enviada (simulado)")).toHaveCount(0);
  // Con una sola explicación faltante el aviso concuerda en singular.
  await puntuar(page, 4);
  await page.getByRole("group", { name: "Aporte al grupo, Joaquín" }).getByLabel("¿Por qué le das esta puntuación?").fill("");
  await expect(page.getByRole("alert").filter({ hasText: "Falta 1 explicación" })).toBeVisible();
  // La descripción del criterio se anuncia en el campo de explicación.
  await expect(page.getByRole("group", { name: "Rol, Martina" }).getByLabel("¿Por qué le das esta puntuación?")).toHaveAccessibleDescription(
    /Cómo cumple con las responsabilidades de su trabajo\./,
  );
});

test("ronda completa: se envía, el factor es 1,0 y queda guardada al recargar", async ({ page }) => {
  await preparar(page, ["lighthouse"], { lighthouse: { horas: 20 } });
  await page.goto("/semillas");
  await puntuar(page, 5);
  await expect(page.getByText("Puntaje: 5 de 5")).toHaveCount(4);
  await page.getByRole("button", { name: "Enviar ronda" }).click();
  await expect(page.getByText("Ronda enviada (simulado)")).toBeVisible();
  await expect(page.getByTestId("factor")).toHaveText("1,0");
  await expect(page.getByTestId("semillas-tiempo")).toHaveText("303 semillas");
  await page.reload();
  await expect(page.getByText("Ronda enviada (simulado)")).toBeVisible();
  await expect(page.getByRole("group", { name: "Rol, Martina" }).getByLabel("¿Por qué le das esta puntuación?")).toHaveValue("Porque sí, Rol, Martina");
});

test("cada comunidad tiene su propia ronda", async ({ page }) => {
  await preparar(page, ["lighthouse", "valle"], { lighthouse: {}, valle: {} });
  await page.goto("/semillas");
  await puntuar(page, 3);
  await page.getByRole("button", { name: "Enviar ronda" }).click();
  await expect(page.getByText("Ronda enviada (simulado)")).toBeVisible();
  await page.getByRole("button", { name: "Ver el detalle de Valle Solar" }).click();
  await expect(page.getByText("Ronda enviada (simulado)")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Enviar ronda" })).toBeVisible();
});

test("Cómo te reconocieron: con pacto aceptado se ven puntuaciones y explicaciones de ejemplo", async ({ page }) => {
  await preparar(page, ["valle"], { valle: {} });
  await page.goto("/semillas");
  const recibido = page.getByRole("region", { name: "Cómo te reconocieron" });
  await expect(recibido).toBeVisible();
  await expect(recibido).toContainText("De Martina");
  await expect(recibido).toContainText("Rol: 4 de 5");
  await expect(recibido).toContainText("Aporte al grupo: 5 de 5");
  await expect(recibido).toContainText("Trae energía a las reuniones");
  await expect(recibido).toContainText("Ejemplo");
});

test("las notas y las explicaciones se pueden poner con teclado", async ({ page }) => {
  await preparar(page, ["valle"], { valle: {} });
  await page.goto("/semillas");
  const grupo = page.getByRole("group", { name: "Rol, Martina" });
  const tres = grupo.getByRole("button", { name: "3 de 5" });
  await tres.focus();
  await page.keyboard.press("Enter");
  await expect(tres).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(grupo.getByLabel("¿Por qué le das esta puntuación?")).toBeFocused();
  await page.keyboard.type("Cumple");
  await expect(grupo.getByLabel("¿Por qué le das esta puntuación?")).toHaveValue("Cumple");
});

test("no manda datos a un servidor", async ({ page }) => {
  await preparar(page, ["lighthouse"], { lighthouse: { horas: 20 } });
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
  await puntuar(page, 3);
  await page.getByRole("button", { name: "Enviar ronda" }).click();
  await expect(page.getByTestId("factor")).toHaveText("1,0");
  expect(pedidos).toEqual([]);
});
