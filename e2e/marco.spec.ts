import { expect, test } from "./fixtura";

test("en la portada Inicio está marcado y Explorar no", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Explorar" })).not.toHaveAttribute("aria-current", "page");
  // Ninguna página muestra la subnavegación de Explorar (Territorio, Barrios, Lotes, Comunidades).
  await expect(page.getByRole("navigation", { name: "Explorar", exact: true })).toHaveCount(0);
});

test("Comunidades ya no es de Explorar: /participa, /tribus (redirige) y las fichas /tribus/[id] marcan Participa", async ({ page }) => {
  const nav = page.getByRole("navigation", { name: "Principal" });
  for (const ruta of ["/participa", "/tribus", "/tribus/valle"]) {
    await page.goto(ruta);
    await expect(nav.locator('[aria-current="page"]'), ruta).toHaveCount(1);
    await expect(nav.getByRole("link", { name: "Participa" }), ruta).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("navigation", { name: "Explorar", exact: true }), ruta).toHaveCount(0);
  }
});

test("el rail trae los destinos principales que existen, en orden y sin títulos de grupo", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav).toBeVisible();
  const textos = (await nav.getByRole("link").allInnerTexts()).map((t) => t.trim().split("\n")[0]);
  // "Admin" va al final y solo lo ve el super admin (el rol por defecto de estas pruebas). Invertir y Mi tierra aparecen
  // cuando existan sus páginas (cambios 5 y 4 del rediseño).
  // Participa aparece cuando exista su página (cambio `participa-mapa-equipos`).
  const orden = ["Inicio", "Explorar", "Participa", "Bien común", "Invertir", "Sumarte", "Mi tierra", "Admin"];
  expect(textos).toEqual(orden.filter((o) => textos.includes(o)));
  expect(textos).toEqual(expect.arrayContaining(["Inicio", "Explorar", "Bien común", "Sumarte"]));
  // Pactos, Semillas, Fogón, Compromisos y Congreso están fuera del menú.
  for (const nombre of ["Pactos", "Semillas", "Fogón", "Compromisos", "Congreso", "Comunidades", "Territorio", "Lotes"]) {
    await expect(nav.getByRole("link", { name: nombre, exact: true })).toHaveCount(0);
  }
  await expect(nav.getByText("Descubrir", { exact: true })).toHaveCount(0);
  await expect(nav.getByText("Lo que viene", { exact: true })).toHaveCount(0);
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
  // La cinta de prototipo va arriba de la barra, las dos fijas (design §4).
  const cinta = (await page.locator("[data-cinta-prototipo]").boundingBox())!;
  expect(cinta.y).toBe(0);
  expect(caja.y).toBe(cinta.height);
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
  const cinta = (await page.locator("[data-cinta-prototipo]").boundingBox())!;
  expect(cinta.y).toBe(0);
  const caja = (await page.getByRole("banner").boundingBox())!;
  expect(caja.y).toBe(cinta.height);
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

test("Explorar queda marcado en lotes y no hay destino marcado en las páginas en pausa", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const nav = page.getByRole("navigation", { name: "Principal" });
  await page.goto("/lotes/hibrido");
  await expect(nav.getByRole("link", { name: "Explorar" })).toHaveAttribute("aria-current", "page");
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(1);
  await page.goto("/fogon");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(nav.locator('[aria-current="page"]')).toHaveCount(0);
});

test("en inglés el rail marca Home en la portada y Explore en /explorar", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "lh-idioma", value: "en", url: baseURL! }]);
  await page.setViewportSize({ width: 1280, height: 800 });
  const nav = page.getByRole("navigation", { name: "Main" });
  await page.goto("/");
  await expect(nav.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  await page.goto("/explorar");
  await expect(nav.getByRole("link", { name: "Explore" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current", "page");
});

test("sin subnavegación: ni /explorar ni /tribus desbordan a 390 px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const ruta of ["/explorar", "/tribus"]) {
    await page.goto(ruta);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), ruta).toBe(false);
  }
});

