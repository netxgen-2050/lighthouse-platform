import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";

const LEYO = "Leí el manifiesto con atención y entiendo que sumarme es comprometerme con un grupo de personas";
const CUIDAR = "Me comprometo a cuidar estos acuerdos y a hablar con la comunidad si algún día no puedo cumplirlos";

async function alFinal(page: Page) {
  await page.getByRole("region", { name: "Texto del manifiesto" }).evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
}

async function adherirAValle(page: Page) {
  await page.goto("/tribus/valle/manifiesto");
  await alFinal(page);
  await page.getByLabel(LEYO).check();
  await page.getByLabel(CUIDAR).check();
  await page.getByRole("button", { name: "Adherir", exact: true }).click();
}

test("quien no es miembro ve leer y adherir, y no proponer pacto ni sala", async ({ page }) => {
  await page.goto("/tribus/valle");
  await expect(page.getByRole("link", { name: "Leer el manifiesto de la tribu" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Adherir al manifiesto de la tribu" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Proponer mi pacto" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Entrar a la sala" })).toHaveCount(0);
});

test("leer: título, introducción y compromisos de Valle Solar", async ({ page }) => {
  await page.goto("/tribus/valle");
  await page.getByRole("link", { name: "Leer el manifiesto de la tribu" }).click();
  await expect(page).toHaveURL(/\/tribus\/valle\/manifiesto$/);
  await expect(page.getByRole("heading", { level: 1, name: "Manifiesto de Valle Solar" })).toBeVisible();
  await expect(page.getByText(/crianza compartida/).first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /1\. / })).toBeVisible();
  const compromisos = await page.locator("ol > li").count();
  expect(compromisos).toBeGreaterThanOrEqual(5);
  expect(compromisos).toBeLessThanOrEqual(7);
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
});

test("adherir queda deshabilitado hasta llegar al final y marcar las dos casillas", async ({ page }) => {
  // Ventana baja: el texto no entra entero y hay que desplazarse.
  await page.setViewportSize({ width: 1000, height: 500 });
  await page.goto("/tribus/valle/manifiesto");
  const adherir = page.getByRole("button", { name: "Adherir", exact: true });
  await expect(adherir).toBeDisabled();
  await expect(page.getByText(/falta llegar al final del texto/)).toBeVisible();

  await page.getByLabel(LEYO).check();
  await page.getByLabel(CUIDAR).check();
  await expect(adherir).toBeDisabled();

  await alFinal(page);
  await expect(adherir).toBeEnabled();

  await page.getByLabel(CUIDAR).uncheck();
  await expect(adherir).toBeDisabled();
  await expect(page.getByText(/falta marcar las dos casillas/)).toBeVisible();
});

test("adherir manda el pedido y la aceptación simulada hace miembro solo de esa tribu, también al recargar", async ({ page }) => {
  await adherirAValle(page);
  await expect(page.getByText("Tu pedido llegó a Valle Solar. Quien la administra lo va a revisar.")).toBeVisible();

  // El pedido persiste.
  await page.goto("/tribus/valle");
  await expect(page.getByText("Tu pedido llegó a Valle Solar. Quien la administra lo va a revisar.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Proponer mi pacto" })).toHaveCount(0);

  await page.getByRole("button", { name: "Simular: la comunidad me acepta" }).click();
  await expect(page.getByRole("link", { name: "Proponer mi pacto" })).toHaveAttribute("href", "/pactos?comunidad=valle");
  await expect(page.getByRole("button", { name: "Entrar a la sala" })).toBeVisible();
  await expect(page.getByText(/Adherir al manifiesto/)).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole("link", { name: "Proponer mi pacto" })).toBeVisible();
  await expect(page.getByText(/Adherir al manifiesto/)).toHaveCount(0);

  // Otra tribu sigue sin membresía.
  await page.goto("/tribus/taller");
  await expect(page.getByRole("link", { name: "Adherir al manifiesto de la tribu" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Proponer mi pacto" })).toHaveCount(0);
});

test("la aceptación simulada también se puede hacer desde la página del manifiesto", async ({ page }) => {
  await adherirAValle(page);
  await page.getByRole("button", { name: "Simular: la comunidad me acepta" }).click();
  await expect(page.getByText("Ya sos parte de Valle Solar.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Proponer mi pacto" })).toHaveAttribute("href", "/pactos?comunidad=valle");
  await expect(page.getByRole("button", { name: "Adherir", exact: true })).toHaveCount(0);
});

test("el Lighthouse tiene su pacto de convivencia y su resumen ofrece lo mismo", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect(page.getByRole("heading", { name: "Pertenecer al Lighthouse" })).toBeVisible();
  await page.getByRole("link", { name: "Leer el manifiesto del Lighthouse" }).click();
  await expect(page).toHaveURL(/\/tribus\/lighthouse\/manifiesto$/);
  await expect(page.getByRole("heading", { level: 1, name: "Pacto de convivencia del Lighthouse" })).toBeVisible();

  await alFinal(page);
  await page.getByLabel(LEYO).check();
  await page.getByLabel(CUIDAR).check();
  await page.getByRole("button", { name: "Adherir", exact: true }).click();
  await expect(page.getByText("Tu pedido llegó al Lighthouse. Quien lo administra lo va a revisar.")).toBeVisible();

  await page.goto("/territorios/lighthouse");
  await page.getByRole("button", { name: "Simular: la comunidad me acepta" }).click();
  await expect(page.getByRole("link", { name: "Proponer mi pacto" })).toHaveAttribute("href", "/pactos?comunidad=lighthouse");
  // Ser miembro del Lighthouse no hace miembro de una tribu.
  await page.goto("/tribus/valle");
  await expect(page.getByRole("link", { name: "Adherir al manifiesto de la tribu" })).toBeVisible();
});

