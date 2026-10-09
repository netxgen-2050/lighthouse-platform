import { expect, test, type Page } from "@playwright/test";

const PERFIL_COMPLETO = JSON.stringify({
  items: Array.from({ length: 6 }, (_, i) => ({ respuesta: `r${i}`, propuesta: `p${i}`, confirmado: `p${i}` })),
});
const MEMBRESIA = JSON.stringify({ lighthouse: "pedido" });
const PACTOS = JSON.stringify({
  pestana: "tiempo",
  comunidades: {
    lighthouse: { tiempo: { rol: "facilitacion", rolOtro: "", descripcion: "Facilito", horas: 20, paso: 1 }, aportes: [] },
  },
});

/** Deja cargado lo indicado la primera vez que se abre una página (no pisa lo que haga la prueba después). */
function sembrar(page: Page, datos: Record<string, string>) {
  return page.addInitScript((d) => {
    if (window.localStorage.getItem("lh-sembrado")) return;
    window.localStorage.setItem("lh-sembrado", "1");
    for (const [clave, valor] of Object.entries(d)) window.localStorage.setItem(clave, valor);
  }, datos);
}

const proximo = (page: Page) => page.getByRole("region", { name: "Tu próximo paso" });

test("panel vacío: próximo paso perfil, camino vacío y aviso", async ({ page }) => {
  await page.goto("/panel");
  await expect(page.getByRole("heading", { level: 1, name: "Mi recorrido" })).toBeVisible();
  await expect(proximo(page)).toContainText("Completá tu perfil");
  await expect(proximo(page).getByRole("link", { name: "Completar mi perfil" })).toHaveAttribute("href", "/perfil");
  await expect(page.getByText("Todavía no hay nada en tu camino.")).toBeVisible();
  await expect(page.getByText("Modo demostración: este panel lee lo que guardaste en este navegador.")).toBeVisible();
});

test("el próximo paso avanza en orden: comunidad, pacto, ticket y listo", async ({ page }) => {
  await sembrar(page, { "lh-perfil-entrevista": PERFIL_COMPLETO });
  await page.goto("/panel");
  await expect(proximo(page).getByRole("link")).toHaveAttribute("href", "/tribus");

  await page.evaluate((m) => window.localStorage.setItem("lh-membresia", m), MEMBRESIA);
  await page.reload();
  await expect(proximo(page).getByRole("link")).toHaveAttribute("href", "/pactos");

  await page.evaluate((p) => window.localStorage.setItem("lh-pactos", p), PACTOS);
  await page.reload();
  await expect(proximo(page).getByRole("link")).toHaveAttribute("href", "/congreso");

  await page.evaluate(() => window.localStorage.setItem("lh-congreso-ticket", "LH27-8F3K-2Q"));
  await page.reload();
  await expect(proximo(page)).toContainText("Ya recorriste todo lo que hay por ahora.");
  await expect(proximo(page).getByRole("link")).toHaveCount(0);
});

test("perfil a medias: el próximo paso sigue siendo el perfil", async ({ page }) => {
  await sembrar(page, {
    "lh-perfil-entrevista": JSON.stringify({ items: [{ respuesta: "a", propuesta: "b", confirmado: null }] }),
    "lh-membresia": MEMBRESIA,
  });
  await page.goto("/panel");
  await expect(proximo(page).getByRole("link")).toHaveAttribute("href", "/perfil");
});

test("ticket guardado con formato inválido se trata como sin ticket", async ({ page }) => {
  await sembrar(page, {
    "lh-perfil-entrevista": PERFIL_COMPLETO,
    "lh-membresia": MEMBRESIA,
    "lh-pactos": PACTOS,
    "lh-congreso-ticket": "1234",
  });
  await page.goto("/panel");
  await expect(proximo(page).getByRole("link")).toHaveAttribute("href", "/congreso");
});

test("la línea de tiempo muestra lo más nuevo primero y agrupa por día", async ({ page }) => {
  const evento = (id: string, texto: string, fecha: string) => ({
    id,
    tipo: "x",
    texto,
    fecha,
    enlace: "/tribus",
    notificacion: false,
    leida: false,
  });
  await sembrar(page, {
    "lh-actividad": JSON.stringify([
      evento("1", "Adheriste al manifiesto de Valle", "2026-10-07T12:00:00"),
      evento("2", "Propusiste un pacto en Valle", "2026-10-08T12:00:00"),
      evento("3", "Registraste tu ticket del Congreso", "2026-10-08T15:00:00"),
    ]),
  });
  await page.goto("/panel");
  const dias = page.getByRole("heading", { level: 3 });
  await expect(dias).toHaveCount(2);
  const items = page.getByRole("tabpanel").getByRole("listitem");
  await expect(items).toHaveCount(3);
  await expect(items.nth(0)).toContainText("Registraste tu ticket del Congreso");
  await expect(items.nth(1)).toContainText("Propusiste un pacto en Valle");
  await expect(items.nth(2)).toContainText("Adheriste al manifiesto de Valle");
  await expect(items.nth(2).getByRole("link")).toHaveAttribute("href", "/tribus");
});

test("adherir y proponer un pacto aparecen en el camino, el pacto primero", async ({ page }) => {
  await page.goto("/tribus/valle/manifiesto");
  await page.getByRole("region", { name: "Texto del manifiesto" }).evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page
    .getByLabel("Leí el manifiesto con atención y entiendo que sumarme es comprometerme con un grupo de personas")
    .check();
  await page
    .getByLabel("Me comprometo a cuidar estos acuerdos y a hablar con la comunidad si algún día no puedo cumplirlos")
    .check();
  await page.getByRole("button", { name: "Adherir", exact: true }).click();
  await page.getByRole("button", { name: "Simular: la comunidad me acepta" }).click();
  await page.goto("/pactos?comunidad=valle");
  await page.getByLabel(/Rol que asumís/).selectOption({ label: "Facilitación" });
  await page.getByLabel("Tu descripción: qué vas a hacer").fill("Facilito las asambleas");
  await page.getByRole("button", { name: "Enviar a la comunidad" }).click();
  await page.goto("/panel");
  const items = page.getByRole("tabpanel").getByRole("listitem");
  await expect(items.first()).toContainText("Propusiste un pacto en");
  await expect(page.getByRole("tabpanel")).toContainText("Adheriste al manifiesto de");
});

