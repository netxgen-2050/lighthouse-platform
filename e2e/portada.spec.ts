import { expect, test } from "@playwright/test";
import { tribusDeTerritorio } from "@/lib/territorios/datos";

const CAMINOS = [
  { titulo: "Explorar el Lighthouse", href: "/territorios/lighthouse" },
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
  await expect(page.getByRole("link", { name: "Ver las tribus" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Por dónde empezar" })).toBeVisible();
  const seccion = page.getByRole("region", { name: "Por dónde empezar" });
  const titulos = await seccion.getByRole("heading", { level: 3 }).allTextContents();
  expect(titulos).toEqual(CAMINOS.map((c) => c.titulo));
});

for (const camino of CAMINOS) {
  test(`el camino "${camino.titulo}" apunta a ${camino.href}`, async ({ page }) => {
    await page.goto("/");
    const enlace = page.getByRole("link", { name: new RegExp(camino.titulo) });
    await expect(enlace).toHaveAttribute("href", camino.href);
    // /territorios/lighthouse la trae la rama de integración: acá solo se navega a las que existen.
    if (camino.href === "/territorios/lighthouse") return;
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
  await expect(page.getByRole("link", { name: /Explorar el Lighthouse/ })).toContainText(
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
