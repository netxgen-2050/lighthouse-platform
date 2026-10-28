import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";
import { ignorarEnSinRed } from "./ayudas";

test("lista las diez decisiones con dónde, regla y ⚖, y el aviso de prototipo", async ({ page }) => {
  const respuesta = await page.goto("/fogon");
  expect(respuesta?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Lo que se está decidiendo" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(10);
  const huerta = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Plan de huerta comunitaria 2027" }) });
  await expect(huerta).toContainText("Círculo de Tierra");
  await expect(huerta).toContainText("Consentimiento");
  await expect(huerta.getByRole("button", { name: /Qué significa legalmente/ })).toBeVisible();
});

test("sin eventos: el Fogón solo lista decisiones, no encuentros ni jornadas", async ({ page }) => {
  await page.goto("/fogon");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "Plan de huerta comunitaria 2027",
    "Presupuesto de obra 2027 del macrolote",
    "Elegir facilitador/a de Valle Solar",
    "Calendario de siembra de otoño",
    "Pedir al Fondo Común una cisterna para la huerta de Valle Solar",
    "Usar el fondo común para la bomba solar",
    "Permitir animales de granja en las chacras",
    "Parámetros de la regalía de regeneración",
    "Pedido de Valle Solar al Fondo Común para la bomba solar",
    "Cisterna compartida entre Agua Clara y Valle Solar",
  ]);
  await expect(page.getByRole("list").getByText(/encuentro|jornada|convocatoria/i)).toHaveCount(0);
});

test("los filtros son Todas, Círculo, Tribu, Lighthouse (el común), Consejo y Fideicomiso; no hay Asamblea de residentes", async ({ page }) => {
  await page.goto("/fogon");
  const filtros = page.getByRole("group", { name: "Filtrar por ámbito" }).getByRole("button");
  // El botón activo lleva un "✓" oculto para lectores que cuenta como texto: se compara el final.
  await expect(filtros).toHaveText([/Todas$/, /Círculo$/, /Tribu$/, /Lighthouse \(el común\)$/, /Consejo$/, /Fideicomiso$/]);
  await expect(page.getByText("Asamblea de residentes")).toHaveCount(0);
  await expect(page.getByText(/residencia fiscal/)).toHaveCount(0);
});

test("filtrar por Lighthouse (el común) muestra la bomba solar, los animales y la regalía, cada uno con su regla y su ⚖", async ({ page }) => {
  await page.goto("/fogon");
  await page.getByRole("button", { name: "Lighthouse (el común)" }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "Usar el fondo común para la bomba solar",
    "Permitir animales de granja en las chacras",
    "Parámetros de la regalía de regeneración",
  ]);
  const bomba = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Usar el fondo común para la bomba solar" }) });
  await expect(bomba).toContainText("Consenso");
  await expect(bomba.getByRole("button", { name: /Qué significa legalmente/ })).toBeVisible();
  await expect(bomba.getByRole("button", { name: "Votar" })).toBeVisible();
  await expect(page.getByText("Asamblea de residentes")).toHaveCount(0);
});

