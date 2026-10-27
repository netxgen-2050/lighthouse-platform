import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";

const lista = (page: Page) => page.getByRole("region", { name: "La estructura en una lista" });
const tribu = (page: Page, nombre: string) =>
  lista(page).getByRole("listitem").filter({ has: page.getByRole("link", { name: nombre, exact: true }) }).last();

test.describe("Cómo decidimos", () => {
  test("muestra el común, las doce tribus con su estado, los círculos de Valle Solar y el consejo", async ({ page }) => {
    const respuesta = await page.goto("/fogon/gobernanza");
    expect(respuesta?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Cómo decidimos" })).toBeVisible();
    await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
    await expect(page.getByText("Estructura de ejemplo: el reglamento lo define el diseño legal.")).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);
    await expect(lista(page)).toContainText("Lighthouse (el común)");
    await expect(lista(page).locator("a[href^='/tribus/']")).toHaveCount(12);

    const valle = tribu(page, "Valle Solar");
    await expect(valle).toContainText("Activa");
    for (const c of ["Cuidado de la tierra", "Arquitectura", "Comunicación"]) await expect(valle).toContainText(c);
    await expect(tribu(page, "Barda Productiva")).toContainText("En formación");

    const consejo = page.getByRole("region", { name: /El consejo/ });
    await expect(consejo.getByRole("heading", { level: 2, name: /El consejo/ })).toBeVisible();
    await expect(consejo.getByText(/^Lugar de /)).toHaveCount(8);
    await expect(consejo.getByText("Lugar de Valle Solar")).toBeVisible();
    await expect(consejo.getByText("Sin representante elegido").first()).toBeVisible();
  });

  test("Barrio 3 busca tribu, sin círculos y sin lugar en el consejo", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    const b3 = tribu(page, "Barrio 3");
    await expect(b3).toContainText("Busca tribu");
    await expect(b3).toContainText("Sin círculos todavía");
    await expect(b3).toContainText("Sin lugar en el consejo todavía");
    await expect(page.getByText("Lugar de Barrio 3")).toHaveCount(0);
  });

  test("el círculo transversal cuelga del común, lista sus tribus y no inventa una zona", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    const transversales = lista(page).getByRole("listitem").filter({ has: page.getByRole("heading", { name: /Círculos transversales/ }) }).last();
    await expect(transversales).toContainText("Comunicación del común");
    await expect(transversales).toContainText("Participan: Valle Solar y Taller Común");
    await expect(transversales).toContainText("Zona del territorio: sin dato");
    await expect(transversales).not.toContainText(/lote|\b0\b/i);
  });

  test("el dibujo se ve en pantalla ancha, con nombre accesible, y no comunica el estado solo con color", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    const dibujo = page.getByRole("img", { name: /Dibujo de la estructura/ });
    await expect(dibujo).toBeVisible();
    await expect(dibujo.getByText("○ Busca tribu")).toHaveCount(4);
    await expect(dibujo.getByText("● Activa")).toHaveCount(3);
    await expect(dibujo.getByText("◐ En formación")).toHaveCount(5);
  });

  test("la lista se recorre con teclado: de una tribu a la siguiente con Tab", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await page.getByRole("link", { name: "Semilla Viva", exact: true }).focus();
    const visitados: string[] = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      const href = await page.evaluate(() => (document.activeElement as HTMLAnchorElement | null)?.getAttribute("href") ?? "");
      if (href.startsWith("/tribus/")) visitados.push(href);
      if (visitados.length > 0) break;
    }
    expect(visitados).toEqual(["/tribus/barda"]);
  });

  test("en 390 px no hay scroll horizontal y se muestra la lista, no el dibujo", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/fogon/gobernanza");
    await expect(page.getByRole("img", { name: /Dibujo de la estructura/ })).toBeHidden();
    await expect(lista(page)).toBeVisible();
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(sobra).toBeLessThanOrEqual(0);
  });

  test("el botón de reportar está presente", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await expect(page.getByRole("button", { name: "Reportar un problema o una idea" })).toBeVisible();
  });

  test("los términos ⚖ nuevos se abren y avisan que son borrador", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    const boton = page.getByRole("button", { name: /Qué significa legalmente/ }).first();
    await boton.click();
    await expect(page.getByText(/borrador/i).first()).toBeVisible();
  });

  test("no sale ningún pedido de red con datos de gobernanza", async ({ page }) => {
    const pedidos: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET") pedidos.push(`${r.method()} ${r.url()}`);
    });
    await page.goto("/fogon/gobernanza");
    expect(pedidos.filter((p) => !p.includes("/api/sesion"))).toEqual([]);
  });

  test("axe sin violaciones serias o críticas", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
  });
});

test.describe("Cómo decidimos en inglés", () => {
  test.use({ locale: "en-US" });

  test("la página sale en inglés, sin el aviso de página solo en español", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await expect(page.getByRole("heading", { level: 1, name: "How we decide" })).toBeVisible();
    await expect(page.getByText("Taking part: Valle Solar and Taller Común")).toBeVisible();
    await expect(page.getByText("This page is only available in Spanish for now.")).toHaveCount(0);
  });
});

test.describe("Validaciones visibles", () => {
  test("la ficha de Valle Solar dice Validada por el común y la de Barrio 3 dice que todavía no", async ({ page }) => {
    await page.goto("/tribus/valle");
    await expect(page.getByText("Validada por el común")).toBeVisible();
    await expect(page.getByText("Todavía no validada por el común")).toHaveCount(0);
    await page.goto("/tribus/grano");
    await expect(page.getByText("Todavía no validada por el común")).toBeVisible();
  });

  test("Mi recorrido sin membresías dice que ninguna tribu validó todavía", async ({ page }) => {
    await page.goto("/panel");
    await expect(page.getByRole("heading", { name: /Quiénes te validaron/ })).toBeVisible();
    await expect(page.getByText("Todavía ninguna tribu te validó.")).toBeVisible();
  });

  test("con la membresía de Taller Común aceptada, Mi recorrido dice Validada por Taller Común y deja un registro", async ({ page }) => {
    await page.addInitScript(() => {
      if (window.localStorage.getItem("lh-membresia")) return;
      window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro", taller: "miembro", valle: "pedido" }));
    });
    await page.goto("/panel");
    await expect(page.getByText("Validada por Taller Común")).toBeVisible();
    await expect(page.getByText("Validada por Valle Solar")).toHaveCount(0);
    const registros = await page.evaluate(() => JSON.parse(window.localStorage.getItem("lh-gobernanza") ?? "[]"));
    expect(registros).toHaveLength(1);
    expect(registros[0]).toMatchObject({ esquema: "valida-persona", afirma: "taller", apuntaA: null });
    // Al recargar no se duplica.
    await page.reload();
    await expect(page.getByText("Validada por Taller Común")).toBeVisible();
    const despues = await page.evaluate(() => JSON.parse(window.localStorage.getItem("lh-gobernanza") ?? "[]"));
    expect(despues).toHaveLength(1);
  });
});
