import { describe, expect, it } from "vitest";
import { textos } from "@/lib/idioma/textos";
import { TERMINOS } from "@/lib/legal/terminos";
import { PROPUESTAS_DE_EJEMPLO } from "./ejemplos";
import { ACCIONES_DE_PROCESO, MATRIZ, NIVELES_IMPLICACION } from "./permisos";
import { RECORRIDOS } from "./fases";
import type { Accion, Condicion } from "./tipos";

// Ningún agente (Hifa, el Guardián) pausa, frena, bloquea ni decide. Un verbo prohibido solo vale si la palabra de antes lo niega.
const PROHIBIDOS = {
  es: ["pausa", "pausar", "frena", "frenar", "bloquea", "bloquear", "decide", "decidir"],
  en: ["pause", "pauses", "stop", "stops", "block", "blocks", "decide", "decides"],
};
const NEGACIONES = {
  es: ["nunca", "no", "ni"],
  en: ["never", "not", "nor", "doesn't", "don't"],
};

/** Los verbos prohibidos que aparecen sin una negación justo antes. */
export function verbosSinNegar(texto: string, idioma: "es" | "en"): string[] {
  const palabras = texto.toLowerCase().match(/[\p{L}']+/gu) ?? [];
  const sueltos: string[] = [];
  palabras.forEach((w, i) => {
    if (PROHIBIDOS[idioma].includes(w) && !NEGACIONES[idioma].includes(palabras[i - 1] ?? "")) sueltos.push(w);
  });
  return sueltos;
}

describe("regla de la negación (el Guardián y Hifa nunca pausan ni deciden)", () => {
  it("casos fijos: 'nunca pausa ni decide' pasa; 'el Guardián pausa la propuesta' falla", () => {
    expect(verbosSinNegar("Nunca pausa ni decide", "es")).toEqual([]);
    expect(verbosSinNegar("El Guardián pausa la propuesta", "es")).toEqual(["pausa"]);
    expect(verbosSinNegar("It never pauses nor decides", "en")).toEqual([]);
    expect(verbosSinNegar("The Guardian pauses the proposal", "en")).toEqual(["pauses"]);
  });

  for (const idioma of ["es", "en"] as const) {
    it(`${idioma}: los textos del Guardián, de Hifa y los ⚖ no dicen que un agente pausa o decide`, () => {
      const t = textos("fogonPropuestas", idioma);
      const textosGuionados: string[] = [];
      for (const p of PROPUESTAS_DE_EJEMPLO) {
        const { hifa, guardian } = p.guion;
        textosGuionados.push(hifa.resumen[idioma]);
        for (const a of hifa.agrupaciones) textosGuionados.push(a.nombre[idioma]);
        if (hifa.mecanismo) textosGuionados.push(hifa.mecanismo.fin[idioma], hifa.mecanismo.porque[idioma]);
        for (const s of guardian) textosGuionados.push(s.texto[idioma]);
      }
      const legal = (clave: "guardianIA") => (idioma === "es" ? TERMINOS[clave].texto : TERMINOS[clave].en.texto);
      const todos = [...textosGuionados, t.desafio.intro, t.desafio.falta, t.discusion.tipos.guardian, t.discusion.guardianEstado.sinRespaldo, legal("guardianIA")];
      for (const texto of todos) expect(verbosSinNegar(texto, idioma), texto).toEqual([]);
    });
  }

  it("el ⚖ guardianIA presenta al Guardián como defensor de la Voz de la Tierra, sin nombrar una asociación que custodie el Fondo Común", () => {
    expect(TERMINOS.guardianIA.texto).toContain("Voz de la Tierra");
    expect(TERMINOS.guardianIA.texto).toContain("Consejo de la Fundación");
    expect(TERMINOS.guardianIA.texto).not.toMatch(/asociaci[oó]n/i);
    expect(TERMINOS.guardianIA.texto).not.toContain("la propuesta sigue su curso");
    expect(TERMINOS.guardianIA.borrador).toBe(true);
  });
});

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
