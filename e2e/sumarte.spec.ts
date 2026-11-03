import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";
import { conIdentidadVerificada, ignorarEnSinRed } from "./ayudas";
import { TICKETS_SAFE } from "../lib/financiamiento/fuentes";
import { MODELO_LOTES } from "../lib/lotes/modelo";
import { usd } from "../lib/series/formato";

test("muestra título, aviso de prototipo, cuatro planes y la tabla", async ({ page }) => {
  const respuesta = await page.goto("/sumarte");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Elegí cómo sumarte" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  for (const plan of ["Explorador", "Miembro de la red", "Pase Fundador", "Plan Tribu"]) {
    await expect(page.getByRole("heading", { level: 2, name: new RegExp(`^${plan}`) })).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Qué incluye cada plan" })).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await expect(page.locator("main")).toHaveCount(1);
});

test("cambiar a anual / mensual", async ({ page }) => {
  await page.goto("/sumarte");
  const miembro = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Miembro de la red/ }) });
  await page.getByRole("button", { name: /^Mensual/ }).click();
  await expect(miembro).toContainText("USD 10/mes");
  await page.getByRole("button", { name: /^Anual/ }).click();
  await expect(page.getByRole("button", { name: /^Anual/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /^Mensual/ })).toHaveAttribute("aria-pressed", "false");
  await expect(miembro).toContainText("USD 100/año");
});

test("el período aplica a todos los planes periódicos; el pase no cambia", async ({ page }) => {
  await page.goto("/sumarte");
  const miembro = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Miembro de la red/ }) });
  const tribu = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Plan Tribu/ }) });
  const pase = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Pase Fundador/ }) });
  await page.getByRole("button", { name: /^Mensual/ }).click();
  await expect(tribu).toContainText("USD 60/mes");
  await expect(tribu).not.toContainText("/año");
  await expect(miembro).not.toContainText("/año");
  await expect(miembro).not.toContainText("2 meses gratis");
  await expect(tribu).not.toContainText("2 meses gratis");
  await expect(pase).toContainText("pago único · de por vida");
  await page.getByRole("button", { name: /^Anual/ }).click();
  await expect(tribu).toContainText("USD 600/año");
  await expect(tribu).not.toContainText("/mes");
  await expect(miembro).not.toContainText("/mes");
  await expect(miembro).toContainText("2 meses gratis");
  await expect(tribu).toContainText("2 meses gratis");
  await expect(pase).toContainText("USD 1.500 · pago único · de por vida");
  // Legible: el texto del pase no es más chico que el de los otros precios (16 px, no 12).
  const tamano = await pase.getByText("pago único · de por vida").evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(tamano).toBeGreaterThanOrEqual(16);
});

test("moneda en pesos: con Anual los dos precios periódicos se convierten y dicen /año", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("lh-configuracion", JSON.stringify({ moneda: "ARS" }));
  });
  await page.goto("/sumarte");
  const miembro = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Miembro de la red/ }) });
  const tribu = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Plan Tribu/ }) });
  await page.getByRole("button", { name: /^Anual/ }).click();
  await expect(miembro).toContainText("ARS 140.000/año");
  await expect(tribu).toContainText("ARS 840.000/año");
  await expect(tribu).not.toContainText("USD");
  await page.getByRole("button", { name: /^Mensual/ }).click();
  await expect(tribu).toContainText("ARS 84.000/mes");
});

test("elegir el nivel Raíz cambia precio y créditos", async ({ page }) => {
  await page.goto("/sumarte");
  const pase = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Pase Fundador/ }) });
  await pase.getByRole("radio", { name: /Raíz/ }).check({ force: true });
  await expect(pase).toContainText("USD 5.000 · pago único");
  await expect(pase).toContainText("de por vida");
  await expect(pase).toContainText("USD 1.500 en créditos");
  await expect(pase).toContainText("se liberan en 3 años y vencen a los 12 meses de liberarse");
  await expect(pase.getByRole("button", { name: "Quiero el Pase Raíz" })).toBeVisible();
});

const tarjetaPase = (page: Page) =>
  page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Pase Fundador/ }) });

