import { expect, test } from "./fixtura";

// Explorar (explorar-paginas): Territorio, Barrio Norte y Lotes, cada una en su página, con el héroe y las pestañas comunes.
// Los totales por estado y la obra ya los prueba e2e/barrio-norte.spec.ts; acá va lo propio de las tres páginas.

const PAGINAS = [
  { ruta: "/explorar/territorio", pestana: "Territorio", h2: "Territorio" },
  { ruta: "/explorar/barrio-norte", pestana: "Barrio Norte", h2: "Barrio Norte" },
  { ruta: "/explorar/lotes", pestana: "Lotes", h2: "Lotes" },
] as const;

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  for (const p of PAGINAS) {
    test(`${p.ruta}: héroe con sello y solo su sección`, async ({ page }) => {
      await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
      const r = await page.goto(p.ruta);
      expect(r?.status()).toBe(200);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1, name: "Explorar Lighthouse" })).toBeVisible();
      await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
      await expect(page.getByText("venta simulada · aprobación municipal pendiente")).toBeVisible();
      await expect(page.getByText("Imagen ilustrativa", { exact: true })).toBeVisible();
      await expect(page.locator('img[src*="lighthouse-valle"]')).toHaveCount(1);
      // Solo el h2 de su sección, no los de las otras dos.
      const h2 = await page.locator("main").getByRole("heading", { level: 2 }).allTextContents();
      expect(h2.filter((t) => PAGINAS.some((o) => o.h2 === t))).toEqual([p.h2]);
      await expect(page).toHaveTitle(new RegExp(`${p.pestana} · Explorar`));
    });
  }

  test("Territorio: mapa y estado administrativo; Barrio Norte: sin montos de la obra; Lotes: lista sin mapa", async ({ page }) => {
    await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
    await page.goto("/explorar/territorio");
    await expect(page.getByRole("region", { name: "Estado administrativo · Lighthouse VRN" })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/aprobación municipal:\s*(otorgada|aprobada)/i);
    await page.goto("/explorar/barrio-norte");
    await expect(page.getByText("Los números de la obra se ven con una cuenta.")).toBeVisible();
    await page.goto("/explorar/lotes");
    await expect(page.getByRole("complementary", { name: "Ficha del territorio" })).toHaveCount(0);
  });

  test("el menú marca Explorar y no Inicio en las tres páginas", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const p of PAGINAS) {
      await page.goto(p.ruta);
      const rail = page.getByRole("navigation", { name: "Principal" });
      await expect(rail.getByRole("link", { name: "Explorar" })).toHaveAttribute("aria-current", "page");
      await expect(rail.getByRole("link", { name: "Inicio" })).not.toHaveAttribute("aria-current", "page");
      await expect(page.getByRole("navigation", { name: "Comunidades" })).toHaveCount(0);
    }
  });

  test("tocar Explorar en el menú abre Territorio, directo y con Explorar marcado", async ({ page }) => {
    await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const rail = page.getByRole("navigation", { name: "Principal" });
    await expect(rail.getByRole("link", { name: "Explorar" })).toHaveAttribute("href", "/explorar/territorio");
    await rail.getByRole("link", { name: "Explorar" }).click();
    await expect(page).toHaveURL(/\/explorar\/territorio$/);
    await expect(page.getByRole("heading", { level: 2, name: "Territorio" })).toBeVisible();
    await expect(rail.getByRole("link", { name: "Explorar" })).toHaveAttribute("aria-current", "page");
  });

  test("las pestañas navegan entre páginas y marcan la actual", async ({ page }) => {
    await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
    await page.goto("/explorar/territorio");
    const barra = page.getByRole("navigation", { name: "Secciones de Explorar" });
    await expect(barra.getByRole("link")).toHaveText(["Territorio", "Barrio Norte", "Lotes"]);
    for (const nombre of ["Territorio", "Barrio Norte", "Lotes"]) {
      const caja = await barra.getByRole("link", { name: nombre }).boundingBox();
      expect(caja?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
    await expect(barra.getByRole("link", { name: "Territorio" })).toHaveAttribute("aria-current", "page");
    await barra.getByRole("link", { name: "Lotes" }).click();
    await expect(page).toHaveURL(/\/explorar\/lotes$/);
    await expect(barra.getByRole("link", { name: "Lotes" })).toHaveAttribute("aria-current", "page");
    await expect(barra.getByRole("link", { name: "Territorio" })).not.toHaveAttribute("aria-current", "page");
    await barra.getByRole("link", { name: "Barrio Norte" }).click();
    await expect(page).toHaveURL(/\/explorar\/barrio-norte$/);
    await expect(barra.getByRole("link", { name: "Barrio Norte" })).toHaveAttribute("aria-current", "page");
    // La barra queda pegada al bajar (en Territorio, la página más larga).
    await barra.getByRole("link", { name: "Territorio" }).click();
    await expect(page).toHaveURL(/\/explorar\/territorio$/);
    await page.evaluate(() => window.scrollTo(0, 900));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(400);
    const arriba = await barra.evaluate((el) => el.getBoundingClientRect().top);
    expect(arriba).toBeLessThan(60);
  });

  test("/explorar lleva a Territorio y /explorar#lotes a Lotes", async ({ page }) => {
    await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
    await page.goto("/explorar");
    await expect(page).toHaveURL(/\/explorar\/territorio$/);
    await page.goto("/explorar#lotes");
    await expect(page).toHaveURL(/\/explorar\/lotes$/);
    await page.goto("/explorar#barrio");
    await expect(page).toHaveURL(/\/explorar\/barrio-norte$/);
    await page.goto("/explorar#otra");
    await expect(page).toHaveURL(/\/explorar\/territorio$/);
    await page.goto("/explorar?vista=ahora&sel=barrio-6");
    await expect(page).toHaveURL(/\/explorar\/territorio\?vista=ahora&sel=barrio-6$/);
  });

  test("la lista de lotes enlaza cada ficha", async ({ page }) => {
    await page.goto("/explorar/lotes");
    const primero = page.getByRole("link", { name: /^Lote \d+/ }).first();
    await expect(primero).toHaveAttribute("href", /^\/lotes\/lote-/);
    await expect(page.getByRole("link", { name: "Ver qué es tuyo y qué es de todos" })).toHaveAttribute("href", "/lotes/hibrido");
  });

  test("Barrio Norte enlaza a la lista de lotes sin ancla", async ({ page }) => {
    await page.goto("/explorar/barrio-norte");
    await expect(page.getByRole("link", { name: "Ver los lotes" })).toHaveAttribute("href", "/explorar/lotes");
  });

  test("las URL viejas redirigen a la página nueva con los parámetros del mapa", async ({ page }) => {
    await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
    await page.goto("/territorios/lighthouse?vista=ahora&sel=barrio-6");
    await expect(page).toHaveURL(/\/explorar\/territorio\?vista=ahora&sel=barrio-6$/);
    await expect(page.getByRole("button", { name: /Ahora/ })).toHaveAttribute("aria-pressed", "true");
    // La selección llega: el barrio queda marcado en la lista y su ficha abre en el panel lateral (en la vista Visión hay barrios elegibles).
    await page.goto("/territorios/lighthouse?vista=vision&sel=barrio-6");
    await expect(page).toHaveURL(/\/explorar\/territorio\?vista=vision&sel=barrio-6$/);
    await expect(page.getByRole("button", { name: /^Barrio 6/, pressed: true })).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Ficha del territorio" }).getByRole("heading", { level: 3, name: "Valle Solar" })).toBeVisible();
    // La fase también viaja en la redirección.
    await page.goto("/territorios/lighthouse?fase=1");
    await expect(page).toHaveURL(/\/explorar\/territorio\?fase=1$/);
    await expect(page.getByRole("radio", { name: /^Fase 1/ })).toBeChecked();
    await page.goto("/barrios/norte");
    await expect(page).toHaveURL(/\/explorar\/barrio-norte$/);
    await page.goto("/lotes");
    await expect(page).toHaveURL(/\/explorar\/lotes$/);
  });

  test("/lotes/hibrido y las fichas no redirigen y marcan Explorar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/lotes/hibrido");
    await expect(page).toHaveURL(/\/lotes\/hibrido$/);
    const rail = page.getByRole("navigation", { name: "Principal" });
    await expect(rail.getByRole("link", { name: "Explorar" })).toHaveAttribute("aria-current", "page");
    await expect(rail.getByRole("link", { name: "Inicio" })).not.toHaveAttribute("aria-current", "page");
  });

  test("a 390 px no hay scroll horizontal en ninguna de las tres", async ({ page }) => {
    await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
    await page.setViewportSize({ width: 390, height: 844 });
    for (const p of PAGINAS) {
      await page.goto(p.ruta);
      await expect(page.getByRole("heading", { level: 1, name: "Explorar Lighthouse" })).toBeVisible();
      const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(sobra, p.ruta).toBeLessThanOrEqual(0);
    }
  });

  test("en inglés se ve en inglés", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "lh-idioma", value: "en", url: baseURL! }]);
    await page.goto("/explorar/lotes");
    await expect(page.getByRole("heading", { level: 1, name: "Explore Lighthouse" })).toBeVisible();
    const barra = page.getByRole("navigation", { name: "Explore sections" });
    await expect(barra.getByRole("link")).toHaveText(["Territory", "Barrio Norte", "Lots"]);
    await expect(page).toHaveTitle(/Lots · Explore/);
    await expect(page.getByText("This page is only available in Spanish for now.")).toHaveCount(0);
  });
});

