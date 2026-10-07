import { expect, test, type Page } from "@playwright/test";

async function registrar(
  page: Page,
  o: { tipo?: string; clase?: string; descripcion: string; horas?: string; bienes?: string; para?: string },
) {
  await page.getByRole("radio", { name: o.tipo ?? "Ofrezco" }).check();
  await page.getByRole("radio", { name: o.clase ?? "Tiempo" }).check();
  await page.getByLabel("Descripción").fill(o.descripcion);
  if (o.horas !== undefined) await page.getByLabel("Horas por mes").fill(o.horas);
  if (o.bienes !== undefined) await page.getByLabel("Cantidad orientativa").fill(o.bienes);
  if (o.para) await page.getByLabel("Para quién").selectOption({ label: o.para });
  await page.getByRole("button", { name: "Registrar" }).click();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/compromisos");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test("registrar una oferta de tiempo", async ({ page }) => {
  await registrar(page, { descripcion: "Taller de compost", horas: "8", para: "Semilla Viva" });
  await expect(page.getByText("Ofrezco · Tiempo · Taller de compost · 8 h/mes · Para: Semilla Viva")).toBeVisible();
});

test("necesidad de bienes sin cantidad muestra sin dato", async ({ page }) => {
  await registrar(page, { tipo: "Necesito", clase: "Bienes", descripcion: "Herramientas de poda" });
  await expect(page.getByText(/Herramientas de poda · sin dato/)).toBeVisible();
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

test("la clase Plata existe junto a Tiempo y Bienes", async ({ page }) => {
  const grupo = page.getByRole("group", { name: "Clase" });
  await expect(grupo.getByRole("radio")).toHaveCount(3);
  await expect(grupo).toContainText("Tiempo");
  await expect(grupo).toContainText("Bienes");
  await expect(grupo).toContainText("Plata");
});

test("registrar plata con monto en USD", async ({ page }) => {
  await page.getByRole("radio", { name: "Necesito" }).check();
  await page.getByRole("radio", { name: "Plata" }).check();
  await page.getByLabel("Descripción").fill("Fondo para semillas");
  await page.getByLabel("Monto orientativo en USD").fill("500");
  await page.getByRole("button", { name: "Registrar" }).click();
  await expect(page.getByText("Necesito · Plata · Fondo para semillas · USD 500 · Para: El Lighthouse en general")).toBeVisible();
});

test("plata sin monto muestra sin dato", async ({ page }) => {
  await registrar(page, { clase: "Plata", descripcion: "Aporte abierto" });
  await expect(page.getByText(/Aporte abierto · sin dato/)).toBeVisible();
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
  await expect(page.getByText(/Primero/)).toBeVisible();
  await page.getByRole("button", { name: "Borrar todo" }).click();
  await expect(page.getByText("Todavía no registraste compromisos.")).toBeVisible();
});

test("recargar conserva los compromisos", async ({ page }) => {
  await registrar(page, { descripcion: "Uno", horas: "1" });
  await registrar(page, { descripcion: "Dos", horas: "2" });
  await page.reload();
  await expect(page.getByText(/Uno/)).toBeVisible();
  await expect(page.getByText(/Dos/)).toBeVisible();
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
  await page.keyboard.press("Tab"); // Para quién
  await page.keyboard.press("Tab"); // Registrar
  await expect(page.getByRole("button", { name: "Registrar" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Compromiso registrado.");
  await expect(page.getByText(/Ayuda con la huerta · 6 h\/mes/)).toBeVisible();
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
  await expect(page.getByText(/Uno/)).toBeVisible();
  await expect(page.getByText("Todavía no registraste compromisos.")).toHaveCount(0);
});

test("exactamente un main y Compromisos marcado en el encabezado", async ({ page }) => {
  await expect(page.getByRole("main")).toHaveCount(1);
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Compromisos" })).toHaveAttribute("aria-current", "page");
});
