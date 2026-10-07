import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("muestra título, aviso de prototipo, cuatro planes y la tabla", async ({ page }) => {
  const respuesta = await page.goto("/sumarte");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  for (const plan of ["Explorador", "Miembro de la red", "Pase Fundador", "Plan Tribu"]) {
    await expect(page.getByRole("heading", { level: 2, name: new RegExp(`^${plan}`) })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Qué incluye cada plan" })).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await expect(page.locator("main")).toHaveCount(1);
});

test("cambiar a anual / mensual", async ({ page }) => {
  await page.goto("/sumarte");
  const miembro = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Miembro de la red/ }) });
  await page.getByRole("button", { name: /^Mensual/ }).click();
  await expect(miembro).toContainText("USD 10/mes");
  await page.getByRole("button", { name: /^Anual/ }).click();
  await expect(page.getByRole("button", { name: /^Anual/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /^Mensual/ })).toHaveAttribute("aria-pressed", "false");
  await expect(miembro).toContainText("USD 100/año");
});

test("elegir el nivel Raíz cambia precio y créditos", async ({ page }) => {
  await page.goto("/sumarte");
  const pase = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Pase Fundador/ }) });
  await pase.getByRole("radio", { name: /Raíz/ }).check({ force: true });
  await expect(pase).toContainText("USD 5.000 · pago único");
  await expect(pase).toContainText("USD 1.500 en créditos");
  await expect(pase.getByRole("button", { name: "Quiero el Pase Raíz" })).toBeVisible();
});

test("medidores de la cohorte legibles en texto", async ({ page }) => {
  await page.goto("/sumarte");
  await expect(page.getByText("142 de 300")).toBeVisible();
  await expect(page.getByText("USD 46.000 de USD 75.000")).toBeVisible();
});

test("activar el pase no hace pedidos de red, sobrevive a la recarga y se deshace", async ({ page }) => {
  await page.goto("/sumarte");
  const pedidos: string[] = [];
  page.on("request", (r) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(r.method()) || !r.url().startsWith("http://localhost")) pedidos.push(`${r.method()} ${r.url()}`);
  });
  await page.getByRole("button", { name: "Quiero el Pase Brote" }).click();
  await expect(page.getByText("Pase Brote activo (simulado)")).toBeVisible();
  await expect(page.getByText("143 de 300")).toBeVisible();
  expect(pedidos).toEqual([]);
  await page.reload();
  await expect(page.getByText("Pase Brote activo (simulado)")).toBeVisible();
  await page.getByRole("button", { name: "Volver a Explorador" }).click();
  await expect(page.getByText("Pase Brote activo (simulado)")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Quiero el Pase Brote" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Quiero el Pase Brote" })).toBeVisible();
});

test("pedir invitación suma un lugar y pedir una charla queda simulado", async ({ page }) => {
  await page.goto("/sumarte");
  await expect(page.getByText("22 de 35")).toBeVisible();
  await page.getByRole("button", { name: "Pedir invitación" }).click();
  await expect(page.getByText("Invitación pedida (simulado)")).toBeVisible();
  await expect(page.getByText("23 de 35")).toBeVisible();
  await expect(page.getByText("12 de 15")).toBeVisible();
  await page.getByRole("button", { name: "Pedir una charla" }).click();
  await expect(page.getByText("Charla pedida (simulado)")).toBeVisible();
});

test("los ⚖ del catálogo están en la pantalla", async ({ page }) => {
  await page.goto("/sumarte");
  for (const t of ["Pase Fundador", "Membresía de la red", "Plan Tribu", "Invertir en la empresa", "Círculo por invitación"]) {
    await expect(page.getByRole("button", { name: `Qué significa legalmente: ${t}` })).toBeVisible();
  }
});

test("almacenamiento bloqueado: avisa", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("bloqueado", "SecurityError");
    };
  });
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Quiero el Pase Brote" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "no permite guardar datos" })).toBeVisible();
  await expect(page.getByText("Pase Brote activo (simulado)")).toHaveCount(0);
});

test("teclado: se puede activar el pase solo con teclado", async ({ page }) => {
  await page.goto("/sumarte");
  const boton = page.getByRole("button", { name: "Quiero el Pase Brote" });
  await boton.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Pase Brote activo (simulado)")).toBeFocused();
});

test("axe sin violaciones serias o críticas en /sumarte", async ({ page }) => {
  await page.goto("/sumarte");
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});
