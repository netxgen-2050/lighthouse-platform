import { aceptarPaso } from "./ayudas";
import {
  COOKIE_PRUEBA,
  consentimientoDe,
  emailUnico,
  expect,
  panelConEmail,
  prefijoDe,
  registrarConsentimientoDe,
  test,
  VERSION_PRUEBA,
  type Page,
} from "./fixtura";

// Con Privy (previews) el login es la ventana de Privy: los casos de "Entrar como…" van en el e2e local.
const CON_PRIVY = Boolean(process.env.BASE_URL || process.env.NEXT_PUBLIC_PRIVY_APP_ID);
const SIN_PRIVY = "Con Privy el login abre la ventana de Privy; este caso usa el panel Entrar como… del modo de prueba";

// El consentimiento vive en el servidor, que comparten todos los tests: cada test que necesita una persona sin aceptar (o que
// cambia lo que aceptó) entra con un email propio.

const barra = (page: Page) => page.getByRole("banner");
const menuAvatar = (page: Page) => page.getByRole("button", { name: "Menú de la persona" });
const titulo = (page: Page) => page.getByRole("heading", { level: 1, name: "Antes de seguir: tu privacidad" });
const paso = (page: Page, nombre: "Crear tu cuenta" | "Entrar") => page.getByRole("dialog", { name: nombre });
const casillaPolitica = (donde: Page | ReturnType<Page["getByRole"]>) =>
  donde.getByRole("checkbox", { name: /Leí y acepto la política de privacidad/ });
const casillaTerminos = (donde: Page | ReturnType<Page["getByRole"]>) =>
  donde.getByRole("checkbox", { name: /Acepto los términos de uso del prototipo/ });
const casillaNovedades = (donde: Page | ReturnType<Page["getByRole"]>) =>
  donde.getByRole("checkbox", { name: "Quiero recibir novedades por email" });

async function leerLocal(page: Page, clave: string) {
  return JSON.parse((await page.evaluate((c) => window.localStorage.getItem(c), clave)) ?? "null") as Record<string, unknown> | null;
}

