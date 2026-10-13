import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";

test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

async function completar(page: Page) {
  await page.getByLabel(/^Nombre de la comunidad/).fill("Los Álamos");
  await page.getByLabel(/^Persona que lidera/).fill("Ana Ejemplo");
  await page.getByLabel(/^Contacto de esa persona/).fill("contacto de ejemplo");
  await page.getByLabel(/^Cantidad de personas/).fill("12");
  await page.getByLabel(/^Cantidad de hogares/).fill("4");
  await page.getByLabel(/^Qué van a producir/).fill("Granos y harinas");
  await page.getByLabel(/^Qué aportarían al pozo común/).fill("Harina para el núcleo común");
  await page.getByLabel(/^Forma jurídica/).selectOption("cooperativa");
  await page.getByLabel(/^Cómo toman decisiones/).fill("Por consenso");
  await page.getByLabel(/^Cuál sería su ritual/).fill("Una minga");
  await page.getByLabel(/^Compromiso inicial de tiempo/).fill("10 horas por semana");
}

test("desde el mapa, el Barrio 3 ofrece proponer una comunidad", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(page.locator('[aria-label^="Barrio "]')).toHaveCount(12);
  await page.locator('[aria-label^="Barrio 3 "]').click();
  const ficha = page.getByRole("complementary", { name: "Ficha del territorio" });
  await ficha.getByRole("link", { name: "Proponer una comunidad" }).click();
  await expect(page).toHaveURL(/\/tribus\/grano\/postular$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Barrio 3");
});

test("la página del barrio vacante lleva al formulario", async ({ page }) => {
  await page.goto("/tribus/grano");
  await page.getByRole("link", { name: "Proponer una comunidad" }).click();
  await expect(page).toHaveURL(/\/tribus\/grano\/postular$/);
});

test("muestra los requisitos y las preguntas, con un solo main", async ({ page }) => {
  await page.goto("/tribus/grano/postular");
  const req = page.getByRole("region", { name: /Requisitos para postular/ });
  await expect(req.getByRole("listitem")).toHaveCount(4);
  await expect(req).toContainText("al menos 3 hogares");
  await expect(page.getByText("Prototipo interno · datos de ejemplo").first()).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("group")).toHaveCount(8);
});

test("el requisito del Pacto de convivencia lleva el ⚖", async ({ page }) => {
  await page.goto("/tribus/grano/postular");
  const req = page.getByRole("region", { name: /Requisitos para postular/ });
  await expect(req.getByRole("button", { name: "Qué significa legalmente: Pacto de convivencia" })).toBeVisible();
});

test("el selector de forma jurídica está en su grupo y se puede elegir", async ({ page }) => {
  await page.goto("/tribus/grano/postular");
  const grupo = page.getByRole("group", { name: /Forma jurídica/ });
  await expect(grupo.getByLabel(/^Forma jurídica/)).toBeVisible();
});

test("/netx muestra sin dato (no 0) si el navegador no deja leer", async ({ page }) => {
  await page.addInitScript(() => {
    // El consentimiento de privacidad ya está dado (lo siembra la fixture): lo demás no se puede leer.
    const leer = Storage.prototype.getItem;
    Storage.prototype.getItem = function (clave: string) {
      if (String(clave).endsWith("lh-consentimiento")) return leer.call(this, clave);
      throw new Error("bloqueado");
    };
  });
  await page.goto("/netx");
  await expect(page.getByTestId("total-postulaciones")).toContainText("sin dato");
});

test("no existe el formulario para barrios que no están vacantes", async ({ page }) => {
  for (const id of ["valle", "monte", "no-existe"]) {
    const r = await page.goto(`/tribus/${id}/postular`);
    expect(r?.status(), id).toBe(404);
  }
});

test("falta el nombre: error junto al campo y no se envía", async ({ page }) => {
  await page.goto("/tribus/grano/postular");
  await completar(page);
  await page.getByLabel(/^Nombre de la comunidad/).fill("");
  await page.getByRole("button", { name: "Enviar postulación (simulado)" }).click();
  const campo = page.getByLabel(/^Nombre de la comunidad/);
  await expect(campo).toHaveAttribute("aria-invalid", "true");
  await expect(campo).toBeFocused();
  await expect(page.getByText("Escribí el nombre de la comunidad")).toBeVisible();
  await expect(page.getByText("Recibimos tu postulación")).toHaveCount(0);
});

test("enviar: confirmación, Agendar una llamada en otra pestaña y conteo en /netx", async ({ page }) => {
  await page.goto("/netx");
  await expect(page.getByTestId("total-postulaciones")).toHaveText("0");
  await page.goto("/tribus/grano/postular");
  await completar(page);
  await page.getByRole("button", { name: "Enviar postulación (simulado)" }).click();
  await expect(
    page.getByText("Recibimos tu postulación (simulado). Un administrador del Lighthouse la va a revisar."),
  ).toBeVisible();
  const llamada = page.getByRole("link", { name: /Agendar una llamada/ });
  await expect(llamada).toHaveAttribute("href", "https://calendly.com/netx-ejemplo/postulacion");
  await expect(llamada).toHaveAttribute("target", "_blank");
  await page.goto("/netx");
  await expect(page.getByTestId("total-postulaciones")).toHaveText("1");
  await expect(page.getByRole("row", { name: /Los Álamos/ })).toBeVisible();
});

test("axe sin violaciones serias o críticas: formulario con errores y confirmación", async ({ page }) => {
  await page.goto("/tribus/grano/postular");
  await page.getByRole("button", { name: "Enviar postulación (simulado)" }).click();
  await expect(page.getByText("Escribí el nombre de la comunidad")).toBeVisible();
  const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
  const graves = async () => {
    const r = await new AxeBuilder({ page }).withTags(tags).analyze();
    return r.violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }));
  };
  expect(await graves()).toEqual([]);
  await completar(page);
  await page.getByRole("button", { name: "Enviar postulación (simulado)" }).click();
  await expect(page.getByRole("link", { name: /Agendar una llamada/ })).toBeVisible();
  expect(await graves()).toEqual([]);
});
