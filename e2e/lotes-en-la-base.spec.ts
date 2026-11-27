import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { COOKIE_PRUEBA, emailUnico, expect, liberarLotes, registrarConsentimientoDe, reservarPorApi, test, type Page } from "./fixtura";
import { lotesDelGrupo } from "../lib/territorios/loteo";
import { estadoDeLote } from "../lib/territorios/loteo-estados";

// Las reservas viven en el servidor (`lotes-en-la-base`, noche 1): lo que reserva una persona lo ve toda otra persona. Este archivo
// usa lotes SOLO suyos (el 6.º, 7.º y 8.º disponibles del norte), que libera antes de empezar.
const disponibles = lotesDelGrupo("norte").filter((l) => estadoDeLote(l.id) === "disponible");
const LOTE_A = disponibles[5];
const LOTE_B = disponibles[6];
const LOTE_D = disponibles[7];

const LEI = "Leí lo que comparto y lo que me comprometo a pagar";

test.use({ identidad: "propia" });

test.beforeEach(async ({ request }) => {
  await liberarLotes(request, [LOTE_A.id, LOTE_B.id, LOTE_D.id]);
});

/** Otra persona, en otro contexto del navegador (otra sesión, otras cookies, nada compartido con la de la fixtura). */
async function conOtraPersona(
  browser: import("@playwright/test").Browser,
  baseURL: string,
  extraHTTPHeaders: Record<string, string> | undefined,
  email: string,
) {
  const context = await browser.newContext({ baseURL, locale: "es-AR", extraHTTPHeaders });
  await registrarConsentimientoDe(context.request, email);
  await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(email), url: baseURL }]);
  const page = await context.newPage();
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
  return { context, page };
}

const sinMosaicos = (page: Page) => page.route("**://server.arcgisonline.com/**", (r) => r.abort());

test("A reserva un lote y B, en otro navegador, lo ve Reservado y no puede reservarlo", async ({
  page,
  browser,
  baseURL,
  extraHTTPHeaders,
  request,
  emailActual,
}) => {
  await sinMosaicos(page);
  await page.goto(`/lotes/${LOTE_A.id}`);
  await page.getByLabel(LEI).check();
  await page.getByRole("button", { name: "Reservar (simulado)" }).click();
  await expect(page.getByText("Reservado (simulado, por vos)").first()).toBeVisible();

  const emailB = emailUnico("otra");
  const b = await conOtraPersona(browser, baseURL!, extraHTTPHeaders, emailB);
  try {
    await b.page.goto(`/lotes/${LOTE_A.id}`);
    await expect(b.page.getByRole("heading", { level: 1 })).toHaveText(`Lote ${LOTE_A.numero}`);
    // "Reservado" a secas: no es "por vos", y no se ofrece reservar.
    await expect(b.page.getByText(/Reservado$/).first()).toBeVisible();
    await expect(b.page.getByText("Reservado (simulado, por vos)")).toHaveCount(0);
    await expect(b.page.getByRole("button", { name: /Reservar/ })).toHaveCount(0);
    // La lista también lo muestra reservado, y otro lote sigue disponible.
    await b.page.goto("/lotes");
    await expect(b.page.getByRole("link", { name: new RegExp(`^Lote ${LOTE_A.numero} `) })).toContainText("Reservado");
    await expect(b.page.getByRole("link", { name: new RegExp(`^Lote ${LOTE_B.numero} `) })).toContainText("Disponible");
    // Y si B insiste por la API, el servidor lo rechaza.
    const r = await b.context.request.post("/api/lotes/reservas", {
      headers: { "x-lh-prueba": emailB },
      data: { accion: "reservar", loteId: LOTE_A.id, opcion: "solo-lote", vio: { precio: 1, aporte: 1, expensa: 1, version: "x" } },
    });
    expect(r.status()).toBe(409);
    expect((await r.json()).motivo).toBe("ya-reservado");
  } finally {
    await b.context.close();
  }
  // La reserva de A sigue siendo de A.
  const mias = await request.get("/api/lotes/reservas", { headers: { "x-lh-prueba": emailActual } });
  expect((await mias.json()).compras.map((c: { loteId: string }) => c.loteId)).toEqual([LOTE_A.id]);
});

