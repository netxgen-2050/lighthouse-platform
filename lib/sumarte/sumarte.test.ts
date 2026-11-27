import { describe, expect, it } from "vitest";
import { sumarte } from "@/lib/idioma/textos/sumarte";
import { AMIGO, BENEFICIOS_ALIADOS, FARO_PREPAGO, FILAS, FUNDADOR, miles, pasesQueQuedan, repartoDelPago } from "./datos";
import { INICIAL, leer, reducir } from "./estado";

describe("datos", () => {
  it("los planes de ejemplo", () => {
    expect(AMIGO).toEqual({ mensual: 9, anual: 90 });
    expect(FUNDADOR.precio).toBe(1500);
    expect(FUNDADOR.cupo).toBe(100);
  });
  it("el precio anual es 10 veces el mensual (2 meses gratis)", () => {
    expect(AMIGO.anual).toBe(AMIGO.mensual * 10);
  });
  it("el FARO de prepago está en borrador y no da voz", () => {
    expect(FARO_PREPAGO.borrador).toBe(true);
    expect(FARO_PREPAGO.daVoz).toBe(false);
  });
  it("cuántos pases quedan en la cohorte", () => {
    expect(pasesQueQuedan(false)).toBe(FUNDADOR.cupo - FUNDADOR.vendidos);
    expect(pasesQueQuedan(true)).toBe(FUNDADOR.cupo - FUNDADOR.vendidos - 1);
  });
  it("el reparto del pago suma lo que paga la persona", () => {
    const m = repartoDelPago("amigo", "mensual");
    expect(m.servicio + m.faro).toBe(AMIGO.mensual);
    const a = repartoDelPago("amigo", "anual");
    expect(a.servicio + a.faro).toBe(AMIGO.anual);
    const f = repartoDelPago("fundador", "anual");
    expect(f).toEqual({ servicio: FUNDADOR.precio - FARO_PREPAGO.fundadorDeUnaVez, faro: FARO_PREPAGO.fundadorDeUnaVez });
  });
  it("las filas tienen su inglés y ninguna nombra el Congreso, la Ronda 0 ni el fideicomiso", () => {
    expect(FILAS.length).toBeGreaterThan(0);
    for (const f of FILAS) {
      expect(f.texto.en?.trim(), f.texto.es).toBeTruthy();
      for (const texto of [f.texto.es, f.texto.en ?? ""]) {
        expect(texto).not.toMatch(/Congreso|Congress|Ronda 0|Round 0|fideicomiso|trust/i);
      }
    }
    for (const b of BENEFICIOS_ALIADOS) expect(b.en?.trim()).toBeTruthy();
  });
  it("la bitácora, las sesiones y el cupo de eventos figuran como próximamente", () => {
    const pronto = FILAS.filter((f) => f.incluye[1] === "pronto").map((f) => f.texto.es);
    expect(pronto.some((x) => /Bitácora/.test(x))).toBe(true);
    expect(pronto.some((x) => /sesión/.test(x))).toBe(true);
  });
  it("formatea miles con punto", () => {
    expect(miles(46000)).toBe("46.000");
    expect(miles(1500)).toBe("1.500");
    expect(miles(300)).toBe("300");
  });
});

describe("textos de Sumarte", () => {
  const PROHIBIDAS = {
    es: /inversi[oó]n|retorno|rendimiento|de por vida/i,
    en: /investment|return on|\breturns?\b|yield|lifetime|for life/i,
  };
  // El texto de `invertir` y los avisos de nivel viven en otras secciones: acá se revisan los planes, el FARO y la bajada.
  function textosDePlanes(idioma: "es" | "en"): string[] {
    const t = sumarte[idioma];
    return JSON.stringify({ pagina: t.pagina, caminos: t.caminos, selector: t.selector, planes: t.planes, faro: t.faro, aliados: t.aliados })
      .split('"')
      .filter((s) => s.length > 3);
  }
  for (const idioma of ["es", "en"] as const) {
    it(`ninguna palabra de inversión, retorno, rendimiento ni "de por vida" en los planes (${idioma})`, () => {
      for (const s of textosDePlanes(idioma)) expect(s).not.toMatch(PROHIBIDAS[idioma]);
      for (const f of FILAS) expect(f.texto[idioma] ?? "").not.toMatch(PROHIBIDAS[idioma]);
    });
  }
  it("la bajada dice que el pago es simulado, no que todo lo es", () => {
    expect(sumarte.es.pagina.intro).toMatch(/pago es simulado/i);
    expect(sumarte.es.pagina.intro).not.toMatch(/todo lo que elijas/i);
  });
  it("no queda ningún plan del modelo anterior", () => {
    const todo = JSON.stringify([sumarte.es.selector, sumarte.es.planes, sumarte.es.faro, sumarte.es.caminos]);
    expect(todo).not.toMatch(/Semilla|Brote|Ra[ií]z|Plan Tribu|Miembro de la red/);
  });
});

