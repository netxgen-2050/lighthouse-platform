import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";
import { ignorarEnSinRed } from "./ayudas";

const dibujo = (page: Page) => page.getByRole("img", { name: /Dibujo de la estructura/ });
const migas = (page: Page) => page.getByRole("navigation", { name: "Dónde estás en la estructura" });
const panel = (page: Page) => page.getByRole("region", { name: "Detalle" });
const arbol = (page: Page) => page.locator("details");
const rolesDePersona = (page: Page) => page.getByTestId("roles-de-persona");

async function abrirLista(page: Page) {
  const resumen = page.getByText("Ver toda la estructura como lista");
  if (!(await arbol(page).evaluate((d) => (d as HTMLDetailsElement).open))) await resumen.click();
}

/** Toca un círculo del dibujo (un clic directo sobre el círculo: el centro puede estar tapado por sus hijos). */
async function tocarCirculo(page: Page, id: string) {
  await dibujo(page).locator(`circle[data-nodo="${id}"]`).dispatchEvent("click");
}

/** Hace zoom a un lugar desde el botón de la lista. */
async function irDesdeLista(page: Page, nombre: string) {
  await abrirLista(page);
  await arbol(page).getByRole("button", { name: nombre, exact: true }).first().click();
}

const foco = (page: Page, id: string) => expect(dibujo(page)).toHaveAttribute("data-foco", id);

test.describe("Estructura de gobernanza visible", () => {
  test("muestra el común con sus círculos, el consejo y las doce tribus con su estado en texto", async ({ page }) => {
    const respuesta = await page.goto("/fogon/gobernanza");
    expect(respuesta?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Cómo decidimos" })).toBeVisible();
    await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
    await expect(page.getByText("Estructura de ejemplo: el reglamento lo define el diseño legal.")).toBeVisible();
    await expect(page.getByText("Los círculos, los roles y las personas de esta página son de ejemplo.")).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);
    await expect(dibujo(page)).toBeVisible();
    await abrirLista(page);
    const l = arbol(page);
    for (const n of ["Agua del Lighthouse", "Tokenomics y Semillas", "Consejo de tribus", "Comunicación del común"]) {
      await expect(l.getByRole("button", { name: n, exact: true })).toBeVisible();
    }
    await expect(l.getByText(/^Estado:/)).toHaveCount(12);
    const valle = l.getByRole("listitem").filter({ has: page.getByRole("button", { name: "Valle Solar", exact: true }) }).last();
    await expect(valle).toContainText("Estado: ● Activa");
    const barda = l.getByRole("listitem").filter({ has: page.getByRole("button", { name: "Barda Productiva", exact: true }) }).last();
    await expect(barda).toContainText("En formación");
  });

  test("Barrio 3 busca tribu, con Lugar libre, sin círculos y sin lugar en el consejo", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await abrirLista(page);
    const b3 = arbol(page).getByRole("listitem").filter({ has: page.getByRole("button", { name: "Barrio 3", exact: true }) }).last();
    await expect(b3).toContainText("Busca tribu");
    await expect(b3).toContainText("Lugar libre");
    await arbol(page).getByRole("button", { name: "Barrio 3", exact: true }).click();
    await foco(page, "grano");
    await expect(panel(page)).toContainText("Tipo: Tribu");
    await expect(panel(page)).toContainText("Lugar libre");
    await expect(panel(page)).toContainText("Sin lugar en el consejo todavía");
    await expect(panel(page).getByRole("button", { name: "Cuidado de la tierra" })).toHaveCount(0);
    await expect(arbol(page).getByText("Lugar de Barrio 3")).toHaveCount(0);
  });

  test("el consejo tiene un lugar por tribu validada, sin representante y sin nombres inventados", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await tocarCirculo(page, "consejo");
    await foco(page, "consejo");
    await expect(panel(page)).toContainText("Tipo: Consejo");
    await expect(panel(page).getByText(/^Lugar de /)).toHaveCount(8);
    await expect(panel(page).getByText("Sin representante elegido")).toHaveCount(8);
    await expect(panel(page).getByText("Lugar de Valle Solar")).toBeVisible();
    await expect(panel(page).getByText("Lugar de Barrio 3")).toHaveCount(0);
    await expect(panel(page).getByRole("button", { name: /\(ejemplo\)/ })).toHaveCount(0);
  });

  test("el círculo transversal cuelga del común, lista sus tribus y no inventa una zona", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await irDesdeLista(page, "Comunicación del común");
    await expect(panel(page)).toContainText("Tipo: Círculo transversal");
    await expect(panel(page)).toContainText("Participan: Valle Solar y Taller Común");
    await expect(panel(page)).toContainText("Zona del territorio: sin dato");
    await expect(panel(page)).not.toContainText(/lote/i);
    await expect(migas(page)).toContainText("Lighthouse");
  });
});

