import { expect, test } from "@playwright/test";

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

test("el rail trae la marca y los destinos existentes en orden", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav).toBeVisible();
  await expect(nav.locator("xpath=..").locator("p").getByText("NetX", { exact: true })).toBeVisible();
  const textos = (await nav.getByRole("link").allInnerTexts()).map((t) => t.trim().split("\n")[0]);
  const orden = ["Inicio", "Territorio", "Tribus", "Pactos", "Semillas", "Fogón", "Compromisos", "Congreso", "Sumarte", "NetX"];
  expect(textos).toEqual(orden.filter((o) => textos.includes(o)));
  expect(textos).toEqual(expect.arrayContaining(["Inicio", "Tribus", "Congreso", "Sumarte"]));
  // Perfil, Pasaporte y Mi recorrido viven en el menú del avatar, no en el rail.
  await expect(nav.getByRole("link", { name: "Perfil" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "NetX" })).toContainText("Interno");
});

test("el rail muestra los grupos Descubrir y Participar en la computadora", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByText("Descubrir", { exact: true })).toBeVisible();
  await expect(nav.getByText("Participar", { exact: true })).toBeVisible();
  await expect(nav.getByRole("list", { name: "Descubrir" }).getByRole("link")).toHaveCount(3);
  await expect(nav.getByRole("list", { name: "Participar" }).getByRole("link")).toHaveCount(5);
});

test("menú de la persona: se abre con Enter, trae Perfil, Pasaporte y Mi recorrido, y Escape lo cierra", async ({ page }) => {
  await page.goto("/");
  const avatar = page.getByRole("button", { name: "Menú de la persona" });
  await avatar.focus();
  await page.keyboard.press("Enter");
  const menu = page.locator("#menu-persona");
  await expect(menu.getByRole("link", { name: "Perfil" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Pasaporte" })).toBeVisible();
  await expect(menu.getByRole("link", { name: "Mi recorrido" })).toBeVisible();
  await expect(menu.getByRole("button", { name: "Salir" })).toBeDisabled();
  await expect(menu).toContainText("Llega con el login");
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
    const desborde = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(desborde, `scroll horizontal en ${ruta}`).toBe(false);
  }
});

test("Tab: primero Saltar al contenido y después Inicio en el rail; la campanita y el avatar van al final", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
  await page.keyboard.press("Tab");
  const nav = page.getByRole("navigation", { name: "Principal" });
  await expect(nav.getByRole("link", { name: "Inicio" })).toBeFocused();
  // Se llega con Tab hasta el último enlace del rail (NetX); justo después va la campanita y luego el avatar.
  const netx = nav.getByRole("link", { name: "NetX" });
  for (let i = 0; i < 20 && !(await netx.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press("Tab");
  }
  await expect(netx).toBeFocused();
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
  // Mientras el foco recorre los enlaces del menú, este sigue abierto.
  for (const nombre of ["Perfil", "Pasaporte", "Mi recorrido"]) {
    await page.keyboard.press("Tab");
    await expect(menu.getByRole("link", { name: nombre })).toBeFocused();
    await expect(menu).toBeVisible();
  }
  // Recién cuando el foco sale después de Mi recorrido, se cierra.
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
