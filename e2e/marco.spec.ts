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
  expect(caja.y).toBeCloseTo(cinta.height, 1);
  const netx = barra.getByRole("link", { name: /NetX/ });
  await expect(netx).toHaveAttribute("href", "/netx");
  await expect(netx).toContainText("Interno");
  const campanita = barra.locator('a[href="/bandeja"]');
  const avatar = barra.getByRole("button", { name: "Menú de la persona" });
  const reportar = barra.getByRole("button", { name: "Reportar un problema o una idea" });
  // El idioma ya no es un control fijo de la barra: está en el menú del avatar.
  await expect(barra.getByRole("group", { name: "Idioma · Language" })).toHaveCount(0);
  const [a, r, b, c] = await Promise.all([netx.boundingBox(), reportar.boundingBox(), campanita.boundingBox(), avatar.boundingBox()]);
  // De izquierda a derecha: NetX, Reportar, campanita, avatar; el avatar queda contra el borde derecho.
  expect(a!.x).toBeLessThan(r!.x);
  expect(r!.x).toBeLessThan(b!.x);
  expect(b!.x).toBeLessThan(c!.x);
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
  expect(caja.y).toBeCloseTo(cinta.height, 1);
});

test("celular 390 x 844: la barra superior muestra la marca, la campanita y el avatar, sin idioma ni Menú, y sin desbordar", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const ruta of ["/", "/configuracion", "/sumarte"]) {
    await page.goto(ruta);
    const barra = page.getByRole("banner");
    await expect(barra.getByRole("link", { name: "Lighthouse" })).toHaveAttribute("href", "/");
    await expect(barra.getByRole("link", { name: /NetX/ })).toBeHidden();
    await expect(barra.getByRole("button", { name: "Reportar un problema o una idea" })).toBeHidden();
    await expect(barra.locator('a[href="/bandeja"]')).toBeVisible();
    await expect(barra.getByRole("group", { name: "Idioma · Language" })).toHaveCount(0);
    await expect(barra.getByRole("button", { name: "Menú", exact: true })).toHaveCount(0);
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
  await page.goto("/explorar/territorio");
  await expect(nav.getByRole("link", { name: "Explore" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Home" })).not.toHaveAttribute("aria-current", "page");
});

test("sin subnavegación: ni /explorar ni /tribus desbordan a 390 px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const ruta of ["/explorar/territorio", "/explorar/barrio-norte", "/explorar/lotes", "/tribus"]) {
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
  await page.getByRole("button", { name: "Más", exact: true }).click();
  const hoja = page.getByRole("dialog", { name: "Más" });
  await expect(hoja).toBeVisible();
  for (const n of pausa) await expect(hoja.getByRole("link", { name: n })).toHaveCount(0);
});

test("celular 390 x 844: la barra inferior trae los cinco destinos y Más; tocar Explorar lo marca como actual", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const barra = page.getByRole("navigation", { name: "Principal" });
  await expect(barra).toBeVisible();
  await expect(barra.getByRole("link")).toHaveText(["Inicio", "Explorar", "Participa", "Invertir", "Mi tierra"]);
  await expect(barra.getByRole("link", { name: "Inicio" })).toHaveAttribute("aria-current", "page");
  const caja = (await barra.boundingBox())!;
  expect(Math.abs(caja.y + caja.height - 844)).toBeLessThanOrEqual(1);
  for (const e of await barra.getByRole("link").all()) expect((await e.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  const mas = barra.getByRole("button", { name: "Más", exact: true });
  expect((await mas.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  await barra.getByRole("link", { name: "Explorar" }).click();
  await expect(page).toHaveURL(/\/explorar\/territorio$/);
  await expect(barra.getByRole("link", { name: "Explorar" })).toHaveAttribute("aria-current", "page");
  await expect(barra.locator('[aria-current="page"]')).toHaveCount(1);
});

test("celular: la hoja Más trae Bien común y Sumarte; elegir uno la cierra", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const mas = page.getByRole("button", { name: "Más", exact: true });
  await expect(mas).toHaveAttribute("aria-expanded", "false");
  await mas.click();
  const hoja = page.getByRole("dialog", { name: "Más" });
  await expect(hoja).toBeVisible();
  await expect(hoja.getByRole("link", { name: "Bien común" })).toBeVisible();
  await expect(hoja.getByRole("link", { name: "Perfil" })).toBeVisible();
  await expect(hoja.getByRole("button", { name: "Reportar un error" })).toBeVisible();
  await expect(hoja.getByRole("group", { name: "Idioma · Language" })).toBeVisible();
  await expect(hoja.getByRole("link", { name: /^Admin/ })).toBeVisible();
  await hoja.getByRole("link", { name: "Sumarte" }).click();
  await expect(page).toHaveURL(/\/sumarte$/);
  await expect(hoja).toHaveCount(0);
});

test("celular: elegir el destino donde ya estás también cierra la hoja", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Más", exact: true }).click();
  const hoja = page.getByRole("dialog", { name: "Más" });
  await hoja.getByRole("link", { name: "Sumarte" }).click();
  await expect(hoja).toHaveCount(0);
});

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("celular 390 px: la barra muestra la marca y Sumarte; Entrar, el idioma y Reportar están en Más", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const barra = page.getByRole("banner");
    await expect(barra.getByRole("link", { name: "Lighthouse" })).toBeVisible();
    await expect(barra.getByRole("link", { name: "Sumarte" })).toBeVisible();
    await expect(barra.getByRole("button", { name: "Entrar" })).toBeHidden();
    await expect(barra.getByRole("group", { name: "Idioma · Language" })).toHaveCount(0);
    const caja = (await barra.boundingBox())!;
    expect(caja.x + caja.width).toBeLessThanOrEqual(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
    await page.getByRole("button", { name: "Más", exact: true }).click();
    const hoja = page.getByRole("dialog", { name: "Más" });
    // Entrar arriba de todo, después Bien común y Sumarte, el idioma y Reportar un error.
    await expect(hoja.getByRole("button").nth(1)).toHaveText("Entrar");
    await expect(hoja.getByRole("link")).toHaveCount(4);
    for (const n of ["Bien común", "Sumarte", "ES · Español", "EN · English"]) await expect(hoja.getByRole("link", { name: n })).toBeVisible();
    await expect(hoja.getByRole("button", { name: "Reportar un error" })).toBeVisible();
  });

  test("computadora: sin sesión el idioma está en el menú ⋯ junto a Entrar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const barra = page.getByRole("banner");
    await expect(barra.getByRole("group", { name: "Idioma · Language" })).toHaveCount(0);
    await barra.getByRole("button", { name: "Más opciones" }).click();
    await expect(barra.getByRole("group", { name: "Idioma · Language" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(barra.getByRole("group", { name: "Idioma · Language" })).toHaveCount(0);
  });
});

test("celular: Escape cierra la hoja Más, el foco vuelve a Más y el foco queda atrapado adentro", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const boton = page.getByRole("button", { name: "Más", exact: true });
  await boton.click();
  const hoja = page.getByRole("dialog", { name: "Más" });
  await expect(hoja).toBeVisible();
  // El foco entra a la hoja y no sale de ella con Tab.
  expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(hoja).toHaveCount(0);
  await expect(boton).toBeFocused();
});

test("celular: la hoja Más se cierra al deslizar hacia abajo más de 80 px, y no con menos", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Más", exact: true }).click();
  const hoja = page.getByRole("dialog", { name: "Más" });
  // La hoja sube con una animación: se mide cuando ya llegó.
  await hoja.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  const caja = (await hoja.boundingBox())!;
  const x = caja.x + caja.width / 2;
  const y = caja.y + 10;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 40, { steps: 4 });
  await page.mouse.up();
  await expect(hoja).toBeVisible();
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + 120, { steps: 6 });
  await page.mouse.up();
  await expect(hoja).toHaveCount(0);
});