test("las tribus activas y en formación tienen manifiesto; las vacantes no ofrecen adherir", async ({ page }) => {
  for (const id of ["semilla", "barda", "monte", "agua", "valle", "taller", "avelan", "puerto"]) {
    const r = await page.goto(`/tribus/${id}/manifiesto`);
    expect(r?.status(), id).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }), id).toContainText("Manifiesto");
  }
  const vacante = await page.goto("/tribus/grano/manifiesto");
  expect(vacante?.status()).toBe(404);
  await page.goto("/tribus/grano");
  await expect(page.getByText(/manifiesto/i)).toHaveCount(0);
});

test("con teclado: se llega al texto, se marcan las casillas y se adhiere", async ({ page }) => {
  await page.goto("/tribus/valle/manifiesto");
  const region = page.getByRole("region", { name: "Texto del manifiesto" });
  await region.focus();
  await expect(region).toBeFocused();
  await page.keyboard.press("End");
  await page.getByLabel(LEYO).focus();
  await page.keyboard.press("Space");
  await page.getByLabel(CUIDAR).focus();
  await page.keyboard.press("Space");
  const adherir = page.getByRole("button", { name: "Adherir", exact: true });
  await expect(adherir).toBeEnabled();
  await adherir.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Tu pedido llegó a Valle Solar/)).toBeVisible();
  // El botón desapareció: el foco pasa al aviso en vez de perderse.
  await expect(page.getByRole("status").filter({ hasText: /Tu pedido llegó/ })).toBeFocused();
  await page.getByRole("button", { name: "Simular: la comunidad me acepta" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Ya sos parte de Valle Solar." })).toBeFocused();
});

test("al aceptar desde la tribu el foco pasa al aviso, y al volver con el pedido guardado no hay aviso", async ({ page }) => {
  await adherirAValle(page);
  await page.goto("/tribus/valle");
  // Estado guardado: texto común, la zona de avisos sigue vacía.
  await expect(page.getByText(/Tu pedido llegó a Valle Solar/)).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: /Tu pedido llegó/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Simular: la comunidad me acepta" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Ya sos parte de Valle Solar." })).toBeFocused();
});

test("al aceptar desde el Lighthouse el foco pasa al aviso", async ({ page }) => {
  await page.goto("/tribus/lighthouse/manifiesto");
  await alFinal(page);
  await page.getByLabel(LEYO).check();
  await page.getByLabel(CUIDAR).check();
  await page.getByRole("button", { name: "Adherir", exact: true }).click();
  await page.goto("/territorios/lighthouse");
  await page.getByRole("button", { name: "Simular: la comunidad me acepta" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status").filter({ hasText: "Ya sos parte del Lighthouse." })).toBeFocused();
});

test("el ⚖ de adherir está junto al botón y junto al enlace",async ({ page }) => {
  await page.goto("/tribus/valle");
  await expect(page.getByRole("button", { name: "Qué significa legalmente: Adherir a un manifiesto" })).toHaveCount(1);
  await page.goto("/tribus/valle/manifiesto");
  await expect(page.getByRole("button", { name: "Qué significa legalmente: Adherir a un manifiesto" })).toHaveCount(2);
});

for (const ruta of ["/tribus/valle/manifiesto", "/tribus/valle", "/territorios/lighthouse"]) {
  test(`axe sin violaciones serias o críticas en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    await expect(page.getByText(/manifiesto/i).first()).toBeVisible();
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
  });
}
