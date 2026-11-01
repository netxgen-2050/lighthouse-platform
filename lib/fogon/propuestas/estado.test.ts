import { describe, expect, it } from "vitest";
import { propuestaDe } from "./ejemplos";
import { cronograma, derivarEstado } from "./estado";
import { PLAZOS_POR_DEFECTO } from "./reglas";
import type { NivelImplicacion, Propuesta, Registro, TipoRegistro } from "./tipos";

let n = 0;
function reg(
  propuestaId: string,
  tipo: TipoRegistro,
  quien: string,
  nivel: NivelImplicacion,
  cuando: string,
  extra: Partial<Registro> = {},
): Registro {
  return { id: `t${n++}`, propuestaId, version: 1, quien, nivel, cuando: `${cuando}:00Z`, tipo, simulado: true, ...extra };
}
const P = (id: string): Propuesta => {
  const p = propuestaDe(id);
  if (!p) throw new Error(id);
  return p;
};
const bomba = P("consejo-bomba");
const siembra = P("siembra");
const cisterna = P("cisterna-compartida");
const huerta = P("huerta");
const AHORA = new Date("2026-10-30T12:00:00Z");
const DESPUES = new Date("2026-11-10T12:00:00Z");

describe("cronograma (B2)", () => {
  it("preguntas del 1-nov vencen el 3-nov y la propuesta el 8-nov", () => {
    const c = cronograma("importante", "2026-11-01", PLAZOS_POR_DEFECTO);
    expect(c.fases.find((f) => f.fase === "preguntas")).toMatchObject({ desde: "2026-11-01", vence: "2026-11-03" });
    expect(c.vence).toBe("2026-11-08");
  });
  it("la simple vence a los 3 días", () => {
    expect(cronograma("simple", "2026-11-01", PLAZOS_POR_DEFECTO).vence).toBe("2026-11-04");
  });
  it("derivarEstado trae las fechas con la hecha y la actual", () => {
    const e = derivarEstado({ ...cisterna, inicio: "2026-11-01" }, [], new Date("2026-11-02T00:00:00Z"));
    expect(e.vence).toBe("2026-11-08");
    expect(e.fases.find((f) => f.fase === "preguntas")).toMatchObject({ vence: "2026-11-03", actual: true, hecha: false });
    expect(e.fases.find((f) => f.fase === "presentacion")?.hecha).toBe(true);
  });
});

describe("ejemplos", () => {
  it("bomba en resolver: grupo Uso compartido con Ramiro y Paz, y el concern de Inés suelto", () => {
    const e = derivarEstado(bomba, [], AHORA);
    expect(e.fase).toBe("resolver");
    expect(e.grupos).toHaveLength(1);
    expect(e.grupos[0].nombre).toBe("Uso compartido");
    expect(e.grupos[0].autoras.sort()).toEqual(["paz", "ramiro"]);
    expect(e.grupos[0].concerns.map((c) => c.razon)).toEqual([
      expect.objectContaining({ es: expect.stringContaining("círculos más lejanos") }),
      expect.objectContaining({ es: expect.stringContaining("Los días de riego") }),
    ]);
    const ines = e.concerns.find((c) => c.quien === "ines");
    expect(ines?.estado).toBe("abierto");
    expect(ines?.grupoId).toBeUndefined();
    expect(e.sugerenciasGuardian.find((s) => s.id === "b-g-impacto")).toMatchObject({ estado: "respaldada", respaldos: ["ines"] });
    expect(e.sugerenciasGuardian.find((s) => s.id === "b-g-reversible")?.estado).toBe("sin-respaldo");
  });

  it("la urgencia de la bomba se deriva pedida, falta 1 respaldo", () => {
    const e = derivarEstado(bomba, [], AHORA);
    expect(e.urgencia).toMatchObject({ estado: "pedida", faltan: 1, respaldos: ["mora"], quien: "lautaro" });
  });

  it("siembra cerrada por consenso con Paz a un lado", () => {
    const e = derivarEstado(siembra, [], AHORA);
    expect(e.fase).toBe("cierre");
    expect(e.resultado).toEqual({ tipo: "consenso", conLadoA: ["paz"] });
    expect(e.aUnLado.map((x) => x.quien)).toEqual(["paz"]);
  });

  it("cisterna en preguntas; su sugerencia del Guardián ya apareció", () => {
    const e = derivarEstado(cisterna, [], AHORA);
    expect(e.fase).toBe("preguntas");
    expect(e.resultado).toBeNull();
    expect(e.sugerenciasGuardian.map((s) => s.id)).toEqual(["c-g-previa"]);
  });

  it("huerta: participación 2 de quórum 3 y dos acuses", () => {
    const e = derivarEstado(huerta, [], AHORA);
    expect(e.participacion).toEqual({ cuenta: 2, acuses: 2, minimo: 3, falta: 1 });
    expect(e.acuses).toHaveLength(2);
    const con = derivarEstado(huerta, [reg("huerta", "acuse", "vos", "ambito", "2026-10-29T10:00")], AHORA);
    expect(con.participacion).toMatchObject({ cuenta: 3, falta: 0 });
  });
});

