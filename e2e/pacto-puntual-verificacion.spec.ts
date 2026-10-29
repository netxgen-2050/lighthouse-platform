import AxeBuilder from "@axe-core/playwright";
import type { BrowserContext } from "@playwright/test";
import { COOKIE_PRUEBA, EMAILS, expect, prefijoDe, test, type Page } from "./fixtura";

// pacto-puntual-verificacion: la persona marca hecha la tarea pre-admitida con sus horas reales, el holón la verifica y recién
// ahí nace la constancia base de Semillas (una por persona). Se cambia de persona en el mismo navegador (cookie + recarga).

const PERSONA = EMAILS.persona;
const ADMIN = EMAILS["admin-tribu"];
const SUPER = EMAILS.superadmin;
const NUEVA = "nueva@prueba.test";
const CLAVE_REGISTRO = "compartido:pactos-constancias";
const HOLON = "el círculo Energía solar";

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
  await sembrarDe(page, PERSONA, "lh-membresia", { valle: "miembro", lighthouse: "miembro", taller: "miembro" });
  await sembrarDe(page, PERSONA, "lh-perfil", { nombre: "Ana Pérez" });
  await sembrarDe(page, ADMIN, "lh-membresia", { valle: "miembro" });
  await sembrarDe(page, NUEVA, "lh-perfil", { nombre: "Bruno Gómez" });
  await sembrarDe(page, NUEVA, "lh-sumarte", { plan: "miembro", tribu: true, tribuId: "semilla" });
  await sembrarDe(page, NUEVA, "lh-membresia", { valle: "miembro" });
});

async function entrarComo(page: Page, context: BrowserContext, baseURL: string | undefined, email: string, ruta: string) {
  await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(email), url: baseURL! }]);
  await page.goto(ruta);
}

/** La persona en sesión se postula a la tarea desde la URL y la envía. */
async function postular(page: Page, necesidad: string, holon: string, comunidad = "valle") {
  await page.goto(`/pactos?comunidad=${comunidad}&necesidad=${necesidad}`);
  await page.getByLabel("Contá cómo la vas a hacer").fill("Lo hago con mi equipo");
  const horas = page.getByLabel(/Horas aproximadas/);
  if ((await horas.inputValue()) === "") await horas.fill("5");
  await page.getByRole("button", { name: "Enviar postulación" }).click();
  await expect(page.getByText(`Esperando que ${holon} responda`)).toBeVisible();
}

/** Postula como `email`, el admin (o quien responde) la pre-admite y vuelve a /pactos como `email`. */
async function preadmitir(page: Page, context: BrowserContext, baseURL: string | undefined, email: string, responde = ADMIN) {
  await entrarComo(page, context, baseURL, email, "/tribus/valle");
  await postular(page, "valle-solar", HOLON);
  await entrarComo(page, context, baseURL, responde, "/pactos/responder");
  const nombre = email === PERSONA ? "Ana Pérez" : "Bruno Gómez";
  await page.getByRole("article").filter({ hasText: nombre }).getByRole("button", { name: "Pre-admitir", exact: true }).click();
  await entrarComo(page, context, baseURL, email, "/pactos?comunidad=valle");
  await expect(page.locator("[data-estado-puntual]")).toHaveText("Pre-admitida");
}

async function marcarHecha(page: Page, horas: number) {
  await page.getByLabel(/Horas que te llevó/).fill(String(horas));
  await page.getByRole("button", { name: "Marcar hecha" }).click();
  await expect(page.getByTestId("esperando-verificacion")).toHaveText(`Hecha · esperando que ${HOLON} verifique`);
}

async function verificar(page: Page, context: BrowserContext, baseURL: string | undefined, quien: string, responde = ADMIN) {
  await entrarComo(page, context, baseURL, responde, "/pactos/responder");
  await page.getByRole("article").filter({ hasText: quien }).getByRole("button", { name: "Verificar", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: `Verificaste las horas de ${quien} en Energía solar.` })).toBeFocused();
}

type Constancia = { esquema: string; afirma: string; por: string; apuntaA: string | null; datos: Record<string, string> };
async function registro(page: Page): Promise<Constancia[]> {
  return JSON.parse(await page.evaluate((k) => window.localStorage.getItem(k) ?? "[]", CLAVE_REGISTRO)) as Constancia[];
}