test("la Bitácora es una pestaña y /panel/bitacora la abre", async ({ page }) => {
  await page.goto("/panel");
  await expect(page.getByRole("tab", { name: "Tu camino" })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Bitácora" }).click();
  await expect(page.getByRole("tab", { name: "Bitácora" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Todavía no hay nada anotado en este navegador.")).toBeVisible();

  await page.goto("/panel/bitacora");
  await expect(page.getByRole("heading", { level: 1, name: "Mi recorrido" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Bitácora" })).toHaveAttribute("aria-selected", "true");
});

test("las pestañas se mueven con las flechas", async ({ page }) => {
  await page.goto("/panel");
  await page.getByRole("tab", { name: "Tu camino" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Bitácora" })).toBeFocused();
  await expect(page.getByRole("tab", { name: "Bitácora" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Tu camino" })).toHaveAttribute("aria-selected", "true");
});

test("borrar todo: confirma, vacía el camino, la actividad y las notificaciones", async ({ page }) => {
  await sembrar(page, {
    "lh-perfil-entrevista": PERFIL_COMPLETO,
    "lh-actividad": JSON.stringify([
      { id: "1", tipo: "x", texto: "Algo que hice", fecha: "2026-10-08T12:00:00", enlace: "/tribus", notificacion: true, leida: false },
    ]),
  });
  await page.goto("/panel");
  await expect(page.getByText("Algo que hice")).toBeVisible();
  await expect(proximo(page).getByRole("link")).toHaveAttribute("href", "/tribus");
  page.once("dialog", (d) => {
    expect(d.message()).toBe("¿Borrar todo lo que guardaste en este navegador?");
    void d.accept();
  });
  await page.getByRole("button", { name: "Borrar todo lo de este navegador" }).click();
  await expect(page.getByRole("status").filter({ hasText: "se borró todo" })).toBeVisible();
  await expect(proximo(page).getByRole("link")).toHaveAttribute("href", "/perfil");
  await expect(page.getByText("Algo que hice")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("lh-actividad"))).toBeNull();
});

test("borrar dos veces seguidas vuelve a montar el mensaje de la región de estado", async ({ page }) => {
  await page.goto("/panel");
  page.on("dialog", (d) => void d.accept());
  const boton = page.getByRole("button", { name: "Borrar todo lo de este navegador" });
  const mensaje = page.getByRole("status").locator("[data-borrado]");
  await boton.click();
  await expect(mensaje).toHaveAttribute("data-borrado", "1");
  await boton.click();
  await expect(mensaje).toHaveAttribute("data-borrado", "2");
  await expect(mensaje).toContainText("se borró todo");
});

test("cancelar el borrado no borra nada", async ({ page }) => {
  await sembrar(page, { "lh-perfil-entrevista": PERFIL_COMPLETO });
  await page.goto("/panel");
  page.once("dialog", (d) => void d.dismiss());
  await page.getByRole("button", { name: "Borrar todo lo de este navegador" }).click();
  await page.reload();
  await expect(proximo(page).getByRole("link")).toHaveAttribute("href", "/tribus");
});

test("sin pedidos de red con los datos guardados", async ({ page }) => {
  await page.goto("/perfil");
  await page.getByLabel("Tu respuesta").fill("secreto-panel");
  await page.getByRole("button", { name: "Responder" }).click();
  // Sin esto la prueba pasaría aunque el guardado fallara: el dato tiene que estar en el navegador.
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem("lh-perfil-entrevista") ?? ""))
    .toContain("secreto-panel");
  await page.goto("/panel");
  await expect(proximo(page)).toContainText("Completá tu perfil");
  const origen = new URL(page.url()).origin;
  const pedidos: string[] = [];
  page.on("request", (r) => {
    const propio = r.url().startsWith(origen + "/");
    const lleva = r.url().includes("secreto-") || (r.postData() ?? "").includes("secreto-");
    if ((propio && r.method() !== "GET") || lleva) pedidos.push(`${r.method()} ${r.url()}`);
  });
  await page.reload();
  await expect(proximo(page)).toContainText("Completá tu perfil");
  expect(pedidos).toEqual([]);
});

test("almacenamiento bloqueado: error en texto y no los estados vacíos", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("bloqueado", "SecurityError");
    };
  });
  await page.goto("/panel");
  await expect(page.getByRole("alert").filter({ hasText: "no permite leer los datos" })).toBeVisible();
  await expect(page.getByText("Todavía no hay nada en tu camino.")).toHaveCount(0);
});

test("con teclado: próximo paso, pestañas, borrado y aria-current en la navegación", async ({ page }) => {
  await page.goto("/panel");
  await expect(proximo(page)).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Mi recorrido" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const orden = [
    proximo(page).getByRole("link"),
    page.getByRole("tab", { name: "Tu camino" }),
    page.getByRole("tabpanel", { name: "Tu camino" }),
    page.getByRole("button", { name: "Borrar todo lo de este navegador" }),
  ];
  await orden[0].focus();
  await expect(orden[0]).toBeFocused();
  for (const siguiente of orden.slice(1)) {
    await page.keyboard.press("Tab");
    await expect(siguiente).toBeFocused();
  }
});
