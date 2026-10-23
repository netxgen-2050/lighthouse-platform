import { expect, test, type Page } from "./fixtura";
import { ignorarEnSinRed } from "./ayudas";

const miReparto = (page: Page) => page.getByRole("region", { name: "Mi reparto" });
const opcion = (page: Page, etiqueta: string) =>
  miReparto(page).getByRole("listitem").filter({ has: page.getByText(etiqueta, { exact: true }) });
const mas = (page: Page, etiqueta: string) => page.getByRole("button", { name: `Sumar un voto a ${etiqueta}` });
const menos = (page: Page, etiqueta: string) => page.getByRole("button", { name: `Quitar un voto a ${etiqueta}` });
const guardar = (page: Page) => page.getByRole("button", { name: "Guardar mi reparto" });

async function sumar(page: Page, etiqueta: string, veces: number) {
  for (let i = 0; i < veces; i++) await mas(page, etiqueta).click();
}

async function irA(page: Page, id: string, titulo: string | RegExp) {
  await page.goto(`/fogon/consultas/${id}`);
  await expect(page.getByRole("heading", { level: 1, name: titulo })).toBeVisible();
  await expect(miReparto(page)).toBeVisible();
}

test("(a) la lista muestra U1 a U4 con modo, ámbito, voto, cierre y estado, y /fogon enlaza", async ({ page }) => {
  await page.goto("/fogon");
  await page.getByRole("link", { name: "Ver las consultas" }).click();
  await expect(page).toHaveURL(/\/fogon\/consultas$/);
  await expect(page.getByRole("heading", { level: 1, name: "Consultas" })).toBeVisible();
  await expect(page.getByText("Prototipo interno · datos de ejemplo")).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(4);
  const u1 = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "¿Para qué optimiza el Lighthouse?" }) });
  await expect(u1).toContainText("Prioridades");
  await expect(u1).toContainText("Equipo");
  await expect(u1).toContainText("Voto abierto");
  await expect(u1).toContainText("Cierra el 15 de noviembre de 2026");
  await expect(u1).toContainText("Abierta");
  const u3 = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Usos del cono de 120 ha (fase 1)" }) });
  await expect(u3).toContainText("Voto secreto");
  const u4 = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Primer presupuesto de regeneración" }) });
  await expect(u4).toContainText("Presupuesto");
  // El rail marca "Fogón" también en las consultas.
  await expect(page.getByRole("link", { name: "Fogón" }).first()).toHaveAttribute("aria-current", "page");
});

test("(b) tres votos suman 9 créditos y quedan 91; el donut propio lista Sin usar", async ({ page }) => {
  await irA(page, "u1", "¿Para qué optimiza el Lighthouse?");
  await sumar(page, "Regeneración ecológica", 3);
  await expect(opcion(page, "Regeneración ecológica")).toContainText("3 votos · 9 créditos");
  await expect(page.getByText("Te quedan 91 de 100 créditos")).toBeVisible();
  await expect(miReparto(page).getByText("Sin usar · 91 %")).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Regeneración ecológica: 3 votos, 9 créditos. Te quedan 91.");
  await expect(page.getByText("Sin guardar")).toBeVisible();
});

test("(c) cuando no alcanzan los créditos, + no suma y se ve el motivo; − no baja de 0", async ({ page }) => {
  await irA(page, "u1", "¿Para qué optimiza el Lighthouse?");
  await sumar(page, "Regeneración ecológica", 10);
  await expect(page.getByText("Te quedan 0 de 100 créditos")).toBeVisible();
  const otra = mas(page, "Resiliencia comunitaria");
  await expect(otra).toHaveAttribute("aria-disabled", "true");
  await otra.click({ force: true });
  await expect(opcion(page, "Resiliencia comunitaria")).toContainText("0 votos · 0 créditos");
  await expect(opcion(page, "Resiliencia comunitaria")).toContainText(
    "No te alcanzan los créditos: el próximo voto en esta opción suma 1 y te quedan 0",
  );
  await expect(otra).toHaveAccessibleDescription(/No te alcanzan los créditos/);
  const baja = menos(page, "Resiliencia comunitaria");
  await expect(baja).toHaveAttribute("aria-disabled", "true");
  await baja.click({ force: true });
  await expect(opcion(page, "Resiliencia comunitaria")).toContainText("0 votos · 0 créditos");
});

