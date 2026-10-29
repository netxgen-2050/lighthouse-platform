import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { BilingueConOriginal } from "@/lib/idioma/tipos";
import {
  GRUPOS_PRINCIPIO,
  MANIFIESTO_VRN,
  NOMBRE_DEL_COMUN,
  NOMBRE_META_TRIBU,
  nombreDelComun,
  principioVrnPorId,
  principiosDelGrupo,
  principiosDelManifiesto,
  principiosLighthouseVrn,
} from "./lighthouse-vrn";

describe("manifiesto de Lighthouse VRN", () => {
  const m = MANIFIESTO_VRN;

  it("hay entre 10 y 15 principios y los cinco grupos tienen al menos uno", () => {
    expect(m.principios.length).toBeGreaterThanOrEqual(10);
    expect(m.principios.length).toBeLessThanOrEqual(15);
    for (const g of GRUPOS_PRINCIPIO) expect(principiosDelGrupo(g).length, g).toBeGreaterThan(0);
  });

  it("los ids de los principios son únicos y los de los derechos también", () => {
    const ids = m.principios.map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    const derechos = m.derechos.map((d) => d.id);
    expect(new Set(derechos).size).toBe(derechos.length);
  });

  it("hay siete derechos y cada uno remite a principios que existen", () => {
    expect(m.derechos).toHaveLength(7);
    for (const d of m.derechos) {
      expect(d.principios.length, d.id).toBeGreaterThan(0);
      for (const id of d.principios) expect(principioVrnPorId(id), `${d.id} -> ${id}`).not.toBeNull();
    }
  });

  it("hay entre 5 y 7 compromisos", () => {
    expect(m.compromisos.length).toBeGreaterThanOrEqual(5);
    expect(m.compromisos.length).toBeLessThanOrEqual(7);
  });

  it("está marcado como borrador y como ejemplo, con versión", () => {
    expect(m.estado).toBe("borrador");
    expect(m.ejemplo).toBe(true);
    expect(m.versionId.length).toBeGreaterThan(0);
  });

  it("tiene el proceso de cambio y la regla de las tribus", () => {
    expect(m.comoSeCambia.length).toBeGreaterThanOrEqual(4);
    expect(m.reglaTribus.es).toMatch(/contradecir/);
  });
});

describe("el nombre del común", () => {
  it("es bilingüe: Procomún en español y Commons en inglés", () => {
    expect(nombreDelComun("es")).toBe("Lighthouse VRN Procomún");
    expect(nombreDelComun("en")).toBe("Lighthouse VRN Commons");
    expect(NOMBRE_DEL_COMUN.es).toContain(NOMBRE_META_TRIBU);
  });

  it("ningún archivo de app/, components/ o lib/ lo escribe a mano", () => {
    const RAIZ = path.resolve(__dirname, "..", "..");
    const YO = path.join(RAIZ, "lib", "manifiestos", "lighthouse-vrn.ts");
    const archivos = (dir: string): string[] =>
      readdirSync(dir).flatMap((n) => {
        const p = path.join(dir, n);
        if (statSync(p).isDirectory()) return archivos(p);
        return /\.(tsx?)$/.test(n) && !/\.test\.tsx?$/.test(n) && p !== YO ? [p] : [];
      });
    const todos = ["app", "components", "lib"].flatMap((d) => archivos(path.join(RAIZ, d)));
    const malos = todos.filter((f) => /Lighthouse VRN (Commons|Procom)/.test(readFileSync(f, "utf8")));
    expect(malos).toEqual([]);
  });
});

describe("fuente única de principios", () => {
  it("un id desconocido devuelve null", () => {
    expect(principioVrnPorId("no-existe")).toBeNull();
    expect(principioVrnPorId("")).toBeNull();
  });

  it("el adaptador es borrador, de origen manifiesto, y expone la explicación", () => {
    expect(principiosDelManifiesto.estado).toBe("borrador");
    expect(principiosDelManifiesto.origen).toBe("manifiesto");
    const lista = principiosDelManifiesto.principios();
    expect(lista).toHaveLength(principiosLighthouseVrn().length);
    for (const x of lista) expect(x.explicacion).toEqual(x.practica);
  });

  it("conserva los 13 ids de la lista de ejemplo de fogon-propuestas", () => {
    const conservados = [
      "vida-en-el-centro", "tierra-no-mercancia", "suelo-vivo", "agua-viva", "aire-limpio", "biodiversidad",
      "recursos-con-medida", "generaciones-futuras", "voz-afectada", "subsidiariedad", "cuidado-del-proceso",
      "poder-compartido", "plata-vuelve-a-la-tierra",
    ];
    for (const id of conservados) expect(principioVrnPorId(id), id).not.toBeNull();
    expect(principioVrnPorId("agua-vuelve-limpia")).not.toBeNull();
    expect(principioVrnPorId("de-lo-chico-a-lo-grande")).not.toBeNull();
  });

  it("cada principio tiene nombre y explicación en los dos idiomas, con el español como original", () => {
    for (const x of principiosLighthouseVrn()) {
      for (const t of [x.nombre, x.practica]) {
        expect(t.original, x.id).toBe("es");
        expect(t.es.trim(), x.id).not.toBe("");
        expect(t.en?.trim(), x.id).toBeTruthy();
        expect(t.en, x.id).not.toBe(t.es);
      }
    }
  });
});

// Comunidades de referencia de las que salieron los principios: el manifiesto no las nombra (ni en es ni en en).
export const COMUNIDADES_DE_REFERENCIA = [
  "tamera", "auroville", "findhorn", "damanhur", "crystal waters", "sieben linden", "ecovillage", "ecoaldea",
  "gaia education", "tierra del fuego", "tdf", "formal consensus",
];

/** Todos los textos del manifiesto, en los dos idiomas. */
export function todosLosTextos(m: typeof MANIFIESTO_VRN): string[] {
  const t = (b: BilingueConOriginal) => [b.es, b.en ?? ""];
  return [
    ...t(m.proposito),
    ...m.principios.flatMap((x) => [...t(x.nombre), ...t(x.practica)]),
    ...m.derechos.flatMap((d) => [...t(d.nombre), ...t(d.practica)]),
    ...m.compromisos.flatMap((c) => [...t(c.titulo), ...t(c.texto)]),
    ...m.comoSeCambia.flatMap(t),
    ...t(m.reglaTribus),
    ...t(m.maquinasSugieren),
    ...t(m.version),
  ];
}

function nombraReferencias(textos: string[]): string[] {
  const junto = textos.join("\n").toLowerCase();
  return COMUNIDADES_DE_REFERENCIA.filter((n) => junto.includes(n));
}

describe("no nombra a las comunidades de referencia", () => {
  it("ningún texto, en ningún idioma, las nombra", () => {
    expect(nombraReferencias(todosLosTextos(MANIFIESTO_VRN))).toEqual([]);
  });

  it("el test falla si se agrega a mano uno de esos nombres", () => {
    const sucio = {
      ...MANIFIESTO_VRN,
      proposito: { ...MANIFIESTO_VRN.proposito, en: `${MANIFIESTO_VRN.proposito.en} like Tamera does` },
    };
    expect(nombraReferencias(todosLosTextos(sucio))).toEqual(["tamera"]);
  });
});
