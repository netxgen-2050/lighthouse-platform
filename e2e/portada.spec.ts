import { expect, test, type Page } from "./fixtura";
import { tribusDeTerritorio } from "@/lib/territorios/datos";

// La portada no depende del plan: sin sembrar Sumarte, "lh-origen" es el único dato de la persona y los tests que miran
// cuándo se lee (la importación de datos previos revisa los nombres en orden) no se adelantan por otra clave.
test.use({ plan: "ninguno" });

const CAMINOS = [
  { titulo: "Ver las tribus", href: "/tribus" },
  { titulo: "Encontrar mi tribu", href: "/perfil" },
  { titulo: "Congreso · Feb 2027", href: "/congreso" },
];

test("la portada responde", async ({ page }) => {
  const respuesta = await page.goto("/");
  expect(respuesta?.status()).toBe(200);
});

test("muestra los tres caminos en orden, con titular y botón", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Encontrá tu tribu");
  const principal = page.getByRole("link", { name: "Explorar el Lighthouse", exact: true });
  await expect(principal).toBeVisible();
  await expect(principal).toHaveAttribute("href", "/territorios/lighthouse");
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
    const respuesta = await page.request.get(camino.href);
    expect(respuesta.status()).toBe(200);
  });
}

test("se recorre con Tab y Enter lleva a /perfil", async ({ page }) => {
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
  await expect(page).toHaveURL(/\/perfil$/);
});

test("la cantidad de barrios sale de los datos", async ({ page }) => {
  await page.goto("/");
  const n = tribusDeTerritorio("lighthouse").length;
  await expect(page.getByRole("link", { name: /Ver las tribus/ }).last()).toContainText(
    `${n} barrios`,
  );
});

test("héroe con la propuesta, aviso de prototipo y sin otros nodos", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("comprometer capital")).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.getByText("San Martín de los Andes")).toHaveCount(0);
  await expect(page.getByText("Atlántico Sur")).toHaveCount(0);
});

const leerOrigenGuardado = (page: Page) => page.evaluate(() => window.localStorage.getItem("lh-origen"));

test("camino recomendado: /?camino=congreso marca solo esa tarjeta, sin cambiar el orden", async ({ page }) => {
  await page.goto("/?camino=congreso");
  const seccion = page.getByRole("region", { name: "Por dónde empezar" });
  await expect(seccion.getByText("Recomendado para vos")).toHaveCount(1);
  await expect(seccion.getByRole("link", { name: /Congreso · Feb 2027/ })).toContainText("Recomendado para vos");
  await expect(seccion.getByRole("link", { name: /Ver las tribus/ })).not.toContainText("Recomendado para vos");
  await expect(seccion.getByRole("link", { name: /Encontrar mi tribu/ })).not.toContainText("Recomendado para vos");
  const titulos = await seccion.getByRole("heading", { level: 3 }).allTextContents();
  expect(titulos).toEqual(CAMINOS.map((c) => c.titulo));
  expect(await leerOrigenGuardado(page)).toBeNull();
});

test("camino recomendado: el nombre accesible del enlace incluye la marca y recibe el foco", async ({ page }) => {
  await page.goto("/?camino=perfil");
  const enlace = page.getByRole("region", { name: "Por dónde empezar" }).getByRole("link", { name: /Recomendado para vos/ });
  await expect(enlace).toHaveCount(1);
  await expect(enlace).toHaveAttribute("href", "/perfil");
  await enlace.focus();
  await expect(enlace).toBeFocused();
});

test("camino desconocido: ninguna tarjeta marcada y la página no falla", async ({ page }) => {
  const respuesta = await page.goto("/?camino=lotes");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByText("Recomendado para vos")).toHaveCount(0);
});

test("la primera visita con campaña guarda el origen; la segunda no lo pisa", async ({ page }) => {
  await page.goto("/?utm_source=newsletter&utm_medium=email&utm_campaign=congreso-2027&camino=congreso");
  await expect.poll(() => leerOrigenGuardado(page)).not.toBeNull();
  const primero = JSON.parse((await leerOrigenGuardado(page)) ?? "{}");
  expect(primero).toMatchObject({ fuente: "newsletter", medio: "email", campana: "congreso-2027", camino: "congreso" });
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
  await page.goto("/?camino=perfil");
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
