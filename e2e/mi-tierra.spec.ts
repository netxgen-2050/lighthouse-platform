import { conAdhesionAlManifiesto } from "./ayudas";
import { expect, test, type Page } from "./fixtura";
import { faroEn } from "../lib/bien-comun/formato";
import { PLAN_CUOTAS, faroDeLote, faroDelPlan, planDeLote } from "../lib/bien-comun/modelo";
import { precioLote, VERSION_MODELO_LOTES } from "../lib/lotes/modelo";
import { lotesDelGrupo } from "../lib/territorios/loteo";
import { estadoDeLote } from "../lib/territorios/loteo-estados";
import { usd } from "../lib/series/formato";

// Mi tierra (rediseno-mi-tierra): los valores que se esperan salen de los módulos, nunca escritos a mano.
test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

const disponibles = lotesDelGrupo("norte").filter((l) => estadoDeLote(l.id) === "disponible");
const lote = disponibles[0];
const primero = lotesDelGrupo("primeros").find((l) => estadoDeLote(l.id) === "disponible")!;
const LEI = "Leí lo que comparto y lo que me comprometo a pagar";
const CUOTAS = PLAN_CUOTAS.dePartida;
const plan = planDeLote(precioLote(lote.superficieM2), CUOTAS)!;
const faroPlan = faroDelPlan(lote.superficieM2, CUOTAS)!;

const main = (page: Page) => page.locator("main");

async function reservarYPagar(page: Page, pagar: boolean) {
  await page.goto(`/lotes/${lote.id}`);
  await page.getByLabel(LEI).check();
  await page.getByRole("button", { name: "Reservar (simulado)" }).click();
  if (pagar) {
    await page.getByRole("button", { name: "Simular el primer pago (anticipo)" }).click();
    await page.getByRole("button", { name: "Confirmar el primer pago simulado" }).click();
    await expect(page.getByRole("region", { name: /Boleto de ejemplo/ })).toBeVisible();
  } else {
    await expect(page.getByRole("button", { name: "Simular el primer pago (anticipo)" })).toBeVisible();
  }
}

/** SIEMBRA DE TEST: una compra guardada tal cual la guardaría la ficha (solo la primera vez). */
async function sembrar(page: Page, compra: Record<string, unknown>) {
  await page.addInitScript((c) => {
    if (!window.localStorage.getItem("lh-lotes")) window.localStorage.setItem("lh-lotes", JSON.stringify([c]));
  }, compra);
}

const vioDe = (l: { superficieM2?: number }, conPlan: boolean) => ({
  precio: precioLote(l.superficieM2),
  aporte: null,
  expensa: null,
  version: VERSION_MODELO_LOTES.version,
  faro: faroDeLote(l.superficieM2),
  ...(conPlan
    ? {
        plan: {
          cuotas: CUOTAS,
          anticipo: plan.anticipo,
          cuota: plan.cuota,
          ultimaCuota: plan.ultimaCuota,
          faroAnticipo: faroPlan.anticipo,
          faroPorCuota: faroPlan.porCuota,
          faroUltimaCuota: faroPlan.ultimaCuota,
        },
      }
    : {}),
});

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("es pública: muestra el aviso para entrar y ningún lote, cuota ni FARO", async ({ page }) => {
    const r = await page.goto("/mi-tierra");
    expect(r?.status()).toBe(200);
    await expect(page).toHaveURL(/\/mi-tierra$/);
    await expect(page.getByRole("heading", { level: 1, name: "Mi tierra" })).toBeVisible();
    await expect(main(page)).toHaveCount(1);
    await expect(page.getByText("Mi tierra se ve con una cuenta")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sumate para ver tu tierra" })).toBeVisible();
    const texto = await main(page).innerText();
    // Ningún dato: ni lotes, ni cuotas pagadas, ni FARO acreditados (la bajada nombra los temas, sin números).
    expect(texto).not.toMatch(/\d|Reservado|En cuotas|acreditad/);
    const claves = await page.evaluate(() => Object.keys(window.localStorage).filter((k) => k.includes("lh-lotes")));
    expect(claves).toEqual([]);
  });
});

