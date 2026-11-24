import { expect, test, type Page } from "./fixtura";
import { tribusDeTerritorio } from "@/lib/territorios/datos";

// La portada no depende del plan: sin sembrar Sumarte, "lh-origen" es el único dato de la persona y los tests que miran
// cuándo se lee (la importación de datos previos revisa los nombres en orden) no se adelantan por otra clave.
test.use({ plan: "ninguno" });

const CAMINOS = [
  { titulo: "Ver los lotes", href: "/explorar#lotes" },
  { titulo: "Explorar el territorio", href: "/explorar#territorio" },
  { titulo: "Ver las comunidades", href: "/tribus" },
];

test("la portada responde", async ({ page }) => {
  const respuesta = await page.goto("/");
  expect(respuesta?.status()).toBe(200);
});

test("muestra los tres caminos en orden, con titular y botón", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Regenerar desde el agua");
  const principal = page.getByRole("link", { name: "Ver los lotes", exact: true }).first();
  await expect(principal).toBeVisible();
  await expect(principal).toHaveAttribute("href", "/explorar#lotes");
  await expect(page.getByRole("heading", { level: 2, name: "Por dónde empezar" })).toBeVisible();
  const seccion = page.getByRole("region", { name: "Por dónde empezar" });
  const titulos = await seccion.getByRole("heading", { level: 3 }).allTextContents();
  expect(titulos).toEqual(CAMINOS.map((c) => c.titulo));
});

for (const camino of CAMINOS) {
  test(`el camino "${camino.titulo}" apunta a ${camino.href}`, async ({ page }) => {
    await page.goto("/");
    const enlace = page
      .getByRole("region", { name: "Por dónde empezar" })
      .getByRole("link", { name: new RegExp(camino.titulo) });
    await expect(enlace).toHaveAttribute("href", camino.href);
    await enlace.click();
    await expect(page).toHaveURL(new RegExp(`${camino.href}$`));
    // La navegación del cliente no expone el estado: se pide la ruta aparte y se mira que no sea la not-found.
    const respuesta = await page.request.get(camino.href.split("#")[0]);
    expect(respuesta.status()).toBe(200);
  });
}

test("las tarjetas se recorren con Tab y Enter en la segunda lleva al territorio", async ({ page }) => {
  await page.goto("/");
  const seccion = page.getByRole("region", { name: "Por dónde empezar" });
  const enlaces = seccion.getByRole("link");
  await expect(enlaces).toHaveCount(CAMINOS.length);
  // Se avanza con Tab hasta el primer camino; después, uno por Tab, en orden.
  const primero = enlaces.nth(0);
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    if (await primero.evaluate((el) => el === document.activeElement)) break;
  }
  for (let i = 0; i < CAMINOS.length; i++) {
    const enlace = enlaces.nth(i);
    await expect(enlace).toBeFocused();
    await expect(enlace).toHaveCSS("outline-style", "solid");
    await expect(enlace).toHaveCSS("outline-width", "2px");
    if (i < CAMINOS.length - 1) await page.keyboard.press("Tab");
  }
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(enlaces.nth(0)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(enlaces.nth(1)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/explorar#territorio$/);
});

test("'Ver los lotes' del héroe se alcanza con el teclado y lleva a /lotes", async ({ page }) => {
  await page.goto("/");
  const principal = page.getByRole("link", { name: "Ver los lotes", exact: true }).first();
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press("Tab");
    if (await principal.evaluate((el) => el === document.activeElement)) break;
  }
  await expect(principal).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/explorar#lotes$/);
});

test("narrativa: promesa a 2030, Argentina con su ⚖ y los cinco capitales", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Para 2030, Lighthouse VRN quiere ser")).toBeVisible();
  await expect(page.getByText("Es nuestra meta, no una garantía.")).toBeVisible();
  for (const k of ["Agua.", "Trabajo.", "Comunidad."]) await expect(page.getByText(k, { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Argentina, un lugar seguro y abierto" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Argentina, un lugar seguro y abierto" }).getByRole("button")).toBeVisible();
  const capitales = page.getByRole("region", { name: "Los cinco capitales de la regeneración" });
  await expect(capitales.getByRole("heading", { level: 3 })).toHaveText(["Natural", "Humano", "Social", "Construido", "Financiero"]);
});

