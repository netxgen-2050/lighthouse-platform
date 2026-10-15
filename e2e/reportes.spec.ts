import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";

const NOMBRE_BOTON = "Reportar un problema o una idea";

async function abrir(page: Page) {
  await page.getByRole("button", { name: NOMBRE_BOTON }).click();
  const dialogo = page.getByRole("dialog", { name: "Reportar un problema o una idea" });
  await expect(dialogo).toBeVisible();
  return dialogo;
}

for (const ruta of ["/", "/tribus/valle", "/sumarte", "/netx"]) {
  test(`el botón Reportar sigue pegado al borde derecho, a media altura, al final de ${ruta}`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(ruta);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const boton = page.getByRole("button", { name: NOMBRE_BOTON });
    await expect(boton).toBeInViewport();
    const caja = (await boton.boundingBox())!;
    expect(Math.abs(caja.x + caja.width - 1280)).toBeLessThanOrEqual(1);
    expect(Math.abs(caja.y + caja.height / 2 - 360)).toBeLessThanOrEqual(2);
  });
}

for (const ancho of [1280, 390]) {
  test(`${ancho} px: el botón Reportar es un círculo del tamaño del de Hifa, solo con el bicho y anillo punteado`, async ({ page }) => {
    await page.setViewportSize({ width: ancho, height: 800 });
    await page.goto("/");
    const boton = page.getByRole("button", { name: NOMBRE_BOTON });
    await expect(boton).toHaveText("");
    await expect(boton.locator("svg[aria-hidden='true']")).toHaveCount(1);
    const estilo = await boton.evaluate((el) => {
      const s = getComputedStyle(el);
      return { borde: s.borderTopStyle, radio: parseFloat(s.borderTopLeftRadius) };
    });
    expect(estilo.borde).toBe("dashed");
    expect(estilo.radio).toBeGreaterThan(30);
    const interno = (await boton.locator("span").first().boundingBox())!;
    const hifa = (await page.getByRole("button", { name: "Hablar con Hifa" }).boundingBox())!;
    expect(Math.round(interno.width)).toBe(Math.round(hifa.width));
    expect(Math.round(interno.height)).toBe(Math.round(hifa.height));
  });
}

test("el tooltip Reportar aparece con el mouse y con el foco, y Escape lo oculta", async ({ page }) => {
  await page.goto("/");
  const boton = page.getByRole("button", { name: NOMBRE_BOTON });
  await boton.hover();
  await expect(page.getByRole("tooltip")).toHaveText("Reportar");
  await page.mouse.move(5, 5);
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await boton.focus();
  await expect(page.getByRole("tooltip")).toHaveText("Reportar");
  await expect(boton).toHaveAccessibleName(NOMBRE_BOTON);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
});

test("clic en Reportar y un solo Escape (sin mover el mouse) cierra el diálogo", async ({ page }) => {
  await page.goto("/");
  const boton = page.getByRole("button", { name: NOMBRE_BOTON });
  await boton.click();
  const dialogo = page.getByRole("dialog");
  await expect(dialogo).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
});

test("celular 390 x 844: el botón se ve, no tapa el rail y no hay scroll horizontal", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const boton = page.getByRole("button", { name: NOMBRE_BOTON });
  await expect(boton).toBeInViewport();
  const b = (await boton.boundingBox())!;
  const r = (await page.getByRole("navigation", { name: "Principal" }).boundingBox())!;
  expect(b.x).toBeGreaterThanOrEqual(r.x + r.width);
  const desborde = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(desborde).toBe(false);
});

test("sin escribir qué pasó muestra el error y no envía nada", async ({ page }) => {
  let pedidos = 0;
  await page.route("**/api/reportes", (ruta) => {
    pedidos += 1;
    return ruta.fulfill({ status: 200, json: { ok: true, numero: 1 } });
  });
  await page.goto("/");
  const dialogo = await abrir(page);
  await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(dialogo.getByRole("alert")).toContainText("Contanos qué pasó");
  await expect(dialogo.getByLabel(/¿Qué pasó\?/)).toBeFocused();
  expect(pedidos).toBe(0);
});

test("teclado: Enter abre, Escape cierra y el foco vuelve al botón", async ({ page }) => {
  await page.goto("/");
  const boton = page.getByRole("button", { name: NOMBRE_BOTON });
  await boton.focus();
  await page.keyboard.press("Enter");
  const dialogo = page.getByRole("dialog");
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByRole("radio").first()).toBeVisible();
  const foco = await page.evaluate(() => document.activeElement?.closest("dialog") !== null);
  expect(foco).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect(boton).toBeFocused();
});

