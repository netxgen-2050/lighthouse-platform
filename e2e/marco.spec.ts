import { expect, test } from "./fixtura";

test("navegar de la portada a Tribus marca aria-current", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");
  await nav.getByRole("link", { name: "Tribus" }).click();
  await expect(page).toHaveURL(/\/tribus$/);
  await expect(nav.getByRole("link", { name: "Tribus" })).toHaveAttribute("aria-current", "page");
});

test("en una tribu, Tribus sigue marcado", async ({ page }) => {
  await page.goto("/tribus/valle");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Tribus" })).toHaveAttribute("aria-current", "page");
});

test("el rail trae solo la navegación, en orden", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav).toBeVisible();
  const textos = (await nav.getByRole("link").allInnerTexts()).map((t) => t.trim().split("\n")[0]);
  // "Admin" va al final, en el grupo "Interno", y solo lo ve el super admin (el rol por defecto de estas pruebas).
  const orden = ["Inicio", "Territorio", "Tribus", "Pactos", "Semillas", "Fogón", "Congreso", "Sumarte", "Admin"];
  expect(textos).toEqual(orden.filter((o) => textos.includes(o)));
  // Compromisos está en pausa (27-oct-2026): no aparece en el rail.
  await expect(nav.getByRole("link", { name: "Compromisos" })).toHaveCount(0);
  expect(textos).toEqual(expect.arrayContaining(["Inicio", "Tribus", "Congreso", "Sumarte"]));
  // Perfil, Pasaporte, Mi recorrido y Configuración viven en el menú del avatar; NetX y la campanita, en la barra superior.
  await expect(nav.getByRole("link", { name: "Perfil" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "NetX" })).toHaveCount(0);
  await expect(nav.locator('a[href="/bandeja"]')).toHaveCount(0);
  await expect(nav.getByRole("button")).toHaveCount(0);
});

test("la barra superior está arriba a la derecha con NetX (interno), la campanita y el avatar", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const barra = page.getByRole("banner");
  await expect(barra).toBeVisible();
  const caja = (await barra.boundingBox())!;
  expect(caja.y).toBe(0);
  const netx = barra.getByRole("link", { name: /NetX/ });
  await expect(netx).toHaveAttribute("href", "/netx");
  await expect(netx).toContainText("Interno");
  const campanita = barra.locator('a[href="/bandeja"]');
  const avatar = barra.getByRole("button", { name: "Menú de la persona" });
  const idioma = barra.getByRole("group", { name: "Idioma · Language" });
  const [a, b, i, c] = await Promise.all([netx.boundingBox(), campanita.boundingBox(), idioma.boundingBox(), avatar.boundingBox()]);
  // De izquierda a derecha: NetX, campanita, selector de idioma, avatar; el avatar queda contra el borde derecho.
  expect(a!.x).toBeLessThan(b!.x);
  expect(b!.x).toBeLessThan(i!.x);
  expect(i!.x).toBeLessThan(c!.x);
  expect(c!.x + c!.width).toBeGreaterThan(1280 - 40);
  await expect(page.locator("main")).toHaveCount(1);
});

test("la barra superior queda fija al bajar la página", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.goto("/pactos");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const caja = (await page.getByRole("banner").boundingBox())!;
  expect(caja.y).toBe(0);
});

test("celular 390 x 844: la barra superior muestra NetX, la campanita, el selector de idioma y el avatar sin desbordar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const ruta of ["/", "/configuracion", "/sumarte"]) {
    await page.goto(ruta);
    const barra = page.getByRole("banner");
    await expect(barra.getByRole("link", { name: /NetX/ })).toBeVisible();
    await expect(barra.locator('a[href="/bandeja"]')).toBeVisible();
    await expect(barra.getByRole("group", { name: "Idioma · Language" })).toBeVisible();
    await expect(barra.getByRole("button", { name: "Menú de la persona" })).toBeVisible();
    const caja = (await barra.boundingBox())!;
    expect(caja.height).toBeLessThanOrEqual(56);
    expect(caja.x + caja.width).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), `scroll horizontal en ${ruta}`).toBe(false);
  }
});

