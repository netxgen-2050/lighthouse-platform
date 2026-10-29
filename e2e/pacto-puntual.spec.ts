import AxeBuilder from "@axe-core/playwright";
import type { BrowserContext } from "@playwright/test";
import { COOKIE_PRUEBA, EMAILS, expect, prefijoDe, test, type Page } from "./fixtura";

// pacto-puntual: miembros y aspirantes del holón se postulan a una necesidad; quien administra el holón pre-admite o no.
// Se cambia de persona en el mismo navegador (cookie de prueba + recarga); el registro compartido es lo que las dos partes leen.

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
  await sembrarDe(page, NUEVA, "lh-perfil", { nombre: "Bruno Gómez" });
  await sembrarDe(page, NUEVA, "lh-sumarte", { plan: "miembro", tribu: true, tribuId: "semilla" });
  await sembrarDe(page, NUEVA, "lh-membresia", { valle: "miembro" });
});

async function entrarComo(page: Page, context: BrowserContext, baseURL: string | undefined, email: string, ruta: string) {
  await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(email), url: baseURL! }]);
  await page.goto(ruta);
}

/** Cambia la membresía de la persona en sesión (después de entrar, con la clave `lh-*` que la app traduce). */
async function membresia(page: Page, valor: Record<string, string>) {
  await page.evaluate((v) => window.localStorage.setItem("lh-membresia", JSON.stringify(v)), valor);
}

async function abrirNecesidad(page: Page, id: string) {
  await page.locator(`#necesidad-${id} > summary`).click();
  return page.locator(`#necesidad-${id}`);
}

/** La persona completa la postulación abierta desde la URL y la envía. */
async function postular(page: Page, necesidad: string, holon: string, comunidad = "valle") {
  await page.goto(`/pactos?comunidad=${comunidad}&necesidad=${necesidad}`);
  await page.getByLabel("Contá cómo la vas a hacer").fill("Lo hago con mi equipo");
  const horas = page.getByLabel(/Horas aproximadas/);
  if ((await horas.inputValue()) === "") await horas.fill("5");
  await page.getByRole("button", { name: "Enviar postulación" }).click();
  await expect(page.getByText(`Esperando que ${holon} responda`)).toBeVisible();
}

async function postularEnergiaSolar(page: Page) {
  await postular(page, "valle-solar", "el círculo Energía solar");
}

test("un miembro se postula desde la ficha y el borrador sale de la necesidad", async ({ page }) => {
  await page.goto("/tribus/valle");
  const solar = await abrirNecesidad(page, "valle-solar");
  await expect(solar.getByText("Máximo por persona: 10 h")).toBeVisible();
  await solar.getByRole("link", { name: "Postularme para tomarla" }).click();
  await expect(page).toHaveURL(/\/pactos\?comunidad=valle$/);

  const articulo = page.getByRole("article").filter({ hasText: "Energía solar" });
  await expect(articulo.getByText("Responde: círculo Energía solar")).toBeVisible();
  await expect(articulo.getByText("Máximo por persona: 10 h · las horas de más no generan Semillas")).toBeVisible();
  await expect(articulo.getByText(/Máximo total de la tarea: 20 h/)).toBeVisible();
  await expect(articulo.getByLabel(/Horas aproximadas/)).toHaveValue("10");
  await expect(articulo.getByLabel("Fecha")).toHaveValue("2026-11-21");
  await expect(articulo.locator("select")).toHaveValue("otro");
  await expect(articulo.getByLabel("¿Qué rol es?")).toHaveValue("Electricidad");
  await expect(articulo.getByLabel("Contá cómo la vas a hacer")).toHaveValue("");
  await expect(articulo.locator("[data-estado-puntual]")).toHaveText("Borrador");

  // Abrirla otra vez (o recargar) no crea otra.
  await page.goto("/pactos?comunidad=valle&necesidad=valle-solar");
  await page.goto("/pactos?comunidad=valle&necesidad=valle-solar");
  await expect(page.getByRole("article")).toHaveCount(1);
});