test("la tarjeta del Pase dice que da influencia en el Fondo Común, con su ⚖, y no nombra fideicomiso, voto ni Ronda 0", async ({ page }) => {
  await page.goto("/sumarte");
  const pase = tarjetaPase(page);
  await expect(pase).toContainText("Influencia en el Fondo Común");
  await expect(pase).toContainText(": la distribución de grandes sumas se va a decidir con conviction voting (próximamente)");
  await expect(pase.getByRole("button", { name: /Influencia en el Fondo Común/ })).toBeVisible();
  await expect(pase).toContainText("La misma influencia en los tres niveles");
  await expect(pase.locator('[translate="no"]', { hasText: "conviction voting" })).toBeVisible();
  const texto = await pase.innerText();
  expect(texto).not.toMatch(/fideicomiso|voto|Ronda 0/i);
});

test("la tarjeta del Pase dice que no es una inversión, con su ⚖ en borrador", async ({ page }) => {
  await page.goto("/sumarte");
  const pase = tarjetaPase(page);
  await expect(pase).toContainText("No es una inversión: no da tierra, lotes, prioridad ni rendimiento, y no se revende.");
  await pase.getByRole("button", { name: "Qué significa legalmente: No es una inversión" }).click();
  await expect(page.getByText("Borrador: texto a revisar").first()).toBeVisible();
});

test("valores de ejemplo: el aviso se lee antes de los planes y los precios siguen siendo los vigentes", async ({ page }) => {
  await page.goto("/sumarte");
  const aviso = page.getByText("Valores de ejemplo, a re-ajustar");
  await expect(aviso).toBeVisible();
  await expect(page.getByText(/Nada se cobra de verdad/).first()).toBeVisible();
  const avisoY = (await aviso.boundingBox())!.y;
  const planesY = (await page.getByRole("heading", { level: 2, name: /^Explorador/ }).boundingBox())!.y;
  expect(avisoY).toBeLessThan(planesY);
  await page.getByRole("button", { name: /^Mensual/ }).click();
  await expect(page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Miembro de la red/ }) })).toContainText("USD 10/mes");
  await expect(page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Plan Tribu/ }) })).toContainText("USD 60/mes");
  for (const nivel of ["Semilla", "Brote", "Raíz"]) {
    await expect(tarjetaPase(page).getByRole("radio", { name: new RegExp(nivel) })).toBeAttached();
  }
  await expect(tarjetaPase(page)).toContainText("USD 300");
  await expect(tarjetaPase(page)).toContainText("USD 1.500");
  await expect(tarjetaPase(page)).toContainText("USD 5.000");
});

test("a dónde va la plata de cada plan", async ({ page }) => {
  await page.goto("/sumarte");
  await expect(tarjetaPase(page)).toContainText("Va al Fondo Común del procomún, no a NetX.");
  await expect(page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Miembro de la red/ }) })).toContainText("La cobra NetX: es un servicio.");
  await expect(page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Plan Tribu/ }) })).toContainText("Lo cobra NetX: un servicio que le factura a la tribu.");
});

test("planes sin Congreso: ni el Explorador ni la comparativa lo ofrecen y la cohorte no tiene fecha", async ({ page }) => {
  await page.goto("/sumarte");
  const explorador = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /^Explorador/ }) });
  await expect(explorador).not.toContainText(/Congreso|ticket/i);
  const comparativa = page.getByRole("region", { name: "Qué incluye cada plan" });
  await expect(comparativa).not.toContainText(/Congreso|ticket/i);
  await expect(comparativa.getByRole("row").filter({ hasText: "Mapa, tribus y eventos abiertos" })).toBeVisible();
  const fila = comparativa.getByRole("row").filter({ hasText: "Influencia en el Fondo Común (próximamente: conviction voting)" });
  await expect(fila.getByText("Incluido", { exact: true })).toHaveCount(1);
  await expect(fila.getByText("No incluido", { exact: true })).toHaveCount(2);
  await expect(tarjetaPase(page)).toContainText("Cohorte Génesis · fecha a definir");
  await expect(tarjetaPase(page)).toContainText("Registro Genesis si venís a un evento de comunidad (a definir)");
  await expect(tarjetaPase(page)).not.toContainText("Feb 2027");
});

test("adhesión para participar: una línea fuera de las tarjetas, con el ⚖ y el enlace a la ficha", async ({ page }) => {
  await page.goto("/sumarte");
  const linea = page.getByTestId("adhesion-sumarte");
  await expect(linea).toContainText("hace falta tener como mínimo el plan Miembro y adherir al manifiesto de Lighthouse VRN");
  await expect(linea).toContainText("Adherís y quedás adentro al instante: nadie tiene que aceptarte. Elegir un plan no te hace adherir.");
  await expect(linea.getByRole("button", { name: "Qué significa legalmente: Adherir para participar" })).toBeVisible();
  await expect(linea.getByRole("link", { name: "Leer el manifiesto" })).toHaveAttribute("href", "/tribus/lighthouse");
  await expect(page.getByRole("article").getByTestId("adhesion-sumarte")).toHaveCount(0);
});