test("el rail muestra los grupos Descubrir y Participar en la computadora", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByText("Descubrir", { exact: true })).toBeVisible();
  await expect(nav.getByText("Participar", { exact: true })).toBeVisible();
  await expect(nav.getByRole("list", { name: "Descubrir" }).getByRole("link")).toHaveCount(3);
  await expect(nav.getByRole("list", { name: "Participar" }).getByRole("link")).toHaveCount(4);
  await expect(nav.getByRole("link", { name: "Compromisos" })).toHaveCount(0);
});

test("menú de la persona: se abre con Enter, trae Perfil, Pasaporte, Mi recorrido y Configuración, y Escape lo cierra", async ({ page }) => {
  await page.goto("/");
  const avatar = page.getByRole("button", { name: "Menú de la persona" });
  await avatar.focus();
  await page.keyboard.press("Enter");
  const menu = page.locator("#menu-persona");
  await expect(menu.getByRole("link", { name: "Perfil" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Pasaporte" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Mi recorrido" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Configuración" })).toBeVisible();
  await expect(menu.getByRole("button", { name: "Salir" })).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(avatar).toBeFocused();
});

test("en /pasaporte el avatar se marca como actual y el menú lleva a Mi recorrido", async ({ page }) => {
  await page.goto("/pasaporte");
  const avatar = page.getByRole("button", { name: "Menú de la persona" });
  await expect(avatar).toHaveAttribute("aria-current", "page");
  await avatar.click();
  await expect(page.locator("#menu-persona").getByRole("link", { name: "Pasaporte" })).toHaveAttribute("aria-current", "page");
  await page.locator("#menu-persona").getByRole("link", { name: "Mi recorrido" }).click();
  await expect(page).toHaveURL(/\/panel$/);
  await expect(page.locator("#menu-persona")).toHaveCount(0);
});

test("en /configuracion el avatar se marca como actual y Configuración también en el menú", async ({ page }) => {
  await page.goto("/configuracion");
  const avatar = page.getByRole("button", { name: "Menú de la persona" });
  await expect(avatar).toHaveAttribute("aria-current", "page");
  await avatar.click();
  await expect(page.locator("#menu-persona").getByRole("link", { name: "Configuración" })).toHaveAttribute("aria-current", "page");
});

test("el avatar muestra las iniciales del perfil guardado", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("lh-perfil", JSON.stringify({ nombre: "Ana Pérez", roles: [] })));
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Menú de la persona" })).toContainText("AP");
});

test("en la portada el avatar no está marcado como actual", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Menú de la persona" })).not.toHaveAttribute("aria-current", "page");
});

test("celular: el menú de la persona cabe en pantalla y no hay scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menú de la persona" }).click();
  const caja = (await page.locator("#menu-persona").boundingBox())!;
  expect(caja.x + caja.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});

test("el rail está a la izquierda en computadora", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const caja = await page.getByRole("navigation", { name: "Principal" }).boundingBox();
  expect(caja!.x).toBe(0);
  expect(caja!.width).toBeLessThanOrEqual(80);
});

