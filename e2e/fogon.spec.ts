import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("lista las cinco decisiones con dónde, regla y ⚖, y el aviso de prototipo", async ({ page }) => {
  const respuesta = await page.goto("/fogon");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Lo que se está decidiendo" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(5);
  const bomba = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Usar el fondo común para la bomba solar" }) });
  await expect(bomba).toContainText("Asamblea de residentes");
  await expect(bomba).toContainText("Consenso");
  await expect(bomba.getByRole("button", { name: "Qué significa legalmente: Reglamento de Soluna, art. 35" })).toBeVisible();
});

test("quien no puede votar ve el motivo", async ({ page }) => {
  await page.goto("/fogon");
  await expect(page.getByText("Solo residentes")).toHaveCount(2);
  await expect(page.getByText("No sos beneficiaria/o")).toBeVisible();
  await expect(page.getByRole("button", { name: "Votar" })).toHaveCount(2);
});

test("filtrar por Fideicomiso deja solo el presupuesto de obra", async ({ page }) => {
  await page.goto("/fogon");
  await page.getByRole("button", { name: "Fideicomiso" }).click();
  await expect(page.getByRole("button", { name: "Fideicomiso" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(["Presupuesto de obra 2027 del macrolote"]);
  await page.getByRole("button", { name: "Todas" }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(5);
});

test("votar a favor en la huerta actualiza el conteo, sin red, y sobrevive a la recarga", async ({ page }) => {
  await page.goto("/fogon");
  const pedidos: string[] = [];
  page.on("request", (r) => {
    const u = new URL(r.url());
    const claves = [...u.searchParams.keys()];
    if (r.method() === "GET" && claves.length === 1 && claves[0] === "_rsc" && !u.hash) return;
    if (["fetch", "xhr", "websocket", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") pedidos.push(`${r.method()} ${r.url()}`);
  });
  const huerta = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Plan de huerta comunitaria 2027" }) });
  await expect(huerta).toContainText("A favor 14");
  await huerta.getByRole("button", { name: "Votar" }).click();
  await huerta.getByRole("button", { name: "A favor" }).click();
  await expect(huerta.getByText("Tu voto: A favor (simulado)")).toBeVisible();
  await expect(huerta).toContainText("A favor 15");
  expect(pedidos).toEqual([]);
  await page.reload();
  await expect(huerta.getByText("Tu voto: A favor (simulado)")).toBeVisible();
  await expect(huerta).toContainText("A favor 15");
});

test("como Lucas se puede votar en la asamblea y en el fideicomiso", async ({ page }) => {
  await page.goto("/fogon");
  await page.getByLabel("Persona de ejemplo").selectOption("lucas");
  await expect(page.getByRole("button", { name: "Votar" })).toHaveCount(5);
  await expect(page.getByText("Solo residentes")).toHaveCount(0);
  const bomba = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: /bomba solar/ }) });
  await bomba.getByRole("button", { name: "Votar" }).click();
  await bomba.getByRole("button", { name: "Abstención" }).click();
  await expect(bomba).toContainText("Abstención 3");
});

test("teclado: se vota solo con teclado", async ({ page }) => {
  await page.goto("/fogon");
  const boton = page.getByRole("button", { name: "Votar" }).first();
  await boton.focus();
  await page.keyboard.press("Enter");
  const favor = page.getByRole("button", { name: "A favor" });
  await favor.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Tu voto: A favor (simulado)")).toBeVisible();
});

test("almacenamiento bloqueado: avisa y no registra el voto", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("bloqueado", "SecurityError");
    };
  });
  await page.goto("/fogon");
  await page.getByRole("button", { name: "Votar" }).first().click();
  await page.getByRole("button", { name: "A favor" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "no permite guardar datos" })).toBeVisible();
  await expect(page.getByText("Tu voto: A favor (simulado)")).toHaveCount(0);
});

test("axe sin violaciones serias o críticas en /fogon", async ({ page }) => {
  await page.goto("/fogon");
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});