test("ningún enlace a los cinco módulos en pausa en el rail, el menú del celular ni el avatar", async ({ page }) => {
  const pausa = ["Pactos", "Semillas", "Fogón", "Compromisos", "Congreso"];
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const rail = page.getByRole("navigation", { name: "Principal" });
  for (const n of pausa) await expect(rail.getByRole("link", { name: n })).toHaveCount(0);
  await page.getByRole("button", { name: "Menú de la persona" }).click();
  for (const n of pausa) await expect(page.locator("#menu-persona").getByRole("link", { name: n })).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menú", exact: true }).click();
  for (const n of pausa) await expect(page.locator("#menu-celular").getByRole("link", { name: n })).toHaveCount(0);
});

test("celular 390 x 844: el rail se oculta y el botón Menú abre los destinos; elegir uno cierra el panel", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const boton = page.getByRole("button", { name: "Menú", exact: true });
  await expect(boton).toBeVisible();
  await expect(boton).toHaveAttribute("aria-expanded", "false");
  expect((await boton.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await boton.click();
  await expect(boton).toHaveAttribute("aria-expanded", "true");
  const panel = page.locator("#menu-celular");
  await expect(panel.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");
  await expect(panel.getByRole("link", { name: "Bien común" })).toBeVisible();
  await panel.getByRole("link", { name: "Sumarte" }).click();
  await expect(page).toHaveURL(/\/sumarte$/);
  await expect(page.locator("#menu-celular")).toHaveCount(0);
  await expect(boton).toHaveAttribute("aria-expanded", "false");
});

test("celular: elegir el destino donde ya estás también cierra el panel", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const boton = page.getByRole("button", { name: "Menú", exact: true });
  for (const [ruta, destino] of [["/", "Inicio"], ["/sumarte", "Sumarte"]]) {
    await page.goto(ruta);
    await boton.click();
    await expect(boton).toHaveAttribute("aria-expanded", "true");
    await page.locator("#menu-celular").getByRole("link", { name: destino }).click();
    await expect(page.locator("#menu-celular")).toHaveCount(0);
    await expect(boton).toHaveAttribute("aria-expanded", "false");
  }
});

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("celular 390 px: la barra muestra Menú, el selector de idioma, Sumarte y Entrar sin desbordar", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const barra = page.getByRole("banner");
    await expect(barra.getByRole("button", { name: "Menú", exact: true })).toBeVisible();
    await expect(barra.getByRole("group", { name: "Idioma · Language" })).toBeVisible();
    await expect(barra.getByRole("link", { name: "Sumarte" })).toBeVisible();
    await expect(barra.getByRole("button", { name: "Entrar" })).toBeVisible();
    const caja = (await barra.boundingBox())!;
    expect(caja.x + caja.width).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
    // Los destinos del panel están habilitados sin sesión.
    await barra.getByRole("button", { name: "Menú", exact: true }).click();
    await expect(page.locator("#menu-celular").getByRole("link")).toHaveText(["Inicio", "Explorar", "Participa", "Bien común", "Invertir", "Sumarte", "Mi tierra"]);
  });
});

test("celular: Escape cierra el menú y el foco vuelve al botón; tocar el botón otra vez también lo cierra", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const boton = page.getByRole("button", { name: "Menú", exact: true });
  await boton.click();
  await expect(page.locator("#menu-celular")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator("#menu-celular").getByRole("link", { name: "Inicio" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#menu-celular")).toHaveCount(0);
  await expect(boton).toBeFocused();
  await boton.click();
  await boton.click();
  await expect(page.locator("#menu-celular")).toHaveCount(0);
});

test("celular en inglés: el botón dice Menu y el panel Explore, Commons, Join", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "lh-idioma", value: "en", url: baseURL! }]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  const panel = page.locator("#menu-celular");
  for (const n of ["Home", "Explore", "Commons", "Join"]) await expect(panel.getByRole("link", { name: n })).toBeVisible();
});

test("computadora 1280 px: no hay botón Menú y el rail está a la izquierda; 768 px ya muestra el rail", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Menú", exact: true })).toBeHidden();
  const rail = (await page.getByRole("navigation", { name: "Principal" }).boundingBox())!;
  expect(rail.x).toBe(0);
  expect(rail.width).toBeLessThanOrEqual(88);
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(page.getByRole("navigation", { name: "Principal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Menú", exact: true })).toBeHidden();
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
  expect(caja!.width).toBeLessThanOrEqual(88);
});

