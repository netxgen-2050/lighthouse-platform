import { expect, test, type Page } from "./fixtura";
import { conIdentidadVerificada, ignorarEnSinRed, sembrarRespuestaDeLaTribu } from "./ayudas";

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
  const enviar = page.getByRole("button", { name: "Enviar a la comunidad" });
  await expect(enviar).toBeDisabled();
  await expect(enviar).toHaveAccessibleDescription(/elegí un rol/);
  await enviar.focus();
  await expect(enviar).toBeFocused();
  await llenarPacto(page);
  await expect(page.getByRole("button", { name: "Enviar a la comunidad" })).toBeEnabled();
});

test("enviar, esperar a la tribu, ver el pacto aceptado y seguir aceptado al recargar", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  await expect(page.getByText("Pacto aceptado")).toHaveCount(0);
  await llenarPacto(page);
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Enviado a la comunidad" })).toHaveAttribute("aria-current", "step");
  // La persona ya no se acepta a sí misma: espera la respuesta de la comunidad.
  await expect(page.getByText("Esperando la respuesta de Lighthouse")).toBeVisible();
  await expect(page.getByRole("button", { name: /Simular/ })).toHaveCount(0);
  await sembrarRespuestaDeLaTribu(page, "acepta");
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
  await expect(page.getByRole("button", { name: /Qué significa legalmente: Pacto aceptado por las dos partes/ })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: "Aceptado por quien administra la comunidad" })).toHaveAttribute(
    "aria-current",
    "step",
  );
  await page.reload();
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar a la comunidad" })).toHaveCount(0);
});

