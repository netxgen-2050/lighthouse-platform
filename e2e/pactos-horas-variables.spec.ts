import AxeBuilder from "@axe-core/playwright";
import type { BrowserContext } from "@playwright/test";
import { COOKIE_PRUEBA, EMAILS, expect, prefijoDe, test, type Page } from "./fixtura";

// pactos-horas-variables: un pacto de horas variables con rango, compromiso mínimo, horas declaradas cada mes y confirmadas
// por la comunidad. Se cambia de persona en el mismo navegador (cookie + recarga) y se fija el reloj con `page.clock`.

const PERSONA = EMAILS.persona;
const ADMIN = EMAILS["admin-tribu"];

test.use({ rol: "persona" });

async function sembrarDe(page: Page, email: string, clave: string, valor: unknown) {
  await page.addInitScript(
    ([k, v]) => {
      if (window.localStorage.getItem(k) === null) window.localStorage.setItem(k, v);
    },
    [prefijoDe(email) + clave, JSON.stringify(valor)] as const,
  );
}

test.beforeEach(async ({ page }) => {
  await sembrarDe(page, PERSONA, "lh-membresia", { valle: "miembro", lighthouse: "miembro", taller: "miembro", monte: "miembro" });
  await sembrarDe(page, PERSONA, "lh-perfil", { nombre: "Ana Pérez" });
  await sembrarDe(page, ADMIN, "lh-membresia", { valle: "miembro" });
});

async function entrarComo(page: Page, context: BrowserContext, baseURL: string | undefined, email: string, ruta: string) {
  await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(email), url: baseURL! }]);
  await page.goto(ruta);
}

/** Arma y envía un pacto de horas variables de 0 a 30 h en Valle Solar. */
async function enviarVariable(page: Page) {
  await page.goto("/pactos?comunidad=valle");
  await page.getByLabel(/Rol que asumís en Valle Solar/).selectOption({ label: "Jardinería" });
  await page.getByLabel("Tu descripción: qué vas a hacer").fill("Cuido la huerta");
  await page.getByRole("radio", { name: /Horas variables/ }).check();
  await page.getByLabel("Mínimo por mes (h)").fill("0");
  await page.getByLabel("Máximo por mes (h)").fill("30");
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await expect(page.getByTestId("esperando-respuesta")).toBeVisible();
}

async function aceptarComoAdmin(page: Page, context: BrowserContext, baseURL: string | undefined) {
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await page.getByRole("article").filter({ hasText: "Ana Pérez" }).getByRole("button", { name: "Aceptar", exact: true }).click();
}

async function responderMes(page: Page, context: BrowserContext, baseURL: string | undefined, boton: "Confirmar" | "Pedir revisar", motivo?: string) {
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  const articulo = page.getByTestId("horas-mes").filter({ hasText: "Ana Pérez" });
  await articulo.getByRole("button", { name: boton, exact: true }).click();
  if (motivo) {
    await page.getByLabel(/Motivo/).fill(motivo);
    await page.getByRole("button", { name: "Confirmar el pedido de revisar" }).click();
  }
}

async function declarar(page: Page, mes: string, horas: number, boton = "Declarar") {
  await page.getByRole("spinbutton", { name: `Horas de ${mes}` }).fill(String(horas));
  await page.getByRole("button", { name: boton, exact: true }).click();
}

