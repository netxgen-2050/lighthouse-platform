import { expect, test, type Page } from "./fixtura";
import { textosEnEspanol } from "./ayudas-idioma";

/** Deja cargado lo indicado la primera vez que se abre una página (no pisa lo que haga la prueba después). */
function sembrar(page: Page, datos: Record<string, string>) {
  return page.addInitScript((d) => {
    if (window.localStorage.getItem("lh-sembrado")) return;
    window.localStorage.setItem("lh-sembrado", "1");
    for (const [clave, valor] of Object.entries(d)) window.localStorage.setItem(clave, valor);
  }, datos);
}

const PERFIL = JSON.stringify({
  nombre: "Ana Pérez",
  lugar: "Mendoza",
  frase: "Vivir en comunidad",
  ofrezco: "Huerta y compostaje",
  roles: ["jardineria", "otro"],
  rolOtro: "Apicultura",
  decision: "Por consenso",
  noNegociables: "El agua es de todos",
});

const AHORA = Date.now();
const hace = (min: number) => new Date(AHORA - min * 60_000).toISOString();

/** Un evento guardado por esta versión (con mensaje y datos) y uno guardado antes (solo con texto). */
const EVENTO_NUEVO = {
  id: "n1",
  tipo: "adhesion-aceptada",
  texto: "Valle Solar aceptó tu adhesión",
  mensaje: "adhesionAceptada",
  datos: { comunidad: "Valle Solar" },
  fecha: hace(10),
  enlace: "/tribus/valle/manifiesto",
  notificacion: true,
  leida: false,
};
const EVENTO_VIEJO = {
  id: "v1",
  tipo: "pacto-aceptado",
  texto: "Valle Solar aceptó tu pacto",
  fecha: hace(20),
  enlace: "/pactos?comunidad=valle",
  notificacion: true,
  leida: false,
};