test("lo que la ficha no tiene queda vacío y enviar incompleto dice qué falta", async ({ page }) => {
  await page.goto("/pactos?comunidad=valle&necesidad=valle-eventos");
  await expect(page.getByLabel(/Horas aproximadas/)).toHaveValue("");
  // El botón avisa con aria-disabled (no deja de ser un botón enfocable): se aprieta igual y no envía nada.
  await page.getByRole("button", { name: "Enviar postulación" }).click({ force: true });
  await expect(page.getByText("Para enviarla poné cuántas horas, la fecha y contá cómo la vas a hacer.")).toBeVisible();
  await expect(page.locator("[data-estado-puntual]")).toHaveText("Borrador");
});

test("el máximo por persona y el total en Semillas viajan en la postulación; sin máximos no hay líneas", async ({ page }) => {
  await page.goto("/tribus/valle");
  await membresia(page, { agua: "miembro", valle: "miembro" });
  await page.goto("/pactos?comunidad=agua&necesidad=agua-plomeria");
  const plomeria = page.getByRole("article").filter({ hasText: "Plomería" });
  await expect(plomeria.getByText(/Máximo por persona: 60 Semillas/)).toBeVisible();
  await expect(plomeria.getByText(/Máximo total de la tarea: 150 Semillas/)).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/brotes|germinar|Semillas pendientes/i);
  await page.goto("/pactos?comunidad=valle&necesidad=valle-eventos");
  const eventos = page.getByRole("article").filter({ hasText: "Eventos y comunidad" });
  await expect(eventos.getByText(/Máximo/)).toHaveCount(0);
});

test("quien no es miembro ni aspirante no puede postularse, ni desde la ficha ni por la URL", async ({ page }) => {
  await page.goto("/tribus/valle");
  await membresia(page, { semilla: "miembro" });
  await page.goto("/tribus/valle");
  const solar = await abrirNecesidad(page, "valle-solar");
  await expect(solar.getByText("Para postularte, primero sumate como aspirante a Valle Solar")).toBeVisible();
  await expect(solar.getByRole("link", { name: "Adherir como aspirante" })).toHaveAttribute("href", "/tribus/valle/manifiesto");
  await expect(solar.getByRole("link", { name: "Postularme para tomarla" })).toHaveCount(0);

  await page.goto("/pactos?comunidad=valle&necesidad=valle-solar");
  await expect(page.getByTestId("aviso-necesidad")).toContainText("Para postularte, primero sumate como aspirante a Valle Solar");
  const guardado = await page.evaluate(() => window.localStorage.getItem("lh-pactos") ?? "");
  expect(guardado).not.toContain("valle-solar");
});

test("un aspirante se postula y ve sus postulaciones aunque no pueda armar un pacto de tiempo", async ({ page }) => {
  await page.goto("/tribus/valle");
  await membresia(page, { valle: "pedido" });
  await page.goto("/tribus/valle");
  const solar = await abrirNecesidad(page, "valle-solar");
  await expect(solar.getByRole("link", { name: "Postularme para tomarla" })).toBeVisible();
  await page.goto("/pactos?comunidad=valle&necesidad=valle-solar");
  await expect(page.getByText("Sos aspirante a Valle Solar: podés postularte a sus tareas; el pacto de tiempo es para miembros")).toBeVisible();
  await expect(page.getByRole("article").filter({ hasText: "Energía solar" })).toBeVisible();
  await expect(page.getByLabel(/Rol que asumís/)).toHaveCount(0);
});

test("miembro de Taller Común se postula al círculo transversal de Valle Solar", async ({ page }) => {
  await page.goto("/tribus/valle");
  await membresia(page, { taller: "miembro" });
  await page.goto("/tribus/valle");
  const eventos = await abrirNecesidad(page, "valle-eventos");
  await expect(eventos.getByText(/Hifa \(experimental, ejemplo\)/)).toBeVisible();
  await expect(eventos.getByRole("link", { name: "Postularme para tomarla" })).toBeVisible();
});

