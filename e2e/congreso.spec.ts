import { ignorarEnSinRed } from "./ayudas";
import { expect, test, type Page } from "./fixtura";

const leerOrigenGuardado = (page: Page) => page.evaluate(() => window.localStorage.getItem("lh-origen"));

const TITULOS_EN_ORDEN = [
  "Contra los futuros distópicos",
  "De la costa al valle",
  "Voces que ya imaginaron",
  "Ocho conversaciones",
  "Un valle que aprende",
  "No vengas solo. Llegá con tu tribu.",
  "Reservá tu lugar bajo el anillo",
  "Tu ticket también abre la puerta a NetX",
  "Antes de armar la mochila",
  "El futuro no se espera",
];

// ===== Con sesión (Miembro por defecto): vitrina completa y registro del ticket =====

test("las secciones aparecen en el orden indicado y el rail marca Congreso", async ({ page }) => {
  await page.goto("/congreso");
  await expect(page.getByRole("heading", { level: 1, name: /Solarpunk Patagonia/ })).toBeVisible();
  const titulos = await page.locator("main h2").allInnerTexts();
  expect(titulos).toHaveLength(TITULOS_EN_ORDEN.length);
  TITULOS_EN_ORDEN.forEach((t, i) => expect(titulos[i].startsWith(t), `${i}: ${titulos[i]}`).toBe(true));
  await expect(
    page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Congreso", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("un solo h1 y la cinta de prototipo", async ({ page }) => {
  await page.goto("/congreso");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("main h1")).toContainText("Solarpunk Patagonia");
  await expect(page.getByText("Prototipo interno · datos de ejemplo").first()).toBeVisible();
  await expect(page.getByText("5–9")).toBeVisible();
  await expect(page.getByRole("group", { name: "Cuenta regresiva al eclipse" })).toBeVisible();
});

test("las cuatro voces reales, todas por confirmar", async ({ page }) => {
  await page.goto("/congreso");
  const voces = page.locator("#voces");
  for (const nombre of ["Roxanne Meadows", "Michel Bauwens", "Michael Reynolds", "Bill Reed"]) {
    await expect(voces.getByRole("heading", { name: nombre })).toBeVisible();
  }
  await expect(voces.locator(".ev-voz-estado")).toHaveCount(4);
  await expect(voces.locator(".ev-voz-estado").filter({ hasText: "Por confirmar" })).toHaveCount(4);
});

test("el recorrido es una lista ordenada con el día del eclipse destacado con texto y ⚖ en obra", async ({ page }) => {
  await page.goto("/congreso");
  const paradas = page.locator("#recorrido ol > li");
  await expect(paradas).toHaveCount(4);
  await expect(paradas.nth(1)).toContainText("Día del eclipse");
  await expect(paradas.nth(3)).toContainText("Manos en la tierra");
  await expect(paradas.nth(3).getByRole("button", { name: "Qué significa legalmente: Horas de obra" })).toBeVisible();
});

test("El encuentro lleva el ⚖ de encuentro educativo y Entradas el del ticket", async ({ page }) => {
  await page.goto("/congreso");
  await expect(page.locator("#acerca").getByRole("button", { name: "Qué significa legalmente: Encuentro educativo" })).toBeVisible();
  await expect(page.locator("#entradas").getByRole("button", { name: "Qué significa legalmente: Ticket del Congreso" })).toBeVisible();
});

test("Tribus: título en voseo, N de M van en texto, ejemplo y enlace a /tribus", async ({ page }) => {
  await page.goto("/congreso");
  const tribus = page.locator("#tribus");
  await expect(tribus.getByRole("heading", { name: "No vengas solo. Llegá con tu tribu." })).toBeVisible();
  await expect(tribus.getByText(/^\d+ de \d+ van$/)).toHaveCount(3);
  await expect(tribus.getByText(/ejemplo/).first()).toBeVisible();
  await expect(tribus.getByRole("link", { name: "Encontrar mi tribu" })).toHaveAttribute("href", "/tribus");
  await expect(page.locator("#territorio").getByRole("link", { name: "Explorar el mapa en NetX" })).toHaveAttribute(
    "href",
    "/territorios/lighthouse",
  );
});

