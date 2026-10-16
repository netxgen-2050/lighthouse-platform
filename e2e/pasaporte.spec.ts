import { expect, test, type Locator, type Page } from "./fixtura";

const sello = (page: Page, id: string) => page.locator(`[data-sello="${id}"]`);

async function llenarPasos(dialogo: Locator, residencia: "Argentina" | "Exterior" = "Argentina") {
  const sig = dialogo.getByRole("button", { name: "Siguiente" });
  await dialogo.getByLabel("Nombre completo").fill("Ana Pérez");
  await dialogo.getByLabel("Número de documento").fill("30123456");
  await dialogo.getByLabel("Fecha de nacimiento").fill("1985-03-02");
  await sig.click();
  await dialogo.getByRole("group", { name: "Nacionalidad" }).getByLabel("Argentina").check();
  await dialogo.getByRole("group", { name: /Residencia fiscal/ }).getByLabel(residencia).check();
  if (residencia === "Exterior") await dialogo.getByLabel("País de residencia fiscal").fill("Noruega");
  await sig.click();
  await dialogo.getByLabel("¿De dónde vienen los fondos?").fill("Ahorros de mi trabajo");
  await sig.click();
  await dialogo.getByRole("radio", { name: "No calificado" }).check();
  await sig.click();
}

test.describe("una persona que recién se suma", () => {
  // Quien se suma gratis es Explorador: todavía no eligió ni el plan Miembro ni el Pase.
  test.use({ plan: "explorador" });

test("una persona nueva: Explorador/a obtenido con fecha y los demás con su botón o enlace", async ({ page }) => {
  const r = await page.goto("/pasaporte");
  expect(r?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Tu pasaporte" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(sello(page, "explorador")).toContainText("Obtenido");
  await expect(sello(page, "explorador")).toContainText(/\d{1,2} de \w+ de 20\d\d/);
  await expect(sello(page, "miembro-red")).toContainText("Disponible");
  await expect(sello(page, "miembro-red").getByRole("link", { name: "Hacerme Miembro en Sumarte" })).toHaveAttribute("href", "/sumarte");
  await expect(sello(page, "identidad")).toContainText("Disponible");
  await expect(sello(page, "identidad").getByRole("button", { name: "Verificar mi identidad" })).toHaveCount(0);
  await expect(sello(page, "identidad").getByRole("link", { name: "Ver la verificación" })).toHaveAttribute("href", "/pasaporte#identidad");
  await expect(sello(page, "fundador")).toContainText("Disponible");
  await expect(sello(page, "genesis")).toContainText("Disponible");
  await expect(sello(page, "residente")).toContainText("No disponible todavía");
  await expect(sello(page, "comunidad:lighthouse")).toContainText("Disponible");
  // Nada se comunica solo con color: cada estado está escrito.
  for (const li of await page.locator("[data-sello]").all()) {
    await expect(li).toContainText(/Obtenido|En trámite|Disponible|No disponible todavía/);
  }
});
});

test("cada sello dice qué abre: el Pase Fundador abre canal de fundadores, voz en el Fondo Común y créditos", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Quiero el Pase Brote" }).click();
  await page.goto("/pasaporte");
  const f = sello(page, "fundador");
  await expect(f).toContainText("Obtenido");
  await expect(f).toContainText("Canal de fundadores · Abierta");
  await expect(f).toContainText("Voz en el Fondo Común · Abierta · 1 voz");
  await expect(f).toContainText("Voto en el Fideicomiso · Abierta");
  await expect(f).toContainText("Créditos comunes y de estadía · Abierta");
});

test("la fecha de un sello obtenido queda guardada y no cambia al recargar", async ({ page }) => {
  await page.goto("/pasaporte");
  await expect(sello(page, "explorador")).toContainText("Obtenido");
  const antes = await page.evaluate(() => window.localStorage.getItem("lh-sellos"));
  expect(antes).toContain("explorador");
  await page.reload();
  await expect(sello(page, "explorador")).toContainText("Obtenido");
  expect(await page.evaluate(() => window.localStorage.getItem("lh-sellos"))).toBe(antes);
});

test("membresías: un pedido es en trámite y una aceptación es obtenido", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro", valle: "pedido" })));
  await page.goto("/pasaporte");
  await expect(sello(page, "comunidad:lighthouse")).toContainText("Obtenido");
  await expect(sello(page, "comunidad:valle")).toContainText("En trámite");
});

