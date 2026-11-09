import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";
import { conAdhesionAlManifiesto, ignorarEnSinRed } from "./ayudas";

// Votar es participar en la gobernanza: pide haber adherido al manifiesto de Lighthouse VRN. Los escenarios sin
// adhesión están en `manifiesto-lighthouse-vrn.spec.ts`.
test.beforeEach(async ({ page }) => {
  await conAdhesionAlManifiesto(page);
});

const dibujo = (page: Page) => page.getByRole("img", { name: /Dibujo de la estructura/ });
const tarjeta = (page: Page, titulo: string | RegExp) =>
  page.getByRole("listitem").filter({ has: page.getByRole("heading", { level: 4, name: titulo }) });
const titulos = (page: Page) => page.getByRole("heading", { level: 4 });
const seccion = (page: Page, nombre: string) => page.getByRole("region", { name: `Propuestas en ${nombre}` });
const soloLas = (page: Page, nombre: string) => page.getByRole("button", { name: `Solo las de ${nombre}` });

test.describe("La holarquía es la portada", () => {
  test("lo primero que se ve es Cómo decidimos, con el dibujo del común y sin lista arriba", async ({ page }) => {
    const respuesta = await page.goto("/fogon");
    expect(respuesta?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1, name: "Cómo decidimos" })).toBeVisible();
    await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);
    await expect(dibujo(page)).toHaveAttribute("data-foco", "lighthouse");
    const yDibujo = (await dibujo(page).boundingBox())!.y;
    const yPrimera = (await titulos(page).first().boundingBox())!.y;
    expect(yDibujo).toBeLessThan(yPrimera);
  });

  test("no hay filtros por ámbito ni ámbito Fideicomiso, ni Asamblea de residentes", async ({ page }) => {
    await page.goto("/fogon");
    await expect(page.getByRole("group", { name: "Filtrar por ámbito" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Fideicomiso" })).toHaveCount(0);
    await expect(page.getByText(/Fideicomiso|Asamblea de beneficiarios|Asamblea de residentes/)).toHaveCount(0);
  });

  test("otras herramientas: consultas y simulador, cada una con su línea", async ({ page }) => {
    await page.goto("/fogon");
    const herramientas = page.getByRole("region", { name: "Otras herramientas" });
    await expect(herramientas.getByRole("link", { name: "Ver las consultas" })).toHaveAttribute("href", "/fogon/consultas");
    await expect(herramientas.getByRole("link", { name: "Abrir el simulador de parámetros" })).toHaveAttribute("href", "/netx/simulador");
    await expect(herramientas.getByRole("listitem")).toHaveCount(2);
  });

  test("/fogon/gobernanza redirige a /fogon conservando holón y lente, y nada más", async ({ page }) => {
    await page.goto("/fogon/gobernanza?holon=valle-0&lente=propositos&x=1");
    await expect(page).toHaveURL(/\/fogon\?holon=valle-0&lente=propositos$/);
    await expect(dibujo(page)).toHaveAttribute("data-foco", "valle-0");
  });
});

test.describe("Propuestas del holón al lado de la holarquía", () => {
  test("el común: se decide acá, nace o pasa por acá y los círculos de adentro, abiertos al llegar", async ({ page }) => {
    await page.goto("/fogon");
    const s = seccion(page, "Lighthouse VRN");
    await expect(s.getByRole("heading", { level: 3 })).toHaveText(["Se decide acá", "Nace o pasa por acá", "En los círculos de adentro"]);
    await expect(titulos(page).first()).toBeVisible();
    for (const t of [
      "Presupuesto 2027 del Fondo Común",
      "Usar el fondo común para la bomba solar",
      "Permitir animales de granja en las chacras",
      "Parámetros de la regalía de regeneración",
    ]) {
      await expect(s.getByRole("heading", { level: 4, name: t })).toBeVisible();
    }
    await expect(tarjeta(page, "Calendario de siembra de otoño")).toContainText("en Cuidado de la tierra · Valle Solar");
    await expect(soloLas(page, "Lighthouse VRN")).toHaveAttribute("aria-pressed", "false");
  });

  test("Solo las de Lighthouse VRN acota con el teclado, y se vuelve a mostrar al cambiar de holón", async ({ page }) => {
    await page.goto("/fogon");
    const boton = soloLas(page, "Lighthouse VRN");
    await boton.focus();
    await page.keyboard.press("Enter");
    await expect(boton).toHaveAttribute("aria-pressed", "true");
    await expect(tarjeta(page, "Calendario de siembra de otoño")).toHaveCount(0);
    await expect(tarjeta(page, "Usar el fondo común para la bomba solar")).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(boton).toHaveAttribute("aria-pressed", "false");
    await expect(tarjeta(page, "Calendario de siembra de otoño")).toBeVisible();
    await page.keyboard.press("Enter");
    await page.goto("/fogon?holon=valle");
    await expect(soloLas(page, "Valle Solar")).toHaveAttribute("aria-pressed", "false");
    await expect(tarjeta(page, "Calendario de siembra de otoño")).toContainText("en Cuidado de la tierra");
  });

  test("zoom a Cuidado de la tierra: la siembra se decide acá, el pedido de la bomba nace acá y no hay lo de adentro ni el botón", async ({ page }) => {
    await page.goto("/fogon?holon=valle-0");
    const s = seccion(page, "Cuidado de la tierra");
    await expect(s.getByRole("heading", { level: 4 })).toHaveText([
      "Calendario de siembra de otoño",
      "Pedido de Valle Solar al Fondo Común para la bomba solar",
    ]);
    await expect(s.getByRole("heading", { name: "En los círculos de adentro" })).toHaveCount(0);
    await expect(soloLas(page, "Cuidado de la tierra")).toHaveCount(0);
  });

  test("zoom a Valle Solar: se decide acá, pasa el pedido de la bomba y la siembra está adentro", async ({ page }) => {
    await page.goto("/fogon?holon=valle");
    const s = seccion(page, "Valle Solar");
    await expect(s.getByRole("heading", { level: 4, name: "Elegir facilitador/a de Valle Solar" })).toBeVisible();
    await expect(s.getByRole("heading", { level: 4, name: /Pedir al Fondo Común una cisterna/ })).toBeVisible();
    await expect(s.getByRole("heading", { level: 4, name: /Pedido de Valle Solar al Fondo Común para la bomba solar/ })).toBeVisible();
    await expect(tarjeta(page, /Pedido de Valle Solar al Fondo Común/)).toContainText("Se decide en Consejo de comunidades");
  });

  test("Tokenomics y Semillas: la regalía nace acá y se decide en Lighthouse VRN", async ({ page }) => {
    await page.goto("/fogon?holon=comun-token");
    await expect(tarjeta(page, "Parámetros de la regalía de regeneración")).toContainText("Se decide en Lighthouse VRN");
  });

  test("un círculo sin decisiones dice que no hay, sin números", async ({ page }) => {
    await page.goto("/fogon?holon=semilla-2");
    const s = page.getByRole("region", { name: /^Propuestas en / });
    await expect(s).toContainText("No hay decisiones de ejemplo en");
    await expect(s.getByRole("heading", { level: 4 })).toHaveCount(0);
  });

  test("Huerta intensiva · Semilla Viva: el plan de huerta se decide acá", async ({ page }) => {
    await page.goto("/fogon?holon=semilla-1");
    const huerta = tarjeta(page, "Plan de huerta comunitaria 2027");
    await expect(huerta).toContainText("Huerta intensiva · Semilla Viva");
    await expect(huerta).toContainText("Consentimiento");
    await expect(huerta.getByRole("button", { name: /Qué significa legalmente/ })).toBeVisible();
  });

  test("sin eventos: el Fogón solo lista decisiones, no encuentros ni jornadas", async ({ page }) => {
    await page.goto("/fogon");
    await expect(seccion(page, "Lighthouse VRN").getByText(/encuentro|jornada|convocatoria/i)).toHaveCount(0);
  });
});

test.describe("El Fogón recomienda a los órganos legales", () => {
  test("el presupuesto del Fondo Común muestra su destino y su ⚖ en borrador", async ({ page }) => {
    await page.goto("/fogon");
    const p = tarjeta(page, "Presupuesto 2027 del Fondo Común");
    await expect(p).toContainText("Lo decide el Consejo de la Fundación; el Fogón le lleva la recomendación");
    await p.getByRole("button", { name: /Qué significa legalmente/ }).first().click();
    await expect(page.getByText(/borrador/i).first()).toBeVisible();
    await page.keyboard.press("Escape");
  });

  test("sin Pase, una persona adherida recomienda y queda anunciado como cualquier voto", async ({ page }) => {
    await page.goto("/fogon");
    const p = tarjeta(page, "Presupuesto 2027 del Fondo Común");
    await expect(p).toContainText("A favor 17");
    await p.getByRole("button", { name: "Recomendar" }).click();
    await p.getByRole("button", { name: "A favor" }).click();
    await expect(p).toContainText("Tu recomendación: A favor (simulada)");
    await expect(p).toContainText("A favor 18");
    await expect(page.getByRole("status")).toContainText("Tu recomendación quedó registrada: A favor");
  });

  test("una decisión sin destino dice Tu voto y no muestra destino", async ({ page }) => {
    await page.goto("/fogon?holon=valle");
    const d = tarjeta(page, "Elegir facilitador/a de Valle Solar");
    await expect(d).not.toContainText("Lo decide el Consejo de la Fundación");
    await d.getByRole("button", { name: "Votar" }).click();
    await d.getByRole("button", { name: "A favor" }).click();
    await expect(d).toContainText("Tu voto: A favor (simulado)");
  });
});

test.describe("El lugar vive en la dirección", () => {
  test("holón y lente sobreviven a recargar", async ({ page }) => {
    await page.goto("/fogon?holon=valle-0&lente=propositos");
    await page.reload();
    await expect(dibujo(page)).toHaveAttribute("data-foco", "valle-0");
    await expect(page.getByRole("button", { name: /Propósitos/ })).toHaveAttribute("aria-pressed", "true");
  });

  test("un holón que no existe vuelve al común, sin errores y sin reflejar el texto", async ({ page }) => {
    const respuesta = await page.goto("/fogon?holon=%3Cb%3Ex%3C%2Fb%3E");
    expect(respuesta?.status()).toBe(200);
    await expect(dibujo(page)).toHaveAttribute("data-foco", "lighthouse");
    await expect(page.locator("main b")).toHaveCount(0);
    await page.goto("/fogon?holon=no-existe&lente=otra");
    await expect(dibujo(page)).toHaveAttribute("data-foco", "lighthouse");
  });

  test("hacer zoom escribe el holón en la dirección sin sumar entradas al historial", async ({ page }) => {
    await page.goto("/fogon");
    const antes = await page.evaluate(() => window.history.length);
    await dibujo(page).locator('circle[data-nodo="valle"]').dispatchEvent("click");
    await expect(page).toHaveURL(/holon=valle$/);
    await expect(seccion(page, "Valle Solar")).toBeVisible();
    expect(await page.evaluate(() => window.history.length)).toBe(antes);
  });
});

test.describe("Llevar al consejo", () => {
  const cisterna = (page: Page) => tarjeta(page, /Pedir al Fondo Común una cisterna/);

  test("quien no lidera Valle Solar no ve el botón", async ({ page }) => {
    await page.goto("/fogon?holon=valle");
    await expect(cisterna(page)).toBeVisible();
    await expect(page.getByRole("button", { name: "Llevar al consejo" })).toHaveCount(0);
  });

  test("quien lidera otra comunidad tampoco", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("lh-sumarte", JSON.stringify({ plan: "miembro", tribu: true, tribuId: "taller" }));
    });
    await page.goto("/fogon?holon=valle");
    await expect(cisterna(page)).toBeVisible();
    await expect(page.getByRole("button", { name: "Llevar al consejo" })).toHaveCount(0);
  });

  test("la líder de Valle Solar la lleva: aparece en el consejo con su origen, queda al recargar y no sale ningún pedido de red", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("lh-sumarte", JSON.stringify({ plan: "miembro", tribu: true, tribuId: "valle" }));
    });
    const pedidos: string[] = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (ignorarEnSinRed(r) || u.pathname === "/api/sesion") return;
      const claves = [...u.searchParams.keys()];
      if (r.method() === "GET" && claves.includes("_rsc") && !u.hash) return;
      if (["fetch", "xhr", "websocket", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") pedidos.push(`${r.method()} ${r.url()}`);
    });
    await page.goto("/fogon?holon=valle");
    await cisterna(page).getByRole("button", { name: "Llevar al consejo" }).click();
    await expect(cisterna(page).getByText("Ya está en el consejo")).toBeVisible();
    await expect(page.getByRole("button", { name: "Llevar al consejo" })).toHaveCount(0);
    await page.goto("/fogon?holon=consejo");
    const acá = seccion(page, "Consejo de comunidades");
    await expect(acá.getByRole("heading", { level: 4, name: /Pedir al Fondo Común una cisterna/ })).toBeVisible();
    await expect(acá.getByText("Viene de Valle Solar (aprobada en la comunidad)")).toHaveCount(2);
    expect(pedidos).toEqual([]);
    await page.reload();
    await expect(acá.getByText("Viene de Valle Solar (aprobada en la comunidad)")).toHaveCount(2);
    // El registro con forma de attestation quedó en el navegador.
    const registros = await page.evaluate(() => JSON.parse(window.localStorage.getItem("lh-gobernanza") ?? "[]"));
    expect(registros).toHaveLength(1);
    expect(registros[0]).toMatchObject({ esquema: "lleva-al-consejo", afirma: "valle", sobre: "cisterna", apuntaA: null });
  });
});