test("filtrar por Círculo y por Consejo deja la decisión de ejemplo de cada uno", async ({ page }) => {
  await page.goto("/fogon");
  await page.getByRole("button", { name: "Círculo", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(["Calendario de siembra de otoño"]);
  await page.getByRole("button", { name: "Consejo", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "Pedido de Valle Solar al Fondo Común para la bomba solar",
    "Cisterna compartida entre Agua Clara y Valle Solar",
  ]);
  await expect(page.getByText("Viene de Valle Solar (aprobada en la tribu)")).toBeVisible();
  await expect(page.getByText("En la versión real votan los representantes.").first()).toBeVisible();
});

test("hay un enlace Cómo decidimos que lleva a la estructura", async ({ page }) => {
  await page.goto("/fogon");
  await page.getByRole("link", { name: "Cómo decidimos" }).click();
  await expect(page).toHaveURL(/\/fogon\/gobernanza$/);
  await expect(page.getByRole("heading", { level: 1, name: "Cómo decidimos" })).toBeVisible();
});

test.describe("Llevar al consejo", () => {
  const cisterna = (page: Page) =>
    page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: /Pedir al Fondo Común una cisterna/ }) });

  test("quien no lidera Valle Solar no ve el botón", async ({ page }) => {
    await page.goto("/fogon");
    await expect(cisterna(page)).toBeVisible();
    await expect(page.getByRole("button", { name: "Llevar al consejo" })).toHaveCount(0);
  });

  test("quien lidera otra tribu tampoco", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("lh-sumarte", JSON.stringify({ plan: "miembro", tribu: true, tribuId: "taller" }));
    });
    await page.goto("/fogon");
    await expect(cisterna(page)).toBeVisible();
    await expect(page.getByRole("button", { name: "Llevar al consejo" })).toHaveCount(0);
  });

  test("la líder de Valle Solar la lleva: aparece en Consejo con su origen, queda al recargar y no sale ningún pedido de red", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("lh-sumarte", JSON.stringify({ plan: "miembro", tribu: true, tribuId: "valle" }));
    });
    const pedidos: string[] = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      if (ignorarEnSinRed(r) || u.pathname === "/api/sesion") return;
      const claves = [...u.searchParams.keys()];
      if (r.method() === "GET" && claves.length === 1 && claves[0] === "_rsc" && !u.hash) return;
      if (["fetch", "xhr", "websocket", "eventsource"].includes(r.resourceType()) || r.method() !== "GET") pedidos.push(`${r.method()} ${r.url()}`);
    });
    await page.goto("/fogon");
    await cisterna(page).getByRole("button", { name: "Llevar al consejo" }).click();
    await expect(cisterna(page).getByText("Ya está en el consejo")).toBeVisible();
    await expect(page.getByRole("button", { name: "Llevar al consejo" })).toHaveCount(0);
    await page.getByRole("button", { name: "Consejo", exact: true }).click();
    const copia = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: /Pedir al Fondo Común una cisterna/ }) });
    await expect(copia).toContainText("Viene de Valle Solar (aprobada en la tribu)");
    expect(pedidos).toEqual([]);
    await page.reload();
    await page.getByRole("button", { name: "Consejo", exact: true }).click();
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(3);
    await expect(page.getByText("Viene de Valle Solar (aprobada en la tribu)")).toHaveCount(2);
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