test("KYC por pasos: valida cada paso, queda en trámite y se aprueba con la simulación", async ({ page }) => {
  await page.goto("/pasaporte");
  await page.getByRole("button", { name: "Completar mi verificación (KYC)" }).click();
  const dialogo = page.getByRole("dialog", { name: /Verificar mi identidad/ });
  await expect(dialogo).toBeVisible();
  await expect(dialogo).toContainText("Paso 1 de 5");
  await expect(dialogo).toContainText("no se verifica ningún documento");
  // Paso 1: campos obligatorios, error asociado y foco en el primero.
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  await expect(dialogo.getByText("Error: Escribí tu nombre completo.")).toBeVisible();
  await expect(dialogo.getByLabel("Nombre completo")).toBeFocused();
  await expect(dialogo.getByLabel("Nombre completo")).toHaveAttribute("aria-invalid", "true");
  await dialogo.getByLabel("Nombre completo").fill("Ana Pérez");
  await dialogo.getByLabel("Número de documento").fill("30123456");
  await dialogo.getByLabel("Fecha de nacimiento").fill("2015-01-01");
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  await expect(dialogo.getByText(/Tenés que ser mayor de 18 años/)).toBeVisible();
  await dialogo.getByLabel("Fecha de nacimiento").fill("1985-03-02");
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  // Paso 2
  await expect(dialogo).toContainText("Paso 2 de 5");
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  await expect(dialogo.getByText("Error: Elegí tu nacionalidad.")).toBeVisible();
  await dialogo.getByRole("group", { name: "Nacionalidad" }).getByLabel("Argentina").check();
  await dialogo.getByRole("group", { name: /Residencia fiscal/ }).getByLabel("Exterior").check();
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  await expect(dialogo.getByText("Error: Escribí tu país de residencia fiscal.")).toBeVisible();
  await dialogo.getByLabel("País de residencia fiscal").fill("Noruega");
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  // Paso 3
  await expect(dialogo).toContainText("Paso 3 de 5");
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  await expect(dialogo.getByText("Error: Contanos de dónde vienen los fondos.")).toBeVisible();
  await dialogo.getByLabel("¿De dónde vienen los fondos?").fill("Ahorros de mi trabajo");
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  // Paso 4
  await expect(dialogo).toContainText("Paso 4 de 5");
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  await expect(dialogo.getByText("Error: Elegí qué tipo de inversor sos.")).toBeVisible();
  await dialogo.getByRole("radio", { name: "Calificado", exact: true }).check();
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  // Paso 5: revisión; se puede volver.
  await expect(dialogo).toContainText("Paso 5 de 5");
  await expect(dialogo).toContainText("Ana Pérez");
  await expect(dialogo).toContainText("Exterior · Noruega");
  await dialogo.getByRole("button", { name: "Atrás" }).click();
  await expect(dialogo).toContainText("Paso 4 de 5");
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  await dialogo.getByRole("button", { name: "Enviar verificación (simulado)" }).click();
  await expect(dialogo).toContainText("Verificación en trámite");
  await dialogo.getByRole("button", { name: "Cerrar" }).click();
  await expect(dialogo).toBeHidden();
  await expect(sello(page, "identidad")).toContainText("En trámite");
  await expect(page.getByRole("button", { name: "Completar mi verificación (KYC)" })).toHaveCount(0);
  await expect(page.locator("#identidad")).toContainText("Enviaste tus datos el");
  await expect(page.locator("#identidad").getByRole("listitem").filter({ hasText: "En trámite" })).toHaveAttribute("aria-current", "step");
  // Los datos personales no se guardan; lo de Tus datos sí.
  const guardado = await page.evaluate(() => `${window.localStorage.getItem("lh-kyc")}${window.localStorage.getItem("lh-pasaporte")}`);
  expect(guardado).not.toContain("30123456");
  expect(guardado).not.toContain("Ana Pérez");
  expect(guardado).toContain("Noruega");
  // Residente del exterior: el sello de inversor explica por qué no.
  await page.locator("#identidad").getByRole("button", { name: "Simular: verificación aprobada" }).click();
  await expect(page.locator("#identidad")).toContainText("Identidad verificada el");
  await expect(page.locator("#identidad")).toContainText("residencia fiscal es del exterior");
  await expect(page.locator("#identidad").getByRole("button", { name: /Aportantes con residencia fiscal en el exterior/ })).toBeVisible();
  await expect(sello(page, "identidad")).toContainText("Obtenido");
  await expect(sello(page, "inversor")).toContainText("No disponible todavía");
  await expect(sello(page, "inversor")).toContainText("residencia fiscal es del exterior");
  await page.reload();
  await expect(sello(page, "identidad")).toContainText("Obtenido");
});

