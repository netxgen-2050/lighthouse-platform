import { describe, expect, it } from "vitest";
import { listarTribusBilingues } from "@/lib/tribus/datos";
import { CIRCULOS_DEL_COMUN, circulosDe, circulosTransversales, COMUN_ID, nodoDe, padreDe, todosLosCirculos } from "./datos";
import {
  agregar,
  estaRevocado,
  leerRegistros,
  lugaresDelConsejo,
  revocar,
  sincronizarValidaciones,
  tribusQueValidan,
  validadaPorElComun,
} from "./registros";

const AHORA = "2026-10-27T10:00:00.000Z";
const vacantes = listarTribusBilingues().filter((t) => t.estado === "vacante");

describe("círculos de ejemplo", () => {
  it("comun-contratistas existe, con propósito economia", () => {
    const c = CIRCULOS_DEL_COMUN.find((x) => x.id === "comun-contratistas");
    expect(c?.nombre.es).toBe("Gestión de contratistas");
    expect(c?.proposito).toBe("economia");
    expect(c?.decide?.map((x) => x.es)).toEqual(["Convocatorias y contratos de obra", "Seguimiento de entregas"]);
  });

  it("hay doce tribus y cuatro buscan tribu", () => {
    expect(listarTribusBilingues()).toHaveLength(12);
    expect(vacantes.map((t) => t.nombre)).toEqual(["Barrio 3", "Barrio 8", "Barrio 9", "Barrio 12"]);
  });

  it("las tribus activas o en formación traen círculos y las vacantes no", () => {
    for (const t of listarTribusBilingues()) {
      const n = circulosDe(t.id).length;
      if (t.estado === "vacante") expect(n, t.id).toBe(0);
      else expect(n, t.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("los círculos de Avelan Kerum salen de sus áreas", () => {
    const areas = listarTribusBilingues().find((t) => t.id === "avelan")!.areas!;
    expect(circulosDe("avelan").map((c) => c.nombre)).toEqual(areas);
  });

  it("Valle Solar tiene Cuidado de la tierra, Arquitectura y Comunicación", () => {
    const nombres = circulosDe("valle").map((c) => c.nombre.es);
    expect(nombres).toEqual(expect.arrayContaining(["Cuidado de la tierra", "Arquitectura", "Comunicación"]));
  });
});

describe("círculos transversales", () => {
  it("el de ejemplo cuelga del común y lo comparten Valle Solar y Taller Común", () => {
    const [c] = circulosTransversales();
    expect(c.tribus).toEqual(["valle", "taller"]);
    expect(padreDe(c)).toBe(COMUN_ID);
    expect(nodoDe(c, "es").padreId).toBe(COMUN_ID);
  });

  it("un círculo de una sola tribu cuelga de esa tribu", () => {
    const [c] = circulosDe("valle");
    expect(padreDe(c)).toBe("valle");
  });

  it("sin zona no inventa un lote ni un número", () => {
    for (const c of todosLosCirculos()) expect(c.zona, c.id).toBeUndefined();
    expect(JSON.stringify(circulosTransversales())).not.toMatch(/lote|\b0\b/i);
  });

  it("un círculo sin ninguna tribu también cuelga del común", () => {
    expect(padreDe({ id: "x", nombre: { es: "X" }, tribus: [] })).toBe(COMUN_ID);
  });
});

describe("consejo", () => {
  it("tiene un lugar por tribu validada y ninguno para las vacantes", () => {
    const lugares = lugaresDelConsejo();
    expect(lugares).toHaveLength(8);
    for (const v of vacantes) expect(lugares.map((l) => l.tribuId)).not.toContain(v.id);
    expect(lugares.map((l) => l.tribuId)).toContain("valle");
  });

  it("ningún lugar tiene un representante inventado", () => {
    for (const l of lugaresDelConsejo()) expect(l.representante).toBeNull();
  });

  it("las vacantes no están validadas por el común", () => {
    for (const v of vacantes) expect(validadaPorElComun(v.id)).toBe(false);
    expect(validadaPorElComun("valle")).toBe(true);
  });
});

describe("registros de solo agregar", () => {
  it("agregar suma un registro sin tocar los anteriores", () => {
    const a = agregar([], { esquema: "valida-persona", afirma: "taller", sobre: "yo" }, AHORA);
    const b = agregar(a, { esquema: "lleva-al-consejo", afirma: "valle", sobre: "pedido" }, AHORA);
    expect(b).toHaveLength(2);
    expect(b[0]).toEqual(a[0]);
    expect(new Set(b.map((r) => r.id)).size).toBe(2);
  });

  it("revocar no borra el original: agrega un registro que lo apunta", () => {
    const a = agregar([], { esquema: "valida-persona", afirma: "taller", sobre: "yo" }, AHORA);
    const b = revocar(a, a[0].id, AHORA);
    expect(b).toHaveLength(2);
    expect(b[0]).toEqual(a[0]);
    expect(b[1].esquema).toBe("revoca");
    expect(b[1].apuntaA).toBe(a[0].id);
    expect(estaRevocado(b, a[0].id)).toBe(true);
    expect(estaRevocado(a, a[0].id)).toBe(false);
  });

  it("la persona deja de verse validada al revocar", () => {
    const a = agregar([], { esquema: "valida-persona", afirma: "taller", sobre: "yo" }, AHORA);
    expect(tribusQueValidan("yo", a)).toEqual(["taller"]);
    expect(tribusQueValidan("yo", revocar(a, a[0].id, AHORA))).toEqual([]);
  });

  it("revocar dos veces, o algo que no existe, no agrega nada", () => {
    const a = agregar([], { esquema: "valida-persona", afirma: "taller", sobre: "yo" }, AHORA);
    const b = revocar(a, a[0].id, AHORA);
    expect(revocar(b, a[0].id, AHORA)).toHaveLength(2);
    expect(revocar(a, "no-existe", AHORA)).toHaveLength(1);
    expect(revocar(b, b[1].id, AHORA)).toHaveLength(2);
  });

  it("revocar una validación de ejemplo del común no se confunde con las de la persona", () => {
    expect(tribusQueValidan("yo", [])).toEqual([]);
  });

  it("una validación retirada no vuelve sola al sincronizar", () => {
    const a = sincronizarValidaciones([], "yo", ["taller"], AHORA);
    expect(tribusQueValidan("yo", a)).toEqual(["taller"]);
    expect(sincronizarValidaciones(a, "yo", ["taller"], AHORA)).toEqual(a);
    const b = revocar(a, a[0].id, AHORA);
    expect(tribusQueValidan("yo", sincronizarValidaciones(b, "yo", ["taller"], AHORA))).toEqual([]);
  });

  it("sincronizar suma una validación por cada tribu nueva", () => {
    const a = sincronizarValidaciones([], "yo", ["taller", "valle"], AHORA);
    expect(tribusQueValidan("yo", a).sort()).toEqual(["taller", "valle"]);
  });
});

describe("lectura tolerante de lo guardado", () => {
  it("lo roto se lee como lista vacía", () => {
    expect(leerRegistros(null)).toEqual([]);
    expect(leerRegistros("{no es json")).toEqual([]);
    expect(leerRegistros('{"a":1}')).toEqual([]);
    expect(leerRegistros('"texto"')).toEqual([]);
  });

  it("descarta registro por registro lo que no tiene forma", () => {
    const bueno = { id: "r1", esquema: "valida-persona", afirma: "taller", sobre: "yo", apuntaA: null, cuando: AHORA, datos: { a: "b", c: 1 } };
    const crudo = JSON.stringify([bueno, { id: 3 }, null, { ...bueno, id: "r2", esquema: "inventado" }]);
    const l = leerRegistros(crudo);
    expect(l).toHaveLength(1);
    expect(l[0].datos).toEqual({ a: "b" });
  });
});

describe("equipos transversales de Lighthouse VRN (los círculos del común)", () => {
  it("están los ocho nombres de la lista de Gus y Tokenomics y Semillas se queda", () => {
    expect(CIRCULOS_DEL_COMUN.map((c) => c.nombre.es)).toEqual(
      expect.arrayContaining([
        "Legal",
        "Permacultura y regeneración",
        "Marketing y comunicación",
        "Tecnología",
        "Gestión de contratistas",
        "Gobernanza",
        "Cuidado y conflictos",
        "Agua",
        "Tokenomics y Semillas",
      ]),
    );
  });

  it("conservan los ids de siempre y suman contratistas y gobernanza", () => {
    const ids = CIRCULOS_DEL_COMUN.map((c) => c.id);
    for (const id of ["permacultura", "agua", "legal", "token", "marketing", "cuidado", "plataforma", "contratistas", "gobernanza"]) {
      expect(ids).toContain(`comun-${id}`);
    }
  });

  it("cada uno tiene su propósito para todo el Lighthouse en los dos idiomas", () => {
    for (const c of CIRCULOS_DEL_COMUN) {
      expect(c.paraTodoElLighthouse?.es.trim(), c.id).toBeTruthy();
      expect(c.paraTodoElLighthouse?.en?.trim(), c.id).toBeTruthy();
    }
  });
});
