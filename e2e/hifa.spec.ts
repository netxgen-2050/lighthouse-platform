import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const BOTON = "Hablar con Hifa";

async function abrir(page: Page) {
  await page.getByRole("button", { name: BOTON }).click();
  const chat = page.getByRole("dialog", { name: "Chat con Hifa" });
  await expect(chat).toBeVisible();
  return chat;
}

for (const ruta of ["/tribus", "/sumarte"]) {
  test(`el botón de Hifa se ve abajo a la derecha en ${ruta}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(ruta);
    const caja = (await page.getByRole("button", { name: BOTON }).boundingBox())!;
    expect(caja.x + caja.width).toBeGreaterThan(1280 - 40);
    expect(caja.y + caja.height).toBeGreaterThan(720 - 40);
  });
}

for (const [ancho, alto] of [
  [1280, 720],
  [390, 844],
] as const) {
  test(`${ancho} px: Reportar y Hifa no se superponen y no hay scroll horizontal`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    await page.goto("/");
    const hifa = (await page.getByRole("button", { name: BOTON }).boundingBox())!;
    const rep = (await page.getByRole("button", { name: "Reportar un problema o una idea" }).boundingBox())!;
    expect(Math.abs(rep.x + rep.width - ancho)).toBeLessThanOrEqual(1);
    expect(Math.abs(rep.y + rep.height / 2 - alto / 2)).toBeLessThanOrEqual(2);
    const separados =
      rep.y + rep.height <= hifa.y || hifa.y + hifa.height <= rep.y || rep.x + rep.width <= hifa.x || hifa.x + hifa.width <= rep.x;
    expect(separados).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  });
}

test("abre con el saludo y los cuatro atajos; Escape cierra y devuelve el foco", async ({ page }) => {
  await page.goto("/");
  const chat = await abrir(page);
  await expect(chat).toContainText("brote de micelio digital");
  for (const a of ["Tengo una idea", "Necesito algo", "Tengo una pregunta", "¿Qué sos?"]) {
    await expect(chat.getByRole("button", { name: a })).toBeVisible();
  }
  await page.keyboard.press("Escape");
  await expect(chat).toBeHidden();
  await expect(page.getByRole("button", { name: BOTON })).toBeFocused();
});

test("Escape cierra el chat aunque el foco esté en la página", async ({ page }) => {
  await page.goto("/");
  const chat = await abrir(page);
  await page.mouse.click(5, 300);
  await page.keyboard.press("Escape");
  await expect(chat).toBeHidden();
});

test("con Reportar abierto, Escape cierra solo Reportar y Hifa sigue abierta", async ({ page }) => {
  await page.goto("/");
  const chat = await abrir(page);
  await page.getByRole("button", { name: "Reportar un problema o una idea" }).click();
  const reportar = page.locator("dialog[open]");
  await expect(reportar).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(reportar).toHaveCount(0);
  await expect(chat).toBeVisible();
});

test("con un tooltip visible, Escape lo oculta, Hifa sigue abierta y el foco no se mueve", async ({ page }) => {
  await page.goto("/semillas");
  const chat = await abrir(page);
  const termino = page.getByRole("button", { name: "Qué significa en la economía de la comunidad: Semillas" });
  await page.keyboard.press("Shift"); // pasa a modalidad teclado para que el foco sea visible
  await termino.focus();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await expect(chat).toBeVisible();
  await expect(termino).toBeFocused();
});

test("tras aceptar, el foco queda dentro del chat y Escape lo cierra", async ({ page }) => {
  await page.route("**/api/reportes", async (ruta) => {
    await new Promise((r) => setTimeout(r, 400));
    return ruta.fulfill({ status: 200, json: { ok: true, numero: 51 } });
  });
  await page.goto("/");
  const chat = await abrir(page);
  await chat.getByLabel("Escribile a Hifa").fill("una idea");
  await chat.getByRole("button", { name: "Enviar", exact: true }).click();
  await chat.getByRole("button", { name: "Sí, pasalo" }).click();
  await expect(chat.getByRole("log")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(chat).toBeHidden();
});

for (const [ancho, alto] of [
  [1280, 720],
  [390, 844],
] as const) {
  test(`${ancho} px: con el chat abierto no tapa la pestaña Reportar`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: alto });
    await page.goto("/");
    const chat = await abrir(page);
    const ventana = (await chat.boundingBox())!;
    const rep = (await page.getByRole("button", { name: "Reportar un problema o una idea" }).boundingBox())!;
    expect(ventana.x + ventana.width).toBeLessThanOrEqual(rep.x);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  });
}

test("el botón cerrar cierra y devuelve el foco", async ({ page }) => {
  await page.goto("/");
  const chat = await abrir(page);
  await chat.getByRole("button", { name: "Cerrar el chat con Hifa" }).click();
  await expect(chat).toBeHidden();
  await expect(page.getByRole("button", { name: BOTON })).toBeFocused();
});

test("al escribir responde con honestidad y ofrece pasarlo al equipo", async ({ page }) => {
  await page.goto("/");
  const chat = await abrir(page);
  await chat.getByLabel("Escribile a Hifa").fill("necesito una pala");
  await chat.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(chat.getByRole("log")).toContainText("necesito una pala");
  await expect(chat.getByRole("log")).toContainText(/todavía/i);
  await expect(chat.getByRole("log")).toContainText(/imagin/i);
  await expect(chat.getByRole("log")).toContainText("¿Querés que se lo pase al equipo de NetX?");
});

test("aceptar envía a /api/reportes y confirma con el número", async ({ page }) => {
  let enviado: Record<string, unknown> = {};
  await page.route("**/api/reportes", (ruta) => {
    enviado = ruta.request().postDataJSON();
    return ruta.fulfill({ status: 200, json: { ok: true, numero: 50 } });
  });
  await page.goto("/");
  const chat = await abrir(page);
  await chat.getByLabel("Escribile a Hifa").fill("una huerta compartida");
  await chat.getByRole("button", { name: "Enviar", exact: true }).click();
  await chat.getByRole("button", { name: "Sí, pasalo" }).click();
  await expect(chat.getByRole("log")).toContainText("Se lo pasé al equipo (#50)");
  expect(enviado.tipo).toBe("idea");
  expect(enviado.quePaso).toBe("una huerta compartida");
});

test("si el envío falla, ofrece copiar el texto", async ({ page }) => {
  await page.route("**/api/reportes", (ruta) => ruta.fulfill({ status: 503, json: { ok: false } }));
  await page.goto("/");
  const chat = await abrir(page);
  await chat.getByRole("button", { name: "Tengo una pregunta" }).click();
  await chat.getByLabel("Escribile a Hifa").fill("¿Cuándo abre?");
  await chat.getByRole("button", { name: "Enviar", exact: true }).click();
  await chat.getByRole("button", { name: "Sí, pasalo" }).click();
  await expect(chat.getByRole("button", { name: "Copiar el texto" })).toBeVisible();
  await expect(chat.getByRole("button", { name: "Reintentar" })).toBeVisible();
});

test("la conversación se guarda en el navegador y se puede borrar", async ({ page }) => {
  await page.goto("/");
  let chat = await abrir(page);
  await chat.getByLabel("Escribile a Hifa").fill("hola hifa");
  await chat.getByRole("button", { name: "Enviar", exact: true }).click();
  await page.reload();
  chat = await abrir(page);
  await expect(chat.getByRole("log")).toContainText("hola hifa");
  await chat.getByRole("button", { name: "Borrar conversación" }).click();
  await expect(chat.getByRole("log")).not.toContainText("hola hifa");
  await page.reload();
  chat = await abrir(page);
  await expect(chat.getByRole("log")).not.toContainText("hola hifa");
});

test("axe: el chat abierto no tiene violaciones serias o críticas", async ({ page }) => {
  await page.goto("/");
  const chat = await abrir(page);
  await chat.getByLabel("Escribile a Hifa").fill("una idea");
  await chat.getByRole("button", { name: "Enviar", exact: true }).click();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});