test("(d) guardar, recargar y ver el mismo reparto, y 'Ya repartiste' en la lista", async ({ page }) => {
  await irA(page, "u1", "¿Para qué optimiza el Lighthouse?");
  await sumar(page, "Regeneración ecológica", 2);
  await sumar(page, "Accesibilidad", 1);
  await guardar(page).click();
  await expect(page.getByRole("status")).toContainText("Tu reparto quedó guardado (simulado).");
  await expect(page.getByText("Sin guardar")).toHaveCount(0);
  await page.reload();
  await expect(opcion(page, "Regeneración ecológica")).toContainText("2 votos · 4 créditos");
  await expect(opcion(page, "Accesibilidad")).toContainText("1 voto · 1 crédito");
  await page.goto("/fogon/consultas");
  const u1 = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "¿Para qué optimiza el Lighthouse?" }) });
  await expect(u1).toContainText("Ya repartiste");
});

test("(e) U1 con resultado al cierre: oculto al guardar, visible al simular el cierre, con acta y sin botones +", async ({ page }) => {
  await irA(page, "u1", "¿Para qué optimiza el Lighthouse?");
  await sumar(page, "Regeneración ecológica", 2);
  await guardar(page).click();
  await expect(page.getByText(/El resultado del grupo se ve al cierre, el 15 de noviembre de 2026/)).toBeVisible();
  await expect(page.getByText("Votos del grupo")).toHaveCount(0);
  await expect(page.getByText(/personas votaron|votos · \d+ %/)).toHaveCount(0);
  await page.getByRole("button", { name: "Simular el cierre" }).click();
  const resultado = page.getByRole("region", { name: "Resultado del grupo" });
  await expect(resultado.locator("figcaption")).toHaveText("Votos del grupo");
  await expect(resultado).toContainText("personas la apoyaron");
  await expect(resultado).toContainText("Tu voto: 2 votos");
  const acta = page.getByRole("region", { name: "Acta (ejemplo)" });
  await expect(acta).toContainText("El resultado es consultivo");
  await expect(page.getByRole("button", { name: /Sumar un voto/ })).toHaveCount(0);
  await expect(guardar(page)).toHaveCount(0);
  await page.getByRole("button", { name: "Volver a abrir (simulado)" }).click();
  await expect(mas(page, "Regeneración ecológica")).toBeVisible();
});

test("(f) U2 con resultado al votar: tras guardar se ve el resultado y la tabla con la fila Vos", async ({ page }) => {
  await irA(page, "u2", "¿Cuánta tierra silvestre en la fase 1?");
  await expect(page.getByRole("table", { name: "Cómo repartió cada persona" })).toHaveCount(0);
  await sumar(page, "20 % de tierra silvestre", 2);
  await guardar(page).click();
  await expect(page.getByRole("region", { name: "Resultado del grupo" }).locator("figcaption")).toHaveText("Votos del grupo");
  const tabla = page.getByRole("table", { name: "Cómo repartió cada persona" });
  await expect(tabla).toBeVisible();
  await expect(tabla.getByRole("row").filter({ has: page.getByRole("rowheader", { name: "Vos" }) })).toContainText("4");
  await expect(tabla.getByRole("rowheader", { name: "Persona de ejemplo 1" })).toBeVisible();
});

test("(g) U4: monto sugerido y 'Con tu reparto irían' en plata, sin dato sin votos propios", async ({ page }) => {
  await irA(page, "u4", "Primer presupuesto de regeneración");
  await expect(page.getByText("Monto a repartir: USD 20.000")).toBeVisible();
  await expect(page.getByText("Sugerencia del equipo: lo decide Franz")).toBeVisible();
  await expect(opcion(page, "Vivero de nativas")).toContainText("Con tu reparto irían: sin dato");
  await sumar(page, "Vivero de nativas", 3);
  await sumar(page, "Estudio hidrológico", 1);
  await expect(opcion(page, "Vivero de nativas")).toContainText("Con tu reparto irían USD 15.000");
  await expect(opcion(page, "Estudio hidrológico")).toContainText("Con tu reparto irían USD 5.000");
  await expect(opcion(page, "Línea de base y monitoreo")).toContainText("Con tu reparto irían USD 0");
});

