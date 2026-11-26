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
import { filtrarLibro, FILAS_VISIBLES } from "./actividad";
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
});

describe("posiciones", () => {
  test("FARO sin primer pago: el portafolio no tiene FARO acreditado (la fila dice sin dato)", () => {
    const p = armarPortafolio([compra(false)], SIN_ADHESION);
    expect(p.totales.faroAcreditados).toBeNull();
    expect(p.totales.hayPago).toBe(false);
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
});
