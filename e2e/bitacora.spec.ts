import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

const leerBitacora = (page: Page) =>
  page.evaluate(() => JSON.parse(window.localStorage.getItem("lh-bitacora") ?? "[]") as Record<string, unknown>[]);

async function abrirPaseConTeclado(page: Page) {
  const boton = page.getByRole("button", { name: "Qué significa legalmente: Pase Fundador" }).first();
  await boton.focus();
  // El foco programático no cuenta como teclado: Tab hacia atrás y adelante lo deja con :focus-visible.
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("tooltip").filter({ hasText: "Pase Fundador" })).toBeVisible();
}

test("ver el territorio anota el estado del loteo", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect.poll(async () => (await leerBitacora(page)).filter((e) => e.tipo === "estado-loteo").length).toBeGreaterThan(0);
  const entradas = (await leerBitacora(page)).filter((x) => x.tipo === "estado-loteo");
  for (const e of entradas) {
    expect(e.ruta).toBe("/territorios/lighthouse");
    expect(e.huella).toMatch(/^[0-9a-f]{8}$/);
  }
  // La vista completa anota el titular que muestra; la compacta, solo estado y norma corta.
  const completa = entradas.filter((e) => String(e.mostrado).includes("Chacras de Soluna"));
  expect(completa).toHaveLength(1);
  expect(String(completa[0].mostrado)).toContain("Loteo en trámite");
  expect(String(completa[0].mostrado)).toContain("Titular:");
});

test("elegir la finca 502 anota la vista compacta, sin expediente ni titular", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await page.getByText(/Fincas disponibles de Soluna/).click();
  await page.getByRole("button", { name: "Finca 502", exact: true }).click();
  await expect(page.getByRole("note", { name: "Estado administrativo" })).toBeVisible();
  const compactas = async () =>
    (await leerBitacora(page)).filter(
      (e) => e.tipo === "estado-loteo" && !String(e.mostrado).includes("Chacras de Soluna"),
    );
  // Falla si no aparece ninguna entrada compacta: no puede pasar en vacío.
  await expect.poll(async () => (await compactas()).length).toBeGreaterThan(0);
  for (const e of await compactas()) {
    expect(String(e.mostrado)).toContain("Loteo en trámite");
    expect(String(e.mostrado)).not.toContain("Expediente");
    expect(String(e.mostrado)).not.toContain("Titular");
  }
});

test("abrir el ⚖ Pase Fundador con teclado anota el término", async ({ page }) => {
  await page.goto("/sumarte");
  await abrirPaseConTeclado(page);
  await expect.poll(async () => (await leerBitacora(page)).filter((e) => e.clave === "pasefundador").length).toBe(1);
  const [e] = (await leerBitacora(page)).filter((x) => x.clave === "pasefundador");
  expect(e.tipo).toBe("termino-legal");
  expect(e.ruta).toBe("/sumarte");
  expect(e.huella).toMatch(/^[0-9a-f]{8}$/);
});

test("abrir el mismo ⚖ varias veces no repite la entrada", async ({ page }) => {
  await page.goto("/sumarte");
  const boton = page.getByRole("button", { name: "Qué significa legalmente: Pase Fundador" }).first();
  for (let i = 0; i < 3; i++) {
    await boton.hover();
    await expect(page.getByRole("tooltip").filter({ hasText: "Pase Fundador" })).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  }
  expect((await leerBitacora(page)).filter((e) => e.clave === "pasefundador")).toHaveLength(1);
});

test.describe("con pantalla táctil", () => {
  test.use({ hasTouch: true });
  test("tocar el ⚖ Pase Fundador anota el término", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Qué significa legalmente: Pase Fundador" }).first().tap();
    await expect(page.getByRole("tooltip").filter({ hasText: "Pase Fundador" })).toBeVisible();
    await expect.poll(async () => (await leerBitacora(page)).filter((e) => e.clave === "pasefundador").length).toBe(1);
  });
});

test("una bitácora inválida no rompe /panel/bitacora", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("lh-bitacora", "esto no es json {"));
  await page.goto("/panel/bitacora");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Todavía no hay nada anotado en este navegador.")).toBeVisible();
});

test("la página muestra la fila del estado del loteo y descarga el JSON", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect.poll(async () => (await leerBitacora(page)).length).toBeGreaterThan(0);
  await page.goto("/panel/bitacora");
  const fila = page.getByRole("row").filter({ hasText: "Estado del loteo" });
  await expect(fila).toContainText("Chacras de Soluna");
  await expect(fila).toContainText("Borrador: sí");
  const [descarga] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Descargar (JSON)" }).click(),
  ]);
  expect(descarga.suggestedFilename()).toBe("bitacora.json");
  const { readFile } = await import("node:fs/promises");
  const contenido = JSON.parse(await readFile((await descarga.path())!, "utf8")) as unknown[];
  expect(contenido).toEqual(await leerBitacora(page));
});

test("vacía: muestra el mensaje", async ({ page }) => {
  await page.goto("/panel/bitacora");
  await expect(page.getByText("Todavía no hay nada anotado en este navegador.")).toBeVisible();
});

test("borrar todo desde /panel vacía la bitácora", async ({ page }) => {
  await page.goto("/territorios/lighthouse");
  await expect.poll(async () => (await leerBitacora(page)).length).toBeGreaterThan(0);
  await page.goto("/panel");
  page.once("dialog", (d) => void d.accept());
  await page.getByRole("button", { name: "Borrar todo lo de este navegador" }).click();
  await expect(page.getByText("Listo: se borró todo lo guardado en este navegador.")).toBeVisible();
  await page.getByRole("link", { name: "Ver lo que te mostramos" }).click();
  await expect(page.getByText("Todavía no hay nada anotado en este navegador.")).toBeVisible();
});

test("el ⚖ de la bitácora es borrador", async ({ page }) => {
  await page.goto("/panel/bitacora");
  await page.getByRole("button", { name: /Qué significa legalmente: Bitácora de lo que te mostramos/ }).hover();
  const tip = page.getByRole("tooltip").filter({ hasText: "Bitácora de lo que te mostramos" });
  await expect(tip).toContainText("Borrador: texto a revisar");
});

test("a 390 px la página no tiene scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/territorios/lighthouse");
  await expect.poll(async () => (await leerBitacora(page)).length).toBeGreaterThan(0);
  await page.goto("/panel/bitacora");
  await expect(page.getByRole("row").filter({ hasText: "Estado del loteo" })).toBeVisible();
  const ancho = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(ancho).toBe(true);
});