test("Marketing sin aval, tarea tomada y Barda Productiva no ofrecen postularse", async ({ page }) => {
  await page.goto("/tribus/valle");
  await membresia(page, { puerto: "miembro", monte: "miembro", barda: "miembro" });
  await page.goto("/tribus/puerto");
  const marketing = await abrirNecesidad(page, "puerto-marketing");
  await expect(marketing.getByText(/Esperando el aval del círculo/)).toBeVisible();
  await expect(marketing.getByRole("link", { name: "Postularme para tomarla" })).toHaveCount(0);

  await page.goto("/tribus/monte");
  const maquinaria = await abrirNecesidad(page, "monte-maquinaria");
  await expect(maquinaria.getByRole("link", { name: "Postularme para tomarla" })).toHaveCount(0);

  await page.goto("/tribus/barda");
  const riego = await abrirNecesidad(page, "barda-riego");
  await expect(riego.getByText("Barda Productiva por ahora no toma pactos puntuales")).toBeVisible();
  await expect(riego.getByRole("link", { name: "Postularme para tomarla" })).toHaveCount(0);
});

test("una necesidad que no se puede tomar no crea nada", async ({ page }) => {
  await page.goto("/pactos?comunidad=valle&necesidad=monte-bioconstruccion");
  await expect(page.getByTestId("aviso-necesidad")).toHaveText("Esa necesidad no se puede tomar");
  await expect(page.getByRole("article").filter({ hasText: "Bioconstrucción" })).toHaveCount(0);
});

test("envía, retira y vuelve a enviar; sin botones para responder por el holón", async ({ page }) => {
  await postularEnergiaSolar(page);
  await expect(page.getByRole("button", { name: /Simular/ })).toHaveCount(0);
  await expect(page.locator("[data-estado-puntual]")).toHaveText("Enviada");
  await page.getByRole("button", { name: "Retirar y editar" }).click();
  await expect(page.locator("[data-estado-puntual]")).toHaveText("Borrador");
  await expect(page.getByLabel("Contá cómo la vas a hacer")).toHaveValue("Lo hago con mi equipo");
  await expect(page.getByLabel(/Horas aproximadas/)).toHaveValue("10");
  await page.getByRole("button", { name: "Enviar postulación" }).click();
  await expect(page.getByText("Esperando que el círculo Energía solar responda")).toBeVisible();
});

