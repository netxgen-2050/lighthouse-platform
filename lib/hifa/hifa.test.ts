import { describe, expect, it } from "vitest";
import { CONTEXTO_VACIO, validarReporte } from "@/lib/reportes/reporte";
import { ATAJOS, AL_ELEGIR, RESPUESTAS, SALUDO, alConfirmar } from "./guion";
import {
  ESTADO_INICIAL,
  armarReporteHifa,
  elegir,
  leerGuardado,
  reducir,
  textoParaCopiarHifa,
  type Estado,
} from "./estado";

describe("guion", () => {
  it("saluda como brote de micelio y ofrece los cuatro atajos", () => {
    expect(SALUDO).toMatch(/brote de micelio digital que todavía está creciendo/);
    expect(ATAJOS.map((a) => a.etiqueta)).toEqual([
      "Tengo una idea",
      "Necesito algo",
      "Tengo una pregunta",
      "¿Qué sos?",
    ]);
  });
  it("hay varias frases por tipo y todas son honestas e invitan a imaginar", () => {
    for (const frases of Object.values(RESPUESTAS)) {
      expect(frases.length).toBeGreaterThanOrEqual(3);
      for (const f of frases) {
        expect(f).toMatch(/todavía/i);
        expect(f).toMatch(/imagin/i);
      }
    }
    for (const f of Object.values(AL_ELEGIR)) expect(f).toMatch(/imagin/i);
  });
  it("la confirmación lleva el número", () => {
    expect(alConfirmar(50)).toContain("Se lo pasé al equipo (#50)");
    expect(alConfirmar(0)).not.toContain("#");
  });
});

describe("elegir", () => {
  it("elige por el azar sin salirse de la lista", () => {
    expect(elegir(["a", "b", "c"], 0)).toBe("a");
    expect(elegir(["a", "b", "c"], 0.5)).toBe("b");
    expect(elegir(["a", "b", "c"], 0.999)).toBe("c");
    expect(elegir(["a", "b", "c"], 1)).toBe("c");
  });
});

describe("conversación", () => {
  it("arranca con el saludo", () => {
    expect(ESTADO_INICIAL.mensajes).toEqual([{ de: "hifa", texto: SALUDO }]);
  });
  it("un atajo agrega la pregunta y la respuesta, y fija el modo", () => {
    const e = reducir(ESTADO_INICIAL, { tipo: "atajo", atajo: "idea" });
    expect(e.modo).toBe("idea");
    expect(e.mensajes.slice(-2)).toEqual([
      { de: "persona", texto: "Tengo una idea" },
      { de: "hifa", texto: AL_ELEGIR.idea },
    ]);
  });
  it("¿Qué sos? no ofrece enviar nada", () => {
    const e = reducir(ESTADO_INICIAL, { tipo: "atajo", atajo: "quien" });
    expect(e.modo).toBeNull();
    expect(e.pendiente).toBeNull();
  });
  it("texto libre: responde del guion y ofrece pasarlo al equipo como idea", () => {
    const e = reducir(ESTADO_INICIAL, { tipo: "escribir", texto: "  necesito una pala ", azar: 0.5 });
    expect(e.mensajes.at(-3)).toEqual({ de: "persona", texto: "necesito una pala" });
    expect(RESPUESTAS.libre).toContain(e.mensajes.at(-2)!.texto);
    expect(e.mensajes.at(-1)!.texto).toBe("¿Querés que se lo pase al equipo de NetX?");
    expect(e.pendiente).toEqual({ tipo: "idea", texto: "necesito una pala", fase: "ofrecido" });
  });
  it("una pregunta se pasa como tipo pregunta y una necesidad como idea", () => {
    const p = reducir(reducir(ESTADO_INICIAL, { tipo: "atajo", atajo: "pregunta" }), {
      tipo: "escribir",
      texto: "¿Cuándo abre?",
      azar: 0,
    });
    expect(p.pendiente?.tipo).toBe("pregunta");
    const n = reducir(reducir(ESTADO_INICIAL, { tipo: "atajo", atajo: "necesidad" }), {
      tipo: "escribir",
      texto: "una pala",
      azar: 0,
    });
    expect(n.pendiente).toMatchObject({ tipo: "idea", texto: "Necesito: una pala" });
  });
  it("ignora el texto vacío", () => {
    expect(reducir(ESTADO_INICIAL, { tipo: "escribir", texto: "   ", azar: 0 })).toBe(ESTADO_INICIAL);
  });
  it("aceptar, enviar y confirmar con el número", () => {
    let e = reducir(ESTADO_INICIAL, { tipo: "escribir", texto: "una idea", azar: 0 });
    e = reducir(e, { tipo: "decidir", enviar: true });
    expect(e.pendiente?.fase).toBe("enviando");
    e = reducir(e, { tipo: "envio-ok", numero: 50 });
    expect(e.pendiente).toBeNull();
    expect(e.mensajes.at(-1)!.texto).toContain("Se lo pasé al equipo (#50)");
  });
  it("si falla, queda para copiar o reintentar", () => {
    let e = reducir(ESTADO_INICIAL, { tipo: "escribir", texto: "una idea", azar: 0 });
    e = reducir(e, { tipo: "decidir", enviar: true });
    e = reducir(e, { tipo: "envio-fallo" });
    expect(e.pendiente?.fase).toBe("fallo");
    expect(textoParaCopiarHifa(e.pendiente!)).toBe("[idea] una idea");
    e = reducir(e, { tipo: "decidir", enviar: true });
    expect(e.pendiente?.fase).toBe("enviando");
  });
  it("rechazar no envía", () => {
    let e = reducir(ESTADO_INICIAL, { tipo: "escribir", texto: "una idea", azar: 0 });
    e = reducir(e, { tipo: "decidir", enviar: false });
    expect(e.pendiente).toBeNull();
  });
  it("borrar vuelve al saludo", () => {
    const e = reducir(ESTADO_INICIAL, { tipo: "escribir", texto: "hola", azar: 0 });
    expect(reducir(e, { tipo: "borrar" })).toEqual(ESTADO_INICIAL);
  });
});

describe("reporte", () => {
  it("el cuerpo armado pasa la validación de /api/reportes", () => {
    const cuerpo = armarReporteHifa({ tipo: "idea", texto: "una pala", fase: "enviando" }, CONTEXTO_VACIO);
    expect(validarReporte(cuerpo).ok).toBe(true);
  });
});

describe("leerGuardado", () => {
  it("vuelve al inicio ante datos raros", () => {
    expect(leerGuardado(null)).toBe(ESTADO_INICIAL);
    expect(leerGuardado("no es json")).toBe(ESTADO_INICIAL);
    expect(leerGuardado('{"mensajes":[{"de":"x","texto":"a"}]}')).toBe(ESTADO_INICIAL);
  });
  it("recupera lo guardado y trata un envío a medias como fallido", () => {
    const e: Estado = {
      mensajes: [{ de: "persona", texto: "hola" }],
      modo: "idea",
      pendiente: { tipo: "idea", texto: "hola", fase: "enviando" },
    };
    const l = leerGuardado(JSON.stringify(e));
    expect(l.mensajes).toEqual(e.mensajes);
    expect(l.pendiente?.fase).toBe("fallo");
  });
});