test.describe("crear la cuenta en Sumarte", () => {
  test.use({ rol: "ninguno", consentimiento: "ninguno" });

  test("el paso pide las dos casillas sin marcar y, al aceptar, entra sin pantalla de consentimiento", async ({ page, request }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    const email = emailUnico("alta");
    await panelConEmail(page, email);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    const dialogo = paso(page, "Crear tu cuenta");
    await expect(dialogo).toBeVisible();
    await expect(casillaPolitica(dialogo)).not.toBeChecked();
    await expect(casillaTerminos(dialogo)).not.toBeChecked();
    await expect(casillaNovedades(dialogo)).not.toBeChecked();
    // Todavía no hay login.
    await expect(page.getByRole("heading", { name: "Entrar como…" })).toBeVisible();
    expect((await page.context().cookies()).find((c) => c.name === COOKIE_PRUEBA)).toBeUndefined();

    // Con una sola casilla: error y foco en la que falta.
    await casillaPolitica(dialogo).check();
    await dialogo.getByRole("button", { name: "Aceptar y crear mi cuenta" }).click();
    await expect(dialogo.getByRole("alert")).toContainText("tenés que marcar las dos casillas");
    await expect(dialogo.getByRole("alert")).not.toContainText("novedades");
    await expect(casillaTerminos(dialogo)).toBeFocused();

    await casillaTerminos(dialogo).check();
    await dialogo.getByRole("button", { name: "Aceptar y crear mi cuenta" }).click();
    await expect(dialogo).toBeHidden();
    // Sin entrar, el servidor no sabe nada de esta persona: no hay ninguna fila suya.
    expect((await consentimientoDe(request, email)).filas).toEqual([]);
    await page.getByRole("button", { name: email }).click();
    await expect(page.getByText("Tu plan actual:")).toContainText("Explorador");
    await expect(titulo(page)).toHaveCount(0);

    // El registro lo confirma el servidor: dos filas acepta (política y términos) con el camino alta.
    const { estado, filas } = await consentimientoDe(request, email);
    expect(estado).toMatchObject({ general: "vigente", canal: "alta", version: VERSION_PRUEBA });
    expect(filas?.filter((f) => f.evento === "acepta" && f.tipo !== "novedades").map((f) => `${f.tipo}:${f.canal}`).sort()).toEqual(["politica:alta", "terminos:alta"]);
    // Sin marcar la casilla de novedades, queda registrado que no las pidió.
    expect(estado.novedadesRegistro).toMatchObject({ evento: "retira", canal: "alta" });
    expect(await page.evaluate(() => window.sessionStorage.getItem("lh-consentimiento-previo"))).toBeNull();
    // Nada del consentimiento general queda en el navegador.
    expect(await leerLocal(page, `${prefijoDe(email)}lh-consentimiento`)).toBeNull();

    // El alta no pide datos sensibles: eso se pide recién al verificar la identidad (y sigue en el navegador).
    await page.goto("/pasaporte");
    await page.getByRole("button", { name: "Completar mi verificación (KYC)" }).click();
    const kyc = page.getByRole("dialog", { name: /Verificar mi identidad/ });
    await expect(kyc.getByRole("heading", { name: /Antes de empezar: tus datos sensibles/ })).toBeVisible();
    expect(await leerLocal(page, `${prefijoDe(email)}lh-consentimiento-sensibles`)).toBeNull();
    await kyc.getByRole("checkbox", { name: /Acepto que NetXGen trate mis datos de identidad/ }).check();
    await kyc.getByRole("button", { name: "Aceptar y empezar" }).click();
    await expect(kyc.getByRole("heading", { name: /Paso 1 de 5/ })).toBeVisible();
    expect(await leerLocal(page, `${prefijoDe(email)}lh-consentimiento-sensibles`)).toMatchObject({ version: VERSION_PRUEBA });
  });

  test("la aceptación del paso no vale en otra pestaña: ahí aparece la pantalla de consentimiento", async ({ page, context, baseURL, request }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    const email = emailUnico("pestana");
    await panelConEmail(page, email);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await aceptarPaso(page);
    expect(await page.evaluate(() => window.sessionStorage.getItem("lh-consentimiento-previo"))).not.toBeNull();
    // Otra pestaña nueva: la sesión ya existe (cookie), pero la aceptación vive solo en la pestaña de arriba.
    await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(email), url: baseURL! }]);
    const otra = await context.newPage();
    await otra.goto("/participa");
    await expect(titulo(otra)).toBeVisible();
    await expect(casillaPolitica(otra)).not.toBeChecked();
    await expect(casillaTerminos(otra)).not.toBeChecked();
    expect((await consentimientoDe(request, email)).estado.general).toBe("pendiente");
  });

  test("con la casilla de novedades marcada queda registrado que las pidió", async ({ page, request }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    const email = emailUnico("novedades");
    await panelConEmail(page, email);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await aceptarPaso(page, { novedades: true });
    await page.getByRole("button", { name: email }).click();
    await expect(menuAvatar(page)).toBeVisible();
    const { estado } = await consentimientoDe(request, email);
    expect(estado).toMatchObject({ novedades: true, novedadesRegistro: { evento: "acepta", canal: "alta", version: VERSION_PRUEBA } });
  });

  test("Cancelar y Escape no guardan nada y el foco vuelve al botón", async ({ page }) => {
    await page.goto("/sumarte");
    const boton = page.getByRole("button", { name: "Hacerme miembro" });
    await boton.click();
    await expect(paso(page, "Crear tu cuenta")).toBeVisible();
    await paso(page, "Crear tu cuenta").getByRole("button", { name: "Cancelar" }).click();
    await expect(paso(page, "Crear tu cuenta")).toBeHidden();
    await expect(boton).toBeFocused();
    await boton.click();
    await page.keyboard.press("Escape");
    await expect(paso(page, "Crear tu cuenta")).toBeHidden();
    await expect(boton).toBeFocused();
    const guardado = await page.evaluate(() => [
      window.sessionStorage.getItem("lh-consentimiento-previo"),
      window.sessionStorage.getItem("lh-sumarte-pendiente"),
    ]);
    expect(guardado).toEqual([null, null]);
  });
});

