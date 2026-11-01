import { describe, expect, it } from "vitest";
import {
  alVencer,
  concernAbierto,
  FASES_DE_AGRUPACION,
  MATERIAS_SIN_URGENCIA,
  minimoParticipacion,
  nivelDeArriba,
  PLAZOS_POR_DEFECTO,
  plazosDe,
  REGISTROS_QUE_CUENTAN,
  REGLAS,
  topeUrgenciaDe,
  type HechosAlVencer,
} from "./reglas";

const hechos = (extra: Partial<HechosAlVencer> = {}): HechosAlVencer => ({
  recorrido: "importante",
  esRevision: false,
  concernAbierto: false,
  bloqueo: false,
  bloqueoLegitimo: false,
  cuenta: 6,
  apoyan: 6,
  minimo: 6,
  urgencia: null,
  holonId: "valle-0",
  vencimiento: "2026-11-08",
  diasRevision: 30,
  concernsQueObligan: [],
  ...extra,
});

describe("minimoParticipacion (B3)", () => {
  it.each([
    [0, null],
    [1, 1],
    [2, 2],
    [4, 3],
    [6, 3],
    [12, 6],
    [null, null],
  ])("%s personas → %s", (n, esperado) => {
    expect(minimoParticipacion(n)).toBe(esperado);
  });
});

describe("plazos (B2)", () => {
  it("por defecto 2/3/2 y simple 3", () => {
    expect(PLAZOS_POR_DEFECTO).toMatchObject({ preguntas: 2, discusion: 3, resolver: 2, simple: 3 });
  });
  it("un holón de ejemplo con 5 días de discusión cambia solo esa fase", () => {
    const p = plazosDe("comun-token");
    expect(p.discusion).toBe(5);
    expect({ ...p, discusion: 3 }).toEqual(PLAZOS_POR_DEFECTO);
  });
  it("sin holón, los de siempre", () => {
    expect(plazosDe(null)).toEqual(PLAZOS_POR_DEFECTO);
  });
});

describe("constantes de urgencia (D1, D4)", () => {
  it("REGLAS.urgencia", () => {
    expect(REGLAS.urgencia.respaldosMinimos).toBe(2);
    expect(REGLAS.urgencia.maxRespaldosDeFacilitacion).toBe(1);
    expect(REGLAS.urgencia.diasRevision).toBe(30);
    expect(REGLAS.urgencia.plata).toEqual({ topeUSD: 5000, destinos: ["revender", "reutilizar"] });
  });
  it("un holón con otro tope cambia solo su tope", () => {
    const tabla = { consejo: { topePlataUSD: 8000 } };
    expect(topeUrgenciaDe("consejo", tabla)).toBe(8000);
    expect(topeUrgenciaDe("valle-0", tabla)).toBe(5000);
    expect(topeUrgenciaDe(null, tabla)).toBe(5000);
  });
  it("MATERIAS_SIN_URGENCIA", () => {
    expect([...MATERIAS_SIN_URGENCIA]).toEqual(["tierra", "reglas", "manifiesto"]);
  });
});

describe("listas fijas", () => {
  it("FASES_DE_AGRUPACION es concerns y objetar", () => {
    expect([...FASES_DE_AGRUPACION]).toEqual(["concerns", "objetar"]);
  });
  it("REGISTROS_QUE_CUENTAN incluye el acuse y deja afuera lo que no es escribir en la discusión", () => {
    expect([...REGISTROS_QUE_CUENTAN].sort()).toEqual(
      ["a-un-lado", "acuse", "bloqueo", "comentario", "concern", "pregunta", "resolucion", "respuesta", "sumarse"].sort(),
    );
    for (const t of ["agrupar", "mecanismo", "ambito-consejo", "urgencia", "respaldo-urgencia", "revision", "evaluacion"] as const) {
      expect(REGISTROS_QUE_CUENTAN).not.toContain(t);
    }
  });
});

describe("concernAbierto", () => {
  it("abierto, agrupado y en resolución cuentan; el resto no", () => {
    for (const e of ["abierto", "agrupado", "resolviendo"]) expect(concernAbierto({ estado: e })).toBe(true);
    for (const e of ["resuelto", "retirado", "a-un-lado", "bloqueo"]) expect(concernAbierto({ estado: e })).toBe(false);
  });
  it("un concern sobre la urgencia no cuenta como oposición", () => {
    expect(concernAbierto({ estado: "abierto", sobreUrgencia: true })).toBe(false);
  });
});

