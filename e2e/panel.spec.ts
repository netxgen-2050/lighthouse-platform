import { expect, test, type Page } from "@playwright/test";

/** Completa el perfil: solo nombre y decisión (2 de 6, sin lo básico) o los tres campos básicos (3 de 6). */
async function perfil(page: Page, datos: "a-medias" | "basicos", nombre = "Ana Pérez") {
  await page.goto("/perfil");
  await page.getByRole("button", { name: "Completar mi perfil" }).click();
  await page.getByLabel("Nombre", { exact: true }).fill(nombre);
  if (datos === "a-medias") {
    await page.getByLabel("Cómo te gusta decidir en comunidad").fill("Por consenso");
  } else {
    await page.getByLabel("De dónde sos").fill("Mendoza");
    await page.getByLabel("Una frase sobre vos").fill("Quiero vivir en comunidad");
  }
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("heading", { name: nombre })).toBeVisible();
}

async function compromiso(page: Page, tipo: "Ofrezco" | "Necesito", descripcion: string) {
  await page.goto("/compromisos");
  await page.getByRole("radio", { name: tipo }).check();
  await page.getByLabel("Descripción").fill(descripcion);
  await page.getByLabel("Horas por mes").fill("8");
  await page.getByRole("button", { name: "Registrar" }).click();
  await expect(page.getByText(descripcion, { exact: false }).first()).toBeVisible();
}

async function ticket(page: Page, codigo: string) {
  await page.goto("/congreso");
  await page.getByLabel(/Código de tu ticket/).fill(codigo);
  await page.getByRole("button", { name: "Registrar" }).click();
  await expect(page.getByText(`Ticket ${codigo} registrado`)).toBeVisible();
}

function tarjeta(page: Page, nombre: string) {
  return page.getByRole("region", { name: nombre });
}

test("panel vacío: estados vacíos, próximo paso perfil y aviso", async ({ page }) => {
  await page.goto("/panel");
  await expect(page.getByRole("heading", { level: 1, name: "Mi recorrido" })).toBeVisible();
  await expect(tarjeta(page, "Perfil")).toContainText("Todavía no completaste tu perfil");
  await expect(tarjeta(page, "Perfil").getByRole("link")).toHaveAttribute("href", "/perfil");
  await expect(tarjeta(page, "Compromisos")).toContainText("Todavía no registraste compromisos");
  await expect(tarjeta(page, "Compromisos").getByRole("link")).toHaveAttribute("href", "/compromisos");
  await expect(tarjeta(page, "Congreso")).toContainText("Sin ticket registrado");
  await expect(tarjeta(page, "Congreso").getByRole("link")).toHaveAttribute("href", "/congreso");
  await expect(page.getByText("Modo demostración: este panel lee lo que guardaste en este navegador.")).toBeVisible();
  const proximo = tarjeta(page, "Tu próximo paso");
  await expect(proximo.getByRole("link")).toHaveAttribute("href", "/perfil");
});

test("perfil a medias: 2 de 6 datos y el próximo paso sigue siendo el perfil", async ({ page }) => {
  await perfil(page, "a-medias");
  await compromiso(page, "Ofrezco", "Taller de compost");
  await ticket(page, "LH27-8F3K-2Q");
  await page.goto("/panel");
  await expect(tarjeta(page, "Perfil")).toContainText("2 de 6 datos completos");
  await expect(tarjeta(page, "Tu próximo paso").getByRole("link")).toHaveAttribute("href", "/perfil");
});

test("compromisos 2 y 1 sin horas ni plata, ticket válido y próximo paso compromisos", async ({ page }) => {
  await perfil(page, "basicos");
  await page.goto("/panel");
  await expect(tarjeta(page, "Tu próximo paso").getByRole("link")).toHaveAttribute("href", "/compromisos");
  await compromiso(page, "Ofrezco", "Taller de compost");
  await compromiso(page, "Ofrezco", "Huerta comunitaria");
  await compromiso(page, "Necesito", "Herramientas");
  await page.goto("/panel");
  const t = tarjeta(page, "Compromisos");
  await expect(t).toContainText("2 ofrecés · 1 necesitás");
  await expect(t).not.toContainText("h/mes");
  await expect(t).not.toContainText("USD");
  await expect(t).not.toContainText("$");
  await expect(tarjeta(page, "Tu próximo paso").getByRole("link")).toHaveAttribute("href", "/congreso");
});

test("todo completo: ticket registrado, Genesis pendiente y sin próximo paso", async ({ page }) => {
  await perfil(page, "basicos");
  await compromiso(page, "Ofrezco", "Taller de compost");
  await ticket(page, "LH27-8F3K-2Q");
  await page.goto("/panel");
  await expect(tarjeta(page, "Congreso")).toContainText("Ticket LH27-8F3K-2Q registrado");
  await expect(tarjeta(page, "Congreso")).toContainText("Genesis pendiente");
  const proximo = tarjeta(page, "Tu próximo paso");
  await expect(proximo).toContainText("Ya recorriste todo lo que hay por ahora.");
  await expect(proximo.getByRole("link")).toHaveCount(0);
});

