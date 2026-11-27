import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";
import { ignorarEnSinRed } from "./ayudas";
import { AMIGO, FARO_PREPAGO, FUNDADOR, miles } from "../lib/sumarte/datos";
import { MODELO_LOTES } from "../lib/lotes/modelo";
import { usd } from "../lib/series/formato";

// sumarte-planes-v2: Explorador, Amigo, Fundador y Aliados. A 1280 px (Desktop Chrome) se ven los tres planes a la vez;
// la vista del celular (un plan por vez) se prueba en `sumarte-celular.spec.ts`.

const articulo = (page: Page, nombre: RegExp) => page.getByRole("article").filter({ has: page.getByRole("heading", { name: nombre }) });
const amigo = (page: Page) => articulo(page, /^Amigo/);
const fundador = (page: Page) => articulo(page, /^Fundador/);
const explorador = (page: Page) => articulo(page, /^Explorador/);

test("muestra título, aviso de prototipo, los tres planes, Aliados y la tabla", async ({ page }) => {
  const respuesta = await page.goto("/sumarte");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.locator("#planes").getByRole("article")).toHaveCount(3);
  await expect(page.getByRole("heading", { level: 2, name: "Explorador" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: /^Amigo/ })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Fundador" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Aliados" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hablemos" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qué incluye cada plan" })).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(10);
  await expect(page.locator("main")).toHaveCount(1);
});

test("no queda ningún plan del modelo anterior", async ({ page }) => {
  await page.goto("/sumarte");
  const texto = await page.locator("main").innerText();
  expect(texto).not.toMatch(/Semilla|Brote|Raíz|Plan Tribu|Plan Comunidad|Miembro de la red/);
});

test("precios de ejemplo: Explorador gratis, Amigo anual y Fundador de pago único", async ({ page }) => {
  await page.goto("/sumarte");
  await expect(explorador(page)).toContainText("Gratis");
  await expect(amigo(page)).toContainText(`USD ${AMIGO.anual}/año`);
  await expect(fundador(page)).toContainText(`USD ${miles(FUNDADOR.precio)} · pago único`);
  await expect(fundador(page)).not.toContainText("de por vida");
});

test("la cohorte del Fundador se lee en texto como 'N de 100'", async ({ page }) => {
  await page.goto("/sumarte");
  await expect(fundador(page)).toContainText(`Quedan ${FUNDADOR.cupo - FUNDADOR.vendidos} de ${FUNDADOR.cupo} pases`);
});

test("cambiar a anual / mensual solo cambia a Amigo y '2 meses gratis' va junto al precio anual", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: /^Mensual/ }).click();
  await expect(page.getByRole("button", { name: /^Mensual/ })).toHaveAttribute("aria-pressed", "true");
  await expect(amigo(page)).toContainText(`USD ${AMIGO.mensual}/mes`);
  await expect(amigo(page)).not.toContainText("/año");
  await expect(amigo(page)).not.toContainText("2 meses gratis");
  await expect(fundador(page)).toContainText(`USD ${miles(FUNDADOR.precio)} · pago único`);
  await page.getByRole("button", { name: /^Anual/ }).click();
  await expect(page.getByRole("button", { name: /^Anual/ })).toHaveAttribute("aria-pressed", "true");
  await expect(amigo(page)).toContainText(`USD ${AMIGO.anual}/año`);
  await expect(amigo(page)).not.toContainText("/mes");
  await expect(amigo(page)).toContainText("2 meses gratis");
  await expect(fundador(page)).toContainText(`USD ${miles(FUNDADOR.precio)} · pago único`);
  await expect(explorador(page)).toContainText("Gratis");
  // El botón elegido lleva una marca además del color.
  await expect(page.getByRole("button", { name: /^Anual/ })).toContainText("✓");
  await expect(page.getByRole("button", { name: /^Mensual/ })).not.toContainText("✓");
});

test("moneda en pesos: los precios se convierten y el Fundador dice ARS", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("lh-configuracion", JSON.stringify({ moneda: "ARS" }));
  });
  await page.goto("/sumarte");
  await expect(amigo(page)).toContainText("ARS 126.000/año");
  await expect(amigo(page)).not.toContainText("USD");
  await page.getByRole("button", { name: /^Mensual/ }).click();
  await expect(amigo(page)).toContainText("ARS 12.600/mes");
  await expect(fundador(page)).toContainText("ARS 2.100.000");
  await expect(fundador(page)).not.toContainText("USD");
});

