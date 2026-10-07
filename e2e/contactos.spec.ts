import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

// Next agrega un role="alert" vacío (anunciador de rutas): solo cuentan los que tienen texto.
const alertas = (page: Page) => page.getByRole("alert").filter({ hasText: /\S/ });
const ficha =(page: Page) => page.getByRole("complementary", { name: "Ficha del territorio" });

async function abrirFinca502(page: Page) {
  await page.goto("/territorios/lighthouse?sel=finca-502");
  await expect(ficha(page).getByRole("heading", { name: "Finca 502" })).toBeVisible();
  await ficha(page).getByRole("button", { name: "Consultar por este lote" }).click();
}

test("abrir desde la finca 502: motivo, referencia y aviso del estado administrativo", async ({ page }) => {
  await abrirFinca502(page);
  const form = ficha(page).locator("form");
  await expect(ficha(page)).toContainText("Consulta por un lote · Finca 502");
  await expect(form.getByRole("note", { name: "Estado administrativo" })).toContainText("Loteo en trámite · Ord. 173/2026");
  await expect(form).toContainText("En el prototipo no te pedimos email ni teléfono: el pedido queda solo en este navegador.");
  // Solo hay un campo de texto libre (el mensaje): no se pide nombre, email ni teléfono.
  await expect(form.locator("input[type=text], input[type=email], input[type=tel]")).toHaveCount(0);
  await expect(form.getByRole("textbox")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
});

test("el ⚖ del formulario es un borrador", async ({ page }) => {
  await abrirFinca502(page);
  await ficha(page).getByRole("button", { name: "Qué significa legalmente: Pedir contacto" }).hover();
  const tip = page.getByRole("tooltip").filter({ hasText: "Pedir contacto" });
  await expect(tip).toContainText("Borrador: texto a revisar");
});

test("el canal es obligatorio: error asociado, foco en el campo y nada guardado", async ({ page }) => {
  await abrirFinca502(page);
  await ficha(page).getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(ficha(page).getByText("Elegí cómo preferís que te contactemos").last()).toBeVisible();
  await expect(ficha(page).getByRole("radio", { name: "Email" })).toBeFocused();
  await expect(ficha(page).getByRole("radio", { name: "Email" })).toHaveAccessibleDescription(/Elegí cómo preferís/);
  expect(await page.evaluate(() => window.localStorage.getItem("lh-contactos"))).toBeNull();
});

test("un mensaje de más de 500 caracteres se rechaza", async ({ page }) => {
  await abrirFinca502(page);
  await ficha(page).getByRole("radio", { name: "Email" }).check();
  await ficha(page).getByLabel(/^Mensaje/).fill("a".repeat(501));
  await ficha(page).getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(ficha(page).getByText("El mensaje puede tener hasta 500 caracteres")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("lh-contactos"))).toBeNull();
});

test("cancelar cierra el formulario, devuelve el foco al botón y no guarda", async ({ page }) => {
  await abrirFinca502(page);
  await ficha(page).getByRole("button", { name: "Cancelar" }).click();
  await expect(ficha(page).locator("form")).toHaveCount(0);
  await expect(ficha(page).getByRole("button", { name: "Consultar por este lote" })).toBeFocused();
  expect(await page.evaluate(() => window.localStorage.getItem("lh-contactos"))).toBeNull();
});

test("enviar una consulta: anuncio, sigue tras recargar y aparece en /netx", async ({ page }) => {
  await abrirFinca502(page);
  await ficha(page).getByRole("radio", { name: "WhatsApp" }).check();
  await ficha(page).getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(
    ficha(page).getByRole("status").filter({ hasText: "Pedido recibido (simulado). Lo vería: BioPueblo, vía NetX como agencia." }),
  ).toBeVisible();
  await page.reload();
  await expect(ficha(page).getByText("Consulta enviada (simulado)")).toBeVisible();

  await page.goto("/netx");
  const fila = page.getByRole("row").filter({ hasText: "Finca 502" });
  await expect(fila).toContainText("Consulta por un lote");
  await expect(fila).toContainText("WhatsApp");
  await expect(fila).toContainText("BioPueblo, vía NetX como agencia");
  await expect(fila).toContainText("Loteo en trámite");
  await expect(fila).toContainText("Recibido (simulado)");
  await expect(fila).toContainText("sin dato");
});

test("pedir invitación al círculo: suma uno al medidor y queda en la bandeja", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Pedir invitación" }).click();
  await page.getByRole("radio", { name: "Email" }).check();
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(page.getByText("Invitación pedida (simulado)")).toBeVisible();
  await expect(page.getByText("23 de 35")).toBeVisible();
  await page.goto("/netx");
  const fila = page.getByRole("row").filter({ hasText: "Invitación al círculo" });
  await expect(fila).toContainText("Lote 7");
  await expect(fila).toContainText("Equipo NetX");
});

test("cancelar la invitación o la charla no cambia nada", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Pedir una charla" }).click();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("button", { name: "Pedir una charla" })).toBeFocused();
  await page.getByRole("button", { name: "Pedir invitación" }).click();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("button", { name: "Pedir invitación" })).toBeVisible();
  await expect(page.getByText("22 de 35")).toBeVisible();
  expect(await page.evaluate(() => window.localStorage.getItem("lh-contactos"))).toBeNull();
});

