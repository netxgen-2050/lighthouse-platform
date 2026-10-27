import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtura";
import { conIdentidadVerificada, ignorarEnSinRed } from "./ayudas";

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
});

test("elegir el nivel Raíz cambia precio y créditos", async ({ page }) => {
  await page.goto("/sumarte");
  const pase = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Pase Fundador/ }) });
  await pase.getByRole("radio", { name: /Raíz/ }).check({ force: true });
  await expect(pase).toContainText("USD 5.000 · pago único");
  await expect(pase).toContainText("USD 1.500 en créditos");
  await expect(pase.getByRole("button", { name: "Quiero el Pase Raíz" })).toBeVisible();
});

test("la tarjeta del Pase dice que da voz en el fideicomiso y el Fondo Común, con su ⚖", async ({ page }) => {
  await page.goto("/sumarte");
  const pase = page.getByRole("article").filter({ has: page.getByRole("heading", { name: /Pase Fundador/ }) });
  await expect(pase).toContainText("Voz en las decisiones del fideicomiso y del Fondo Común");
  await expect(pase.getByRole("button", { name: /Voto en el Fideicomiso/ })).toBeVisible();
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

test("pedir invitación suma un lugar y pedir una charla queda simulado", async ({ page }) => {
  await conIdentidadVerificada(page);
  await page.goto("/sumarte");
  await expect(page.getByText("22 de 35")).toBeVisible();
  await page.getByRole("button", { name: "Pedir invitación" }).click();
  await page.getByRole("radio", { name: "Email" }).check();
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(page.getByText("Invitación pedida (simulado)")).toBeVisible();
  await expect(page.getByText("23 de 35")).toBeVisible();
  await expect(page.getByText("12 de 15")).toBeVisible();
  await page.getByRole("button", { name: "Pedir una charla" }).click();
  await page.getByRole("radio", { name: "Telegram" }).check();
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(page.getByText("Charla pedida (simulado)")).toBeVisible();
});

test("los ⚖ del catálogo están en la pantalla", async ({ page }) => {
  await page.goto("/sumarte");
  for (const t of ["Pase Fundador", "Membresía de la red", "Plan Tribu", "Invertir en la empresa", "Círculo por invitación"]) {
    await expect(page.getByRole("button", { name: `Qué significa legalmente: ${t}` })).toBeVisible();
  }
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
