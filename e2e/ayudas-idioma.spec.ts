import { expect, test } from "./fixtura";
import { textosEnEspanol } from "./ayudas-idioma";

// La ayuda que detecta textos en español dentro de una página en inglés: se prueba con una página armada a mano.

test("detecta 'Elegí un plan' suelto en una página en inglés", async ({ page }) => {
  await page.setContent('<div id="r"><p>Choose your tribe</p><p>Elegí un plan</p></div>');
  expect(await textosEnEspanol(page, "#r")).toEqual(["un"]);
  await page.setContent('<div id="r"><p>Elegí un plan para ti</p></div>');
  expect(await textosEnEspanol(page, "#r")).toEqual(["un", "para"]);
});

test("detecta los signos del español", async ({ page }) => {
  await page.setContent("<div id='r'><p>¿Listo?</p><p>Año</p></div>");
  expect(await textosEnEspanol(page, "#r")).toEqual(expect.arrayContaining(["¿", "ñ"]));
});

test("ignora lo marcado con lang es y con translate no", async ({ page }) => {
  await page.setContent(
    `<div id="r">
       <p>Plain English text</p>
       <p lang="es">Elegí un plan para tu tribu</p>
       <p><span translate="no">Valle del Sol con sus ñandúes</span></p>
     </div>`,
  );
  expect(await textosEnEspanol(page, "#r")).toEqual([]);
});

test("si la raíz ya está dentro de lang es, no hay nada que mirar", async ({ page }) => {
  await page.setContent('<div lang="es"><div id="r"><p>Elegí un plan para ti</p></div></div>');
  expect(await textosEnEspanol(page, "#r")).toEqual([]);
});

test("una palabra de la lista dentro de otra no cuenta (límites de palabra)", async ({ page }) => {
  await page.setContent("<div id='r'><p>Contact the elements of the content</p></div>");
  expect(await textosEnEspanol(page, "#r")).toEqual([]);
});
