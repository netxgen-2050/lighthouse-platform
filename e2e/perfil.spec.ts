import { expect, test, type Page } from "@playwright/test";

async function completar(page: Page) {
  await page.getByRole("button", { name: "Completar mi perfil" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("Ana Pérez");
  await page.getByLabel("De dónde sos").fill("Mendoza");
  await page.getByLabel("Una frase sobre vos").fill("Quiero vivir en comunidad");
  await page.getByLabel("Qué sabés hacer y qué ofrecés").fill("Huerta y compost");
  await page.getByLabel("Jardinería").check();
  await page.getByLabel("Cómo te gusta decidir en comunidad").fill("Por consenso");
  await page.getByLabel("Qué no negociás").fill("El agua");
  await page.getByRole("button", { name: "Guardar" }).click();
}

test("perfil vacío: página de perfil sin conversación y con 'sin dato'", async ({ page }) => {
  await page.goto("/perfil");
  await expect(page.getByRole("heading", { level: 1, name: "Tu perfil" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.getByRole("button", { name: "Completar mi perfil" })).toBeVisible();
  await expect(page.getByLabel("Tu respuesta")).toHaveCount(0);
  await expect(page.getByText("Contale al agente")).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Resumen" })).toContainText("Pactos activos: sin dato");
  await expect(page.getByRole("region", { name: "Resumen" })).toContainText("Semillas totales");
  await expect(page.getByRole("region", { name: "Tus comunidades" })).toContainText("Todavía no pertenecés a ninguna comunidad");
  await expect(page.getByRole("main")).toHaveCount(1);
});

test("completar el perfil lo muestra y sobrevive a recargar", async ({ page }) => {
  await page.goto("/perfil");
  await completar(page);
  await expect(page.getByRole("status").filter({ hasText: "guardamos tu perfil" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Editar mi perfil" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Ana Pérez" })).toBeVisible();
  await expect(page.getByText("Mendoza")).toBeVisible();
  await expect(page.getByRole("region", { name: "Qué sabés hacer y qué ofrecés" })).toContainText("Huerta y compost");
  await expect(page.getByRole("list", { name: "Tus roles" }).getByRole("listitem")).toHaveText(["Jardinería"]);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Ana Pérez" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Cómo decidís y qué no negociás" })).toContainText("El agua");
});

test("cambiar la frase y guardar: se ve también al recargar", async ({ page }) => {
  await page.goto("/perfil");
  await completar(page);
  await page.getByRole("button", { name: "Editar mi perfil" }).click();
  await page.getByLabel("Una frase sobre vos").fill("Sembrar y compartir");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByText("«Sembrar y compartir»")).toBeVisible();
  await page.reload();
  await expect(page.getByText("«Sembrar y compartir»")).toBeVisible();
});

test("sin nombre no guarda: error asociado al campo y foco en él", async ({ page }) => {
  await page.goto("/perfil");
  await page.getByRole("button", { name: "Completar mi perfil" }).click();
  await page.getByRole("button", { name: "Guardar" }).click();
  const campo = page.getByLabel("Nombre", { exact: true });
  const error = page.locator("#error-nombre");
  await expect(error).toContainText("Error: Escribí tu nombre.");
  await expect(campo).toHaveAttribute("aria-invalid", "true");
  await expect(campo).toHaveAttribute("aria-describedby", "error-nombre");
  await expect(campo).toBeFocused();
  expect(await page.evaluate(() => window.localStorage.getItem("lh-perfil"))).toBeNull();
});

test("el rol Otro pide que cuentes cuál", async ({ page }) => {
  await page.goto("/perfil");
  await page.getByRole("button", { name: "Completar mi perfil" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("Ana");
  await page.getByLabel("Otro", { exact: true }).check();
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.locator("#error-rolOtro")).toContainText("Contanos qué otro rol tenés");
  await expect(page.getByLabel("Qué otro rol tenés")).toBeFocused();
  await page.getByLabel("Qué otro rol tenés").fill("Apicultura");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("list", { name: "Tus roles" })).toContainText("Otro: Apicultura");
});