test.describe("elegir un plan no adhiere", () => {
  test.use({ rol: "persona" });

  test("después de activar el Pase, /fogon sigue pidiendo adherir al manifiesto", async ({ page }) => {
    await page.goto("/sumarte");
    await page.getByRole("button", { name: "Quiero el Pase Brote" }).click();
    await expect(page.getByText("Pase Brote activo (simulado)")).toBeVisible();
    await page.goto("/fogon");
    await expect(page.getByText("Para participar, adherí al manifiesto de Lighthouse VRN").first()).toBeVisible();
  });
});

test("comprar un lote: la puerta está antes de Invertir, con el precio del modelo y sin botón de compra", async ({ page }) => {
  await page.goto("/sumarte");
  const puerta = page.getByRole("region", { name: "Comprar un lote" });
  await expect(puerta).toBeVisible();
  const invertir = page.getByRole("region", { name: "Invertir", exact: true });
  const [py, iy] = [(await puerta.boundingBox())!.y, (await invertir.boundingBox())!.y];
  expect(py).toBeLessThan(iy);
  await expect(puerta).toContainText(`Desde ${usd(MODELO_LOTES.precioLote.min)} el lote`);
  await expect(puerta).toContainText("precios de ejemplo");
  // `/sumarte` no va en `VISTAS_CON_LOTES`: usa el aviso compacto (una nota), no la región completa.
  await expect(puerta.getByRole("note", { name: "Estado administrativo" })).toContainText("supuesto de trabajo, no otorgada");
  await expect(puerta).toContainText("no se cobra nada");
  // Los únicos botones son los ⚖ del aviso: ninguno reserva ni compra.
  await expect(puerta.getByRole("button", { name: /reserv|compr|pagar/i })).toHaveCount(0);
  for (const boton of await puerta.getByRole("button").all()) {
    expect(await boton.getAttribute("aria-label")).toMatch(/^Qué significa legalmente/);
  }
  // Queda fuera de "Invertir": ahí la frase "no se vende ni se cobra nada" tiene que ser cierta.
  await expect(invertir.getByRole("heading", { name: "Comprar un lote" })).toHaveCount(0);
});

test("comprar un lote: el enlace a los lotes se alcanza con el teclado", async ({ page }) => {
  await page.goto("/sumarte");
  const enlace = page.getByRole("region", { name: "Comprar un lote" }).getByRole("link", { name: "Ver los lotes" });
  await enlace.focus();
  await expect(enlace).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/lotes$/);
});

test("invertir: la frase 'no es una oferta' va antes de las dos tarjetas y sin números en la de proyectos", async ({ page }) => {
  await page.goto("/sumarte");
  const invertir = page.getByRole("region", { name: "Invertir", exact: true });
  await expect(page.getByRole("heading", { level: 2, name: "Invertir", exact: true })).toBeVisible();
  const frase = invertir.getByText("Esto no es una oferta: desde esta sección no se vende ni se cobra nada.");
  await expect(frase).toBeVisible();
  const fraseY = (await frase.boundingBox())!.y;
  const proyectos = invertir.getByRole("article").filter({ has: page.getByRole("heading", { name: "En los proyectos de regeneración" }) });
  const empresa = invertir.getByRole("article").filter({ has: page.getByRole("heading", { name: /^En NetX como empresa/ }) });
  expect(fraseY).toBeLessThan((await proyectos.boundingBox())!.y);
  expect(fraseY).toBeLessThan((await empresa.boundingBox())!.y);
  const texto = await proyectos.innerText();
  expect(texto).not.toMatch(/\$|USD|%|Lote 7/);
  await expect(proyectos.getByRole("progressbar")).toHaveCount(0);
  await expect(proyectos).toContainText("La tierra común queda en una Fundación");
  await expect(proyectos).toContainText("Los lotes privados son otro camino");
  expect(texto).not.toMatch(/no vende tierra|Juego/);
  await expect(invertir.getByRole("progressbar")).toHaveCount(0);
});

test("invertir: tickets de la empresa de la constante, con su aclaración", async ({ page }) => {
  await page.goto("/sumarte");
  const empresa = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /^En NetX como empresa/ }) });
  await expect(empresa).toContainText(usd(TICKETS_SAFE.min));
  await expect(empresa).toContainText("USD 5.000");
  await expect(empresa).toContainText("USD 50.000");
  await expect(empresa).toContainText("o más");
  await expect(empresa).toContainText("a definir con Vagner");
  await expect(empresa.getByRole("button", { name: /pago|aporte|comprar/i })).toHaveCount(0);
});

