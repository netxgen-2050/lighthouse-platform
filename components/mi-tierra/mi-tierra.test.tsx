import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { armarPortafolio, curvaFaro, type MovimientoLibro } from "@/lib/mi-tierra/portafolio";
import { SIN_ADHESION } from "@/lib/membresia/versiones";
import { textos } from "@/lib/idioma/textos";
import { PLAN_CUOTAS, faroDelPlan, planDeLote } from "@/lib/bien-comun/modelo";
import { VERSION_MODELO_LOTES, precioLote } from "@/lib/lotes/modelo";
import { lotesDelGrupo } from "@/lib/territorios/loteo";
import { estadoDeLote } from "@/lib/territorios/loteo-estados";
import type { CompraLote } from "@/lib/lotes/compra";
import { FilaFaro } from "@/app/mi-tierra/mi-tierra-cliente";
import { Actividad, filtrarLibro, FILAS_VISIBLES } from "./actividad";
import { EncabezadoMiTierra } from "./encabezado";
import { FilaPosicion } from "./fila-posicion";
import { MiniCurva } from "./mini-curva";

const lote = lotesDelGrupo("norte").filter((l) => estadoDeLote(l.id) === "disponible")[0];
const plan = planDeLote(precioLote(lote.superficieM2), PLAN_CUOTAS.dePartida)!;
const faro = faroDelPlan(lote.superficieM2, PLAN_CUOTAS.dePartida)!;

function compra(pagada: boolean, id = lote.id): CompraLote {
  return {
    loteId: id,
    opcion: "solo-lote",
    paso: pagada ? "pagado" : "reservado",
    reservadoEl: "2026-11-20T12:00:00.000Z",
    ...(pagada ? { pagadoEl: "2026-11-21T12:00:00.000Z" } : {}),
    vio: {
      precio: precioLote(lote.superficieM2),
      aporte: null,
      expensa: null,
      version: VERSION_MODELO_LOTES.version,
      faro: faro.total,
      plan: {
        cuotas: PLAN_CUOTAS.dePartida,
        anticipo: plan.anticipo,
        cuota: plan.cuota,
        ultimaCuota: plan.ultimaCuota,
        faroAnticipo: faro.anticipo,
        faroPorCuota: faro.porCuota,
        faroUltimaCuota: faro.ultimaCuota,
      },
    },
  } as CompraLote;
}

describe("EncabezadoMiTierra", () => {
  test("con un lote pagado: número, porcentaje y cuotas, sin palabras de rendimiento (es y en)", () => {
    const p = armarPortafolio([compra(true)], SIN_ADHESION);
    const h = renderToStaticMarkup(<EncabezadoMiTierra portafolio={p} />);
    expect(h).toContain("data-numero-principal");
    expect(h).toContain(`0 de ${PLAN_CUOTAS.dePartida} cuotas pagadas`);
    expect(h).toContain('role="meter"');
    expect(h).not.toMatch(/APY|rendimiento|ganancia|retorno/i);
    for (const idioma of ["es", "en"] as const) {
      expect(JSON.stringify(textos("miTierra", idioma), (_k, v) => (typeof v === "function" ? v("1", "2") : v))).not.toMatch(/APY|rendimiento|ganancia|yield|profit|return on/i);
    }
  });
  test("reservado sin pago: USD 0 con 'Todavía no pagaste ninguna cuota' y la acción del primer pago", () => {
    const p = armarPortafolio([compra(false)], SIN_ADHESION);
    expect(p.totales.pagado).toBe(0);
    const h = renderToStaticMarkup(<EncabezadoMiTierra portafolio={p} />);
    expect(h).toContain("USD 0");
    expect(h).toContain("Todavía no pagaste ninguna cuota");
    expect(h).toContain("Hacer el primer pago (simulado)");
  });
  test("lote de los primeros 4 pagado: el número principal muestra el monto, no sin dato", () => {
    const primero = lotesDelGrupo("primeros").find((l) => estadoDeLote(l.id) === "disponible")!;
    const c = { ...compra(true, primero.id), vio: { ...compra(true).vio, plan: undefined, faro: undefined, precio: precioLote(primero.superficieM2) } } as CompraLote;
    const p = armarPortafolio([c], SIN_ADHESION);
    const h = renderToStaticMarkup(<EncabezadoMiTierra portafolio={p} />);
    expect(p.totales.pagado).toBe(precioLote(primero.superficieM2));
    expect(h).not.toContain("sin dato");
  });
  test("lote de los primeros 4 reservado: ofrece el primer pago y dice que no pagó nada", () => {
    const primero = lotesDelGrupo("primeros").find((l) => estadoDeLote(l.id) === "disponible")!;
    const c = { ...compra(false, primero.id), vio: { ...compra(false).vio, plan: undefined, faro: undefined, precio: precioLote(primero.superficieM2) } } as CompraLote;
    const h = renderToStaticMarkup(<EncabezadoMiTierra portafolio={armarPortafolio([c], SIN_ADHESION)} />);
    expect(h).toContain("Todavía no hiciste ningún pago");
    expect(h).not.toContain("cuota");
    expect(h).toContain("Hacer el primer pago (simulado)");
    expect(textos("miTierra", "en").encabezado.sinPagosSinCuotas).toBe("You have not made any payment yet");
    expect(textos("miTierra", "en").encabezado.sinPagosSinCuotas).not.toMatch(/instalment/i);
  });
});