test("la bajada dice que el pago es simulado, no que todo lo sea, y el aviso de valores de ejemplo se lee antes de los planes", async ({ page }) => {
  await page.goto("/sumarte");
  const aviso = page.getByText("Valores de ejemplo, a re-ajustar");
  await expect(aviso).toBeVisible();
  await expect(page.getByText(/El pago es simulado: no se cobra nada/)).toBeVisible();
  await expect(page.getByText(/todo lo que elijas acá es simulado/)).toHaveCount(0);
  const avisoY = (await aviso.boundingBox())!.y;
  const planesY = (await page.getByRole("heading", { level: 2, name: /^Amigo/ }).boundingBox())!.y;
  expect(avisoY).toBeLessThan(planesY);
});

test("los beneficios que todavía no existen dicen 'Próximamente' en texto", async ({ page }) => {
  await page.goto("/sumarte");
  const bitacora = amigo(page).getByRole("listitem").filter({ hasText: "Bitácora de obra y masterplan" }).first();
  await expect(bitacora).toContainText("Próximamente");
  await expect(amigo(page).getByRole("listitem").filter({ hasText: "Una sesión al mes con el equipo" }).first()).toContainText("Próximamente");
  await expect(amigo(page).getByRole("listitem").filter({ hasText: "Cupo antes que nadie en visitas y eventos" }).first()).toContainText("Próximamente");
  await expect(fundador(page).getByRole("listitem").filter({ hasText: "Visita guiada al sitio" }).first()).toContainText("Próximamente");
  // Lo que ya existe no lleva la marca.
  await expect(explorador(page)).not.toContainText("Próximamente");
  await expect(fundador(page).getByRole("listitem").filter({ hasText: "registro Génesis" }).first()).not.toContainText("Próximamente");
  // En la comparación cada celda dice su estado con palabras.
  const fila = page.getByRole("row").filter({ hasText: "Bitácora de obra y masterplan" });
  await expect(fila.getByText("Próximamente")).toHaveCount(2);
  await expect(fila.getByText("No incluido")).toHaveCount(1);
});

test("FARO de prepago en borrador: las cinco reglas, '(a definir)' en cada número y el reparto del pago", async ({ page }) => {
  await page.goto("/sumarte?plan=amigo");
  const faro = page.locator("#faro-amigo");
  await expect(faro).toBeVisible();
  await expect(faro.getByText("Borrador · a definir")).toBeVisible();
  await expect(faro.getByRole("heading", { name: /Cómo funciona el FARO de tu plan/ })).toBeVisible();
  const reglas = faro.getByRole("listitem");
  await expect(reglas).toHaveCount(5);
  await expect(reglas.nth(0)).toContainText(`1 FARO = USD ${FARO_PREPAGO.precioUsd} (a definir) a precio de lista`);
  await expect(reglas.nth(1)).toContainText("eventos de comunidad, visitas, talleres y sesiones");
  await expect(reglas.nth(2)).toContainText("Se quema al usarse y no se devuelve en plata");
  await expect(reglas.nth(3)).toContainText(`a los ${FARO_PREPAGO.venceAmigoMeses} meses (a definir)`);
  await expect(reglas.nth(3)).toContainText(`a los ${FARO_PREPAGO.venceFundadorMeses} meses (a definir)`);
  await expect(reglas.nth(4)).toContainText("No da voz");
  // Con "Anual": 12 meses de FARO; el servicio es el resto.
  await expect(faro).toContainText(`De tu cuota: USD ${AMIGO.anual - FARO_PREPAGO.amigoPorMes * 12} por el servicio de NetX · USD ${FARO_PREPAGO.amigoPorMes * 12} en FARO que se reserva para el bien común (a definir)`);
  await page.getByRole("button", { name: /^Mensual/ }).click();
  await expect(faro).toContainText(`De tu cuota: USD ${AMIGO.mensual - FARO_PREPAGO.amigoPorMes} por el servicio de NetX · USD ${FARO_PREPAGO.amigoPorMes} en FARO`);
  await expect(faro).toContainText(`Cada mes se te acreditan ${FARO_PREPAGO.amigoPorMes} FARO (a definir)`);
  const fundadorFaro = page.locator("#faro-fundador");
  await expect(fundadorFaro).toContainText("De tu pago: USD 300 por el servicio de NetX · USD 1.200 en FARO que se reserva para el bien común (a definir)");
  expect(await faro.innerText()).not.toMatch(/Fundación/);
});

