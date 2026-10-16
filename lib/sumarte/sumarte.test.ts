import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COHORT, EMISION, FILAS, miles, PASSES } from "./datos";
import { esLiderDeTribu, INICIAL, leer, reducir } from "./estado";

const mock = readFileSync(path.join(__dirname, "../../docs/referencia/netx-tribus-mockup-v6.html"), "utf8");

describe("datos", () => {
  it("coinciden con el mock-up", () => {
    for (const p of PASSES) {
      expect(mock).toContain(`{id:"${p.id}", name:"${p.nombre}", price:${p.precio}, credits:${p.creditos}}`);
    }
    expect(mock).toContain(`const COHORT = {sold:${COHORT.vendidos}, cap:${COHORT.cupo}, raised:${COHORT.recaudado}, min:${COHORT.minimo}};`);
    expect(mock).toContain(
      `const EMISION = {total:${EMISION.total}, aportantes:${EMISION.aportantes}, cupo:${EMISION.cupo}, nocalif:${EMISION.noCalificados}, cupoNC:${EMISION.cupoNoCalificados}};`,
    );
  });
  it("las filas de la tabla están en el mock-up", () => {
    expect(FILAS).toHaveLength(8);
    for (const f of FILAS) expect(mock).toContain(`["${f.texto}",`);
  });
  it("formatea miles con punto", () => {
    expect(miles(46000)).toBe("46.000");
    expect(miles(1500)).toBe("1.500");
    expect(miles(300)).toBe("300");
  });
});

describe("estado", () => {
  it("arranca como Explorador, anual, Brote", () => {
    expect(INICIAL).toMatchObject({ plan: "explorador", facturacion: "anual", nivelPase: "brote", pase: null });
  });
  it("cambia facturación y nivel", () => {
    expect(reducir(INICIAL, { tipo: "facturacion", facturacion: "mensual" }).facturacion).toBe("mensual");
    expect(reducir(INICIAL, { tipo: "nivel", nivel: "raiz" }).nivelPase).toBe("raiz");
  });
  it("activar el pase usa el nivel elegido y volver a Explorador lo deshace", () => {
    const a = reducir(reducir(INICIAL, { tipo: "nivel", nivel: "semilla" }), { tipo: "pase" });
    expect(a.pase).toBe("semilla");
    expect(a.plan).toBe("miembro");
    expect(reducir(a, { tipo: "plan", plan: "explorador" })).toMatchObject({ plan: "explorador", pase: null });
  });
  it("invitación y charla", () => {
    expect(reducir(INICIAL, { tipo: "invitacion" }).invitacion).toBe(true);
    expect(reducir(INICIAL, { tipo: "charla" }).charla).toBe(true);
  });
  it("con pase activo el nivel no cambia", () => {
    const a = reducir(INICIAL, { tipo: "pase" });
    expect(reducir(a, { tipo: "nivel", nivel: "raiz" })).toEqual(a);
  });
  it("el pedido de Plan Tribu con tribu nueva se guarda y se lee", () => {
    const t = reducir(INICIAL, { tipo: "tribu" });
    expect(t).toMatchObject({ tribus: [], tribuNueva: true });
    expect(leer(JSON.stringify(t))).toMatchObject({ plan: "miembro", tribus: [], tribuNueva: true });
  });
  it("el Plan Tribu guarda la tribu elegida y cambiar de plan las quita", () => {
    const t = reducir(INICIAL, { tipo: "tribu", tribuId: "valle" });
    expect(t).toMatchObject({ plan: "miembro", tribus: ["valle"], tribuNueva: false });
    expect(leer(JSON.stringify(t))).toMatchObject({ tribus: ["valle"] });
    expect(reducir(t, { tipo: "plan", plan: "miembro" })).toMatchObject({ tribus: [], tribuNueva: false });
    expect(reducir(t, { tipo: "plan", plan: "explorador" })).toMatchObject({ plan: "explorador", tribus: [], tribuNueva: false });
  });
  it("lee el formato anterior de una sola tribu", () => {
    const viejo = { ...INICIAL, plan: "miembro", tribu: true, tribuId: "valle", tribus: undefined, tribuNueva: undefined };
    expect(leer(JSON.stringify(viejo))).toMatchObject({ plan: "miembro", tribus: ["valle"], tribuNueva: false });
    const nueva = { ...viejo, tribuId: null };
    expect(leer(JSON.stringify(nueva))).toMatchObject({ tribus: [], tribuNueva: true });
  });
  it("al leer se descartan ids que no son tribus activas o en formación y los repetidos", () => {
    expect(leer(JSON.stringify({ tribus: ["valle", "valle", "nadie", "grano", 4] }))).toMatchObject({ tribus: ["valle"] });
    expect(leer(JSON.stringify({ tribu: true, tribuId: "nadie" })).tribus).toEqual([]);
  });
  it("sumar otra tribu no duplica y conserva las anteriores", () => {
    const dos = reducir(reducir(INICIAL, { tipo: "tribu", tribuId: "valle" }), { tipo: "tribu", tribuId: "taller" });
    expect(dos.tribus).toEqual(["valle", "taller"]);
    expect(reducir(dos, { tipo: "tribu", tribuId: "valle" }).tribus).toEqual(["valle", "taller"]);
  });
  it("solo hay una tribu nueva pendiente", () => {
    const t = reducir(reducir(INICIAL, { tipo: "tribu" }), { tipo: "tribu" });
    expect(t.tribuNueva).toBe(true);
    expect(esLiderDeTribu(t)).toBe(true);
  });
  it("dejar una de dos deja la otra", () => {
    const dos = reducir(reducir(INICIAL, { tipo: "tribu", tribuId: "valle" }), { tipo: "tribu", tribuId: "taller" });
    expect(reducir(dos, { tipo: "dejarTribu", tribuId: "taller" }).tribus).toEqual(["valle"]);
  });
  it("dejar la última deja como Miembro y conserva el Pase", () => {
    const e = reducir(reducir(INICIAL, { tipo: "pase" }), { tipo: "tribu", tribuId: "valle" });
    const sin = reducir(e, { tipo: "dejarTribu", tribuId: "valle" });
    expect(sin).toMatchObject({ plan: "miembro", pase: "brote", tribus: [], tribuNueva: false });
    expect(esLiderDeTribu(sin)).toBe(false);
  });
  it("dejar la tribu nueva pendiente", () => {
    const e = reducir(reducir(INICIAL, { tipo: "tribu", tribuId: "valle" }), { tipo: "tribu" });
    expect(reducir(e, { tipo: "dejarTribu", tribuId: "nueva" })).toMatchObject({ tribus: ["valle"], tribuNueva: false });
  });
  it("leer tolera basura", () => {
    expect(leer(null)).toEqual(INICIAL);
    expect(leer("{no json")).toEqual(INICIAL);
    expect(leer(JSON.stringify({ pase: "oro", plan: 3 }))).toEqual(INICIAL);
    expect(leer(JSON.stringify({ ...INICIAL, pase: "raiz", plan: "miembro" })).pase).toBe("raiz");
  });
});
