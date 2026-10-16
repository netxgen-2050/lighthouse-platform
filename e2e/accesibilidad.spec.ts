import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";
import { listarTribus } from "@/lib/tribus/datos";
import { conIdentidadVerificada } from "./ayudas";

const rutas = [
  "/",
  "/tribus",
  "/compromisos",
  "/panel",
  "/pactos",
  "/semillas",
  "/canales",
  "/fogon",
  "/netx",
  "/pasaporte",
  "/bandeja",
  "/configuracion",
  "/privacidad",
  "/mis-datos",
  "/panel/bitacora",
  ...listarTribus().map((t) => `/tribus/${t.id}`),
  "/territorios/lighthouse",
  "/congreso",
  "/congreso/en",
  "/territorios/no-existe",
  "/ruta-que-no-existe",
];

test("axe sin violaciones serias o críticas: el menú de la persona abierto en /pasaporte", async ({ page }) => {
  await page.goto("/pasaporte");
  await page.getByRole("button", { name: "Menú de la persona" }).click();
  await expect(page.locator("#menu-persona")).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test("hay 32 rutas auditadas", () => {
  expect(rutas).toHaveLength(32);
});

async function graves(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  return r.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }));
}

test("axe sin violaciones serias o críticas: /pasaporte con sellos obtenidos, en trámite y modalidad cargada", async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem("lh-membresia")) return;
    window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro", valle: "pedido" }));
    window.localStorage.setItem("lh-sumarte", JSON.stringify({ plan: "miembro", pase: "brote", nivelPase: "brote" }));
    window.localStorage.setItem("lh-kyc", JSON.stringify({ estado: "en-tramite", enviado: "2026-10-09T12:00:00.000Z" }));
  });
  await page.goto("/pasaporte");
  await page.getByLabel("Obra presencial").check();
  expect(await graves(page)).toEqual([]);
});

test("axe sin violaciones serias o críticas: /perfil con datos, comunidades y el formulario con errores a la vista", async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem("lh-perfil")) return;
    window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro", valle: "pedido" }));
    window.localStorage.setItem(
      "lh-perfil",
      JSON.stringify({ nombre: "Ana Pérez", lugar: "Mendoza", frase: "Vivir en comunidad", roles: ["jardineria"] }),
    );
  });
  await page.goto("/perfil");
  await expect(page.getByRole("heading", { name: "Ana Pérez" })).toBeVisible();
  expect(await graves(page)).toEqual([]);
  await page.getByRole("button", { name: "Editar mi perfil" }).click();
  await page.getByLabel("Otro", { exact: true }).check();
  await page.getByLabel("Nombre", { exact: true }).fill("");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("Error: Escribí tu nombre.")).toBeVisible();
  expect(await graves(page)).toEqual([]);
});

test("axe sin violaciones serias o críticas: el diálogo de verificación en cada paso, con errores a la vista", async ({ page }) => {
  await page.goto("/pasaporte");
  await page.getByRole("button", { name: "Completar mi verificación (KYC)" }).click();
  const dialogo = page.getByRole("dialog", { name: /Verificar mi identidad/ });
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  await expect(dialogo.getByText("Error: Escribí tu nombre completo.")).toBeVisible();
  expect(await graves(page)).toEqual([]);
  await dialogo.getByLabel("Nombre completo").fill("Ana Pérez");
  await dialogo.getByLabel("Número de documento").fill("30123456");
  await dialogo.getByLabel("Fecha de nacimiento").fill("1985-03-02");
  await dialogo.getByRole("button", { name: "Siguiente" }).click();
  expect(await graves(page)).toEqual([]);
  await dialogo.getByRole("radio", { name: "Otra" }).check();
  await dialogo.getByRole("radio", { name: "Exterior" }).check();
  expect(await graves(page)).toEqual([]);
});

test("axe sin violaciones serias o críticas: /pactos siendo miembro, con las dos pestañas", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro" })));
  await page.goto("/pactos");
  await page.getByLabel(/Rol que asumís/).selectOption({ label: "Otro" });
  for (const pestana of ["Pacto de tiempo", "Sumarte con plata"]) {
    await page.getByRole("tab", { name: pestana }).click();
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
  }
});

