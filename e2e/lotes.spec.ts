import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "./fixtura";
import { formatearNumero } from "../lib/idioma/formatos";
import { ESTADOS_EJEMPLO, estadoDeLote } from "../lib/territorios/loteo-estados";
import { lotesDelGrupo } from "../lib/territorios/loteo";
import {
  MODELO_LOTES,
  VERSION_MODELO_LOTES,
  aporteDe,
  parteDelDuenoDe,
  precioCasa,
  precioLote,
  precioPaquete,
} from "../lib/lotes/modelo";
import { usd } from "../lib/series/formato";

// Los valores que se esperan salen del loteo y del módulo del modelo, nunca escritos a mano.
test.beforeEach(async ({ page }) => {
  await page.route("**://server.arcgisonline.com/**", (r) => r.abort());
});

const lotes = lotesDelGrupo("norte");
const primero = lotesDelGrupo("primeros")[0];
const disponibles = lotes.filter((l) => estadoDeLote(l.id) === "disponible");
const lote = disponibles[0];
const otro = disponibles[1];
const idVendido = Object.keys(ESTADOS_EJEMPLO).find((id) => ESTADOS_EJEMPLO[id] === "vendido")!;
const idReservadoEjemplo = Object.keys(ESTADOS_EJEMPLO).find((id) => ESTADOS_EJEMPLO[id] === "reservado")!;
const m2 = (l: { superficieM2?: number }) => `${formatearNumero(l.superficieM2!, "es")} m²`;

async function conTeclado(page: Page, boton: ReturnType<Page["getByRole"]>) {
  await boton.focus();
  await page.keyboard.press("Enter");
}

test.describe("sin sesión", () => {
  test.use({ rol: "ninguno" });

  test("se ve la ficha, y reservar y hablar piden entrar sin guardar nada", async ({ page }) => {
    await page.goto(`/lotes/${lote.id}`);
    await expect(page.getByRole("heading", { level: 1, name: `Lote ${lote.numero}` })).toBeVisible();
    await expect(page.getByText(m2(lote)).first()).toBeVisible();
    await expect(page.getByText("Entrá para reservar este lote")).toBeVisible();
    await expect(page.getByText("Entrá para hablar con alguien")).toBeVisible();
    await expect(page.getByRole("button", { name: "Reservar (simulado)" })).toHaveCount(0);
    const claves = await page.evaluate(() => Object.keys(window.localStorage).filter((k) => k.includes("lh-lotes")));
    expect(claves).toEqual([]);
  });

  test("la lista se ve sin entrar y el rail marca Lotes", async ({ page }) => {
    await page.goto("/lotes");
    await expect(page.getByRole("heading", { level: 1, name: "Lotes de Lighthouse VRN" })).toBeVisible();
    await expect(page.getByText("Loteo provisorio, ilustrativo").first()).toBeVisible();
    await expect(page.getByRole("region", { name: "Estado administrativo · Lighthouse VRN" })).toContainText(
      "supuesto de trabajo, no otorgada",
    );
    await expect(page.getByRole("region", { name: "Todos los lotes" }).getByRole("link")).toHaveCount(lotes.length);
    await page.goto(`/lotes/${lote.id}`);
    await expect(page.getByRole("link", { name: "Lotes", exact: true })).toHaveAttribute("aria-current", "page");
  });
});