test("ningún plan da prioridad sobre un lote ni es una inversión: el texto lo dice y las palabras prohibidas no están", async ({ page }) => {
  await page.goto("/sumarte");
  await expect(page.getByText("Ningún plan da prioridad, reserva ni crédito sobre un lote, ni acceso a invertir.")).toBeVisible();
  const texto = (await page.locator("#planes").innerText()) + (await page.getByRole("heading", { level: 1 }).locator("xpath=following-sibling::p[1]").innerText());
  expect(texto).not.toMatch(/inversi[oó]n|retorno|rendimiento|de por vida/i);
});

test.describe("Amigo con sesión", () => {
  test.use({ rol: "persona" });

  test("se da de baja (simulado), vuelve a Explorador y sigue así al recargar", async ({ page }) => {
    await page.goto("/sumarte");
    await expect(page.getByText("Tu plan actual:")).toContainText("Amigo");
    const baja = amigo(page).getByRole("button", { name: "Darme de baja (simulado)" });
    await expect(baja).toBeVisible();
    // Tan visible como el botón para elegirlo: dentro de la tarjeta de su plan, con el mismo tamaño de texto (16 px, no más chico).
    expect(await baja.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
    await baja.click();
    await expect(page.getByText("Tu plan actual:")).toContainText("Explorador");
    await expect(amigo(page).getByRole("button", { name: "Darme de baja (simulado)" })).toHaveCount(0);
    await expect(amigo(page).getByRole("button", { name: "Hacerme Amigo" })).toBeVisible();
    await page.reload();
    await expect(page.getByText("Tu plan actual:")).toContainText("Explorador");
  });

  test("activar Fundador: no hace pedidos de red, sobrevive a la recarga, baja un pase de la cohorte y se deshace", async ({ page }) => {
    await page.goto("/sumarte");
    const pedidos: string[] = [];
    // Cualquier fetch/XHR/WebSocket o método que no sea GET cuenta, sea cual sea el dominio (local o preview).
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (ignorarEnSinRed(r)) return;
      if (u.pathname === "/api/sesion") return;
      const claves = [...u.searchParams.keys()];
      if (r.method() === "GET" && claves.length === 1 && claves[0] === "_rsc" && !u.hash) return;
      if (["fetch", "xhr", "websocket", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") pedidos.push(`${r.method()} ${r.url()}`);
    });
    await fundador(page).getByRole("button", { name: "Quiero ser Fundador" }).click();
    await expect(page.getByText("Fundador activo (simulado)")).toBeVisible();
    await expect(fundador(page)).toContainText(`Quedan ${FUNDADOR.cupo - FUNDADOR.vendidos - 1} de ${FUNDADOR.cupo} pases`);
    expect(pedidos).toEqual([]);
    await page.reload();
    await expect(page.getByText("Fundador activo (simulado)")).toBeVisible();
    await explorador(page).getByRole("button", { name: "Volver a Explorador" }).click();
    await expect(page.getByText("Fundador activo (simulado)")).toHaveCount(0);
    await expect(fundador(page).getByRole("button", { name: "Quiero ser Fundador" })).toBeVisible();
    await page.reload();
    await expect(fundador(page).getByRole("button", { name: "Quiero ser Fundador" })).toBeVisible();
  });

  test("una persona Amigo activa Fundador y su nivel pasa a Fundador", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Menú de la persona" }).click();
    await expect(page.locator("#menu-persona")).toContainText("Nivel: Amigo");
    await fundador(page).getByRole("button", { name: "Quiero ser Fundador" }).click();
    await page.getByRole("button", { name: "Menú de la persona" }).click();
    await expect(page.locator("#menu-persona")).toContainText("Nivel: Fundador");
    await page.reload();
    await page.getByRole("button", { name: "Menú de la persona" }).click();
    await expect(page.locator("#menu-persona")).toContainText("Nivel: Fundador");
  });

  test("un estado guardado con el Pase Brote del modelo anterior figura como Fundador", async ({ page }) => {
    await page.goto("/sumarte");
    await page.evaluate(() => window.localStorage.setItem("lh-sumarte", JSON.stringify({ plan: "miembro", pase: "brote", nivelPase: "brote" })));
    await page.reload();
    await expect(page.getByText("Tu plan actual:")).toContainText("Fundador");
    await expect(page.getByText("Fundador activo (simulado)")).toBeVisible();
  });

  test("elegir un plan no adhiere: después de activar Fundador, /fogon sigue pidiendo adherir al manifiesto", async ({ page }) => {
    await page.goto("/sumarte");
    await fundador(page).getByRole("button", { name: "Quiero ser Fundador" }).click();
    await expect(page.getByText("Fundador activo (simulado)")).toBeVisible();
    await page.goto("/fogon");
    await expect(page.getByText("Para participar, adherí al manifiesto de Lighthouse VRN").first()).toBeVisible();
  });

  test("teclado: se puede activar Fundador solo con teclado y el foco pasa al aviso", async ({ page }) => {
    await page.goto("/sumarte");
    const boton = fundador(page).getByRole("button", { name: "Quiero ser Fundador" });
    await boton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Fundador activo (simulado)")).toBeFocused();
  });

  test("Aliados: 'Hablemos' abre el pedido de contacto (simulado), que queda al recargar", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Hablemos" }).click();
    await page.getByRole("radio", { name: "Email" }).check();
    await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
    await expect(page.getByText("Pedido enviado (simulado)")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Pedido enviado (simulado)")).toBeVisible();
    // No elige ningún plan ni cambia el nivel: sigue siendo Amigo.
    await expect(page.getByText("Tu plan actual:")).toContainText("Amigo");
    const guardado = await page.evaluate(() => JSON.parse(window.localStorage.getItem("lh-contactos") ?? "[]") as { motivo: string }[]);
    expect(guardado.some((p) => p.motivo === "aliados")).toBe(true);
  });

  test("almacenamiento bloqueado: avisa", async ({ page }) => {
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException("bloqueado", "SecurityError");
      };
    });
    await page.goto("/sumarte");
    await fundador(page).getByRole("button", { name: "Quiero ser Fundador" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "no permite guardar datos" })).toBeVisible();
    await expect(page.getByText("Fundador activo (simulado)")).toHaveCount(0);
  });
});