test("celular en inglés: la barra dice Home, Explore, Take part, Invest y More", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "lh-idioma", value: "en", url: baseURL! }]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const barra = page.getByRole("navigation", { name: "Main" });
  for (const n of ["Home", "Explore", "Take part", "Invest", "My land"]) await expect(barra.getByRole("link", { name: n })).toBeVisible();
  await barra.getByRole("button", { name: "More", exact: true }).click();
  const hoja = page.getByRole("dialog", { name: "More" });
  for (const n of ["Commons", "Join"]) await expect(hoja.getByRole("link", { name: n })).toBeVisible();
});

test("computadora 1280 px: no hay barra inferior ni botón Más y el rail está a la izquierda; 768 px ya muestra el rail", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Más", exact: true })).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Principal" })).toHaveCount(1);
  const rail = (await page.getByRole("navigation", { name: "Principal" }).boundingBox())!;
  expect(rail.x).toBe(0);
  expect(rail.width).toBeLessThanOrEqual(88);
  await page.setViewportSize({ width: 768, height: 900 });
  await expect(page.getByRole("navigation", { name: "Principal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Más", exact: true })).toBeHidden();
});

test("el avatar trae el selector de idioma y cambiar a English pasa el marco a inglés", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menú de la persona" }).click();
  await page.locator("#menu-persona").getByRole("group", { name: "Idioma · Language" }).getByRole("link", { name: "EN · English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
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

test("celular 390 x 844: sin rail (solo la barra inferior), sin scroll horizontal en ninguna página del menú ni en las pausadas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const ruta of ["/", "/tribus", "/tribus/valle", "/bien-comun", "/sumarte", "/perfil", "/congreso"]) {
    await page.goto(ruta);
    const nav = page.getByRole("navigation", { name: "Principal" });
    await expect(nav).toHaveCount(1);
    expect((await nav.boundingBox())!.x).toBe(0);
    expect((await nav.boundingBox())!.width).toBe(390);
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(desborde, `scroll horizontal en ${ruta}`).toBe(false);
  }
});

test("Tab en 390 px: Saltar al contenido, la marca, la campanita y el avatar; la barra inferior viene después del contenido", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Menú de la persona" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
  // La campanita llega cuando termina de leerse el consentimiento: se espera antes de seguir con Tab.
  await expect(page.locator('a[href="/bandeja"]')).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("banner").getByRole("link", { name: "Lighthouse" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator('a[href="/bandeja"]')).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Menú de la persona" })).toBeFocused();
  // Orden de tabulación: la barra inferior queda después de todo el contenido (y del pie), no antes.
  const barra = page.getByRole("navigation", { name: "Principal" });
  const posiciones = await page.evaluate(() => {
    const barra = document.querySelector('nav[aria-label="Principal"].fixed');
    const main = document.querySelector("main");
    return !!barra && !!main && !!(main.compareDocumentPosition(barra) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(posiciones).toBe(true);
  await expect(barra).toBeVisible();
});

test("Tab: primero Saltar al contenido y después Inicio en el rail; justo después del rail van NetX, Reportar, la campanita y el avatar",async ({ page }) => {
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
  await expect(page.getByRole("button", { name: "Reportar un problema o una idea" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.locator('a[href="/bandeja"]')).toBeFocused();
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
  // Después de los enlaces va el idioma (ES, EN) y recién después Salir.
  await page.keyboard.press("Tab");
  await expect(menu.getByRole("link", { name: "ES · Español" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(menu.getByRole("link", { name: "EN · English" })).toBeFocused();
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
  // El primer `p` es el sobretítulo (mono): se mide un párrafo de contenido.
  expect(await familia("main p:not([class*='font-mono'])")).toContain("Inter Tight");
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
  await page.getByRole("link", { name: /¿Qué es de todos y quién decide\?/ }).click();
  await expect(page).toHaveURL(/\/participa$/);
});

test("ninguna página se deja indexar: noindex, nofollow y sin pedir sesión", async ({ page }) => {
  for (const ruta of ["/", "/sumarte", "/territorios/lighthouse", "/lotes", "/lotes/lote-1", "/congreso"]) {
    const r = await page.goto(ruta);
    expect(r?.status(), ruta).toBe(200);
    await expect(page.locator('meta[name="robots"]'), ruta).toHaveAttribute("content", "noindex, nofollow");
  }
});