test("con sesión y sin compras: 'Todavía no reservaste un lote' y el enlace a los lotes, sin indicadores", async ({ page }) => {
  await page.goto("/mi-tierra");
  await expect(page.getByRole("heading", { name: "Todavía no reservaste un lote" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver los lotes" })).toHaveAttribute("href", "/lotes");
  await expect(main(page)).not.toContainText("Lotes tuyos");
  await expect(main(page)).not.toContainText("venta simulada");
});

test("el menú trae Mi tierra y lleva a la página", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Mi tierra", exact: true }).first().click();
  await expect(page).toHaveURL(/\/mi-tierra$/);
});

test("reservar desde la ficha: aparece 'Reservado' con 'falta el primer pago' y sin FARO acreditado", async ({ page }) => {
  await reservarYPagar(page, false);
  await page.goto("/mi-tierra");
  await expect(page.getByRole("heading", { level: 3, name: `Lote ${lote.numero}` })).toBeVisible();
  await expect(main(page).locator('[data-estado="reservado"]')).toBeVisible();
  await expect(main(page).locator('[data-estado="reservado"]')).toContainText("Reservado");
  await expect(main(page)).toContainText(usd(precioLote(lote.superficieM2)!));
  await expect(main(page)).toContainText("Falta el primer pago.");
  await expect(main(page)).toContainText("Todavía no se acreditó FARO: falta el primer pago");
  await expect(page.getByRole("link", { name: `Ver la ficha del lote ${lote.numero}` })).toHaveAttribute("href", `/lotes/${lote.id}`);
  await expect(page.getByText("venta simulada · aprobación municipal pendiente")).toBeVisible();
});

test("pagar el anticipo en 24 cuotas: 0 de 24, anticipo, cuota, FARO acreditados y dos filas en el libro", async ({ page }) => {
  expect(CUOTAS).toBe(24);
  await reservarYPagar(page, true);
  await page.goto("/mi-tierra");
  const tarjeta = page.getByRole("listitem").filter({ hasText: `Lote ${lote.numero}` }).first();
  await expect(tarjeta.locator('[data-estado="enCuotas"]')).toContainText("En cuotas");
  await expect(tarjeta).toContainText(`0 de ${CUOTAS} cuotas`);
  await expect(tarjeta).toContainText(usd(plan.anticipo));
  await expect(tarjeta).toContainText(usd(plan.cuota!));
  await expect(tarjeta).toContainText(faroEn(faroPlan.anticipo, "es"));
  await expect(tarjeta).toContainText(faroEn(faroPlan.total, "es"));
  const barra = tarjeta.getByRole("meter", { name: "Avance del plan" });
  await expect(barra).toHaveAttribute("aria-valuenow", String(Math.round((plan.anticipo / precioLote(lote.superficieM2)!) * 100)));
  const libro = page.getByRole("table");
  await expect(libro.locator("tbody tr")).toHaveCount(2);
  await expect(libro.locator("tbody tr").first()).toContainText(`Primer pago (anticipo) del lote ${lote.numero}`);
  await expect(libro.locator("tbody tr").first()).toContainText(usd(plan.anticipo));
  await expect(libro.locator("tbody tr").nth(1)).toContainText(`Reserva del lote ${lote.numero}`);
  await expect(page.getByText("venta simulada · aprobación municipal pendiente")).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo").first()).toBeVisible();
  // La ficha dice lo mismo que Mi tierra.
  await page.goto(`/lotes/${lote.id}`);
  await expect(page.getByText("En cuotas (simulado)").first()).toBeVisible();
});

test("los primeros 4 lotes no entran al plan y no muestran FARO", async ({ page }) => {
  await sembrar(page, {
    loteId: primero.id,
    opcion: "solo-lote",
    paso: "reservado",
    reservadoEl: "2026-11-20T12:00:00.000Z",
    vio: vioDe(primero, false),
  });
  await page.goto("/mi-tierra");
  const tarjeta = page.getByRole("listitem").filter({ hasText: `Lote ${primero.numero}` }).first();
  await expect(tarjeta).toContainText("Este lote no entra al plan en cuotas.");
  await expect(tarjeta).toContainText("Este lote no trae FARO.");
  await expect(tarjeta).not.toContainText("Todavía no se acreditó FARO");
  // Ningún lote entra al plan: no se muestran los indicadores de plan ni de FARO (no aplican).
  await expect(main(page).getByText("Pagado del precio del lote")).toHaveCount(0);
  await expect(main(page).getByText("FARO acreditados (simulado)")).toHaveCount(0);
});

test("una reserva vieja sin plan dice 'sin dato' y la página no falla", async ({ page }) => {
  await sembrar(page, {
    loteId: lote.id,
    opcion: "solo-lote",
    paso: "reservado",
    reservadoEl: "2026-10-01T12:00:00.000Z",
    vio: { precio: null, aporte: null, expensa: null, version: "v0.0-vieja" },
  });
  await page.goto("/mi-tierra");
  const tarjeta = page.getByRole("listitem").filter({ hasText: `Lote ${lote.numero}` }).first();
  await expect(tarjeta).toContainText("No quedó guardado qué plan viste al reservar: sin dato.");
  await expect(tarjeta).toContainText("Modelo v0.0-vieja");
  await expect(tarjeta).toContainText("sin dato");
  await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(1);
});

test("tu voz: sin adhesión y con adhesión, y FARO no da voto", async ({ page }) => {
  await page.goto("/mi-tierra");
  const voz = page.getByRole("region", { name: "Tu voz" });
  await expect(voz).toContainText("Todavía no sos parte del común");
  await expect(voz.getByRole("link", { name: "Leer y adherir al manifiesto" })).toHaveAttribute("href", "/tribus/lighthouse/manifiesto");
  await expect(voz).toContainText("en discusión");
  await expect(voz).toContainText("Hoy FARO no da voto en la plataforma.");
});

test.describe("con adhesión al manifiesto", () => {
  test("es parte del común por su adhesión y la voz sigue en discusión", async ({ page }) => {
    await conAdhesionAlManifiesto(page);
    await page.goto("/mi-tierra");
    const voz = page.getByRole("region", { name: "Tu voz" });
    await expect(voz).toContainText("por esa adhesión sos parte del común");
    await expect(voz).toContainText("en discusión");
    await expect(voz).toContainText("una persona, un voto");
    await expect(voz).toContainText("Hoy FARO no da voto en la plataforma.");
  });
});

test("en inglés: títulos y textos traducidos", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "lh-idioma", value: "en", url: baseURL! }]);
  await sembrar(page, {
    loteId: lote.id,
    opcion: "solo-lote",
    paso: "pagado",
    reservadoEl: "2026-11-20T12:00:00.000Z",
    pagadoEl: "2026-11-21T12:00:00.000Z",
    vio: vioDe(lote, true),
  });
  await page.goto("/mi-tierra");
  await expect(page.getByRole("heading", { level: 1, name: "My land" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your lot" })).toBeVisible();
  await expect(main(page)).toContainText(`0 of ${CUOTAS} instalments`);
  await expect(main(page)).toContainText("Instalment plan · Token Tierra (simulated)");
  await expect(page.getByRole("heading", { name: "Your voice" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
  await expect(main(page)).toContainText("Today FARO gives no vote on the platform.");
});

test("a 390 px no hay scroll horizontal, con una compra en cuotas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await sembrar(page, {
    loteId: lote.id,
    opcion: "solo-lote",
    paso: "pagado",
    reservadoEl: "2026-11-20T12:00:00.000Z",
    pagadoEl: "2026-11-21T12:00:00.000Z",
    vio: vioDe(lote, true),
  });
  await page.goto("/mi-tierra");
  await expect(page.getByRole("heading", { level: 3, name: `Lote ${lote.numero}` })).toBeVisible();
  const desborda = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(desborda).toBe(false);
});

test("nunca habla de rendimiento, APY ni precio de FARO, y no se puede llegar a todo con el teclado sin trampa", async ({ page }) => {
  await sembrar(page, {
    loteId: lote.id,
    opcion: "solo-lote",
    paso: "pagado",
    reservadoEl: "2026-11-20T12:00:00.000Z",
    pagadoEl: "2026-11-21T12:00:00.000Z",
    vio: vioDe(lote, true),
  });
  await page.goto("/mi-tierra");
  await expect(page.getByRole("heading", { level: 3, name: `Lote ${lote.numero}` })).toBeVisible();
  const texto = await main(page).innerText();
  expect(texto).not.toMatch(/rendimiento|APY|precio de FARO|ganancia|retorno/i);
  // Teclado: el enlace a la ficha se alcanza solo con Tab (sin trampa de foco).
  const enlace = page.getByRole("link", { name: `Ver la ficha del lote ${lote.numero}` });
  await page.getByRole("heading", { level: 3, name: `Lote ${lote.numero}` }).click();
  let llegó = false;
  for (let i = 0; i < 40 && !llegó; i++) {
    await page.keyboard.press("Tab");
    llegó = await enlace.evaluate((el) => el === document.activeElement);
  }
  expect(llegó).toBe(true);
  await expect(enlace).toBeFocused();
});
