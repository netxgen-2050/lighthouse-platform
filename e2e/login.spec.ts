import AxeBuilder from "@axe-core/playwright";
import { COOKIE_PRUEBA, EMAIL_FUERA_DE_LISTA, EMAILS, expect, test, type Page } from "./fixtura";

const LEYO = "Leí el manifiesto con atención y entiendo que sumarme es comprometerme con un grupo de personas";
const CUIDAR = "Me comprometo a cuidar estos acuerdos y a hablar con la comunidad si algún día no puedo cumplirlos";

const barra = (page: Page) => page.getByRole("banner");
const menuAvatar = (page: Page) => page.getByRole("button", { name: "Menú de la persona" });

async function salir(page: Page) {
  await menuAvatar(page).click();
  await page.locator("#menu-persona").getByRole("button", { name: "Salir" }).click();
}

async function adherirAValle(page: Page) {
  await page.goto("/tribus/valle/manifiesto");
  await page.getByRole("region", { name: "Texto del manifiesto" }).evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.getByLabel(LEYO).check();
  await page.getByLabel(CUIDAR).check();
  await page.getByRole("button", { name: "Adherir", exact: true }).click();
  await expect(page.getByText("Tu pedido llegó a Valle Solar.")).toBeVisible();
}

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("una página interna lleva a Sumarte, que ofrece Entrar como…; no muestra datos y la API responde 401", async ({ page, request }) => {
    await page.goto("/pactos");
    await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
    await expect(page).toHaveURL(/\/sumarte\?volver=%2Fpactos$/);
    await expect(page.getByText("Prototipo interno · datos de ejemplo").first()).toBeVisible();
    await expect(barra(page).getByRole("link", { name: "Sumarte" })).toBeVisible();
    await expect(barra(page).getByRole("button", { name: "Entrar" })).toBeVisible();
    await expect(barra(page).getByRole("button", { name: "Menú de la persona" })).toHaveCount(0);
    await expect(barra(page).getByRole("link", { name: /NetX/ })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Entrar como…" })).toBeVisible();
    for (const email of Object.values(EMAILS)) await expect(page.getByRole("button", { name: email })).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);

    expect((await request.get("/api/sesion")).status()).toBe(401);
    // Una cookie de prueba sola no vale: el servidor pide el header.
    expect((await request.get("/api/sesion", { headers: { cookie: `${COOKIE_PRUEBA}=${EMAILS.superadmin}` } })).status()).toBe(401);
  });

  test("las rutas internas no se ven sin sesión: llevan a Sumarte", async ({ page }) => {
    await page.goto("/perfil");
    await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /Perfil/ })).toHaveCount(0);
    await page.goto("/netx");
    await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
  });

  test("axe sin violaciones serias o críticas en Sumarte sin cuenta", async ({ page }) => {
    await page.goto("/pactos");
    await expect(page.getByRole("heading", { name: "Entrar como…" })).toBeVisible();
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });

  test("entrar como una persona de la lista abre la app y recuerda la sesión al recargar", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await page.reload();
    await expect(menuAvatar(page)).toBeVisible();
  });
});