test("rango, compromiso de Valle Solar, la tribu lo ve, declarar, corregir, confirmar y Semillas pendientes", async ({ page, context, baseURL }) => {
  await page.clock.setFixedTime(new Date("2026-11-10T15:00:00Z"));
  await page.goto("/pactos?comunidad=valle");
  await page.getByRole("radio", { name: /Horas variables/ }).check();
  await expect(page.getByTestId("compromiso-minimo")).toContainText("Compromiso mínimo: 3 meses · después dura lo que quieras sostenerlo");
  // Rango al revés: no se puede enviar.
  await page.getByLabel("Mínimo por mes (h)").fill("30");
  await page.getByLabel("Máximo por mes (h)").fill("10");
  await expect(page.getByTestId("rango-linea")).toHaveText("El mínimo tiene que ser menor que el máximo");
  await page.getByLabel(/Rol que asumís en Valle Solar/).selectOption({ label: "Jardinería" });
  await page.getByLabel("Tu descripción: qué vas a hacer").fill("Cuido la huerta");
  await expect(page.getByRole("button", { name: "Enviar a la comunidad" })).toHaveAttribute("aria-disabled", "true");
  await page.getByLabel("Mínimo por mes (h)").fill("0");
  await page.getByLabel("Máximo por mes (h)").fill("30");
  await expect(page.getByTestId("rango-linea")).toHaveText("Entre 0 y 30 h por mes");
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await expect(page.getByTestId("esperando-respuesta")).toBeVisible();

  // La tribu lo ve y lo acepta.
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByRole("article")).toContainText("Horas variables · entre 0 y 30 h/mes · compromiso mínimo 3 meses");
  await page.getByRole("button", { name: "Aceptar", exact: true }).click();

  // Declarar: fuera del rango, dentro, corregir.
  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await expect(page.getByTestId("version-pacto")).toHaveText("Versión 1");
  await declarar(page, "Noviembre de 2026", 40);
  await expect(page.getByRole("alert").filter({ hasText: "Está fuera de lo pactado (0 a 30 h). Para más horas, proponé un cambio." })).toBeVisible();
  await declarar(page, "Noviembre de 2026", 24);
  await expect(page.getByTestId("estado-mes-en-curso")).toHaveText("Noviembre de 2026: 24 h · esperando que Valle Solar las confirme");
  await expect(page.getByTestId("version-pacto")).toHaveText("Versión 1");
  await declarar(page, "Noviembre de 2026", 20, "Corregir");
  await expect(page.getByTestId("estado-mes-en-curso")).toContainText("20 h");
  await declarar(page, "Noviembre de 2026", 24, "Corregir");

  // La tribu ve una sola declaración del mes y la confirma.
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByTestId("horas-mes")).toHaveCount(1);
  await expect(page.getByTestId("horas-mes")).toContainText("24 h");
  await expect(page.getByTestId("horas-mes")).toContainText("entre 0 y 30 h/mes");
  await page.getByTestId("horas-mes").getByRole("button", { name: "Confirmar", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Confirmaste las horas de Ana Pérez de Noviembre de 2026." })).toBeFocused();

  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await expect(page.getByTestId("estado-mes-en-curso")).toHaveText("Noviembre de 2026: 24 h · confirmadas por Valle Solar");
  // Un mes confirmado no se edita.
  await expect(page.getByRole("spinbutton", { name: "Horas de Noviembre de 2026" })).toHaveCount(0);

  await page.goto("/semillas?comunidad=valle");
  await expect(page.getByTestId("semillas-pendientes")).toHaveText("Semillas pendientes: 121");
  await expect(page.getByTestId("semillas-tiempo")).toHaveText("Semillas: sin dato");
  await expect(page.getByTestId("meses-confirmados")).toHaveText("1 de 3 meses confirmados del compromiso mínimo");
  await expect(page.getByTestId("total-valle")).toHaveText("sin dato");

  // Diciembre: octubre sin dato, noviembre ya pasado sin poder editarse, y 10 h confirmadas dan 171 pendientes.
  await page.clock.setFixedTime(new Date("2026-12-10T15:00:00Z"));
  await page.goto("/pactos?comunidad=valle");
  await expect(page.getByTestId("mes-2026-11")).toHaveText("Noviembre de 2026: 24 h · confirmadas por Valle Solar");
  await expect(page.getByRole("spinbutton", { name: "Horas de Noviembre de 2026" })).toHaveCount(0);
  await declarar(page, "Diciembre de 2026", 10);
  await responderMes(page, context, baseURL, "Confirmar");
  await entrarComo(page, context, baseURL, PERSONA, "/semillas?comunidad=valle");
  await expect(page.getByTestId("semillas-pendientes")).toHaveText("Semillas pendientes: 171");
  await expect(page.getByTestId("meses-confirmados")).toHaveText("2 de 3 meses confirmados del compromiso mínimo");
  await expect(page.getByTestId("mes-semillas-2026-10")).toHaveText("Octubre de 2026: sin dato");
  await expect(page.getByTestId("mes-semillas-2026-11")).toHaveText("Noviembre de 2026: 24 h · confirmadas · 121 Semillas pendientes");
  await expect(page.getByTestId("mes-semillas-2026-12")).toHaveText("Diciembre de 2026: 10 h · confirmadas · 50 Semillas pendientes");
  await expect(page.getByText("Las Semillas pendientes se reciben al cumplir el compromiso mínimo. Un mes con 0 h no cuenta.")).toBeVisible();
});

