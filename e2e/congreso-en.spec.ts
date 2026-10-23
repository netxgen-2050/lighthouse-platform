import { expect, test, type Page } from "./fixtura";

const leerLocal = (page: Page, clave: string) => page.evaluate((c) => window.localStorage.getItem(c), clave);

/** El selector ES / EN de la barra del evento (la barra superior de la plataforma tiene otro igual). */
const selectorEvento = (page: Page) => page.locator(".tema-evento").getByRole("group", { name: "Idioma · Language" });

/** El idioma elegido en este navegador: la cookie `lh-idioma` de la plataforma (el selector del Congreso la escribe). */
const cookieIdioma = async (page: Page) => (await page.context().cookies()).find((c) => c.name === "lh-idioma")?.value;

/** Texto del contenedor en inglés sin lo que va en un descendiente `lang="es"` (el marco de NetX no se mira). */
const textoEnIngles = (page: Page) =>
  page.evaluate(() => {
    const raiz = document.querySelector('[lang="en"].tema-evento');
    if (!raiz) return null;
    const copia = raiz.cloneNode(true) as HTMLElement;
    copia.querySelectorAll('[lang="es"]').forEach((n) => n.remove());
    return copia.textContent ?? "";
  });

// ===== Idioma de la vitrina y del documento =====

test("la vitrina lleva lang en y el documento sigue en es", async ({ page }) => {
  await page.goto("/congreso/en");
  await expect(page.getByRole("heading", { level: 1, name: /Solarpunk Patagonia/ })).toBeVisible();
  await expect(page.locator(".tema-evento")).toHaveAttribute("lang", "en");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.locator("main h1")).toHaveCount(1);
});

test("en español la vitrina lleva lang es", async ({ page }) => {
  await page.goto("/congreso");
  await expect(page.locator(".tema-evento")).toHaveAttribute("lang", "es");
});

test("el aviso de prototipo está en los dos idiomas, el original con lang es", async ({ page }) => {
  await page.goto("/congreso/en");
  await expect(page.getByText("Internal prototype · sample data")).toBeVisible();
  const original = page.locator('span[lang="es"]').filter({ hasText: "Prototipo interno · datos de ejemplo" });
  await expect(original).toBeVisible();
});

test("la página en inglés no deja textos en español fuera de lo marcado con lang es", async ({ page }) => {
  await page.goto("/congreso/en");
  await expect(page.getByRole("heading", { level: 1, name: /Solarpunk Patagonia/ })).toBeVisible();
  const texto = await textoEnIngles(page);
  expect(texto).not.toBeNull();
  for (const palabra of ["Comprar", "ejemplo", "Por confirmar", "Preguntas", "Sumate"]) {
    expect(texto, palabra).not.toContain(palabra);
  }
  // Y sí está en inglés.
  expect(texto).toContain("Buy full pass");
  expect(texto).toContain("To be confirmed");
  expect(texto).toContain("February 2027");
});

test("textos clave en inglés: precios, tribus, territorio y modo de origen", async ({ page }) => {
  await page.goto("/congreso/en");
  await expect(page.getByRole("heading", { name: "Reserve your spot under the ring" })).toBeVisible();
  await expect(page.locator("#entradas [data-entrada]")).toHaveCount(6);
  await expect(page.locator("#entradas .ev-precio small", { hasText: "sample" })).toHaveCount(6);
  await expect(page.locator("#entradas")).toContainText("USD 250 each");
  const tribus = page.locator("#tribus");
  await expect(tribus.getByText(/^\d+ of \d+ are going$/)).toHaveCount(3);
  await expect(tribus.getByRole("link", { name: "Find my tribe (in Spanish)" })).toHaveAttribute("href", "/tribus");
  await expect(tribus.getByRole("link", { name: "Find my tribe (in Spanish)" })).toHaveAttribute("hreflang", "es");
  await expect(page.locator("#territorio").getByRole("link", { name: "Explore the map in NetX (in Spanish)" })).toHaveAttribute(
    "href",
    "/territorios/lighthouse",
  );
  await expect(page.getByRole("group", { name: "Countdown to the eclipse" })).toBeVisible();
  const boton = page.getByRole("button", { name: /What comes from UnityHub\?/ });
  await boton.click();
  await expect(page.getByText("From UnityHub · schedule")).toBeVisible();
  await expect(page.getByText("From NetX · linked ticket and presence")).toBeVisible();
});

// ===== Selector y preferencia =====