describe("participación y acuse (B3, B5)", () => {
  it("una persona con acuse y comentario cuenta una vez", () => {
    const e = derivarEstado(
      huerta,
      [
        reg("huerta", "acuse", "vos", "ambito", "2026-10-29T10:00"),
        reg("huerta", "comentario", "vos", "ambito", "2026-10-29T11:00", { texto: "ok" }),
      ],
      AHORA,
    );
    expect(e.participacion.cuenta).toBe(3);
    expect(e.participacion.acuses).toBe(3);
  });

  it("un acuse seguido de un concern se ve reemplazado y sigue contando", () => {
    const e = derivarEstado(
      huerta,
      [
        reg("huerta", "acuse", "vos", "ambito", "2026-10-29T10:00"),
        reg("huerta", "concern", "vos", "ambito", "2026-10-29T11:00", { texto: "tengo un concern" }),
      ],
      AHORA,
    );
    expect(e.acuses.find((a) => a.quien === "vos")).toMatchObject({ reemplazadoPorConcern: true, vigente: true });
    expect(e.participacion.cuenta).toBe(3);
  });

  it("un acuse de la versión 1 no cuenta en la versión 2, un comentario sí", () => {
    const e = derivarEstado(
      huerta,
      [
        reg("huerta", "acuse", "vos", "ambito", "2026-10-29T10:00"),
        reg("huerta", "comentario", "tomas", "ambito", "2026-10-29T10:30", { texto: "ok" }),
        reg("huerta", "version", "ema", "presenta", "2026-10-29T11:00", { version: 2 }),
      ],
      AHORA,
    );
    expect(e.version).toBe(2);
    expect(e.acuses.find((a) => a.quien === "vos")).toMatchObject({ version: 1, vigente: false });
    expect(e.acuses.find((a) => a.quien === "mora")?.vigente).toBe(false);
    // Solo cuenta el comentario de la versión 1: los dos acuses de ejemplo y el de vos ya no valen.
    expect(e.participacion).toMatchObject({ cuenta: 1, acuses: 0 });
  });

  it("un mecanismo o un agrupar no cambian la participación ni el resultado", () => {
    const antes = derivarEstado(bomba, [], AHORA);
    const e = derivarEstado(
      bomba,
      [
        reg("consejo-bomba", "mecanismo", "vos", "ambito", "2026-10-30T09:00", { datos: { mecanismo: "puntos", fin: "priorizar" } }),
        reg("consejo-bomba", "agrupar", "vos", "proceso", "2026-10-30T09:05", { apuntaA: "b-c-ines", datos: { accion: "agrupar", grupoId: "x", nombre: "X" } }),
      ],
      AHORA,
    );
    expect(e.participacion).toEqual(antes.participacion);
    expect(e.resultado).toEqual(antes.resultado);
    expect(e.mecanismos).toHaveLength(2);
  });
});

describe("agrupar (C1)", () => {
  it("un agrupar fuera de concerns u objetar se ignora y queda en el historial", () => {
    const e = derivarEstado(
      bomba,
      [reg("consejo-bomba", "agrupar", "nico", "proceso", "2026-10-30T09:00", { apuntaA: "b-c-ines", datos: { accion: "agrupar", grupoId: "g-uso", nombre: "Uso compartido" } })],
      AHORA,
    );
    expect(e.concerns.find((c) => c.quien === "ines")?.grupoId).toBeUndefined();
    expect(e.historial.some((h) => h.tipo === "ignorado" && h.clave === "agrupar-fuera-de-fase")).toBe(true);
  });

  it("la autora saca su concern en resolver y el grupo que queda con uno deja de ser grupo", () => {
    const e = derivarEstado(
      bomba,
      [reg("consejo-bomba", "agrupar", "paz", "ambito", "2026-10-30T09:00", { apuntaA: "b-c-paz", datos: { accion: "sacar", grupoId: "g-uso" } })],
      AHORA,
    );
    expect(e.grupos).toHaveLength(0);
    expect(e.concerns.find((c) => c.quien === "paz")).toMatchObject({ estado: "abierto", grupoId: undefined });
    expect(e.concerns.find((c) => c.quien === "ramiro")).toMatchObject({ estado: "abierto", grupoId: undefined });
  });

  it("sacar el concern de otra persona del ámbito se ignora", () => {
    const e = derivarEstado(
      bomba,
      [reg("consejo-bomba", "agrupar", "gala", "ambito", "2026-10-30T09:00", { apuntaA: "b-c-paz", datos: { accion: "sacar", grupoId: "g-uso" } })],
      AHORA,
    );
    expect(e.grupos).toHaveLength(1);
    expect(e.historial.some((h) => h.clave === "sacar-no-permitido")).toBe(true);
  });

  it("un concern agrupado sigue abierto en la versión 2", () => {
    const e = derivarEstado(
      bomba,
      [reg("consejo-bomba", "version", "lautaro", "presenta", "2026-10-30T09:00", { version: 2 })],
      AHORA,
    );
    expect(e.version).toBe(2);
    expect(e.concerns.filter((c) => c.estado === "agrupado")).toHaveLength(2);
  });
});

