import { describe, expect, it } from "vitest";
import { textos } from "@/lib/idioma/textos";
import { ACCIONES_DE_PROCESO, MATRIZ, NIVELES_IMPLICACION } from "./permisos";
import { RECORRIDOS } from "./fases";
import type { Accion, Condicion } from "./tipos";

describe("textos de las propuestas", () => {
  for (const idioma of ["es", "en"] as const) {
    const t = textos("fogonPropuestas", idioma);

    it(`${idioma}: ninguna acción, condición, nivel ni fase queda sin texto`, () => {
      const acciones = [...Object.keys(MATRIZ), ...Object.keys(ACCIONES_DE_PROCESO)] as Accion[];
      const condiciones = new Set<Condicion>();
      for (const a of acciones) {
        expect(t.acciones[a]?.trim(), `acción ${a}`).toBeTruthy();
        const celdas = a in MATRIZ ? MATRIZ[a as keyof typeof MATRIZ] : ACCIONES_DE_PROCESO[a as keyof typeof ACCIONES_DE_PROCESO];
        for (const n of NIVELES_IMPLICACION) {
          const c = celdas[n];
          if (typeof c !== "string") condiciones.add(c.condicion);
        }
      }
      for (const c of condiciones) expect(t.condiciones[c]?.trim(), `condición ${c}`).toBeTruthy();
      for (const n of NIVELES_IMPLICACION) {
        expect(t.niveles[n]?.trim(), n).toBeTruthy();
        expect(t.nivelesAyuda[n]?.trim(), n).toBeTruthy();
      }
      for (const f of new Set([...RECORRIDOS.simple, ...RECORRIDOS.importante])) expect(t.fases.nombres[f]?.trim(), f).toBeTruthy();
    });
  }
});
