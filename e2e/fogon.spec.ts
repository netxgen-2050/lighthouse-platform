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
    // La barra de comentarios de Vercel (vercel.live) solo existe en los previews: no es la app.
    if (u.hostname.endsWith("vercel.live")) return;
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

test("cambiar de persona con un voto guardado no filtra el voto a quien no puede votar", async ({ page }) => {
  await page.goto("/fogon");
  const bomba = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: /bomba solar/ }) });
  const huerta = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Plan de huerta comunitaria 2027" }) });
  await huerta.getByRole("button", { name: "Votar" }).click();
  await huerta.getByRole("button", { name: "A favor" }).click();
  await page.getByLabel("Persona de ejemplo").selectOption("lucas");
  await expect(huerta.getByText("Tu voto:")).toHaveCount(0);
  await expect(huerta).toContainText("A favor 14");
  await bomba.getByRole("button", { name: "Votar" }).click();
  await bomba.getByRole("button", { name: "A favor" }).click();
  await expect(bomba).toContainText("Tu voto: A favor (simulado)");
  await page.getByLabel("Persona de ejemplo").selectOption("lucia");
  await expect(bomba).toContainText("Solo residentes");
  await expect(bomba.getByText("Tu voto:")).toHaveCount(0);
  await expect(bomba.getByText(/votó a favor/)).toHaveCount(0);
  await expect(huerta).toContainText("Tu voto: A favor (simulado)");
});

test("al votar el foco queda en el botón de la decisión y se anuncia en una región persistente", async ({ page }) => {
  await page.goto("/fogon");
  const region = page.getByRole("status");
  await expect(region).toHaveCount(1);
  await expect(region).toHaveText("");
  const huerta = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Plan de huerta comunitaria 2027" }) });
  await huerta.getByRole("button", { name: "Votar" }).click();
  await huerta.getByRole("button", { name: "A favor" }).click();
  await expect(huerta.getByRole("button", { name: "Cambiar voto" })).toBeFocused();
  await expect(region).toContainText("Tu voto quedó registrado: A favor");
  await page.reload();
  await expect(page.getByRole("status")).toHaveCount(1);
  await expect(page.getByRole("status")).toHaveText("");
});

test("repetir el mismo voto vuelve a escribir el anuncio en la región", async ({ page }) => {
  await page.goto("/fogon");
  const region = page.getByRole("status");
  const huerta = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Plan de huerta comunitaria 2027" }) });
  await huerta.getByRole("button", { name: "Votar" }).click();
  await huerta.getByRole("button", { name: "A favor" }).click();
  await expect(region).toContainText("Tu voto quedó registrado: A favor");
  await region.evaluate((el) => {
    const w = window as unknown as { __cambios: string[] };
    w.__cambios = [];
    new MutationObserver(() => w.__cambios.push(el.textContent ?? "")).observe(el, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });
  await huerta.getByRole("button", { name: "Cambiar voto" }).click();
  await huerta.getByRole("button", { name: "A favor" }).click();
  await expect(huerta.getByRole("button", { name: "Cambiar voto" })).toBeFocused();
  await expect(region).toContainText("Tu voto quedó registrado: A favor");
  const cambios = await page.evaluate(() => (window as unknown as { __cambios: string[] }).__cambios);
  expect(cambios).toContain("");
  expect(cambios[cambios.length - 1]).toContain("Tu voto quedó registrado: A favor");
});

test("teclado: se vota solo con teclado",async ({ page }) => {
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