test("retirar un pacto enviado lo devuelve a borrador con su contenido, y no muestra versión", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  await llenarPacto(page);
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await expect(page.getByText(/Versión \d/)).toHaveCount(0);
  await page.getByRole("button", { name: "Retirar y editar" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Borrador" })).toHaveAttribute("aria-current", "step");
  await expect(page.getByLabel(/Rol que asumís/)).toHaveValue("facilitacion");
  await expect(page.getByLabel("Tu descripción: qué vas a hacer")).toHaveValue("Facilito las asambleas");
  await expect(page.getByLabel(/Compromiso mensual/)).toBeEnabled();
  await expect(page.getByRole("button", { name: "Enviar a la comunidad" })).toBeFocused();
});

async function pactoAceptado(page: Page) {
  await page.goto("/pactos");
  await llenarPacto(page);
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await sembrarRespuestaDeLaTribu(page, "acepta");
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
}

test("proponer un cambio: la versión vigente sigue en Semillas hasta que se acepta, y queda el historial", async ({ page }) => {
  await comoMiembro(page);
  await pactoAceptado(page);
  await expect(page.getByTestId("version-pacto")).toHaveText("Versión 1");
  await page.getByRole("button", { name: "Proponer un cambio" }).click();
  const cambio = page.getByRole("region", { name: "Cambio propuesto" });
  await expect(cambio).toBeVisible();
  await expect(cambio.getByLabel("Rol propuesto")).toHaveValue("facilitacion");
  await expect(cambio.getByLabel("Descripción propuesta: qué vas a hacer")).toHaveValue("Facilito las asambleas");
  // Un cambio incompleto no se envía.
  await cambio.getByLabel("Descripción propuesta: qué vas a hacer").fill("");
  const enviar = cambio.getByRole("button", { name: "Enviar cambio a la comunidad" });
  await expect(enviar).toBeDisabled();
  await expect(enviar).toHaveAccessibleDescription("Para enviarlo elegí un rol y contá qué vas a hacer.");
  await cambio.getByLabel("Descripción propuesta: qué vas a hacer").fill("Facilito más asambleas");
  await cambio.getByLabel(/Compromiso mensual propuesto/).fill("20");
  await enviar.click();
  await expect(page.getByRole("list", { name: "Pasos del cambio" }).getByRole("listitem").filter({ hasText: "Enviado a la comunidad" })).toHaveAttribute(
    "aria-current",
    "step",
  );
  await expect(cambio.getByText("Esperando la respuesta de Lighthouse")).toBeFocused();
  await expect(page.getByRole("button", { name: /Simular/ })).toHaveCount(0);
  // Mientras tanto, Semillas sigue con 10 h/mes.
  await expect(page.getByText("Compromiso mensual: 10 h/mes")).toBeVisible();
  await expect(page.getByTestId("semillas-mes")).toHaveText("50 semillas");
  await page.goto("/semillas");
  await expect(page.getByTestId("total-lighthouse")).toHaveText("150 semillas");
  await page.goto("/pactos");
  await sembrarRespuestaDeLaTribu(page, "acepta");
  await expect(page.getByTestId("version-pacto")).toHaveText("Versión 2");
  await expect(page.getByRole("region", { name: "Cambio propuesto" })).toHaveCount(0);
  await expect(page.getByTestId("semillas-mes")).toHaveText("101 semillas");
  await page.goto("/semillas");
  await expect(page.getByTestId("total-lighthouse")).toHaveText("303 semillas");
  await page.goto("/pactos");
  await page.getByText(/Historial de versiones/).click();
  const versiones = page.getByRole("list", { name: "Versiones aceptadas" }).getByRole("listitem");
  await expect(versiones).toHaveCount(2);
  await expect(versiones.nth(0)).toContainText("Versión 2");
  await expect(versiones.nth(0)).toContainText("20 h/mes");
  await expect(versiones.nth(1)).toContainText("Versión 1");
  await expect(versiones.nth(1)).toContainText("10 h/mes");
  await expect(versiones.nth(1)).not.toContainText("fecha sin dato");
  // El evento queda en Mi recorrido.
  await page.goto("/panel");
  await expect(page.getByText("aceptó el cambio a tu pacto")).toBeVisible();
  await expect(page.getByRole("link", { name: /aceptó el cambio a tu pacto/ }).first()).toHaveAttribute("href", "/pactos?comunidad=lighthouse");
  await expect(page.getByText("Propusiste un cambio a tu pacto en")).toBeVisible();
});

test("si la comunidad no acepta el cambio, sigue la versión vigente y se avisa", async ({ page }) => {
  await comoMiembro(page);
  await pactoAceptado(page);
  await page.getByRole("button", { name: "Proponer un cambio" }).click();
  await page.getByLabel(/Compromiso mensual propuesto/).fill("30");
  await page.getByRole("button", { name: "Enviar cambio a la comunidad" }).click();
  await sembrarRespuestaDeLaTribu(page, "no-acepta", "Por ahora 10 h/mes");
  const aviso = page.getByText("Lighthouse no aceptó tu pacto: Por ahora 10 h/mes");
  // Una copia es visible y otra va a la región viva siempre montada (que se anuncia).
  await expect(aviso).toHaveCount(2);
  await expect(page.getByRole("status").filter({ hasText: "Lighthouse no aceptó tu pacto: Por ahora 10 h/mes" })).toHaveCount(1);
  // El aviso visible es de la pestaña de tiempo: no queda en la de plata.
  await page.getByRole("tab", { name: "Sumarte con plata" }).click();
  await expect(aviso).toHaveCount(1);
  await page.getByRole("tab", { name: "Pacto de tiempo" }).click();
  // El aviso con el motivo se queda hasta que la persona vuelve a enviar.
  await expect(aviso).toHaveCount(2);
  await expect(page.getByRole("region", { name: "Cambio propuesto" })).toHaveCount(0);
  await expect(page.getByTestId("version-pacto")).toHaveText("Versión 1");
  await expect(page.getByText("Compromiso mensual: 10 h/mes")).toBeVisible();
  await expect(page.getByRole("button", { name: "Proponer un cambio" })).toBeVisible();
  await page.goto("/panel");
  await expect(page.getByText("no aceptó el cambio a tu pacto")).toBeVisible();
});

test("descartar un cambio en borrador deja solo la versión vigente", async ({ page }) => {
  await comoMiembro(page);
  await pactoAceptado(page);
  await page.getByRole("button", { name: "Proponer un cambio" }).click();
  await page.getByRole("button", { name: "Descartar cambio" }).click();
  await expect(page.getByRole("region", { name: "Cambio propuesto" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Proponer un cambio" })).toBeVisible();
  await expect(page.getByTestId("version-pacto")).toHaveText("Versión 1");
});

test("un pacto aceptado guardado antes de las versiones se ve como versión 1 y admite un cambio", async ({ page }) => {
  await comoMiembro(page);
  await page.addInitScript(() => {
    if (window.localStorage.getItem("lh-pactos")) return;
    window.localStorage.setItem(
      "lh-pactos",
      JSON.stringify({
        pestana: "tiempo",
        comunidades: { lighthouse: { tiempo: { rol: "facilitacion", rolOtro: "", descripcion: "Facilito", horas: 10, paso: 2 }, aportes: [] } },
      }),
    );
  });
  await page.goto("/pactos");
  await expect(page.getByTestId("version-pacto")).toHaveText("Versión 1");
  await page.getByText(/Historial de versiones/).click();
  await expect(page.getByText("fecha sin dato")).toBeVisible();
  await expect(page.getByRole("button", { name: "Proponer un cambio" })).toBeVisible();
});

test("con rol Otro sin nombre, el motivo pide nombrar el rol", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  await page.getByLabel(/Rol que asumís/).selectOption({ label: "Otro" });
  await page.getByLabel("Tu descripción: qué vas a hacer").fill("Ayudo con lo que haga falta");
  await expect(page.getByRole("button", { name: "Enviar a la comunidad" })).toHaveAccessibleDescription(/nombrá el rol/);
});

test("al recargar con el pacto enviado o aceptado no se anuncia nada", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  await llenarPacto(page);
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Pacto enviado" })).toHaveCount(1);
  await page.reload();
  await expect(page.getByText("Esperando la respuesta de Lighthouse")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: /Pacto enviado|aceptó el pacto/ })).toHaveCount(0);
  // La respuesta de la tribu se anuncia una sola vez, cuando la persona vuelve y se aplica.
  await sembrarRespuestaDeLaTribu(page, "acepta");
  await expect(page.getByRole("status").filter({ hasText: "aceptó el pacto" })).toHaveCount(1);
  await page.reload();
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: /Pacto enviado|aceptó el pacto/ })).toHaveCount(0);
  // Y en Mi recorrido queda un solo aviso.
  await page.goto("/panel");
  await expect(page.getByText(/aceptó tu pacto/)).toHaveCount(1);
});