test.describe("Gráfico accesible", () => {
  test("el dibujo tiene un nombre que dice qué muestra y la lista anidada está cerrada hasta abrirla", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await expect(dibujo(page)).toBeVisible();
    await expect(arbol(page)).not.toHaveAttribute("open", "");
    await expect(page.getByText("Ver toda la estructura como lista")).toBeVisible();
    await abrirLista(page);
    await expect(arbol(page).getByRole("list").first()).toBeVisible();
  });

  test("solo con teclado se entra a Valle Solar desde la lista: dibujo, migas y panel", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    const resumen = page.getByText("Ver toda la estructura como lista");
    await resumen.focus();
    await page.keyboard.press("Enter");
    const boton = arbol(page).getByRole("button", { name: "Valle Solar", exact: true });
    await boton.focus();
    await expect(boton).toBeFocused();
    await page.keyboard.press("Enter");
    await foco(page, "valle");
    await expect(migas(page).getByRole("listitem")).toHaveText(["Lighthouse›", "Valle Solar"]);
    await expect(panel(page)).toContainText("Valle Solar");
    await expect(panel(page)).toContainText("Tipo: Tribu");
  });

  test("en 390 px no hay scroll horizontal, con el dibujo arriba y el panel abajo", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/fogon/gobernanza");
    await expect(dibujo(page)).toBeVisible();
    const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(sobra).toBeLessThanOrEqual(0);
    const d = await dibujo(page).boundingBox();
    const p = await panel(page).boundingBox();
    expect(d && p && d.y + d.height <= p.y + 1).toBe(true);
    await abrirLista(page);
    const sobraConLista = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(sobraConLista).toBeLessThanOrEqual(0);
  });

  test("con movimiento reducido el zoom cambia de una vez, sin animación", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/fogon/gobernanza");
    await tocarCirculo(page, "valle");
    await foco(page, "valle");
    const a = await dibujo(page).getAttribute("viewBox");
    await page.waitForTimeout(80);
    const b = await dibujo(page).getAttribute("viewBox");
    expect(a).toBe(b);
    await page.waitForTimeout(700);
    expect(await dibujo(page).getAttribute("viewBox")).toBe(a);
  });

  test("con movimiento normal el zoom se anima y termina en la vista final", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    const inicial = await dibujo(page).getAttribute("viewBox");
    await tocarCirculo(page, "valle");
    await foco(page, "valle");
    await page.waitForTimeout(900);
    const final = await dibujo(page).getAttribute("viewBox");
    expect(final).not.toBe(inicial);
  });
});