test("celular 390 x 844: rail a la izquierda, 72 px o menos, sin scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const ruta of ["/", "/tribus", "/tribus/valle", "/perfil", "/congreso"]) {
    await page.goto(ruta);
    const nav = page.getByRole("navigation", { name: "Principal" });
    const caja = await nav.boundingBox();
    expect(caja!.x).toBe(0);
    expect(caja!.width).toBeLessThanOrEqual(72);
    await expect(nav.getByRole("link", { name: "Inicio" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Compromisos" })).toHaveCount(0);
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(desborde, `scroll horizontal en ${ruta}`).toBe(false);
  }
});

test("Tab: primero Saltar al contenido y después Inicio en el rail; justo después del rail van NetX, la campanita, el selector de idioma y el avatar",async ({ page }) => {
  await page.goto("/");
  // La barra superior aparece cuando termina de verificarse la sesión: se espera antes de recorrer con Tab.
  await expect(page.getByRole("button", { name: "Menú de la persona" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
  await page.keyboard.press("Tab");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Inicio" })).toBeFocused();
  // Se llega con Tab hasta el último enlace del rail (Admin, solo para el super admin, después de Sumarte); justo después
  // va NetX, la campanita y luego el avatar.
  const admin = nav.getByRole("link", { name: /^Admin/ });
  for (let i = 0; i < 20 && !(await admin.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expect(admin).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("banner").getByRole("link", { name: /NetX/ })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator('a[href="/bandeja"]')).toBeFocused();
  // Después de la campanita va el selector de idioma (ES, EN) y recién después el avatar.
  const selector = page.getByRole("group", { name: "Idioma · Language" });
  await page.keyboard.press("Tab");
  await expect(selector.getByRole("link", { name: "ES · Español" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(selector.getByRole("link", { name: "EN · English" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Menú de la persona" })).toBeFocused();
});

test("menú de la persona: se cierra cuando el foco sale del menú con Tab", async ({ page }) => {
  await page.goto("/");
  const avatar = page.getByRole("button", { name: "Menú de la persona" });
  await avatar.focus();
  await page.keyboard.press("Enter");
  const menu = page.locator("#menu-persona");
  await expect(menu).toBeVisible();
  // Mientras el foco recorre los enlaces del menú, este sigue abierto.
  for (const nombre of ["Perfil", "Pasaporte", "Mi recorrido", "Configuración", "Mis datos"]) {
    await page.keyboard.press("Tab");
    await expect(menu.getByRole("link", { name: nombre })).toBeFocused();
    await expect(menu).toBeVisible();
  }
  await page.keyboard.press("Tab");
  await expect(menu.getByRole("button", { name: "Salir" })).toBeFocused();
  // Recién cuando el foco sale después de Salir (lo último del menú), se cierra.
  await page.keyboard.press("Tab");
  await expect(menu).toHaveCount(0);
});

for (const ruta of ["/", "/tribus", "/tribus/valle"]) {
  test(`saltar al contenido es el primer foco y mueve el foco al main en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    await page.keyboard.press("Tab");
    const salto = page.getByRole("link", { name: "Saltar al contenido" });
    await expect(salto).toBeFocused();
    await expect(salto).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
  });
}

test("las fuentes del mock-up se aplican (texto y títulos)", async ({ page }) => {
  await page.goto("/tribus");
  const familia = (selector: string) =>
    page.locator(selector).first().evaluate((el) => getComputedStyle(el).fontFamily);
  expect(await familia("body")).toContain("Figtree");
  expect(await familia("h1")).toContain("Anek Latin");
});

for (const ruta of ["/", "/tribus", "/tribus/grano"]) {
  test(`pie visible en ${ruta}`, async ({ page }) => {
    await page.goto(ruta);
    const pie = page.getByRole("contentinfo");
    await expect(pie).toContainText("Prototipo en desarrollo. Datos de ejemplo.");
    // El año lo resuelve el navegador; se compara en el navegador para no depender del reloj del runner.
    const anio = await page.evaluate(() => String(new Date().getFullYear()));
    await expect(pie).toContainText(anio);
  });
}

test("el HTML del servidor ya trae un año en el pie (sin JS)", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toMatch(/©(?:<!-- -->)? ?(?:<!-- -->)?\d{4}/);
});

test("portada con titular y botón a /tribus", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Encontrá tu tribu\.\s*Construí en común\./);
  await page.getByRole("link", { name: "Ver las tribus" }).click();
  await expect(page).toHaveURL(/\/tribus$/);
});
