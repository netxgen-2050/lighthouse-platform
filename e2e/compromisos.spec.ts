import { expect, test, type Page } from "@playwright/test";

async function registrar(
  page: Page,
  o: { tipo?: string; clase?: string; descripcion: string; horas?: string; bienes?: string },
) {
  await page.getByRole("radio", { name: o.tipo ?? "Ofrezco" }).check();
  await page.getByRole("radio", { name: o.clase ?? "Tiempo" }).check();
  await page.getByLabel("Descripción").fill(o.descripcion);
  if (o.horas !== undefined) await page.getByLabel("Horas por mes").fill(o.horas);
  if (o.bienes !== undefined) await page.getByLabel("Cantidad orientativa").fill(o.bienes);
  await page.getByRole("button", { name: "Registrar" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/compromisos");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

function suLista(page: Page) {
  return page.getByRole("region", { name: "Tus compromisos" });
}

test("registrar una oferta de tiempo", async ({ page }) => {
  await registrar(page, { descripcion: "Taller de compost", horas: "8" });
  await expect(suLista(page).getByText("Ofrezco · Tiempo · Taller de compost · 8 h/mes")).toBeVisible();
});

test("necesidad de bienes sin cantidad muestra sin dato", async ({ page }) => {
  await registrar(page, { tipo: "Necesito", clase: "Bienes", descripcion: "Herramientas de poda" });
  await expect(suLista(page).getByText(/Herramientas de poda · sin dato/)).toBeVisible();
});

test("no existe el campo Para quién", async ({ page }) => {
  await expect(page.getByLabel("Para quién")).toHaveCount(0);
  await expect(page.getByText("Para quién")).toHaveCount(0);
});

test("trueque: sin cantidad, se registra y se publica en el mercado", async ({ page }) => {
  await registrar(page, { clase: "Trueque", descripcion: "Mi trueque de prueba" });
  await expect(suLista(page).getByText("Ofrezco · Trueque · Mi trueque de prueba")).toBeVisible();
  const mercado = page.getByRole("region", { name: "Mercado" });
  await expect(mercado.getByText("Mi trueque de prueba")).toBeVisible();
  await expect(mercado.getByText("Publica: Vos")).toBeVisible();
});

test("el mercado muestra ejemplos, el primer paso y el aviso de match con IA", async ({ page }) => {
  const mercado = page.getByRole("region", { name: "Mercado" });
  await expect(mercado.getByText(/primer paso para entrar al mercado es publicar una oferta o una necesidad/)).toBeVisible();
  await expect(
    mercado.getByText("Pronto, una inteligencia artificial va a sugerirte el mejor match entre ofertas y necesidades."),
  ).toBeVisible();
  await expect(mercado.getByRole("listitem").first()).toBeVisible();
  await expect(mercado.getByText("Publica: Comunidad (ejemplo)").first()).toBeVisible();
  await expect(mercado.getByRole("img")).toHaveCount(0);
});

test("filtrar el mercado por Necesito y Tiempo", async ({ page }) => {
  const mercado = page.getByRole("region", { name: "Mercado" });
  await mercado.getByLabel("Filtrar por tipo").selectOption({ label: "Necesito" });
  await mercado.getByLabel("Filtrar por medio de intercambio").selectOption({ label: "Tiempo" });
  const items = mercado.getByRole("listitem");
  await expect(items).toHaveCount(1);
  await expect(items.first()).toContainText("Necesito · Tiempo");
  await mercado.getByLabel("Filtrar por medio de intercambio").selectOption({ label: "Plata" });
  await expect(items.first()).toContainText("Necesito · Plata");
  await mercado.getByLabel("Filtrar por tipo").selectOption({ label: "Todos" });
  await mercado.getByLabel("Filtrar por medio de intercambio").selectOption({ label: "Todos" });
  await expect(items).toHaveCount(8);
});

test("Me interesa se marca y se desmarca (simulado)", async ({ page }) => {
  const mercado = page.getByRole("region", { name: "Mercado" });
  const boton = mercado.getByRole("button", { name: /^Me interesa: / }).first();
  await boton.click();
  await expect(mercado.getByRole("button", { pressed: true })).toHaveCount(1);
  await expect(mercado.getByText("Te interesa (simulado)")).toBeVisible();
  await mercado.getByRole("button", { pressed: true }).click();
  await expect(mercado.getByRole("button", { pressed: true })).toHaveCount(0);
});

test("lo propio no tiene Me interesa", async ({ page }) => {
  await registrar(page, { descripcion: "Algo propio", horas: "2" });
  const mercado = page.getByRole("region", { name: "Mercado" });
  await expect(mercado.getByRole("button", { name: "Me interesa: Algo propio" })).toHaveCount(0);
});

test("descripción vacía: error asociado, foco y nada agregado", async ({ page }) => {
  await page.getByRole("button", { name: "Registrar" }).click();
  const campo = page.getByLabel("Descripción");
  await expect(campo).toBeFocused();
  await expect(campo).toHaveAttribute("aria-invalid", "true");
  await expect(campo).toHaveAttribute("aria-describedby", "err-descripcion");
  await expect(page.locator("#err-descripcion")).toBeVisible();
  await expect(page.getByText("Todavía no registraste compromisos.")).toBeVisible();
});

for (const h of ["0", "161", "2,5"]) {
  test(`horas fuera de rango (${h}): error y nada agregado`, async ({ page }) => {
    await registrar(page, { descripcion: "Algo", horas: h });
    const campo = page.getByLabel("Horas por mes");
    await expect(campo).toHaveAttribute("aria-describedby", "err-horas");
    await expect(campo).toBeFocused();
    await expect(page.getByText("Todavía no registraste compromisos.")).toBeVisible();
  });
}

test("el medio de intercambio ofrece Tiempo, Bienes, Plata y Trueque", async ({ page }) => {
  const grupo = page.getByRole("group", { name: "Medio de intercambio" });
  await expect(grupo.getByRole("radio")).toHaveCount(4);
  await expect(grupo).toContainText("Tiempo");
  await expect(grupo).toContainText("Bienes");
  await expect(grupo).toContainText("Plata");
  await expect(grupo).toContainText("Trueque");
});

test("registrar plata con monto en USD", async ({ page }) => {
  await page.getByRole("radio", { name: "Necesito" }).check();
  await page.getByRole("radio", { name: "Plata" }).check();
  await page.getByLabel("Descripción").fill("Fondo para semillas");
  await page.getByLabel("Monto orientativo en USD").fill("500");
  await page.getByRole("button", { name: "Registrar" }).click();
  await expect(suLista(page).getByText("Necesito · Plata · Fondo para semillas · USD 500")).toBeVisible();
});

test("plata sin monto muestra sin dato", async ({ page }) => {
  await registrar(page, { clase: "Plata", descripcion: "Aporte abierto" });
  await expect(suLista(page).getByText(/Aporte abierto · sin dato/)).toBeVisible();
});

for (const m of ["0", "1000001", "2,5"]) {
  test(`monto fuera de rango (${m}): error y nada agregado`, async ({ page }) => {
    await page.getByRole("radio", { name: "Plata" }).check();
    await page.getByLabel("Descripción").fill("Algo");
    await page.getByLabel("Monto orientativo en USD").fill(m);
    await page.getByRole("button", { name: "Registrar" }).click();
    const campo = page.getByLabel("Monto orientativo en USD");
    await expect(campo).toHaveAttribute("aria-describedby", "err-monto");
    await expect(campo).toBeFocused();
    await expect(page.getByText("Todavía no registraste compromisos.")).toBeVisible();
  });
}

test("quitar uno y borrar todo", async ({ page }) => {
  await registrar(page, { descripcion: "Primero", horas: "2" });
  await registrar(page, { descripcion: "Segundo", horas: "3" });
  const items = page.getByRole("list").filter({ hasText: "Primero" }).getByRole("listitem");
  await expect(items.first()).toContainText("Segundo");
  await page.getByRole("button", { name: "Quitar Segundo" }).click();
  await expect(page.getByText("Segundo")).toHaveCount(0);
  await expect(suLista(page).getByText(/Primero/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tus compromisos" })).toBeFocused();
  await expect(page.getByRole("status")).toHaveText("Compromiso quitado.");
  await page.getByRole("button", { name: "Borrar todo" }).click();
  await expect(page.getByText("Todavía no registraste compromisos.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tus compromisos" })).toBeFocused();
  await expect(page.getByRole("status")).toHaveText("Se borraron todos los compromisos.");
});

test("avisos de la página y nota de plata", async ({ page }) => {
  await expect(
    page.getByText("Modo demostración: lo que registres queda solo en este navegador."),
  ).toBeVisible();
  await expect(page.getByText("Tribus, personas y cifras de ejemplo.")).toBeVisible();
  await expect(page.getByText("no se cobra ni se paga nada")).toHaveCount(0);
  await page.getByRole("radio", { name: "Plata" }).check();
  await expect(page.getByText(/no se cobra ni se paga nada/)).toBeVisible();
});

test("recargar conserva los compromisos", async ({ page }) => {
  await registrar(page, { descripcion: "Uno", horas: "1" });
  await registrar(page, { descripcion: "Dos", horas: "2" });
  await page.reload();
  await expect(suLista(page).getByText(/Uno/)).toBeVisible();
  await expect(suLista(page).getByText(/Dos/)).toBeVisible();
});

test("sin pedidos al servidor con las descripciones", async ({ page }) => {
  const vistos: string[] = [];
  page.on("request", (r) => vistos.push(`${r.url()} ${r.postData() ?? ""}`));
  await registrar(page, { descripcion: "Secreto-uno", horas: "4" });
  await registrar(page, { descripcion: "Secreto-dos", horas: "5" });
  await page.getByRole("button", { name: "Quitar Secreto-uno" }).click();
  await page.getByRole("button", { name: "Borrar todo" }).click();
  expect(vistos.filter((v) => v.includes("Secreto"))).toEqual([]);
});

test("solo teclado: se registra y se anuncia", async ({ page }) => {
  await page.getByRole("radio", { name: "Ofrezco" }).focus();
  await page.keyboard.press("ArrowDown"); // sin cambio de grupo: sigue en Tipo
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Tab"); // Clase (el seleccionado, Tiempo)
  await page.keyboard.press("Tab"); // Descripción
  await expect(page.getByLabel("Descripción")).toBeFocused();
  await page.keyboard.type("Ayuda con la huerta");
  await page.keyboard.press("Tab"); // Horas
  await page.keyboard.type("6");
  await page.keyboard.press("Tab"); // Registrar
  await expect(page.getByRole("button", { name: "Registrar" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Compromiso registrado.");
  await expect(suLista(page).getByText(/Ayuda con la huerta · 6 h\/mes/)).toBeVisible();
});

test("dos registros seguidos: la región aria-live se vacía y se vuelve a llenar", async ({ page }) => {
  const estado = page.getByRole("status");
  await registrar(page, { descripcion: "Uno", horas: "1" });
  await expect(estado).toHaveText("Compromiso registrado.");
  // Se observan los cambios de texto de la región durante el segundo registro.
  await estado.evaluate((el) => {
    const w = window as unknown as { __vistos: string[] };
    w.__vistos = [];
    new MutationObserver(() => w.__vistos.push(el.textContent ?? "")).observe(el, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  });
  await registrar(page, { descripcion: "Dos", horas: "2" });
  await expect(estado).toHaveText("Compromiso registrado.");
  const vistos = await page.evaluate(() => (window as unknown as { __vistos: string[] }).__vistos);
  expect(vistos).toContain("");
  expect(vistos[vistos.length - 1]).toBe("Compromiso registrado.");
  expect(vistos.indexOf("")).toBeLessThan(vistos.lastIndexOf("Compromiso registrado."));
});

test("al recargar con datos no se muestra el estado vacío", async ({ page }) => {
  await registrar(page, { descripcion: "Uno", horas: "1" });
  await page.reload();
  await expect(suLista(page).getByText(/Uno/)).toBeVisible();
  await expect(page.getByText("Todavía no registraste compromisos.")).toHaveCount(0);
});

test("exactamente un main y Compromisos marcado en el encabezado", async ({ page }) => {
  await expect(page.getByRole("main")).toHaveCount(1);
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Compromisos" })).toHaveAttribute("aria-current", "page");
});
