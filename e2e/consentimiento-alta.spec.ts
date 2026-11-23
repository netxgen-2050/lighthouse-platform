import { aceptarPaso } from "./ayudas";
import { COOKIE_PRUEBA, EMAIL_FUERA_DE_LISTA, EMAILS, expect, prefijoDe, test, VERSION_PRUEBA, type Page } from "./fixtura";

// Con Privy (previews) el login es la ventana de Privy: los casos de "Entrar como…" van en el e2e local.
const CON_PRIVY = Boolean(process.env.BASE_URL || process.env.NEXT_PUBLIC_PRIVY_APP_ID);
const SIN_PRIVY = "Con Privy el login abre la ventana de Privy; este caso usa el panel Entrar como… del modo de prueba";

const VERSION_ANTERIOR = "2026-10-14-borrador";
const PREFIJO = prefijoDe(EMAILS.persona);
const CLAVE_CONSENTIMIENTO = `${PREFIJO}lh-consentimiento`;
const CLAVE_NOVEDADES = `${PREFIJO}lh-novedades`;
const CLAVE_INTRUSO = `${prefijoDe(EMAIL_FUERA_DE_LISTA)}lh-consentimiento`;

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

async function leer(page: Page, clave: string) {
  return JSON.parse((await page.evaluate((c) => window.localStorage.getItem(c), clave)) ?? "null") as Record<string, unknown> | null;
}

/** Siembra, una sola vez por pestaña, un consentimiento de otra versión y (opcional) un registro de novedades. */
async function sembrarAnterior(page: Page, opciones: { novedades?: "acepta" | "retira" } = {}) {
  await page.addInitScript(
    ([consentimiento, novedades, version, evento]) => {
      if (window.sessionStorage.getItem("sembrado-alta")) return;
      window.sessionStorage.setItem("sembrado-alta", "1");
      window.localStorage.setItem(
        consentimiento,
        JSON.stringify({ version, aceptadoEn: "2026-10-14T12:00:00.000Z", aceptado: { politica: true, terminos: true }, sensibles: null }),
      );
      if (evento) {
        window.localStorage.setItem(
          novedades,
          JSON.stringify({ evento, version, registradoEn: "2026-10-14T12:00:00.000Z", canal: "alta" }),
        );
      }
    },
    [CLAVE_CONSENTIMIENTO, CLAVE_NOVEDADES, VERSION_ANTERIOR, opciones.novedades ?? ""] as const,
  );
}

