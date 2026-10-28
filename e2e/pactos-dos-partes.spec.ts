import AxeBuilder from "@axe-core/playwright";
import type { BrowserContext } from "@playwright/test";
import { COOKIE_PRUEBA, EMAILS, EMAIL_FUERA_DE_LISTA, expect, prefijoDe, test, type Page } from "./fixtura";

// pactos-dos-partes: la persona propone, la tribu responde. Se cambia de persona en el mismo navegador (cookie de prueba + recarga);
// el registro compartido `compartido:pactos-constancias` es lo que las dos partes leen.

const PERSONA = EMAILS.persona;
const ADMIN = EMAILS["admin-tribu"];
const SUPER = EMAILS.superadmin;
const NUEVA = "nueva@prueba.test";
const CLAVE_REGISTRO = "compartido:pactos-constancias";

test.use({ rol: "persona" });

/** Siembra una clave de OTRA persona (con su prefijo), solo si todavía no hay nada. */
async function sembrarDe(page: Page, email: string, clave: string, valor: unknown) {
  await page.addInitScript(
    ([k, v]) => {
      if (window.localStorage.getItem(k) === null) window.localStorage.setItem(k, v);
    },
    [prefijoDe(email) + clave, JSON.stringify(valor)] as const,
  );
}

test.beforeEach(async ({ page }) => {
  await sembrarDe(page, PERSONA, "lh-membresia", { valle: "miembro", lighthouse: "miembro", semilla: "miembro" });
  await sembrarDe(page, PERSONA, "lh-perfil", { nombre: "Ana Pérez" });
  await sembrarDe(page, ADMIN, "lh-membresia", { valle: "miembro" });
  // Plan Tribu: crea su propia tribu y la lidera sin aprobación de nadie.
  await sembrarDe(page, NUEVA, "lh-sumarte", { plan: "miembro", tribu: true, tribuId: "semilla" });
  await sembrarDe(page, NUEVA, "lh-membresia", { semilla: "miembro" });
});

async function entrarComo(page: Page, context: BrowserContext, baseURL: string | undefined, email: string, ruta: string) {
  await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(email), url: baseURL! }]);
  await page.goto(ruta);
}

async function enviarPacto(page: Page, comunidad: string, nombreComunidad: string) {
  await page.goto(`/pactos?comunidad=${comunidad}`);
  await page.getByLabel(/Rol que asumís/).selectOption({ label: "Facilitación" });
  await page.getByLabel("Tu descripción: qué vas a hacer").fill("Facilito las asambleas");
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await expect(page.getByText(`Esperando la respuesta de ${nombreComunidad}`)).toBeVisible();
}

async function proponerCambio(page: Page, horas: string) {
  await page.getByRole("button", { name: "Proponer un cambio" }).click();
  await page.getByLabel(/Compromiso mensual propuesto/).fill(horas);
  await page.getByRole("button", { name: "Enviar cambio a la comunidad" }).click();
  await expect(page.getByTestId("esperando-respuesta-cambio")).toBeVisible();
}

/** Persona envía → la tribu acepta → la persona vuelve. Deja la página en /pactos?comunidad=valle con el pacto aceptado. */
async function pactoAceptadoPorValle(page: Page, context: BrowserContext, baseURL: string | undefined) {
  await enviarPacto(page, "valle", "Valle Solar");
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await page.getByRole("button", { name: "Aceptar", exact: true }).click();
  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
}