test("axe sin violaciones serias o críticas: /pactos con un cambio enviado y el historial abierto", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro" }));
    const v = { rol: "facilitacion", rolOtro: "", descripcion: "Facilito", horas: 10 };
    const tiempo = {
      ...v,
      paso: 2,
      version: 1,
      historial: [{ ...v, version: 1, aceptado: "2026-10-16T10:00:00.000Z" }],
      cambio: { ...v, horas: 20, paso: 1 },
    };
    window.localStorage.setItem("lh-pactos", JSON.stringify({ comunidades: { lighthouse: { tiempo, aportes: [] } } }));
  });
  await page.goto("/pactos");
  await page.getByText(/Historial de versiones/).click();
  await expect(page.getByRole("button", { name: "Simular: la comunidad acepta el cambio" })).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test("axe sin violaciones serias o críticas: /semillas con la ronda y sus errores a la vista", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro", valle: "miembro" }));
    const tiempo = { rol: "facilitacion", rolOtro: "", descripcion: "Facilito", horas: 20, paso: 2 };
    window.localStorage.setItem("lh-pactos", JSON.stringify({ comunidades: { lighthouse: { tiempo, aportes: [200] } } }));
  });
  await page.goto("/semillas");
  await page.getByRole("button", { name: "Enviar ronda" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "la ronda no se envió" })).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test("axe sin violaciones serias o críticas: /sumarte con el formulario de contacto abierto", async ({ page }) => {
  await conIdentidadVerificada(page);
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Pedir invitación" }).click();
  await expect(page.getByRole("button", { name: "Enviar pedido (simulado)" })).toBeVisible();
  // También con el error de canal a la vista.
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(page.getByText("Elegí cómo preferís que te contactemos").last()).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test("axe sin violaciones serias o críticas: /netx con un pedido en la bandeja", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Pedir una charla" }).click();
  await page.getByRole("radio", { name: "Email" }).check();
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(page.getByText("Charla pedida (simulado)")).toBeVisible();
  await page.goto("/netx");
  await expect(page.getByRole("row").filter({ hasText: "Charla para invertir en NetX" })).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test("axe sin violaciones serias o críticas: /?camino=congreso con la tarjeta recomendada", async ({ page }) => {
  await page.goto("/?camino=congreso&utm_source=newsletter");
  await expect(page.getByText("Recomendado para vos")).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test("axe sin violaciones serias o críticas: /netx con un pedido con origen", async ({ page }) => {
  await page.goto("/?utm_source=newsletter&utm_campaign=congreso-2027");
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("lh-origen"))).not.toBeNull();
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Pedir una charla" }).click();
  await page.getByRole("radio", { name: "Email" }).check();
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(page.getByText("Charla pedida (simulado)")).toBeVisible();
  await page.goto("/netx");
  await expect(page.getByRole("row").filter({ hasText: "newsletter · sin dato · congreso-2027" })).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test("axe sin violaciones serias o críticas: /panel/bitacora con entradas", async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
  await page.goto("/territorios/lighthouse");
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("lh-bitacora")))
    .not.toBeNull();
  await page.goto("/panel/bitacora");
  await expect(page.getByRole("row").filter({ hasText: "Estado del loteo" })).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test("axe sin violaciones serias o críticas: /congreso con el modo de origen activo y el diálogo de compra abierto", async ({ page }) => {
  await page.goto("/congreso");
  await page.getByRole("button", { name: /¿Qué viene de UnityHub\?/ }).click();
  await expect(page.getByText("Viene de UnityHub · agenda")).toBeVisible();
  expect(await graves(page)).toEqual([]);
  await page.getByRole("button", { name: "Comprar pase completo" }).click();
  await expect(page.getByRole("dialog", { name: "Acá se abriría la compra del ticket" })).toBeVisible();
  expect(await graves(page)).toEqual([]);
});

test("axe sin violaciones serias o críticas: /congreso/en con el modo de origen activo, un ⚖ abierto y el diálogo de compra abierto", async ({ page }) => {
  await page.goto("/congreso/en");
  await page.getByRole("button", { name: /What comes from UnityHub\?/ }).click();
  await expect(page.getByText("From UnityHub · schedule")).toBeVisible();
  expect(await graves(page)).toEqual([]);
  await page.locator("#entradas").getByRole("button", { name: "What it means legally: Congress ticket" }).hover();
  await expect(page.getByRole("tooltip")).toContainText("Draft: text under review");
  expect(await graves(page)).toEqual([]);
  await page.getByRole("button", { name: "Buy full pass" }).click();
  await expect(page.getByRole("dialog", { name: "Here you would buy your ticket" })).toBeVisible();
  expect(await graves(page)).toEqual([]);
});

test.describe("/congreso/en sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("axe sin violaciones serias o críticas, con el llamado a sumarse en inglés", async ({ page }) => {
    await page.goto("/congreso/en");
    await expect(page.getByRole("link", { name: /Join for free to link your ticket/ })).toBeVisible();
    expect(await graves(page)).toEqual([]);
  });
});

test.describe("/congreso sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("axe sin violaciones serias o críticas, con el llamado a sumarse en lugar del formulario", async ({ page }) => {
    await page.goto("/congreso");
    await expect(page.getByRole("link", { name: "Sumate gratis para vincular tu ticket" })).toBeVisible();
    expect(await graves(page)).toEqual([]);
  });
});

test("axe sin violaciones serias o críticas: /fogon/consultas", async ({ page }) => {
  await page.goto("/fogon/consultas");
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(4);
  expect(await graves(page)).toEqual([]);
});

test("axe sin violaciones serias o críticas: /fogon/consultas/u1 abierta, con el reparto a medias y el bloqueo a la vista", async ({ page }) => {
  await page.goto("/fogon/consultas/u1");
  await expect(page.getByRole("region", { name: "Mi reparto" })).toBeVisible();
  const mas = page.getByRole("button", { name: "Sumar un voto a Regeneración ecológica" });
  for (let i = 0; i < 10; i++) await mas.click();
  await expect(page.getByText("Te quedan 0 de 100 créditos")).toBeVisible();
  await expect(page.getByText(/No te alcanzan los créditos/).first()).toBeVisible();
  expect(await graves(page)).toEqual([]);
});

test("axe sin violaciones serias o críticas: /fogon/consultas/u4 cerrada, con resultado, tabla de repartos y acta", async ({ page }) => {
  await page.goto("/fogon/consultas/u4");
  await page.getByRole("button", { name: "Sumar un voto a Vivero de nativas" }).click();
  await page.getByRole("button", { name: "Guardar mi reparto" }).click();
  await page.getByRole("button", { name: "Simular el cierre" }).click();
  await expect(page.getByRole("region", { name: "Acta (ejemplo)" })).toBeVisible();
  await expect(page.getByRole("table", { name: "Cómo repartió cada persona" })).toBeVisible();
  expect(await graves(page)).toEqual([]);
});

for (const ruta of rutas) {
  test(`axe sin violaciones serias o críticas: ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    if (ruta === "/territorios/lighthouse") {
      // El mapa se arma en el navegador: auditar con los 12 sellos ya puestos.
      await expect(page.locator('[aria-label^="Barrio "][role="button"]')).toHaveCount(12);
    }
    const r = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      graves.map((v) => ({ id: v.id, impact: v.impact, nodos: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  });
}
