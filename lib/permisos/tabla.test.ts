import { describe, expect, it } from "vitest";
import { calcularPermisos } from "./calcular";
import { COLUMNAS, PUERTAS } from "./tabla";
import type { Columna, Pase, Persona, Puerta } from "./tipos";

const base: Persona = {
  plan: "explorador",
  pase: null,
  tribus: [],
  presenciaGenesis: false,
  residente: false,
};

// Una persona que tiene solo esa fuente (el Explorador es el mínimo).
function solo(col: Columna, pase: Pase = "semilla"): Persona {
  switch (col) {
    case "explorador":
      return base;
    case "miembro":
      return { ...base, plan: "miembro" };
    case "pase":
      return { ...base, pase };
    case "tribu":
      return { ...base, tribus: ["valle"] };
    case "presencia":
      return { ...base, presenciaGenesis: true };
    case "residente":
      return { ...base, residente: true };
  }
}

const N = null;
// Escrito a mano desde la nota 18 §3. Orden de columnas:
// explorador, miembro, pase, tribu, presencia, residente.
const ESPERADO: Record<Puerta, Array<string | null>> = {
  "mapa-tribus-eventos": ["abierta", "abierta", "abierta", "abierta", "abierta", "abierta"],
  "registrar-ticket": ["abierta", "abierta", "abierta", "abierta", N, "abierta"],
  "foros-red": [N, "abierta", "abierta", "abierta", "abierta", "abierta"],
  "sala-tribu": [N, "visita", "visita", "completa", N, "completa"],
  "canal-fundadores": [N, N, "abierta", N, N, N],
  "voz-tribu": [N, N, N, "segun estatuto", N, "abierta"],
  "voz-fondo-comun": [N, N, "1 voz", N, N, N],
  "voto-asamblea-residentes": [N, N, N, N, N, "1 persona = 1 voto"],
  creditos: [N, N, "abierta", N, N, N],
};

describe("tabla de la nota 18 §3", () => {
  it("tiene 9 puertas y 6 columnas", () => {
    expect(PUERTAS).toHaveLength(9);
    expect(COLUMNAS).toHaveLength(6);
  });

  for (const puerta of PUERTAS) {
    COLUMNAS.forEach((col, i) => {
      // Todos parten del plan Explorador (mínimo): su celda también cuenta.
      const propia = ESPERADO[puerta][i];
      const esperado = propia ?? ESPERADO[puerta][0];
      it(`${puerta} x ${col}`, () => {
        const r = calcularPermisos(solo(col))[puerta];
        expect(r.grado).toBe(esperado);
        expect(r.abierta).toBe(esperado !== null);
      });
    });
  }

  for (const pase of ["semilla", "brote", "raiz"] as const) {
    it(`el pase ${pase} abre lo mismo que la columna de pase`, () => {
      const r = calcularPermisos(solo("pase", pase));
      for (const puerta of PUERTAS) {
        expect(r[puerta].grado).toBe(ESPERADO[puerta][2]);
      }
    });
  }
});
