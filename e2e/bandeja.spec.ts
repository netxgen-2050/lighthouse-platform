import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";
import { sembrarRespuestaDeLaTribu } from "./ayudas";

const LEYO = "Leí el manifiesto con atención y entiendo que sumarme es comprometerme con un grupo de personas";
const CUIDAR = "Me comprometo a cuidar estos acuerdos y a hablar con la comunidad si algún día no puedo cumplirlos";

const campanita = (page: Page) => page.getByRole("link", { name: /^Notificaciones|notificaci(ón|ones) sin leer$/ });

async function adherirYSerAceptada(page: Page) {
  await page.goto("/tribus/valle/manifiesto");
  await page.getByRole("region", { name: "Texto del manifiesto" }).evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.getByLabel(LEYO).check();
  await page.getByLabel(CUIDAR).check();
  await page.getByRole("button", { name: "Adherir", exact: true }).click();
  await page.getByRole("button", { name: "Simular: la comunidad me acepta" }).click();
}

function semilla(page: Page, eventos: object[]) {
  return page.addInitScript((e) => {
    if (!window.localStorage.getItem("lh-actividad")) window.localStorage.setItem("lh-actividad", JSON.stringify(e));
  }, eventos);
}

const evento = (id: string, texto: string, fecha: string, extra = {}) => ({
  id,
  tipo: "x",
  texto,
  fecha,
  enlace: "/tribus",
  notificacion: true,
  leida: false,
  ...extra,
});

type Guardado = { texto: string; notificacion: boolean; enlace: string; visibleDesde?: string };

async function actividad(page: Page): Promise<Guardado[]> {
  return page.evaluate(() => JSON.parse(window.localStorage.getItem("lh-actividad") ?? "[]"));
}

async function comoMiembros(page: Page, ids: string[], pactoAceptado = false) {
  await page.addInitScript(
    ([comunidades, aceptado]) => {
      if (window.localStorage.getItem("lh-membresia")) return;
      window.localStorage.setItem("lh-membresia", JSON.stringify(Object.fromEntries((comunidades as string[]).map((id) => [id, "miembro"]))));
      if (!aceptado) return;
      const porComunidad = Object.fromEntries(
        (comunidades as string[]).map((id) => [
          id,
          { tiempo: { rol: "facilitacion", rolOtro: "", descripcion: "Facilito", horas: 20, paso: 2 }, aportes: [] },
        ]),
      );
      window.localStorage.setItem("lh-pactos", JSON.stringify({ pestana: "tiempo", comunidades: porComunidad }));
    },
    [ids, pactoAceptado] as const,
  );
}

test("pactos: proponer, aceptar y abrir ronda registran sus eventos", async ({ page }) => {
  await comoMiembros(page, ["lighthouse"]);
  await page.goto("/pactos");
  await page.getByLabel(/Rol que asumís/).selectOption({ label: "Facilitación" });
  await page.getByLabel("Tu descripción: qué vas a hacer").fill("Facilito las asambleas");
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await expect.poll(async () => (await actividad(page)).map((e) => e.texto)).toEqual([expect.stringContaining("Propusiste un pacto en")]);
  // La tribu responde (siembra de test) y la persona lo ve al volver a /pactos.
  await sembrarRespuestaDeLaTribu(page, "acepta");
  await expect.poll(async () => (await actividad(page)).length).toBe(3);
  const eventos = await actividad(page);
  expect(eventos[1].texto).toContain("aceptó tu pacto");
  expect(eventos[1].notificacion).toBe(true);
  expect(eventos[2].texto).toContain("Se abrió una ronda de reconocimiento en");
  expect(eventos[2].notificacion).toBe(true);
});

test("compromisos: una oferta registra la publicación y un aviso de interés con demora", async ({ page }) => {
  await page.goto("/compromisos");
  await page.getByRole("radio", { name: "Ofrezco" }).check();
  await page.getByRole("radio", { name: "Tiempo" }).check();
  await page.getByLabel("Descripción").fill("Taller de compost");
  await page.getByLabel("Horas por mes").fill("8");
  await page.getByRole("button", { name: "Registrar" }).click();
  await expect.poll(async () => (await actividad(page)).length).toBe(2);
  const [publicacion, interes] = await actividad(page);
  expect(publicacion.texto).toBe("Publicaste en el mercado: Taller de compost");
  expect(publicacion.notificacion).toBe(false);
  expect(interes.notificacion).toBe(true);
  expect(interes.visibleDesde).toBeTruthy();
  // Todavía no pasaron los 20 segundos: no cuenta como novedad.
  await expect(campanita(page)).toHaveAttribute("aria-label", "Notificaciones, sin novedades");
});