test.describe("entrar desde la barra superior", () => {
  test.use({ rol: "ninguno", consentimiento: "ninguno" });

  test("abre el paso Entrar sin abrir el login; al aceptar entra, sin pantalla de consentimiento", async ({ page, request }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    const email = emailUnico("entrar");
    await panelConEmail(page, email);
    await page.goto("/participa");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    const dialogo = paso(page, "Entrar");
    await expect(dialogo).toBeVisible();
    await expect(casillaPolitica(dialogo)).not.toBeChecked();
    await expect(casillaTerminos(dialogo)).not.toBeChecked();
    await expect(page.getByRole("heading", { name: "Entrar como…" })).toHaveCount(0);
    await expect(page).toHaveURL(/\/participa$/);
    expect((await page.context().cookies()).find((c) => c.name === COOKIE_PRUEBA)).toBeUndefined();

    await aceptarPaso(page);
    await expect(page).toHaveURL(/\/sumarte\?volver=%2Fparticipa/);
    await expect(page.getByRole("heading", { name: "Entrar como…" })).toBeVisible();
    await page.getByRole("button", { name: email }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await expect(page).toHaveURL(/\/participa$/);
    await expect(titulo(page)).toHaveCount(0);
    expect((await consentimientoDe(request, email)).estado).toMatchObject({ canal: "al-entrar", version: VERSION_PRUEBA, general: "vigente" });
  });

  test("sin aceptar el login no se abre: Cancelar, Escape, ninguna casilla o una sola", async ({ page }) => {
    await page.goto("/participa");
    const entrar = barra(page).getByRole("button", { name: "Entrar" });
    const dialogo = paso(page, "Entrar");

    await entrar.click();
    await dialogo.getByRole("button", { name: "Cancelar" }).click();
    await expect(dialogo).toBeHidden();
    await expect(entrar).toBeFocused();

    await entrar.click();
    await page.keyboard.press("Escape");
    await expect(dialogo).toBeHidden();
    await expect(entrar).toBeFocused();

    await entrar.click();
    await dialogo.getByRole("button", { name: "Aceptar y entrar" }).click();
    await expect(dialogo.getByRole("alert")).toContainText("tenés que marcar las dos casillas");
    await expect(casillaPolitica(dialogo)).toBeFocused();
    await casillaTerminos(dialogo).check();
    await dialogo.getByRole("button", { name: "Aceptar y entrar" }).click();
    await expect(dialogo.getByRole("alert")).toBeVisible();
    await expect(casillaPolitica(dialogo)).toBeFocused();

    await expect(page).toHaveURL(/\/participa$/);
    await expect(page.getByRole("heading", { name: "Entrar como…" })).toHaveCount(0);
    await expect(menuAvatar(page)).toHaveCount(0);
    expect((await page.context().cookies()).find((c) => c.name === COOKIE_PRUEBA)).toBeUndefined();
  });

  test("elegir un email de Entrar como… sin aceptación previa abre el paso y la sesión espera", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    const email = emailUnico("espera");
    await panelConEmail(page, email);
    await page.goto("/sumarte#entrar-como");
    await page.getByRole("button", { name: email }).click();
    await expect(paso(page, "Entrar")).toBeVisible();
    expect((await page.context().cookies()).find((c) => c.name === COOKIE_PRUEBA)).toBeUndefined();
    await expect(menuAvatar(page)).toHaveCount(0);
    await aceptarPaso(page);
    await expect(menuAvatar(page)).toBeVisible();
  });

  test("una persona con consentimiento vigente también pasa por el paso, y su constancia no cambia", async ({ page, request }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    const email = emailUnico("vigente");
    await registrarConsentimientoDe(request, email, { canal: "alta" });
    const antes = (await consentimientoDe(request, email)).estado;
    await panelConEmail(page, email);
    await page.goto("/participa");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    await aceptarPaso(page);
    await page.getByRole("button", { name: email }).click();
    await expect(menuAvatar(page)).toBeVisible();
    // Misma fecha y mismo camino: el servidor no agregó otra aceptación.
    await expect.poll(async () => (await consentimientoDe(request, email)).filas?.length).toBe(3);
    const despues = (await consentimientoDe(request, email)).estado;
    expect(despues).toMatchObject({ registradoAt: antes.registradoAt, canal: "alta", general: "vigente" });
    // La aceptación del paso se consumió: no queda en la pestaña para otra persona.
    expect(await page.evaluate(() => window.sessionStorage.getItem("lh-consentimiento-previo"))).toBeNull();
  });

  test("la aceptación no queda para la persona siguiente de la pestaña", async ({ page, context, baseURL, request }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    const primera = emailUnico("primera");
    const segunda = emailUnico("segunda");
    await registrarConsentimientoDe(request, primera);
    await panelConEmail(page, primera);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await aceptarPaso(page);
    await page.getByRole("button", { name: primera }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await menuAvatar(page).click();
    await page.locator("#menu-persona").getByRole("button", { name: "Salir" }).click();
    // Otra persona (sin consentimiento) entra en la misma pestaña con una sesión que ya existía: ve la pantalla.
    await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(segunda), url: baseURL! }]);
    await page.goto("/participa");
    await expect(titulo(page)).toBeVisible();
    expect((await consentimientoDe(request, segunda)).estado.general).toBe("pendiente");
  });
});

