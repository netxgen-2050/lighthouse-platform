import { DESTINOS } from "../lib/navegacion";
import { expect, test } from "./fixtura";

// El reporte de bugs vive en toda la experiencia (components/boton-reportar.tsx, montado en app/layout.tsx).
// Esta prueba avisa si alguna página deja de tenerlo.
const NOMBRE_BOTON = "Reportar un problema o una idea";

const RUTAS = [...DESTINOS.filter((d) => d.existe).map((d) => d.href), "/fogon/consultas"];

test("el botón Reportar está en cada página del rail y abre el diálogo con Enter", async ({ page }) => {
  test.setTimeout(120_000);
  for (const ruta of RUTAS) {
    const respuesta = await page.goto(ruta);
    expect(respuesta?.status(), ruta).toBe(200);
    const boton = page.getByRole("button", { name: NOMBRE_BOTON });
    await expect(boton, ruta).toBeVisible();
    await boton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog", { name: NOMBRE_BOTON }), ruta).toBeVisible();
  }
});