describe("estado", () => {
  it("arranca como Explorador, anual, sin Fundador", () => {
    expect(INICIAL).toMatchObject({ plan: "explorador", facturacion: "anual", pase: null });
  });
  it("cambia la facturación", () => {
    expect(reducir(INICIAL, { tipo: "facturacion", facturacion: "mensual" }).facturacion).toBe("mensual");
  });
  it("activar el Fundador incluye Amigo y volver a Explorador (darse de baja) lo deshace", () => {
    const a = reducir(INICIAL, { tipo: "pase" });
    expect(a.pase).toBe("fundador");
    expect(a.plan).toBe("miembro");
    expect(reducir(a, { tipo: "plan", plan: "explorador" })).toMatchObject({ plan: "explorador", pase: null });
  });
  it("Amigo se da de baja y vuelve a Explorador", () => {
    const amigo = reducir(INICIAL, { tipo: "plan", plan: "miembro" });
    expect(amigo.plan).toBe("miembro");
    expect(reducir(amigo, { tipo: "plan", plan: "explorador" }).plan).toBe("explorador");
  });
  it("pedido de Aliados", () => {
    expect(reducir(INICIAL, { tipo: "charla" }).charla).toBe(true);
  });
  it("leer tolera basura", () => {
    expect(leer(null)).toEqual(INICIAL);
    expect(leer("{no json")).toEqual(INICIAL);
    expect(leer(JSON.stringify({ pase: "oro", plan: 3 }))).toEqual(INICIAL);
  });
});

describe("migración del estado guardado", () => {
  it("un pase Semilla, Brote o Raíz del modelo anterior pasa a Fundador", () => {
    for (const pase of ["semilla", "brote", "raiz"]) {
      const e = leer(JSON.stringify({ plan: "miembro", pase, nivelPase: pase, facturacion: "mensual" }));
      expect(e).toMatchObject({ plan: "miembro", pase: "fundador", facturacion: "mensual" });
      expect(e).not.toHaveProperty("nivelPase");
    }
  });
  it("un pase sin plan guardado también cuenta como Amigo", () => {
    expect(leer(JSON.stringify({ pase: "raiz" }))).toMatchObject({ plan: "miembro", pase: "fundador" });
  });
  it("el Plan Tribu (tribu: true) pasa a Aliado y conserva la tribu que ya tenía guardada", () => {
    expect(leer(JSON.stringify({ plan: "miembro", tribu: true, tribuId: "valle" }))).toMatchObject({ plan: "miembro", tribu: true, tribuId: "valle" });
    expect(leer(JSON.stringify({ tribu: true }))).toMatchObject({ plan: "miembro", tribu: true, tribuId: null });
  });
  it("una tribu guardada sin Plan Tribu no cuenta", () => {
    expect(leer(JSON.stringify({ plan: "miembro", tribuId: "valle" }))).toMatchObject({ tribu: false, tribuId: null });
  });
  it("Miembro sin pase queda como Amigo y Explorador como Explorador", () => {
    expect(leer(JSON.stringify({ plan: "miembro" })).plan).toBe("miembro");
    expect(leer(JSON.stringify({ plan: "explorador" })).plan).toBe("explorador");
  });
  it("lo ya migrado se lee igual", () => {
    const e = reducir(INICIAL, { tipo: "pase" });
    expect(leer(JSON.stringify(e))).toEqual(e);
  });
});