function cargarResidencia(page: Page, residencia: "argentina" | "exterior") {
  return page.addInitScript((r) => {
    window.localStorage.setItem("lh-pasaporte", JSON.stringify({ residencia: r }));
  }, residencia);
}

test.describe("Votar", () => {
  test("sin residencia cargada no pide el dato y no hay personas de ejemplo", async ({ page }) => {
    await page.goto("/fogon");
    await expect(page.getByText("Sin dato de tu residencia")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^(Votar|Recomendar)$/ })).toHaveCount(10);
    await expect(page.getByLabel("Persona de ejemplo")).toHaveCount(0);
    await expect(page.getByText(/Lucía|Lucas/)).toHaveCount(0);
  });

  test("la bomba solar se vota sin pedir residencia: el común no es la asamblea", async ({ page }) => {
    await page.goto("/fogon");
    const bomba = tarjeta(page, "Usar el fondo común para la bomba solar");
    await expect(bomba).toContainText("A favor 21");
    await bomba.getByRole("button", { name: "Votar" }).click();
    await bomba.getByRole("button", { name: "A favor" }).click();
    await expect(bomba).toContainText("A favor 22");
  });

  for (const r of ["exterior", "argentina"] as const) {
    test(`con residencia ${r} no aparece "Solo residentes" ni se pide el Pase`, async ({ page }) => {
      await cargarResidencia(page, r);
      await page.goto("/fogon");
      await expect(page.getByText("Solo residentes")).toHaveCount(0);
      await expect(page.getByText(/Pase Fundador/)).toHaveCount(0);
      await expect(page.getByRole("button", { name: /^(Votar|Recomendar)$/ })).toHaveCount(10);
    });
  }

  test("votar a favor en la huerta actualiza el conteo, sin red, y sobrevive a la recarga", async ({ page }) => {
    await page.goto("/fogon?holon=semilla-1");
    const pedidos: string[] = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      // Vercel, Privy y WalletConnect no son la app ni llevan datos de la persona.
      if (ignorarEnSinRed(r)) return;
      // La verificación de la sesión (login) no es un dato de la pantalla.
      if (u.pathname === "/api/sesion") return;
      const claves = [...u.searchParams.keys()];
      if (r.method() === "GET" && claves.includes("_rsc") && !u.hash) return;
      if (["fetch", "xhr", "websocket", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") pedidos.push(`${r.method()} ${r.url()}`);
    });
    const huerta = tarjeta(page, "Plan de huerta comunitaria 2027");
    await expect(huerta).toContainText("A favor 14");
    await huerta.getByRole("button", { name: "Votar" }).click();
    await huerta.getByRole("button", { name: "A favor" }).click();
    await expect(huerta.getByText("Tu voto: A favor (simulado)")).toBeVisible();
    await expect(huerta).toContainText("A favor 15");
    expect(pedidos).toEqual([]);
    await page.reload();
    await expect(huerta.getByText("Tu voto: A favor (simulado)")).toBeVisible();
    await expect(huerta).toContainText("A favor 15");
  });

  test("un voto guardado en una decisión que no existe (o en el presupuesto viejo) se ignora; los de las que existen se conservan", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "lh-fogon",
        JSON.stringify({ votos: { bomba: "favor", inventada: "contra", huerta: "favor", presupuesto: "favor" } }),
      );
    });
    await page.goto("/fogon");
    await expect(tarjeta(page, "Plan de huerta comunitaria 2027")).toContainText("Tu voto: A favor (simulado)");
    await expect(tarjeta(page, "Usar el fondo común para la bomba solar")).toContainText("Tu voto: A favor (simulado)");
    await expect(tarjeta(page, "Presupuesto 2027 del Fondo Común")).not.toContainText("Tu recomendación");
  });

  test("al votar el foco queda en el botón de la decisión y se anuncia en una región persistente", async ({ page }) => {
    await page.goto("/fogon?holon=semilla-1");
    const region = page.getByRole("status");
    await expect(region).toHaveCount(1);
    await expect(region).toHaveText("");
    const huerta = tarjeta(page, "Plan de huerta comunitaria 2027");
    await huerta.getByRole("button", { name: "Votar" }).click();
    await huerta.getByRole("button", { name: "A favor" }).click();
    await expect(huerta.getByRole("button", { name: "Cambiar voto" })).toBeFocused();
    await expect(region).toContainText("Tu voto quedó registrado: A favor");
    await page.reload();
    await expect(page.getByRole("status")).toHaveCount(1);
    await expect(page.getByRole("status")).toHaveText("");
  });

  test("repetir el mismo voto vuelve a escribir el anuncio en la región", async ({ page }) => {
    await page.goto("/fogon?holon=semilla-1");
    const region = page.getByRole("status");
    const huerta = tarjeta(page, "Plan de huerta comunitaria 2027");
    await huerta.getByRole("button", { name: "Votar" }).click();
    await huerta.getByRole("button", { name: "A favor" }).click();
    await expect(region).toContainText("Tu voto quedó registrado: A favor");
    await region.evaluate((el) => {
      const w = window as unknown as { __cambios: string[] };
      w.__cambios = [];
      new MutationObserver(() => w.__cambios.push(el.textContent ?? "")).observe(el, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    });
    await huerta.getByRole("button", { name: "Cambiar voto" }).click();
    await huerta.getByRole("button", { name: "A favor" }).click();
    await expect(huerta.getByRole("button", { name: "Cambiar voto" })).toBeFocused();
    await expect(region).toContainText("Tu voto quedó registrado: A favor");
    const cambios = await page.evaluate(() => (window as unknown as { __cambios: string[] }).__cambios);
    expect(cambios).toContain("");
    expect(cambios[cambios.length - 1]).toContain("Tu voto quedó registrado: A favor");
  });

  test("teclado: se vota solo con teclado", async ({ page }) => {
    await page.goto("/fogon?holon=semilla-1");
    const boton = page.getByRole("button", { name: "Votar" }).first();
    await boton.focus();
    await page.keyboard.press("Enter");
    const favor = page.getByRole("button", { name: "A favor" });
    await favor.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Tu voto: A favor (simulado)")).toBeVisible();
  });

  test("almacenamiento bloqueado: avisa y no registra el voto", async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException("bloqueado", "SecurityError");
      };
    });
    await page.goto("/fogon?holon=semilla-1");
    await page.getByRole("button", { name: "Votar" }).first().click();
    await page.getByRole("button", { name: "A favor" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "no permite guardar datos" })).toBeVisible();
    await expect(page.getByText("Tu voto: A favor (simulado)")).toHaveCount(0);
  });
});