test.describe("Zoom por niveles", () => {
  test("entrar a Valle Solar desde el dibujo y volver al común tocando el fondo", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await foco(page, "lighthouse");
    await tocarCirculo(page, "valle");
    await foco(page, "valle");
    await expect(panel(page)).toContainText("Cuidado de la tierra");
    await dibujo(page).dispatchEvent("click");
    await foco(page, "lighthouse");
    await expect(panel(page)).toContainText("Tipo: Común");
  });

  test("tocar el círculo que ya está enfocado sale un nivel (haciendo clic en el círculo, no en el fondo)", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await tocarCirculo(page, "valle");
    await foco(page, "valle");
    await tocarCirculo(page, "valle");
    await foco(page, "lighthouse");
  });

  test("las migas llevan al común y la actual queda marcada como ubicación actual", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await irDesdeLista(page, "Valle Solar");
    await panel(page).getByRole("button", { name: "Cuidado de la tierra" }).click();
    await foco(page, "valle-0");
    await expect(migas(page).getByRole("listitem")).toHaveText(["Lighthouse›", "Valle Solar›", "Cuidado de la tierra"]);
    await expect(migas(page).locator('[aria-current="location"]')).toHaveText("Cuidado de la tierra");
    await migas(page).getByRole("button", { name: "Lighthouse" }).click();
    await foco(page, "lighthouse");
    await expect(migas(page).locator('[aria-current="location"]')).toHaveText("Lighthouse");
  });
});

test.describe("Panel de detalle", () => {
  test("un círculo del común dice su tipo, propósito, de qué decide y sus roles", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await irDesdeLista(page, "Agua del Lighthouse");
    await foco(page, "comun-agua");
    const p = panel(page);
    await expect(p).toContainText("Tipo: Círculo del común");
    await expect(p).toContainText("Propósito: Agua");
    await expect(p.getByText("Cuenca y riego")).toBeVisible();
    await expect(p.getByText("Cisternas compartidas")).toBeVisible();
    await expect(p.getByRole("heading", { name: /Roles del círculo/ })).toBeVisible();
  });

  test("una tribu dice tipo, estado, validación, de qué decide y sus círculos navegables", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await irDesdeLista(page, "Valle Solar");
    const p = panel(page);
    await expect(p).toContainText("Tipo: Tribu");
    await expect(p).toContainText("Activa");
    await expect(p).toContainText("Validada por el común (ejemplo)");
    await expect(p.getByText("Su barrio")).toBeVisible();
    for (const c of ["Cuidado de la tierra", "Arquitectura", "Comunicación", "Energía solar"]) {
      await expect(p.getByRole("button", { name: c, exact: true })).toBeVisible();
    }
    await expect(p.getByRole("link", { name: "Ver la ficha de la tribu" })).toHaveAttribute("href", "/tribus/valle");
  });

  test("un dato que falta dice sin dato: una tribu que busca tribu no decide nada todavía", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await irDesdeLista(page, "Barrio 3");
    await expect(panel(page)).toContainText("Propósito: sin dato");
    await expect(panel(page).getByRole("heading", { name: /Decide sobre/ })).toBeVisible();
    await expect(panel(page).getByText("sin dato", { exact: true })).toBeVisible();
  });
});

test.describe("Roles en cada círculo", () => {
  test("el panel de Huerta intensiva lista a Ana (ejemplo) con Facilita", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await irDesdeLista(page, "Huerta intensiva");
    const ana = panel(page).getByRole("button", { name: /Ana \(ejemplo\)/ });
    await expect(ana).toContainText("Facilita");
    await expect(panel(page).getByRole("button", { name: /\(ejemplo\)/ }).first()).toBeVisible();
  });

  test("la lista muestra a cada persona debajo de su círculo con su rol en texto", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await abrirLista(page);
    const agua = arbol(page).getByRole("listitem").filter({ has: page.getByRole("button", { name: "Agua del Lighthouse", exact: true }) }).last();
    await expect(agua.getByRole("button", { name: "Ana (ejemplo) · Miembro" })).toBeVisible();
    await expect(agua.getByRole("button", { name: "Bruno (ejemplo) · Facilita" })).toBeVisible();
  });
});