test("cancelar la edición no cambia nada y devuelve el foco", async ({ page }) => {
  await page.goto("/perfil");
  await completar(page);
  await page.getByRole("button", { name: "Editar mi perfil" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("Otra persona");
  await page.getByRole("button", { name: "Cancelar" }).click();
  await expect(page.getByRole("heading", { name: "Ana Pérez" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Editar mi perfil" })).toBeFocused();
});

test("migración: lo confirmado en la entrevista vieja aparece en 'Qué sabés hacer y qué ofrecés'", async ({ page }) => {
  await page.addInitScript(() => {
    if (window.localStorage.getItem("lh-perfil-entrevista")) return;
    const item = (r: string) => ({ respuesta: r, propuesta: r, confirmado: r });
    window.localStorage.setItem(
      "lh-perfil-entrevista",
      JSON.stringify({
        items: [item("Vivir en comunidad"), item("Montaña"), item("Por consenso"), item("Albañilería y huerta")],
      }),
    );
  });
  await page.goto("/perfil");
  await expect(page.getByRole("region", { name: "Qué sabés hacer y qué ofrecés" })).toContainText("Albañilería y huerta");
  await expect(page.getByRole("region", { name: "Cómo decidís y qué no negociás" })).toContainText("Por consenso");
  await expect(page.getByText("«Vivir en comunidad»")).toBeVisible();
});

test("comunidades y resumen salen de la membresía y los pactos guardados", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("lh-membresia", JSON.stringify({ lighthouse: "miembro", valle: "pedido" }));
    const tiempo = { rol: "facilitacion", rolOtro: "", descripcion: "Facilito", horas: 20, paso: 2 };
    window.localStorage.setItem("lh-pactos", JSON.stringify({ comunidades: { lighthouse: { tiempo, aportes: [200] } } }));
  });
  await page.goto("/perfil");
  const comunidades = page.getByRole("region", { name: "Tus comunidades" });
  await expect(comunidades).toContainText("Lighthouse");
  await expect(comunidades).toContainText("Miembro");
  await expect(comunidades).toContainText("Pedido enviado");
  const resumen = page.getByRole("region", { name: "Resumen" });
  await expect(resumen).toContainText("Pactos activos: 1");
  // 20 h × 5,035 USD/h = 101 Semillas por mes × 3 meses = 303, más 200 del aporte.
  await expect(resumen).toContainText("Semillas totales: 503");
  await expect(resumen.getByRole("link", { name: "Ir a Pactos" })).toHaveAttribute("href", "/pactos");
  await expect(resumen.getByRole("link", { name: "Ir a Semillas" })).toHaveAttribute("href", "/semillas");
});

test("con el almacenamiento bloqueado: comunidades y resumen dicen 'sin dato' y se avisa", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("bloqueado", "SecurityError");
      },
    });
  });
  await page.goto("/perfil");
  const comunidades = page.getByRole("region", { name: "Tus comunidades" });
  await expect(comunidades).toContainText("sin dato");
  await expect(comunidades).not.toContainText("Todavía no pertenecés");
  await expect(page.getByRole("region", { name: "Resumen" })).toContainText("Pactos activos: sin dato");
  await expect(page.getByRole("alert").filter({ hasText: "no permite guardar" })).toBeVisible();
});

test("si el navegador no deja guardar, aparece el error y no el 'Listo'", async ({ page }) => {
  await page.goto("/perfil");
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("lleno", "QuotaExceededError");
    };
  });
  await page.getByRole("button", { name: "Completar mi perfil" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("Ana");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "no permite guardar" })).toBeVisible();
  await expect(page.getByText("Listo: guardamos tu perfil.")).toHaveCount(0);
});

test("con varios errores el foco va al primer campo en el orden del formulario", async ({ page }) => {
  await page.goto("/perfil");
  await page.getByRole("button", { name: "Completar mi perfil" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("Ana");
  await page.getByLabel("Otro", { exact: true }).check();
  await page.getByLabel("Qué no negociás").fill("x".repeat(2000));
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.locator("#error-rolOtro")).toBeVisible();
  await expect(page.locator("#error-noNegociables")).toBeVisible();
  await expect(page.getByLabel("Qué otro rol tenés")).toBeFocused();
});

test("guardar no hace pedidos de red con los datos", async ({ page }) => {
  await page.goto("/perfil");
  const origen = new URL(page.url()).origin;
  const pedidos: string[] = [];
  page.on("request", (r) => {
    const propio = r.url().startsWith(origen + "/");
    const lleva = r.url().includes("secreto-") || (r.postData() ?? "").includes("secreto-");
    if ((propio && r.method() !== "GET") || lleva) pedidos.push(`${r.method()} ${r.url()}`);
  });
  await page.getByRole("button", { name: "Completar mi perfil" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill("secreto-nombre");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("heading", { name: "secreto-nombre" })).toBeVisible();
  expect(pedidos).toEqual([]);
});

test("con teclado se completa y guarda el formulario", async ({ page }) => {
  await page.goto("/perfil");
  await page.getByRole("button", { name: "Completar mi perfil" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Nombre", { exact: true })).toBeFocused();
  await page.keyboard.type("Con teclado");
  await page.getByRole("button", { name: "Guardar" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Con teclado" })).toBeVisible();
});
