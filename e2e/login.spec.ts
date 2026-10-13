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

  test("la pantalla de entrada ofrece Entrar y Entrar como…, no muestra datos y la API responde 401", async ({ page, request }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenida al Lighthouse" })).toBeVisible();
    await expect(page.getByText("Prototipo interno · datos de ejemplo").first()).toBeVisible();
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

  test("las rutas internas no se ven sin sesión", async ({ page }) => {
    await page.goto("/perfil");
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenida al Lighthouse" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Perfil/ })).toHaveCount(0);
    await page.goto("/netx");
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenida al Lighthouse" })).toBeVisible();
  });

  test("axe sin violaciones serias o críticas en la pantalla de entrada", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Entrar como…" })).toBeVisible();
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });

  test("entrar como una persona de la lista abre la app y recuerda la sesión al recargar", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: EMAILS.persona }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /Encontrá tu tribu/ })).toBeVisible();
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
    await expect(panel).toContainText("Editar roles llega con la base de datos (Neon)");
    const filas = panel.getByRole("row");
    await expect(filas).toHaveCount(4);
    await expect(panel.getByRole("row", { name: new RegExp(EMAILS.superadmin) })).toContainText("Super admin");
    await expect(panel.getByRole("row", { name: new RegExp(EMAILS["admin-tribu"]) })).toContainText("Admin de Valle Solar");
    await expect(panel.getByRole("row", { name: new RegExp(EMAILS.persona) })).toContainText("Inversor");
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

test.describe("email fuera de la lista", () => {
  test.use({ rol: "ninguno" });

  test("ve el aviso de sin acceso y la API responde 403", async ({ page, context, baseURL, request }) => {
    await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(EMAIL_FUERA_DE_LISTA), url: baseURL! }]);
    await page.goto("/");
    await expect(page.getByText("Tu email todavía no tiene acceso a este prototipo. Pedíselo a Gus.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Bienvenida al Lighthouse" })).toHaveCount(0);
    await expect(barra(page).getByRole("link", { name: /NetX/ })).toHaveCount(0);
    expect((await request.get("/api/sesion", { headers: { "x-lh-prueba": EMAIL_FUERA_DE_LISTA } })).status()).toBe(403);
    // Salir vuelve a la pantalla de entrada.
    await page.getByRole("button", { name: "Salir" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenida al Lighthouse" })).toBeVisible();
  });
});

test.describe("cookie de prueba vencida", () => {
  test.use({ rol: "ninguno" });

  test("si el servidor responde 401 al modo de prueba, se borra la cookie y vuelve la pantalla de entrada", async ({
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
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenida al Lighthouse" })).toBeVisible();
    await expect(page.getByText("No pudimos verificar tu sesión")).toHaveCount(0);
    const cookies = await context.cookies(baseURL!);
    expect(cookies.find((c) => c.name === COOKIE_PRUEBA)).toBeUndefined();
  });
});

test.describe("salir y cambiar de cuenta", () => {
  test.use({ rol: "persona" });

  test("Salir vuelve a la pantalla de entrada, la barra muestra Entrar y la sesión no vuelve al recargar", async ({ page }) => {
    await page.goto("/");
    await salir(page);
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenida al Lighthouse" })).toBeVisible();
    await expect(barra(page).getByRole("button", { name: "Entrar" })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: "Bienvenida al Lighthouse" })).toBeVisible();
  });

  test("cada persona ve solo sus datos en el mismo navegador", async ({ page }) => {
    // Persona A (la de este test) adhiere a Valle Solar.
    await adherirAValle(page);
    await page.goto("/tribus/valle");
    await expect(page.getByText("Tu pedido llegó a Valle Solar.")).toBeVisible();

    // Persona B entra en el mismo navegador: no ve el pedido de A.
    await salir(page);
    await page.getByRole("button", { name: EMAILS.superadmin }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await page.goto("/tribus/valle");
    await expect(page.getByRole("link", { name: "Adherir al manifiesto de la tribu" })).toBeVisible();
    await expect(page.getByText("Tu pedido llegó a Valle Solar.")).toHaveCount(0);

    // A vuelve a entrar y su pedido sigue ahí.
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
    await page.goto("/");
    await page.getByRole("button", { name: EMAILS.persona }).click();
    const aviso = page.getByRole("region", { name: "Encontramos datos de antes del login" });
    await expect(aviso).toBeVisible();
    await aviso.getByRole("button", { name: "Importar a mi cuenta" }).click();
    await expect(aviso).toHaveCount(0);
    await page.goto("/tribus/valle");
    await expect(page.getByText("Tu pedido llegó a Valle Solar.")).toBeVisible();

    // La segunda cuenta ya no recibe la oferta.
    await salir(page);
    await page.getByRole("button", { name: EMAILS.superadmin }).click();
    await expect(menuAvatar(page)).toBeVisible();
    await expect(page.getByRole("region", { name: "Encontramos datos de antes del login" })).toHaveCount(0);
  });
});
