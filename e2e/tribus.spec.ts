import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { listarTribus } from "@/lib/tribus/datos";

test("listado: 12 tarjetas en orden con estado escrito", async ({ page }) => {
  await page.goto("/tribus");
  const links = page.locator("main ul > li > a");
  await expect(links).toHaveCount(12);
  await expect(links.first()).toContainText("Barrio 1");
  await expect(links.last()).toContainText("Barrio 12");
  await expect(links.first()).toHaveAttribute("href", "/tribus/semilla");
  await expect(page.getByText("Estado: Activa").first()).toBeVisible();
  await expect(page.getByText("Estado: En formación").first()).toBeVisible();
  await expect(page.getByText("Estado: Busca tribu").first()).toBeVisible();
  await expect(page.getByText("Tribus, personas y cifras de ejemplo.")).toBeVisible();
});

test("valle: tribu activa", async ({ page }) => {
  await page.goto("/tribus/valle");
  await expect(page.getByRole("heading", { name: "Valle Solar" })).toBeVisible();
  for (const h of ["Lo que tiene", "Lo que busca", "Lo que aporta al pozo común", "Cómo se entra"]) {
    await expect(page.getByRole("heading", { name: h })).toBeVisible();
  }
  await expect(page.getByText("Asociación civil")).toBeVisible();
});

test("avelan: áreas abiertas marcadas con texto", async ({ page }) => {
  await page.goto("/tribus/avelan");
  for (const a of ["Nutrición", "Energía", "Encuentros"]) {
    await expect(page.getByText(`${a} (abierta)`)).toBeVisible();
  }
  await expect(page.getByText("Educación (abierta)")).toHaveCount(0);
});

test("grano: barrio vacante", async ({ page }) => {
  await page.goto("/tribus/grano");
  await expect(page.getByRole("heading", { name: "Barrio 3 busca tribu" })).toBeVisible();
  for (const n of ["Agricultura extensiva", "Animales", "Molienda"]) {
    await expect(page.getByText(n)).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Lo que tiene" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Lo que aporta al pozo común" })).toHaveCount(0);
});

test("id desconocido: 404 con vuelta al listado", async ({ page }) => {
  const r = await page.goto("/tribus/no-existe");
  expect(r?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Volver a las tribus" })).toHaveAttribute("href", "/tribus");
});

const RITUAL = "Qué significa legalmente: Ritual de entrada";
const PERSONERIA = "Qué significa legalmente: Comunidad con personería";

test.describe("⚖ como tooltip, con mouse", () => {
  test("pasar y sacar el mouse", async ({ page }) => {
    await page.goto("/tribus/valle");
    const boton = page.getByRole("button", { name: RITUAL });
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await boton.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText("Ritual de entrada");
    await expect(tooltip).toContainText("Ley 23.592");
    await expect(boton).toHaveAttribute("aria-describedby", /.+/);
    await page.mouse.move(0, 0);
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await expect(boton).not.toHaveAttribute("aria-describedby", /.+/);
  });

  test("pasar del ⚖ al tooltip lo mantiene visible", async ({ page }) => {
    await page.goto("/tribus/valle");
    await page.getByRole("button", { name: RITUAL }).hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await tooltip.hover();
    await expect(tooltip).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  });

  test("dos ⚖ cercanos: no se desplaza el contenido y el segundo sigue accesible", async ({ page }) => {
    await page.goto("/tribus/valle");
    const ritual = page.getByRole("button", { name: RITUAL });
    const personeria = page.getByRole("button", { name: PERSONERIA });
    const antes = await personeria.boundingBox();
    await ritual.hover();
    await expect(page.getByRole("tooltip")).toBeVisible();
    const despues = await personeria.boundingBox();
    expect(despues).toEqual(antes);
    // El tooltip no tapa al segundo ⚖: el punto de su centro cae sobre el botón, no sobre el tooltip.
    const tapado = await personeria.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const arriba = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return !el.contains(arriba);
    });
    expect(tapado).toBe(false);
    // Tampoco tapa el ⚖ propio.
    const propioTapado = await ritual.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const arriba = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return !el.contains(arriba);
    });
    expect(propioTapado).toBe(false);
    await personeria.hover();
    await expect(page.getByRole("tooltip")).toHaveCount(1);
    await expect(page.getByRole("tooltip")).toContainText("Comunidad con personería");
  });
});