test("(g2) voto abierto en U1: aviso, quién falta votar y tabla de repartos solo al cierre", async ({ page }) => {
  await irA(page, "u1", "¿Para qué optimiza el Lighthouse?");
  await expect(page.getByText("Tu reparto lo va a ver todo el padrón")).toBeVisible();
  await expect(guardar(page)).toHaveAccessibleDescription(/Tu reparto lo va a ver todo el padrón/);
  const faltan = page.getByRole("region", { name: "Faltan votar" });
  await expect(faltan).toContainText("Persona de ejemplo 6");
  await expect(faltan).toContainText("Vos");
  await sumar(page, "Regeneración ecológica", 1);
  await guardar(page).click();
  await expect(page.getByRole("status")).toContainText("Tu reparto quedó guardado");
  await expect(faltan).toContainText("Persona de ejemplo 6");
  await expect(faltan).not.toContainText("Vos");
  await expect(page.getByRole("table", { name: "Cómo repartió cada persona" })).toHaveCount(0);
  await page.getByRole("button", { name: "Simular el cierre" }).click();
  const tabla = page.getByRole("table", { name: "Cómo repartió cada persona" });
  await expect(tabla).toBeVisible();
  await expect(tabla.getByRole("rowheader", { name: "Vos" })).toBeVisible();
  await expect(page.getByRole("region", { name: "No repartieron" })).toContainText("Persona de ejemplo 6");
});

test("(g3) U3 con voto secreto, cerrada: resultado sí, tabla de repartos y 'Faltan votar' no", async ({ page }) => {
  await irA(page, "u3", "Usos del cono de 120 ha (fase 1)");
  await expect(page.getByText("Voto secreto: nadie ve tu reparto, solo el resultado del grupo.")).toBeVisible();
  await expect(page.getByRole("region", { name: "Faltan votar" })).toHaveCount(0);
  await page.getByRole("button", { name: "Simular el cierre" }).click();
  await expect(page.getByRole("region", { name: "Resultado del grupo" }).locator("figcaption")).toHaveText("Votos del grupo");
  await expect(page.getByRole("table", { name: "Cómo repartió cada persona" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Faltan votar" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "No repartieron" })).toHaveCount(0);
});

test("(h) se reparte y se guarda solo con teclado", async ({ page }) => {
  await irA(page, "u1", "¿Para qué optimiza el Lighthouse?");
  const plus = mas(page, "Regeneración ecológica");
  await plus.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(opcion(page, "Regeneración ecológica")).toContainText("2 votos · 4 créditos");
  await menos(page, "Regeneración ecológica").focus();
  await page.keyboard.press("Space");
  await expect(opcion(page, "Regeneración ecológica")).toContainText("1 voto · 1 crédito");
  await guardar(page).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText("Tu reparto quedó guardado");
  await page.getByRole("button", { name: "Simular el cierre" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region", { name: "Acta (ejemplo)" })).toBeVisible();
});

test("(i) a 390 px no hay scroll horizontal en la lista ni en el detalle", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const ancho = () => page.evaluate(() => document.documentElement.scrollWidth);
  await page.goto("/fogon/consultas");
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(4);
  expect(await ancho()).toBeLessThanOrEqual(390);
  await irA(page, "u3", "Usos del cono de 120 ha (fase 1)");
  expect(await ancho()).toBeLessThanOrEqual(390);
  // Cerrada y con la tabla de repartos (la más ancha) en U1.
  await irA(page, "u1", "¿Para qué optimiza el Lighthouse?");
  await page.getByRole("button", { name: "Simular el cierre" }).click();
  await expect(page.getByRole("table", { name: "Cómo repartió cada persona" })).toBeVisible();
  expect(await ancho()).toBeLessThanOrEqual(390);
  const caja = page.getByRole("region", { name: /Cómo repartió cada persona/ });
  await expect(caja).toHaveAttribute("tabindex", "0");
  const box = await caja.boundingBox();
  expect(box!.width).toBeLessThanOrEqual(390);
});

test("(j) guardar el reparto no hace pedidos de red a /api/", async ({ page }) => {
  const pedidos: string[] = [];
  page.on("request", (r) => {
    if (ignorarEnSinRed(r)) return;
    if (new URL(r.url()).pathname.startsWith("/api/") && new URL(r.url()).pathname !== "/api/sesion") pedidos.push(`${r.method()} ${r.url()}`);
  });
  await irA(page, "u4", "Primer presupuesto de regeneración");
  await sumar(page, "Vivero de nativas", 2);
  await guardar(page).click();
  await expect(page.getByRole("status")).toContainText("Tu reparto quedó guardado");
  expect(pedidos).toEqual([]);
});

test("una consulta que no existe muestra la pantalla de no encontrado", async ({ page }) => {
  // Desde `idioma-base` las páginas se arman por pedido y el estado HTTP ya no es 404 (ver ADR-004): se comprueba la pantalla.
  await page.goto("/fogon/consultas/no-existe");
  await expect(page.getByRole("heading", { level: 1, name: "No encontramos esa página" })).toBeVisible();
});