test("pedir revisar un mes pasado y volver a declararlo; el fin de mes en Argentina cuenta como noviembre", async ({ page, context, baseURL }) => {
  await page.clock.setFixedTime(new Date("2026-12-01T01:30:00Z")); // 30-nov, 22:30 en Argentina
  await enviarVariable(page);
  await aceptarComoAdmin(page, context, baseURL);
  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await declarar(page, "Noviembre de 2026", 24);
  await expect(page.getByTestId("estado-mes-en-curso")).toHaveText("Noviembre de 2026: 24 h · esperando que Valle Solar las confirme");

  await page.clock.setFixedTime(new Date("2026-12-10T15:00:00Z"));
  await responderMes(page, context, baseURL, "Pedir revisar", "Fueron 20, no 24");
  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await expect(page.getByTestId("mes-2026-11")).toContainText("Noviembre de 2026: 24 h · Valle Solar pidió revisarlas");
  await expect(page.getByTestId("mes-2026-11")).toContainText("Fueron 20, no 24");
  await declarar(page, "Noviembre de 2026", 20, "Volver a declarar Noviembre de 2026");
  await expect(page.getByTestId("mes-2026-11")).toContainText("Noviembre de 2026: 20 h · esperando que Valle Solar las confirme");
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByTestId("horas-mes")).toHaveCount(1);
  await expect(page.getByTestId("horas-mes")).toContainText("20 h");
});

test("de fija a variable: versión 2 en el historial con la versión 1 como 10 h/mes", async ({ page, context, baseURL }) => {
  await page.clock.setFixedTime(new Date("2026-11-10T15:00:00Z"));
  await page.goto("/pactos?comunidad=valle");
  await page.getByLabel(/Rol que asumís en Valle Solar/).selectOption({ label: "Jardinería" });
  await page.getByLabel("Tu descripción: qué vas a hacer").fill("Cuido la huerta");
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await aceptarComoAdmin(page, context, baseURL);
  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await page.getByRole("button", { name: "Proponer un cambio" }).click();
  await page.getByTestId("modalidad-cambio").getByRole("radio", { name: /Horas variables/ }).check();
  await page.getByLabel("Máximo por mes (h)").fill("30");
  await expect(page.getByTestId("compromiso-minimo-cambio")).toContainText("Compromiso mínimo: 3 meses");
  await page.getByRole("button", { name: "Enviar cambio a la comunidad" }).click();
  // Mientras no se acepta, rige la versión 1.
  await expect(page.getByTestId("version-pacto")).toHaveText("Versión 1");
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByRole("article")).toContainText("Cambio · de 10 h/mes a entre 0 y 30 h/mes · propone la versión 2");
  await page.getByRole("button", { name: "Aceptar", exact: true }).click();
  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await expect(page.getByTestId("version-pacto")).toHaveText("Versión 2");
  await page.getByText("Historial de versiones (2)").click();
  const historial = page.getByRole("list", { name: "Versiones aceptadas" });
  await expect(historial).toContainText("10 h/mes");
  await expect(historial).toContainText("Horas variables · entre 0 y 30 h/mes");
});

