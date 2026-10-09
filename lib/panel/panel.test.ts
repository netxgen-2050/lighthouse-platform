import { PERFIL_VACIO } from "@/lib/perfil/modelo";
import { describe, expect, it } from "vitest";
import type { EventoActividad } from "@/lib/actividad/actividad";
import { CLAVES } from "@/lib/demo/claves";
import { agruparPorDia } from "./linea-tiempo";
import { leerProgreso, proximoPaso, type Progreso } from "./proximo-paso";

const TODO: Progreso = {
  perfilCompleto: true,
  adhirioAComunidad: true,
  propusoPacto: true,
  quiereInvertir: false,
  identidadVerificada: false,
  tieneTicket: true,
};

describe("proximoPaso", () => {
  it("sin nada: completar el perfil", () => {
    const p = proximoPaso({ ...TODO, perfilCompleto: false, adhirioAComunidad: false, propusoPacto: false, tieneTicket: false });
    expect(p?.titulo).toBe("Completá tu perfil");
    expect(p?.href).toBe("/perfil");
  });

  it("respeta el orden: comunidad, pacto, identidad, ticket", () => {
    expect(proximoPaso({ ...TODO, adhirioAComunidad: false, propusoPacto: false, tieneTicket: false })?.href).toBe("/tribus");
    expect(proximoPaso({ ...TODO, propusoPacto: false, tieneTicket: false })?.href).toBe("/pactos");
    expect(proximoPaso({ ...TODO, quiereInvertir: true, tieneTicket: false })?.href).toBe("/pasaporte");
    expect(proximoPaso({ ...TODO, tieneTicket: false })?.href).toBe("/congreso");
  });

  it("la identidad solo se pide a quien quiere invertir y todavía no la verificó", () => {
    expect(proximoPaso({ ...TODO, quiereInvertir: true, identidadVerificada: true })).toBeNull();
    expect(proximoPaso({ ...TODO, quiereInvertir: false })).toBeNull();
  });

  it("todo hecho: no hay próximo paso", () => {
    expect(proximoPaso(TODO)).toBeNull();
  });
});

function lector(datos: Record<string, string>) {
  return (clave: string) => datos[clave] ?? null;
}

const perfilCon = (confirmadas: number) =>
  JSON.stringify({
    items: Array.from({ length: 6 }, (_, i) => ({
      respuesta: `r${i}`,
      propuesta: `p${i}`,
      confirmado: i < confirmadas ? `p${i}` : null,
    })),
  });

describe("leerProgreso", () => {
  it("sin datos guardados: nada hecho", () => {
    expect(leerProgreso(lector({}))).toEqual({
      perfilCompleto: false,
      adhirioAComunidad: false,
      propusoPacto: false,
      quiereInvertir: false,
      identidadVerificada: false,
      tieneTicket: false,
    });
  });

  it("el perfil cuenta cuando tiene nombre, lugar y frase (perfil nuevo)", () => {
    const perfil = (lugar: string) =>
      JSON.stringify({ ...PERFIL_VACIO, nombre: "Gus", lugar, frase: "Construir en común" });
    expect(leerProgreso(lector({ [CLAVES.perfilDatos]: perfil("") })).perfilCompleto).toBe(false);
    expect(leerProgreso(lector({ [CLAVES.perfilDatos]: perfil("Lisboa") })).perfilCompleto).toBe(true);
    // La entrevista vieja sola no alcanza: se migra, pero no trae nombre ni lugar.
    expect(leerProgreso(lector({ [CLAVES.perfil]: perfilCon(6) })).perfilCompleto).toBe(false);
  });

  it("iniciar el KYC enciende el paso de identidad; aprobado lo cumple", () => {
    expect(leerProgreso(lector({})).quiereInvertir).toBe(false);
    const enTramite = JSON.stringify({ estado: "en-tramite", enviado: "2026-10-09T10:00:00.000Z" });
    expect(leerProgreso(lector({ [CLAVES.kyc]: enTramite }))).toMatchObject({ quiereInvertir: true, identidadVerificada: false });
    const aprobado = JSON.stringify({ estado: "aprobado", enviado: "2026-10-09T10:00:00.000Z", aprobado: "2026-10-09T11:00:00.000Z" });
    expect(leerProgreso(lector({ [CLAVES.kyc]: aprobado }))).toMatchObject({ quiereInvertir: true, identidadVerificada: true });
  });

  it("un pedido de adhesión ya cuenta como adherir", () => {
    expect(leerProgreso(lector({ [CLAVES.membresia]: JSON.stringify({ lighthouse: "pedido" }) })).adhirioAComunidad).toBe(true);
  });

  it("un pacto en borrador no cuenta; enviado sí", () => {
    const pacto = (paso: number) =>
      JSON.stringify({
        pestana: "tiempo",
        comunidades: { lighthouse: { tiempo: { rol: "otro", rolOtro: "x", descripcion: "algo", horas: 4, paso }, aportes: [] } },
      });
    expect(leerProgreso(lector({ [CLAVES.pactos]: pacto(0) })).propusoPacto).toBe(false);
    expect(leerProgreso(lector({ [CLAVES.pactos]: pacto(1) })).propusoPacto).toBe(true);
  });

  it("ticket con formato inválido se trata como sin ticket", () => {
    expect(leerProgreso(lector({ [CLAVES.congreso]: "1234" })).tieneTicket).toBe(false);
    expect(leerProgreso(lector({ [CLAVES.congreso]: "LH27-8F3K-2Q" })).tieneTicket).toBe(true);
  });

  it("datos dañados no rompen", () => {
    expect(() =>
      leerProgreso(lector({ [CLAVES.perfil]: "{", [CLAVES.pactos]: "x", [CLAVES.membresia]: "[" })),
    ).not.toThrow();
  });
});

const ev = (id: string, fecha: string, extra: Partial<EventoActividad> = {}): EventoActividad => ({
  id,
  tipo: "t",
  texto: id,
  fecha,
  enlace: "/",
  notificacion: false,
  leida: false,
  ...extra,
});

describe("agruparPorDia", () => {
  it("agrupa por día local sin reordenar", () => {
    const grupos = agruparPorDia([
      ev("c", "2026-10-09T15:00:00"),
      ev("b", "2026-10-09T10:00:00"),
      ev("a", "2026-10-08T12:00:00"),
    ]);
    expect(grupos.map((g) => g.dia)).toEqual(["2026-10-09", "2026-10-08"]);
    expect(grupos[0].eventos.map((e) => e.id)).toEqual(["c", "b"]);
  });

  it("usa visibleDesde cuando existe", () => {
    const grupos = agruparPorDia([ev("a", "2026-10-09T12:00:00", { visibleDesde: "2026-10-10T12:00:00" })]);
    expect(grupos[0].dia).toBe("2026-10-10");
  });

  it("sin eventos no hay grupos", () => {
    expect(agruparPorDia([])).toEqual([]);
  });
});