test("el diálogo avisa quién ve el reporte y el contacto", async ({ page }) => {
  await page.goto("/");
  const dialogo = await abrir(page);
  await expect(dialogo.getByText("Tu reporte, y tu contacto si lo dejás, lo ve el equipo de NetX.")).toBeVisible();
  await expect(dialogo.getByLabel(/Tu nombre o email/)).toHaveAccessibleDescription(/lo ve el equipo de NetX/);
});

test("el diálogo muestra el contexto: ruta, pantalla y versión", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/tribus/valle");
  const dialogo = await abrir(page);
  await expect(dialogo).toContainText("/tribus/valle");
  await expect(dialogo).toContainText("1280 × 720 px");
  await expect(dialogo).toContainText("Versión:");
});

test("envío correcto: muestra el número del issue", async ({ page }) => {
  let enviado: Record<string, unknown> = {};
  await page.route("**/api/reportes", (ruta) => {
    enviado = ruta.request().postDataJSON();
    return ruta.fulfill({ status: 200, json: { ok: true, numero: 42 } });
  });
  await page.goto("/");
  const dialogo = await abrir(page);
  await dialogo.getByLabel(/¿Qué pasó\?/).fill("Se rompe el mapa");
  await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(dialogo.getByText("¡Gracias! Quedó registrado (#42)")).toBeVisible();
  expect(enviado.quePaso).toBe("Se rompe el mapa");
  expect(enviado.tipo).toBe("bug");
});

test("sin token: avisa, ofrece copiar y conserva el texto", async ({ page }) => {
  await page.route("**/api/reportes", (ruta) =>
    ruta.fulfill({ status: 503, json: { ok: false, configurado: false } }),
  );
  await page.goto("/");
  const dialogo = await abrir(page);
  await dialogo.getByLabel(/¿Qué pasó\?/).fill("Texto que no se debe perder");
  await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(dialogo.getByRole("alert")).toContainText("No se pudo registrar");
  await expect(dialogo.getByRole("button", { name: "Copiar el reporte" })).toBeVisible();
  await expect(dialogo.getByLabel(/¿Qué pasó\?/)).toHaveValue("Texto que no se debe perder");
});

test("axe: el diálogo abierto no tiene violaciones serias o críticas", async ({ page }) => {
  await page.goto("/");
  await abrir(page);
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test("el diálogo muestra la URL completa que se adjunta", async ({ page }) => {
  await page.goto("/tribus/valle");
  const dialogo = await abrir(page);
  await expect(dialogo).toContainText(new URL(page.url()).href);
});

test("cerrar y reabrir mientras se envía no habilita un segundo envío", async ({ page }) => {
  let pedidos = 0;
  await page.route("**/api/reportes", async (ruta) => {
    pedidos += 1;
    await new Promise((r) => setTimeout(r, 1200));
    await ruta.fulfill({ status: 200, json: { ok: true, numero: 7 } });
  });
  await page.goto("/");
  const dialogo = await abrir(page);
  await dialogo.getByLabel(/¿Qué pasó\?/).fill("Algo");
  await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(dialogo.getByRole("button", { name: "Enviando…" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await abrir(page);
  await expect(dialogo.getByRole("button", { name: "Enviando…" })).toBeDisabled();
  await expect(dialogo.getByText("¡Gracias! Quedó registrado (#7)")).toBeVisible();
  expect(pedidos).toBe(1);
});

test("si falla copiar al portapapeles, lo avisa", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denegado")) },
      configurable: true,
    });
  });
  await page.route("**/api/reportes", (ruta) =>
    ruta.fulfill({ status: 503, json: { ok: false, configurado: false } }),
  );
  await page.goto("/");
  const dialogo = await abrir(page);
  await dialogo.getByLabel(/¿Qué pasó\?/).fill("Algo");
  await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
  await dialogo.getByRole("button", { name: "Copiar el reporte" }).click();
  await expect(dialogo.getByText("No se pudo copiar")).toBeVisible();
});

