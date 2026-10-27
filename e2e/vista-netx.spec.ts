import { expect, test, type Page } from "./fixtura";

const PESTANAS = ["Resumen", "Simulador", "Comunidad y embudo"];
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;

const navegacion = (page: Page) => page.getByRole("navigation", { name: "Secciones de la Vista NetX" });
// Espera a que la página se arme (la Puerta muestra "Cargando…" hasta verificar la sesión) y devuelve el texto de main.
async function textoMain(page: Page) {
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  return page.locator("main").innerText();
}

async function tabHasta(page: Page, enlace: ReturnType<Page["getByRole"]>) {
  for (let i = 0; i < 60 && !(await enlace.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expect(enlace).toBeFocused();
}

test.describe("estructura", () => {
  test("h1 nuevo, un solo h1 y un solo main; el título viejo no está en ninguna pestaña", async ({ page }) => {
    const respuesta = await page.goto("/netx");
    expect(respuesta?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "¿Cómo se financia NetX sin vender lotes?" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
    for (const ruta of ["/netx", "/netx/simulador", "/netx/comunidad"]) {
      await page.goto(ruta);
      await expect(page.getByText("¿Vamos a vender en febrero?")).toHaveCount(0);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator("main")).toHaveCount(1);
    }
  });

  test("las tres pestañas, en orden, con Resumen en aria-current", async ({ page }) => {
    await page.goto("/netx");
    const enlaces = navegacion(page).getByRole("link");
    await expect(enlaces).toHaveText(PESTANAS);
    await expect(navegacion(page).getByRole("link", { name: "Resumen" })).toHaveAttribute("aria-current", "page");
    await expect(navegacion(page).getByRole("link", { name: "Simulador" })).not.toHaveAttribute("aria-current", "page");
  });

  test("con el teclado: Tab hasta Simulador y Enter abre /netx/simulador", async ({ page }) => {
    await page.goto("/netx");
    await tabHasta(page, navegacion(page).getByRole("link", { name: "Simulador" }));
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/netx\/simulador$/);
    await expect(page.getByRole("heading", { level: 1, name: "Simulador de la tokenomics" })).toBeVisible();
  });
});

test.describe("rol persona", () => {
  test.use({ rol: "persona" });

  test("ve las mismas pestañas y el enlace NetX de la barra superior", async ({ page }) => {
    await page.goto("/netx");
    await expect(page.getByRole("heading", { level: 1, name: "¿Cómo se financia NetX sin vender lotes?" })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: /NetX/ })).toHaveAttribute("href", "/netx");
    await expect(navegacion(page).getByRole("link")).toHaveText(PESTANAS);
    await expect(navegacion(page).getByRole("link", { name: "Resumen" })).toHaveAttribute("aria-current", "page");
  });

  test("Comunidad y embudo muestra el embudo y ninguna operación", async ({ page }) => {
    await page.goto("/netx/comunidad");
    await expect(page.getByRole("heading", { level: 1, name: "Comunidad y embudo" })).toBeVisible();
    const embudo = page.getByRole("region", { name: /Embudo/ });
    await expect(embudo.getByRole("listitem").filter({ hasText: "En una tribu" })).toContainText("186");
    await expect(page.getByText("Pedidos de contacto")).toHaveCount(0);
    await expect(page.getByText("Postulaciones de comunidades")).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Personas y roles" })).toHaveCount(0);
  });
});

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("/netx lleva a Sumarte", async ({ page }) => {
    await page.goto("/netx");
    await expect(page).toHaveURL(/\/sumarte/);
  });

  test("ninguna pestaña trae datos de personas en la respuesta, y /netx pide no indexarse", async ({ request }) => {
    for (const ruta of ["/netx", "/netx/simulador", "/netx/comunidad"]) {
      const cuerpo = await (await request.get(ruta)).text();
      expect(cuerpo, ruta).not.toMatch(EMAIL);
      for (const t of ["Pedidos de contacto", "Postulaciones de comunidades", "persona@prueba.test", "super@prueba.test"]) {
        expect(cuerpo, `${ruta}: ${t}`).not.toContain(t);
      }
    }
    const html = await (await request.get("/netx")).text();
    expect(html).toMatch(/<meta name="robots" content="noindex, nofollow"/);
  });
});

test.describe("lo mismo como super admin: las operaciones solo están en /admin", () => {
  test("Comunidad y embudo no trae operaciones", async ({ page }) => {
    await page.goto("/netx/comunidad");
    await expect(page.getByText("Pedidos de contacto")).toHaveCount(0);
    await expect(page.getByText("Postulaciones de comunidades")).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Personas y roles" })).toHaveCount(0);
  });

  test("Comunidad y embudo: indicadores, embudo, cumplimiento y tribus", async ({ page }) => {
    await page.goto("/netx/comunidad");
    await expect(page.getByText("Todos los datos de esta vista son de ejemplo.")).toBeVisible();
    for (const [n, l] of [
      ["412", "perfiles completos"],
      ["3", "tribus activas"],
      ["37", "pactos aceptados"],
      ["USD 1,2 M", "en el espejo de aportes"],
      ["640 h", "horas comprometidas por mes"],
    ]) {
      await expect(page.getByRole("listitem").filter({ hasText: l }).filter({ hasText: n }).first()).toBeVisible();
    }
    const embudo = page.getByRole("region", { name: /Embudo/ });
    await expect(embudo.getByRole("listitem")).toHaveCount(5);
    const enTribu = embudo.getByRole("listitem").filter({ hasText: "En una tribu" });
    await expect(enTribu).toContainText("186");
    await expect(enTribu).toContainText("45% de la etapa anterior");
    await expect(page.getByText("22 / 35 · 63%")).toBeVisible();
    await expect(page.getByRole("button", { name: "Qué significa legalmente: Tierra ribereña" })).toBeVisible();
    const tabla = page.getByRole("table", { name: /Tribus por proyecto/ });
    await expect(tabla.getByRole("columnheader")).toHaveText(["Tribu", "Fincas", "Plata", "Roles", "Ritual"]);
    await expect(tabla.getByRole("row")).toHaveCount(13);
    await expect(tabla.getByRole("row", { name: /Valle Solar/ }).getByRole("cell").nth(1)).toHaveText("65%");
  });
});

