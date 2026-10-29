import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { EMAILS, expect, prefijoDe, test, VERSION_PRUEBA, type Page } from "./fixtura";

// Con Privy (previews y producción) elegir un plan abre el modal de Privy: los casos que usan "Entrar como…" van en el e2e local.
const CON_PRIVY = Boolean(process.env.BASE_URL || process.env.NEXT_PUBLIC_PRIVY_APP_ID);
const SIN_PRIVY = "Con Privy, elegir un plan abre el modal de Privy; este caso usa el panel Entrar como… del modo de prueba";

const PREFIJO = prefijoDe(EMAILS.persona);
const CLAVE_CONSENTIMIENTO = `${PREFIJO}lh-consentimiento`;

const titulo = (page: Page) => page.getByRole("heading", { level: 1, name: "Antes de seguir: tu privacidad" });
const casillaPolitica = (page: Page) => page.getByRole("checkbox", { name: /Leí y acepto la política de privacidad/ });
const casillaTerminos = (page: Page) => page.getByRole("checkbox", { name: /Acepto los términos de uso del prototipo/ });

async function aceptar(page: Page) {
  await casillaPolitica(page).check();
  await casillaTerminos(page).check();
  await page.getByRole("button", { name: "Aceptar y continuar" }).click();
}

async function graves(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return r.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }));
}

test.describe("consentimiento al entrar", () => {
  test.use({ rol: "persona", consentimiento: "ninguno" });

  test("la primera vez muestra el resumen con las dos casillas y no deja seguir sin marcarlas", async ({ page }) => {
    await page.goto("/pactos");
    await expect(titulo(page)).toBeVisible();
    await expect(page.getByText("NetXGen, una entidad registrada en Honduras")).toBeVisible();
    await expect(page.getByText("Estados Unidos", { exact: false }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Tus pactos con la comunidad" })).toHaveCount(0);

    // Sin marcar nada.
    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "tenés que marcar las dos casillas" })).toBeVisible();
    // Con una sola casilla.
    await casillaPolitica(page).check();
    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "tenés que marcar las dos casillas" })).toBeVisible();
    await expect(titulo(page)).toBeVisible();
    expect(await page.evaluate((c) => window.localStorage.getItem(c), CLAVE_CONSENTIMIENTO)).toBeNull();
  });

  test("al aceptar queda registrado con la versión y la fecha, y al recargar no se vuelve a pedir", async ({ page }) => {
    await page.goto("/pactos");
    await aceptar(page);
    await expect(page.getByRole("heading", { level: 1, name: "Tus pactos con la comunidad" })).toBeVisible();
    const registro = JSON.parse((await page.evaluate((c) => window.localStorage.getItem(c), CLAVE_CONSENTIMIENTO)) ?? "null");
    expect(registro).toMatchObject({ version: VERSION_PRUEBA, aceptado: { politica: true, terminos: true }, sensibles: null });
    expect(Number.isNaN(Date.parse(registro.aceptadoEn))).toBe(false);
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Tus pactos con la comunidad" })).toBeVisible();
    await expect(titulo(page)).toHaveCount(0);
  });

  test("sin aceptar, Hifa no aparece, Reportar abre el formulario sin cuenta y las páginas públicas siguen abiertas", async ({ page }) => {
    await page.goto("/pactos");
    await expect(titulo(page)).toBeVisible();
    await expect(page.getByRole("button", { name: "Hablar con Hifa" })).toHaveCount(0);
    await page.getByRole("button", { name: "Reportar un problema o una idea" }).click();
    const dialogo = page.getByRole("dialog", { name: "Reportar un problema o una idea" });
    await expect(dialogo.getByText(/Estás reportando sin cuenta/)).toBeVisible();
    await expect(dialogo.getByLabel(/Tu email/)).toBeVisible();
    await page.keyboard.press("Escape");
    await page.goto("/tribus");
    await expect(page.getByRole("heading", { level: 1, name: "Tribus del Lighthouse" })).toBeVisible();
    await page.goto("/privacidad");
    await expect(page.getByRole("heading", { level: 1, name: "Política de privacidad" })).toBeVisible();
  });

  test("con sesión y la política pendiente, el reporte sale sin cabeceras de sesión", async ({ page }) => {
    let cabeceras: Record<string, string> = {};
    await page.route("**/api/reportes", (ruta) => {
      cabeceras = ruta.request().headers();
      return ruta.fulfill({ status: 200, json: { ok: true, numero: 9 } });
    });
    await page.goto("/pactos");
    await expect(titulo(page)).toBeVisible();
    await page.getByRole("button", { name: "Reportar un problema o una idea" }).click();
    const dialogo = page.getByRole("dialog", { name: "Reportar un problema o una idea" });
    await dialogo.getByLabel(/¿Qué pasó\?/).fill("Algo");
    await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
    await expect(dialogo.getByText("¡Gracias! Quedó registrado (#9)")).toBeVisible();
    expect(cabeceras.authorization).toBeUndefined();
    expect(Object.keys(cabeceras).filter((k) => k.startsWith("x-lh"))).toEqual([]);
  });

  test("la persona puede salir sin aceptar", async ({ page }) => {
    await page.goto("/pactos");
    await page.getByRole("button", { name: "No acepto, salir" }).click();
    await expect(page.getByRole("banner").getByRole("button", { name: "Entrar" })).toBeVisible();
    await expect(titulo(page)).toHaveCount(0);
  });

  test("axe sin violaciones serias o críticas en la pantalla de consentimiento, también con el error a la vista", async ({ page }) => {
    await page.goto("/pactos");
    await expect(titulo(page)).toBeVisible();
    expect(await graves(page)).toEqual([]);
    await page.getByRole("button", { name: "Aceptar y continuar" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "tenés que marcar las dos casillas" })).toBeVisible();
    expect(await graves(page)).toEqual([]);
  });
});

