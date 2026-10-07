import { describe, expect, it } from "vitest";
import { CLAVES } from "./claves";
import { resumirDemo } from "./resumen";

function lector(datos: Record<string, string>) {
  return (clave: string) => datos[clave] ?? null;
}

function perfil(respondidas: number, confirmadas: number): string {
  const items = Array.from({ length: respondidas }, (_, i) => ({
    respuesta: `r${i}`,
    propuesta: `p${i}`,
    confirmado: i < confirmadas ? `p${i}` : null,
  }));
  return JSON.stringify({ items });
}

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

  it("perfil a medias: cuenta solo los confirmados y el próximo es perfil", () => {
    const r = resumirDemo(lector({ [CLAVES.perfil]: perfil(3, 2), [CLAVES.compromisos]: UN_COMPROMISO }));
    expect(r.perfil).toEqual({ confirmados: 2, total: 6 });
    expect(r.proximo).toBe("perfil");
  });

  it("perfil respondido pero sin confirmar: sigue en perfil", () => {
    expect(resumirDemo(lector({ [CLAVES.perfil]: perfil(6, 5) })).proximo).toBe("perfil");
  });

  it("perfil 6/6 sin compromisos: próximo compromisos", () => {
    expect(resumirDemo(lector({ [CLAVES.perfil]: perfil(6, 6) })).proximo).toBe("compromisos");
  });

  it("perfil 6/6 con compromiso y sin ticket: próximo congreso", () => {
    const r = resumirDemo(lector({ [CLAVES.perfil]: perfil(6, 6), [CLAVES.compromisos]: UN_COMPROMISO }));
    expect(r.proximo).toBe("congreso");
  });

  it("todo completo: próximo null y cuenta ofrezco/necesito", () => {
    const compromisos = JSON.stringify([
      compromiso("ofrezco", "a"),
      compromiso("ofrezco", "b"),
      compromiso("necesito", "c"),
    ]);
    const r = resumirDemo(
      lector({ [CLAVES.perfil]: perfil(6, 6), [CLAVES.compromisos]: compromisos, [CLAVES.congreso]: "lh27-8f3k-2q" }),
    );
    expect(r.compromisos).toEqual({ ofrezco: 2, necesito: 1 });
    expect(r.ticket).toBe("LH27-8F3K-2Q");
    expect(r.proximo).toBeNull();
  });

  it("JSON roto en cada clave: null en ese campo", () => {
    const r = resumirDemo(lector({ [CLAVES.perfil]: "{roto", [CLAVES.compromisos]: "[roto", [CLAVES.congreso]: "{roto" }));
    expect(r.perfil).toBeNull();
    expect(r.compromisos).toBeNull();
    expect(r.ticket).toBeNull();
  });

  it("ticket inválido se trata como sin ticket", () => {
    expect(resumirDemo(lector({ [CLAVES.congreso]: "1234" })).ticket).toBeNull();
  });
});