test("quien administra el círculo pre-admite, la persona lo ve en Pactos, la ficha, Mi recorrido y no se abre la ronda", async ({ page, context, baseURL }) => {
  await postularEnergiaSolar(page);

  await entrarComo(page, context, baseURL, ADMIN, "/tribus/valle");
  await page.getByRole("link", { name: "Pactos para responder (1)" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Postulaciones a tareas" })).toBeVisible();
  const articulo = page.getByRole("article");
  await expect(articulo).toHaveCount(1);
  await expect(articulo.getByRole("heading")).toContainText("Ana Pérez · miembro");
  await expect(articulo).toContainText("Energía solar");
  await expect(articulo).toContainText("Máximo por persona: 10 h");
  await expect(articulo).toContainText("Máximo total de la tarea: 20 h");
  await expect(page.locator("body")).not.toContainText(PERSONA);
  await articulo.getByRole("button", { name: "Pre-admitir", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Pre-admitiste a Ana Pérez para Energía solar." })).toBeFocused();

  const registro = JSON.parse(await page.evaluate((k) => window.localStorage.getItem(k) ?? "[]", CLAVE_REGISTRO)) as {
    esquema: string;
    afirma: string;
    por: string;
    datos: Record<string, string>;
  }[];
  expect(registro.find((c) => c.esquema === "pacto-acepta")).toMatchObject({ afirma: "circulo:valle-3", por: `prueba:${ADMIN}` });
  expect(JSON.stringify(registro.find((c) => c.esquema === "pacto-propone")?.datos)).not.toContain("@");

  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await expect(page.locator("[data-estado-puntual]")).toHaveText("Pre-admitida");
  await page.goto("/tribus/valle");
  const solar = await abrirNecesidad(page, "valle-solar");
  await expect(solar.getByText("Pre-admitida: la tomaste")).toBeVisible();
  await page.goto("/panel");
  await expect(page.getByText("El círculo Energía solar pre-admitió tu postulación a Energía solar")).toHaveCount(1);
  await page.goto("/pactos?comunidad=valle");
  await page.goto("/panel");
  await expect(page.getByText("El círculo Energía solar pre-admitió tu postulación a Energía solar")).toHaveCount(1);
  await page.goto("/semillas?comunidad=valle");
  await expect(page.getByText("La ronda es solo para quienes tienen un pacto aceptado en Valle Solar")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar ronda" })).toHaveCount(0);
});

test("no pre-admitir pide motivo; la postulación vuelve a Borrador con el motivo", async ({ page, context, baseURL }) => {
  await postularEnergiaSolar(page);
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await page.getByRole("button", { name: "No pre-admitir" }).click();
  await page.getByRole("button", { name: "Confirmar que no se pre-admite" }).click();
  await expect(page.getByText("Contá por qué, así la persona puede ajustarla")).toBeVisible();
  await page.getByLabel(/Motivo/).fill("Necesitamos a alguien con matrícula de electricista");
  await page.getByRole("button", { name: "Confirmar que no se pre-admite" }).click();
  await expect(page.getByText("No hay pactos esperando tu respuesta")).toBeVisible();

  await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
  await expect(page.locator("[data-estado-puntual]")).toHaveText("Borrador");
  await expect(page.getByTestId("aviso-no-preadmitida")).toContainText(
    "El círculo Energía solar no pre-admitió tu postulación: Necesitamos a alguien con matrícula de electricista",
  );
  await page.goto("/panel");
  await expect(page.getByText("El círculo Energía solar no pre-admitió tu postulación a Energía solar")).toHaveCount(1);
});

test("dos personas toman la misma tarea y cada una ve la suya", async ({ page, context, baseURL }) => {
  await postularEnergiaSolar(page);
  await entrarComo(page, context, baseURL, NUEVA, "/tribus/valle");
  await postularEnergiaSolar(page);

  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await page.getByRole("article").filter({ hasText: "Ana Pérez" }).getByRole("button", { name: "Pre-admitir", exact: true }).click();
  const segunda = page.getByRole("article").filter({ hasText: "Bruno Gómez" });
  await expect(segunda.getByText("Ya pre-admitiste a 1 persona para esta tarea")).toBeVisible();
  await expect(segunda.getByText(/Máximo total de la tarea: 20 h/)).toBeVisible();
  await expect(segunda.getByText("Entre todas las personas pre-admitidas suman 10 h de las 20 h del máximo total")).toBeVisible();
  await segunda.getByRole("button", { name: "Pre-admitir", exact: true }).click();
  await expect(page.getByText("No hay pactos esperando tu respuesta")).toBeVisible();

  await entrarComo(page, context, baseURL, PERSONA, "/tribus/valle");
  const solar = await abrirNecesidad(page, "valle-solar");
  await expect(solar.getByText("Pre-admitida: la tomaste")).toBeVisible();
  await expect(solar.getByText("La tomó 1 persona")).toBeVisible();
});

test("otra persona ve que ya la tomaron y puede postularse también", async ({ page, context, baseURL }) => {
  await postularEnergiaSolar(page);
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await page.getByRole("button", { name: "Pre-admitir", exact: true }).click();
  await entrarComo(page, context, baseURL, NUEVA, "/tribus/valle");
  const solar = await abrirNecesidad(page, "valle-solar");
  await expect(solar.getByText("La tomó 1 persona")).toBeVisible();
  await expect(solar.getByRole("link", { name: "Postularme para tomarla" })).toBeVisible();
});

test("un círculo transversal lo responde el super admin (respaldo de Hifa) y no quien lidera la tribu", async ({ page, context, baseURL }) => {
  await postular(page, "valle-eventos", "el círculo Comunicación del común");
  await expect(page.getByText(/Hifa \(experimental, simulado\)/)).toBeVisible();

  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByRole("article")).toHaveCount(0);

  await entrarComo(page, context, baseURL, SUPER, "/pactos/responder");
  await expect(page.getByText(/Como Hifa no está disponible en el prototipo, respondés como su respaldo/)).toBeVisible();
  await page.getByRole("button", { name: "Pre-admitir", exact: true }).click();
  const registro = JSON.parse(await page.evaluate((k) => window.localStorage.getItem(k) ?? "[]", CLAVE_REGISTRO)) as {
    esquema: string;
    afirma: string;
    por: string;
    datos: Record<string, string>;
  }[];
  const acepta = registro.find((c) => c.esquema === "pacto-acepta");
  expect(acepta).toMatchObject({ afirma: "circulo:comunicacion-comun", por: `prueba:${SUPER}` });
  expect(acepta?.datos.respaldoDeHifa).toBe("1");
});

test("nadie responde su propia postulación", async ({ page, context, baseURL }) => {
  await entrarComo(page, context, baseURL, ADMIN, "/pactos?comunidad=valle&necesidad=valle-solar");
  await page.getByLabel("Contá cómo la vas a hacer").fill("Coordino el montaje");
  await page.getByRole("button", { name: "Enviar postulación" }).click();
  await expect(page.getByText("Esperando que el círculo Energía solar responda")).toBeVisible();
  await page.goto("/pactos/responder");
  await expect(page.getByText("Es tu propia postulación: la responde otra persona que administre el círculo Energía solar o el super admin")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pre-admitir", exact: true })).toHaveCount(0);
});

test("responder dos veces la misma postulación registra solo la primera", async ({ page, context, baseURL }) => {
  await postularEnergiaSolar(page);
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByRole("button", { name: "Pre-admitir", exact: true })).toBeVisible();
  // Otra pestaña ya respondió: se escribe la respuesta en el registro sin que esta pantalla lo sepa.
  await page.evaluate((k) => {
    const lista = JSON.parse(window.localStorage.getItem(k) ?? "[]") as { id: string; sobre: string }[];
    const p = lista[0];
    lista.push({
      id: "p9-pacto-acepta",
      esquema: "pacto-acepta",
      afirma: "circulo:valle-3",
      por: "prueba:otro-admin@prueba.test",
      sobre: p.sobre,
      version: 1,
      apuntaA: p.id,
      cuando: "2026-10-28T11:00:00.000Z",
      revocable: true,
      datos: {},
    } as never);
    window.localStorage.setItem(k, JSON.stringify(lista));
  }, CLAVE_REGISTRO);
  await page.getByRole("button", { name: "Pre-admitir", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Esta postulación ya se respondió" })).toBeVisible();
  const registro = JSON.parse(await page.evaluate((k) => window.localStorage.getItem(k) ?? "[]", CLAVE_REGISTRO)) as { esquema: string }[];
  expect(registro.filter((c) => c.esquema === "pacto-acepta")).toHaveLength(1);
});

test("borrar los datos saca la postulación de quien borra", async ({ page, context, baseURL }) => {
  await postularEnergiaSolar(page);
  await page.goto("/configuracion");
  page.once("dialog", (d) => void d.accept());
  await page.getByRole("button", { name: "Borrar todo lo guardado en este navegador" }).click();
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByText("No hay pactos esperando tu respuesta")).toBeVisible();
});

test("el ⚖ de Pacto puntual se lee con el teclado y Escape lo esconde", async ({ page }) => {
  await page.goto("/pactos?comunidad=valle&necesidad=valle-solar");
  const boton = page.getByRole("button", { name: /Qué significa legalmente: Pacto puntual/ });
  await boton.focus();
  await expect(page.getByRole("tooltip")).toContainText("No es un contrato de trabajo");
  await expect(page.getByRole("tooltip")).toContainText("horario impuesto");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US" });

  test("la postulación pre-admitida se lee en inglés", async ({ page, context, baseURL }) => {
    await page.goto("/pactos?comunidad=valle&necesidad=valle-solar");
    await page.getByLabel("Tell us how you will do it").fill("With my team");
    await page.getByRole("button", { name: "Send application" }).click();
    await expect(page.getByText("Waiting for the Solar energy circle to answer").or(page.getByText(/Waiting for .* to answer/))).toBeVisible();
    await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
    await page.getByRole("button", { name: "Pre-admit", exact: true }).click();
    await entrarComo(page, context, baseURL, PERSONA, "/pactos?comunidad=valle");
    await expect(page.getByText("One-off pact", { exact: true })).toBeVisible();
    await expect(page.locator("[data-estado-puntual]")).toHaveText("Pre-admitted");
  });
});

test("axe sin violaciones serias o críticas en /pactos con una postulación enviada y en /pactos/responder con una pendiente", async ({ page, context, baseURL }) => {
  await postularEnergiaSolar(page);
  const analizar = async () => {
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }));
  };
  expect(await analizar()).toEqual([]);
  await entrarComo(page, context, baseURL, ADMIN, "/pactos/responder");
  await page.getByRole("button", { name: "No pre-admitir" }).click();
  expect(await analizar()).toEqual([]);
});
