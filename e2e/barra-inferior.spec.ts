import { expect, test } from "./fixtura";

// Barra inferior y botones flotantes del celular (ux-celular). La hoja Más, su teclado y su arrastre están en marco.spec.ts.

test("390 px: ningún botón flotante se superpone con el título ni con el primer párrafo de /", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Hablar con Hifa" })).toBeVisible();
  const cruces = await page.evaluate(() => {
    const cajas = (el: Element) => el.getBoundingClientRect();
    const texto = [document.querySelector("main h1"), document.querySelector("main p")].filter((e): e is Element => !!e);
    // Todo lo que está fijo en pantalla y se ve (botones, la barra inferior).
    const fijos = Array.from(document.querySelectorAll("button, nav, a")).filter((e) => {
      const s = getComputedStyle(e);
      return s.position === "fixed" && cajas(e).width > 0 && !e.closest("header");
    });
    const choca = (a: DOMRect, b: DOMRect) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    return texto.flatMap((t) => fijos.filter((f) => choca(cajas(f), cajas(t))).map((f) => `${f.tagName} ${f.getAttribute("aria-label") ?? ""}`));
  });
  expect(cruces).toEqual([]);
});

test("390 px: al final de la página la barra inferior y Hifa no tapan el pie", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY + window.innerHeight - document.documentElement.scrollHeight))).toBe(0);
  const pie = (await page.getByRole("contentinfo").boundingBox())!;
  const barra = (await page.getByRole("navigation", { name: "Principal" }).boundingBox())!;
  const hifa = (await page.getByRole("button", { name: "Hablar con Hifa" }).boundingBox())!;
  // El contenido del pie (sus textos y enlaces), sin el espacio de abajo.
  const texto = (await page.getByRole("contentinfo").locator(":scope > div").first().boundingBox())!;
  expect(texto.y + texto.height).toBeLessThanOrEqual(hifa.y);
  expect(texto.y + texto.height).toBeLessThanOrEqual(barra.y);
  expect(pie.y + pie.height).toBeGreaterThanOrEqual(barra.y);
});

test("390 px: la barra inferior es la misma en el claro y en el oscuro y sigue a 48 px de alto mínimo", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/mi-tierra");
  for (const tema of ["claro", "oscuro"]) {
    await page.evaluate((t) => document.documentElement.setAttribute("data-tema", t), tema);
    const barra = page.getByRole("navigation", { name: "Principal" });
    await expect(barra.getByRole("link", { name: "Mi tierra" })).toHaveAttribute("aria-current", "page");
    await expect(barra.getByRole("link")).toHaveCount(5);
  }
});

test("1440 px: no hay barra inferior ni botón Más", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Más", exact: true })).toBeHidden();
  await expect(page.getByRole("navigation", { name: "Principal" })).toHaveCount(1);
  expect((await page.getByRole("navigation", { name: "Principal" }).boundingBox())!.x).toBe(0);
});