test.describe("super admin", () => {
  test("ve NetX y el panel Personas y roles con todas las personas de la lista", async ({ page }) => {
    await page.goto("/");
    await expect(barra(page).getByRole("link", { name: /NetX/ })).toBeVisible();
    await page.goto("/netx");
    const panel = page.getByRole("region", { name: "Personas y roles" });
    await expect(panel).toBeVisible();
    // Encabezado + al menos las 3 personas de prueba (en los previews la lista también trae al equipo).
    const filas = panel.getByRole("row");
    await expect.poll(() => filas.count()).toBeGreaterThanOrEqual(4);
    await expect(panel.getByLabel(`Rol de ${EMAILS.superadmin}`)).toHaveValue("superadmin");
    await expect(panel.getByLabel(`Rol de ${EMAILS["admin-tribu"]}`)).toHaveValue("admin-tribu");
    await expect(panel.getByRole("row", { name: new RegExp(EMAILS["admin-tribu"]) })).toContainText("Valle Solar");
    await expect(panel.getByLabel(`Perfil de prueba de ${EMAILS.persona}`)).toHaveValue("inversor");
  });

  test("suma una persona, le cambia el rol y el cambio se ve en su sesión", async ({ page, request }) => {
    // Idempotente: siempre la misma persona de prueba (no hay forma de borrar personas). Si ya existe de una corrida anterior
    // (por ejemplo contra un preview), se la deja como persona común antes de empezar y se la restaura al terminar.
    const nueva = "panel-e2e@prueba.test";
    const cabecera = { "x-lh-prueba": EMAILS.superadmin };
    const lista = async () =>
      ((await (await request.get("/api/personas", { headers: cabecera })).json()) as { personas: { id: string; email: string }[] }).personas;
    const previa = (await lista()).find((p) => p.email === nueva);
    if (previa) await request.patch("/api/personas", { headers: cabecera, data: { id: previa.id, rol: "persona", tribuAdmin: null } });

    await page.goto("/netx");
    const panel = page.getByRole("region", { name: "Personas y roles" });
    await expect(panel.getByLabel(`Rol de ${EMAILS.superadmin}`)).toBeVisible();
    if (!previa) {
      await panel.getByLabel("Email de la persona").fill(nueva);
      await panel.getByRole("button", { name: "Sumar persona" }).click();
      await expect(panel.getByRole("status")).toContainText(`Sumada: ${nueva}`);
    }
    // Elegir otro rol no guarda: se guarda solo al confirmar.
    await panel.getByLabel(`Rol de ${nueva}`).selectOption("admin-tribu");
    expect((await (await request.get("/api/sesion", { headers: { "x-lh-prueba": nueva } })).json()).rol).toBe("persona");
    await panel.getByRole("button", { name: `Guardar cambios de ${nueva}` }).click();
    await expect(panel.getByRole("status")).toContainText(`Guardado: ${nueva}`);
    await expect(panel.getByRole("row", { name: new RegExp(nueva) })).toContainText("Valle Solar");
    expect(await (await request.get("/api/sesion", { headers: { "x-lh-prueba": nueva } })).json()).toMatchObject({ rol: "admin-tribu", tribuAdmin: "valle" });
    // Se recuerda tras recargar (viene de la base).
    await page.reload();
    await expect(page.getByRole("region", { name: "Personas y roles" }).getByLabel(`Rol de ${nueva}`)).toHaveValue("admin-tribu");
    // Restaura el estado inicial.
    const yo = (await lista()).find((p) => p.email === nueva)!;
    await request.patch("/api/personas", { headers: cabecera, data: { id: yo.id, rol: "persona", tribuAdmin: null } });
  });

  test("la API del panel es solo para el super admin", async ({ request }) => {
    expect((await request.get("/api/personas")).status()).toBe(401);
    expect((await request.get("/api/personas", { headers: { "x-lh-prueba": EMAILS.persona } })).status()).toBe(403);
    expect((await request.get("/api/personas", { headers: { "x-lh-prueba": EMAILS["admin-tribu"] } })).status()).toBe(403);
    const lista = await request.get("/api/personas", { headers: { "x-lh-prueba": EMAILS.superadmin } });
    expect(lista.status()).toBe(200);
    // El único super admin no puede quitarse el rol (en los e2e locales hay uno solo).
    const { personas } = (await lista.json()) as { personas: { id: string; email: string; rol: string }[] };
    if (personas.filter((p) => p.rol === "superadmin").length === 1) {
      const yo = personas.find((p) => p.email === EMAILS.superadmin)!;
      const r = await request.patch("/api/personas", { headers: { "x-lh-prueba": EMAILS.superadmin }, data: { id: yo.id, rol: "persona" } });
      expect(r.status()).toBe(409);
    }
  });

  test("el modo de prueba rechaza un email que no es de prueba", async ({ request }) => {
    expect((await request.get("/api/sesion", { headers: { "x-lh-prueba": "gus@gmail.com" } })).status()).toBe(403);
  });

  test("el avatar usa las iniciales del email y el perfil muestra la cuenta", async ({ page }) => {
    await page.goto("/perfil");
    await expect(menuAvatar(page)).toHaveText("S");
    await expect(page.getByText(`Tu cuenta: ${EMAILS.superadmin}`)).toBeVisible();
  });

  test("/api/sesion devuelve rol, perfil y tribu con el header de prueba", async ({ request }) => {
    const r = await request.get("/api/sesion", { headers: { "x-lh-prueba": EMAILS["admin-tribu"].toUpperCase() } });
    expect(r.status()).toBe(200);
    expect(await r.json()).toMatchObject({ email: EMAILS["admin-tribu"], rol: "admin-tribu", perfil: "usuario", tribuAdmin: "valle" });
  });
});