test.describe("Parámetros opcionales de una decisión", () => {
  // La zona horaria de Argentina (UTC−3): una fecha AAAA-MM-DD mal leída se vería un día antes.
  test.use({ timezoneId: "America/Argentina/Buenos_Aires" });

  test("el pedido para la bomba solar muestra el monto, que sale del Fondo Común, y la fecha de cierre, con plata simulada", async ({ page }) => {
    await page.goto("/fogon?holon=consejo");
    const bomba = tarjeta(page, "Pedido de Valle Solar al Fondo Común para la bomba solar");
    await expect(bomba).toContainText("Cierra el: 15 de noviembre de 2026");
    await expect(bomba).toContainText(/Monto pedido: .*4\.?800.* \(simulado\)/);
    await expect(bomba).toContainText("Fuente: Fondo Común");
    await expect(bomba).toContainText("Plata simulada: nadie paga ni cobra.");
    await expect(bomba).not.toContainText("Se apoya en:");
  });

  test("una decisión sin parámetros no muestra filas de plazo, acuerdo ni monto", async ({ page }) => {
    await page.goto("/fogon?holon=valle");
    const d = tarjeta(page, "Elegir facilitador/a de Valle Solar");
    await expect(d).not.toContainText("Cierra el:");
    await expect(d).not.toContainText("Se apoya en:");
    await expect(d).not.toContainText("Monto pedido:");
  });

  test("un monto sin cifra dice sin dato y nunca 0", async ({ page }) => {
    await page.goto("/fogon?holon=consejo");
    const d = tarjeta(page, "Cisterna compartida entre Agua Clara y Valle Solar");
    await expect(d).toContainText("Monto pedido: sin dato");
    await expect(d).not.toContainText("(simulado)");
    await expect(d).not.toContainText(/Monto pedido:\s*(US\$\s*|\$\s*)?0/);
    await expect(d).toContainText("Se apoya en: Norma: Norma de uso compartido del agua (ejemplo)");
  });

  test("la regalía está en el común con su regla y su ⚖", async ({ page }) => {
    await page.goto("/fogon");
    const regalia = tarjeta(page, "Parámetros de la regalía de regeneración");
    await expect(regalia).toContainText("Se apoya en: Pacto: Pacto de regalía regenerativa (ejemplo)");
    await expect(regalia.getByRole("button", { name: /Qué significa legalmente/ })).toBeVisible();
  });
});