test.describe("crear la cuenta en Sumarte", () => {
  test.use({ rol: "ninguno", consentimiento: "ninguno" });

  test("el paso pide las dos casillas sin marcar y, al aceptar, entra sin pantalla de consentimiento", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
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
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(page.getByText("Tu plan actual:")).toContainText("Explorador");
    await expect(titulo(page)).toHaveCount(0);

    const registro = await leer(page, CLAVE_CONSENTIMIENTO);
    expect(registro).toMatchObject({ version: VERSION_PRUEBA, canal: "alta", aceptado: { politica: true, terminos: true } });
    // Sin marcar la casilla de novedades, queda registrado que no las pidió.
    expect(await leer(page, CLAVE_NOVEDADES)).toMatchObject({ evento: "retira", canal: "alta" });
    expect(await page.evaluate(() => window.sessionStorage.getItem("lh-consentimiento-previo"))).toBeNull();
    // El alta no pide datos sensibles: eso se pide recién al verificar la identidad.
    expect(registro).toMatchObject({ sensibles: null });
  });

  test("la aceptación del paso no vale en otra pestaña: ahí aparece la pantalla de consentimiento", async ({ page, context, baseURL }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await aceptarPaso(page);
    expect(await page.evaluate(() => window.sessionStorage.getItem("lh-consentimiento-previo"))).not.toBeNull();
    // Otra pestaña nueva: la sesión ya existe (cookie), pero la aceptación vive solo en la pestaña de arriba.
    await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(EMAILS.persona), url: baseURL! }]);
    const otra = await context.newPage();
    await otra.goto("/tribus");
    await expect(titulo(otra)).toBeVisible();
    await expect(casillaPolitica(otra)).not.toBeChecked();
    await expect(casillaTerminos(otra)).not.toBeChecked();
    expect(await leer(otra, CLAVE_CONSENTIMIENTO)).toBeNull();
  });

  test("con la casilla de novedades marcada queda registrado que las pidió", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await aceptarPaso(page, { novedades: true });
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(menuAvatar(page)).toBeVisible();
    expect(await leer(page, CLAVE_NOVEDADES)).toMatchObject({ evento: "acepta", canal: "alta", version: VERSION_PRUEBA });
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

  test("abre el paso Entrar sin abrir el login; al aceptar entra, sin pantalla de consentimiento", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/tribus");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    const dialogo = paso(page, "Entrar");
    await expect(dialogo).toBeVisible();
    await expect(casillaPolitica(dialogo)).not.toBeChecked();
    await expect(casillaTerminos(dialogo)).not.toBeChecked();
    await expect(page.getByRole("heading", { name: "Entrar como…" })).toHaveCount(0);
    await expect(page).toHaveURL(/\/tribus$/);
    expect((await page.context().cookies()).find((c) => c.name === COOKIE_PRUEBA)).toBeUndefined();

    await aceptarPaso(page);
    await expect(page).toHaveURL(/\/sumarte\?volver=%2Ftribus/);
    await expect(page.getByRole("heading", { name: "Entrar como…" })).toBeVisible();
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await expect(page).toHaveURL(/\/tribus$/);
    await expect(titulo(page)).toHaveCount(0);
    expect(await leer(page, CLAVE_CONSENTIMIENTO)).toMatchObject({ canal: "al-entrar", version: VERSION_PRUEBA });
  });

  test("sin aceptar el login no se abre: Cancelar, Escape, ninguna casilla o una sola", async ({ page }) => {
    await page.goto("/tribus");
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

    await expect(page).toHaveURL(/\/tribus$/);
    await expect(page.getByRole("heading", { name: "Entrar como…" })).toHaveCount(0);
    await expect(menuAvatar(page)).toHaveCount(0);
    expect((await page.context().cookies()).find((c) => c.name === COOKIE_PRUEBA)).toBeUndefined();
  });

  test("elegir un email de Entrar como… sin aceptación previa abre el paso y la sesión espera", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/sumarte#entrar-como");
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(paso(page, "Entrar")).toBeVisible();
    expect((await page.context().cookies()).find((c) => c.name === COOKIE_PRUEBA)).toBeUndefined();
    await expect(menuAvatar(page)).toHaveCount(0);
    await aceptarPaso(page);
    await expect(menuAvatar(page)).toBeVisible();
  });

  test("una persona con consentimiento vigente también pasa por el paso, y su constancia no cambia", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.addInitScript(
      ([clave, version]) => {
        if (window.sessionStorage.getItem("sembrado-alta")) return;
        window.sessionStorage.setItem("sembrado-alta", "1");
        window.localStorage.setItem(
          clave,
          JSON.stringify({ version, aceptadoEn: "2026-11-20T12:00:00.000Z", aceptado: { politica: true, terminos: true }, canal: "alta", sensibles: null }),
        );
      },
      [CLAVE_CONSENTIMIENTO, VERSION_PRUEBA] as const,
    );
    await page.goto("/tribus");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    await aceptarPaso(page);
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(menuAvatar(page)).toBeVisible();
    expect(await leer(page, CLAVE_CONSENTIMIENTO)).toMatchObject({ aceptadoEn: "2026-11-20T12:00:00.000Z", canal: "alta" });
    // La aceptación del paso se consumió: no queda en la pestaña para otra persona.
    expect(await page.evaluate(() => window.sessionStorage.getItem("lh-consentimiento-previo"))).toBeNull();
  });

  test("la aceptación no queda para la persona siguiente de la pestaña", async ({ page, context, baseURL }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.addInitScript(
      ([clave, version]) => {
        if (window.sessionStorage.getItem("sembrado-alta")) return;
        window.sessionStorage.setItem("sembrado-alta", "1");
        window.localStorage.setItem(
          clave,
          JSON.stringify({ version, aceptadoEn: "2026-11-20T12:00:00.000Z", aceptado: { politica: true, terminos: true }, sensibles: null }),
        );
      },
      [CLAVE_CONSENTIMIENTO, VERSION_PRUEBA] as const,
    );
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Sumarme gratis" }).click();
    await aceptarPaso(page);
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await menuAvatar(page).click();
    await page.locator("#menu-persona").getByRole("button", { name: "Salir" }).click();
    // Otra persona (sin consentimiento) entra en la misma pestaña con una sesión que ya existía: ve la pantalla.
    await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(EMAIL_FUERA_DE_LISTA), url: baseURL! }]);
    expect(await page.evaluate((c) => window.localStorage.getItem(c), CLAVE_INTRUSO)).toBeNull();
    await page.goto("/tribus");
    await expect(titulo(page)).toBeVisible();
  });
});

