import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const LEYO = "Leí el manifiesto con atención y entiendo que sumarme es comprometerme con un grupo de personas";
const CUIDAR = "Me comprometo a cuidar estos acuerdos y a hablar con la comunidad si algún día no puedo cumplirlos";

const campanita = (page: Page) => page.getByRole("link", { name: /^Notificaciones|notificaci(ón|ones) sin leer$/ });

async function adherirYSerAceptada(page: Page) {
  await page.goto("/tribus/valle/manifiesto");
  await page.getByRole("region", { name: "Texto del manifiesto" }).evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.getByLabel(LEYO).check();
  await page.getByLabel(CUIDAR).check();
  await page.getByRole("button", { name: "Adherir", exact: true }).click();
  await page.getByRole("button", { name: "Simular: la comunidad me acepta" }).click();
}

function semilla(page: Page, eventos: object[]) {
  return page.addInitScript((e) => {
    if (!window.localStorage.getItem("lh-actividad")) window.localStorage.setItem("lh-actividad", JSON.stringify(e));
  }, eventos);
}

const evento = (id: string, texto: string, fecha: string, extra = {}) => ({
  id,
  tipo: "x",
  texto,
  fecha,
  enlace: "/tribus",
  notificacion: true,
  leida: false,
  ...extra,
});

test("sin novedades: la campanita no muestra número y la bandeja lo explica", async ({ page }) => {
  await page.goto("/bandeja");
  await expect(campanita(page)).toHaveAttribute("aria-label", "Notificaciones, sin novedades");
  await expect(page.getByText("Todavía no tenés notificaciones")).toBeVisible();
  await expect(page.getByText("Pronto vas a poder recibir mensajes de tu comunidad y del equipo")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
});

test("adherir y ser aceptada deja una notificación en la bandeja", async ({ page }) => {
  await adherirYSerAceptada(page);
  await expect(campanita(page)).toHaveAttribute("aria-label", "1 notificación sin leer");
  await campanita(page).click();
  await expect(page).toHaveURL(/\/bandeja$/);
  await expect(page.getByRole("link", { name: "Valle Solar aceptó tu adhesión" })).toBeVisible();
});

test("2 sin leer: la campanita lo dice en texto; marcar todas leídas quita el número", async ({ page }) => {
  await semilla(page, [
    evento("1", "Vieja", "2026-10-01T10:00:00Z"),
    evento("2", "Nueva", "2026-10-02T10:00:00Z"),
  ]);
  await page.goto("/bandeja");
  await expect(campanita(page)).toHaveAttribute("aria-label", "2 notificaciones sin leer");
  await expect(campanita(page)).toContainText("2");
  const items = page.getByRole("listitem").filter({ has: page.getByRole("link", { name: /Vieja|Nueva/ }) });
  await expect(items.first()).toContainText("Nueva");
  await page.getByRole("button", { name: "Marcar todas como leídas" }).click();
  await expect(campanita(page)).toHaveAttribute("aria-label", "Notificaciones, sin novedades");
  await expect(campanita(page)).not.toContainText("2");
});

test("un aviso simulado futuro no cuenta hasta que llega", async ({ page }) => {
  await semilla(page, [
    evento("1", "Todavía no", "2026-10-01T10:00:00Z", { visibleDesde: "2999-01-01T00:00:00Z" }),
    evento("2", "Actividad propia", "2026-10-01T10:00:00Z", { notificacion: false }),
  ]);
  await page.goto("/bandeja");
  await expect(campanita(page)).toHaveAttribute("aria-label", "Notificaciones, sin novedades");
  await expect(page.getByText("Todavía no", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Actividad propia")).toHaveCount(0);
});

test("axe sin violaciones serias o críticas: /bandeja con notificaciones", async ({ page }) => {
  await semilla(page, [evento("1", "Aviso de prueba", "2026-10-01T10:00:00Z")]);
  await page.goto("/bandeja");
  await expect(page.getByRole("link", { name: "Aviso de prueba" })).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});