test.describe("red de seguridad: sesión sin consentimiento vigente", () => {
  // Sin plan sembrado: la fixtura lo escribe con el prefijo de la persona y taparía lo que se prueba.
  test.use({ rol: "persona", consentimiento: "ninguno", plan: "ninguno" });

  test("con la sesión sembrada, cualquier página muestra la pantalla; la política se lee", async ({ page }) => {
    await page.goto("/participa");
    await expect(titulo(page)).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Participa" })).toHaveCount(0);
    await page.goto("/privacidad");
    await expect(page.getByRole("heading", { level: 1, name: "Política de privacidad" })).toBeVisible();
    await expect(titulo(page)).toHaveCount(0);
  });

  test("el menú de la persona sin consentimiento solo ofrece Salir y no hay campanita", async ({ page }) => {
    await page.goto("/participa");
    await menuAvatar(page).click();
    const menu = page.locator("#menu-persona");
    await expect(menu.getByRole("button", { name: "Salir" })).toBeVisible();
    // Sin consentimiento no hay destinos de la persona; el idioma (ES, EN) sí se ofrece: no depende de la cuenta.
    await expect(menu.getByRole("link")).toHaveText(["Español", "English"].map((n) => new RegExp(n)));
    await expect(menu.locator("a:not([hreflang])")).toHaveCount(0);
    await expect(barra(page).getByRole("button", { name: /Notificaciones/ })).toHaveCount(0);
  });

  test("con UTM y la sesión sin aceptar no se guarda nada con su identidad", async ({ page, request, emailActual }) => {
    await page.goto("/?utm_source=newsletter");
    await expect(titulo(page)).toBeVisible();
    const claves = await page.evaluate(() => Object.keys(window.localStorage));
    expect(claves.filter((c) => c.startsWith("u:"))).toEqual([]);
    expect(claves.filter((c) => c.includes("@prueba.test"))).toEqual([]);
    expect(claves).not.toContain("lh-ultima-persona");
    // Se abre un ⚖ de la pantalla (lo que antes anotaba en la bitácora): sin consentimiento no se anota nada.
    const boton = page.getByRole("button", { name: "Qué significa legalmente: Transferencia internacional de datos" });
    await boton.focus();
    await expect(page.getByRole("tooltip")).toBeVisible();
    // La bitácora queda vacía: ninguna clave de bitácora tiene entradas.
    const bitacoras = await page.evaluate(() =>
      Object.keys(window.localStorage)
        .filter((c) => c.includes("lh-bitacora"))
        .map((c) => JSON.parse(window.localStorage.getItem(c) ?? "[]") as unknown[]),
    );
    expect(bitacoras.flat()).toEqual([]);
    // Y en el servidor no hay ninguna fila suya.
    expect((await consentimientoDe(request, emailActual)).filas).toEqual([]);
  });

  test("la pantalla suma la casilla de novedades y registra la elección con el camino al-entrar", async ({ page, request, emailActual }) => {
    await page.goto("/participa");
    await expect(casillaNovedades(page)).not.toBeChecked();
    await casillaPolitica(page).check();
    await casillaTerminos(page).check();
    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Participa" })).toBeVisible();
    const { estado } = await consentimientoDe(request, emailActual);
    expect(estado).toMatchObject({ canal: "al-entrar", general: "vigente" });
    expect(estado.novedadesRegistro).toMatchObject({ evento: "retira", canal: "al-entrar" });
  });

  // design §7.4 de consentimiento-alta: sin la confirmación del servidor la persona sigue anónima.
  test("con la API respondiendo 500 la persona sigue anónima y ve el error; al reintentar entra", async ({ page, request, emailActual }) => {
    let fallar = true;
    await page.route("**/api/consentimientos", async (ruta) => {
      if (fallar && ruta.request().method() === "POST") return ruta.fulfill({ status: 500, json: { ok: false } });
      return ruta.continue();
    });
    await page.goto("/participa");
    await casillaPolitica(page).check();
    await casillaTerminos(page).check();
    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "No pudimos guardar tu aceptación. Probá de nuevo." })).toBeVisible();
    // Sigue en la pantalla, con las casillas marcadas, y el servidor no registró nada.
    await expect(titulo(page)).toBeVisible();
    await expect(casillaPolitica(page)).toBeChecked();
    await expect(casillaTerminos(page)).toBeChecked();
    expect((await consentimientoDe(request, emailActual)).filas).toEqual([]);
    const claves = await page.evaluate(() => Object.keys(window.localStorage));
    expect(claves.filter((c) => c.startsWith("u:"))).toEqual([]);

    fallar = false;
    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Participa" })).toBeVisible();
    expect((await consentimientoDe(request, emailActual)).estado.general).toBe("vigente");
  });

  test("aceptar en un navegador y entrar desde otro: el segundo no ve la pantalla de consentimiento", async ({ page, browser, baseURL, emailActual }) => {
    await page.goto("/participa");
    await casillaPolitica(page).check();
    await casillaTerminos(page).check();
    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Participa" })).toBeVisible();

    // Otro contexto del navegador: nada de lo guardado en este (cookies, almacenamiento) está ahí.
    const otro = await browser.newContext({ baseURL, locale: "es-AR" });
    try {
      await otro.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(emailActual), url: baseURL! }]);
      const celular = await otro.newPage();
      await celular.goto("/participa");
      await expect(celular.getByRole("heading", { level: 1, name: "Participa" })).toBeVisible();
      await expect(titulo(celular)).toHaveCount(0);
      // Mis datos muestra la misma constancia.
      await celular.goto("/mis-datos");
      await expect(celular.getByText(`Aceptaste la versión ${VERSION_PRUEBA} el`).first()).toContainText("al entrar");
    } finally {
      await otro.close();
    }
  });
});