describe("ámbito del consejo (G1)", () => {
  const agregaVos = reg("consejo-bomba", "ambito-consejo", "vos", "ambito", "2026-10-30T09:00", {
    datos: { agrega: "vos", enNombreDe: "board-netxgen" },
  });

  it("sale de la lista: 7 personas, quórum 4", () => {
    const e = derivarEstado(bomba, [], AHORA);
    expect(e.tamanoAmbito).toBe(7);
    expect(e.participacion.minimo).toBe(4);
    expect(e.ambitoConsejo?.definidoPor).toBe("board-netxgen");
  });

  it("un ambito-consejo que agrega a vos lo sube a 8, con super admin", () => {
    const e = derivarEstado(bomba, [agregaVos], AHORA, { aplicaAmbitoConsejo: true });
    expect(e.tamanoAmbito).toBe(8);
    expect(e.participacion.minimo).toBe(4);
    expect(e.ambitoConsejo?.definidoPor).toBe("superadmin-en-nombre-del-board");
    expect(e.historial.find((h) => h.tipo === "ambito-consejo")?.clave).toBe("se-incluyo-a-si-mismo");
  });

  it("sin super admin el mismo registro se ignora", () => {
    const e = derivarEstado(bomba, [agregaVos], AHORA, { aplicaAmbitoConsejo: false });
    expect(e.tamanoAmbito).toBe(7);
    expect(e.ambitoConsejo?.personas).not.toContain("vos");
  });

  it("en una propuesta que no es del consejo se ignora", () => {
    const e = derivarEstado(huerta, [{ ...agregaVos, propuestaId: "huerta" }], AHORA, { aplicaAmbitoConsejo: true });
    expect(e.tamanoAmbito).toBe(4);
    expect(e.ambitoConsejo).toBeNull();
  });

  it("quitar a las 7 deja el ámbito en sin dato y no permite cerrar por consenso", () => {
    const quitar = bomba.ambitoConsejo!.personas.map((q, i) =>
      reg("consejo-bomba", "ambito-consejo", "vos", "ambito", `2026-10-30T09:0${i}`, { datos: { quita: q, enNombreDe: "board-netxgen" } }),
    );
    const cierre = reg("consejo-bomba", "cierre", "nico", "proceso", "2026-10-30T10:00", { datos: { resultado: "consenso" } });
    const e = derivarEstado(bomba, [...quitar, cierre], AHORA, { aplicaAmbitoConsejo: true });
    expect(e.tamanoAmbito).toBeNull();
    expect(e.participacion).toMatchObject({ minimo: null, falta: null });
    expect(e.resultado).toBeNull();
    expect(e.historial.some((h) => h.clave === "cierre-sin-quorum")).toBe(true);
  });

  it("un ambito-consejo posterior al vencimiento no cambia el resultado", () => {
    const simple: Propuesta = {
      ...cisterna,
      decisionId: "cisterna-compartida",
      recorrido: "simple",
      inicio: "2026-10-01",
      registros: ["mora", "ines", "ramiro", "paz"].map((q, i) =>
        reg("cisterna-compartida", "acuse", q, "ambito", `2026-10-02T1${i}:00`),
      ),
    };
    const tarde = reg("cisterna-compartida", "ambito-consejo", "vos", "ambito", "2026-10-10T09:00", {
      datos: { agrega: "tomas" },
    });
    const sinTarde = derivarEstado(simple, [], DESPUES, { aplicaAmbitoConsejo: true });
    expect(sinTarde.resultado).toEqual({ tipo: "adoptada", motivo: "nadie-objeto" });
    const conTarde = derivarEstado(
      simple,
      [tarde, { ...tarde, id: "z2", datos: { agrega: "ema" } }, { ...tarde, id: "z3", datos: { agrega: "gala2" } }],
      DESPUES,
      { aplicaAmbitoConsejo: true },
    );
    expect(conTarde.resultado).toEqual({ tipo: "adoptada", motivo: "nadie-objeto" });
  });
});

