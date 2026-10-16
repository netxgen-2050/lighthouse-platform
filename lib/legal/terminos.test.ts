import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TERMINOS, esBorrador, terminoEn, type ClaveTermino } from "./terminos";

const mock = readFileSync(
  path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"),
  "utf8",
);

describe("catálogo legal", () => {
  it("las claves del catálogo", () => {
    expect(Object.keys(TERMINOS).sort()).toEqual(
      [
        "adhesion",
        "adherente",
        "agencia",
        "bitacora",
        "art32",
        "art35",
        "art44",
        "caja",
        "calificado",
        "chacra",
        "circulo",
        "consultivo",
        "contacto",
        "creditos",
        "datos",
        "encuentroeducativo",
        "espejo",
        "estatuto",
        "fidasamblea",
        "gobernanzafideicomiso",
        "guardian",
        "hacienda",
        "inversorexterior",
        "kyc",
        "licencia",
        "loteo",
        "membresia",
        "obra",
        "pacto",
        "pase",
        "pasaporte",
        "pasefundador",
        "personeria",
        "plantribu",
        "presencia",
        "remoto",
        "ribera",
        "ritual",
        "ronda0",
        "safe",
        "semillas",
        "sumarte",
        "ticket",
        "transferencia",
      ].sort(),
    );
  });
  it("encuentroeducativo es borrador", () => {
    expect(esBorrador("encuentroeducativo")).toBe(true);
  });
  it("consultivo es borrador", () => {
    expect(esBorrador("consultivo")).toBe(true);
  });
  it("agencia es borrador", () => {
    expect(esBorrador("agencia")).toBe(true);
    expect(esBorrador("ritual")).toBe(false);
  });
  it("loteo es borrador", () => {
    expect(esBorrador("loteo")).toBe(true);
    expect(TERMINOS.loteo.titulo).toBe("Estado del loteo");
  });
  it("contacto es borrador", () => {
    expect(esBorrador("contacto")).toBe(true);
    expect(TERMINOS.contacto.titulo).toBe("Pedir contacto");
  });
  it("bitacora es borrador", () => {
    expect(esBorrador("bitacora")).toBe(true);
    expect(TERMINOS.bitacora.titulo).toBe("Bitácora de lo que te mostramos");
  });
  it("inversorexterior es borrador", () => {
    expect(esBorrador("inversorexterior")).toBe(true);
  });
  it("gobernanzafideicomiso es borrador y dice que en la versión real lo define el contrato", () => {
    expect(esBorrador("gobernanzafideicomiso")).toBe(true);
    expect(TERMINOS.gobernanzafideicomiso.texto).toContain("contrato del fideicomiso");
  });
  it("datos y transferencia son borrador y explican en palabras simples", () => {
    expect(esBorrador("datos")).toBe(true);
    expect(esBorrador("transferencia")).toBe(true);
    expect(TERMINOS.transferencia.texto).toContain("Estados Unidos");
  });
  it("ticket, presencia, obra y encuentroeducativo tienen versión en inglés, y las demás no", () => {
    for (const clave of ["ticket", "presencia", "obra", "encuentroeducativo"] as const) {
      const en = terminoEn(clave);
      expect(en?.titulo.trim()).toBeTruthy();
      expect(en?.texto.trim()).toBeTruthy();
      expect(en?.texto).not.toBe(TERMINOS[clave].texto);
    }
    expect(terminoEn("ritual")).toBeUndefined();
  });
  for (const [clave, t] of Object.entries(TERMINOS)) {
    // Los borradores son textos nuevos que no vienen del mock-up.
    if (esBorrador(clave as ClaveTermino)) continue;
    it(`${clave} coincide con el mock-up`, () => {
      const m = mock.match(new RegExp(`^\\s*${clave}:\\["([^"]+)","([^"]+)"\\]`, "m"));
      expect(m).not.toBeNull();
      expect(t.titulo).toBe(m![1]);
      expect(t.texto).toBe(m![2]);
    });
  }
});