test("ticket guardado con formato inválido se trata como sin ticket", async ({ page }) => {
  await page.goto("/panel");
  await page.evaluate(() => window.localStorage.setItem("lh-congreso-ticket", "1234"));
  await page.reload();
  await expect(tarjeta(page, "Congreso")).toContainText("Sin ticket registrado");
});

test("borrar todo: confirma, vacía el panel y las tres pantallas", async ({ page }) => {
  await perfil(page, "a-medias");
  await compromiso(page, "Ofrezco", "Taller de compost");
  await ticket(page, "LH27-8F3K-2Q");
  await page.goto("/panel");
  page.once("dialog", (d) => {
    expect(d.message()).toBe("¿Borrar todo lo que guardaste en este navegador?");
    void d.accept();
  });
  await page.getByRole("button", { name: "Borrar todo lo de este navegador" }).click();
  await expect(tarjeta(page, "Perfil")).toContainText("Todavía no completaste tu perfil");
  await expect(tarjeta(page, "Compromisos")).toContainText("Todavía no registraste compromisos");
  await expect(tarjeta(page, "Congreso")).toContainText("Sin ticket registrado");
  await expect(page.getByRole("status").filter({ hasText: "se borró todo" })).toBeVisible();

  await page.goto("/perfil");
  await expect(page.getByRole("button", { name: "Completar mi perfil" })).toBeVisible();
  await page.goto("/compromisos");
  await expect(page.getByText("Todavía no registraste compromisos.")).toBeVisible();
  await page.goto("/congreso");
  await expect(page.getByLabel(/Código de tu ticket/)).toBeVisible();
});

test("borrar dos veces seguidas vuelve a montar el mensaje de la región de estado", async ({ page }) => {
  await page.goto("/panel");
  page.on("dialog", (d) => void d.accept());
  const boton = page.getByRole("button", { name: "Borrar todo lo de este navegador" });
  const mensaje = page.getByRole("status").locator("[data-borrado]");
  await boton.click();
  await expect(mensaje).toHaveAttribute("data-borrado", "1");
  await expect(mensaje).toContainText("se borró todo");
  await boton.click();
  await expect(mensaje).toHaveAttribute("data-borrado", "2");
  await expect(mensaje).toContainText("se borró todo");
});

test("cancelar el borrado no borra nada", async ({ page }) => {
  await perfil(page, "a-medias");
  await page.goto("/panel");
  page.once("dialog", (d) => void d.dismiss());
  await page.getByRole("button", { name: "Borrar todo lo de este navegador" }).click();
  await expect(tarjeta(page, "Perfil")).toContainText("2 de 6 datos completos");
  await page.reload();
  await expect(tarjeta(page, "Perfil")).toContainText("2 de 6 datos completos");
});

test("sin pedidos de red con los datos guardados", async ({ page }) => {
  await perfil(page, "a-medias", "secreto-panel");
  await page.goto("/panel");
  await expect(tarjeta(page, "Perfil")).toContainText("2 de 6 datos completos");
  const origen = new URL(page.url()).origin;
  const pedidos: string[] = [];
  page.on("request", (r) => {
    const propio = r.url().startsWith(origen + "/");
    const lleva = r.url().includes("secreto-") || (r.postData() ?? "").includes("secreto-");
    if ((propio && r.method() !== "GET") || lleva) pedidos.push(`${r.method()} ${r.url()}`);
  });
  await page.reload();
  await expect(tarjeta(page, "Perfil")).toContainText("2 de 6 datos completos");
  expect(pedidos).toEqual([]);
});

test("almacenamiento bloqueado: error en texto y no los estados vacíos", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new DOMException("bloqueado", "SecurityError");
    };
  });
  await page.goto("/panel");
  await expect(page.getByRole("alert").filter({ hasText: "no permite leer los datos" })).toBeVisible();
  await expect(page.getByText("Todavía no completaste tu perfil")).toHaveCount(0);
});

test("con teclado: próximo paso, tarjetas, borrado y aria-current en la navegación", async ({ page }) => {
  await page.goto("/panel");
  await expect(tarjeta(page, "Perfil")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Mi recorrido" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const orden = [
    tarjeta(page, "Tu próximo paso").getByRole("link"),
    tarjeta(page, "Perfil").getByRole("link"),
    tarjeta(page, "Compromisos").getByRole("link"),
    tarjeta(page, "Congreso").getByRole("link"),
    page.getByRole("button", { name: "Borrar todo lo de este navegador" }),
  ];
  await orden[0].focus();
  await expect(orden[0]).toBeFocused();
  for (const siguiente of orden.slice(1)) {
    await page.keyboard.press("Tab");
    await expect(siguiente).toBeFocused();
  }
});