test.describe("nueva versión de la política", () => {
  test.use({ rol: "persona", consentimiento: "ninguno" });

  test("con otra versión aceptada vuelve a pedirse, avisando que cambió", async ({ page }) => {
    await page.addInitScript(
      ([clave]) => {
        if (window.localStorage.getItem(clave) !== null) return;
        window.localStorage.setItem(
          clave,
          JSON.stringify({
            version: "2025-01-01-vieja",
            aceptadoEn: "2025-01-01T00:00:00.000Z",
            aceptado: { politica: true, terminos: true },
            sensibles: null,
          }),
        );
      },
      [CLAVE_CONSENTIMIENTO],
    );
    await page.goto("/pactos");
    await expect(titulo(page)).toBeVisible();
    await expect(page.getByText("Cambió la política de privacidad")).toBeVisible();
    await aceptar(page);
    await expect(page.getByRole("heading", { level: 1, name: "Tus pactos con la comunidad" })).toBeVisible();
    const registro = JSON.parse((await page.evaluate((c) => window.localStorage.getItem(c), CLAVE_CONSENTIMIENTO)) ?? "null");
    expect(registro.version).toBe(VERSION_PRUEBA);
  });
});

test.describe("registro desde Sumarte", () => {
  test.use({ rol: "ninguno", consentimiento: "ninguno" });

  test("el consentimiento va antes de aplicar el plan elegido", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    const claveSumarte = `${PREFIJO}lh-sumarte`;
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Hacerme miembro" }).click();
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(titulo(page)).toBeVisible();
    // Todavía no se aplicó nada: el plan espera al consentimiento.
    expect(await page.evaluate((c) => window.localStorage.getItem(c), claveSumarte)).toBeNull();
    await aceptar(page);
    await expect(page.getByText("Tu plan actual:")).toContainText("Miembro");
    expect(await page.evaluate((c) => window.localStorage.getItem(c), claveSumarte)).not.toBeNull();
  });
});

test.describe("plazo del plan elegido en Sumarte", () => {
  test.use({ rol: "ninguno", consentimiento: "ninguno" });

  test("aceptar después de los 5 minutos del pedido conserva el plan", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Hacerme miembro" }).click();
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(titulo(page)).toBeVisible();
    // Pasaron 10 minutos leyendo la pantalla: el pedido pendiente ya estaría vencido.
    await page.evaluate(() => window.sessionStorage.setItem("lh-sumarte-pendiente-hora", String(Date.now() - 10 * 60 * 1000)));
    await aceptar(page);
    await expect(page.getByText("Tu plan actual:")).toContainText("Miembro");
  });
});