test.describe("Roles visibles en el dibujo", () => {
  test("al entrar a Agua del Lighthouse en escritorio se ve cada nombre y, debajo, su rol", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await irDesdeLista(page, "Agua del Lighthouse");
    await foco(page, "comun-agua");
    const ana = dibujo(page).locator("g", { has: page.locator("text", { hasText: /^Ana$/ }) }).last();
    await expect(ana.locator("text").nth(0)).toHaveText("Ana");
    await expect(ana.locator("text").nth(1)).toHaveText("Miembro");
    await expect(dibujo(page).getByText("Bruno", { exact: true })).toBeVisible();
    await expect(dibujo(page).getByText("Facilita", { exact: true })).toBeVisible();
  });

  test("en el nivel del común el dibujo no muestra nombres ni roles, pero el panel y la lista siguen", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await expect(dibujo(page).getByText("Ana", { exact: true })).toHaveCount(0);
    await expect(dibujo(page).getByText("Miembro", { exact: true })).toHaveCount(0);
    await abrirLista(page);
    await expect(arbol(page).getByRole("button", { name: /Ana \(ejemplo\) · / }).first()).toBeVisible();
  });
});

test.describe("Todos los roles de una persona", () => {
  test("Ana tiene dos roles en dos niveles", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await irDesdeLista(page, "Huerta intensiva");
    await panel(page).getByRole("button", { name: /Ana \(ejemplo\)/ }).click();
    const r = rolesDePersona(page);
    await expect(r.getByRole("heading", { name: "Todos los roles de Ana (ejemplo)" })).toBeVisible();
    await expect(r.getByRole("button")).toHaveText([
      "Miembro en Agua del Lighthouse (el común)",
      "Facilita en Huerta intensiva (Semilla Viva)",
      "Dejar de ver a esta persona",
    ]);
  });

  test("Bruno tiene tres roles en tres lugares", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await irDesdeLista(page, "Agua del Lighthouse");
    await panel(page).getByRole("button", { name: /Bruno \(ejemplo\)/ }).click();
    await expect(rolesDePersona(page).getByRole("button")).toHaveText([
      "Facilita en Agua del Lighthouse (el común)",
      "Enlace hacia arriba en Toma y cisterna (Agua Clara)",
      "Memoria en Energía solar (Valle Solar)",
      "Dejar de ver a esta persona",
    ]);
  });

  test("solo con teclado: de la lista a Ana y de su rol a Agua del Lighthouse, con las migas", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await abrirLista(page);
    const enLista = arbol(page).getByRole("button", { name: "Ana (ejemplo) · Miembro" });
    await enLista.focus();
    await page.keyboard.press("Enter");
    await expect(rolesDePersona(page)).toBeVisible();
    const rol = rolesDePersona(page).getByRole("button", { name: "Miembro en Agua del Lighthouse (el común)" });
    await rol.focus();
    await page.keyboard.press("Enter");
    await foco(page, "comun-agua");
    await expect(migas(page).getByRole("listitem")).toHaveText(["Lighthouse›", "Agua del Lighthouse"]);
    await expect(rolesDePersona(page).getByRole("heading", { name: "Todos los roles de Ana (ejemplo)" })).toBeVisible();
  });

  test("una persona con un solo rol muestra ese rol, sin lista vacía ni roles inventados", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await irDesdeLista(page, "Compost");
    const primera = panel(page).getByRole("list").last().getByRole("button").first();
    await primera.click();
    const r = rolesDePersona(page);
    await expect(r.getByRole("heading", { name: /^Todos los roles de .* \(ejemplo\)$/ })).toBeVisible();
    await expect(r.getByRole("listitem")).toHaveCount(1);
    await expect(r.getByRole("listitem").first()).toContainText(" en Compost (Semilla Viva)");
  });

  test("tocar a una persona en el dibujo la elige sin cambiar de nivel", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await irDesdeLista(page, "Agua del Lighthouse");
    await foco(page, "comun-agua");
    await dibujo(page).locator('circle[data-nodo="comun-agua-rol-1"]').dispatchEvent("click");
    await expect(rolesDePersona(page)).toBeVisible();
    await foco(page, "comun-agua");
  });
});

