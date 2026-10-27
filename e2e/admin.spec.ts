import { COOKIE_PRUEBA, EMAILS, expect, test, type Page } from "./fixtura";

const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;
const RUTAS = ["/admin", "/admin/personas", "/admin/comunidades"];
const NO_DEBE_APARECER = ["Pendientes", "Personas y roles", "Pedidos de contacto"];

const rail = (page: Page) => page.getByRole("navigation", { name: "Principal" });
const pestanas = (page: Page) => page.getByRole("navigation", { name: "Secciones de la administración" });

test.describe("403 en el servidor (sin pasar por la pantalla)", () => {
  test.use({ rol: "ninguno" });

  test("sin cookie y con una persona común responde 403 y no trae contenido", async ({ request }) => {
    for (const ruta of RUTAS) {
      for (const cabecera of [undefined, `${COOKIE_PRUEBA}=${encodeURIComponent(EMAILS.persona)}`]) {
        const r = await request.get(ruta, { headers: cabecera ? { cookie: cabecera } : {} });
        expect(r.status(), `${ruta} ${cabecera ?? "sin cookie"}`).toBe(403);
        const cuerpo = await r.text();
        for (const t of NO_DEBE_APARECER) expect(cuerpo, `${ruta}: ${t}`).not.toContain(t);
        expect(cuerpo, ruta).not.toMatch(EMAIL);
      }
    }
  });

  test("con la cookie del super admin responde 200", async ({ request }) => {
    const r = await request.get("/admin", { headers: { cookie: `${COOKIE_PRUEBA}=${encodeURIComponent(EMAILS.superadmin)}` } });
    expect(r.status()).toBe(200);
  });

  test("sin sesión, /admin en la página responde 403 (no lleva a Sumarte)", async ({ page }) => {
    const r = await page.goto("/admin");
    expect(r?.status()).toBe(403);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { level: 1, name: "No tenés acceso a esta página" })).toBeVisible();
  });
});

test.describe("rol persona", () => {
  test.use({ rol: "persona" });

  test("el rail no tiene ningún ítem Admin y /admin muestra 403", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("banner").getByRole("link", { name: /NetX/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Admin/ })).toHaveCount(0);
    await expect(rail(page)).not.toContainText("Admin");
    const r = await page.goto("/admin");
    expect(r?.status()).toBe(403);
    await expect(page.getByRole("heading", { level: 1, name: "No tenés acceso a esta página" })).toBeVisible();
  });
});

test.describe("super admin", () => {
  test("el rail tiene Admin, las tres pestañas van en orden y Pendientes está activa", async ({ page }) => {
    await page.goto("/");
    await expect(rail(page).getByRole("link", { name: /Admin/ })).toHaveAttribute("href", "/admin");
    await page.goto("/admin");
    await expect(pestanas(page).getByRole("link")).toHaveText([/^Pendientes/, "Personas y roles", "Comunidades"]);
    await expect(pestanas(page).getByRole("link", { name: /^Pendientes/ })).toHaveAttribute("aria-current", "page");
  });

  test("con el teclado: Tab hasta Comunidades y Enter abre /admin/comunidades", async ({ page }) => {
    await page.goto("/admin");
    const enlace = pestanas(page).getByRole("link", { name: "Comunidades" });
    for (let i = 0; i < 60 && !(await enlace.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(enlace).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/admin\/comunidades$/);
    await expect(page.getByRole("heading", { level: 1, name: "Comunidades" })).toBeVisible();
  });

  test("un solo h1 y un solo main en cada pestaña", async ({ page }) => {
    for (const ruta of RUTAS) {
      await page.goto(ruta);
      await expect(page.getByRole("heading", { level: 1 }), ruta).toHaveCount(1);
      await expect(page.locator("main"), ruta).toHaveCount(1);
    }
  });

  test("Personas y roles lista a la persona de prueba", async ({ page }) => {
    await page.goto("/admin/personas");
    const panel = page.getByRole("region", { name: "Personas y roles" });
    await expect(panel.getByLabel(`Rol de ${EMAILS.persona}`)).toBeVisible();
  });

  test("Comunidades: tabla con encabezados y un enlace a la ficha de una tribu", async ({ page }) => {
    await page.goto("/admin/comunidades");
    const tabla = page.getByRole("table", { name: "Comunidades del directorio" });
    await expect(tabla.getByRole("columnheader")).toHaveText(["Comunidad", "Barrio", "Estado", "Hogares", "Roles", "Forma jurídica"]);
    await expect(tabla.getByRole("link", { name: /Valle Solar/ })).toHaveAttribute("href", "/tribus/valle");
  });

  test("a 390 px no hay desborde horizontal en las tres pestañas", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const ruta of RUTAS) {
      await page.goto(ruta);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth), ruta).toBeLessThanOrEqual(390);
    }
  });

  test("el contador: una postulación y un pedido guardados dan 2 pendientes", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByTestId("total-postulaciones")).toHaveText("0");
    // Una postulación (flujo de postulacion.spec.ts).
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
    await expect(page.getByText("Recibimos tu postulación (simulado)")).toBeVisible();
    // Un pedido de contacto (flujo de contactos.spec.ts).
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Pedir una charla" }).click();
    await page.getByRole("radio", { name: "Email" }).check();
    await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
    await expect(page.getByText("Charla pedida (simulado)")).toBeVisible();

    await page.goto("/admin");
    await expect(rail(page).getByRole("link", { name: "Admin, 2 pendientes" })).toBeVisible();
    await expect(pestanas(page).getByRole("link", { name: "Pendientes · 2" })).toBeVisible();
    await expect(page.getByTestId("total-postulaciones")).toHaveText("1");
    await expect(page.getByRole("row").filter({ hasText: "Charla para invertir en NetX" })).toBeVisible();
  });
});
