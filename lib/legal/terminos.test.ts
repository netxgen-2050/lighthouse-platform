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
        "adhesiongobernanza",
        "adherente",
        "agencia",
        "avisosimulador",
        "bitacora",
        "art32",
        "art35",
        "art44",
        "caja",
        "calificado",
        "chacra",
        "circulo",
        "circulotrabajo",
        "compromisominimo",
        "consejo",
        "representante",
        "validacioncomun",
        "consultivo",
        "constanciaSemillas",
        "evaluacionPares",
        "contacto",
        "creditos",
        "datos",
        "dobleenlace",
        "derechostierra",
        "dominio",
        "encuentroeducativo",
        "espejo",
        "estatuto",
        "fidasamblea",
        "fundaciontierra",
        "gobernanzafideicomiso",
        "guardian",
        "hacienda",
        "inversorexterior",
        "kyc",
        "licencia",
        "loteo",
        "manifiestovrn",
        "membresia",
        "notasverdes",
        "obra",
        "ordenanza173",
        "pactoDosPartes",
        "pactopuntual",
        "pacto",
        "pase",
        "pasaporte",
        "pasefundador",
        "personeria",
        "plantribu",
        "presencia",
        "primeraperdida",
        "remoto",
        "ribera",
        "ritual",
        "ronda0",
        "safe",
        "safu",
        "semillas",
        "seriemadre",
        "serieprograma",
        "sumarte",
        "ticket",
        "transferencia",
        "unidadesregeneracion",
      ].sort(),
    );
  });
  it("los términos del simulador de series son borrador", () => {
    for (const clave of [
      "avisosimulador",
      "unidadesregeneracion",
      "notasverdes",
      "primeraperdida",
      "safu",
      "serieprograma",
    ] as const) {
      expect(esBorrador(clave), clave).toBe(true);
    }
    expect(TERMINOS.avisosimulador.texto).toBe(
      "Prototipo interno · valores de partida, no son una oferta ni un pronóstico · el diseño legal no lo revisó un abogado",
    );
  });
  it("los términos de la gobernanza fractal son borrador, con inglés, y avisan que el reglamento falta", () => {
    for (const clave of ["circulotrabajo", "consejo", "representante", "validacioncomun", "dobleenlace", "dominio"] as const) {
      expect(esBorrador(clave), clave).toBe(true);
      expect(terminoEn(clave)?.texto.trim(), clave).toBeTruthy();
      expect(TERMINOS[clave].texto, clave).toMatch(/todavía|no existe/);
    }
  });
  it("los términos del manifiesto de Lighthouse VRN son borrador, con inglés; derechostierra dice que no es texto jurídico", () => {
    for (const clave of ["manifiestovrn", "derechostierra", "adhesiongobernanza"] as const) {
      expect(esBorrador(clave), clave).toBe(true);
      expect(terminoEn(clave)?.texto.trim(), clave).toBeTruthy();
    }
    expect(TERMINOS.derechostierra.texto).toContain("Declaración Universal de los Derechos de la Madre Tierra");
    expect(TERMINOS.derechostierra.texto).toMatch(/no son un texto jurídico/);
    expect(TERMINOS.manifiestovrn.texto).toMatch(/borrador/);
    expect(TERMINOS.adhesion.texto).toContain("Lighthouse VRN");
  });

  it("pactoDosPartes es borrador, tiene inglés y aclara que no es un contrato de trabajo ni de inversión", () => {
    expect(esBorrador("pactoDosPartes")).toBe(true);
    expect(terminoEn("pactoDosPartes")?.titulo).toBe("Pact accepted by both parties");
    expect(TERMINOS.pactoDosPartes.texto).toMatch(/no es un contrato de trabajo ni de inversión/i);
  });

  it("pactopuntual es borrador, tiene inglés y aclara que no es un contrato de trabajo, sin horario impuesto ni pago en dinero", () => {
    expect(esBorrador("pactopuntual")).toBe(true);
    expect(terminoEn("pactopuntual")?.titulo).toBe("One-off pact");
    const texto = TERMINOS.pactopuntual.texto;
    expect(texto).toMatch(/No es un contrato de trabajo/);
    expect(texto).toMatch(/horario impuesto/);
    expect(texto).toMatch(/no hay pago en dinero/);
    expect(texto).toMatch(/Semillas, que no son un sueldo/);
    expect(texto).not.toMatch(/brote|germin/i);
  });

  it("compromisominimo es borrador, tiene inglés y aclara que no es un contrato de trabajo ni un período de prueba y que se puede dejar avisando", () => {
    expect(esBorrador("compromisominimo")).toBe(true);
    expect(terminoEn("compromisominimo")?.titulo).toBe("Minimum commitment");
    const texto = TERMINOS.compromisominimo.texto;
    expect(texto).toMatch(/no es un contrato de trabajo ni un período de prueba/);
    expect(texto).toMatch(/horario impuesto/);
    expect(texto).toMatch(/pago en dinero/);
    expect(texto).toMatch(/dejarlo antes avisando/);
    expect(texto).toMatch(/Semillas pendientes/);
    expect(texto).toMatch(/Las Semillas no son un sueldo/);
    expect(texto + terminoEn("compromisominimo")?.texto).not.toMatch(/brote|germin|sprout/i);
    expect(terminoEn("compromisominimo")?.texto).toMatch(/not an employment contract or a probationary period/);
  });

  it("ordenanza173 es borrador y dice que se verifica con abogado", () => {
    expect(esBorrador("ordenanza173")).toBe(true);
    expect(TERMINOS.ordenanza173.texto).toContain("en el Juego B");
    expect(TERMINOS.ordenanza173.texto).toContain("A verificar con abogado");
    expect(TERMINOS.ordenanza173.texto).not.toContain("diseño B");
  });
  it("seriemadre y fundaciontierra son borrador y la Fundación se verifica con abogado", () => {
    expect(esBorrador("seriemadre")).toBe(true);
    expect(esBorrador("fundaciontierra")).toBe(true);
    expect(TERMINOS.fundaciontierra.texto.startsWith("En el Juego B")).toBe(true);
    expect(TERMINOS.fundaciontierra.texto).toContain("a verificar con abogado");
    expect(TERMINOS.fundaciontierra.texto).not.toContain("diseño B");
  });
  it("encuentroeducativo es borrador", () => {
    expect(esBorrador("encuentroeducativo")).toBe(true);
  });
  it("consultivo es borrador", () => {
    expect(esBorrador("consultivo")).toBe(true);
    expect(TERMINOS.consultivo.frase).toBe(
      "El resultado es consultivo: no reemplaza las decisiones que reservan el contrato o el estatuto.",
    );
    expect(TERMINOS.consultivo.texto).not.toBe(TERMINOS.consultivo.frase);
    expect(TERMINOS.consultivo.texto).toContain("no obliga");
    expect(TERMINOS.consultivo.texto).toContain("contrato o el estatuto");
    expect(TERMINOS.consultivo.texto).toContain("no te cuesta plata");
    expect(terminoEn("consultivo")).toBeDefined();
    expect(terminoEn("consultivo")?.texto).not.toBe(TERMINOS.consultivo.en.frase);
  });
  it("evaluacionPares y constanciaSemillas son borrador y tienen inglés", () => {
    for (const k of ["evaluacionPares", "constanciaSemillas"] as const) {
      expect(esBorrador(k)).toBe(true);
      expect(terminoEn(k)).toBeDefined();
    }
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