test("Semillas recibidas en Taller Común (1 mes), un mes con 0 h no cuenta, y lo declarado sin confirmar no genera nada", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-12-10T15:00:00Z"));
  const variable = (declaradas: Record<string, unknown>) => ({
    rol: "jardineria",
    rolOtro: "",
    descripcion: "Cuido la huerta",
    modalidad: "variable",
    horas: 10,
    rango: { min: 0, max: 30 },
    compromisoMeses: null,
    paso: 2,
    version: 1,
    historial: [],
    declaradas,
  });
  const conf = (horas: number, mes: string) => ({ horas, estado: "confirmada", propuestaId: `p-${mes}` });
  await sembrarDe(page, PERSONA, "lh-pactos", {
    pestana: "tiempo",
    comunidades: {
      taller: { tiempo: { ...variable({ "2026-11": conf(24, "2026-11") }), compromisoMeses: 1 }, aportes: [], puntuales: [] },
      valle: {
        tiempo: { ...variable({ "2026-10": conf(0, "2026-10"), "2026-11": conf(24, "2026-11"), "2026-12": conf(10, "2026-12") }), compromisoMeses: 3 },
        aportes: [],
        puntuales: [],
      },
      lighthouse: {
        tiempo: { ...variable({ "2026-12": { horas: 24, estado: "declarada", propuestaId: "p-x" } }), compromisoMeses: 3 },
        aportes: [],
        puntuales: [],
      },
    },
  });
  await page.goto("/semillas?comunidad=taller");
  await expect(page.getByTestId("mes-semillas-2026-11")).toHaveText("Noviembre de 2026: 24 h · confirmadas · 121 Semillas");
  await expect(page.getByTestId("semillas-tiempo")).toHaveText("Semillas: 121");
  await expect(page.getByTestId("semillas-pendientes")).toHaveText("Semillas pendientes: sin dato");
  await expect(page.getByTestId("total-taller")).toHaveText("121 semillas");

  await page.goto("/semillas?comunidad=valle");
  await expect(page.getByTestId("meses-confirmados")).toHaveText("2 de 3 meses confirmados del compromiso mínimo");
  await expect(page.getByTestId("mes-semillas-2026-10")).toContainText("0 h · confirmadas · no cuenta para el mínimo");
  await expect(page.getByTestId("semillas-pendientes")).toHaveText("Semillas pendientes: 171");

  await page.goto("/semillas?comunidad=lighthouse");
  await expect(page.getByTestId("mes-semillas-2026-12")).toHaveText("Diciembre de 2026: 24 h · esperando confirmación");
  await expect(page.getByTestId("semillas-pendientes")).toHaveText("Semillas pendientes: sin dato");
  await expect(page.getByTestId("semillas-tiempo")).toHaveText("Semillas: sin dato");
  // El pacto variable aceptado habilita la ronda igual que uno fijo.
  await expect(page.getByText("La ronda es solo para quienes tienen un pacto aceptado")).toHaveCount(0);
});

test("pasa a horas fijas con Semillas pendientes: se ven aparte con el aviso y no suman", async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-12-10T15:00:00Z"));
  const v1 = { rol: "jardineria", rolOtro: "", descripcion: "Cuido la huerta", modalidad: "variable", horas: 10, rango: { min: 0, max: 30 }, compromisoMeses: 3, version: 1, aceptado: null };
  const conf = (horas: number, mes: string) => ({ horas, estado: "confirmada", propuestaId: `p-${mes}` });
  await sembrarDe(page, PERSONA, "lh-pactos", {
    pestana: "tiempo",
    comunidades: {
      valle: {
        tiempo: {
          ...v1,
          modalidad: "fija",
          compromisoMeses: null,
          paso: 2,
          version: 2,
          historial: [v1, { ...v1, modalidad: "fija", compromisoMeses: null, version: 2 }],
          declaradas: { "2026-11": conf(24, "2026-11"), "2026-12": conf(10, "2026-12") },
        },
        aportes: [],
        puntuales: [],
      },
    },
  });
  await page.goto("/semillas?comunidad=valle");
  const anterior = page.getByTestId("semillas-anterior");
  await expect(anterior).toContainText("Horas variables confirmadas antes del cambio");
  await expect(anterior).toContainText("Semillas pendientes: 171");
  await expect(anterior).toContainText("se reciben solo si se valida y, si no, se pierden");
  await expect(anterior).not.toContainText("círculo");
  // Las pendientes no suman: solo la proyección del pacto fijo.
  await expect(page.getByTestId("total-valle")).toHaveText("150 semillas");
});