test.describe("red de seguridad: sesión sin consentimiento vigente", () => {
  // Sin plan sembrado: la fixtura lo escribe con el prefijo de la persona y taparía lo que se prueba.
  test.use({ rol: "persona", consentimiento: "ninguno", plan: "ninguno" });

  test("con la sesión sembrada, cualquier página muestra la pantalla; la política se lee", async ({ page }) => {
    await page.goto("/tribus");
    await expect(titulo(page)).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Comunidades del Lighthouse" })).toHaveCount(0);
    await page.goto("/privacidad");
    await expect(page.getByRole("heading", { level: 1, name: "Política de privacidad" })).toBeVisible();
    await expect(titulo(page)).toHaveCount(0);
  });

  test("el menú de la persona sin consentimiento solo ofrece Salir y no hay campanita", async ({ page }) => {
    await page.goto("/tribus");
    await menuAvatar(page).click();
    const menu = page.locator("#menu-persona");
    await expect(menu.getByRole("button", { name: "Salir" })).toBeVisible();
    await expect(menu.getByRole("link")).toHaveCount(0);
    await expect(barra(page).getByRole("button", { name: /Notificaciones/ })).toHaveCount(0);
  });

  test("con UTM y la sesión sin aceptar no se guarda nada con su identidad", async ({ page }) => {
    await page.goto("/?utm_source=newsletter");
    await expect(titulo(page)).toBeVisible();
    const claves = await page.evaluate(() => Object.keys(window.localStorage));
    expect(claves.filter((c) => c.startsWith("u:"))).toEqual([]);
    expect(claves.filter((c) => c.includes("persona@prueba.test"))).toEqual([]);
    expect(claves).not.toContain("lh-ultima-persona");
    // La bitácora queda vacía: ninguna clave de bitácora tiene entradas.
    const bitacoras = await page.evaluate(() =>
      Object.keys(window.localStorage)
        .filter((c) => c.includes("lh-bitacora"))
        .map((c) => JSON.parse(window.localStorage.getItem(c) ?? "[]") as unknown[]),
    );
    expect(bitacoras.flat()).toEqual([]);
  });

  test("la pantalla suma la casilla de novedades y registra la elección con el camino al-entrar", async ({ page }) => {
    await page.goto("/tribus");
    await expect(casillaNovedades(page)).not.toBeChecked();
    await casillaPolitica(page).check();
    await casillaTerminos(page).check();
    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Comunidades del Lighthouse" })).toBeVisible();
    expect(await leer(page, CLAVE_CONSENTIMIENTO)).toMatchObject({ canal: "al-entrar" });
    expect(await leer(page, CLAVE_NOVEDADES)).toMatchObject({ evento: "retira", canal: "al-entrar" });
  });
});

test.describe("re-consentimiento con lo que cambió", () => {
  test.use({ rol: "persona", consentimiento: "ninguno" });

  test("la pantalla dice qué versión aceptó, cuándo y los tres cambios; el registro nuevo es nueva-version", async ({ page }) => {
    await sembrarAnterior(page);
    await page.goto("/pactos");
    await expect(titulo(page)).toBeVisible();
    await expect(page.getByText(`Aceptaste la versión ${VERSION_ANTERIOR} el`)).toBeVisible();
    const cambios = page.getByRole("group").or(page.locator("details")).filter({ hasText: "Qué cambió" }).first();
    await expect(cambios.getByRole("listitem")).toHaveCount(3);
    await expect(cambios).toContainText("antes de entrar o de crear tu cuenta");
    await expect(cambios).toContainText("idioma");
    await expect(cambios).toContainText("novedades por email");
    await expect(casillaPolitica(page)).not.toBeChecked();
    await expect(casillaTerminos(page)).not.toBeChecked();
    await casillaPolitica(page).check();
    await casillaTerminos(page).check();
    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(titulo(page)).toHaveCount(0);
    expect(await leer(page, CLAVE_CONSENTIMIENTO)).toMatchObject({ canal: "nueva-version", version: VERSION_PRUEBA });
  });

  test("con una elección de novedades ya registrada, la casilla no aparece", async ({ page }) => {
    await sembrarAnterior(page, { novedades: "acepta" });
    await page.goto("/pactos");
    await expect(titulo(page)).toBeVisible();
    await expect(casillaNovedades(page)).toHaveCount(0);
    await casillaPolitica(page).check();
    await casillaTerminos(page).check();
    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(titulo(page)).toHaveCount(0);
    expect(await leer(page, CLAVE_NOVEDADES)).toMatchObject({ evento: "acepta" });
  });
});

