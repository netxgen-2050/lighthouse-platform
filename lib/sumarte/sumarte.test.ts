import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { COHORT, EMISION, FILAS, MEMBRESIA, miles, PASSES, PLAN_TRIBU } from "./datos";
import { INICIAL, leer, reducir } from "./estado";

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
    for (const f of FILAS) expect(mock).toContain(`["${f.texto.es}",`);
  });
  it("todas las filas tienen su inglés", () => {
    for (const f of FILAS) expect(f.texto.en?.trim(), f.texto.es).toBeTruthy();
  });
  it("el precio anual es 10 veces el mensual (2 meses gratis)", () => {
    expect(MEMBRESIA.anual).toBe(MEMBRESIA.mensual * 10);
    expect(PLAN_TRIBU.anual).toBe(PLAN_TRIBU.mensual * 10);
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
  it("el pedido de Plan Tribu se guarda y se lee", () => {
    const t = reducir(INICIAL, { tipo: "tribu" });
    expect(t.tribu).toBe(true);
    expect(leer(JSON.stringify(t)).tribu).toBe(true);
  });
  it("el Plan Tribu guarda la tribu elegida y cambiar de plan la quita", () => {
    const t = reducir(INICIAL, { tipo: "tribu", tribuId: "valle" });
    expect(t).toMatchObject({ plan: "miembro", tribu: true, tribuId: "valle" });
    expect(leer(JSON.stringify(t))).toMatchObject({ tribu: true, tribuId: "valle" });
    expect(reducir(t, { tipo: "plan", plan: "miembro" })).toMatchObject({ tribu: false, tribuId: null });
    expect(reducir(t, { tipo: "plan", plan: "explorador" })).toMatchObject({ plan: "explorador", tribu: false, tribuId: null });
  });
  it("leer tolera basura", () => {
    expect(leer(null)).toEqual(INICIAL);
    expect(leer("{no json")).toEqual(INICIAL);
    expect(leer(JSON.stringify({ pase: "oro", plan: 3 }))).toEqual(INICIAL);
    expect(leer(JSON.stringify({ ...INICIAL, pase: "raiz", plan: "miembro" })).pase).toBe("raiz");
  });
});