test("la persona envía, quien lidera acepta y la persona lo ve en Pactos, Semillas y Mi recorrido", async ({ page, context, baseURL }) => {
  await enviarPacto(page, "valle", "Valle Solar");
  // No hay botones simulados del lado de la persona.
  await expect(page.getByRole("button", { name: /Simular/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Retirar y editar" })).toBeVisible();

  await entrarComo(page, context, baseURL, ADMIN, "/tribus/valle");
  await page.getByRole("link", { name: "Pactos para responder (1)" }).click();
  await expect(page).toHaveURL(/\/pactos\/responder$/);
  await expect(page.getByRole("heading", { level: 1, name: "Pactos esperando tu respuesta" })).toBeVisible();
  const articulo = page.getByRole("article");
  await expect(articulo).toHaveCount(1);
  // La tribu ve el nombre del perfil, nunca el email.
  await expect(articulo.getByRole("heading")).toContainText("Ana Pérez");
  await expect(articulo).toContainText("Facilitación");
  await expect(articulo).toContainText("10 h/mes");
  await expect(articulo).toContainText("Facilito las asambleas");
  await expect(articulo).toContainText("Pacto nuevo · propone la versión 1");
  await expect(page.locator("body")).not.toContainText(PERSONA);
  // Los datos de la propuesta llevan el nombre del perfil y ningún email (el id técnico va solo en `por` y `sobre`).
  const registro = JSON.parse(await page.evaluate((k) => window.localStorage.getItem(k) ?? "[]", CLAVE_REGISTRO)) as {
    datos: Record<string, string>;
  }[];
  expect(registro[0].datos.nombre).toBe("Ana Pérez");
  expect(JSON.stringify(registro[0].datos)).not.toContain("@");

  await articulo.getByRole("button", { name: "Aceptar", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Aceptaste el pacto de Ana Pérez en Valle Solar." })).toBeFocused();
  await expect(page.getByText("No hay pactos esperando tu respuesta")).toBeVisible();

  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
  await expect(page.getByTestId("version-pacto")).toHaveText("Versión 1");
  await expect(page.getByRole("button", { name: /Qué significa legalmente: Pacto aceptado por las dos partes/ })).toBeVisible();
  await page.goto("/semillas");
  await expect(page.getByTestId("total-valle")).toHaveText("150 semillas");
  await page.goto("/panel");
  await expect(page.getByText("Valle Solar aceptó tu pacto")).toHaveCount(1);
  await page.goto("/pactos?comunidad=valle");
  await page.goto("/panel");
  await expect(page.getByText("Valle Solar aceptó tu pacto")).toHaveCount(1);
});

test("un cambio no aceptado con motivo: sigue la versión 1 y la persona ve el motivo; sin motivo no se registra", async ({
  page,
  context,
  baseURL,
}) => {
  await pactoAceptadoPorValle(page, context, baseURL);
  await proponerCambio(page, "20");

  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByRole("article")).toContainText("Cambio · de 10 a 20 h/mes · propone la versión 2");
  await page.getByRole("button", { name: "No aceptar" }).click();
  await page.getByRole("button", { name: "Confirmar que no se acepta" }).click();
  await expect(page.getByText("Contá por qué, así la persona puede ajustarlo")).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByLabel(/Motivo/).fill("Por ahora necesitamos 10 h/mes");
  await page.getByRole("button", { name: "Confirmar que no se acepta" }).click();
  await expect(page.getByText("No hay pactos esperando tu respuesta")).toBeVisible();

  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await expect(page.getByTestId("version-pacto")).toHaveText("Versión 1");
  await expect(page.getByText("Compromiso mensual: 10 h/mes")).toBeVisible();
  await expect(page.getByTestId("aviso-no-aceptado")).toContainText("Valle Solar no aceptó tu pacto: Por ahora necesitamos 10 h/mes");
  await expect(page.getByRole("region", { name: "Cambio propuesto" })).toHaveCount(0);
});

test("un pacto nuevo no aceptado vuelve a Borrador con su contenido", async ({ page, context, baseURL }) => {
  await enviarPacto(page, "valle", "Valle Solar");
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await page.getByRole("button", { name: "No aceptar" }).click();
  await page.getByLabel(/Motivo/).fill("Por ahora necesitamos 8 h/mes");
  await page.getByRole("button", { name: "Confirmar que no se acepta" }).click();
  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await expect(page.getByRole("listitem").filter({ hasText: "Borrador" })).toHaveAttribute("aria-current", "step");
  await expect(page.getByLabel("Tu descripción: qué vas a hacer")).toHaveValue("Facilito las asambleas");
  await expect(page.getByTestId("aviso-no-aceptado")).toContainText("Valle Solar no aceptó tu pacto: Por ahora necesitamos 8 h/mes");
  await page.goto("/panel");
  await expect(page.getByText("Valle Solar no aceptó tu pacto")).toBeVisible();
});

test("retirar saca el pendiente de la tribu y la propuesta queda revocada en el registro", async ({ page, context, baseURL }) => {
  await enviarPacto(page, "valle", "Valle Solar");
  await page.getByRole("button", { name: "Retirar y editar" }).click();
  await expect(page.getByRole("button", { name: "Enviar a la comunidad" })).toBeFocused();
  const lista = JSON.parse(await page.evaluate((k) => window.localStorage.getItem(k) ?? "[]", CLAVE_REGISTRO)) as { esquema: string; apuntaA: string | null }[];
  expect(lista.map((c) => c.esquema)).toEqual(["pacto-propone", "revoca"]);
  expect(lista[1].apuntaA).toBe("p1-pacto-propone");
  await entrarComo(page, context, baseURL, ADMIN, "/tribus/valle");
  await expect(page.getByRole("link", { name: "Pactos para responder (0)" })).toBeVisible();
  await page.goto("/pactos/responder");
  await expect(page.getByText("No hay pactos esperando tu respuesta")).toBeVisible();
});

test("responder algo retirado en otra pestaña no registra y avisa que ya no está pendiente", async ({ page, context, baseURL }) => {
  await enviarPacto(page, "valle", "Valle Solar");
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByRole("article")).toHaveCount(1);
  // La lista ya está cargada; mientras tanto la persona retira su pacto (se simula escribiendo la revocación en el registro).
  await page.evaluate((k) => {
    const lista = JSON.parse(window.localStorage.getItem(k) ?? "[]") as Record<string, unknown>[];
    lista.push({ id: `p${lista.length + 1}-revoca`, esquema: "revoca", afirma: lista[0].afirma, por: lista[0].por, sobre: lista[0].sobre, version: 1, apuntaA: lista[0].id, cuando: new Date().toISOString(), revocable: false, datos: {} });
    window.localStorage.setItem(k, JSON.stringify(lista));
  }, CLAVE_REGISTRO);
  await page.getByRole("button", { name: "Aceptar", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Este pacto ya no está pendiente" })).toBeVisible();
  const lista = JSON.parse(await page.evaluate((k) => window.localStorage.getItem(k) ?? "[]", CLAVE_REGISTRO)) as { esquema: string }[];
  expect(lista.map((c) => c.esquema)).toEqual(["pacto-propone", "revoca"]);
});

test("otra persona no ve el pacto de Valle Solar; quien no lidera nada ve que no tiene pactos para responder", async ({
  page,
  context,
  baseURL,
}) => {
  await enviarPacto(page, "valle", "Valle Solar");
  // Quien lidera otra tribu (Plan Tribu, Semilla Viva) no ve el pacto enviado a Valle Solar.
  await entrarComo(page, context, baseURL, NUEVA, "/pactos/responder");
  await expect(page.getByText("No hay pactos esperando tu respuesta")).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(0);
  await entrarComo(page, context, baseURL, EMAIL_FUERA_DE_LISTA, "/pactos/responder");
  await expect(page.getByText("No tenés pactos para responder")).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(0);
});

test("Plan Tribu: quien crea su tribu responde el pacto enviado a ella, sin aprobación de nadie", async ({ page, context, baseURL }) => {
  await enviarPacto(page, "semilla", "Semilla Viva");
  await entrarComo(page, context, baseURL, NUEVA, "/pactos/responder");
  await expect(page.getByRole("heading", { level: 2, name: "Pactos para Semilla Viva" })).toBeVisible();
  await page.getByRole("button", { name: "Aceptar", exact: true }).click();
  await expect(page.getByText("Aceptaste el pacto de Ana Pérez en Semilla Viva.")).toBeVisible();
  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=semilla");
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
});

test("el pacto con el Lighthouse lo responde el super admin y no quien lidera Valle Solar", async ({ page, context, baseURL }) => {
  await enviarPacto(page, "lighthouse", "Lighthouse");
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByRole("article")).toHaveCount(0);
  await entrarComo(page, context, baseURL, SUPER, "/pactos/responder");
  await expect(page.getByRole("heading", { level: 2, name: "Pactos para Lighthouse" })).toBeVisible();
  await page.getByRole("button", { name: "Aceptar", exact: true }).click();
  const registro = JSON.parse(await page.evaluate((k) => window.localStorage.getItem(k) ?? "[]", CLAVE_REGISTRO)) as {
    esquema: string;
    afirma: string;
    por: string;
  }[];
  expect(registro[1]).toMatchObject({ esquema: "pacto-acepta", afirma: "comunidad:lighthouse", por: `prueba:${SUPER}` });
});

test("quien lidera no responde su propio pacto; el super admin sí, y no ve el de una persona común", async ({ page, context, baseURL }) => {
  // La persona común también envía a Valle Solar: el super admin no lo ve.
  await enviarPacto(page, "valle", "Valle Solar");
  await entrarComo(page, context, baseURL, ADMIN, "/pactos?comunidad=valle");
  await page.getByLabel(/Rol que asumís/).selectOption({ label: "Coordinación o project management" });
  await page.getByLabel("Tu descripción: qué vas a hacer").fill("Coordino la tribu");
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await expect(page.getByText("Esperando la respuesta de Valle Solar")).toBeVisible();

  await page.goto("/pactos/responder");
  await expect(page.getByRole("article")).toHaveCount(2);
  const propio = page.getByRole("article").filter({ hasText: "Coordino la tribu" });
  await expect(propio).toContainText("Es tu propio pacto: lo responde otra persona que lidere la tribu o, si no hay, el super admin");
  await expect(propio.getByRole("button")).toHaveCount(0);
  await expect(page.getByRole("article").filter({ hasText: "Facilito las asambleas" }).getByRole("button", { name: "Aceptar", exact: true })).toBeVisible();

  await entrarComo(page, context, baseURL, SUPER, "/pactos/responder");
  await expect(page.getByRole("article")).toHaveCount(1);
  const delLider = page.getByRole("article");
  await expect(delLider).toContainText("Coordino la tribu");
  await expect(delLider).toContainText("Lo propone quien lidera Valle Solar");
  await expect(page.getByText("Facilito las asambleas")).toHaveCount(0);
  await delLider.getByRole("button", { name: "Aceptar", exact: true }).click();
  const registro = JSON.parse(await page.evaluate((k) => window.localStorage.getItem(k) ?? "[]", CLAVE_REGISTRO)) as {
    esquema: string;
    afirma: string;
    por: string;
  }[];
  const acepta = registro.find((c) => c.esquema === "pacto-acepta");
  expect(acepta).toMatchObject({ afirma: "tribu:valle", por: `prueba:${SUPER}` });

  await entrarComo(page, context, baseURL, ADMIN, "/pactos?comunidad=valle");
  await expect(page.getByText("Pacto aceptado")).toBeVisible();
});

test("borrar los datos de la demo saca solo las constancias de quien borra", async ({ page, context, baseURL }) => {
  await enviarPacto(page, "valle", "Valle Solar");
  await entrarComo(page, context, baseURL, ADMIN, "/pactos?comunidad=valle");
  await page.getByLabel(/Rol que asumís/).selectOption({ label: "Coordinación o project management" });
  await page.getByLabel("Tu descripción: qué vas a hacer").fill("Coordino la tribu");
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await expect(page.getByText("Esperando la respuesta de Valle Solar")).toBeVisible();
  // Configuración > Borrar datos de la demo saca solo lo del líder del registro compartido.
  await page.goto("/configuracion");
  page.once("dialog", (d) => void d.accept());
  await page.getByRole("button", { name: "Borrar todo lo guardado en este navegador" }).click();
  const restantes = JSON.parse(await page.evaluate((k) => window.localStorage.getItem(k) ?? "[]", CLAVE_REGISTRO)) as { sobre: string }[];
  expect(restantes.map((c) => c.sobre)).toEqual([`pacto:valle:prueba:${PERSONA}`]);
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US" });

  test("quien lidera ve la pantalla en inglés y responde con el teclado", async ({ page, context, baseURL }) => {
    // Propuesta sembrada: la persona no tiene que escribir el pacto en inglés para probar la pantalla de la tribu.
    await page.addInitScript(
      ([k, sobre, persona]) => {
        if (window.localStorage.getItem(k) !== null) return;
        window.localStorage.setItem(
          k,
          JSON.stringify([
            {
              id: "p1-pacto-propone",
              esquema: "pacto-propone",
              afirma: `persona:${persona}`,
              por: persona,
              sobre,
              version: 1,
              apuntaA: null,
              cuando: "2026-10-28T10:00:00.000Z",
              revocable: true,
              datos: { tipo: "nuevo", rol: "facilitacion", rolOtro: "", descripcion: "Facilito", horas: "10", nombre: "Ana Pérez" },
            },
          ]),
        );
      },
      [CLAVE_REGISTRO, `pacto:valle:prueba:${PERSONA}`, `prueba:${PERSONA}`] as const,
    );
    await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
    await expect(page.getByRole("heading", { level: 1, name: "Pacts waiting for your answer" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Accept", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Don't accept" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByLabel(/Reason/)).toBeFocused();
    await page.keyboard.type("Not now");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Confirm: not accepted" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("status").filter({ hasText: "You did not accept the pact of Ana Pérez in Valle Solar." })).toBeFocused();
  });
});

test("axe sin violaciones serias o críticas en /pactos/responder con un pendiente y el motivo abierto", async ({ page, context, baseURL }) => {
  await enviarPacto(page, "valle", "Valle Solar");
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await page.getByRole("button", { name: "No aceptar" }).click();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});