test("el modo de origen se activa con aria-pressed, muestra el texto de origen y al recargar vuelve a apagado", async ({ page }) => {
  await page.goto("/congreso");
  const boton = page.getByRole("button", { name: /¿Qué viene de UnityHub\?/ });
  await expect(boton).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("Viene de UnityHub · agenda")).toBeHidden();
  await boton.click();
  await expect(boton).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Viene de UnityHub · agenda")).toBeVisible();
  await expect(page.getByText("Viene de NetX · tribus")).toBeVisible();
  await expect(page.getByText("Viene de NetX · ticket vinculado y presencia")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: /¿Qué viene de UnityHub\?/ })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("Viene de UnityHub · agenda")).toBeHidden();
});

test("seis precios con la marca ejemplo", async ({ page }) => {
  await page.goto("/congreso");
  const tarjetas = page.locator("#entradas [data-entrada]");
  await expect(tarjetas).toHaveCount(6);
  await expect(tarjetas.locator(".ev-precio small", { hasText: "ejemplo" })).toHaveCount(6);
});

test("Comprar abre el diálogo de demostración: sin nombrar quién cobra, sin navegar ni pedidos, Escape devuelve el foco", async ({
  page,
}) => {
  await page.goto("/congreso");
  const comprar = page.getByRole("button", { name: "Comprar pase completo" });
  await expect(comprar).toBeVisible();
  const urlAntes = page.url();
  const pedidos: { url: string; method: string }[] = [];
  const alPedir = (r: { url(): string; method(): string }) => pedidos.push({ url: r.url(), method: r.method() });
  // Se registra solo entre el clic y el cierre: lo que la sesión pide al cargar la página no cuenta.
  page.on("request", alPedir);
  await comprar.click();
  const dialogo = page.getByRole("dialog", { name: "Acá se abriría la compra del ticket" });
  await expect(dialogo).toBeVisible();
  await expect(dialogo).toContainText("no se cobra nada");
  const texto = await dialogo.innerText();
  expect(texto).not.toMatch(/UnityHub|Stripe|NetX/i);
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect(comprar).toBeFocused();
  page.off("request", alPedir);
  expect(page.url()).toBe(urlAntes);
  const origen = new URL(page.url()).origin;
  const externos = pedidos.filter(
    (p) => !ignorarEnSinRed({ url: () => p.url, method: () => p.method }) && new URL(p.url).origin !== origen,
  );
  expect(externos).toEqual([]);
  expect(pedidos.filter((p) => p.method === "POST")).toEqual([]);
});

test("el diálogo también se cierra con Entendido y el foco queda dentro mientras está abierto", async ({ page }) => {
  await page.goto("/congreso");
  const comprar = page.getByRole("button", { name: "Comprar pase de tribu" });
  await comprar.click();
  const dialogo = page.getByRole("dialog", { name: "Acá se abriría la compra del ticket" });
  await expect(dialogo).toBeVisible();
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Tab");
    // El resto de la página queda inerte: el foco está dentro del diálogo o fuera de la página (el navegador), nunca en ella.
    expect(
      await dialogo.evaluate((d) => d.contains(document.activeElement) || document.activeElement === document.body),
    ).toBe(true);
  }
  await dialogo.getByRole("button", { name: "Entendido" }).click();
  await expect(dialogo).toBeHidden();
  await expect(comprar).toBeFocused();
});

test("la página oficial de ejemplo abre el diálogo de demostración y no navega", async ({ page }) => {
  await page.goto("/congreso");
  const urlAntes = page.url();
  await page.getByRole("button", { name: "Página oficial del evento" }).click();
  await expect(page.getByRole("dialog", { name: "Acá se abriría la página oficial del evento" })).toBeVisible();
  await page.keyboard.press("Escape");
  expect(page.url()).toBe(urlAntes);
});