test("residente en Argentina: la identidad aprobada habilita el sello de inversor", async ({ page }) => {
  await page.goto("/pasaporte");
  await page.getByRole("button", { name: "Completar mi verificación (KYC)" }).click();
  const dialogo = page.getByRole("dialog", { name: /Verificar mi identidad/ });
  await llenarPasos(dialogo);
  await dialogo.getByRole("button", { name: "Enviar verificación (simulado)" }).click();
  await dialogo.getByRole("button", { name: "Simular: verificación aprobada" }).click();
  await expect(dialogo).toContainText("Identidad verificada");
  await dialogo.getByRole("button", { name: "Listo" }).click();
  await expect(sello(page, "identidad")).toContainText("Obtenido");
  await expect(sello(page, "inversor")).toContainText("Obtenido");
});

test("la tarjeta de identidad va antes de los sellos y explica para qué sirve, qué no requiere y qué se pide", async ({ page }) => {
  await page.goto("/pasaporte");
  await expect(page.locator("#identidad")).toBeVisible();
  const titulos = await page.locator("main h2").allTextContents();
  expect(titulos[0]).toContain("Verificá tu identidad (KYC)");
  expect(titulos[1]).toContain("Tus sellos");
  const tarjeta = page.locator("#identidad");
  await expect(tarjeta).toContainText("Lote 7");
  await expect(tarjeta).toContainText("aporte en plata en Pactos");
  await expect(tarjeta).toContainText("No hace falta para recorrer, sumarte a una tribu ni proponer pactos de tiempo");
  await expect(tarjeta.getByRole("listitem").filter({ hasText: "Sin empezar" })).toHaveAttribute("aria-current", "step");
  for (const paso of ["Datos personales", "Residencia fiscal y nacionalidad", "Origen de los fondos", "Tipo de inversor", "Revisión y envío"]) {
    await expect(tarjeta.getByRole("listitem").filter({ hasText: paso })).toBeVisible();
  }
});

test("/pasaporte#identidad deja el foco en el encabezado de la tarjeta", async ({ page }) => {
  await page.goto("/pasaporte#identidad");
  await expect(page.getByRole("heading", { level: 2, name: /Verificá tu identidad \(KYC\)/ })).toBeFocused();
});

test("residente en Argentina: la tarjeta se achica y dice que quedó habilitada", async ({ page }) => {
  await page.goto("/pasaporte");
  await page.getByRole("button", { name: "Completar mi verificación (KYC)" }).click();
  const dialogo = page.getByRole("dialog", { name: /Verificar mi identidad/ });
  await llenarPasos(dialogo);
  await dialogo.getByRole("button", { name: "Enviar verificación (simulado)" }).click();
  await dialogo.getByRole("button", { name: "Cerrar" }).click();
  await page.locator("#identidad").getByRole("button", { name: "Simular: verificación aprobada" }).click();
  await expect(page.locator("#identidad")).toContainText(/Identidad verificada el \d{1,2} de \w+ de 20\d\d \(simulado\)/);
  await expect(page.locator("#identidad")).toContainText("habilitado/a como inversor/a");
  await expect(page.locator("#identidad").getByRole("listitem").filter({ hasText: "Verificada" })).toHaveAttribute("aria-current", "step");
  await expect(sello(page, "identidad")).toContainText("Obtenido");
});

test("el diálogo se cierra con Escape y devuelve el foco al botón", async ({ page }) => {
  await page.goto("/pasaporte");
  const boton = page.getByRole("button", { name: "Completar mi verificación (KYC)" });
  await boton.focus();
  await page.keyboard.press("Enter");
  const dialogo = page.getByRole("dialog", { name: /Verificar mi identidad/ });
  await expect(dialogo).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect(boton).toBeFocused();
});

