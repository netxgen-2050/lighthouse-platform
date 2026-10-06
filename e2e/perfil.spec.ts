import { expect, test, type Page } from "@playwright/test";

const PREGUNTAS = [
  "¿Qué te trae a BioPueblo?",
  "¿Qué paisaje te imaginás?",
  "¿Cómo te gustaría decidir en comunidad?",
  "¿Qué sabés hacer que pueda sumar?",
  "¿Cuánto tiempo podrías dedicar?",
  "¿Qué no negociarías?",
];

async function responder(page: Page, texto: string) {
  await page.getByLabel("Tu respuesta").fill(texto);
  await page.getByRole("button", { name: "Responder" }).click();
}

test("responder la primera pregunta muestra la respuesta y la segunda pregunta", async ({ page }) => {
  await page.goto("/perfil");
  await expect(page.getByRole("heading", { name: "Contale al agente quién sos" })).toBeVisible();
  const conversacion = page.locator("[aria-live=polite]");
  await expect(conversacion).toContainText(PREGUNTAS[0]);
  await expect(conversacion).not.toContainText(PREGUNTAS[1]);
  await responder(page, "Vivir en comunidad");
  await expect(conversacion).toContainText("Vivir en comunidad");
  await expect(conversacion).toContainText(PREGUNTAS[1]);
  await expect(page.getByLabel("Tu respuesta")).toBeFocused();
});

test("respuesta vacía muestra error asociado al campo y no avanza", async ({ page }) => {
  await page.goto("/perfil");
  await page.getByRole("button", { name: "Responder" }).click();
  const error = page.locator("#error-respuesta");
  await expect(error).toContainText("escribí una respuesta");
  const campo = page.getByLabel("Tu respuesta");
  await expect(campo).toHaveAttribute("aria-invalid", "true");
  await expect(campo).toHaveAttribute("aria-describedby", (await error.getAttribute("id")) ?? "");
  await expect(page.locator("[aria-live=polite]")).toContainText(PREGUNTAS[0]);
  await page.getByLabel("Tu respuesta").fill("   ");
  await page.getByRole("button", { name: "Responder" }).click();
  await expect(page.locator("[aria-live=polite]")).toContainText(PREGUNTAS[0]);
});

test("confirmar marca el dato y sube el avance", async ({ page }) => {
  await page.goto("/perfil");
  await responder(page, "Vivir en comunidad");
  const panel = page.getByRole("complementary");
  await expect(panel).toContainText("0/6 confirmados");
  await expect(panel).toContainText("Qué te trae");
  await expect(panel).toContainText("falta que lo confirmes");
  await panel.getByRole("button", { name: "Confirmar: Qué te trae" }).click();
  await expect(panel).toContainText("Confirmado");
  await expect(panel).toContainText("1/6 confirmados");
});

test("corregir cambia el texto del perfil", async ({ page }) => {
  await page.goto("/perfil");
  await responder(page, "Vivir en comunidad");
  const panel = page.getByRole("complementary");
  await panel.getByRole("button", { name: "Corregir: Qué te trae" }).click();
  await panel.getByLabel("Corregir: Qué te trae").fill("Construir mi casa");
  await panel.getByRole("button", { name: "Confirmar corrección" }).click();
  await expect(panel).toContainText("Construir mi casa");
  await expect(panel).not.toContainText("Vivir en comunidad");
  await expect(panel).toContainText("1/6 confirmados");
});

test("propuesta larga se recorta a 80 caracteres", async ({ page }) => {
  await page.goto("/perfil");
  await responder(page, "palabra ".repeat(30));
  const item = page.getByRole("complementary").locator("li").first();
  const texto = (await item.locator("span").nth(1).innerText()).trim();
  expect(texto.length).toBeLessThanOrEqual(80);
  expect(texto.endsWith("…")).toBe(true);
});

test("aviso de datos locales; recargar conserva y borrar reinicia", async ({ page }) => {
  await page.goto("/perfil");
  await expect(page.getByText("Tus respuestas quedan solo en este navegador.")).toBeVisible();
  await responder(page, "Uno");
  await responder(page, "Dos");
  await page.reload();
  const conversacion = page.locator("[aria-live=polite]");
  await expect(conversacion).toContainText(PREGUNTAS[2]);
  await expect(conversacion).toContainText("Uno");
  await expect(conversacion).toContainText("Dos");
  await expect(page.getByRole("complementary").locator("li")).toHaveCount(2);
  await page.getByRole("button", { name: "Borrar mis respuestas" }).click();
  await expect(conversacion).toContainText(PREGUNTAS[0]);
  await expect(page.getByRole("complementary").locator("li")).toHaveCount(0);
  await page.reload();
  await expect(conversacion).toContainText(PREGUNTAS[0]);
  await expect(page.getByRole("complementary").locator("li")).toHaveCount(0);
});

test("entrevista completa: cierre con enlace a tribus y sin pedidos al servidor", async ({ page }) => {
  await page.goto("/perfil");
  await expect(page.getByText("Tus respuestas quedan solo en este navegador.")).toBeVisible();
  const pedidos: string[] = [];
  page.on("request", (r) => {
    const m = r.method();
    const u = r.url();
    // Ningún pedido que no sea GET, ni que lleve las respuestas en la URL o en el cuerpo.
    if (m !== "GET" || u.includes("secreto-") || (r.postData() ?? "").includes("secreto-")) pedidos.push(`${m} ${u}`);
  });
  for (let i = 0; i < 6; i++) {
    await expect(page.locator("[aria-live=polite]")).toContainText(PREGUNTAS[i]);
    await responder(page, `secreto-${i}`);
  }
  await expect(page.locator("[aria-live=polite]")).toContainText("Gracias");
  await expect(page.getByLabel("Tu respuesta")).toHaveCount(0);
  const enlace = page.getByRole("link", { name: "Ver las tribus" });
  await expect(enlace).toHaveAttribute("href", "/tribus");
  expect(pedidos).toEqual([]);
});

test("sin respuestas el panel lo dice, con teclado se puede responder", async ({ page }) => {
  await page.goto("/perfil");
  await expect(page.getByText("Los datos aparecen acá a medida que conversan.")).toBeVisible();
  await page.getByLabel("Tu respuesta").focus();
  await page.keyboard.type("Con teclado");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator("[aria-live=polite]")).toContainText("Con teclado");
});