test.describe("Lentes", () => {
  test("las cuatro lentes son botones con aria-pressed y Estructura arranca elegida", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    const barra = page.getByRole("group", { name: "Lentes" });
    await expect(barra.getByRole("button")).toHaveText([/Estructura$/, /Propósitos$/, /Decisiones que suben$/, /Desde mí$/]);
    await expect(barra.getByRole("button", { name: "Estructura" })).toHaveAttribute("aria-pressed", "true");
    await barra.getByRole("button", { name: "Propósitos" }).click();
    await expect(barra.getByRole("button", { name: "Propósitos" })).toHaveAttribute("aria-pressed", "true");
    await expect(barra.getByRole("button", { name: "Estructura" })).toHaveAttribute("aria-pressed", "false");
  });

  test("Propósitos muestra la leyenda con Tierra, Agua, Economía, Comunidad, Conocimiento y Gobierno, cada uno con su texto", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await page.getByRole("button", { name: "Propósitos" }).click();
    const leyenda = page.getByRole("region", { name: "Leyenda" });
    await expect(leyenda.getByRole("listitem")).toHaveText(["Tierra", "Agua", "Economía", "Comunidad", "Conocimiento", "Gobierno"]);
  });

  test("el propósito también es texto, no solo color: el panel y la lista dicen Propósito: Tierra", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await page.getByRole("button", { name: "Propósitos" }).click();
    await irDesdeLista(page, "Banco de semillas");
    await expect(panel(page)).toContainText("Propósito: Tierra");
    const fila = arbol(page).getByRole("listitem").filter({ has: page.getByRole("button", { name: "Banco de semillas", exact: true }) }).last();
    await expect(fila).toContainText("Propósito: Tierra");
  });
});

test.describe("Lente Decisiones que suben", () => {
  const decisiones = (page: Page) => page.getByRole("button", { name: "Decisiones que suben" });

  test("el camino que sube: el dibujo marca 1 a 4 y el panel dice el mismo camino en texto", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await decisiones(page).click();
    await panel(page).getByRole("button", { name: "Pedido de Valle Solar al Fondo Común para la bomba solar" }).click();
    await expect(page.getByTestId("camino-texto").getByRole("listitem")).toHaveText([
      "1. Cuidado de la tierra ›",
      "2. Valle Solar ›",
      "3. Consejo de tribus ›",
      "4. Lighthouse",
    ]);
    await expect(dibujo(page).locator("g[aria-hidden] text").filter({ hasText: /^[1-4]$/ })).toHaveText(["1", "2", "3", "4"]);
    await expect(panel(page)).toContainText("Sube.");
  });

  test("la derivación termina en Agua del Lighthouse y el panel explica que el consejo la derivó", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await decisiones(page).click();
    await panel(page).getByRole("button", { name: "Cisterna compartida entre Agua Clara y Valle Solar" }).click();
    await expect(page.getByTestId("camino-texto").getByRole("listitem").last()).toHaveText("4. Agua del Lighthouse");
    await expect(panel(page)).toContainText("El consejo la derivó a un círculo del común");
  });

  test("los parámetros que existen se muestran y los que faltan no tienen fila", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await decisiones(page).click();
    await panel(page).getByRole("button", { name: "Pedido de Valle Solar al Fondo Común para la bomba solar" }).click();
    await expect(panel(page)).toContainText("Cierra el:");
    await expect(panel(page)).toContainText("Monto pedido:");
    await expect(panel(page)).toContainText("Fuente: Fondo Común");
    await expect(panel(page)).not.toContainText("Se apoya en:");
    await panel(page).getByRole("button", { name: "Cisterna compartida entre Agua Clara y Valle Solar" }).click();
    await expect(panel(page)).toContainText("Monto pedido: sin dato");
  });

  test("lo que se decide abajo tiene dos pasos dentro de Valle Solar y no hace falta subir", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await decisiones(page).click();
    await panel(page).getByRole("button", { name: "Calendario de siembra de otoño" }).click();
    await expect(page.getByTestId("camino-texto").getByRole("listitem")).toHaveCount(2);
    await expect(panel(page)).toContainText("no hace falta subir");
  });

  test("una decisión llevada al consejo desde este navegador se suma a la lista con su camino", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("lh-fogon", JSON.stringify({ votos: {}, alConsejo: ["cisterna"] }));
    });
    await page.goto("/fogon/gobernanza");
    await decisiones(page).click();
    await panel(page).getByRole("button", { name: /Pedir al Fondo Común una cisterna/ }).click();
    await expect(page.getByTestId("camino-texto").getByRole("listitem")).toHaveText(["1. Valle Solar ›", "2. Consejo de tribus"]);
  });
});