test("direcciones viejas: ?plan=miembro lleva a Amigo y ?plan=comunidad, a la franja de Aliados", async ({ page }) => {
  await page.goto("/sumarte?plan=miembro");
  await expect(page).toHaveURL(/plan=amigo/);
  await expect(page.getByRole("heading", { level: 2, name: /^Amigo/ })).toBeVisible();
  await page.goto("/sumarte?plan=comunidad");
  await expect(page).toHaveURL(/plan=amigo#aliados$/);
  await expect(page.getByRole("heading", { level: 2, name: "Aliados" })).toBeInViewport();
});

test("un plan que no existe cae en el de por defecto", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sumarte?plan=inventado");
  await expect(page.getByRole("radiogroup", { name: "Plan" }).getByRole("radio", { name: "Amigo", exact: true })).toBeChecked();
});

test("adhesión para participar: una línea fuera de las tarjetas, con el ⚖ y el enlace a la ficha", async ({ page }) => {
  await page.goto("/sumarte");
  const linea = page.getByTestId("adhesion-sumarte");
  await expect(linea).toContainText("hace falta una cuenta gratis y adherir al manifiesto de Lighthouse VRN");
  await expect(linea).toContainText("Adherís y quedás adentro al instante: nadie tiene que aceptarte. Elegir un plan no te hace adherir.");
  await expect(linea.getByRole("button", { name: "Qué significa legalmente: Adherir para participar" })).toBeVisible();
  await expect(linea.getByRole("link", { name: "Leer el manifiesto" })).toHaveAttribute("href", "/tribus/lighthouse");
  await expect(page.getByRole("article").getByTestId("adhesion-sumarte")).toHaveCount(0);
});

test("comprar un lote: la tarjeta está con el precio del modelo y sin botón de compra", async ({ page }) => {
  await page.goto("/sumarte");
  const puerta = page.getByRole("region", { name: "Comprar un lote" });
  await expect(puerta).toBeVisible();
  await expect(puerta).toContainText(`Desde ${usd(MODELO_LOTES.precioLote.min)} el lote`);
  await expect(puerta).toContainText("precios de ejemplo");
  // `/sumarte` no va en `VISTAS_CON_LOTES`: usa el aviso compacto (una nota), no la región completa.
  const avisos = puerta.getByRole("note", { name: "Estado administrativo" });
  await expect(avisos.filter({ hasText: "supuesto de trabajo, no otorgada" })).toHaveCount(1);
  await expect(avisos.filter({ hasText: "informada, sin documento a la vista" })).toHaveCount(1);
  await expect(puerta).toContainText("no se cobra nada");
  // Los únicos botones son los ⚖ del aviso: ninguno reserva ni compra.
  await expect(puerta.getByRole("button", { name: /reserv|compr|pagar/i })).toHaveCount(0);
  for (const boton of await puerta.getByRole("button").all()) {
    expect(await boton.getAttribute("aria-label")).toMatch(/^Qué significa legalmente/);
  }
});