test.describe("Resumen", () => {
  test("Juego A y Juego B, con respeto y sin acusar", async ({ page }) => {
    await page.goto("/netx");
    const main = page.locator("main");
    await expect(main.getByRole("heading", { name: "Juego A · el camino conocido" })).toBeVisible();
    await expect(main).toContainText(/la tierra se va/i);
    await expect(main.getByRole("heading", { name: "Juego B · el procomún" })).toBeVisible();
    await expect(main).toContainText("lo que es de todos y se cuida entre todos");
    await expect(main).toContainText(/la tierra queda/i);
    await expect(main).toContainText("en el Juego B, la tierra queda en una Fundación");
  });

  test("palabras que no van en /netx ni en /netx/simulador; 'diseño B' solo junto a doc 28", async ({ page }) => {
    for (const ruta of ["/netx", "/netx/simulador"]) {
      await page.goto(ruta);
      const texto = await textoMain(page);
      for (const p of ["capitalista", "extractivista", "colonialista", "Franz"]) {
        expect(texto.toLowerCase(), `${ruta}: ${p}`).not.toContain(p.toLowerCase());
      }
      const apariciones = texto.match(/diseño B/g) ?? [];
      expect(apariciones, ruta).toHaveLength(1);
      expect(texto, ruta).toContain("doc 28 (diseño B)");
    }
  });

  test("números: aviso antes del primer USD, y los tres bolsillos", async ({ page }) => {
    await page.goto("/netx");
    const texto = await textoMain(page);
    const aviso = texto.indexOf("valores de partida, no son una oferta ni un pronóstico");
    expect(aviso).toBeGreaterThan(-1);
    expect(aviso).toBeLessThan(texto.indexOf("USD"));
    // NetX
    for (const t of ["USD 375.000 a 500.000", "USD 8.550", "USD 40.000", "USD 120.000 a 200.000", "USD 1.336", "sin dato (a cotizar)"]) {
      expect(texto, t).toContain(t);
    }
    // Procomún
    for (const t of ["USD 306.970", "USD 1.357.031", "USD 49.500", "va al procomún, no a NetX", "Congreso de febrero 2027"]) {
      expect(texto, t).toContain(t);
    }
    // Inversores
    for (const t of ["2,66x", "9,2 %", "2,84x", "10,3 %", "7,0 %"]) expect(texto, t).toContain(t);
    // Rangos de riesgo
    for (const t of ["−2,6 %", "10,8 %", "22 %"]) expect(texto, t).toContain(t);
  });

  test("el gráfico tiene su tabla: NetX de la agrovoltaica y 'no tiene' en Notas Verdes del viñedo", async ({ page }) => {
    await page.goto("/netx");
    await page.getByText("Ver como tabla").click();
    const tabla = page.getByRole("table", { name: /¿Adónde va lo que paga cada serie\?/ });
    await expect(tabla).toBeVisible();
    await expect(tabla.getByRole("row", { name: /^NetX/ })).toContainText("USD 800.000");
    await expect(tabla.getByRole("row", { name: /Notas Verdes/ })).toContainText("no tiene");
  });

  test("lo que tiene que ser cierto: cuatro números incómodos, cada uno con su palanca", async ({ page }) => {
    await page.goto("/netx");
    const seccion = page.getByRole("region", { name: "Lo que tiene que ser cierto" });
    const texto = await seccion.innerText();
    for (const t of ["USD 24,8 M", "USD 37,2 M", "1,7 %", "10,2 %", "60 %", "61 %", "sin dato (a cotizar)"]) {
      expect(texto, t).toContain(t);
    }
    await expect(seccion.getByText("Palanca:")).toHaveCount(4);
    await expect(seccion.getByText("para discutir, no es una decisión")).toHaveCount(4);
  });

  test("lotes: la Ordenanza 173 se abre con el teclado, y hay marca de Vagner, fuentes y Ostrom", async ({ page }) => {
    await page.goto("/netx");
    const boton = page.getByRole("button", { name: /Qué significa legalmente: Ordenanza 173/ }).first();
    await boton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("tooltip")).toContainText("A verificar con abogado");
    const texto = await textoMain(page);
    expect(texto).toContain("a confirmar con Vagner");
    expect(texto).toContain("v0.1");
    expect(texto).toContain("Elinor Ostrom");
  });

  test("a 390 px no hay desborde horizontal en las tres pestañas", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const ruta of ["/netx", "/netx/simulador", "/netx/comunidad"]) {
      await page.goto(ruta);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const ancho = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(ancho, ruta).toBeLessThanOrEqual(390);
    }
  });

  test("no hace pedidos a /api más allá de los del layout", async ({ page }) => {
    const pedidos: string[] = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (u.pathname.startsWith("/api/")) pedidos.push(u.pathname);
    });
    await page.goto("/netx");
    await expect(page.getByRole("heading", { level: 1, name: "¿Cómo se financia NetX sin vender lotes?" })).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(pedidos.filter((p) => p !== "/api/sesion")).toEqual([]);
  });
});