test.describe("Lente Desde mí", () => {
  const desdeMi = (page: Page) => page.getByRole("button", { name: "Desde mí" });

  test("varios niveles: Permacultura y suelo (del común) y Cuidado de la tierra (de Valle Solar), con su rol y (ejemplo)", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await desdeMi(page).click();
    const lugares = panel(page).getByRole("listitem");
    const perma = lugares.filter({ hasText: "Permacultura y suelo" }).first();
    await expect(perma).toContainText("(ejemplo)");
    await expect(perma).toContainText("Tu rol: Miembro");
    const tierra = lugares.filter({ hasText: "Cuidado de la tierra" }).first();
    await expect(tierra).toContainText("(ejemplo)");
    await expect(tierra).toContainText("Tu rol: Enlace hacia arriba");
    await expect(tierra).toContainText("Lighthouse › Valle Solar › Cuidado de la tierra");
    await expect(tierra).toContainText("Decidís sobre: Calendario de siembra, Manejo del suelo");
    await tierra.getByRole("button", { name: "Ir a este círculo" }).click();
    await foco(page, "valle-0");
  });

  test("con la membresía de Taller Común aceptada (simulado) también aparece Taller Común como Miembro", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro", taller: "miembro", valle: "pedido" }));
    });
    await page.goto("/fogon/gobernanza");
    await desdeMi(page).click();
    const taller = panel(page).getByRole("listitem").filter({ hasText: "Taller Común" }).first();
    await expect(taller).toContainText("Tu rol: Miembro");
    await expect(panel(page).getByRole("listitem").filter({ hasText: "Valle Solar" }).filter({ hasText: "Tu rol: Miembro" })).toHaveCount(0);
  });

  test("con localStorage roto quedan los dos lugares de ejemplo", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("lh-membresia", "{esto no es json");
      window.localStorage.setItem("lh-sumarte", "[1,2");
      window.localStorage.setItem("lh-fogon", "nada");
    });
    await page.goto("/fogon/gobernanza");
    await desdeMi(page).click();
    await expect(panel(page).getByRole("button", { name: "Ir a este círculo" })).toHaveCount(2);
  });

  test("liderar una tribu en Sumarte suma el rol Facilita", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("lh-sumarte", JSON.stringify({ plan: "miembro", tribu: true, tribuId: "valle" }));
    });
    await page.goto("/fogon/gobernanza");
    await desdeMi(page).click();
    await expect(panel(page).getByRole("listitem").filter({ hasText: "Tu rol: Facilita" })).toHaveCount(1);
  });

  test("las ideas de gamificación son solo texto: sin puntajes, Semillas ni botones para ganarlas, y no se escribe nada", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await desdeMi(page).click();
    await expect(panel(page).getByRole("heading", { name: "Ideas para más adelante" })).toBeVisible();
    await expect(panel(page)).toContainText("todavía no hay puntajes ni nada para ganar");
    await expect(panel(page).getByRole("button", { name: /ganar|canjear|reclamar/i })).toHaveCount(0);
    const claves = await page.evaluate(() => Object.keys(window.localStorage));
    expect(claves.filter((c) => c === "lh-gobernanza")).toEqual([]);
  });

  test("las marcas resaltan los lugares con borde grueso y no cambian la cantidad de círculos", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await expect(dibujo(page).locator("circle[data-nodo]")).not.toHaveCount(0);
    const antes = await dibujo(page).locator("circle[data-nodo]").count();
    await desdeMi(page).click();
    expect(await dibujo(page).locator("circle[data-nodo]").count()).toBe(antes);
    await expect(dibujo(page).locator('circle[data-nodo="valle-0"]')).toHaveAttribute("stroke-width", "3");
  });
});

