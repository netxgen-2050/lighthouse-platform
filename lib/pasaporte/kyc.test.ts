import { describe, expect, it } from "vitest";
import {
  aprobarKyc,
  BORRADOR_VACIO,
  datosDesdeBorrador,
  enviarKyc,
  KYC_VACIO,
  leerKyc,
  validarPaso,
  type BorradorKyc,
} from "./kyc";

const hoy = new Date("2026-10-09T15:00:00Z");

const completo: BorradorKyc = {
  nombre: "Ana Pérez",
  documento: "30123456",
  nacimiento: "1985-03-02",
  nacionalidad: "argentina",
  paisNacionalidad: "",
  residencia: "argentina",
  paisResidencia: "",
  origenFondos: "Ahorros de mi trabajo",
  inversor: "no-calificado",
};

describe("validarPaso", () => {
  it("un borrador vacío falla en cada paso con su campo", () => {
    expect(Object.keys(validarPaso(1, BORRADOR_VACIO, hoy)).sort()).toEqual(["documento", "nacimiento", "nombre"]);
    expect(Object.keys(validarPaso(2, BORRADOR_VACIO, hoy)).sort()).toEqual(["nacionalidad", "residencia"]);
    expect(Object.keys(validarPaso(3, BORRADOR_VACIO, hoy))).toEqual(["origenFondos"]);
    expect(Object.keys(validarPaso(4, BORRADOR_VACIO, hoy))).toEqual(["inversor"]);
  });
  it("uno completo pasa todos los pasos y la revisión", () => {
    for (const p of [1, 2, 3, 4, 5]) expect(validarPaso(p, completo, hoy)).toEqual({});
  });
  it("pide el país si la nacionalidad es otra o la residencia es del exterior", () => {
    const e = validarPaso(2, { ...completo, nacionalidad: "otra", residencia: "exterior" }, hoy);
    expect(Object.keys(e).sort()).toEqual(["paisNacionalidad", "paisResidencia"]);
    expect(validarPaso(2, { ...completo, nacionalidad: "otra", paisNacionalidad: "Noruega", residencia: "exterior", paisResidencia: "Noruega" }, hoy)).toEqual({});
  });
  it("rechaza fechas imposibles, futuras y de menores", () => {
    expect(validarPaso(1, { ...completo, nacimiento: "2026-02-31" }, hoy).nacimiento).toBeTruthy();
    expect(validarPaso(1, { ...completo, nacimiento: "2030-01-01" }, hoy).nacimiento).toBeTruthy();
    expect(validarPaso(1, { ...completo, nacimiento: "2010-10-10" }, hoy).nacimiento).toContain("mayor");
    expect(validarPaso(1, { ...completo, nacimiento: "2008-10-09" }, hoy).nacimiento).toBeUndefined();
    expect(validarPaso(1, { ...completo, nacimiento: "2008-10-10" }, hoy).nacimiento).toBeTruthy();
  });
  it("el documento lleva de 6 a 12 letras o números", () => {
    expect(validarPaso(1, { ...completo, documento: "123" }, hoy).documento).toBeTruthy();
    expect(validarPaso(1, { ...completo, documento: "30.123.456" }, hoy).documento).toBeTruthy();
  });
  it("la revisión (paso 5) junta los errores de todos los pasos", () => {
    expect(Object.keys(validarPaso(5, BORRADOR_VACIO, hoy))).toHaveLength(7);
  });
});

describe("trámite", () => {
  it("enviar deja en trámite y aprobar lo aprueba", () => {
    const e = enviarKyc(hoy);
    expect(e).toEqual({ estado: "en-tramite", enviado: "2026-10-09T15:00:00.000Z" });
    expect(aprobarKyc(e, hoy)).toMatchObject({ estado: "aprobado", aprobado: "2026-10-09T15:00:00.000Z" });
  });
  it("sin trámite no se puede aprobar", () => {
    expect(aprobarKyc(KYC_VACIO, hoy)).toBe(KYC_VACIO);
  });
  it("lee lo guardado y descarta lo raro", () => {
    expect(leerKyc(null)).toEqual(KYC_VACIO);
    expect(leerKyc("roto")).toEqual(KYC_VACIO);
    expect(leerKyc(JSON.stringify({ estado: "aprobado", enviado: "x" }))).toEqual(KYC_VACIO);
    expect(leerKyc(JSON.stringify({ estado: "aprobado", enviado: "2026-10-09T10:00:00Z" }))).toEqual(KYC_VACIO);
    const ok = { estado: "aprobado", enviado: "2026-10-09T10:00:00Z", aprobado: "2026-10-09T11:00:00Z" };
    expect(leerKyc(JSON.stringify(ok))).toEqual(ok);
  });
});

describe("datosDesdeBorrador", () => {
  it("pasa a Tus datos lo que ya leen Pactos, Semillas y Fogón, y conserva la modalidad", () => {
    const d = datosDesdeBorrador({ ...completo, nacionalidad: "otra", paisNacionalidad: "Noruega", residencia: "exterior", paisResidencia: "Chile" }, { modalidad: "remoto", horas: 10 });
    expect(d).toMatchObject({ nacionalidad: "otra", paisNacionalidad: "Noruega", residencia: "exterior", paisResidencia: "Chile", inversor: "no-calificado", modalidad: "remoto", horas: 10 });
  });
  it("borra el país si vuelve a Argentina", () => {
    const d = datosDesdeBorrador(completo, { paisResidencia: "Chile" });
    expect(d.paisResidencia).toBeUndefined();
  });
});