describe("resultados al vencer (B4, D1)", () => {
  it("simple: con el acuse de vos llega al quórum y se adopta; sin él, se pausa", () => {
    const conVos = derivarEstado(huerta, [reg("huerta", "acuse", "vos", "ambito", "2026-10-29T10:00")], DESPUES);
    expect(conVos.resultado).toEqual({ tipo: "adoptada", motivo: "nadie-objeto" });
    const sin = derivarEstado(huerta, [], DESPUES);
    expect(sin.resultado).toEqual({ tipo: "pausada", motivo: "participacion-minima" });
    expect(sin.fase).toBe("cierre");
  });

  it("la urgencia pedida que no se validó vence como una propuesta no urgente", () => {
    const e = derivarEstado(bomba, [], DESPUES);
    expect(e.resultado).toMatchObject({ tipo: "pausada", motivo: "concern-abierto" });
  });

  it("urgente del consejo sin mayoría sube al común", () => {
    const e = derivarEstado(bomba, [reg("consejo-bomba", "respaldo-urgencia", "gala", "ambito", "2026-10-30T09:00")], DESPUES);
    expect(e.urgencia?.estado).toBe("validada");
    expect(e.resultado).toEqual({ tipo: "sube", a: "lighthouse" });
  });

  const retiros = ["b-c-ramiro", "b-c-paz", "b-c-ines"].map((id, i) => {
    const quien = { "b-c-ramiro": "ramiro", "b-c-paz": "paz", "b-c-ines": "ines" }[id]!;
    return reg("consejo-bomba", "retiro", quien, "ambito", `2026-10-30T09:0${i}`, { apuntaA: id });
  });
  const respaldo = reg("consejo-bomba", "respaldo-urgencia", "gala", "ambito", "2026-10-30T09:10");

  it("se aplica como medida provisoria, con revisión a los 30 días", () => {
    const e = derivarEstado(bomba, [respaldo, ...retiros], DESPUES);
    expect(e.resultado).toEqual({ tipo: "provisoria", revisarAntesDe: "2026-12-02", concernsQueObligan: [], enRevision: false });
  });

  it("un concern sobre la urgencia no es oposición, cae con la legitimidad y quien presenta no la decide", () => {
    const sobre = reg("consejo-bomba", "concern", "ines", "ambito", "2026-10-30T09:20", { texto: "no es urgente", datos: { sobre: "urgencia" } });
    const sinLegit = derivarEstado(bomba, [respaldo, ...retiros, sobre], DESPUES);
    expect(sinLegit.resultado).toMatchObject({ tipo: "provisoria", concernsQueObligan: [sobre.id] });
    const deQuienPresenta = reg("consejo-bomba", "legitimidad", "lautaro", "presenta", "2026-10-30T09:30", { apuntaA: sobre.id, datos: { legitimo: true } });
    const ignorada = derivarEstado(bomba, [respaldo, sobre, deQuienPresenta], AHORA);
    expect(ignorada.urgencia?.estado).toBe("validada");
    const sostenida = reg("consejo-bomba", "legitimidad", "gala", "ambito", "2026-10-30T09:30", { apuntaA: sobre.id, datos: { legitimo: true } });
    const cae = derivarEstado(bomba, [respaldo, sobre, sostenida], AHORA);
    expect(cae.urgencia?.estado).toBe("caida");
  });

  it("un respaldo de quien tiene un registro como quien presenta se ignora", () => {
    const comoPresenta = reg("consejo-bomba", "comentario", "vos", "presenta", "2026-10-30T09:00", { texto: "x" });
    const resp = reg("consejo-bomba", "respaldo-urgencia", "vos", "ambito", "2026-10-30T09:05");
    const e = derivarEstado(bomba, [comoPresenta, resp], AHORA);
    expect(e.urgencia).toMatchObject({ estado: "pedida", faltan: 1 });
    expect(e.historial.some((h) => h.clave === "respaldo-de-quien-presenta")).toBe(true);
  });

  it("a lo sumo un respaldo de solo facilitación", () => {
    const e = derivarEstado(
      bomba,
      [
        reg("consejo-bomba", "respaldo-urgencia", "nico", "proceso", "2026-10-30T09:00"),
        reg("consejo-bomba", "respaldo-urgencia", "tomas", "proceso", "2026-10-30T09:05"),
      ],
      AHORA,
    );
    expect(e.urgencia).toMatchObject({ estado: "validada", respaldos: ["mora", "nico"] });
    expect(e.urgencia?.respaldos).not.toContain("tomas");
  });

  describe("revisión (D3)", () => {
    const abrir = reg("consejo-bomba", "revision", "nico", "proceso", "2026-11-05T09:00", { version: 2 });
    const base = [respaldo, ...retiros];

    it("sigue aplicándose durante la revisión", () => {
      const e = derivarEstado(bomba, [...base, abrir], new Date("2026-11-06T12:00:00Z"));
      expect(e.version).toBe(2);
      expect(e.fase).toBe("resolver");
      expect(e.resultado).toMatchObject({ tipo: "provisoria", enRevision: true });
    });

    it("si la revisión vence sin consenso, la medida queda pausada", () => {
      const e = derivarEstado(bomba, [...base, abrir], new Date("2026-11-20T12:00:00Z"));
      expect(e.resultado).toEqual({ tipo: "pausada", motivo: "revision-sin-consenso" });
    });

    it("solo vale de rol de proceso y una vez", () => {
      const deAmbito = { ...abrir, id: "r-amb", nivel: "ambito" as const };
      const e = derivarEstado(bomba, [...base, deAmbito], new Date("2026-11-06T12:00:00Z"));
      expect(e.version).toBe(1);
      expect(e.historial.some((h) => h.clave === "revision-no-valida")).toBe(true);
      const dos = derivarEstado(bomba, [...base, abrir, { ...abrir, id: "r2", cuando: "2026-11-05T10:00:00Z", version: 3 }], new Date("2026-11-06T12:00:00Z"));
      expect(dos.version).toBe(2);
      expect(dos.historial.some((h) => h.clave === "revision-ya-abierta")).toBe(true);
    });

    it("un revision sobre la siembra (cerrada por consenso) se ignora", () => {
      const rev = reg("siembra", "revision", "nico", "proceso", "2026-10-25T09:00", { version: 2 });
      const e = derivarEstado(siembra, [rev], AHORA);
      expect(e.resultado).toMatchObject({ tipo: "consenso" });
      expect(e.version).toBe(1);
    });
  });
});