test.describe("Cómo decidimos", () => {
  test("el botón de reportar está presente", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await expect(page.getByRole("button", { name: "Reportar un problema o una idea" })).toBeVisible();
  });

  test("los términos ⚖ nuevos (Decide sobre y doble enlace) se abren y avisan que son borrador", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await irDesdeLista(page, "Huerta intensiva");
    const dominio = panel(page).getByRole("button", { name: /Qué significa legalmente: Decide sobre/ });
    await dominio.click();
    await expect(page.getByText(/borrador/i).first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel(page).getByRole("button", { name: /Qué significa legalmente: Doble enlace/ })).toBeVisible();
  });

  test("no sale ningún pedido de red con datos de gobernanza", async ({ page }) => {
    const pedidos: string[] = [];
    page.on("request", (r) => {
      if (r.method() !== "GET") pedidos.push(`${r.method()} ${r.url()}`);
    });
    await page.goto("/fogon/gobernanza");
    await page.getByRole("button", { name: "Desde mí" }).click();
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

  test("las lentes, las migas, el panel y la leyenda salen en inglés", async ({ page }) => {
    await page.goto("/fogon/gobernanza");
    await expect(page.getByRole("heading", { level: 1, name: "How we decide" })).toBeVisible();
    await expect(page.getByText("This page is only available in Spanish for now.")).toHaveCount(0);
    const barra = page.getByRole("group", { name: "Lenses" });
    await expect(barra.getByRole("button")).toHaveText([/Structure$/, /Purposes$/, /Decisions going up$/, /From me$/]);
    await expect(page.getByRole("navigation", { name: "Where you are in the structure" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Detail" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Legend" })).toBeVisible();
    await page.getByText("See the whole structure as a list").click();
    await expect(page.getByText("Taking part: Valle Solar and Taller Común")).toBeVisible();
    await page.locator("details").getByRole("button", { name: "Lighthouse water", exact: true }).click();
    await expect(page.getByRole("region", { name: "Detail" })).toContainText("Purpose: Water");
    await expect(page.getByRole("region", { name: "Detail" })).toContainText("Circle of the commons");
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
    // Validar (crear el registro) no manda nada por la red.
    const pedidos: string[] = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (ignorarEnSinRed(r) || u.pathname === "/api/sesion") return;
      const claves = [...u.searchParams.keys()];
      if (r.method() === "GET" && claves.length === 1 && claves[0] === "_rsc" && !u.hash) return;
      if (["fetch", "xhr", "websocket", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") pedidos.push(`${r.method()} ${r.url()}`);
    });
    await page.goto("/panel");
    await expect(page.getByText("Validada por Taller Común")).toBeVisible();
    await expect(page.getByText("Validada por Valle Solar")).toHaveCount(0);
    expect(pedidos).toEqual([]);
    const registros = await page.evaluate(() => JSON.parse(window.localStorage.getItem("lh-gobernanza") ?? "[]"));
    expect(registros).toHaveLength(1);
    expect(registros[0]).toMatchObject({ esquema: "valida-persona", afirma: "taller", apuntaA: null });
    // Al recargar no se duplica.
    await page.reload();
    await expect(page.getByText("Validada por Taller Común")).toBeVisible();
    const despues = await page.evaluate(() => JSON.parse(window.localStorage.getItem("lh-gobernanza") ?? "[]"));
    expect(despues).toHaveLength(1);
    expect(pedidos).toEqual([]);
  });
});