test("las preguntas se abren con el teclado", async ({ page }) => {
  await page.goto("/congreso");
  const pregunta = page.getByText("¿Necesito una cuenta en NetX para ir?");
  const respuesta = page.getByText(/La entrada se compra en UnityHub/);
  await expect(respuesta).toBeHidden();
  await pregunta.focus();
  await page.keyboard.press("Enter");
  await expect(respuesta).toBeVisible();
});

test("el cierre tiene las dos acciones y el pie", async ({ page }) => {
  await page.goto("/congreso");
  await expect(page.getByRole("link", { name: "Reservar mi lugar" })).toHaveAttribute("href", "#entradas");
  await expect(page.getByRole("link", { name: "Llegar con mi tribu" })).toHaveAttribute("href", "#tribus");
  await expect(page.getByText("Convocan NetX Gen, BioPueblo y Rubania")).toBeVisible();
  await expect(page.getByText("Entradas y check-in con UnityHub")).toBeVisible();
});

test("cinco pasos con quién los hace y el sello Genesis sin ticket", async ({ page }) => {
  await page.goto("/congreso");
  const pasos = page.locator("#ticket ol > li");
  await expect(pasos).toHaveCount(5);
  await expect(pasos.nth(2)).toContainText("NetX");
  await expect(pasos.nth(3)).toContainText("UnityHub");
  await expect(page.getByText("Se activa con tu primer check-in en el territorio.")).toBeVisible();
  await expect(page.locator("#ticket").getByRole("button", { name: "Qué significa legalmente: Presencia" })).toBeVisible();
});

test("registrar el código deja el sello Genesis como pendiente del primer check-in", async ({ page }) => {
  await page.goto("/congreso");
  await page.getByLabel(/Código de tu ticket/).fill("LH27-8F3K-2Q");
  await page.getByRole("button", { name: "Registrar" }).click();
  await expect(page.getByText("Ticket LH27-8F3K-2Q registrado")).toBeVisible();
  await expect(page.getByText("Pendiente del primer check-in")).toBeVisible();
  await expect(page.getByText("Se activa con tu primer check-in en el territorio.")).toHaveCount(0);
});

test("código válido se registra y sobrevive a la recarga; se puede quitar", async ({ page }) => {
  await page.goto("/congreso");
  await expect(page.getByText("Modo demostración: el registro queda solo en este navegador.")).toBeVisible();
  await page.getByLabel(/Código de tu ticket/).fill("lh27-8f3k-2q");
  await page.getByRole("button", { name: "Registrar" }).click();
  await expect(page.locator("p:focus")).toContainText("Ticket LH27-8F3K-2Q registrado");
  await expect(page.getByText("Genesis pendiente")).toBeVisible();
  await page.reload();
  await expect(page.getByText("Ticket LH27-8F3K-2Q registrado")).toBeVisible();
  await page.getByRole("button", { name: "Quitar ticket" }).click();
  const campo = page.getByLabel(/Código de tu ticket/);
  await expect(campo).toHaveValue("");
  await expect(campo).toBeFocused();
  await page.reload();
  await expect(campo).toBeVisible();
  await expect(page.getByText("Ticket LH27-8F3K-2Q registrado")).toHaveCount(0);
  expect(await page.evaluate(() => window.localStorage.getItem("lh-congreso-ticket"))).toBeNull();
});

test("código inválido muestra error asociado al campo y no guarda", async ({ page }) => {
  await page.goto("/congreso");
  const campo = page.getByLabel(/Código de tu ticket/);
  await campo.fill("1234");
  await page.getByRole("button", { name: "Registrar" }).click();
  const id = await campo.getAttribute("aria-describedby");
  expect(id).toBeTruthy();
  await expect(page.locator(`#${id}`)).toContainText("formato");
  expect(await page.evaluate(() => window.localStorage.getItem("lh-congreso-ticket"))).toBeNull();
});