test.describe("plan abandonado", () => {
  test.use({ rol: "ninguno", consentimiento: "ninguno" });

  test("un pedido que ya había vencido antes de la pantalla de consentimiento no se revive al aceptar", async ({ page }) => {
    test.skip(CON_PRIVY, SIN_PRIVY);
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Hacerme miembro" }).click();
    // La persona abandonó el registro y volvió 30 minutos después: el pedido ya venció.
    await page.evaluate(() => window.sessionStorage.setItem("lh-sumarte-pendiente-hora", String(Date.now() - 30 * 60 * 1000)));
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(titulo(page)).toBeVisible();
    await aceptar(page);
    await expect(page.getByText("Tu plan actual:")).toContainText("Explorador");
  });
});

test.describe("datos sensibles del KYC", () => {
  test.use({ rol: "persona", consentimiento: "basico" });

  test("antes del primer paso pide aceptar el tratamiento de los datos sensibles", async ({ page }) => {
    await page.goto("/pasaporte");
    await page.getByRole("button", { name: "Completar mi verificación (KYC)" }).click();
    const dialogo = page.getByRole("dialog", { name: /Verificar mi identidad/ });
    await expect(dialogo.getByRole("heading", { name: /Antes de empezar: tus datos sensibles/ })).toBeVisible();
    await expect(dialogo.getByText("los verifica un tercero")).toBeVisible();
    await expect(dialogo.getByText("Paso 1 de 5")).toHaveCount(0);
    expect(await graves(page)).toEqual([]);

    await dialogo.getByRole("button", { name: "Aceptar y empezar" }).click();
    await expect(dialogo.getByRole("alert").filter({ hasText: "marcar la casilla" })).toBeVisible();

    await dialogo.getByRole("checkbox", { name: /Acepto que NetXGen trate mis datos de identidad/ }).check();
    await dialogo.getByRole("button", { name: "Aceptar y empezar" }).click();
    await expect(dialogo.getByRole("heading", { name: /Paso 1 de 5/ })).toBeVisible();
    const registro = JSON.parse((await page.evaluate((c) => window.localStorage.getItem(c), CLAVE_CONSENTIMIENTO)) ?? "null");
    expect(registro.sensibles).toMatchObject({ version: VERSION_PRUEBA });
  });

  test("con el consentimiento ya dado, el KYC va directo al primer paso", async ({ page }) => {
    await page.addInitScript(
      ([clave, version]) => {
        const ahora = new Date().toISOString();
        window.localStorage.setItem(
          clave,
          JSON.stringify({ version, aceptadoEn: ahora, aceptado: { politica: true, terminos: true }, sensibles: { version, aceptadoEn: ahora } }),
        );
      },
      [CLAVE_CONSENTIMIENTO, VERSION_PRUEBA],
    );
    await page.goto("/pasaporte");
    await page.getByRole("button", { name: "Completar mi verificación (KYC)" }).click();
    const dialogo = page.getByRole("dialog", { name: /Verificar mi identidad/ });
    await expect(dialogo.getByRole("heading", { name: /Paso 1 de 5/ })).toBeVisible();
  });
});