test("el token no aparece en el HTML ni en el código que recibe el navegador", async ({ page }) => {
  // Limitación: contra un preview con token real solo se comprueba que el valor no está en lo
  // que recibe el navegador por los patrones de token conocidos (ghp_, github_pat_); el valor
  // exacto del token no se puede conocer desde acá.
  const pendientes: Promise<string>[] = [];
  page.on("response", (res) => {
    const tipo = res.headers()["content-type"] ?? "";
    if (/html|javascript|json/.test(tipo)) pendientes.push(res.text().catch(() => ""));
  });
  await page.goto("/");
  await abrir(page);
  await page.waitForLoadState("networkidle");
  // Se esperan todos los cuerpos antes de afirmar.
  const textos = await Promise.all(pendientes);
  expect(textos.length).toBeGreaterThan(0);
  for (const t of textos) {
    expect(t).not.toContain("REPORTES_GITHUB_TOKEN");
    expect(t).not.toMatch(/ghp_|github_pat_/);
  }
});

async function axeSinGraves(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  return graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }));
}

test("con la sesión vencida en el servidor, el diálogo pasa al modo sin cuenta, señala el email y no pierde lo escrito", async ({ page }) => {
  let pedidos = 0;
  await page.route("**/api/reportes", (ruta) => {
    pedidos += 1;
    return ruta.fulfill({ status: 401, json: { ok: false, sesion: false } });
  });
  await page.goto("/");
  const dialogo = await abrir(page);
  await dialogo.getByLabel(/¿Qué pasó\?/).fill("Texto a conservar");
  await dialogo.getByLabel(/Tu nombre o email/).fill("Juan");
  await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
  await expect(dialogo.getByText(/Estás reportando sin cuenta/)).toBeVisible();
  await expect(dialogo.getByText(/Tu sesión ya no es válida/)).toBeVisible();
  await expect(dialogo.getByText("Error: Escribí un email válido o dejalo vacío.")).toBeVisible();
  await expect(dialogo.getByLabel(/Tu email/)).toBeFocused();
  await expect(dialogo.getByLabel(/¿Qué pasó\?/)).toHaveValue("Texto a conservar");
  expect(pedidos).toBe(1);
});