describe("cierre", () => {
  it("un cierre sin quórum se ignora", () => {
    const cierre = reg("cisterna-compartida", "cierre", "nico", "proceso", "2026-10-30T10:00", { datos: { resultado: "consenso" } });
    const e = derivarEstado(cisterna, [cierre], AHORA);
    expect(e.resultado).toBeNull();
    expect(e.fase).toBe("preguntas");
  });
});

describe("cierre · solo desde llamado u objetar", () => {
  it("un cierre con quórum pero en la fase de concerns se ignora", () => {
    const base = { ...cisterna, ambitoConsejo: undefined, tamanoAmbito: 2 };
    const regs = [
      reg("cisterna-compartida", "fase", "nico", "proceso", "2026-10-29T09:00", { datos: { fase: "concerns" } }),
      reg("cisterna-compartida", "comentario", "mora", "ambito", "2026-10-29T10:00", { texto: "a" }),
      reg("cisterna-compartida", "comentario", "ines", "ambito", "2026-10-29T10:01", { texto: "b" }),
    ];
    const cierre = reg("cisterna-compartida", "cierre", "nico", "proceso", "2026-10-29T11:00", { datos: { resultado: "consenso" } });
    const e = derivarEstado(base, [...regs, cierre], AHORA);
    expect(e.resultado).toBeNull();
    expect(e.fase).toBe("concerns");
    expect(e.historial.some((h) => h.clave === "cierre-fuera-de-fase")).toBe(true);
    const llamado = reg("cisterna-compartida", "fase", "nico", "proceso", "2026-10-29T10:30", { datos: { fase: "llamado" } });
    const ok = derivarEstado(base, [...regs, llamado, cierre], AHORA);
    expect(ok.resultado).toMatchObject({ tipo: "consenso" });
  });
});

describe("determinismo", () => {
  it("misma salida en dos llamadas", () => {
    const extra = [reg("consejo-bomba", "respaldo-urgencia", "gala", "ambito", "2026-10-30T09:00")];
    expect(derivarEstado(bomba, extra, DESPUES)).toEqual(derivarEstado(bomba, extra, DESPUES));
  });
});