test.describe("re-consentimiento desde Entrar", () => {
  test.use({ rol: "ninguno", consentimiento: "ninguno" });

  test("el paso Entrar muestra la versión vigente y Qué cambió; el registro nuevo es nueva-version", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await sembrarAnterior(page);
    await page.goto("/tribus");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    const dialogo = paso(page, "Entrar");
    await expect(dialogo.getByText(`Versión de la política: ${VERSION_PRUEBA}`)).toBeVisible();
    await expect(dialogo.getByText("Qué cambió")).toBeVisible();
    await expect(dialogo.getByRole("listitem").filter({ hasText: "novedades por email" }).first()).toBeVisible();
    await aceptarPaso(page);
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await expect(titulo(page)).toHaveCount(0);
    expect(await leer(page, CLAVE_CONSENTIMIENTO)).toMatchObject({ canal: "nueva-version", version: VERSION_PRUEBA });
  });

  test("una elección de novedades anterior no se pisa si el paso se acepta sin marcar la casilla", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await sembrarAnterior(page, { novedades: "acepta" });
    await page.goto("/tribus");
    await barra(page).getByRole("button", { name: "Entrar" }).click();
    await aceptarPaso(page);
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(menuAvatar(page)).toBeVisible();
    expect(await leer(page, CLAVE_NOVEDADES)).toMatchObject({ evento: "acepta", canal: "alta", version: VERSION_ANTERIOR });
  });
});

test.describe("Mis datos: constancia y novedades", () => {
  test.use({ rol: "persona" });

  test("muestra la versión, la fecha y el camino; un registro sin camino dice sin dato", async ({ page }) => {
    await page.goto("/mis-datos");
    await expect(page.getByRole("heading", { name: "Tu consentimiento" })).toBeVisible();
    await expect(page.getByText(`Aceptaste la versión ${VERSION_PRUEBA} el`).first()).toContainText("Camino: sin dato");
  });

  test("con camino alta dice al crear tu cuenta", async ({ page }) => {
    await page.addInitScript(
      ([clave, version]) => {
        if (window.sessionStorage.getItem("sembrado-alta")) return;
        window.sessionStorage.setItem("sembrado-alta", "1");
        window.localStorage.setItem(
          clave,
          JSON.stringify({ version, aceptadoEn: "2026-11-20T21:05:00.000Z", aceptado: { politica: true, terminos: true }, canal: "alta", sensibles: null }),
        );
      },
      [CLAVE_CONSENTIMIENTO, VERSION_PRUEBA] as const,
    );
    await page.goto("/mis-datos");
    await expect(page.getByText(`Aceptaste la versión ${VERSION_PRUEBA} el`).first()).toContainText("al crear tu cuenta");
  });

  test("dar y dejar de recibir novedades deja constancia mis-datos sin tocar el consentimiento general", async ({ page }) => {
    await page.goto("/mis-datos");
    await expect(page.getByText("No recibís novedades por email.")).toBeVisible();
    await page.getByRole("button", { name: "Quiero recibir novedades" }).click();
    await expect(page.getByText("Listo: pediste recibir novedades por email.")).toBeVisible();
    expect(await leer(page, CLAVE_NOVEDADES)).toMatchObject({ evento: "acepta", canal: "mis-datos", version: VERSION_PRUEBA });
    await page.getByRole("button", { name: "Dejar de recibir novedades" }).click();
    await expect(page.getByText("Listo: dejaste de recibir novedades por email.")).toBeVisible();
    await expect(page.getByText("No recibís novedades por email.")).toBeVisible();
    expect(await leer(page, CLAVE_NOVEDADES)).toMatchObject({ evento: "retira", canal: "mis-datos" });
    expect(await leer(page, CLAVE_CONSENTIMIENTO)).toMatchObject({ version: VERSION_PRUEBA });
  });

  test("retirar el consentimiento general también retira las novedades", async ({ page }) => {
    await page.goto("/mis-datos");
    await page.getByRole("button", { name: "Quiero recibir novedades" }).click();
    await expect(page.getByText("Listo: pediste recibir novedades por email.")).toBeVisible();
    await page.getByRole("button", { name: "Retirar mi consentimiento" }).click();
    await page.getByRole("button", { name: "Sí, retirar y borrar mis datos" }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(await leer(page, CLAVE_NOVEDADES)).toMatchObject({ evento: "retira", canal: "mis-datos" });
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