test.describe("re-consentimiento con novedades ya decididas", () => {
  test.use({ rol: "persona", consentimiento: "ninguno" });

  // El servidor solo registra la versión vigente: un consentimiento de otra versión no se puede sembrar desde el navegador.
  // La pantalla con "Qué cambió" y el camino nueva-version se prueban en `components/sesion/pantalla-consentimiento.test.tsx`.
  test("quien ya decidió sobre las novedades y retiró su consentimiento no ve la casilla, y su elección no se pisa", async ({ page, request, emailActual }) => {
    await registrarConsentimientoDe(request, emailActual, { novedades: "acepta" });
    await registrarConsentimientoDe(request, emailActual, { accion: "retira", canal: "mis-datos" });
    expect((await consentimientoDe(request, emailActual)).estado).toMatchObject({ general: "retirado", novedades: false });
    await page.goto("/pactos");
    await expect(titulo(page)).toBeVisible();
    await expect(casillaNovedades(page)).toHaveCount(0);
    await casillaPolitica(page).check();
    await casillaTerminos(page).check();
    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(titulo(page)).toHaveCount(0);
    const { estado } = await consentimientoDe(request, emailActual);
    expect(estado).toMatchObject({ general: "vigente", novedades: false });
    expect(estado.novedadesRegistro).toMatchObject({ evento: "retira", canal: "mis-datos" });
  });
});