test.describe("admin de tribu", () => {
  test.use({ rol: "admin-tribu" });

  test("no ve NetX; ve la marca Admin de Valle Solar en la tribu y en su menú", async ({ page }) => {
    await page.goto("/tribus/valle");
    await expect(barra(page).getByRole("link", { name: /NetX/ })).toHaveCount(0);
    await expect(page.getByRole("main").getByText("Admin de Valle Solar")).toBeVisible();
    await menuAvatar(page).click();
    await expect(page.locator("#menu-persona")).toContainText("Admin de Valle Solar");
    await page.goto("/tribus/semilla");
    await expect(page.getByText("Admin de Valle Solar")).toHaveCount(0);
  });

  test("/netx le dice que no tiene acceso", async ({ page }) => {
    await page.goto("/netx");
    await expect(page.getByRole("heading", { name: "No tenés acceso a esta vista" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Personas y roles" })).toHaveCount(0);
  });
});

test.describe("persona", () => {
  test.use({ rol: "persona" });

  test("no ve NetX ni la marca de admin, y /netx le dice que no tiene acceso", async ({ page }) => {
    await page.goto("/tribus/valle");
    await expect(barra(page).getByRole("link", { name: /NetX/ })).toHaveCount(0);
    await expect(page.getByText("Admin de Valle Solar")).toHaveCount(0);
    await page.goto("/netx");
    await expect(page.getByRole("heading", { name: "No tenés acceso a esta vista" })).toBeVisible();
    await expect(page.getByText("¿Vamos a vender en febrero?")).toHaveCount(0);
  });

  test("no recibe la lista de personas de la API", async ({ request }) => {
    const r = await request.get("/api/sesion", { headers: { "x-lh-prueba": EMAILS.persona } });
    expect(r.status()).toBe(200);
    expect((await r.json()).personas).toBeUndefined();
  });
});

test.describe("email fuera de LH_PERSONAS (acceso abierto)", () => {
  test.use({ rol: "ninguno" });

  test("entra como Explorador: sin marca de admin ni NetX, y la API responde 200 como persona común", async ({ page, context, baseURL, request }) => {
    await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(EMAIL_FUERA_DE_LISTA), url: baseURL! }]);
    await page.goto("/");
    await expect(menuAvatar(page)).toBeVisible();
    await expect(page.getByText("Tu email todavía no tiene acceso a este prototipo")).toHaveCount(0);
    await expect(barra(page).getByRole("link", { name: /NetX/ })).toHaveCount(0);
    await menuAvatar(page).click();
    await expect(page.locator("#menu-persona")).toContainText("Nivel: Explorador");
    const r = await request.get("/api/sesion", { headers: { "x-lh-prueba": EMAIL_FUERA_DE_LISTA } });
    expect(r.status()).toBe(200);
    expect(await r.json()).toMatchObject({ email: EMAIL_FUERA_DE_LISTA, rol: "persona", tribuAdmin: null });
    // Salir vuelve a Descubrir sin cuenta.
    await page.locator("#menu-persona").getByRole("button", { name: "Salir" }).click();
    await expect(page.getByRole("heading", { level: 1, name: /Encontrá tu tribu/ })).toBeVisible();
    await expect(barra(page).getByRole("button", { name: "Entrar" })).toBeVisible();
  });
});