test("la pestaña de plata no muestra los pasos ni la versión del pacto de tiempo", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  await llenarPacto(page);
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await sembrarRespuestaDeLaTribu(page, "acepta");
  await expect(page.getByRole("list", { name: "Pasos del pacto" })).toBeVisible();
  await expect(page.getByTestId("version-pacto")).toHaveText("Versión 1");
  await page.getByRole("tab", { name: "Sumarte con plata" }).click();
  await expect(page.getByRole("list", { name: "Pasos del pacto" })).toHaveCount(0);
  await expect(page.getByText(/Versión \d/)).toHaveCount(0);
});

test("el pacto aceptado se guarda por comunidad y suma en /semillas", async ({ page }) => {
  await comoMiembro(page, ["lighthouse", "semilla"]);
  await page.goto("/pactos?comunidad=semilla");
  await llenarPacto(page);
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await sembrarRespuestaDeLaTribu(page, "acepta");
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
  await page.getByLabel("¿En qué comunidad es el pacto?").selectOption("lighthouse");
  await expect(page.getByText("Pacto aceptado")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Enviar a la comunidad" })).toBeVisible();
  await page.goto("/semillas");
  // El pacto es de Semilla Viva: esa tarjeta suma y la del Lighthouse sigue sin dato.
  await expect(page.getByTestId("total-semilla")).toHaveText("150 semillas");
  await expect(page.getByTestId("total-lighthouse")).toHaveText("sin dato");
  await page.getByRole("button", { name: "Ver el detalle de Semilla Viva" }).click();
  await expect(page.getByTestId("semillas-tiempo")).toHaveText("150 semillas");
});

test("sumarte con plata: USD 200 se registran como 200 Semillas de plata, simulado", async ({ page }) => {
  await comoMiembro(page);
  await conIdentidadVerificada(page);
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

test("sin el sello de identidad, registrar un aporte en plata abre la verificación y no registra nada", async ({ page }) => {
  await comoMiembro(page);
  await page.goto("/pactos");
  await page.getByRole("tab", { name: "Sumarte con plata" }).click();
  await page.getByRole("button", { name: "Registrar aporte (simulado)" }).click();
  const dialogo = page.getByRole("dialog", { name: /Verificar mi identidad/ });
  await expect(dialogo).toBeVisible();
  await expect(dialogo).toContainText("registrar un aporte en plata");
  await dialogo.getByRole("button", { name: "Cerrar" }).click();
  await expect(dialogo).toBeHidden();
  await expect(page.getByText("Todavía no registraste aportes en plata.")).toBeVisible();
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
  // Navegación real con teclado: Tab hasta que el foco llegue al botón 🌱.
  for (let i = 0; i < 40 && !(await boton.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
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
    // Vercel, Privy y WalletConnect no son la app ni llevan datos de la persona.
    if (r.method() !== "GET" && !ignorarEnSinRed(r)) pedidos.push(r.url());
  });
  await page.goto("/pactos");
  await llenarPacto(page);
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await expect(page.getByText("Esperando la respuesta de Lighthouse")).toBeVisible();
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