test("pedir una charla queda en la bandeja con destino Equipo NetX", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Pedir una charla" }).click();
  await page.getByRole("radio", { name: "Telegram" }).check();
  await page.getByLabel("Mejor momento (opcional)").selectOption("tarde");
  await page.getByLabel(/^Mensaje/).fill("Hola");
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(page.getByText("Charla pedida (simulado)")).toBeVisible();
  await page.goto("/netx");
  const fila = page.getByRole("row").filter({ hasText: "Charla para invertir en NetX" });
  await expect(fila).toContainText("Telegram");
  await expect(fila).toContainText("Equipo NetX");
});

test("bandeja vacía en /netx", async ({ page }) => {
  await page.goto("/netx");
  await expect(page.getByRole("heading", { name: "Pedidos de contacto · este navegador (simulado)" })).toBeVisible();
  await expect(page.getByText("Todavía no hay pedidos en este navegador.")).toBeVisible();
  await expect(page.getByText("En el producto real irían al CRM")).toBeVisible();
});

test("dato guardado inválido: la bandeja se lee vacía y la pantalla no falla", async ({ page }) => {
  await page.goto("/netx");
  await page.evaluate(() => window.localStorage.setItem("lh-contactos", "{no es una lista"));
  await page.reload();
  await expect(page.getByText("Todavía no hay pedidos en este navegador.")).toBeVisible();
});

test("borrar todo desde /panel vacía la bandeja", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Pedir una charla" }).click();
  await page.getByRole("radio", { name: "Email" }).check();
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(page.getByText("Charla pedida (simulado)")).toBeVisible();
  await page.goto("/panel");
  page.once("dialog", (d) => void d.accept());
  await page.getByRole("button", { name: "Borrar todo lo de este navegador" }).click();
  await expect(page.getByRole("status").filter({ hasText: "se borró todo" })).toBeVisible();
  await page.goto("/netx");
  await expect(page.getByText("Todavía no hay pedidos en este navegador.")).toBeVisible();
});

test("solo teclado: abrir, elegir canal y enviar", async ({ page }) => {
  await page.goto("/sumarte");
  const boton = page.getByRole("button", { name: "Pedir una charla" });
  await boton.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Charla para invertir en NetX · Invertir en NetX")).toBeFocused();
  const email = page.getByRole("radio", { name: "Email" });
  await email.focus();
  await page.keyboard.press("Space");
  await expect(email).toBeChecked();
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("status").filter({ hasText: "Pedido recibido (simulado). Lo vería: Equipo NetX." }),
  ).toBeVisible();
  const guardado = await page.evaluate(() => JSON.parse(window.localStorage.getItem("lh-contactos") ?? "[]"));
  expect(guardado).toHaveLength(1);
  expect(guardado[0]).toMatchObject({ motivo: "charla-netx", canal: "email", destino: "Equipo NetX" });
});

test("no se puede guardar el pedido: avisa solo el formulario y no marca la invitación", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (clave: string, valor: string) {
      if (clave === "lh-contactos") throw new DOMException("bloqueado", "SecurityError");
      return original.call(this, clave, valor);
    };
  });
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Pedir invitación" }).click();
  await page.getByRole("radio", { name: "Email" }).check();
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(alertas(page)).toHaveCount(1);
  await expect(alertas(page)).toContainText("el pedido no se pudo guardar");
  await expect(page.getByText("Invitación pedida (simulado)")).toHaveCount(0);
  await expect(page.getByText("22 de 35")).toBeVisible();
});

test("falla guardar la página después del pedido: una sola alerta y reintentar no duplica", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (clave: string, valor: string) {
      if (clave === "lh-sumarte") throw new DOMException("bloqueado", "SecurityError");
      return original.call(this, clave, valor);
    };
  });
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Pedir invitación" }).click();
  await page.getByRole("radio", { name: "Email" }).check();
  const enviar = page.getByRole("button", { name: "Enviar pedido (simulado)" });
  await enviar.click();
  await expect(alertas(page)).toHaveCount(1);
  await expect(alertas(page)).toContainText("no permite guardar datos");
  await expect(page.getByText("Invitación pedida (simulado)")).toHaveCount(0);
  await enviar.click();
  await expect(alertas(page)).toHaveCount(1);
  const guardado = await page.evaluate(() => JSON.parse(window.localStorage.getItem("lh-contactos") ?? "[]"));
  expect(guardado).toHaveLength(1);
});

test("un mensaje o estado de tipo raro en lh-contactos no rompe /netx", async ({ page }) => {
  await page.goto("/netx");
  await page.evaluate(() =>
    window.localStorage.setItem(
      "lh-contactos",
      JSON.stringify([
        { id: "x", fecha: "2026-10-07T12:00:00Z", motivo: "charla-netx", referencia: "R", canal: "email", destino: "Equipo NetX", mensaje: {} },
      ]),
    ),
  );
  await page.reload();
  await expect(page.getByText("Todavía no hay pedidos en este navegador.")).toBeVisible();
});