test.describe("enlaces a la Vista NetX", () => {
  test("con sesión: los proyectos abren dinero temprano y la empresa abre /netx; con teclado también", async ({ page }) => {
    await page.goto("/sumarte");
    const enlace = page.getByRole("link", { name: "Ver cómo funciona en la Vista NetX" });
    await expect(enlace).toHaveAttribute("href", "/netx/financiamiento#m-temprano");
    await enlace.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/netx\/financiamiento#m-temprano$/);
    await page.goto("/sumarte");
    const empresa = page.getByRole("link", { name: "Ver cómo se financia NetX en la Vista NetX" });
    await expect(empresa).toHaveAttribute("href", "/netx");
    await empresa.click();
    await expect(page).toHaveURL(/\/netx$/);
  });

  test.describe("sin sesión", () => {
    test.use({ rol: "ninguno" });

    test("termina en /sumarte con el aviso de que se habilita al sumarse gratis como Explorador", async ({ page }) => {
      await page.goto("/sumarte");
      await page.getByRole("link", { name: "Ver cómo funciona en la Vista NetX" }).click();
      await expect(page).toHaveURL(/\/sumarte\?volver=%2Fnetx%2Ffinanciamiento/);
      await expect(page.getByText(/se habilita al sumarte gratis como Explorador/).first()).toBeVisible();
    });
  });
});

test.describe("comprar el Pase", () => {
  // Persona común (no super admin, que tiene el nivel más alto de entrada); por defecto el plan es Miembro.
  test.use({ rol: "persona" });

test("una persona Miembro activa el Pase Brote y pasa a ser Fundadora", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Menú de la persona" }).click();
  await expect(page.locator("#menu-persona")).toContainText("Nivel: Miembro");
  await page.getByRole("button", { name: "Quiero el Pase Brote" }).click();
  // El menú se cierra al hacer clic afuera: se vuelve a abrir.
  await expect(page.getByRole("button", { name: "Menú de la persona" })).toHaveAttribute("aria-expanded", "false");
  await page.getByRole("button", { name: "Menú de la persona" }).click();
  await expect(page.locator("#menu-persona")).toContainText("Nivel: Fundador");
  // El nivel queda al recargar.
  await page.reload();
  await page.getByRole("button", { name: "Menú de la persona" }).click();
  await expect(page.locator("#menu-persona")).toContainText("Nivel: Fundador");
});
});

test("medidores de la cohorte legibles en texto",async ({ page }) => {
  await page.goto("/sumarte");
  await expect(page.getByText("142 de 300")).toBeVisible();
  await expect(page.getByText("USD 46.000 de USD 75.000")).toBeVisible();
});

test("activar el pase no hace pedidos de red, sobrevive a la recarga y se deshace", async ({ page }) => {
  await page.goto("/sumarte");
  const pedidos: string[] = [];
  // Cualquier fetch/XHR/WebSocket o método que no sea GET cuenta, sea cual sea el dominio (local o preview).
  // Se ignoran los prefetch de enlaces del rail que hace Next (solo ?_rsc=, sin datos propios).
  page.on("request", (r) => {
    const u = new URL(r.url());
    // Vercel, Privy y WalletConnect no son la app ni llevan datos de la persona.
    if (ignorarEnSinRed(r)) return;
    // La verificación de la sesión (login) no es un dato de la pantalla.
    if (u.pathname === "/api/sesion") return;
    const claves = [...u.searchParams.keys()];
    if (r.method() === "GET" && claves.length === 1 && claves[0] === "_rsc" && !u.hash) return;
    if (["fetch", "xhr", "websocket", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") pedidos.push(`${r.method()} ${r.url()}`);
  });
  await page.getByRole("button", { name: "Quiero el Pase Brote" }).click();
  await expect(page.getByText("Pase Brote activo (simulado)")).toBeVisible();
  await expect(page.getByText("143 de 300")).toBeVisible();
  expect(pedidos).toEqual([]);
  await page.reload();
  await expect(page.getByText("Pase Brote activo (simulado)")).toBeVisible();
  await page.getByRole("button", { name: "Volver a Explorador" }).click();
  await expect(page.getByText("Pase Brote activo (simulado)")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Quiero el Pase Brote" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Quiero el Pase Brote" })).toBeVisible();
});