test.describe("re-consentimiento desde Entrar", () => {
  test.use({ rol: "ninguno", consentimiento: "ninguno" });

  test("el paso Entrar muestra la versión vigente y Qué cambió", async ({ page, request }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    const email = emailUnico("version");
    await panelConEmail(page, email);
    await page.goto("/participa");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    const dialogo = paso(page, "Entrar");
    await expect(dialogo.getByText(`Versión de la política: ${VERSION_PRUEBA}`)).toBeVisible();
    await expect(dialogo.getByText("Qué cambió")).toBeVisible();
    await expect(dialogo.getByRole("listitem").filter({ hasText: "Las reservas de lotes simulados" }).first()).toBeVisible();
    await aceptarPaso(page);
    await page.getByRole("button", { name: email }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await expect(titulo(page)).toHaveCount(0);
    expect((await consentimientoDe(request, email)).estado).toMatchObject({ canal: "al-entrar", version: VERSION_PRUEBA });
  });

  test("g2: una elección de novedades anterior no se pisa al pasar por Crear tu cuenta sin marcar la casilla", async ({ page, request }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    const email = emailUnico("g2a");
    await registrarConsentimientoDe(request, email, { canal: "alta", novedades: "acepta" });
    await panelConEmail(page, email);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await aceptarPaso(page);
    await page.getByRole("button", { name: email }).click();
    await expect(menuAvatar(page)).toBeVisible();
    // La casilla sin marcar no la dio de baja (el servidor aplica la regla con la última fila).
    await expect.poll(async () => (await consentimientoDe(request, email)).filas?.length).toBe(3);
    expect((await consentimientoDe(request, email)).estado).toMatchObject({ novedades: true, novedadesRegistro: { evento: "acepta", canal: "alta" } });
  });

  test("g2: lo mismo por Entrar con el consentimiento vigente", async ({ page, request }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    const email = emailUnico("g2b");
    await registrarConsentimientoDe(request, email, { canal: "alta", novedades: "acepta" });
    await panelConEmail(page, email);
    await page.goto("/participa");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    await aceptarPaso(page);
    await page.getByRole("button", { name: email }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await expect.poll(async () => (await consentimientoDe(request, email)).filas?.length).toBe(3);
    expect((await consentimientoDe(request, email)).estado).toMatchObject({ novedades: true, novedadesRegistro: { evento: "acepta", canal: "alta" } });
  });
});

test.describe("Mis datos: constancia y novedades", () => {
  test.use({ rol: "persona", identidad: "propia" });

  test("muestra la versión, la fecha y el camino", async ({ page }) => {
    await page.goto("/mis-datos");
    await expect(page.getByRole("heading", { name: "Tu consentimiento" })).toBeVisible();
    // La fixtura siembra el consentimiento por la API con el camino al-entrar.
    await expect(page.getByText(`Aceptaste la versión ${VERSION_PRUEBA} el`).first()).toContainText("al entrar");
  });

  test("con camino alta dice al crear tu cuenta", async ({ page, request, emailActual }) => {
    // La fixtura ya sembró la aceptación de este email: se retira y se vuelve a aceptar por el camino alta.
    await registrarConsentimientoDe(request, emailActual, { accion: "retira", canal: "mis-datos" });
    await registrarConsentimientoDe(request, emailActual, { canal: "alta" });
    await page.goto("/mis-datos");
    await expect(page.getByText(`Aceptaste la versión ${VERSION_PRUEBA} el`).first()).toContainText("al crear tu cuenta");
  });

  test("dar y dejar de recibir novedades deja constancia mis-datos sin tocar el consentimiento general", async ({ page, request, emailActual }) => {
    await page.goto("/mis-datos");
    await expect(page.getByText("No recibís novedades por email.")).toBeVisible();
    await page.getByRole("button", { name: "Quiero recibir novedades" }).click();
    await expect(page.getByText("Listo: pediste recibir novedades por email.")).toBeVisible();
    expect((await consentimientoDe(request, emailActual)).estado.novedadesRegistro).toMatchObject({ evento: "acepta", canal: "mis-datos", version: VERSION_PRUEBA });
    await page.getByRole("button", { name: "Dejar de recibir novedades" }).click();
    await expect(page.getByText("Listo: dejaste de recibir novedades por email.")).toBeVisible();
    await expect(page.getByText("No recibís novedades por email.")).toBeVisible();
    const { estado } = await consentimientoDe(request, emailActual);
    expect(estado.novedadesRegistro).toMatchObject({ evento: "retira", canal: "mis-datos" });
    expect(estado).toMatchObject({ general: "vigente", version: VERSION_PRUEBA });
  });

  test("retirar el consentimiento general también retira las novedades, y al volver se ve la pantalla", async ({ page, context, baseURL, request, emailActual }) => {
    await page.goto("/mis-datos");
    await page.getByRole("button", { name: "Quiero recibir novedades" }).click();
    await expect(page.getByText("Listo: pediste recibir novedades por email.")).toBeVisible();
    await page.getByRole("button", { name: "Retirar mi consentimiento" }).click();
    await page.getByRole("button", { name: "Sí, retirar y borrar mis datos" }).click();
    await expect(page).toHaveURL(/\/$/);
    // Las filas acepta anteriores siguen en el libro; se sumaron los retiros (novedades, política y términos).
    const { estado, filas } = await consentimientoDe(request, emailActual);
    expect(estado).toMatchObject({ general: "retirado", novedades: false });
    expect(estado.novedadesRegistro).toMatchObject({ evento: "retira", canal: "mis-datos" });
    expect(filas?.filter((f) => f.evento === "acepta")).toHaveLength(3);
    expect(filas?.filter((f) => f.evento === "retira").map((f) => f.tipo).sort()).toEqual(["novedades", "politica", "terminos"]);
    // Si la misma persona vuelve a entrar, tiene que aceptar de nuevo.
    await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(emailActual), url: baseURL! }]);
    await page.goto("/participa");
    await expect(titulo(page)).toBeVisible();
  });
});