// ux-explorar: lista y mapa de lotes, filtro, hoja del celular y Territorio sin lista repetida.
test.describe("lista y mapa de lotes (ux-explorar)", () => {
  test.use({ rol: "ninguno" });

  test("filtrar Reservado deja solo lotes reservados y lo escribe en la URL", async ({ page }) => {
    await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/explorar/lotes");
    const tarjetas = page.locator("article[data-lote]");
    expect(await tarjetas.count()).toBeGreaterThan(5);
    await page.getByRole("button", { name: "Reservado", exact: true }).click();
    await expect(page).toHaveURL(/estado=reservado/);
    const n = await tarjetas.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) await expect(tarjetas.nth(i)).toContainText("Reservado");
  });

  test("elegir una tarjeta la marca y escribe sel en la URL", async ({ page }) => {
    await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/explorar/lotes");
    const tarjeta = page.locator("article[data-lote]").first();
    const id = await tarjeta.getAttribute("data-lote");
    await tarjeta.getByRole("link").focus();
    await expect(tarjeta).toHaveAttribute("aria-current", "true");
    await expect(page).toHaveURL(new RegExp(`sel=${id}`));
    await expect(page.getByRole("group", { name: "Lote elegido" }).getByRole("link", { name: "Ver el lote" })).toBeVisible();
  });

  test("el estado administrativo va antes del mapa en el orden del documento", async ({ page }) => {
    await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explorar/lotes");
    await expect(page.locator(".mapa-leaflet")).toBeVisible();
    const antes = await page.evaluate(() => {
      const legal = document.querySelector('[aria-label^="Estado administrativo"]');
      const mapa = document.querySelector(".mapa-leaflet");
      return !!legal && !!mapa && !!(legal.compareDocumentPosition(mapa) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(antes).toBe(true);
  });

  test("a 390 px, Ver lista abre la hoja con las tarjetas", async ({ page }) => {
    await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explorar/lotes");
    const boton = page.getByRole("button", { name: "Ver lista" });
    await expect(boton).toBeVisible();
    await boton.click();
    await expect(page.getByRole("button", { name: "Ver mapa" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("button", { name: "Subir o bajar la lista de lotes" })).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("article[data-lote]").first()).toBeInViewport();
  });

  test("a 390 px la página de lotes ya no mide miles de píxeles (la lista va en la hoja)", async ({ page }) => {
    await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explorar/lotes");
    await expect(page.locator(".mapa-leaflet")).toBeVisible();
    const alto = await page.evaluate(() => document.documentElement.scrollHeight);
    console.log(`ALTO /explorar/lotes a 390 px: ${alto} px`);
    // Antes (auditoría del 25-nov, hallazgo H4) las tres secciones juntas medían 8.150 px.
    expect(alto).toBeLessThan(3000);
  });

  test("Territorio enlaza a los lotes y no repite la lista", async ({ page }) => {
    await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
    await page.goto("/explorar/territorio?vista=lotes");
    await expect(page.getByRole("link", { name: /^Ver los \d+ lotes$/ })).toHaveAttribute("href", "/explorar/lotes");
    await expect(page.getByRole("button", { name: /^Lote \d+ ·/ })).toHaveCount(0);
  });
});

test.describe("con sesión", () => {
  test("el panel de la obra aparece en /explorar/barrio-norte", async ({ page }) => {
    await page.goto("/explorar/barrio-norte");
    await expect(page.getByRole("heading", { level: 3, name: "La obra del barrio" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sumate para ver la obra" })).toHaveCount(0);
  });
});