test("pedir invitación (sin medidores) y pedir una charla quedan simulados", async ({ page }) => {
  await conIdentidadVerificada(page);
  await page.goto("/sumarte");
  await expect(page.getByText("22 de 35")).toHaveCount(0);
  await page.getByRole("button", { name: "Pedir invitación" }).click();
  await page.getByRole("radio", { name: "Email" }).check();
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(page.getByText("Invitación pedida (simulado)")).toBeVisible();
  await expect(page.getByText("23 de 35")).toHaveCount(0);
  await expect(page.getByText("12 de 15")).toHaveCount(0);
  await page.getByRole("button", { name: "Pedir una charla" }).click();
  await page.getByRole("radio", { name: "Telegram" }).check();
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(page.getByText("Charla pedida (simulado)")).toBeVisible();
});

test("los ⚖ del catálogo están en la pantalla", async ({ page }) => {
  await page.goto("/sumarte");
  for (const t of [
    "Pase Fundador",
    "Membresía de la red",
    "Plan Tribu",
    "Invertir en la empresa",
    "Círculo por invitación",
    "Serie",
    "SAFU",
    "Serie Madre",
    "Fundación de la tierra",
    "Esto no es una oferta",
  ]) {
    await expect(page.getByRole("button", { name: `Qué significa legalmente: ${t}`, exact: true })).toBeVisible();
  }
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US", rol: "ninguno" });

  test("se lee 'Buy a lot', 'See the lots', 'Invest' y los enlaces avisan '(in Spanish)'", async ({ page }) => {
    await page.goto("/sumarte");
    await expect(page.getByRole("heading", { level: 2, name: "Buy a lot" })).toBeVisible();
    await expect(page.getByRole("link", { name: "See the lots" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Invest", exact: true })).toBeVisible();
    await expect(page.getByText("This is not an offer: nothing is sold or charged from this section.")).toBeVisible();
    await expect(page.getByRole("link", { name: "See how it works in the NetX View (in Spanish)" })).toBeVisible();
    await expect(page.getByRole("link", { name: "See how NetX is funded in the NetX View (in Spanish)" })).toBeVisible();
    await expect(page.getByText("Sample values, to be re-tuned")).toBeVisible();
    await expect(page.getByText("Genesis Cohort · date to be defined")).toBeVisible();
  });
});

test("almacenamiento bloqueado: avisa", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("bloqueado", "SecurityError");
    };
  });
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Quiero el Pase Brote" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "no permite guardar datos" })).toBeVisible();
  await expect(page.getByText("Pase Brote activo (simulado)")).toHaveCount(0);
});

test("teclado: se puede activar el pase solo con teclado", async ({ page }) => {
  await page.goto("/sumarte");
  const boton = page.getByRole("button", { name: "Quiero el Pase Brote" });
  await boton.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Pase Brote activo (simulado)")).toBeFocused();
});

test("teclado: elegir la tribu con el Plan Tribu deja el foco en el aviso, que se guarda al recargar", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: "Sumar mi tribu" }).focus();
  await page.keyboard.press("Enter");
  await page.getByRole("radio", { name: /Valle Solar/ }).focus();
  await page.keyboard.press("Space");
  await page.getByRole("button", { name: "Ser líder de esta tribu" }).focus();
  await page.keyboard.press("Enter");
  const aviso = page.getByText("Sos líder de Valle Solar (simulado)");
  await expect(aviso).toBeFocused();
  await page.reload();
  await expect(aviso).toBeVisible();
});

test("con el pase activo el nivel queda fijo y los datos no se contradicen", async ({ page }) => {
  await page.goto("/sumarte");
  const pase = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Pase Fundador/ }) });
  await page.getByRole("button", { name: "Quiero el Pase Brote" }).click();
  await expect(pase.getByRole("radio", { name: /Raíz/ })).toBeDisabled();
  await expect(pase).toContainText("USD 1.500 · pago único");
  await expect(pase).toContainText("USD 450 en créditos");
});

test("el botón de facturación elegido lleva una marca además del color", async ({ page }) => {
  await page.goto("/sumarte");
  await page.getByRole("button", { name: /^Mensual/ }).click();
  await expect(page.getByRole("button", { name: /^Mensual/ })).toContainText("✓");
  await expect(page.getByRole("button", { name: /^Anual/ })).not.toContainText("✓");
});

test("axe sin violaciones serias o críticas en /sumarte", async ({ page }) => {
  await page.goto("/sumarte");
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});