test("comprar un lote: el enlace a los lotes se alcanza con el teclado", async ({ page }) => {
  await page.goto("/sumarte");
  const enlace = page.getByRole("region", { name: "Comprar un lote" }).getByRole("link", { name: "Ver los lotes" });
  await enlace.focus();
  await expect(enlace).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/explorar\/lotes$/);
});

test("invertir es una tarjeta de destino que lleva a /invertir; Sumarte ya no pide invitación ni habla de series", async ({ page }) => {
  await page.goto("/sumarte");
  const invertir = page.getByRole("region", { name: "Invertir", exact: true });
  await expect(invertir).toContainText("No depende de ningún plan");
  await expect(invertir.getByRole("link", { name: "Ir a Invertir" })).toHaveAttribute("href", "/invertir");
  await expect(page.getByText("Pedir invitación")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Pedir una charla" })).toHaveCount(0);
  await expect(page.getByText("Token Inversor")).toHaveCount(0);
  await invertir.getByRole("link", { name: "Ir a Invertir" }).click();
  await expect(page).toHaveURL(/\/invertir$/);
});

test("los ⚖ del catálogo están en la pantalla", async ({ page }) => {
  await page.goto("/sumarte");
  await expect(page.getByRole("button", { name: "Qué significa legalmente: Membresía de la red", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Qué significa legalmente: FARO de prepago", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Qué significa legalmente: Adherir para participar", exact: true })).toBeVisible();
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US", rol: "ninguno" });

  test("se leen los planes, 'Buy a lot', 'Invest' y la bajada con el pago simulado", async ({ page }) => {
    await page.goto("/sumarte");
    await expect(page.getByRole("heading", { level: 2, name: "Explorer" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /^Friend/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Founder" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Allies" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Let's talk" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Buy a lot" })).toBeVisible();
    await expect(page.getByRole("link", { name: "See the lots" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Invest", exact: true })).toBeVisible();
    await expect(page.getByText("Sample values, to be re-tuned")).toBeVisible();
    await expect(page.getByText(/The payment is simulated/)).toBeVisible();
    await expect(page.locator("#faro-amigo").getByText("Draft · to be defined")).toBeVisible();
    const texto = await page.locator("#planes").innerText();
    expect(texto).not.toMatch(/investment|\breturns?\b|yield|lifetime/i);
  });

  test("el precio del lote se formatea con coma de miles", async ({ page }) => {
    await page.goto("/sumarte");
    const puerta = page.getByRole("region", { name: "Buy a lot" });
    await expect(puerta).toContainText(`From USD ${MODELO_LOTES.precioLote.min.toLocaleString("en-US")} per lot`);
  });
});

test("con moneda en pesos, el precio del lote se convierte como los planes", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("lh-configuracion", JSON.stringify({ moneda: "ARS" }));
  });
  await page.goto("/sumarte");
  await expect(page.getByRole("region", { name: "Comprar un lote" })).toContainText("Desde ARS ");
  await expect(page.getByRole("region", { name: "Comprar un lote" })).not.toContainText("USD");
});

for (const plan of ["explorador", "amigo", "fundador"]) {
  test(`axe sin violaciones serias o críticas en /sumarte con el plan ${plan}`, async ({ page }) => {
    await page.goto(`/sumarte?plan=${plan}`);
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
  });
}

test("los tres caminos de arriba llevan a Comprar un lote, Invertir y los planes", async ({ page }) => {
  await page.goto("/sumarte");
  const caminos = page.getByRole("region", { name: "¿Qué querés hacer?" });
  await expect(caminos.getByRole("link")).toHaveCount(3);
  await caminos.getByRole("link", { name: /Quiero vivir/ }).click();
  await expect(page).toHaveURL(/#comprar-lote$/);
  await expect(page.getByRole("heading", { level: 2, name: "Comprar un lote" })).toBeInViewport();
  await caminos.getByRole("link", { name: /Quiero invertir/ }).click();
  await expect(page).toHaveURL(/#invertir$/);
  await expect(page.getByRole("heading", { level: 2, name: "Invertir", exact: true })).toBeInViewport();
});
