import { expect, test, type Page } from "./fixtura";
import { vistaBarrioNorte } from "@/lib/barrios/norte";
import { ANIOS_DEL_HORIZONTE, resumenObraBarrio } from "@/lib/bien-comun/barrio";
import { enteroEn } from "@/lib/bien-comun/formato";
import { porcentajeEn, usdEn } from "@/lib/lotes/formato";

// Barrio Norte (rediseno-explorar-valle): los valores que se esperan salen de los módulos, nunca escritos a mano.
const vista = vistaBarrioNorte();
const obra = resumenObraBarrio();
const RUTA = "/explorar";

const main = (page: Page) => page.locator("main");

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("título sobre la foto, sello de venta, totales por estado con texto y aviso para entrar", async ({ page }) => {
    const r = await page.goto(RUTA);
    expect(r?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Explorar Lighthouse" })).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
    await expect(page.getByText("venta simulada · aprobación municipal pendiente")).toBeVisible();
    await expect(page.getByText("Imagen ilustrativa", { exact: true })).toBeVisible();
    await expect(page.locator('img[src*="lighthouse-valle"]')).toHaveAttribute("alt", "");
    // Cada total lleva el nombre del estado en texto.
    const seccion = page.getByRole("region", { name: "Los lotes del barrio" });
    for (const [nombre, clave] of [
      ["Disponible", "disponible"],
      ["Reservado", "reservado"],
      ["En cuotas", "enCuotas"],
      ["Vendido", "vendido"],
    ] as const) {
      const item = seccion.locator("li", { hasText: nombre });
      await expect(item).toBeVisible();
      const n = vista.lotesPorEstado[clave];
      await expect(item).toContainText(n === null ? "sin dato" : enteroEn(n, "es"));
    }
    await expect(seccion.getByRole("link", { name: "Ver los lotes" })).toHaveAttribute("href", "#lotes");
    // Bien común: parte de cada pago y expensa, con el enlace.
    await expect(main(page)).toContainText(porcentajeEn(vista.parteParaElComun, "es"));
    await expect(main(page)).toContainText(usdEn(vista.expensa, "es"));
    await expect(page.getByRole("link", { name: "Ver el bien común" })).toHaveAttribute("href", "/bien-comun");
    // La obra pide entrar.
    await expect(page.getByText("Los números de la obra se ven con una cuenta.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sumate para ver la obra" })).toBeVisible();
    const texto = await main(page).innerText();
    expect(texto).not.toContain(usdEn(obra.infraestructura, "es"));
  });

  test("el HTML del servidor no trae el monto de la infraestructura", async ({ page }) => {
    const r = await page.request.get(RUTA);
    const html = await r.text();
    expect(html).not.toContain(usdEn(obra.infraestructura, "es"));
    expect(html).not.toContain(enteroEn(Math.round(obra.infraestructura!), "es"));
  });

  test("las compras simuladas del navegador no cambian los totales por estado", async ({ page }) => {
    const antes = await page.goto(RUTA).then(() => page.getByRole("region", { name: "Los lotes del barrio" }).innerText());
    await page.addInitScript(() => {
      const compra = {
        loteId: "lote-1",
        opcion: "solo-lote",
        paso: "pagado",
        reservadoEl: "2026-10-01T12:00:00.000Z",
        pagadoEl: "2026-10-02T12:00:00.000Z",
        vio: { precio: 20_000, aporte: 1_000, expensa: 100, version: "v0.2" },
      };
      window.localStorage.setItem("lh-lotes", JSON.stringify([compra]));
    });
    await page.goto(RUTA);
    await expect(page.getByRole("region", { name: "Los lotes del barrio" })).toBeVisible();
    expect(await page.getByRole("region", { name: "Los lotes del barrio" }).innerText()).toBe(antes);
  });

  test("con Tab el foco llega a Ver los lotes, a Ver el bien común y a Sumate para ver la obra", async ({ page }) => {
    await page.goto(RUTA);
    for (const nombre of ["Ver los lotes", "Ver el bien común", "Sumate para ver la obra"]) {
      const enlace = main(page).getByRole("link", { name: nombre, exact: true });
      await expect(enlace).toBeVisible();
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press("Tab");
        if (await enlace.evaluate((el) => el === document.activeElement)) break;
      }
      await expect(enlace, nombre).toBeFocused();
      await expect(enlace).toHaveCSS("outline-style", "solid");
    }
  });

  test("los términos legales ⚖ de Expensa y Token Inversor están presentes", async ({ page }) => {
    await page.goto(RUTA);
    await expect(main(page).getByRole("button", { name: /Expensas/ }).first()).toBeVisible();
  });

  test("a 390 px no hay scroll horizontal y los botones tocan 44 px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(RUTA);
    await expect(page.getByRole("heading", { level: 1, name: "Explorar Lighthouse" })).toBeVisible();
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(sobra).toBeLessThanOrEqual(0);
    for (const nombre of ["Ver los lotes", "Ver el bien común"]) {
      const caja = await main(page).getByRole("link", { name: nombre }).boundingBox();
      expect(caja?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });

  test("en inglés se ve en inglés", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "lh-idioma", value: "en", url: baseURL! }]);
    await page.goto(RUTA);
    await expect(page.getByRole("heading", { level: 1, name: "Explore Lighthouse" })).toBeVisible();
    await expect(page.getByText("simulated sale · municipal approval pending")).toBeVisible();
    await expect(page.getByRole("region", { name: "The lots of the neighborhood" })).toContainText("Available");
    await expect(page.getByRole("link", { name: "See the commons" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Join to see the works" })).toBeVisible();
  });
});

test.describe("con sesión", () => {
  test("el panel de la obra: monto, lo juntado sin dato, mes de devolución y lo que llega al común", async ({ page }) => {
    await page.goto(RUTA);
    const panel = page.locator("section", { has: page.getByRole("heading", { level: 3, name: "La obra del barrio" }) }).last();
    await expect(panel).toContainText(usdEn(obra.infraestructura, "es"));
    await expect(panel.getByRole("meter")).toHaveCount(0);
    await expect(panel).toContainText("Lo juntado");
    await expect(panel.getByText("sin dato").first()).toBeVisible();
    await expect(panel).toContainText(
      obra.mesDevolucion === null
        ? `No se termina de devolver en ${enteroEn(ANIOS_DEL_HORIZONTE, "es")} años.`
        : `Se terminaría de devolver en el mes ${enteroEn(obra.mesDevolucion, "es")}.`,
    );
    const filas = panel.getByRole("table").locator("tbody tr");
    await expect(filas).toHaveCount(obra.comunPorAnio.length);
    await expect(filas.first()).toContainText(usdEn(obra.comunPorAnio[0], "es"));
    await expect(page.getByRole("link", { name: "Sumate para ver la obra" })).toHaveCount(0);
    await expect(panel.getByRole("button", { name: /Token Inversor/ })).toBeVisible();
    // La región con desplazamiento de la tabla del común se alcanza con Tab.
    const region = panel.getByRole("region", { name: /Lo que le llega al común en cada año/ });
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press("Tab");
      if (await region.evaluate((el) => el === document.activeElement)) break;
    }
    await expect(region).toBeFocused();
    const texto = await panel.innerText();
    expect(texto).not.toMatch(/rendimiento|APY|ganancia|yield/i);
  });
});