test("si el servidor no guarda la reserva se ve el error y el lote no cambia", async ({ page, request, emailActual }) => {
  await sinMosaicos(page);
  await page.route("**/api/lotes/reservas", (ruta) => (ruta.request().method() === "POST" ? ruta.fulfill({ status: 500, json: { ok: false } }) : ruta.continue()));
  await page.goto(`/lotes/${LOTE_B.id}`);
  await page.getByLabel(LEI).check();
  await page.getByRole("button", { name: "Reservar (simulado)" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "No pudimos guardar tu reserva. Probá de nuevo." })).toBeVisible();
  // El lote sigue como estaba: disponible, con el botón para reservar, y nada quedó guardado.
  await expect(page.getByText("Reservado (simulado, por vos)")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Reservar (simulado)" })).toBeVisible();
  await expect(page.getByText("Disponible").first()).toBeVisible();
  const mias = await request.get("/api/lotes/reservas", { headers: { "x-lh-prueba": emailActual } });
  expect((await mias.json()).compras).toEqual([]);
});

test("si alguien reservó el lote un instante antes, se avisa y el lote se ve reservado", async ({ page, request }) => {
  await sinMosaicos(page);
  await page.goto(`/lotes/${LOTE_B.id}`);
  await page.getByLabel(LEI).check();
  // Otra persona lo reserva después de que esta pantalla lo vio disponible.
  await reservarPorApi(request, emailUnico("rapida"), LOTE_B.id);
  await page.getByRole("button", { name: "Reservar (simulado)" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Alguien reservó este lote hace un momento." })).toBeVisible();
  await expect(page.getByText("Reservado (simulado, por vos)")).toHaveCount(0);
  // Los estados se actualizan: el lote figura reservado y ya no se ofrece reservarlo.
  await expect(page.getByText(/Reservado$/).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Reservar (simulado)" })).toHaveCount(0);
});

test("si no llegan los estados se avisa y quedan los de ejemplo", async ({ page }) => {
  await sinMosaicos(page);
  await page.route("**/api/lotes/estados", (ruta) => ruta.fulfill({ status: 503, json: { ok: false } }));
  await page.goto("/lotes");
  // /lotes lleva a Explorar, que tiene dos listas de lotes: cada una avisa.
  await expect(page.getByText("No pudimos traer el estado actual de los lotes.").first()).toBeVisible();
  // Los de ejemplo siguen a la vista y ningún lote de ejemplo no disponible figura disponible por el fallo.
  await expect(page.getByRole("link", { name: /^Lote 13 / })).toContainText("Vendido");
});

test.describe("Mis datos con las reservas", () => {
  test.use({ rol: "persona", consentimiento: "ninguno", plan: "ninguno" });

  test("la descarga trae las reservas del servidor y borrar libera el lote para otra persona, sin borrar el libro", async ({
    page,
    request,
    emailActual,
  }) => {
    await sinMosaicos(page);
    await reservarPorApi(request, emailActual, LOTE_D.id);
    const estados = async () => ((await (await request.get("/api/lotes/estados")).json()) as { estados: Record<string, string> }).estados;
    expect((await estados())[LOTE_D.id]).toBe("reservado");

    await page.goto("/mis-datos");
    const descarga = page.waitForEvent("download");
    await page.getByRole("button", { name: "Descargar mis datos" }).click();
    const json = JSON.parse(await readFile((await (await descarga).path())!, "utf8"));
    expect(json.datos.reservas).toHaveLength(1);
    expect(json.datos.reservas[0]).toMatchObject({ loteId: LOTE_D.id, evento: "reserva", liberadoPorElEquipo: false });

    await page.getByRole("button", { name: "Retirar mi consentimiento" }).click();
    await page.getByRole("button", { name: "Sí, retirar y borrar mis datos" }).click();
    await expect(page).toHaveURL(/\/$/);

    // El lote volvió a estar disponible para todos, y otra persona puede reservarlo.
    expect((await estados())[LOTE_D.id]).toBeUndefined();
    await reservarPorApi(request, emailUnico("otra-d"), LOTE_D.id);
    expect((await estados())[LOTE_D.id]).toBe("reservado");
    // Las filas de A siguen en el libro (la ruta de Mis datos se lee sin consentimiento vigente): la reserva y el deshace.
    const suyo = await request.get("/api/mis-datos/actividad", { headers: { "x-lh-prueba": emailActual } });
    expect((await suyo.json()).reservas.map((r: { evento: string }) => r.evento)).toEqual(["reserva", "deshace"]);
  });

  test("si el servidor no borra la actividad no se retira nada", async ({ page, request, emailActual }) => {
    await sinMosaicos(page);
    await reservarPorApi(request, emailActual, LOTE_D.id);
    await page.route("**/api/mis-datos/actividad", (ruta) => (ruta.request().method() === "DELETE" ? ruta.fulfill({ status: 503, json: { ok: false } }) : ruta.continue()));
    await page.goto("/mis-datos");
    await page.getByRole("button", { name: "Retirar mi consentimiento" }).click();
    await page.getByRole("button", { name: "Sí, retirar y borrar mis datos" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "no pudimos registrar tu retiro" })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("button", { name: "Menú de la persona" })).toBeVisible();
    const lista = await request.get("/api/lotes/reservas", { headers: { "x-lh-prueba": emailActual } });
    expect((await lista.json()).compras).toHaveLength(1);
  });
});

test("axe sin violaciones serias o críticas en la ficha, la lista, Mis datos y con el aviso de estados", async ({ page, request }) => {
  await sinMosaicos(page);
  const graves = async () => {
    // Next manda el <title> en un pedazo aparte del HTML: sin esperarlo, axe a veces ve la página sin título (document-title).
    await expect(page).toHaveTitle(/\S/);
    return (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id);
  };
  // Una reserva ajena: la ficha dice "Reservado" y no ofrece reservar.
  await reservarPorApi(request, emailUnico("ajena"), LOTE_A.id);
  await page.goto(`/lotes/${LOTE_A.id}`);
  await expect(page.getByText(/Reservado$/).first()).toBeVisible();
  expect(await graves(), "ficha de un lote reservado por otra persona").toEqual([]);
  await page.goto("/lotes");
  await expect(page.getByRole("link", { name: new RegExp(`^Lote ${LOTE_A.numero} `) })).toContainText("Reservado");
  expect(await graves(), "lista").toEqual([]);
  // Sin respuesta de los estados.
  await page.route("**/api/lotes/estados", (ruta) => ruta.fulfill({ status: 503, json: { ok: false } }));
  await page.goto("/lotes");
  await expect(page.getByText("No pudimos traer el estado actual de los lotes.").first()).toBeVisible();
  expect(await graves(), "aviso de estados sin respuesta").toEqual([]);
  // La ficha con el error de guardar a la vista.
  await page.unroute("**/api/lotes/estados");
  await page.route("**/api/lotes/reservas", (ruta) => (ruta.request().method() === "POST" ? ruta.fulfill({ status: 500, json: { ok: false } }) : ruta.continue()));
  await page.goto(`/lotes/${LOTE_B.id}`);
  await page.getByLabel(LEI).check();
  await page.getByRole("button", { name: "Reservar (simulado)" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "No pudimos guardar tu reserva" })).toBeVisible();
  expect(await graves(), "ficha con el error de guardar").toEqual([]);
  await page.goto("/mis-datos");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await graves(), "Mis datos").toEqual([]);
});