describe("posiciones", () => {
  test("FARO sin primer pago: la fila dice sin dato con la explicación, nunca 0", () => {
    const p = armarPortafolio([compra(false)], SIN_ADHESION);
    expect(p.totales.faroAcreditados).toBeNull();
    expect(p.totales.hayPago).toBe(false);
    const h = renderToStaticMarkup(<FilaFaro totales={p.totales} curva={[]} />);
    expect(h).toContain("sin dato");
    expect(h).toContain(textos("miTierra", "es").faro.sinPago);
  });
  test("el estado vendido de la posición dice lo mismo que el chip, sin 'escriturado'", () => {
    for (const idioma of ["es", "en"] as const) {
      expect(textos("miTierra", idioma).posiciones.estados.vendido.toLowerCase()).toBe(textos("marco", idioma).estados.vendido.toLowerCase());
    }
  });
  test("FilaPosicion: con href toda la fila es un enlace", () => {
    const h = renderToStaticMarkup(<FilaPosicion icono="x" nombre="Lote 1" detalle="d" valor="v" href="/lotes/1" />);
    expect(h).toMatch(/^<a [^>]*href="\/lotes\/1"/);
  });
  test("la mini curva solo se dibuja con 2 o más puntos", () => {
    expect(renderToStaticMarkup(<MiniCurva puntos={[1]} titulo="t" />)).toBe("");
    expect(renderToStaticMarkup(<MiniCurva puntos={[1, 3]} titulo="t" />)).toContain("data-mini-curva");
    expect(curvaFaro(armarPortafolio([compra(true)], SIN_ADHESION).lotes)).toHaveLength(1);
  });
});

describe("actividad", () => {
  const m = (tipo: MovimientoLibro["tipo"], acreditaFaro: boolean): MovimientoLibro => ({ fecha: "2026-11-20T12:00:00.000Z", tipo, loteId: "a", numero: 1, monto: 1, acreditaFaro });
  const libro = [m("reserva", false), m("primer-pago", true), m("pago", false)];
  test("el filtro separa pagos, reservas y FARO", () => {
    expect(filtrarLibro(libro, "todo")).toHaveLength(3);
    expect(filtrarLibro(libro, "pagos")).toHaveLength(2);
    expect(filtrarLibro(libro, "reservas")).toHaveLength(1);
    expect(filtrarLibro(libro, "faro")).toHaveLength(1);
  });
  test("se ven 8 filas", () => {
    expect(FILAS_VISIBLES).toBe(8);
  });
  test("con más de 8 movimientos: 8 filas y 'Ver toda la actividad'; abierto muestra todas", () => {
    const muchos = Array.from({ length: 11 }, () => m("pago", false));
    const cerrado = renderToStaticMarkup(<Actividad libro={muchos} />);
    expect(cerrado.match(/<tr/g)!.length).toBe(1 + FILAS_VISIBLES);
    expect(cerrado).toContain("Ver toda la actividad (11");
    expect(cerrado).not.toContain("<details open");
    const abierto = renderToStaticMarkup(<Actividad libro={muchos} abiertaInicial />);
    expect(abierto.match(/<tr/g)!.length).toBe(1 + 11);
    expect(abierto).toContain("<details open");
  });
  test("con 8 o menos no hay 'Ver toda la actividad'", () => {
    expect(renderToStaticMarkup(<Actividad libro={libro} />)).not.toContain("Ver toda la actividad");
  });
  test("la pastilla elegida lleva una marca además del color", () => {
    const h = renderToStaticMarkup(<Actividad libro={libro} />);
    expect(h).toMatch(/aria-pressed="true"[^>]*><span aria-hidden="true">✓ <\/span>Todo/);
  });
});