test("compromisos: publicar por la URL sigue guardando y el aviso de interés no se muestra al pasar la demora (Mercado en pausa)", async ({ page }) => {
  await page.clock.install();
  await page.goto("/compromisos");
  await page.getByRole("radio", { name: "Ofrezco" }).check();
  await page.getByRole("radio", { name: "Tiempo" }).check();
  await page.getByLabel("Descripción").fill("Taller de compost");
  await page.getByLabel("Horas por mes").fill("8");
  await page.getByRole("button", { name: "Registrar" }).click();
  await expect.poll(async () => (await actividad(page)).length).toBe(2);
  await page.clock.fastForward(30_000);
  await expect(campanita(page)).toHaveAttribute("aria-label", "Notificaciones, sin novedades");
  await page.goto("/bandeja");
  await expect(page.getByText("Todavía no tenés notificaciones")).toBeVisible();
});

test("postulación: enviar registra la actividad y el aviso de recibida", async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
  await page.goto("/tribus/grano/postular");
  await page.getByLabel(/^Nombre de la comunidad/).fill("Los Álamos");
  await page.getByLabel(/^Persona que lidera/).fill("Ana Ejemplo");
  await page.getByLabel(/^Contacto de esa persona/).fill("contacto de ejemplo");
  await page.getByLabel(/^Cantidad de personas/).fill("12");
  await page.getByLabel(/^Cantidad de hogares/).fill("4");
  await page.getByLabel(/^Qué van a producir/).fill("Granos y harinas");
  await page.getByLabel(/^Qué aportarían al pozo común/).fill("Harina para el núcleo común");
  await page.getByLabel(/^Forma jurídica/).selectOption("cooperativa");
  await page.getByLabel(/^Cómo toman decisiones/).fill("Por consenso");
  await page.getByLabel(/^Cuál sería su ritual/).fill("Una minga");
  await page.getByLabel(/^Compromiso inicial de tiempo/).fill("10 horas por semana");
  await page.getByRole("button", { name: "Enviar postulación (simulado)" }).click();
  await expect.poll(async () => (await actividad(page)).length).toBe(2);
  const [envio, recibida] = await actividad(page);
  expect(envio.texto).toBe("Enviaste una postulación de Los Álamos");
  expect(envio.notificacion).toBe(false);
  expect(recibida.texto).toBe("Recibimos tu postulación");
  expect(recibida.notificacion).toBe(true);
});

test("congreso: registrar el ticket deja el evento", async ({ page }) => {
  await page.goto("/congreso");
  await page.getByLabel(/Código de tu ticket/).fill("LH27-8F3K-2Q");
  await page.getByRole("button", { name: "Registrar" }).click();
  await expect.poll(async () => (await actividad(page)).map((e) => e.texto)).toEqual(["Registraste tu ticket del Congreso"]);
});

test("semillas: enviar la ronda deja el evento", async ({ page }) => {
  await comoMiembros(page, ["valle"], true);
  await page.goto("/semillas");
  for (const grupo of ["Rol, Martina", "Aporte al grupo, Martina", "Rol, Joaquín", "Aporte al grupo, Joaquín"]) {
    const g = page.getByRole("group", { name: grupo });
    await g.getByRole("button", { name: "4 de 5" }).click();
    await g.getByLabel("¿Por qué le das esta puntuación?").fill("Porque sí");
  }
  await page.getByRole("button", { name: "Enviar ronda" }).click();
  await expect(page.getByText("Ronda enviada (simulado)")).toBeVisible();
  await expect.poll(async () => (await actividad(page)).map((e) => e.texto)).toEqual(["Enviaste tu ronda de reconocimiento en Valle Solar"]);
});

test("un enlace externo guardado a mano se descarta", async ({ page }) => {
  await semilla(page, [
    evento("1", "Mala", "2026-10-01T10:00:00Z", { enlace: "//ejemplo.com" }),
    evento("2", "Peor", "2026-10-01T10:00:00Z", { enlace: "https://ejemplo.com" }),
    evento("3", "Buena", "2026-10-01T10:00:00Z"),
  ]);
  await page.goto("/bandeja");
  await expect(page.getByRole("link", { name: "Buena" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mala" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Peor" })).toHaveCount(0);
});