test.describe("Perfil en inglés", () => {
  test.use({ locale: "en-US" });

  test("las secciones, los roles y el 'sin dato' están en inglés y lo que escribió la persona va tal cual", async ({ page }) => {
    await sembrar(page, { "lh-perfil": PERFIL, "lh-membresia": JSON.stringify({ lighthouse: "miembro", valle: "pedido" }) });
    await page.goto("/perfil");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByText("This page is only available in Spanish for now.")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1, name: "Your profile" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ana Pérez" })).toBeVisible();
    await expect(page.getByText("Your profile stays only in this browser. Nobody else sees it.")).toBeVisible();
    // Sus respuestas, tal cual, marcadas como español (no se traducen).
    await expect(page.locator('[lang="es"]', { hasText: "Huerta y compostaje" })).toBeVisible();
    await expect(page.locator('[lang="es"]', { hasText: "El agua es de todos" })).toBeVisible();
    await expect(page.locator('[lang="es"]', { hasText: "Vivir en comunidad" })).toBeVisible();
    // Roles de la lista en inglés; el rol "Otro" con lo que escribió.
    const roles = page.getByRole("list", { name: "Your roles" });
    await expect(roles).toContainText("Gardening");
    await expect(roles).toContainText("Other: Apicultura");
    await expect(page.getByRole("link", { name: "Valle Solar" })).toHaveAttribute("translate", "no");
    await expect(page.getByText("Request sent")).toBeVisible();
    await expect(page.getByText("Active pacts:")).toBeVisible();
    await expect(page.getByText("Total Semillas:")).toBeVisible();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("sin perfil dice 'no data' y ofrece completarlo; el formulario y su error están en inglés", async ({ page }) => {
    await page.goto("/perfil");
    await expect(page.getByText("no data").first()).toBeVisible();
    await page.getByRole("button", { name: "Complete my profile" }).click();
    await expect(page.getByRole("heading", { name: "Edit my profile" })).toBeVisible();
    await expect(page.getByText("The same roles you see in Pacts.")).toBeVisible();
    await page.getByLabel("Name", { exact: true }).fill("");
    await page.getByRole("button", { name: "Save" }).click();
    const campo = page.getByLabel("Name", { exact: true });
    await expect(page.getByText("Error: Enter your name.")).toBeVisible();
    await expect(campo).toBeFocused();
    await expect(campo).toHaveAccessibleDescription("Error: Enter your name.");
    await page.getByLabel("Other", { exact: true }).check();
    await campo.fill("Ana");
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Error: Tell us what other role you have.")).toBeVisible();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("guardar muestra el aviso en inglés y deja lo mismo guardado que en español", async ({ page }) => {
    await page.goto("/perfil");
    await page.getByRole("button", { name: "Complete my profile" }).click();
    await page.getByLabel("Name", { exact: true }).fill("Ana Pérez");
    await page.getByLabel("Gardening").check();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Done: we saved your profile." })).toBeVisible();
    const guardado = await page.evaluate(() => window.localStorage.getItem("lh-perfil"));
    expect(JSON.parse(guardado ?? "{}")).toMatchObject({ nombre: "Ana Pérez", roles: ["jardineria"] });
  });
});

test.describe("Mi recorrido en inglés", () => {
  test.use({ locale: "en-US" });

  test("sin pactos, el próximo paso propone en inglés proponer un pacto", async ({ page }) => {
    await sembrar(page, { "lh-perfil": PERFIL, "lh-membresia": JSON.stringify({ lighthouse: "miembro" }) });
    await page.goto("/panel");
    await expect(page.getByRole("heading", { level: 1, name: "My journey" })).toBeVisible();
    const proximo = page.getByRole("region", { name: "Your next step" });
    await expect(proximo).toContainText("Propose a pact");
    await expect(proximo.getByRole("link", { name: "Propose a pact" })).toHaveAttribute("href", "/pactos");
    await expect(page.getByText("Demo mode: this dashboard reads what you saved in this browser.")).toBeVisible();
    await expect(page.getByText("There's nothing on your path yet.")).toBeVisible();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("un perfil vacío propone completar el perfil", async ({ page }) => {
    await page.goto("/panel");
    await expect(page.getByRole("region", { name: "Your next step" }).getByRole("link", { name: "Complete my profile" })).toHaveAttribute(
      "href",
      "/perfil",
    );
  });

  test("la línea de tiempo usa fechas en inglés y el evento viejo queda en español con lang es", async ({ page }) => {
    await sembrar(page, { "lh-actividad": JSON.stringify([EVENTO_NUEVO, EVENTO_VIEJO]) });
    await page.goto("/panel");
    const nuevo = page.getByRole("link", { name: "Valle Solar accepted your membership" });
    await expect(nuevo).toBeVisible();
    await expect(nuevo.locator('[translate="no"]')).toHaveText("Valle Solar");
    const viejo = page.getByRole("link", { name: "Valle Solar aceptó tu pacto" });
    await expect(viejo.locator('[lang="es"]')).toHaveText("Valle Solar aceptó tu pacto");
    // El día va con el nombre del día y el mes en inglés ("Friday, October 9, 2026").
    const dia = page.getByRole("heading", { level: 3 }).first();
    await expect(dia).toHaveText(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), [A-Z][a-z]+ \d{1,2}, \d{4}$/);
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("la pestaña Log tiene la tabla y el aviso en inglés", async ({ page }) => {
    await sembrar(page, {
      "lh-bitacora": JSON.stringify([
        {
          fecha: hace(5),
          ruta: "/territorios/lighthouse",
          tipo: "estado-loteo",
          clave: "lighthouse",
          mostrado: "Loteo en trámite",
          huella: "abcd1234",
          borrador: true,
        },
      ]),
    });
    await page.goto("/panel");
    await page.getByRole("tab", { name: "Log" }).click();
    await expect(page.getByText("In the prototype the log stays only in this browser")).toBeVisible();
    const fila = page.getByRole("row").filter({ hasText: "Subdivision status" });
    await expect(fila).toContainText("Draft: yes");
    // Lo que se mostró queda en el idioma en que se mostró (las entradas viejas eran en español).
    await expect(fila.locator('[lang="es"]', { hasText: "Loteo en trámite" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Download (JSON)" })).toBeVisible();
  });
});

test.describe("Notificaciones en inglés", () => {
  test.use({ locale: "en-US" });

  test("la bandeja arma cada evento en inglés; el evento viejo sigue en español con lang es", async ({ page }) => {
    await sembrar(page, { "lh-actividad": JSON.stringify([EVENTO_NUEVO, EVENTO_VIEJO]) });
    await page.goto("/bandeja");
    await expect(page.getByRole("heading", { level: 1, name: "Your inbox" })).toBeVisible();
    const lista = page.getByRole("list");
    const nuevo = lista.getByRole("listitem").filter({ hasText: "Valle Solar accepted your membership" });
    await expect(nuevo).toContainText("Unread");
    await expect(nuevo.locator('[translate="no"]')).toHaveText("Valle Solar");
    const viejo = lista.getByRole("listitem").filter({ hasText: "Valle Solar aceptó tu pacto" });
    await expect(viejo.locator('[lang="es"]')).toHaveText("Valle Solar aceptó tu pacto");
    await expect(page.getByText("Soon you'll be able to receive messages from your community and the team")).toBeVisible();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("la campanita dice la cantidad en inglés y marcar todas como leídas lo anuncia en inglés", async ({ page }) => {
    await sembrar(page, { "lh-actividad": JSON.stringify([EVENTO_NUEVO, EVENTO_VIEJO]) });
    await page.goto("/bandeja");
    await expect(page.getByRole("link", { name: "2 unread notifications" })).toBeVisible();
    await page.getByRole("button", { name: "Mark all as read" }).click();
    await expect(page.getByRole("status").filter({ hasText: "All notifications are now marked as read." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Notifications, nothing new" })).toBeVisible();
    await expect(page.getByText("Read", { exact: true }).first()).toBeVisible();
  });

  test("sin notificaciones dice el vacío en inglés", async ({ page }) => {
    await page.goto("/bandeja");
    await expect(page.getByText("You don't have any notifications yet.")).toBeVisible();
  });
});

test("una notificación recibida en español se lee en inglés al cambiar de idioma, con el nombre de la comunidad tal cual", async ({
  page,
}) => {
  const LEYO = "Leí el manifiesto con atención y entiendo que sumarme es comprometerme con un grupo de personas";
  const CUIDAR = "Me comprometo a cuidar estos acuerdos y a hablar con la comunidad si algún día no puedo cumplirlos";
  await page.goto("/tribus/valle/manifiesto");
  await page.getByRole("region", { name: "Texto del manifiesto" }).evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.getByLabel(LEYO).check();
  await page.getByLabel(CUIDAR).check();
  await page.getByRole("button", { name: "Adherir", exact: true }).click();
  await page.getByRole("button", { name: "Simular: la comunidad me acepta" }).click();

  await page.goto("/bandeja");
  await expect(page.getByRole("link", { name: "Valle Solar aceptó tu adhesión" })).toBeVisible();

  await page.goto("/bandeja?lang=en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const enlace = page.getByRole("link", { name: "Valle Solar accepted your membership" });
  await expect(enlace).toBeVisible();
  await expect(enlace.locator('[translate="no"]')).toHaveText("Valle Solar");
  await expect(page.getByRole("link", { name: /unread notification/ })).toBeVisible();
  // Lo guardado sigue teniendo el texto en español además del mensaje y los datos.
  const guardado = await page.evaluate(() => JSON.parse(window.localStorage.getItem("lh-actividad") ?? "[]"));
  expect(guardado.find((e: { notificacion: boolean }) => e.notificacion)).toMatchObject({
    texto: "Valle Solar aceptó tu adhesión",
    mensaje: "adhesionAceptada",
    datos: { comunidad: "Valle Solar" },
  });
  expect(await textosEnEspanol(page, "main")).toEqual([]);
});

test.describe("Configuración en inglés", () => {
  test.use({ locale: "en-US" });

  test("apariencia, avisos, Hifa, moneda con su nota e idioma están en inglés", async ({ page }) => {
    await page.goto("/configuracion");
    await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Match the system" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "Large" })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Reduce animations" })).toBeVisible();
    await expect(page.getByRole("link", { name: "your inbox" })).toHaveAttribute("href", "/bandeja");
    await expect(page.getByRole("checkbox", { name: /Recognition rounds/ })).toBeChecked();
    // El aviso de Market está en pausa (27-oct-2026): no hay casilla.
    await expect(page.getByRole("checkbox", { name: /Market/ })).toHaveCount(0);
    await expect(page.getByRole("checkbox", { name: /Show Hifa/ })).toBeVisible();
    await expect(page.getByText("Sample exchange rate: 1 USD = 1,400 ARS. This is not a real quote.")).toBeVisible();
    await expect(page.getByRole("radio", { name: "English" })).toBeChecked();
    expect(await textosEnEspanol(page, "main")).toEqual([]);
  });

  test("apagar un tipo de aviso sigue funcionando con las etiquetas en inglés", async ({ page }) => {
    await sembrar(page, { "lh-actividad": JSON.stringify([EVENTO_NUEVO]) });
    await page.goto("/bandeja");
    await expect(page.getByRole("link", { name: "1 unread notification" })).toBeVisible();
    await page.goto("/configuracion");
    await page.getByRole("checkbox", { name: /Communities/ }).uncheck();
    await expect(page.getByRole("link", { name: "Notifications, nothing new" })).toBeVisible();
  });

  test("Delete everything pide la confirmación en inglés y borra lo mismo que en español", async ({ page }) => {
    await sembrar(page, { "lh-perfil": PERFIL, "lh-actividad": JSON.stringify([EVENTO_NUEVO]) });
    await page.goto("/configuracion");
    let pregunta = "";
    page.once("dialog", (d) => {
      pregunta = d.message();
      void d.accept();
    });
    await page.getByRole("button", { name: /^Delete everything/ }).click();
    await expect(page.getByRole("status").filter({ hasText: "Done: everything saved in this browser was deleted" })).toBeVisible();
    expect(pregunta).toBe("Delete everything you saved in this browser?");
    expect(await page.evaluate(() => window.localStorage.getItem("lh-perfil"))).toBeNull();
    expect(await page.evaluate(() => window.localStorage.getItem("lh-actividad"))).toBeNull();
  });

  test("cancelar la confirmación no borra nada", async ({ page }) => {
    await sembrar(page, { "lh-perfil": PERFIL });
    await page.goto("/configuracion");
    page.once("dialog", (d) => void d.dismiss());
    await page.getByRole("button", { name: /^Delete everything/ }).click();
    expect(await page.evaluate(() => window.localStorage.getItem("lh-perfil"))).not.toBeNull();
  });
});