test.describe("Portada accesible y bilingüe", () => {
  test("a 390 px no hay scroll horizontal y el orden es dibujo, propuestas, panel y lista", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/fogon");
    const ancho = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(ancho).toBe(true);
    const y = async (l: ReturnType<Page["locator"]>) => (await l.boundingBox())!.y;
    const yDibujo = await y(dibujo(page));
    const yPropuestas = await y(page.getByRole("heading", { level: 2, name: /^Propuestas en/ }));
    const yPanel = await y(page.getByRole("heading", { level: 2, name: "Detalle" }));
    const yLista = await y(page.getByText("Ver toda la estructura como lista"));
    expect(yDibujo).toBeLessThan(yPropuestas);
    expect(yPropuestas).toBeLessThan(yPanel);
    expect(yPanel).toBeLessThan(yLista);
  });

  test.describe("en inglés", () => {
    test.use({ locale: "en-US" });

    test("la sección, sus grupos y el botón salen en inglés y el nombre de la comunidad no se traduce", async ({ page }) => {
      await page.goto("/fogon?holon=valle");
      await expect(page.getByRole("heading", { level: 1, name: "How we decide" })).toBeVisible();
      const s = page.getByRole("region", { name: "Proposals in Valle Solar" });
      await expect(s.getByRole("heading", { level: 3 })).toHaveText(["Decided here", "Starts or passes through here", "In the circles inside"]);
      await expect(s.getByRole("button", { name: "Only those of Valle Solar" })).toBeVisible();
      await expect(s.locator('[translate="no"]').first()).toBeVisible();
    });
  });

  test("axe sin violaciones serias o críticas en /fogon", async ({ page }) => {
    await page.goto("/fogon");
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
  });
});