test("cada cifra muestra su fuente", async ({ page }) => {
  await page.goto("/");
  const region = page.getByRole("region", { name: "Cifras del sitio" });
  await expect(region).toBeVisible();
  const cifras = region.locator("li");
  const n = await cifras.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) await expect(cifras.nth(i)).toContainText("Fuente: NS_permacultura");
});

for (const idioma of ["es", "en"]) {
  test(`no aparece nada fuera del alcance de Lighthouse VRN (${idioma})`, async ({ page }) => {
    await page.goto(idioma === "es" ? "/" : "/?lang=en");
    // Primero se comprueba que es la portada (y no, por ejemplo, un login), recién después las ausencias.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const nombreCapitales = idioma === "es" ? "Los cinco capitales de la regeneración" : "The five capitals of regeneration";
    await expect(page.getByRole("region", { name: nombreCapitales })).toBeVisible();
    const texto = (await page.locator("main").innerText()) ?? "";
    for (const t of [/Congreso/i, /Congress/i, /\bSMA\b/, /San Martín de los Andes/, /Atlántico Sur/, /South Atlantic/i, /111/, /\bTIR\b/, /\bIRR\b/, /recupero/i, /payback/i]) {
      expect(texto, String(t)).not.toMatch(t);
    }
    // Ningún enlace de la portada lleva a /congreso.
    await expect(page.locator('main a[href^="/congreso"]')).toHaveCount(0);
  });
}

test("en 390 px no hay scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(sobra).toBeLessThanOrEqual(0);
});

test("la cantidad de barrios sale de los datos", async ({ page }) => {
  await page.goto("/");
  const n = tribusDeTerritorio("lighthouse").length;
  await expect(page.getByRole("link", { name: /Ver las comunidades/ }).last()).toContainText(
    `${n} barrios`,
  );
});

test("héroe con la propuesta, aviso de prototipo y sin otros nodos", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("en el Alto Valle de Río Negro, cerca de Vaca Muerta")).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.getByText("San Martín de los Andes")).toHaveCount(0);
  await expect(page.getByText("Atlántico Sur")).toHaveCount(0);
});

const leerOrigenGuardado = (page: Page) => page.evaluate(() => window.localStorage.getItem("lh-origen"));

test("camino recomendado: /?camino=lotes marca solo esa tarjeta, sin cambiar el orden", async ({ page }) => {
  await page.goto("/?camino=lotes");
  const seccion = page.getByRole("region", { name: "Por dónde empezar" });
  await expect(seccion.getByText("Recomendado para vos")).toHaveCount(1);
  await expect(seccion.getByRole("link", { name: /Ver los lotes/ })).toContainText("Recomendado para vos");
  await expect(seccion.getByRole("link", { name: /Ver las comunidades/ })).not.toContainText("Recomendado para vos");
  await expect(seccion.getByRole("link", { name: /Explorar el territorio/ })).not.toContainText("Recomendado para vos");
  const titulos = await seccion.getByRole("heading", { level: 3 }).allTextContents();
  expect(titulos).toEqual(CAMINOS.map((c) => c.titulo));
  expect(await leerOrigenGuardado(page)).toBeNull();
});

test("camino recomendado: el nombre accesible del enlace incluye la marca y recibe el foco", async ({ page }) => {
  await page.goto("/?camino=territorio");
  const enlace = page.getByRole("region", { name: "Por dónde empezar" }).getByRole("link", { name: /Recomendado para vos/ });
  await expect(enlace).toHaveCount(1);
  await expect(enlace).toHaveAttribute("href", "/explorar#territorio");
  await enlace.focus();
  await expect(enlace).toBeFocused();
});

test("camino desconocido: ninguna tarjeta marcada y la página no falla", async ({ page }) => {
  const respuesta = await page.goto("/?camino=congreso");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByText("Recomendado para vos")).toHaveCount(0);
});