test.describe("sin cuenta", () => {
  test.use({ rol: "ninguno" });

  for (const ruta of ["/", "/tribus/valle", "/territorios/lighthouse", "/sumarte", "/privacidad"]) {
    test(`el botón Reportar aparece en ${ruta}`, async ({ page }) => {
      await page.goto(ruta);
      await expect(page.getByRole("button", { name: NOMBRE_BOTON })).toBeVisible();
    });
  }

  test("teclado: Enter abre, Escape cierra y el foco vuelve al botón", async ({ page }) => {
    await page.goto("/");
    const boton = page.getByRole("button", { name: NOMBRE_BOTON });
    // Se llega con Tab, como una persona que usa solo el teclado.
    for (let i = 0; i < 100 && !(await boton.evaluate((el) => el === document.activeElement)); i++) {
      await page.keyboard.press("Tab");
    }
    await expect(boton).toBeFocused();
    await page.keyboard.press("Enter");
    const dialogo = page.getByRole("dialog");
    await expect(dialogo).toBeVisible();
    expect(await page.evaluate(() => document.activeElement?.closest("dialog") !== null)).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialogo).toBeHidden();
    await expect(boton).toBeFocused();
  });

  test("muestra el aviso de publicación y el campo Tu email, no Tu nombre o email", async ({ page }) => {
    await page.goto("/");
    const dialogo = await abrir(page);
    await expect(
      dialogo.getByText(
        "Estás reportando sin cuenta. Tu reporte se publica como un issue en GitHub, donde lo ve el equipo de NetX y quien tenga acceso a ese repositorio. Si dejás tu email, queda escrito en el issue. También se envía lo que ves en «Esto se adjunta al reporte». Tu IP solo se usa un rato para limitar los envíos y no va al issue.",
      ),
    ).toBeVisible();
    await expect(dialogo.getByRole("heading", { name: "Esto se adjunta al reporte" })).toBeVisible();
    const email = dialogo.getByLabel(/Tu email/);
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAccessibleDescription(/Solo si querés que te respondamos\. Queda escrito en el issue\./);
    await expect(dialogo.getByLabel(/Tu nombre o email/)).toHaveCount(0);
  });

  test("el contexto va sin query ni fragmento", async ({ page }) => {
    await page.goto("/sumarte?volver=%2Fpactos");
    const dialogo = await abrir(page);
    await expect(dialogo).toContainText("/sumarte");
    await expect(dialogo).not.toContainText("volver=");
  });

  test("un email mal escrito muestra el error, lleva el foco al campo y no envía", async ({ page }) => {
    let pedidos = 0;
    await page.route("**/api/reportes", (ruta) => {
      pedidos += 1;
      return ruta.fulfill({ status: 200, json: { ok: true, numero: 1 } });
    });
    await page.goto("/");
    const dialogo = await abrir(page);
    await dialogo.getByLabel(/¿Qué pasó\?/).fill("Algo");
    await dialogo.getByLabel(/Tu email/).fill("juan");
    await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
    await expect(dialogo.getByRole("alert")).toContainText("Error: Escribí un email válido o dejalo vacío.");
    await expect(dialogo.getByLabel(/Tu email/)).toBeFocused();
    expect(pedidos).toBe(0);
    expect(await axeSinGraves(page)).toEqual([]);
  });

  test("envío correcto sin cuenta: número del issue y sin cabecera de sesión", async ({ page }) => {
    let cabeceras: Record<string, string> = {};
    await page.route("**/api/reportes", (ruta) => {
      cabeceras = ruta.request().headers();
      return ruta.fulfill({ status: 200, json: { ok: true, numero: 51 } });
    });
    await page.goto("/");
    const dialogo = await abrir(page);
    await dialogo.getByLabel(/¿Qué pasó\?/).fill("Se rompe");
    await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
    await expect(dialogo.getByText("¡Gracias! Quedó registrado (#51)")).toBeVisible();
    expect(cabeceras.authorization).toBeUndefined();
    expect(Object.keys(cabeceras).filter((k) => k.startsWith("x-lh"))).toEqual([]);
  });

  test("límite alcanzado: avisa en minutos, conserva el texto y ofrece copiar; axe sin violaciones", async ({ page }) => {
    await page.route("**/api/reportes", (ruta) =>
      ruta.fulfill({ status: 429, headers: { "Retry-After": "300" }, json: { ok: false, reintentarEnSegundos: 300 } }),
    );
    await page.goto("/");
    const dialogo = await abrir(page);
    await dialogo.getByLabel(/¿Qué pasó\?/).fill("Texto a conservar");
    await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
    await expect(dialogo.getByRole("alert")).toContainText(
      "Llegaste al límite de reportes por ahora. Probá de nuevo en 5 minutos.",
    );
    await expect(dialogo.getByLabel(/¿Qué pasó\?/)).toHaveValue("Texto a conservar");
    await expect(dialogo.getByRole("button", { name: "Copiar el reporte" })).toBeVisible();
    expect(await axeSinGraves(page)).toEqual([]);
  });

  test("el campo trampa completado por script llega a la ruta y el diálogo agradece sin número", async ({ page }) => {
    let enviado: Record<string, unknown> = {};
    await page.route("**/api/reportes", (ruta) => {
      enviado = ruta.request().postDataJSON();
      return ruta.fulfill({ status: 200, json: { ok: true, numero: 0 } });
    });
    await page.goto("/");
    const dialogo = await abrir(page);
    await dialogo.getByLabel(/¿Qué pasó\?/).fill("Algo");
    await page.locator("#rep-sitio-web").evaluate((el: HTMLInputElement) => {
      const poner = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      poner.call(el, "spam");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await dialogo.getByRole("button", { name: "Enviar reporte" }).click();
    await expect(dialogo.getByText("¡Gracias! Quedó registrado")).toBeVisible();
    await expect(dialogo.getByText(/\(#/)).toHaveCount(0);
    expect(enviado.sitioWeb).toBe("spam");
  });

  test("la ruta real, sin sesión, rechaza lo que corresponde sin crear issues", async ({ request }) => {
    const base = { tipo: "bug", quePaso: "x", esperabas: "", contacto: "", contexto: {} };
    const trampa = await request.post("/api/reportes", { data: { ...base, sitioWeb: "spam" } });
    expect(trampa.status()).toBe(200);
    expect(await trampa.json()).toEqual({ ok: true, numero: 0 });
    const grande = await request.post("/api/reportes", { data: { ...base, quePaso: "a".repeat(100 * 1024) } });
    expect(grande.status()).toBe(413);
    const vacio = await request.post("/api/reportes", { data: { ...base, quePaso: "" } });
    expect(vacio.status()).toBe(400);
    const plano = await request.post("/api/reportes", {
      headers: { "Content-Type": "text/plain" },
      data: JSON.stringify(base),
    });
    expect(plano.status()).toBe(415);
  });
});