describe("nivelDeArriba", () => {
  it("sale de la holarquía: círculo → tribu → consejo → común", () => {
    expect(nivelDeArriba("valle-0")).toBe("valle");
    expect(nivelDeArriba("valle")).toBe("consejo");
    expect(nivelDeArriba("consejo")).toBe("lighthouse");
  });
  it("el común y sin holón no tienen nivel de arriba", () => {
    expect(nivelDeArriba("lighthouse")).toBeNull();
    expect(nivelDeArriba(null)).toBeNull();
  });
});

describe("alVencer · decisión simple (B4)", () => {
  const simple = (e: Partial<HechosAlVencer> = {}) => hechos({ recorrido: "simple", ...e });
  it("sin objeciones y con quórum → adoptada", () => {
    expect(alVencer(simple())).toEqual({ tipo: "adoptada", motivo: "nadie-objeto" });
  });
  it("sin objeciones y sin quórum → pausada por participación mínima", () => {
    expect(alVencer(simple({ cuenta: 2 }))).toEqual({ tipo: "pausada", motivo: "participacion-minima" });
  });
  it("con tamaño sin dato → pausada", () => {
    expect(alVencer(simple({ minimo: null }))).toEqual({ tipo: "pausada", motivo: "participacion-minima" });
  });
  it("con concern abierto o bloqueo → pausada", () => {
    expect(alVencer(simple({ concernAbierto: true }))).toMatchObject({ tipo: "pausada", motivo: "concern-abierto" });
    expect(alVencer(simple({ bloqueo: true }))).toMatchObject({ tipo: "pausada", motivo: "concern-abierto" });
  });
  it("solo con concerns agrupados también está pausada (se cuentan como abiertos)", () => {
    expect(concernAbierto({ estado: "agrupado" })).toBe(true);
    expect(alVencer(simple({ concernAbierto: concernAbierto({ estado: "agrupado" }) }))).toMatchObject({ tipo: "pausada" });
  });
  it("con urgencia validada y un concern abierto sigue la rama de la importante", () => {
    const r = alVencer(simple({ concernAbierto: true, urgencia: "validada", apoyan: 5, cuenta: 6 }));
    expect(r.tipo).toBe("provisoria");
  });
});

describe("alVencer · decisión importante (D1)", () => {
  it("importante sin urgencia → pausada", () => {
    expect(alVencer(hechos({ concernAbierto: true }))).toEqual({ tipo: "pausada", motivo: "concern-abierto" });
    expect(alVencer(hechos())).toEqual({ tipo: "pausada", motivo: "sin-consenso" });
  });
  it("urgencia solo pedida → pausada como no urgente", () => {
    expect(alVencer(hechos({ urgencia: "pedida" }))).toMatchObject({ tipo: "pausada" });
  });
  it("urgencia validada con quórum y mayoría → medida provisoria con revisión a 30 días", () => {
    const r = alVencer(hechos({ urgencia: "validada", apoyan: 4, cuenta: 6, concernsQueObligan: ["x"] }));
    expect(r).toEqual({ tipo: "provisoria", revisarAntesDe: "2026-12-08", concernsQueObligan: ["x"], enRevision: false });
  });
  it("validada con bloqueo legítimo → como sin mayoría", () => {
    expect(alVencer(hechos({ urgencia: "validada", bloqueo: true, bloqueoLegitimo: true }))).toEqual({ tipo: "sube", a: "valle" });
  });
  it("validada sin mayoría sube un nivel: círculo → tribu, tribu → consejo, consejo → común", () => {
    const sinMayoria = { urgencia: "validada" as const, apoyan: 2, cuenta: 6 };
    expect(alVencer(hechos({ ...sinMayoria, holonId: "valle-0" }))).toEqual({ tipo: "sube", a: "valle" });
    expect(alVencer(hechos({ ...sinMayoria, holonId: "valle" }))).toEqual({ tipo: "sube", a: "consejo" });
    expect(alVencer(hechos({ ...sinMayoria, holonId: "consejo" }))).toEqual({ tipo: "sube", a: "lighthouse" });
  });
  it("validada sin mayoría en el común, o sin holón → pausada", () => {
    const sinMayoria = { urgencia: "validada" as const, apoyan: 2, cuenta: 6 };
    expect(alVencer(hechos({ ...sinMayoria, holonId: "lighthouse" }))).toEqual({ tipo: "pausada", motivo: "sin-nivel-de-arriba" });
    expect(alVencer(hechos({ ...sinMayoria, holonId: null }))).toEqual({ tipo: "pausada", motivo: "sin-nivel-de-arriba" });
  });
  it("en una versión de revisión nunca da provisoria", () => {
    expect(alVencer(hechos({ esRevision: true, urgencia: "validada" }))).toEqual({ tipo: "pausada", motivo: "revision-sin-consenso" });
  });
});
