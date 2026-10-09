import { describe, expect, it } from "vitest";
import { CLAVES } from "./claves";
import { resumirDemo } from "./resumen";

function lector(datos: Record<string, string>) {
  return (clave: string) => datos[clave] ?? null;
}

/** Entrevista anterior: se migra a los campos nuevos. */
function entrevista(respondidas: number, confirmadas: number): string {
  const items = Array.from({ length: respondidas }, (_, i) => ({
    respuesta: `r${i}`,
    propuesta: `p${i}`,
    confirmado: i < confirmadas ? `p${i}` : null,
  }));
  return JSON.stringify({ items });
}

const BASICOS = { nombre: "Ana", lugar: "Mendoza", frase: "Vivir en comunidad" };
const PERFIL_BASICOS = JSON.stringify(BASICOS);
const PERFIL_TODO = JSON.stringify({
  ...BASICOS,
  ofrezco: "Huerta",
  roles: ["jardineria"],
  decision: "Por consenso",
  noNegociables: "El agua",
});

const compromiso = (tipo: "ofrezco" | "necesito", id: string) => ({
  id,
  tipo,
  clase: "tiempo",
  descripcion: "algo",
  horasPorMes: 4,
  para: "lighthouse",
  creado: "2026-10-07T10:00:00.000Z",
});

const UN_COMPROMISO = JSON.stringify([compromiso("ofrezco", "a")]);

describe("resumirDemo", () => {
  it("todo vacío: tres null y próximo perfil", () => {
    expect(resumirDemo(lector({}))).toEqual({
      perfil: null,
      compromisos: null,
      ticket: null,
      proximo: "perfil",
    });
  });

  it("perfil sin los campos básicos: cuenta los datos con algo y el próximo es perfil", () => {
    const r = resumirDemo(
      lector({ [CLAVES.perfilDatos]: JSON.stringify({ nombre: "Ana", decision: "Consenso" }), [CLAVES.compromisos]: UN_COMPROMISO }),
    );
    expect(r.perfil).toEqual({ completos: 2, total: 6, basicos: false });
    expect(r.proximo).toBe("perfil");
  });

  it("la entrevista anterior se migra: cuenta sus datos y sigue faltando lo básico", () => {
    const r = resumirDemo(lector({ [CLAVES.perfil]: entrevista(6, 2) }));
    expect(r.perfil).toEqual({ completos: 4, total: 6, basicos: false });
    expect(r.proximo).toBe("perfil");
  });

  it("el perfil nuevo manda sobre la entrevista anterior", () => {
    const r = resumirDemo(lector({ [CLAVES.perfil]: entrevista(6, 6), [CLAVES.perfilDatos]: PERFIL_BASICOS }));
    expect(r.perfil).toEqual({ completos: 3, total: 6, basicos: true });
  });

  it("perfil con lo básico, sin compromisos: próximo compromisos", () => {
    expect(resumirDemo(lector({ [CLAVES.perfilDatos]: PERFIL_BASICOS })).proximo).toBe("compromisos");
  });

  it("perfil con lo básico y compromiso, sin ticket: próximo congreso", () => {
    const r = resumirDemo(lector({ [CLAVES.perfilDatos]: PERFIL_BASICOS, [CLAVES.compromisos]: UN_COMPROMISO }));
    expect(r.proximo).toBe("congreso");
  });

  it("todo completo: próximo null y cuenta ofrezco/necesito", () => {
    const compromisos = JSON.stringify([
      compromiso("ofrezco", "a"),
      compromiso("ofrezco", "b"),
      compromiso("necesito", "c"),
    ]);
    const r = resumirDemo(
      lector({ [CLAVES.perfilDatos]: PERFIL_TODO, [CLAVES.compromisos]: compromisos, [CLAVES.congreso]: "lh27-8f3k-2q" }),
    );
    expect(r.perfil).toEqual({ completos: 6, total: 6, basicos: true });
    expect(r.compromisos).toEqual({ ofrezco: 2, necesito: 1 });
    expect(r.ticket).toBe("LH27-8F3K-2Q");
    expect(r.proximo).toBeNull();
  });

  it("JSON roto en cada clave: null en ese campo", () => {
    const r = resumirDemo(lector({ [CLAVES.perfil]: "{roto", [CLAVES.perfilDatos]: "{roto", [CLAVES.compromisos]: "[roto", [CLAVES.congreso]: "{roto" }));
    expect(r.perfil).toBeNull();
    expect(r.compromisos).toBeNull();
    expect(r.ticket).toBeNull();
  });

  it("ticket inválido se trata como sin ticket", () => {
    expect(resumirDemo(lector({ [CLAVES.congreso]: "1234" })).ticket).toBeNull();
  });
});