// 4.2: solo con Privy (contra el preview con BASE_URL). Sin las casillas, la plataforma no llama al login de Privy.
test.describe("Privy no recibe el email antes de las casillas", () => {
  test.use({ rol: "ninguno", consentimiento: "ninguno" });

  test("ni la barra ni Sumarte abren el login de Privy sin aceptar", async ({ page }) => {
    test.skip(!CON_PRIVY, "Solo corre en un entorno con Privy (BASE_URL o NEXT_PUBLIC_PRIVY_APP_ID)");
    const pedidos: string[] = [];
    page.on("request", (r) => {
      const url = new URL(r.url());
      if (url.hostname === "auth.privy.io" && /passwordless|oauth/.test(url.pathname)) pedidos.push(r.url());
    });
    await page.goto("/sumarte");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    await expect(paso(page, "Entrar")).toBeVisible();
    await paso(page, "Entrar").getByRole("button", { name: "Cancelar" }).click();
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await expect(paso(page, "Crear tu cuenta")).toBeVisible();
    await expect(page.locator("#privy-modal-content, [data-privy-dialog]")).toHaveCount(0);
    expect(pedidos).toEqual([]);
    await aceptarPaso(page);
    await expect(page.locator("#privy-modal-content, #headlessui-portal-root").first()).toBeVisible({ timeout: 15_000 });
  });
});