test("marca hecha con otras horas, el círculo verifica 10 h y la persona recibe 50 Semillas", async ({ page, context, baseURL }) => {
  await page.clock.setFixedTime(new Date("2026-11-10T15:00:00Z"));
  await preadmitir(page, context, baseURL, PERSONA);

  // Horas fuera de rango: no se registra nada.
  await page.getByLabel(/Horas que te llevó/).fill("0");
  await page.getByRole("button", { name: "Marcar hecha" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Las horas van de 1 a 200." })).toBeVisible();
  expect((await registro(page)).filter((c) => c.esquema === "pacto-propone-horas")).toHaveLength(0);

  // Otras horas que las pactadas, retirar y volver a marcar.
  await marcarHecha(page, 12);
  await expect(page.getByRole("button", { name: /Simular/ })).toHaveCount(0);
  const propuesta = (await registro(page)).find((c) => c.esquema === "pacto-propone-horas");
  expect(propuesta).toMatchObject({ afirma: `persona:prueba:${PERSONA}`, datos: { horas: "12" } });
  await page.getByRole("button", { name: "Retirar", exact: true }).click();
  await expect(page.locator("[data-estado-puntual]")).toHaveText("Pre-admitida");
  await marcarHecha(page, 10);

  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByRole("heading", { level: 2, name: "Tareas para verificar" })).toBeVisible();
  await expect(page.getByText("Confirmás que la tarea quedó hecha y las horas que lleva.")).toBeVisible();
  const fila = page.getByTestId("tarea-para-verificar");
  await expect(fila).toHaveCount(1);
  await expect(fila).toContainText("Ana Pérez");
  await expect(fila).toContainText("10 h");
  await expect(page.locator("body")).not.toContainText(PERSONA);
  await fila.getByRole("button", { name: "Verificar", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Verificaste las horas de Ana Pérez en Energía solar." })).toBeFocused();

  const conf = (await registro(page)).find((c) => c.esquema === "pacto-confirma-horas");
  expect(conf).toMatchObject({ afirma: "circulo:valle-3", por: `prueba:${ADMIN}`, datos: { horas: "10" } });

  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await expect(page.getByTestId("horas-verificadas")).toContainText(`Horas verificadas por ${HOLON}: 10 h · 50 Semillas`);
  await expect(page.locator("[data-estado-puntual]")).toHaveText("Verificada");
  const guardado = JSON.parse(await page.evaluate(() => window.localStorage.getItem("lh-pactos") ?? "{}"));
  const constancia = guardado.comunidades.valle.puntuales[0].constancia;
  expect(constancia).toMatchObject({ schema: "semillas-base", afirma: "netx", datos: { horas: 10, semillas: 50, periodo: "2026-11" } });
  expect(constancia.uid).toMatch(/^ejemplo-/);
  expect(JSON.stringify(constancia)).not.toContain("@");

  // Semillas recibidas (no pendientes), sin ronda.
  await page.goto("/semillas?comunidad=valle");
  await expect(page.getByTestId("semillas-puntual")).toContainText("50");
  await expect(page.getByTestId("constancia-puntual")).toHaveCount(1);
  await expect(page.getByTestId("tarjeta-valle")).toContainText("Pactos puntuales");
  await expect(page.getByText("La ronda es solo para quienes tienen un pacto aceptado en Valle Solar")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar ronda" })).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText(/brotes|germinar|Semillas pendientes/i);

  // La ficha y Mi recorrido (una sola vez aunque se abra /pactos dos veces).
  await page.goto("/tribus/valle");
  await page.locator("#necesidad-valle-solar > summary").click();
  await expect(page.locator("#necesidad-valle-solar").getByText("Hecha por vos")).toBeVisible();
  await page.goto("/pactos?comunidad=valle");
  await page.goto("/pactos?comunidad=valle");
  await page.goto("/panel");
  await expect(page.getByText("El círculo Energía solar verificó tus horas de Energía solar")).toHaveCount(1);
  await expect(page.getByText("Marcaste hecha Energía solar en Valle Solar").first()).toBeVisible();
});

test("fin de mes: la verificación del 30-nov a las 22:30 de Argentina queda en el período 2026-11", async ({ page, context, baseURL }) => {
  await preadmitir(page, context, baseURL, PERSONA);
  await marcarHecha(page, 10);
  await page.clock.setFixedTime(new Date("2026-12-01T01:30:00Z"));
  await verificar(page, context, baseURL, "Ana Pérez");
  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await expect(page.locator("[data-estado-puntual]")).toHaveText("Verificada");
  const guardado = JSON.parse(await page.evaluate(() => window.localStorage.getItem("lh-pactos") ?? "{}"));
  expect(guardado.comunidades.valle.puntuales[0].constancia.datos.periodo).toBe("2026-11");
});

test("pedir revisar exige motivo, devuelve la tarea a Pre-admitida y no hay constancia", async ({ page, context, baseURL }) => {
  await preadmitir(page, context, baseURL, PERSONA);
  await marcarHecha(page, 10);
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await page.getByRole("button", { name: "Pedir revisar" }).click();
  await page.getByRole("button", { name: "Confirmar el pedido de revisar" }).click();
  await expect(page.getByText("Contá qué hay que revisar, así la persona puede ajustar sus horas")).toBeVisible();
  await page.getByLabel(/Motivo/).fill("Faltó conectar el inversor");
  await page.getByRole("button", { name: "Confirmar el pedido de revisar" }).click();
  await expect(page.getByText("No hay pactos esperando tu respuesta")).toBeVisible();

  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await expect(page.locator("[data-estado-puntual]")).toHaveText("Pre-admitida");
  await expect(page.getByTestId("aviso-revisar-horas")).toContainText(`El círculo Energía solar pidió revisar tus horas: Faltó conectar el inversor`);
  await expect(page.getByTestId("horas-verificadas")).toHaveCount(0);
  await page.goto("/panel");
  await expect(page.getByText("El círculo Energía solar pidió revisar tus horas de Energía solar")).toHaveCount(1);
  await expect(page.locator("body")).not.toContainText("Faltó conectar el inversor");
  // Puede volver a marcarla con otras horas.
  await page.goto("/pactos?comunidad=valle");
  await marcarHecha(page, 8);
});

test("12 h con el máximo de 10 h: 2 h quedan sin Semillas y se muestran, no se borran", async ({ page, context, baseURL }) => {
  await preadmitir(page, context, baseURL, PERSONA);
  await marcarHecha(page, 12);
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByText("Con el máximo de 10 h, 2 h no generan Semillas")).toBeVisible();
  await expect(page.getByText(/Máximo total de la tarea: 20 h · quedan 20 h por repartir/)).toBeVisible();
  await page.getByRole("button", { name: "Verificar", exact: true }).click();
  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  const bloque = page.getByTestId("horas-verificadas");
  await expect(bloque).toContainText(`Horas verificadas por ${HOLON}: 12 h · 50 Semillas`);
  await expect(bloque).toContainText("12 h verificadas · 10 h con Semillas · 2 h sin Semillas (máximo por persona: 10 h)");
  await page.goto("/semillas?comunidad=valle");
  await expect(page.getByTestId("constancia-puntual")).toContainText("2 h sin Semillas");
});

test("dos personas en la misma tarea: una constancia cada una y cada una ve la suya", async ({ page, context, baseURL }) => {
  await preadmitir(page, context, baseURL, PERSONA);
  await marcarHecha(page, 10);
  await preadmitir(page, context, baseURL, NUEVA);
  await marcarHecha(page, 6);

  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  // Cada una por separado: se verifica a Bruno primero (el orden es el de la verificación).
  await page.getByTestId("tarea-para-verificar").filter({ hasText: "Bruno Gómez" }).getByRole("button", { name: "Verificar", exact: true }).click();
  await expect(page.getByText(/quedan 14 h por repartir/)).toBeVisible();
  await page.getByTestId("tarea-para-verificar").filter({ hasText: "Ana Pérez" }).getByRole("button", { name: "Verificar", exact: true }).click();
  const confirmaciones = (await registro(page)).filter((c) => c.esquema === "pacto-confirma-horas");
  expect(confirmaciones.map((c) => c.datos.horas).sort()).toEqual(["10", "6"]);

  await entrarComo(page, context, baseURL, PERSONA, "/semillas?comunidad=valle");
  await expect(page.getByTestId("constancia-puntual")).toHaveCount(1);
  await expect(page.getByTestId("semillas-puntual")).toContainText("50");
  await entrarComo(page, context, baseURL, NUEVA, "/semillas?comunidad=valle");
  await expect(page.getByTestId("constancia-puntual")).toHaveCount(1);
  await expect(page.getByTestId("semillas-puntual")).toContainText("30");
});

test("otra persona del navegador ve 'La hizo 1 persona' y puede postularse", async ({ page, context, baseURL }) => {
  await preadmitir(page, context, baseURL, PERSONA);
  await marcarHecha(page, 10);
  await verificar(page, context, baseURL, "Ana Pérez");
  await entrarComo(page, context, baseURL, NUEVA, "/tribus/valle");
  await page.locator("#necesidad-valle-solar > summary").click();
  const solar = page.locator("#necesidad-valle-solar");
  await expect(solar.getByText("La hizo 1 persona")).toBeVisible();
  await expect(solar.getByRole("link", { name: "Postularme para tomarla" })).toBeVisible();
});

test("nadie verifica sus propias horas: lo hace el super admin", async ({ page, context, baseURL }) => {
  await entrarComo(page, context, baseURL, ADMIN, "/tribus/valle");
  await postular(page, "valle-solar", HOLON);
  await entrarComo(page, context, baseURL, SUPER, "/pactos/responder");
  await page.getByRole("button", { name: "Pre-admitir", exact: true }).click();
  await entrarComo(page, context, baseURL, ADMIN, "/pactos?comunidad=valle");
  await marcarHecha(page, 4);
  await page.goto("/pactos/responder");
  const fila = page.getByTestId("tarea-para-verificar");
  await expect(fila).toHaveCount(1);
  await expect(fila.getByText(/Son tus propias horas/)).toBeVisible();
  await expect(fila.getByRole("button", { name: "Verificar", exact: true })).toHaveCount(0);
  await entrarComo(page, context, baseURL, SUPER, "/pactos/responder");
  await page.getByRole("button", { name: "Verificar", exact: true }).click();
  expect((await registro(page)).find((c) => c.esquema === "pacto-confirma-horas")).toMatchObject({ por: `prueba:${SUPER}` });
});

test("un círculo transversal: Hifa (experimental, simulado) y el super admin verifica de respaldo", async ({ page, context, baseURL }) => {
  await entrarComo(page, context, baseURL, PERSONA, "/tribus/valle");
  await postular(page, "valle-eventos", "el círculo Comunicación del común");
  await entrarComo(page, context, baseURL, SUPER, "/pactos/responder");
  await page.getByRole("button", { name: "Pre-admitir", exact: true }).click();
  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await page.getByLabel(/Horas que te llevó/).fill("3");
  await page.getByRole("button", { name: "Marcar hecha" }).click();
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByTestId("tarea-para-verificar")).toHaveCount(0);
  await entrarComo(page, context, baseURL, SUPER, "/pactos/responder");
  await expect(page.getByTestId("aviso-hifa-verificar")).toContainText("Hifa (experimental, simulado)");
  await page.getByRole("button", { name: "Verificar", exact: true }).click();
  const conf = (await registro(page)).find((c) => c.esquema === "pacto-confirma-horas");
  expect(conf).toMatchObject({ afirma: "circulo:comunicacion-comun", por: `prueba:${SUPER}`, datos: { horas: "3", respaldoDeHifa: "1" } });
});

test("verificar dos veces las mismas horas registra solo la primera", async ({ page, context, baseURL }) => {
  await preadmitir(page, context, baseURL, PERSONA);
  await marcarHecha(page, 10);
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByRole("button", { name: "Verificar", exact: true })).toBeVisible();
  // Otra pestaña ya respondió: se escribe la confirmación en el registro sin que esta pantalla lo sepa.
  await page.evaluate((k) => {
    const lista = JSON.parse(window.localStorage.getItem(k) ?? "[]") as { id: string; esquema: string; sobre: string }[];
    const h = lista.find((c) => c.esquema === "pacto-propone-horas")!;
    lista.push({
      id: "p99-pacto-confirma-horas", esquema: "pacto-confirma-horas", afirma: "circulo:valle-3", por: "prueba:otro-admin@prueba.test",
      sobre: h.sobre, version: 1, apuntaA: h.id, cuando: "2026-11-10T16:00:00.000Z", revocable: true, datos: { horas: "10" },
    } as never);
    window.localStorage.setItem(k, JSON.stringify(lista));
  }, CLAVE_REGISTRO);
  await page.getByRole("button", { name: "Verificar", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Estas horas ya se respondieron" })).toBeVisible();
  expect((await registro(page)).filter((c) => c.esquema === "pacto-confirma-horas")).toHaveLength(1);
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US" });

  test("las horas verificadas se leen en inglés", async ({ page, context, baseURL }) => {
    await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle&necesidad=valle-solar");
    await page.getByLabel("Tell us how you will do it").fill("With my team");
    await page.getByRole("button", { name: "Send application" }).click();
    await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
    await page.getByRole("button", { name: "Pre-admit", exact: true }).click();
    await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
    await page.getByLabel(/Hours it took you/).fill("10");
    await page.getByRole("button", { name: "Mark as done" }).click();
    await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
    await expect(page.getByRole("heading", { level: 2, name: "Tasks to verify" })).toBeVisible();
    await page.getByRole("button", { name: "Verify", exact: true }).click();
    await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
    await expect(page.getByTestId("horas-verificadas")).toContainText("Hours verified by the Solar energy circle: 10 h · 50 Semillas");
  });
});

test("axe sin violaciones serias o críticas con una tarea hecha, una por verificar y una constancia", async ({ page, context, baseURL }) => {
  const analizar = async () => {
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }));
  };
  await preadmitir(page, context, baseURL, PERSONA);
  await marcarHecha(page, 10);
  expect(await analizar()).toEqual([]);
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByTestId("tarea-para-verificar")).toHaveCount(1);
  expect(await analizar()).toEqual([]);
  await page.getByRole("button", { name: "Verificar", exact: true }).click();
  await entrarComo(page, context, baseURL, PERSONA, "/semillas?comunidad=valle");
  await expect(page.getByTestId("constancia-puntual")).toHaveCount(1);
  expect(await analizar()).toEqual([]);
});