test("almacenamiento bloqueado al cargar: avisa y la página sigue usable", async ({ page }) => {
  await page.addInitScript(() => {
    // El consentimiento de privacidad ya está dado (lo siembra la fixture): lo demás no se puede leer.
    const leer = Storage.prototype.getItem;
    Storage.prototype.getItem = function (clave: string) {
      if (String(clave).endsWith("lh-consentimiento")) return leer.call(this, clave);
      throw new DOMException("bloqueado", "SecurityError");
    };
  });
  await page.goto("/congreso");
  await expect(page.getByRole("alert").filter({ hasText: "no permite guardar datos" })).toBeVisible();
  await expect(page.getByLabel(/Código de tu ticket/)).toBeVisible();
});

test("almacenamiento bloqueado: avisa que no se puede registrar", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("bloqueado", "SecurityError");
    };
  });
  await page.goto("/congreso");
  await page.getByLabel(/Código de tu ticket/).fill("LH27-8F3K-2Q");
  await page.getByRole("button", { name: "Registrar" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "no permite guardar datos" })).toBeVisible();
  await expect(page.getByText("Ticket LH27-8F3K-2Q registrado")).toHaveCount(0);
});

test("/congreso#ticket deja el título de la sección visible debajo de las barras", async ({ page }) => {
  await page.goto("/congreso#ticket");
  const titulo = page.getByRole("heading", { name: "Tu ticket también abre la puerta a NetX" });
  await expect(titulo).toBeInViewport();
  await expect
    .poll(async () => {
      const t = await titulo.boundingBox();
      const barra = await page.locator(".ev-barra").boundingBox();
      if (!t || !barra) return false;
      return t.y >= barra.y + barra.height;
    })
    .toBe(true);
});

test("con 'reducir animaciones' la luna no tiene animación activa", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/congreso");
  const animacion = await page.locator(".ev-luna").evaluate((el) => getComputedStyle(el).animationName);
  expect(animacion).toBe("none");
});

test.describe("celular (390 px)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("barra fija de entradas clickeable y sin scroll horizontal", async ({ page }) => {
    await page.goto("/congreso");
    const barra = page.locator(".ev-barra-compra");
    await expect(barra).toBeVisible();
    await expect(barra).toContainText("ejemplo");
    const ancho = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      cliente: document.documentElement.clientWidth,
    }));
    expect(ancho.scroll).toBeLessThanOrEqual(ancho.cliente);
    await barra.getByRole("link", { name: "Entradas" }).click();
    await expect(page).toHaveURL(/\/congreso#entradas$/);
    await expect(page.getByRole("heading", { name: "Reservá tu lugar bajo el anillo" })).toBeInViewport();
  });
});

test.describe("celular con sesión: la barra de entradas no tapa a Hifa", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("Hifa sigue visible y se puede apretar con la barra a la vista", async ({ page }) => {
    await page.goto("/congreso");
    await expect(page.locator(".ev-barra-compra")).toBeVisible();
    const hifa = page.getByRole("button", { name: "Hablar con Hifa" });
    await expect(hifa).toBeVisible();
    // Playwright comprueba que ningún otro elemento reciba el clic en su lugar.
    await hifa.click();
    await expect(page.getByRole("button", { name: "Hablar con Hifa" })).toBeVisible();
  });
});

test.describe("con la política de privacidad pendiente", () => {
  test.use({ rol: "persona", plan: "explorador", consentimiento: "ninguno" });

  test("ve el llamado a aceptar la política y no el formulario del ticket", async ({ page }) => {
    await page.goto("/congreso#ticket");
    const enlace = page.getByRole("link", { name: "Aceptá la política de privacidad para vincular tu ticket" });
    await expect(enlace).toBeVisible();
    await expect(enlace).toHaveAttribute("href", "/sumarte?volver=%2Fcongreso%23ticket&para=explorador");
    await expect(page.getByLabel(/Código de tu ticket/)).toHaveCount(0);
  });
});