test("celular 390 x 844: sin rail, sin scroll horizontal en ninguna página del menú ni en las pausadas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const ruta of ["/", "/tribus", "/tribus/valle", "/bien-comun", "/sumarte", "/perfil", "/congreso"]) {
    await page.goto(ruta);
    await expect(page.getByRole("navigation", { name: "Principal" })).toHaveCount(0);
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(desborde, `scroll horizontal en ${ruta}`).toBe(false);
  }
});

test("Tab en 390 px: Saltar al contenido, el botón Menú y después NetX", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Menú de la persona" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Menú", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("banner").getByRole("link", { name: /NetX/ })).toBeFocused();
});

test("Tab: primero Saltar al contenido y después Inicio en el rail; justo después del rail van NetX, la campanita, el selector de idioma y el avatar",async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
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
  // El menú trae sus enlaces cuando el servidor confirma el consentimiento (antes solo ofrece Salir): se espera a que estén.
  await expect(menu.getByRole("link", { name: "Mis datos" })).toBeVisible();
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
  await page.goto("/lotes");
  const familia = (selector: string) =>
    page.locator(selector).first().evaluate((el) => getComputedStyle(el).fontFamily);
  expect(await familia("h1")).toContain("Fraunces");
  expect(await familia("main p")).toContain("Inter Tight");
});

test("la tabla tipo libro no genera scroll horizontal de la página a 390 x 844", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/lotes");
  // El componente aún no está en ninguna página: se inyecta con su mismo marcado y clases (components/ui/tabla-libro.tsx).
  await page.evaluate(() => {
    const celda = "px-3 py-2";
    const filas = Array.from({ length: 3 }, (_, i) =>
      `<tr class="border-t border-line align-top"><td class="whitespace-nowrap ${celda} font-mono text-muted">2026-11-0${i + 1}</td><td class="${celda} text-ink">Cuota de ejemplo con un motivo bastante largo para que se tenga que partir en líneas</td><td class="whitespace-nowrap ${celda} text-right font-mono text-ink">USD 1.500.000</td></tr>`,
    ).join("");
    document.querySelector("main")!.insertAdjacentHTML(
      "beforeend",
      `<div class="max-w-full overflow-x-auto rounded-lg border border-line"><table class="w-full border-collapse text-sm"><caption>Movimientos</caption><thead><tr><th scope="col">Fecha</th><th scope="col">Motivo</th><th scope="col">Monto</th></tr></thead><tbody>${filas}</tbody></table></div>`,
    );
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
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

test("pie pegado abajo en una página corta (celular, /invertir sin sesión)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/invertir");
  const pie = page.getByRole("contentinfo");
  await expect(pie).toBeVisible();
  const medidas = await page.evaluate(() => ({
    alto: document.documentElement.scrollHeight,
    pantalla: window.innerHeight,
    pieAbajo: document.querySelector("footer")!.getBoundingClientRect().bottom + window.scrollY,
  }));
  expect(medidas.alto).toBeGreaterThanOrEqual(medidas.pantalla);
  expect(medidas.alto - medidas.pieAbajo).toBeLessThanOrEqual(8);
});

test("el HTML del servidor ya trae un año en el pie (sin JS)", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toMatch(/©(?:<!-- -->)? ?(?:<!-- -->)?\d{4}/);
});

test("portada con titular y botón a /participa", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Regenerar desde el agua\.\s*Una promesa a 2030\./);
  await page.getByRole("link", { name: "Ver las comunidades" }).click();
  await expect(page).toHaveURL(/\/participa$/);
});

test("ninguna página se deja indexar: noindex, nofollow y sin pedir sesión", async ({ page }) => {
  for (const ruta of ["/", "/sumarte", "/territorios/lighthouse", "/lotes", "/lotes/lote-1", "/congreso"]) {
    const r = await page.goto(ruta);
    expect(r?.status(), ruta).toBe(200);
    await expect(page.locator('meta[name="robots"]'), ruta).toHaveAttribute("content", "noindex, nofollow");
  }
});