test("el máximo y el mínimo del rango se acotan al salir del campo (29 → 30, 90 → 80)", async ({ page }) => {
  await page.goto("/pactos?comunidad=valle");
  await page.getByRole("radio", { name: /Horas variables/ }).check();
  const maximo = page.getByLabel("Máximo por mes (h)");
  await maximo.fill("29");
  await maximo.blur();
  await expect(maximo).toHaveValue("30");
  await maximo.fill("29");
  await maximo.blur();
  await expect(maximo).toHaveValue("30");
  await maximo.fill("90");
  await maximo.blur();
  await expect(maximo).toHaveValue("80");
  await maximo.fill("90");
  await maximo.blur();
  await expect(maximo).toHaveValue("80");
});

test("Monte Nuevo no ofrece horas variables y Taller Común muestra 1 mes de compromiso", async ({ page }) => {
  await page.goto("/pactos?comunidad=monte");
  await expect(page.getByRole("radio", { name: /Horas variables/ })).toHaveCount(0);
  await page.goto("/pactos?comunidad=taller");
  await page.getByRole("radio", { name: /Horas variables/ }).check();
  await expect(page.getByTestId("compromiso-minimo")).toContainText("Compromiso mínimo: 1 mes · después dura lo que quieras sostenerlo");
});

test("el ⚖ del compromiso mínimo se abre con teclado y Escape lo cierra", async ({ page }) => {
  await page.goto("/pactos?comunidad=valle");
  await page.getByRole("radio", { name: /Horas variables/ }).check();
  const boton = page.getByRole("button", { name: /Qué significa legalmente: Compromiso mínimo/ });
  // Con Tab desde el radio (el foco por teclado es el que abre el ⚖) hasta llegar al botón.
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    if (await boton.evaluate((el) => el === document.activeElement)) break;
  }
  await expect(boton).toBeFocused();
  await expect(page.getByRole("tooltip")).toContainText("no es un contrato de trabajo ni un período de prueba");
  await expect(page.getByRole("tooltip")).toContainText("podés dejarlo antes avisando");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US" });

  test("se lee Variable hours, el rango, el compromiso y el estado del mes", async ({ page }) => {
    await page.clock.setFixedTime(new Date("2026-11-10T15:00:00Z"));
    await sembrarDe(page, PERSONA, "lh-pactos", {
      pestana: "tiempo",
      comunidades: {
        valle: {
          tiempo: {
            rol: "jardineria",
            rolOtro: "",
            descripcion: "Cuido la huerta",
            modalidad: "variable",
            horas: 10,
            rango: { min: 0, max: 30 },
            compromisoMeses: 3,
            paso: 2,
            version: 1,
            historial: [],
            declaradas: { "2026-11": { horas: 24, estado: "declarada", propuestaId: "p-x" } },
          },
          aportes: [],
          puntuales: [],
        },
      },
    });
    await page.goto("/pactos?comunidad=valle");
    await expect(page.getByText("Variable hours").first()).toBeVisible();
    await expect(page.getByTestId("rango-linea")).toHaveText("Between 0 and 30 h per month");
    await expect(page.getByTestId("compromiso-minimo")).toContainText("Minimum commitment: 3 months");
    await expect(page.getByTestId("estado-mes-en-curso")).toHaveText("November 2026: 24 h · waiting for Valle Solar to confirm them");
  });
});

test("sin violaciones de accesibilidad con un pacto variable", async ({ page, context, baseURL }) => {
  await page.clock.setFixedTime(new Date("2026-11-10T15:00:00Z"));
  await enviarVariable(page);
  await aceptarComoAdmin(page, context, baseURL);
  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await declarar(page, "Noviembre de 2026", 24);
  const grave = async () =>
    (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(await grave()).toEqual([]);
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByTestId("horas-mes")).toBeVisible();
  expect(await grave()).toEqual([]);
  await entrarComo(page, context, baseURL, PERSONA, "/semillas?comunidad=valle");
  await expect(page.getByTestId("semillas-variable")).toBeVisible();
  expect(await grave()).toEqual([]);
});