test("KYC a pedido: Pedir invitación sin el sello abre la verificación; con el sello sigue", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Pedir invitación" }).click();
  const dialogo = page.getByRole("dialog", { name: /Verificar mi identidad/ });
  await expect(dialogo).toBeVisible();
  await expect(dialogo).toContainText("pedir una invitación");
  await llenarPasos(dialogo);
  await dialogo.getByRole("button", { name: "Enviar verificación (simulado)" }).click();
  await dialogo.getByRole("button", { name: "Simular: verificación aprobada" }).click();
  await dialogo.getByRole("button", { name: "Listo" }).click();
  // Con el sello, se sigue con lo que quería hacer: el formulario del pedido.
  await expect(page.getByRole("button", { name: "Enviar pedido (simulado)" })).toBeVisible();
  await expect(page.getByText("Invitación pedida (simulado)")).toHaveCount(0);
});

test("KYC a pedido en Pactos: al aprobarse la verificación el aporte se registra solo", async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem("lh-membresia")) return;
    window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro" }));
  });
  await page.goto("/pactos");
  await page.getByRole("tab", { name: "Sumarte con plata" }).click();
  await page.getByLabel("Monto (USD)").fill("200");
  await page.getByRole("button", { name: "Registrar aporte (simulado)" }).click();
  const dialogo = page.getByRole("dialog", { name: /Verificar mi identidad/ });
  await llenarPasos(dialogo);
  await dialogo.getByRole("button", { name: "Enviar verificación (simulado)" }).click();
  await dialogo.getByRole("button", { name: "Simular: verificación aprobada" }).click();
  await dialogo.getByRole("button", { name: "Listo" }).click();
  await expect(page.getByTestId("semillas-plata")).toHaveText("200 Semillas de plata (simulado)");
});

test("si un sello deja de estar obtenido, al volver a obtenerlo la fecha es nueva", async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem("lh-sellos")) return;
    window.localStorage.setItem("lh-sellos", JSON.stringify({ explorador: "2026-09-01T00:00:00.000Z", fundador: "2026-09-02T00:00:00.000Z" }));
  });
  await page.goto("/pasaporte");
  await expect(sello(page, "fundador")).toContainText("Disponible");
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("lh-sellos"))).not.toContain("fundador");
  expect(await page.evaluate(() => window.localStorage.getItem("lh-sellos"))).toContain("2026-09-01");
});

test("horas fuera de rango: mensaje, aria-invalid y se repite al recargar", async ({ page }) => {
  await page.goto("/pasaporte");
  await page.getByLabel("Obra presencial").check();
  const horas = page.getByLabel("Horas por mes");
  await horas.fill("800");
  await expect(page.getByText(/Ingresá un número de horas entre 0 y/)).toBeVisible();
  await expect(horas).toHaveAttribute("aria-invalid", "true");
  await page.reload();
  await expect(page.getByLabel("Horas por mes")).toHaveValue("800");
  await expect(page.getByText(/Ingresá un número de horas entre 0 y/)).toBeVisible();
  await page.getByLabel("Horas por mes").fill("60");
  await expect(page.getByText(/Ingresá un número de horas entre 0 y/)).toHaveCount(0);
  await expect(page.getByLabel("Horas por mes")).toHaveAttribute("aria-invalid", "false");
});

test("almacenamiento bloqueado: el envío del KYC avisa y no queda en trámite", async ({ page }) => {
  // Con Privy activo (previews y producción) el login necesita el almacenamiento del navegador: sin él no hay sesión
  // y este caso no aplica. Se prueba en el e2e local, que corre sin Privy.
  test.skip(Boolean(process.env.BASE_URL || process.env.NEXT_PUBLIC_PRIVY_APP_ID), "Con Privy el login necesita el almacenamiento");
  await page.goto("/pasaporte");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("bloqueado", "SecurityError");
    };
  });
  await page.getByRole("button", { name: "Completar mi verificación (KYC)" }).click();
  const dialogo = page.getByRole("dialog", { name: /Verificar mi identidad/ });
  await llenarPasos(dialogo);
  await dialogo.getByRole("button", { name: "Enviar verificación (simulado)" }).click();
  await expect(dialogo.getByRole("alert").filter({ hasText: "no permite guardar datos" })).toBeVisible();
  await expect(dialogo).toContainText("Paso 5 de 5");
});

test("desde el rail se llega a /pasaporte", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Menú de la persona" }).click();
  await page.locator("#menu-persona").getByRole("link", { name: "Pasaporte" }).click();
  await expect(page).toHaveURL(/\/pasaporte$/);
  await expect(page.getByRole("button", { name: "Menú de la persona" })).toHaveAttribute("aria-current", "page");
});
