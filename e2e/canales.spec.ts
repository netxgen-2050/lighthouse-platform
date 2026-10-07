import { expect, test, type Page } from "@playwright/test";

const fila = (page: Page, nombre: string) =>
  page.locator("tbody tr").filter({ has: page.getByRole("rowheader", { name: new RegExp(`^${nombre}`) }) });

test("estado inicial: Explorador sin pase y solo dos puertas abiertas", async ({ page }) => {
  const respuesta = await page.goto("/canales");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Qué te abre tu lugar en la red" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.getByRole("definition").filter({ hasText: /^Explorador$/ })).toBeVisible();
  await expect(page.getByText("Sin Pase Fundador")).toBeVisible();
  await expect(page.locator("tbody tr").filter({ hasText: /Abierta/ })).toHaveCount(2);
  await expect(fila(page, "Mapa, tribus y eventos abiertos")).toContainText("Abierta");
  await expect(fila(page, "Registrar tu ticket del Congreso")).toContainText("Abierta");
});

test("nueve filas con estado en texto", async ({ page }) => {
  await page.goto("/canales");
  const filas = page.locator("tbody tr");
  await expect(filas).toHaveCount(9);
  for (const f of await filas.all()) await expect(f).toContainText(/Abierta|Cerrada/);
});

test("cerradas dicen qué las abre", async ({ page }) => {
  await page.goto("/canales");
  await expect(fila(page, "Canal de fundadores")).toContainText("Cerrada");
  await expect(fila(page, "Canal de fundadores")).toContainText("Se abre con: Pase Fundador");
  await expect(fila(page, "Voto en la Asamblea de residentes")).toContainText("Se abre con: ser residente");
});

test("activar el Pase Brote en Sumarte abre el canal de fundadores y el enlace lleva a Canales", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Quiero el Pase Brote" }).click();
  await expect(page.getByText("Pase Brote activo (simulado)")).toBeVisible();
  await page.getByRole("link", { name: "Ver qué te abre cada plan" }).click();
  await expect(page).toHaveURL(/\/canales$/);
  await expect(page.getByText("Pase Fundador · Brote")).toBeVisible();
  await expect(page.getByRole("definition").filter({ hasText: /^Miembro$/ })).toBeVisible();
  await expect(fila(page, "Canal de fundadores")).toContainText("Abierta");
  await expect(fila(page, "Canal de fundadores")).toContainText("por tu pase");
  await expect(fila(page, "Foros de la red")).toContainText("por tu plan y por tu pase");
});

test("un ticket registrado no es presencia", async ({ page }) => {
  await page.goto("/congreso");
  await page.getByLabel(/Código de tu ticket/).fill("lh27-8f3k-2q");
  await page.getByRole("button", { name: "Registrar" }).click();
  await expect(page.getByText("Ticket LH27-8F3K-2Q registrado")).toBeVisible();
  await page.goto("/canales");
  await expect(page.getByText("pendiente: la confirma el anfitrión en el check-in")).toBeVisible();
  await expect(page.locator("tbody")).not.toContainText("por tu presencia");
});

test("simulador: tribu aceptada Valle Solar", async ({ page }) => {
  await page.goto("/canales");
  await page.getByLabel("Tribu aceptada").selectOption({ label: "Valle Solar" });
  await expect(fila(page, "Sala de Valle Solar")).toContainText("Abierta");
  await expect(fila(page, "Sala de Valle Solar")).toContainText("por tu tribu");
  await expect(fila(page, "Salas de otras tribus")).toContainText("Cerrada");
});

test("simulador: pase Raíz con presencia deja el refuerzo a decidir, sin multiplicador", async ({ page }) => {
  await page.goto("/canales");
  await page.getByRole("radio", { name: "Raíz" }).check();
  await page.getByRole("checkbox", { name: "Presencia Genesis" }).check();
  const voz = fila(page, "Voz en el Fondo Común");
  await expect(voz).toContainText("Abierta · 1 voz");
  await expect(voz).toContainText("Refuerzo por presencia: a decidir");
  await expect(page.locator("tbody")).not.toContainText("×1,5");
  await expect(page.locator("tbody")).not.toContainText("×2");
});

test("simulador: residente abre el voto, no se guarda y volver a mi situación lo deshace", async ({ page }) => {
  await page.goto("/canales");
  const voto = fila(page, "Voto en la Asamblea de residentes");
  await page.getByRole("checkbox", { name: "Residente" }).check();
  await expect(voto).toContainText("Abierta");
  await expect(voto).toContainText("por tu rol");
  await page.getByRole("button", { name: "Volver a mi situación" }).click();
  await expect(voto).toContainText("Cerrada");
  await page.getByRole("checkbox", { name: "Residente" }).check();
  await page.reload();
  await expect(fila(page, "Voto en la Asamblea de residentes")).toContainText("Cerrada");
});

test("teclado: se recorre todo el simulador sin mouse", async ({ page }) => {
  await page.goto("/canales");
  await page.getByRole("radio", { name: "Explorador" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { name: "Miembro" })).toBeChecked();
  await page.getByRole("radio", { name: "Sin pase" }).focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("radio", { name: "Brote" })).toBeChecked();
  await expect(fila(page, "Canal de fundadores")).toContainText("Abierta");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Tribu aceptada")).toBeFocused();
  await page.keyboard.type("Valle");
  await expect(page.getByLabel("Tribu aceptada")).toHaveValue("valle");
  await expect(fila(page, "Sala de Valle Solar")).toContainText("Abierta");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("checkbox", { name: "Presencia Genesis" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByRole("checkbox", { name: "Presencia Genesis" })).toBeChecked();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  await expect(fila(page, "Voto en la Asamblea de residentes")).toContainText("Abierta");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Volver a mi situación" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(fila(page, "Voto en la Asamblea de residentes")).toContainText("Cerrada");
  await expect(page.getByRole("checkbox", { name: "Residente" })).not.toBeChecked();
});

for (const conTribu of [false, true]) {
  test(`a 320 px no hay scroll horizontal ${conTribu ? "con" : "sin"} tribu aceptada`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/canales");
    if (conTribu) {
      await page.getByLabel("Tribu aceptada").selectOption({ label: "Valle Solar" });
      await expect(fila(page, "Sala de Valle Solar")).toContainText("Abierta");
    }
    const medidas = await page.evaluate(() => ({
      ancho: document.documentElement.scrollWidth,
      visible: document.documentElement.clientWidth,
    }));
    expect(medidas.ancho).toBeLessThanOrEqual(medidas.visible);
  });
}

test("hay un solo main y los ⚖ están en la pantalla", async ({ page }) => {
  await page.goto("/canales");
  await expect(page.locator("main")).toHaveCount(1);
  for (const t of ["Pase Fundador", "Presencia", "El Guardián", "Créditos"]) {
    await expect(page.getByRole("button", { name: new RegExp(`^Qué significa legalmente: ${t}`) }).first()).toBeVisible();
  }
});