test("sin novedades: la campanita no muestra número y la bandeja lo explica", async ({ page }) => {
  await page.goto("/bandeja");
  await expect(campanita(page)).toHaveAttribute("aria-label", "Notificaciones, sin novedades");
  await expect(page.getByText("Todavía no tenés notificaciones")).toBeVisible();
  await expect(page.getByText("Pronto vas a poder recibir mensajes de tu comunidad y del equipo")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
});

test("adherir y ser aceptada deja una notificación en la bandeja", async ({ page }) => {
  await adherirYSerAceptada(page);
  await expect(campanita(page)).toHaveAttribute("aria-label", "1 notificación sin leer");
  await campanita(page).click();
  await expect(page).toHaveURL(/\/bandeja$/);
  await expect(page.getByRole("link", { name: "Valle Solar aceptó tu adhesión" })).toBeVisible();
});

test("2 sin leer: la campanita lo dice en texto; marcar todas leídas quita el número", async ({ page }) => {
  await semilla(page, [
    evento("1", "Vieja", "2026-10-01T10:00:00Z"),
    evento("2", "Nueva", "2026-10-02T10:00:00Z"),
  ]);
  await page.goto("/bandeja");
  await expect(campanita(page)).toHaveAttribute("aria-label", "2 notificaciones sin leer");
  await expect(campanita(page)).toContainText("2");
  const items = page.getByRole("listitem").filter({ has: page.getByRole("link", { name: /Vieja|Nueva/ }) });
  await expect(items.first()).toContainText("Nueva");
  await page.getByRole("button", { name: "Marcar todas como leídas" }).click();
  await expect(campanita(page)).toHaveAttribute("aria-label", "Notificaciones, sin novedades");
  await expect(campanita(page)).not.toContainText("2");
});

test("un aviso simulado futuro no cuenta hasta que llega", async ({ page }) => {
  await semilla(page, [
    evento("1", "Todavía no", "2026-10-01T10:00:00Z", { visibleDesde: "2999-01-01T00:00:00Z" }),
    evento("2", "Actividad propia", "2026-10-01T10:00:00Z", { notificacion: false }),
  ]);
  await page.goto("/bandeja");
  await expect(campanita(page)).toHaveAttribute("aria-label", "Notificaciones, sin novedades");
  await expect(page.getByText("Todavía no", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Actividad propia")).toHaveCount(0);
});

test("el aviso de interés en una oferta (Mercado en pausa) no se cuenta ni se lista", async ({ page }) => {
  await semilla(page, [
    evento("1", "Alguien se interesó en tu oferta", "2026-10-01T10:00:00Z", { tipo: "interes-oferta", enlace: "/compromisos" }),
    evento("2", "Otro aviso", "2026-10-02T10:00:00Z"),
  ]);
  await page.goto("/bandeja");
  await expect(campanita(page)).toHaveAttribute("aria-label", "1 notificación sin leer");
  await expect(page.getByRole("link", { name: "Otro aviso" })).toBeVisible();
  await expect(page.getByText("Alguien se interesó en tu oferta")).toHaveCount(0);
  await expect(page.locator('a[href="/compromisos"]')).toHaveCount(0);
});

test("un único aviso de interés (Mercado en pausa): sin novedades y bandeja vacía", async ({ page }) => {
  await semilla(page, [
    evento("1", "Alguien se interesó en tu oferta", "2026-10-01T10:00:00Z", { tipo: "interes-oferta", enlace: "/compromisos" }),
  ]);
  await page.goto("/bandeja");
  await expect(page.getByText("Todavía no tenés notificaciones")).toBeVisible();
  await expect(campanita(page)).toHaveAttribute("aria-label", "Notificaciones, sin novedades");
  await expect(page.getByText("Alguien se interesó en tu oferta")).toHaveCount(0);
});

test("la publicación en el Mercado (en pausa) no sale en Mi recorrido", async ({ page }) => {
  await semilla(page, [
    evento("1", "Publicaste en el mercado: Taller de compost", "2026-10-01T10:00:00Z", { tipo: "mercado", enlace: "/compromisos", notificacion: false }),
    evento("2", "Actividad visible de control", "2026-10-02T10:00:00Z", { notificacion: false }),
  ]);
  await page.goto("/panel");
  // Esperar a que Mi recorrido deje de cargar y muestre otro evento: recién ahí la ausencia del del Mercado prueba el filtro.
  await expect(page.getByText("Actividad visible de control")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByText("Publicaste en el mercado")).toHaveCount(0);
  await expect(page.locator('main a[href="/compromisos"]')).toHaveCount(0);
});

test("axe sin violaciones serias o críticas: /bandeja con notificaciones", async ({ page }) => {
  await semilla(page, [evento("1", "Aviso de prueba", "2026-10-01T10:00:00Z")]);
  await page.goto("/bandeja");
  await expect(page.getByRole("link", { name: "Aviso de prueba" })).toBeVisible();
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});