test("sin residencia cargada no pide el dato y no hay personas de ejemplo", async ({ page }) => {
  await page.goto("/fogon");
  await expect(page.getByText("Sin dato de tu residencia")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Votar" })).toHaveCount(9);
  await expect(page.getByRole("link", { name: "Cargala en Tus datos" })).toHaveCount(0);
  await expect(page.getByLabel("Persona de ejemplo")).toHaveCount(0);
  await expect(page.getByText(/Lucía|Lucas/)).toHaveCount(0);
});

test("la bomba solar se vota sin pedir residencia: el común no es la asamblea", async ({ page }) => {
  await page.goto("/fogon");
  const bomba = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Usar el fondo común para la bomba solar" }) });
  await expect(bomba).toContainText("A favor 21");
  await bomba.getByRole("button", { name: "Votar" }).click();
  await bomba.getByRole("button", { name: "A favor" }).click();
  await expect(bomba).toContainText("A favor 22");
});

test("con residencia en el exterior no aparece \"Solo residentes\"; el fideicomiso pide el Pase", async ({ page }) => {
  await cargarResidencia(page, "exterior");
  await page.goto("/fogon");
  await expect(page.getByText("Solo residentes")).toHaveCount(0);
  await expect(page.getByText("Votan quienes tienen el Pase Fundador")).toBeVisible();
  await expect(page.getByRole("button", { name: "Votar" })).toHaveCount(9);
});

test("filtrar por Fideicomiso deja solo el presupuesto de obra", async ({ page }) => {
  await page.goto("/fogon");
  await page.getByRole("button", { name: "Fideicomiso" }).click();
  await expect(page.getByRole("button", { name: "Fideicomiso" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(["Presupuesto de obra 2027 del macrolote"]);
  await page.getByRole("button", { name: "Todas" }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(10);
});

test("votar a favor en la huerta actualiza el conteo, sin red, y sobrevive a la recarga", async ({ page }) => {
  await page.goto("/fogon");
  const pedidos: string[] = [];
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
  const huerta = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Plan de huerta comunitaria 2027" }) });
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

test("con residencia en Argentina el fideicomiso sigue pidiendo el Pase", async ({ page }) => {
  await cargarResidencia(page, "argentina");
  await page.goto("/fogon");
  await expect(page.getByRole("button", { name: "Votar" })).toHaveCount(9);
  await expect(page.getByText("Solo residentes")).toHaveCount(0);
  await expect(page.getByText("Votan quienes tienen el Pase Fundador")).toBeVisible();
});

test("un voto guardado en una decisión que no existe no rompe el Fogón y se ignora; los de las que existen se conservan", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("lh-fogon", JSON.stringify({ votos: { bomba: "favor", inventada: "contra", huerta: "favor" } }));
  });
  await page.goto("/fogon");
  const huerta = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Plan de huerta comunitaria 2027" }) });
  const bomba = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Usar el fondo común para la bomba solar" }) });
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(10);
  await expect(huerta).toContainText("Tu voto: A favor (simulado)");
  await expect(bomba).toContainText("Tu voto: A favor (simulado)");
});

test("al votar el foco queda en el botón de la decisión y se anuncia en una región persistente", async ({ page }) => {
  await page.goto("/fogon");
  const region = page.getByRole("status");
  await expect(region).toHaveCount(1);
  await expect(region).toHaveText("");
  const huerta = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Plan de huerta comunitaria 2027" }) });
  await huerta.getByRole("button", { name: "Votar" }).click();
  await huerta.getByRole("button", { name: "A favor" }).click();
  await expect(huerta.getByRole("button", { name: "Cambiar voto" })).toBeFocused();
  await expect(region).toContainText("Tu voto quedó registrado: A favor");
  await page.reload();
  await expect(page.getByRole("status")).toHaveCount(1);
  await expect(page.getByRole("status")).toHaveText("");
});

test("repetir el mismo voto vuelve a escribir el anuncio en la región", async ({ page }) => {
  await page.goto("/fogon");
  const region = page.getByRole("status");
  const huerta = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Plan de huerta comunitaria 2027" }) });
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

test("teclado: se vota solo con teclado",async ({ page }) => {
  await page.goto("/fogon");
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
  await page.goto("/fogon");
  await page.getByRole("button", { name: "Votar" }).first().click();
  await page.getByRole("button", { name: "A favor" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "no permite guardar datos" })).toBeVisible();
  await expect(page.getByText("Tu voto: A favor (simulado)")).toHaveCount(0);
});

test("axe sin violaciones serias o críticas en /fogon", async ({ page }) => {
  await page.goto("/fogon");
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  const graves = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(graves.map((v) => ({ id: v.id, nodos: v.nodes.map((n) => n.target) }))).toEqual([]);
});

test.describe("Fideicomiso y Pase Fundador", () => {
  const presupuesto = (page: Page) =>
    page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: /Presupuesto de obra 2027/ }) });

  test.describe("Miembro sin Pase", () => {
    test.use({ plan: "miembro" });

    test("ve el presupuesto con su conteo y la nota con enlace a Sumarte, sin botón de votar", async ({ page }) => {
      await cargarResidencia(page, "argentina");
      await page.goto("/fogon");
      await page.getByRole("button", { name: "Fideicomiso" }).click();
      const p = presupuesto(page);
      await expect(p).toContainText("A favor 17");
      await expect(p).toContainText("Votan quienes tienen el Pase Fundador");
      await expect(p.getByRole("button", { name: "Votar" })).toHaveCount(0);
      await expect(p.getByRole("link", { name: "Ver el Pase Fundador en Sumarte" })).toHaveAttribute("href", "/sumarte");
    });
  });

  test.describe("Fundador", () => {
    test.use({ plan: "fundador" });

    test("vota a favor y el conteo se actualiza, aunque no haya cargado su residencia", async ({ page }) => {
      await page.goto("/fogon");
      await page.getByRole("button", { name: "Fideicomiso" }).click();
      const p = presupuesto(page);
      await p.getByRole("button", { name: "Votar" }).click();
      await p.getByRole("button", { name: "A favor" }).click();
      await expect(p).toContainText("Tu voto: A favor (simulado)");
      await expect(p).toContainText("A favor 18");
      await expect(p.getByText("Votan quienes tienen el Pase Fundador")).toHaveCount(0);
    });

    test("axe sin violaciones serias o críticas en la pestaña Fideicomiso", async ({ page }) => {
      await page.goto("/fogon");
      await page.getByRole("button", { name: "Fideicomiso" }).click();
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    });
  });
});

test.describe("Parámetros opcionales de una decisión", () => {
  // La zona horaria de Argentina (UTC−3): una fecha AAAA-MM-DD mal leída se vería un día antes.
  test.use({ timezoneId: "America/Argentina/Buenos_Aires" });
  const tarjeta = (page: Page, titulo: string | RegExp) =>
    page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: titulo }) });

  test("el pedido para la bomba solar muestra el monto, que sale del Fondo Común, y la fecha de cierre, con plata simulada", async ({ page }) => {
    await page.goto("/fogon");
    const bomba = tarjeta(page, "Pedido de Valle Solar al Fondo Común para la bomba solar");
    await expect(bomba).toContainText("Cierra el: 15 de noviembre de 2026");
    await expect(bomba).toContainText(/Monto pedido: .*4\.?800.* \(simulado\)/);
    await expect(bomba).toContainText("Fuente: Fondo Común");
    await expect(bomba).toContainText("Plata simulada: nadie paga ni cobra.");
    await expect(bomba).not.toContainText("Se apoya en:");
  });

  test("una decisión sin parámetros no muestra filas de plazo, acuerdo ni monto", async ({ page }) => {
    await page.goto("/fogon");
    const d = tarjeta(page, "Elegir facilitador/a de Valle Solar");
    await expect(d).not.toContainText("Cierra el:");
    await expect(d).not.toContainText("Se apoya en:");
    await expect(d).not.toContainText("Monto pedido:");
  });

  test("un monto sin cifra dice sin dato y nunca 0", async ({ page }) => {
    await page.goto("/fogon");
    const d = tarjeta(page, "Cisterna compartida entre Agua Clara y Valle Solar");
    await expect(d).toContainText("Monto pedido: sin dato");
    await expect(d).not.toContainText("(simulado)");
    await expect(d).not.toContainText(/Monto pedido:\s*(US\$\s*|\$\s*)?0/);
    await expect(d).toContainText("Se apoya en: Norma: Norma de uso compartido del agua (ejemplo)");
  });
});

test.describe("Decisiones de ejemplo con camino", () => {
  test("la regalía está en el común y la cisterna compartida en el consejo, con su regla y su ⚖", async ({ page }) => {
    await page.goto("/fogon");
    await page.getByRole("button", { name: "Lighthouse (el común)" }).click();
    const regalia = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Parámetros de la regalía de regeneración" }) });
    await expect(regalia).toContainText("Se apoya en: Pacto: Pacto de regalía regenerativa (ejemplo)");
    await expect(regalia.getByRole("button", { name: /Qué significa legalmente/ })).toBeVisible();
    await page.getByRole("button", { name: "Consejo", exact: true }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Cisterna compartida entre Agua Clara y Valle Solar" })).toBeVisible();
  });
});