test.describe("política de privacidad", () => {
  test.use({ rol: "ninguno" });

  test("es pública y dice quién es el responsable, qué procesan Privy, Vercel y GitHub y dónde, todo como borrador", async ({ page }) => {
    await page.goto("/privacidad");
    await expect(page.getByRole("heading", { level: 1, name: "Política de privacidad" })).toBeVisible();
    await expect(page.getByRole("note")).toContainText("Borrador");
    await expect(page.getByText("NetXGen, entidad registrada en Honduras")).toBeVisible();
    const encargados = page.getByRole("table", { name: "Servicios que tratan datos y dónde están" });
    for (const nombre of ["Privy", "Vercel", "GitHub", "Neon"]) {
      await expect(encargados.getByRole("row").filter({ hasText: nombre })).toContainText("Estados Unidos");
    }
    await expect(page.getByRole("heading", { name: "Qué datos tratamos, pantalla por pantalla" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tus derechos y cómo ejercerlos" })).toBeVisible();
    await expect(page.getByText("Ley 25.326")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Términos de uso del prototipo" })).toBeVisible();
    await expect(page.getByRole("main")).toHaveCount(1);
  });

  test("los ⚖ de datos y transferencia se muestran como borrador", async ({ page }) => {
    await page.goto("/privacidad");
    await page.getByRole("button", { name: "Qué significa legalmente: Transferencia internacional de datos" }).click();
    await expect(page.getByText("Borrador: texto a revisar")).toBeVisible();
    await expect(page.getByText("tienen sus servidores en Estados Unidos")).toBeVisible();
  });

  test("el pie de todas las páginas lleva a Privacidad", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: "Privacidad" }).click();
    await expect(page).toHaveURL(/\/privacidad$/);
  });

  test("axe sin violaciones serias o críticas", async ({ page }) => {
    await page.goto("/privacidad");
    await expect(page.getByRole("heading", { level: 1, name: "Política de privacidad" })).toBeVisible();
    expect(await graves(page)).toEqual([]);
  });
});

test.describe("mis datos", () => {
  test.use({ rol: "persona" });

  test("el menú del avatar y Configuración llevan a Mis datos", async ({ page }) => {
    await page.goto("/configuracion");
    await page.getByRole("main").getByRole("link", { name: /^Mis datos/ }).click();
    await expect(page).toHaveURL(/\/mis-datos$/);
    await page.getByRole("button", { name: "Menú de la persona" }).click();
    await page.locator("#menu-persona").getByRole("link", { name: "Mis datos" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Mis datos" })).toBeVisible();
  });

  test("descargar entrega un JSON con los datos de la persona y ninguno de otra", async ({ page }) => {
    await page.addInitScript(
      ([propia, ajena]) => {
        if (window.localStorage.getItem("probado")) return;
        window.localStorage.setItem("probado", "1");
        window.localStorage.setItem(propia, JSON.stringify({ nombre: "Ana Pérez", lugar: "Mendoza" }));
        window.localStorage.setItem(ajena, JSON.stringify({ nombre: "Beto Ajeno" }));
      },
      [`${PREFIJO}lh-perfil`, `${prefijoDe("otra@prueba.test")}lh-perfil`],
    );
    await page.goto("/mis-datos");
    const descarga = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar mis datos" }).click();
    const archivo = await descarga;
    expect(archivo.suggestedFilename()).toMatch(/^mis-datos-lighthouse-\d{4}-\d{2}-\d{2}\.json$/);
    await expect(page.getByText("Listo: se descargó el archivo")).toBeVisible();
    const texto = await readFile((await archivo.path())!, "utf8");
    const json = JSON.parse(texto);
    expect(json.persona.email).toBe(EMAILS.persona);
    expect(json.versionPolitica).toBe(VERSION_PRUEBA);
    expect(json.datos.perfilDatos).toEqual({ nombre: "Ana Pérez", lugar: "Mendoza" });
    expect(json.datos.consentimiento).toMatchObject({ version: VERSION_PRUEBA });
    // Lo que falta es null (sin dato), no cero.
    expect(json.datos.semillasRonda).toBeNull();
    expect(texto).not.toContain("Beto Ajeno");
    expect(texto).not.toContain("otra@prueba.test");
  });

  test("pedir que borren la cuenta envía un pedido de tipo pregunta con la etiqueta de privacidad", async ({ page }) => {
    let enviado: Record<string, unknown> | null = null;
    await page.route("**/api/reportes", async (ruta) => {
      enviado = ruta.request().postDataJSON() as Record<string, unknown>;
      await ruta.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, numero: 77 }) });
    });
    await page.goto("/mis-datos");
    await page.getByRole("button", { name: "Pedir que borren mi cuenta" }).click();
    await expect(page.getByText("Listo: le avisamos al equipo (pedido #77)")).toBeVisible();
    expect(enviado).toMatchObject({ tipo: "pregunta", privacidad: true, contacto: EMAILS.persona });
    await expect(page.getByRole("button", { name: "Pedir que borren mi cuenta" })).toBeDisabled();
  });

  test("si el envío falla avisa y no pierde el pedido", async ({ page }) => {
    await page.route("**/api/reportes", (ruta) => ruta.fulfill({ status: 503, contentType: "application/json", body: "{}" }));
    await page.goto("/mis-datos");
    await page.getByRole("button", { name: "Pedir que borren mi cuenta" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "el envío no está configurado" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pedir que borren mi cuenta" })).toBeEnabled();
  });

  test("cancelar el retiro del consentimiento no borra nada", async ({ page }) => {
    await page.goto("/mis-datos");
    await page.getByRole("button", { name: "Retirar mi consentimiento" }).click();
    await expect(page.getByText("¿Seguro?")).toBeVisible();
    await page.getByRole("button", { name: "Cancelar" }).click();
    await expect(page.getByRole("button", { name: "Retirar mi consentimiento" })).toBeFocused();
    expect(await page.evaluate((c) => window.localStorage.getItem(c), CLAVE_CONSENTIMIENTO)).not.toBeNull();
    await expect(page.getByRole("button", { name: "Menú de la persona" })).toBeVisible();
  });

  test("axe sin violaciones serias o críticas, también con la confirmación a la vista", async ({ page }) => {
    await page.goto("/mis-datos");
    await expect(page.getByRole("heading", { level: 1, name: "Mis datos" })).toBeVisible();
    expect(await graves(page)).toEqual([]);
    await page.getByRole("button", { name: "Retirar mi consentimiento" }).click();
    await expect(page.getByText("¿Seguro?")).toBeVisible();
    expect(await graves(page)).toEqual([]);
  });
});

test.describe("retirar el consentimiento", () => {
  // El consentimiento se siembra a mano y una sola vez por pestaña, para que la recarga posterior al retiro no lo vuelva a sembrar.
  // Sin plan sembrado: la fixture lo volvería a sembrar al recargar y taparía lo que se prueba.
  test.use({ rol: "persona", consentimiento: "ninguno", plan: "ninguno" });

  test("cierra la sesión y borra los datos de la persona en el navegador", async ({ page }) => {
    await page.addInitScript(
      ([consentimiento, perfil, version]) => {
        if (window.sessionStorage.getItem("sembrado")) return;
        window.sessionStorage.setItem("sembrado", "1");
        const ahora = new Date().toISOString();
        window.localStorage.setItem(
          consentimiento,
          JSON.stringify({ version, aceptadoEn: ahora, aceptado: { politica: true, terminos: true }, sensibles: null }),
        );
        window.localStorage.setItem(perfil, JSON.stringify({ nombre: "Ana Pérez" }));
      },
      [CLAVE_CONSENTIMIENTO, `${PREFIJO}lh-perfil`, VERSION_PRUEBA],
    );
    await page.goto("/mis-datos");
    await page.getByRole("button", { name: "Retirar mi consentimiento" }).click();
    await page.getByRole("button", { name: "Sí, retirar y borrar mis datos" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("banner").getByRole("button", { name: "Entrar" })).toBeVisible();
    const propias = await page.evaluate((prefijo) => Object.keys(window.localStorage).filter((k) => k.startsWith(prefijo)), PREFIJO);
    expect(propias).toEqual([]);
    // La cookie de prueba ya no está: no hay sesión.
    expect((await page.context().cookies()).find((c) => c.name === "lh-auth-prueba")).toBeUndefined();
  });

  test("saca del registro compartido las constancias de pactos de la persona y deja las de otra", async ({ page }) => {
    const clave = "compartido:pactos-constancias";
    const otra = "prueba:otra@prueba.test";
    const constancia = (id: string, persona: string) => ({
      id,
      esquema: "pacto-propone",
      afirma: `persona:${persona}`,
      por: persona,
      sobre: `pacto:valle:${persona}`,
      version: 1,
      apuntaA: null,
      cuando: "2026-10-28T10:00:00.000Z",
      revocable: true,
      datos: {},
    });
    await page.addInitScript(
      ([consentimiento, version, k, lista]) => {
        if (window.sessionStorage.getItem("sembrado")) return;
        window.sessionStorage.setItem("sembrado", "1");
        window.localStorage.setItem(
          consentimiento,
          JSON.stringify({ version, aceptadoEn: new Date().toISOString(), aceptado: { politica: true, terminos: true }, sensibles: null }),
        );
        window.localStorage.setItem(k, lista);
      },
      [
        CLAVE_CONSENTIMIENTO,
        VERSION_PRUEBA,
        clave,
        JSON.stringify([constancia("p1-pacto-propone", `prueba:${EMAILS.persona}`), constancia("p2-pacto-propone", otra)]),
      ] as const,
    );
    await page.goto("/mis-datos");
    await page.getByRole("button", { name: "Retirar mi consentimiento" }).click();
    await page.getByRole("button", { name: "Sí, retirar y borrar mis datos" }).click();
    await expect(page).toHaveURL(/\/$/);
    const restantes = JSON.parse(await page.evaluate((k) => window.localStorage.getItem(k) ?? "[]", clave)) as { sobre: string }[];
    expect(restantes.map((c) => c.sobre)).toEqual([`pacto:valle:${otra}`]);
  });
});