test("la primera visita con campaña guarda el origen; la segunda no lo pisa", async ({ page }) => {
  await page.goto("/?utm_source=newsletter&utm_medium=email&utm_campaign=congreso-2027&camino=congreso");
  await expect.poll(() => leerOrigenGuardado(page)).not.toBeNull();
  const primero = JSON.parse((await leerOrigenGuardado(page)) ?? "{}");
  // El camino viejo "congreso" ya no es válido: se descarta, pero el origen de la campaña se guarda igual.
  expect(primero).toMatchObject({ fuente: "newsletter", medio: "email", campana: "congreso-2027" });
  expect(primero.camino).toBeUndefined();
  expect(typeof primero.fecha).toBe("string");
  // Marca cuándo corrió el guardado de la segunda visita: GuardarOrigen lee lh-origen antes de decidir.
  await page.addInitScript(() => {
    const leer = Storage.prototype.getItem;
    Storage.prototype.getItem = function (clave: string) {
      if (clave === "lh-origen") (window as unknown as { __origenLeido?: boolean }).__origenLeido = true;
      return leer.call(this, clave);
    };
  });
  await page.goto("/?utm_source=telegram");
  await page.waitForFunction(() => (window as unknown as { __origenLeido?: boolean }).__origenLeido === true);
  const despues = JSON.parse((await leerOrigenGuardado(page)) ?? "{}");
  expect(despues.fuente).toBe("newsletter");
});

test("sin utm_* no se guarda nada", async ({ page }) => {
  await page.goto("/?camino=tribus");
  await expect(page.getByText("Recomendado para vos")).toBeVisible();
  expect(await leerOrigenGuardado(page)).toBeNull();
});

test("un parámetro no permitido se descarta y los valores del origen se guardan tal cual", async ({ page }) => {
  await page.goto("/?utm_source=ana@ejemplo.com&email=otra@ejemplo.com&utm_campaign=Promo%20Feb%202027");
  await expect.poll(() => leerOrigenGuardado(page)).not.toBeNull();
  const crudo = (await leerOrigenGuardado(page)) ?? "";
  // El parámetro email= no es de origen: se descarta.
  expect(crudo).not.toContain("otra@ejemplo.com");
  const o = JSON.parse(crudo);
  // Los valores de los utm se guardan sin filtros (decisión de Gus, 13-oct).
  expect(o.fuente).toBe("ana@ejemplo.com");
  expect(o.campana).toBe("Promo Feb 2027");
});

test("foto del valle a sangre con la leyenda, cifras con fuente en paneles de vidrio y botón de 44 px a 390 px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByText("Imagen ilustrativa", { exact: true })).toBeVisible();
  const boton = page.getByRole("link", { name: "Ver los lotes", exact: true }).first();
  await expect(boton).toBeVisible();
  expect((await boton.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
  const cifras = page.getByRole("region", { name: "Cifras del sitio" }).locator("li");
  const n = await cifras.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    await expect(cifras.nth(i)).toHaveClass(/panel-vidrio/);
    await expect(cifras.nth(i)).toContainText("Fuente:");
  }
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(sobra).toBeLessThanOrEqual(0);
});

test("a 1280 px la foto ocupa el ancho del contenido, con el título y el botón encima y la leyenda", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const imagen = page.locator('img[src*="lighthouse-valle"]');
  await expect(imagen).toHaveAttribute("alt", "");
  const foto = await imagen.boundingBox();
  const main = await page.locator("main").boundingBox();
  expect(foto && main && Math.abs(foto.width - main.width) <= 1).toBe(true);
  const titulo = await page.getByRole("heading", { level: 1 }).boundingBox();
  const boton = await page.getByRole("link", { name: "Ver los lotes", exact: true }).first().boundingBox();
  for (const caja of [titulo, boton]) {
    expect(caja && foto && caja.y >= foto.y && caja.y + caja.height <= foto.y + foto.height).toBe(true);
  }
  await expect(page.getByText("Imagen ilustrativa", { exact: true })).toBeVisible();
  const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(sobra).toBeLessThanOrEqual(0);
});

test("con Tab el foco llega a Ver los lotes y a Elegí cómo sumarte, con anillo visible", async ({ page }) => {
  await page.goto("/");
  for (const nombre of ["Ver los lotes", "Elegí cómo sumarte"]) {
    const enlace = page.getByRole("main").getByRole("link", { name: nombre, exact: true }).first();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      if (await enlace.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(enlace).toBeFocused();
    await expect(enlace).toHaveCSS("outline-style", "solid");
  }
});

test("la imagen de fondo es decorativa y se aclara que es ilustrativa", async ({ page }) => {
  await page.goto("/");
  const imagen = page.locator('img[src*="lighthouse-valle"]');
  await expect(imagen).toHaveAttribute("alt", "");
  await expect(page.getByText(/Imagen ilustrativa de la Zona A/)).toBeVisible();
});