test.describe("cookie de prueba vencida", () => {
  test.use({ rol: "ninguno" });

  test("si el servidor responde 401 al modo de prueba, se borra la cookie y se vuelve a Sumarte sin cuenta", async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(EMAILS.persona), url: baseURL! }]);
    // Simula un servidor que ya no acepta el modo de prueba: solo las pedidas con el header de prueba dan 401.
    await page.route("**/api/sesion", async (ruta) => {
      if (ruta.request().headers()["x-lh-prueba"]) {
        await ruta.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "sin-sesion" }) });
      } else {
        await ruta.continue();
      }
    });
    await page.goto("/pactos");
    await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
    await expect(page.getByText("No pudimos verificar tu sesión")).toHaveCount(0);
    const cookies = await context.cookies(baseURL!);
    expect(cookies.find((c) => c.name === COOKIE_PRUEBA)).toBeUndefined();
  });
});

test.describe("salir y cambiar de cuenta", () => {
  test.use({ rol: "persona" });

  test("Salir lleva a Sumarte, la barra muestra Sumarte y Entrar y la sesión no vuelve al recargar", async ({ page }) => {
    await page.goto("/pactos");
    await salir(page);
    await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
    await expect(barra(page).getByRole("button", { name: "Entrar" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
    await expect(barra(page).getByRole("button", { name: "Menú de la persona" })).toHaveCount(0);
  });

  test("cada persona ve solo sus datos en el mismo navegador", async ({ page }) => {
    // Persona A (la de este test) adhiere a Valle Solar.
    await adherirAValle(page);
    await page.goto("/tribus/valle");
    await expect(page.getByText("Tu pedido llegó a Valle Solar.")).toBeVisible();

    // Persona B entra en el mismo navegador: no ve el pedido de A. (Se sale desde una página que pide sesión,
    // para que aparezca "Entrar como…".)
    await page.goto("/pactos");
    await salir(page);
    await page.getByRole("button", { name: EMAILS.superadmin }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await page.goto("/tribus/valle");
    await expect(page.getByRole("link", { name: "Adherir al manifiesto de la tribu" })).toBeVisible();
    await expect(page.getByText("Tu pedido llegó a Valle Solar.")).toHaveCount(0);

    // A vuelve a entrar y su pedido sigue ahí.
    await page.goto("/pactos");
    await salir(page);
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await page.goto("/tribus/valle");
    await expect(page.getByText("Tu pedido llegó a Valle Solar.")).toBeVisible();
  });
});

test.describe("datos de antes del login", () => {
  test.use({ rol: "ninguno" });

  test("se ofrece importarlos una sola vez a la primera cuenta que entra", async ({ page }) => {
    // Sin el traductor de claves del fixture: datos guardados como antes del login (sin prefijo).
    await page.addInitScript(() => {
      if (!window.sessionStorage.getItem("sembrado")) {
        window.sessionStorage.setItem("sembrado", "1");
        window.localStorage.setItem("lh-membresia", JSON.stringify({ valle: "pedido" }));
      }
    });
    await page.goto("/pactos");
    await page.getByRole("button", { name: EMAILS.persona }).click();
    const aviso = page.getByRole("region", { name: "Encontramos datos de antes del login" });
    await expect(aviso).toBeVisible();
    await aviso.getByRole("button", { name: "Importar a mi cuenta" }).click();
    await expect(aviso).toHaveCount(0);
    // Adherir es de Miembro: la persona nueva (Explorador) pasa a Miembro en Sumarte para ver el pedido importado.
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Hacerme miembro" }).click();
    await page.goto("/tribus/valle");
    await expect(page.getByText("Tu pedido llegó a Valle Solar.")).toBeVisible();

    // La segunda cuenta ya no recibe la oferta.
    await page.goto("/pactos");
    await salir(page);
    await page.getByRole("button", { name: EMAILS.superadmin }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await expect(page.getByRole("region", { name: "Encontramos datos de antes del login" })).toHaveCount(0);
  });
});