// ===== Sin cuenta =====

test.describe("visitante sin cuenta", () => {
  test.use({ rol: "ninguno" });

  test("ve la vitrina completa en /congreso, sin formulario y con el llamado a sumarse que vuelve al ticket", async ({ page }) => {
    await page.goto("/congreso");
    await expect(page).toHaveURL(/\/congreso$/);
    await expect(page.getByRole("heading", { level: 1, name: /Solarpunk Patagonia/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reservá tu lugar bajo el anillo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tu ticket también abre la puerta a NetX" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "No vengas solo. Llegá con tu tribu." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Antes de armar la mochila" })).toBeVisible();
    await expect(page.locator("#ticket ol > li")).toHaveCount(5);
    await expect(page.getByText("Código de tu ticket")).toHaveCount(0);
    await expect(page.getByLabel(/Código de tu ticket/)).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Sumate gratis para vincular tu ticket" })).toHaveAttribute(
      "href",
      "/sumarte?volver=%2Fcongreso%23ticket&para=explorador",
    );
    const claves = await page.evaluate(() => Object.keys(window.localStorage));
    expect(claves.filter((c) => c.includes("congreso-ticket"))).toEqual([]);
  });

  test("el rail muestra Congreso habilitado", async ({ page }) => {
    await page.goto("/congreso");
    const congreso = page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Congreso", exact: true });
    await expect(congreso).toHaveAttribute("href", "/congreso");
    await expect(congreso).not.toHaveAttribute("aria-disabled", "true");
  });

  test("el modo de origen también funciona sin cuenta", async ({ page }) => {
    await page.goto("/congreso");
    await page.getByRole("button", { name: /¿Qué viene de UnityHub\?/ }).click();
    await expect(page.getByText("Viene de UnityHub · agenda")).toBeVisible();
  });

  test("entrar con UTM guarda el origen y un segundo UTM no lo pisa", async ({ page }) => {
    await page.goto("/congreso?utm_source=pagina-oficial&utm_campaign=congreso-2027");
    await expect.poll(() => leerOrigenGuardado(page)).not.toBeNull();
    const primero = JSON.parse((await leerOrigenGuardado(page)) ?? "{}");
    expect(primero).toMatchObject({ fuente: "pagina-oficial", campana: "congreso-2027" });
    // Marca cuándo corrió el guardado de la segunda visita: GuardarOrigen lee lh-origen antes de decidir.
    await page.addInitScript(() => {
      const leer = Storage.prototype.getItem;
      Storage.prototype.getItem = function (clave: string) {
        if (clave === "lh-origen") (window as unknown as { __origenLeido?: boolean }).__origenLeido = true;
        return leer.call(this, clave);
      };
    });
    await page.goto("/congreso?utm_source=otra");
    await page.waitForFunction(() => (window as unknown as { __origenLeido?: boolean }).__origenLeido === true);
    const despues = JSON.parse((await leerOrigenGuardado(page)) ?? "{}");
    expect(despues.fuente).toBe("pagina-oficial");
  });

  test("sin UTM no se guarda ningún origen", async ({ page }) => {
    await page.goto("/congreso");
    await expect(page.getByRole("heading", { level: 1, name: /Solarpunk Patagonia/ })).toBeVisible();
    expect(await leerOrigenGuardado(page)).toBeNull();
  });

  test("/congreso#ticket sin cuenta deja el título visible debajo de las barras", async ({ page }) => {
    await page.goto("/congreso#ticket");
    const titulo = page.getByRole("heading", { name: "Tu ticket también abre la puerta a NetX" });
    await expect(titulo).toBeInViewport();
    await expect
      .poll(async () => {
        const t = await titulo.boundingBox();
        const barra = await page.locator(".ev-barra").boundingBox();
        if (!t || !barra) return false;
        return t.y >= barra.y + barra.height;
      })
      .toBe(true);
  });
});