test("el selector se usa con teclado, va y vuelve conservando #tribus", async ({ page }) => {
  await page.goto("/congreso/en#tribus");
  const grupo = selectorEvento(page);
  await expect(grupo.getByRole("link", { name: "EN · English" })).toHaveAttribute("aria-current", "true");
  await expect(grupo.getByRole("link", { name: "ES · Español" })).not.toHaveAttribute("aria-current", "true");
  await expect(grupo.getByRole("link", { name: "ES · Español" })).toHaveAttribute("hreflang", "es");
  await grupo.getByRole("link", { name: "ES · Español" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/congreso#tribus$/);
  await expect(page.locator(".tema-evento")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("heading", { name: "No vengas solo. Llegá con tu tribu." })).toBeVisible();
  await grupo.getByRole("link", { name: "EN · English" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/congreso\/en#tribus$/);
  await expect(page.getByRole("heading", { name: "Don't come alone. Arrive with your tribe." })).toBeVisible();
});

test("el selector conserva la query (UTM) al cambiar de idioma", async ({ page }) => {
  await page.goto("/congreso/en?utm_source=pagina-oficial&utm_campaign=congreso-2027#entradas");
  await selectorEvento(page).getByRole("link", { name: "ES · Español" }).click();
  await expect(page).toHaveURL(/\/congreso\?utm_source=pagina-oficial&utm_campaign=congreso-2027#entradas$/);
});

test("la preferencia en inglés pasa /congreso a /congreso/en y volver a ES la deshace", async ({ page }) => {
  await page.goto("/congreso");
  await expect(page.locator(".tema-evento")).toHaveAttribute("lang", "es");
  await selectorEvento(page).getByRole("link", { name: "EN · English" }).click();
  await expect(page).toHaveURL(/\/congreso\/en$/);
  expect(await cookieIdioma(page)).toBe("en");

  await page.goto("/congreso?utm_source=x#tribus");
  await expect(page).toHaveURL(/\/congreso\/en\?utm_source=x#tribus$/);
  await expect(page.locator(".tema-evento")).toHaveAttribute("lang", "en");

  // La dirección en inglés explícita siempre gana: no se pasa al español.
  await page.goto("/congreso/en");
  await expect(page).toHaveURL(/\/congreso\/en$/);

  await selectorEvento(page).getByRole("link", { name: "ES · Español" }).click();
  await expect(page).toHaveURL(/\/congreso$/);
  expect(await cookieIdioma(page)).toBe("es");
  await page.goto("/congreso");
  await expect(page.locator(".tema-evento")).toHaveAttribute("lang", "es");
  await expect(page).toHaveURL(/\/congreso$/);
});

test("un valor raro guardado como preferencia se ignora", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "lh-idioma", value: "fr", url: baseURL! }]);
  await page.goto("/congreso");
  await page.evaluate(() => window.localStorage.setItem("lh-congreso-idioma", "fr"));
  await page.goto("/congreso");
  await expect(page.locator(".tema-evento")).toHaveAttribute("lang", "es");
  await expect(page).toHaveURL(/\/congreso$/);
});

test("/congreso/fr no existe", async ({ page }) => {
  const r = await page.goto("/congreso/fr");
  expect(r?.status()).toBe(404);
});

// ===== Diálogo, ⚖ y registro (con sesión) =====

test("el diálogo de compra está en inglés, no dice quién cobra y se cierra con Escape", async ({ page }) => {
  await page.goto("/congreso/en");
  const comprar = page.getByRole("button", { name: "Buy full pass" });
  await comprar.click();
  const dialogo = page.getByRole("dialog", { name: "Here you would buy your ticket" });
  await expect(dialogo).toBeVisible();
  await expect(dialogo).toContainText("Prototype: nothing is charged and no other page opens.");
  expect(await dialogo.innerText()).not.toMatch(/UnityHub|Stripe|NetX/i);
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect(comprar).toBeFocused();
});

test("el ⚖ de entradas aparece en inglés como borrador y la bitácora anota el idioma", async ({ page }) => {
  await page.goto("/congreso/en");
  await page.locator("#entradas").getByRole("button", { name: "What it means legally: Congress ticket" }).hover();
  const tip = page.getByRole("tooltip");
  await expect(tip).toContainText("Congress ticket");
  await expect(tip).toContainText("Draft: text under review");
  await expect(tip).not.toContainText("Borrador");
  await expect
    .poll(async () => {
      const b = JSON.parse((await leerLocal(page, "lh-bitacora")) ?? "[]") as { clave: string; idioma?: string; borrador: boolean; ruta: string }[];
      return b.find((e) => e.clave === "ticket");
    })
    .toMatchObject({ idioma: "en", borrador: true, ruta: "/congreso/en" });
});

test("el ⚖ de encuentro educativo y el de obra también están en inglés", async ({ page }) => {
  await page.goto("/congreso/en");
  await expect(page.locator("#acerca").getByRole("button", { name: "What it means legally: Educational gathering" })).toBeVisible();
  await expect(page.locator("#recorrido").getByRole("button", { name: "What it means legally: Construction hours" })).toBeVisible();
  await expect(page.locator("#ticket").getByRole("button", { name: "What it means legally: Presence" })).toBeVisible();
});

test("el registro del ticket funciona en inglés y deja el sello como pendiente", async ({ page }) => {
  await page.goto("/congreso/en");
  await expect(page.getByText("Demo mode: the registration stays only in this browser.")).toBeVisible();
  await expect(page.getByText("Unlocked with your first check-in at the territory.")).toBeVisible();
  await page.getByLabel(/Your ticket code/).fill("lh27-8f3k-2q");
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByText("Ticket LH27-8F3K-2Q registered")).toBeVisible();
  await expect(page.getByText("Pending first check-in")).toBeVisible();
  await page.getByRole("button", { name: "Remove ticket" }).click();
  await expect(page.getByLabel(/Your ticket code/)).toBeVisible();
});

test("código inválido en inglés muestra el error asociado al campo", async ({ page }) => {
  await page.goto("/congreso/en");
  const campo = page.getByLabel(/Your ticket code/);
  await campo.fill("1234");
  await page.getByRole("button", { name: "Register" }).click();
  const id = await campo.getAttribute("aria-describedby");
  expect(id).toBeTruthy();
  await expect(page.locator(`#${id}`)).toContainText("does not match the format");
});

test.describe("con la política de privacidad pendiente", () => {
  test.use({ rol: "persona", plan: "explorador", consentimiento: "ninguno" });

  test("en inglés ve el llamado a aceptar la política (en español) con el mismo destino que en español", async ({ page }) => {
    await page.goto("/congreso/en#ticket");
    const enlace = page.getByRole("link", { name: "Accept the privacy policy to link your ticket (in Spanish)" });
    await expect(enlace).toBeVisible();
    await expect(enlace).toHaveAttribute("href", "/sumarte?volver=%2Fcongreso%2Fen%23ticket&para=explorador");
    await expect(page.getByLabel(/Your ticket code/)).toHaveCount(0);
  });
});

// ===== Sin cuenta =====

test.describe("visitante sin cuenta", () => {
  test.use({ rol: "ninguno" });

  test("/congreso/en#entradas se ve sin pedir sesión y deja Entradas a la vista", async ({ page }) => {
    await page.goto("/congreso/en#entradas");
    await expect(page).toHaveURL(/\/congreso\/en#entradas$/);
    await expect(page.getByRole("heading", { level: 1, name: /Solarpunk Patagonia/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reserve your spot under the ring" })).toBeInViewport();
  });

  test("el llamado del ticket está en inglés y vuelve a /congreso/en#ticket", async ({ page }) => {
    await page.goto("/congreso/en");
    const enlace = page.getByRole("link", { name: "Join for free to link your ticket (sign-up is in Spanish for now)" });
    await expect(enlace).toHaveAttribute("href", "/sumarte?volver=%2Fcongreso%2Fen%23ticket&para=explorador");
    await expect(enlace).toHaveAttribute("hreflang", "es");
    await expect(page.getByLabel(/Your ticket code/)).toHaveCount(0);
    const claves = await page.evaluate(() => Object.keys(window.localStorage));
    expect(claves.filter((c) => c.includes("congreso-ticket"))).toEqual([]);
  });

  test("entrar con UTM guarda el origen igual que en español", async ({ page }) => {
    await page.goto("/congreso/en?utm_source=pagina-oficial&utm_medium=enlace&utm_campaign=congreso-2027#entradas");
    await expect.poll(() => leerLocal(page, "lh-origen")).not.toBeNull();
    const origen = JSON.parse((await leerLocal(page, "lh-origen")) ?? "{}");
    expect(origen).toMatchObject({ fuente: "pagina-oficial", campana: "congreso-2027" });
  });

  test("sin sesión la preferencia de idioma se guarda por navegador (cookie de la plataforma)", async ({ page }) => {
    await page.goto("/congreso");
    await selectorEvento(page).getByRole("link", { name: "EN · English" }).click();
    await expect(page).toHaveURL(/\/congreso\/en$/);
    expect(await cookieIdioma(page)).toBe("en");
  });

  test("elegir inglés en el selector del Congreso pone el marco de la plataforma en inglés", async ({ page }) => {
    await page.goto("/congreso");
    await selectorEvento(page).getByRole("link", { name: "EN · English" }).click();
    await expect(page).toHaveURL(/\/congreso\/en$/);
    await page.goto("/tribus");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Tribes" })).toBeVisible();
  });

  test("la preferencia vieja del Congreso (lh-congreso-idioma) se usa una vez si no hay cookie", async ({ page }) => {
    // Se guarda desde un archivo estático del mismo origen (sin la app): en una página de la plataforma, la sincronización
    // de idioma puede recargarla justo cuando se guarda la preferencia y abortar la navegación siguiente.
    await page.goto("/file.svg");
    await page.evaluate(() => window.localStorage.setItem("lh-congreso-idioma", "en"));
    await page.goto("/tribus");
    await expect.poll(() => cookieIdioma(page)).toBe("en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });
});