test("una ficha dice superficie, estado, precio de ejemplo con ⚖ y quién vende sin dato", async ({ page }) => {
  await page.goto(`/lotes/${lote.id}`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Lote ${lote.numero}`);
  await expect(page.getByText(m2(lote)).first()).toBeVisible();
  await expect(page.getByText("Disponible").first()).toBeVisible();
  await expect(page.getByText("Quién vende: sin dato")).toBeVisible();
  await expect(page.getByText("supuesto de trabajo, no otorgada").first()).toBeVisible();
  const precio = page.getByRole("region", { name: "Precio del lote" });
  await expect(precio).toContainText(`${usd(precioLote(lote.superficieM2))} · precio de ejemplo, a confirmar`);
  await expect(precio).toContainText(`de ${usd(MODELO_LOTES.precioLote.min)} a ${usd(MODELO_LOTES.precioLote.max)}`);
  await precio.getByRole("button", { name: /Qué significa legalmente: Precio de ejemplo/ }).hover();
  await expect(page.getByRole("tooltip").filter({ hasText: "Precio de ejemplo" })).toContainText("Borrador: texto a revisar");
  await expect(page.getByText(/500\.000 por familia/)).toHaveCount(0);
  await expect(page.locator("main")).toHaveCount(1);
});

test("un lote que no existe da la página de no encontrado", async ({ page }) => {
  await page.goto("/lotes/no-existe");
  await expect(page.locator("[data-no-encontrada]")).toBeVisible();
});

test("los costos muestran sus valores de ejemplo, la versión del modelo y el aporte aparte", async ({ page }) => {
  await page.goto(`/lotes/${lote.id}`);
  const costos = page.getByRole("region", { name: "Costos" });
  const solo = precioLote(lote.superficieM2)!;
  await expect(costos.getByRole("row", { name: /Aporte único al procomún/ })).toContainText(usd(aporteDe(solo)));
  await expect(costos.getByRole("row", { name: /Expensas por año/ })).toContainText(usd(MODELO_LOTES.expensaAnual));
  await expect(costos.getByRole("row", { name: /Infraestructura por lote/ })).toContainText(usd(MODELO_LOTES.infraestructuraPorLote));
  await expect(costos.getByRole("row", { name: /Parte del dueño/ })).toContainText(usd(parteDelDuenoDe(solo)));
  for (const fila of ["Aporte único al procomún", "Expensas por año", "Infraestructura por lote", "Parte del dueño"]) {
    await expect(costos.getByRole("row", { name: new RegExp(fila) })).toContainText("de ejemplo");
  }
  await expect(costos).toContainText(`versión ${VERSION_MODELO_LOTES.version}`);
  await expect(costos).toContainText(VERSION_MODELO_LOTES.fecha);
  await expect(costos).toContainText("si se suma al precio o va incluido, sin dato");
});

test("derechos y deberes con su ⚖ y sin prioridad por un pase", async ({ page }) => {
  await page.goto(`/lotes/${lote.id}`);
  const derechos = page.getByRole("region", { name: /Derechos y deberes/ });
  await expect(derechos).toContainText("servidumbres");
  await expect(derechos).toContainText("reglamento");
  await expect(derechos).toContainText("preferencia de reventa");
  await expect(derechos).toContainText("Ningún pase, ticket ni token da prioridad, crédito o reserva sobre un lote.");
  await expect(derechos.getByRole("button", { name: /Qué significa legalmente/ })).toBeVisible();
});

test("elegir Casa familiar con el teclado muestra m², referencia, precio, total y recalcula el aporte", async ({ page }) => {
  await page.goto(`/lotes/${lote.id}`);
  const familiar = page.getByRole("radio", { name: /Casa familiar/ });
  await familiar.focus();
  await page.keyboard.press("Space");
  await expect(familiar).toBeChecked();
  const casa = page.getByRole("region", { name: "Con casa" });
  await expect(casa).toContainText(`${MODELO_LOTES.casas.familiar.m2} m²`);
  await expect(casa).toContainText("referencia de Martín");
  await expect(casa).toContainText(usd(precioCasa("familiar")));
  const total = precioPaquete(lote.superficieM2, "familiar")!;
  await expect(casa).toContainText(usd(total));
  await expect(casa).toContainText("estimación de ejemplo");
  await expect(page.getByRole("row", { name: /Aporte único al procomún/ })).toContainText(usd(aporteDe(total)));
});

test("reservar, simular el pago y ver el boleto solo con teclado; recarga y deshacer", async ({ page }) => {
  const pedidos: string[] = [];
  await page.goto(`/lotes/${lote.id}`);
  page.on("request", (r) => {
    if (r.method() !== "GET" || /compra|reserva|boleto|lh-lotes/i.test(r.url())) pedidos.push(`${r.method()} ${r.url()}`);
  });
  const camposDeLaCompra = page.locator(
    "section[aria-labelledby=ficha-acciones] :is(input, textarea, select)",
  );
  await expect(camposDeLaCompra).toHaveCount(0);

  await conTeclado(page, page.getByRole("button", { name: "Reservar (simulado)" }));
  await expect(page.getByText("Reserva simulada: no reserva ningún lote de verdad.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reserva simulada" })).toBeFocused();
  await expect(page.getByText("Reservado (simulado, por vos)").first()).toBeVisible();

  await conTeclado(page, page.getByRole("button", { name: "Simular el pago" }));
  await expect(page.getByRole("heading", { name: "Pago simulado" })).toBeFocused();
  await expect(page.getByText("No se cobra nada. No ingreses datos de pago: no hay ningún campo.")).toBeVisible();
  await expect(page.getByText(/Precio elegido:/)).toBeVisible();
  await expect(page.getByText(/Aporte único al procomún: .* · si se suma al precio o va incluido: sin dato/)).toBeVisible();
  await expect(camposDeLaCompra).toHaveCount(0);

  await conTeclado(page, page.getByRole("button", { name: "Confirmar el pago simulado" }));
  const boleto = page.getByRole("region", { name: /Boleto de ejemplo/ });
  await expect(boleto).toBeVisible();
  await expect(boleto.getByRole("heading", { name: /Boleto de ejemplo/ })).toBeFocused();
  await expect(boleto).toContainText("SIMULADO · SIN VALOR LEGAL · NO SE PAGÓ NADA");
  await expect(boleto).toContainText("No se cobró nada");
  await expect(boleto).toContainText("Comprador: Persona de ejemplo");
  await expect(boleto).toContainText("Vendedor: sin dato");
  await expect(boleto).toContainText("supuesto de trabajo, no otorgada");
  await expect(boleto).toContainText(`Lote ${lote.numero}`);
  await expect(boleto).toContainText(VERSION_MODELO_LOTES.version);
  // La marca va antes que cualquier dato.
  const textoBoleto = (await boleto.innerText()).replace(/\s+/g, " ");
  expect(textoBoleto.indexOf("SIMULADO")).toBeLessThan(textoBoleto.indexOf("Comprador"));

  expect(pedidos).toEqual([]);

  await page.reload();
  await expect(page.getByRole("region", { name: /Boleto de ejemplo/ })).toBeVisible();
  const guardado = await page.evaluate(() => window.localStorage.getItem("lh-lotes") ?? "");
  expect(guardado).toContain(lote.id);
  expect(guardado).not.toMatch(/nombre|documento|domicilio|tarjeta|cbu/i);

  await conTeclado(page, page.getByRole("button", { name: "Deshacer" }));
  await expect(page.getByRole("button", { name: "Reservar (simulado)" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Reservar (simulado)" })).toBeVisible();
  await expect(page.getByText("Disponible").first()).toBeVisible();
});

test("con Casa familiar el boleto dice la opción, el precio de la casa y el total como estimación", async ({ page }) => {
  await page.goto(`/lotes/${lote.id}`);
  await page.getByRole("radio", { name: /Casa familiar/ }).check();
  await page.getByRole("button", { name: "Reservar (simulado)" }).click();
  await page.getByRole("button", { name: "Simular el pago" }).click();
  await page.getByRole("button", { name: "Confirmar el pago simulado" }).click();
  const boleto = page.getByRole("region", { name: /Boleto de ejemplo/ });
  await expect(boleto).toContainText("Casa familiar");
  await expect(boleto).toContainText(usd(precioCasa("familiar")));
  await expect(boleto).toContainText(usd(precioPaquete(lote.superficieM2, "familiar")));
  await expect(boleto).toContainText("estimación de ejemplo");
});

test("lo reservado entra en la descarga de Mis datos y desaparece con Borrar todo", async ({ page }) => {
  await page.goto(`/lotes/${lote.id}`);
  await page.getByRole("button", { name: "Reservar (simulado)" }).click();
  await expect(page.getByText("Reservado (simulado, por vos)").first()).toBeVisible();

  await page.goto("/mis-datos");
  const descarga = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar mis datos" }).click();
  const texto = await readFile((await (await descarga).path())!, "utf8");
  const json = JSON.parse(texto);
  expect(json.datos.lotes).toHaveLength(1);
  expect(json.datos.lotes[0]).toMatchObject({ loteId: lote.id, paso: "reservado" });

  await page.goto("/configuracion");
  page.once("dialog", (d) => void d.accept());
  await page.getByRole("button", { name: "Borrar todo lo guardado en este navegador" }).click();
  await expect(page.getByRole("status").filter({ hasText: "se borró todo" })).toBeVisible();
  await page.goto(`/lotes/${lote.id}`);
  await expect(page.getByRole("button", { name: "Reservar (simulado)" })).toBeVisible();
  await expect(page.getByText("Reservado (simulado, por vos)")).toHaveCount(0);
});

test("el boleto y el pago simulado muestran lo guardado al reservar, aunque el modelo sea otro", async ({ page }) => {
  // Valores que el modelo vigente nunca da: si la pantalla recalculara, se verían los de hoy.
  const visto = { precio: 111_111, aporte: 2_222, expensa: 333, version: "v0.0-vieja", fuente: "Fuente vieja del modelo", precioCasa: 44_444 };
  const compra = {
    loteId: lote.id,
    opcion: "familiar",
    paso: "reservado",
    reservadoEl: "2026-10-01T12:00:00.000Z",
    vio: visto,
  };
  await page.addInitScript((c) => {
    if (!window.localStorage.getItem("lh-lotes")) window.localStorage.setItem("lh-lotes", JSON.stringify([c]));
  }, compra);
  await page.goto(`/lotes/${lote.id}`);
  await conTeclado(page, page.getByRole("button", { name: "Simular el pago" }));
  await expect(page.getByText(`Precio elegido: ${usd(visto.precio)}`)).toBeVisible();
  await expect(page.getByText(new RegExp(`Aporte único al procomún: ${usd(visto.aporte)}`))).toBeVisible();
  // Volver mueve el foco al título del paso al que se vuelve.
  await conTeclado(page, page.getByRole("button", { name: "Volver" }));
  await expect(page.getByRole("heading", { name: "Reserva simulada" })).toBeFocused();
  await conTeclado(page, page.getByRole("button", { name: "Simular el pago" }));
  await conTeclado(page, page.getByRole("button", { name: "Confirmar el pago simulado" }));
  const boleto = page.getByRole("region", { name: /Boleto de ejemplo/ });
  await expect(boleto).toContainText(usd(visto.precio));
  await expect(boleto).toContainText(usd(visto.aporte));
  await expect(boleto).toContainText(usd(visto.expensa));
  await expect(boleto).toContainText(usd(visto.precioCasa));
  await expect(boleto).toContainText(visto.fuente);
  await expect(boleto).toContainText(visto.version);
  await expect(boleto).not.toContainText(usd(precioCasa("familiar")));
  await expect(boleto).not.toContainText(VERSION_MODELO_LOTES.fuente);
});

test("lo guardado que no se puede leer se trata como sin compras", async ({ page }) => {
  await page.addInitScript(() => {
    if (!window.localStorage.getItem("lh-lotes")) window.localStorage.setItem("lh-lotes", "{no es json");
  });
  await page.goto(`/lotes/${lote.id}`);
  await expect(page.getByRole("button", { name: "Reservar (simulado)" })).toBeVisible();
  await expect(page.getByText("Disponible").first()).toBeVisible();
});

test("un lote vendido o reservado de ejemplo no ofrece reservar", async ({ page }) => {
  await page.goto(`/lotes/${idVendido}`);
  await expect(page.getByText("Vendido").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Reservar/ })).toHaveCount(0);
  await page.goto(`/lotes/${idReservadoEjemplo}`);
  await expect(page.getByText("Reservado").first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Reservar/ })).toHaveCount(0);
});

test("lo reservado se ve en el mapa, en la lista y en la ficha, y el panel del mapa enlaza a la ficha", async ({ page }) => {
  await page.goto(`/territorios/lighthouse?sel=${lote.id}`);
  const ficha = page.getByRole("complementary", { name: "Ficha del territorio" });
  await ficha.getByRole("link", { name: "Ver la ficha" }).click();
  await expect(page).toHaveURL(new RegExp(`/lotes/${lote.id}$`));
  await page.getByRole("button", { name: "Reservar (simulado)" }).click();
  await expect(page.getByText("Reservado (simulado, por vos)").first()).toBeVisible();

  await page.goto(`/territorios/lighthouse?sel=${lote.id}`);
  await expect(ficha).toContainText("Reservado (simulado, por vos)");
  await expect(page.getByRole("list", { name: "Lotes del sector norte" }).getByRole("button", { name: new RegExp(`^Lote ${lote.numero} `) })).toContainText(
    "Reservado (simulado, por vos)",
  );
  await page.goto("/lotes");
  await expect(page.getByRole("link", { name: new RegExp(`^Lote ${lote.numero} `) })).toContainText("Reservado (simulado, por vos)");
  // Otro lote no se mueve.
  await expect(page.getByRole("link", { name: new RegExp(`^Lote ${otro.numero} `) })).toContainText("Disponible");
});

test("hablar con alguien: el pedido llega a la bandeja como consulta por un lote de Lighthouse VRN y no reserva", async ({ page }) => {
  await page.goto(`/lotes/${lote.id}`);
  await page.getByRole("button", { name: "Hablar con alguien" }).click();
  await expect(page.getByText(`Consulta por un lote de Lighthouse VRN · Lote ${lote.numero}`)).toBeVisible();
  await page.getByRole("radio", { name: "Email" }).check();
  await page.getByRole("button", { name: "Enviar pedido (simulado)" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Equipo NetX" })).toBeVisible();
  await expect(page.getByText("Disponible").first()).toBeVisible();
  const guardado = await page.evaluate(() => window.localStorage.getItem("lh-lotes"));
  expect(guardado).toBeNull();

  await page.goto("/admin");
  const fila = page.getByRole("row").filter({ hasText: `Lote ${lote.numero}` });
  await expect(fila).toContainText("Consulta por un lote de Lighthouse VRN");
  await expect(fila).toContainText("Equipo NetX");
  await expect(fila).not.toContainText("BioPueblo");
});

test.describe("en inglés", () => {
  test.use({ locale: "en-US" });

  test("la ficha y el boleto se leen en inglés", async ({ page }) => {
    await page.goto(`/lotes/${lote.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Lot ${lote.numero}`);
    await expect(page.getByText("Who sells: no data")).toBeVisible();
    await expect(page.getByRole("region", { name: "Costs" })).toContainText("sample");
    await page.getByRole("button", { name: "Reserve (simulated)" }).click();
    await page.getByRole("button", { name: "Simulate the payment" }).click();
    await page.getByRole("button", { name: "Confirm the simulated payment" }).click();
    await expect(page.getByText("SIMULATED · NO LEGAL VALUE · NOTHING WAS PAID")).toBeVisible();
    await expect(page.getByText("Seller: no data")).toBeVisible();
  });
});

test("celular 390 px: sin scroll horizontal en la lista, la ficha, los costos y el boleto", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const sobra = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  await page.goto("/lotes");
  expect(await sobra()).toBeLessThanOrEqual(0);
  await page.goto(`/lotes/${lote.id}`);
  await page.getByRole("radio", { name: /Casa amplia/ }).check();
  expect(await sobra()).toBeLessThanOrEqual(0);
  await page.getByRole("button", { name: "Reservar (simulado)" }).click();
  await page.getByRole("button", { name: "Simular el pago" }).click();
  await page.getByRole("button", { name: "Confirmar el pago simulado" }).click();
  await expect(page.getByRole("region", { name: /Boleto de ejemplo/ })).toBeVisible();
  expect(await sobra()).toBeLessThanOrEqual(0);
});

test("/lotes y una ficha no se dejan indexar", async ({ page }) => {
  for (const ruta of ["/lotes", `/lotes/${lote.id}`]) {
    await page.goto(ruta);
    await expect(page.locator('meta[name="robots"]'), ruta).toHaveAttribute("content", "noindex, nofollow");
  }
});

test.describe("los primeros 4 lotes", () => {
  test("/lotes los pone primero, con su propio estado administrativo", async ({ page }) => {
    await page.goto("/lotes");
    const enlaces = page.getByRole("region", { name: "Todos los lotes" }).getByRole("link");
    await expect(enlaces.first()).toContainText("Lote 535");
    await expect(page.getByRole("heading", { level: 3, name: "Primeros 4 lotes" })).toBeVisible();
    const estado = page.getByRole("region", { name: "Estado administrativo · Primeros 4 lotes" });
    await expect(estado).toContainText("Titular: BioPueblo");
    await expect(estado).toContainText("Aprobación municipal: informada, sin documento a la vista");
    await expect(estado).toContainText("Fecha: sin dato");
  });

  test("la ficha avisa que está fuera del 7A y sin documento; el boleto dice lo mismo", async ({ page }) => {
    await page.goto(`/lotes/${primero.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lote 535");
    await expect(page.getByText(/fuera del polígono del 7A/)).toBeVisible();
    await expect(page.getByText(/Quién vende:/)).toContainText("sin dato");
    await expect(page.getByText(/supuesto de trabajo/)).toHaveCount(0);
    await conTeclado(page, page.getByRole("button", { name: "Reservar (simulado)" }));
    await conTeclado(page, page.getByRole("button", { name: "Simular el pago" }));
    await conTeclado(page, page.getByRole("button", { name: "Confirmar el pago simulado" }));
    const boleto = page.getByRole("region", { name: /Boleto de ejemplo/ });
    await expect(boleto).toContainText("Lote 535");
    await expect(boleto).toContainText("Aprobación municipal: informada, sin documento a la vista");
  });

  test("en inglés", async ({ page }) => {
    await page.goto(`/lotes/${primero.id}?lang=en`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lot 535");
    await expect(page.getByRole("region", { name: "Administrative status · First 4 lots" })).toContainText("reported, no document on hand");
  });
});
