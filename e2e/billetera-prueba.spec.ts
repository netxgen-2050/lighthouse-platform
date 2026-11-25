import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./fixtura";

const RUTA = "/netx/billetera-prueba";

/** Autenticador virtual de WebAuthn (CDP): hace de "huella o cara" sin diálogo del sistema. */
async function conAutenticadorVirtual(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("WebAuthn.enable");
  await cdp.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
}

/** Foco en el control y Enter: el recorrido entero sin mouse. */
async function activarConTeclado(page: Page, nombre: string) {
  const boton = page.getByRole("button", { name: nombre });
  await expect(boton).toBeEnabled();
  await boton.focus();
  await expect(boton).toBeFocused();
  await page.keyboard.press("Enter");
}

test.describe("prueba de billetera con Candide (modo simulado)", () => {
  test("recorrido completo: passkey, dirección, primera operación, firma fuera y empezar de nuevo", async ({ page }) => {
    // El mock guarda el despliegue y las operaciones en la memoria del proceso: contra un preview (varias funciones) no es fiable.
    test.skip(!!process.env.BASE_URL, "El recorrido completo usa el mock en memoria: solo contra el build local.");
    await conAutenticadorVirtual(page);
    const respuesta = await page.goto(RUTA);
    expect(respuesta?.status()).toBe(200);

    await expect(page.getByRole("heading", { level: 1, name: "Prueba de billetera con passkey" })).toBeVisible();
    await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
    await expect(page.getByText("Base Sepolia, red de prueba: nada de esto tiene valor")).toBeVisible();
    await expect(page.getByText("Modo simulado: no se habla con Candide ni con la red")).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.getByText("Falta configurar Candide (ver el guion)")).toHaveCount(0);

    // Paso 1
    await activarConTeclado(page, "Usar tu huella o tu cara");
    await expect(page.getByText("Passkey creada")).toBeVisible();

    // Paso 2
    const direccion = page.getByTestId("direccion");
    await expect(direccion).toHaveText(/^0x[0-9a-fA-F]{40}$/);
    await expect(page.getByText("Safe sin desplegar")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver la dirección en Basescan" })).toHaveAttribute("href", /sepolia\.basescan\.org\/address\/0x/);
    await expect(page.getByRole("button", { name: "Firmar una constancia fuera de la cadena" })).toBeDisabled();
    await expect(page.getByText("Primero hacé la primera operación")).toBeVisible();
    // Lo que todavía no se hizo dice "sin dato", nunca 0.
    for (const paso of ["Preparar la operación", "Firmar con la passkey", "Esperar la inclusión", "Total"]) {
      const fila = page.getByRole("row", { name: new RegExp(paso) });
      await expect(fila).toContainText(paso === "Total" ? /s$|sin dato/ : "sin dato");
    }

    // Pasos 3 y 4
    await activarConTeclado(page, "Hacer la primera operación");
    await expect(page.getByRole("status")).toContainText("Incluida", { timeout: 20_000 });
    await expect(page.getByRole("link", { name: "Ver la transacción en Basescan" })).toHaveAttribute("href", /sepolia\.basescan\.org\/tx\/0x/);
    await expect(page.getByRole("link", { name: "Ver la constancia en EASScan" })).toHaveAttribute("href", /base-sepolia\.easscan\.org\/attestation\/view\/0x/);
    await expect(page.getByText("Safe desplegada").first()).toBeVisible();

    // Tiempos medidos: todos con segundos (el autenticador virtual es instantáneo, pero es un valor medido, no un 0 inventado).
    const tiempos = page.getByRole("table");
    await expect(tiempos).not.toContainText("sin dato");
    await expect(tiempos).not.toContainText(/(^|\s)0 s/);

    // Paso 5
    await activarConTeclado(page, "Firmar una constancia fuera de la cadena");
    await expect(page.getByText("Válida para la Safe (EIP-1271)")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/UID de la constancia fuera de la cadena: 0x[0-9a-f]{64}/)).toBeVisible();

    // Volver a la página: reconoce la passkey y la dirección
    await page.reload();
    await expect(direccion).toHaveText(/^0x[0-9a-fA-F]{40}$/);
    await expect(page.getByRole("button", { name: "Empezar de nuevo" })).toBeVisible();

    // Empezar de nuevo
    await activarConTeclado(page, "Empezar de nuevo");
    await expect(page.getByRole("button", { name: "Usar tu huella o tu cara" })).toBeVisible();
    await expect(page.getByTestId("direccion")).toHaveCount(0);
  });

  test("passkey cancelada: dice 'No se creó la passkey', no guarda nada y deja reintentar", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.credentials.create = () => Promise.reject(new DOMException("cancelado", "NotAllowedError"));
    });
    const respuesta = await page.goto(RUTA);
    test.skip(respuesta?.status() === 404, "La prueba está apagada en este entorno.");
    await activarConTeclado(page, "Usar tu huella o tu cara");
    await expect(page.getByText(/No se creó la passkey\. Cancelaste el diálogo/)).toBeVisible();
    await expect(page.getByTestId("direccion")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Usar tu huella o tu cara" })).toBeEnabled();
    expect(await page.evaluate(() => Object.keys(window.localStorage).filter((k) => k.includes("prueba-candide")))).toEqual([]);
  });

  test("axe sin violaciones y un solo main", async ({ page }) => {
    const respuesta = await page.goto(RUTA);
    test.skip(respuesta?.status() === 404, "La prueba está apagada en este entorno.");
    await expect(page.getByRole("heading", { level: 1, name: "Prueba de billetera con passkey" })).toBeVisible();
    await expect(page.locator("main")).toHaveCount(1);
    const resultado = await new AxeBuilder({ page }).analyze();
    expect(resultado.violations).toEqual([]);
  });

  test.describe("sin ser super admin", () => {
    test.use({ rol: "persona" });

    test("ve 'No tenés acceso a esta vista' y la ruta responde 403", async ({ page, emailActual }) => {
      const respuesta = await page.goto(RUTA);
      test.skip(respuesta?.status() === 404, "La prueba está apagada en este entorno.");
      await expect(page.getByRole("heading", { name: "No tenés acceso a esta vista" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Usar tu huella o tu cara" })).toHaveCount(0);
      await expect(page.locator("main")).toHaveCount(1);
      const r = await page.request.post("/api/netx/billetera-prueba/cuenta", {
        headers: { "x-lh-prueba": emailActual, "content-type": "application/json" },
        data: { x: "0x1", y: "0x2" },
      });
      expect(r.status()).toBe(403);
    });
  });
});