test.describe("⚖ como tooltip, posición y accesibilidad", () => {
  test("cerca del borde superior abre hacia abajo y queda dentro de la pantalla", async ({ page }) => {
    await page.goto("/tribus/valle");
    const boton = page.getByRole("button", { name: RITUAL });
    // La página es corta: se agrega alto para poder dejar el ⚖ pegado al borde superior.
    await page.evaluate(() => {
      document.body.style.paddingBottom = "2000px";
    });
    await boton.evaluate((el) => window.scrollBy(0, el.getBoundingClientRect().top - 2));
    await boton.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    const caja = await tooltip.boundingBox();
    const cajaBoton = await boton.boundingBox();
    expect(caja!.y).toBeGreaterThanOrEqual(0);
    expect(caja!.y).toBeGreaterThanOrEqual(cajaBoton!.y + cajaBoton!.height - 1);
  });

  test("axe sin violaciones serias o críticas con el tooltip abierto", async ({ page }) => {
    await page.goto("/tribus/valle");
    await page.getByRole("button", { name: RITUAL }).hover();
    await expect(page.getByRole("tooltip")).toBeVisible();
    const r = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
  });
});

test.describe("⚖ como tooltip, híbrido (toque en pantalla que también tiene hover)", () => {
  test.use({ hasTouch: true });

  test("un toque muestra aunque el dispositivo tenga hover", async ({ page }) => {
    await page.goto("/tribus/valle");
    const boton = page.getByRole("button", { name: RITUAL });
    await boton.tap();
    await expect(page.getByRole("tooltip")).toContainText("Ley 23.592");
    await boton.tap();
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  });
});

test.describe("⚖ como tooltip, con teclado", () => {
  test("Tab muestra, Escape esconde sin mover el foco, Tab no la vuelve a mostrar", async ({ page }) => {
    await page.goto("/tribus/valle");
    const boton = page.getByRole("button", { name: RITUAL });
    let llego = false;
    for (let i = 0; i < 60 && !llego; i++) {
      await page.keyboard.press("Tab");
      llego = await boton.evaluate((el) => el === document.activeElement);
    }
    expect(llego).toBe(true);
    await expect(page.getByRole("tooltip")).toContainText("Ley 23.592");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await expect(boton).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(boton).not.toBeFocused();
    await expect(page.getByRole("tooltip")).toHaveCount(1);
    await expect(page.getByRole("tooltip")).not.toContainText("Ley 23.592");
  });

  test("al perder el foco el tooltip desaparece y el siguiente ⚖ muestra el suyo", async ({ page }) => {
    await page.goto("/tribus/valle");
    const ritual = page.getByRole("button", { name: RITUAL });
    const personeria = page.getByRole("button", { name: PERSONERIA });
    await page.keyboard.press("Tab");
    await ritual.focus();
    await expect(ritual).toBeFocused();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(personeria).toBeFocused();
    await expect(page.getByRole("tooltip")).toHaveCount(1);
    await expect(page.getByRole("tooltip")).toContainText("Comunidad con personería");
  });
});

test.describe("⚖ como tooltip, en celular", () => {
  test.use({ hasTouch: true, isMobile: true });

  test("un toque muestra, otro toque o un toque afuera esconde", async ({ page }) => {
    await page.goto("/tribus/valle");
    const boton = page.getByRole("button", { name: RITUAL });
    await boton.tap();
    await expect(page.getByRole("tooltip")).toContainText("Ley 23.592");
    await boton.tap();
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await boton.tap();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await page.getByRole("heading", { name: "Valle Solar" }).tap();
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  });
});

test("sin plata ni avales en pantalla (listado y las 12 tribus)", async ({ page }) => {
  const rutas = ["/tribus", ...listarTribus().map((t) => `/tribus/${t.id}`)];
  expect(rutas).toHaveLength(13);
  for (const ruta of rutas) {
    await page.goto(ruta);
    const texto = await page.locator("body").innerText();
    expect(texto, ruta).not.toMatch(/USD/);
    expect(texto.toLowerCase(), ruta).not.toContain("avales");
  }
});
