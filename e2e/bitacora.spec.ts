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
  await expect.poll(async () => (await leerBitacora(page)).filter((e) => e.tipo === "estado-loteo").length).toBe(1);
  const [e] = (await leerBitacora(page)).filter((x) => x.tipo === "estado-loteo");
  expect(e.ruta).toBe("/territorios/lighthouse");
  expect(String(e.mostrado)).toContain("Chacras de Soluna");
  expect(String(e.mostrado)).toContain("Loteo en trámite");
  expect(e.huella).toMatch(/^[0-9a-f]{8}$/);
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
