import { describe, expect, it } from "vitest";
import { comunidadesDondeEsMiembro, estadoDe, leer, reducir, INICIAL } from "./estado";

describe("membresía simulada", () => {
  it("arranca sin ser miembro de nada", () => {
    expect(estadoDe(INICIAL, "valle")).toBe("no-miembro");
    expect(comunidadesDondeEsMiembro(INICIAL)).toEqual([]);
  });

  it("adherir deja el pedido enviado y aceptar lo vuelve membresía", () => {
    const pedido = reducir(INICIAL, { tipo: "adherir", comunidad: "valle" });
    expect(estadoDe(pedido, "valle")).toBe("pedido");
    const miembro = reducir(pedido, { tipo: "aceptar", comunidad: "valle" });
    expect(estadoDe(miembro, "valle")).toBe("miembro");
  });

  it("es por comunidad: ser miembro de Valle no lo es de otras", () => {
    let m = reducir(INICIAL, { tipo: "adherir", comunidad: "valle" });
    m = reducir(m, { tipo: "aceptar", comunidad: "valle" });
    expect(estadoDe(m, "taller")).toBe("no-miembro");
    expect(estadoDe(m, "lighthouse")).toBe("no-miembro");
    expect(comunidadesDondeEsMiembro(m)).toEqual(["valle"]);
  });

  it("no se acepta sin pedido ni se pisa una membresía", () => {
    expect(reducir(INICIAL, { tipo: "aceptar", comunidad: "valle" })).toEqual(INICIAL);
    const m = reducir(reducir(INICIAL, { tipo: "adherir", comunidad: "valle" }), { tipo: "aceptar", comunidad: "valle" });
    expect(reducir(m, { tipo: "adherir", comunidad: "valle" })).toEqual(m);
  });

  it("la lista de comunidades deja afuera los pedidos", () => {
    let m = reducir(INICIAL, { tipo: "adherir", comunidad: "valle" });
    m = reducir(m, { tipo: "adherir", comunidad: "lighthouse" });
    m = reducir(m, { tipo: "aceptar", comunidad: "lighthouse" });
    expect(comunidadesDondeEsMiembro(m)).toEqual(["lighthouse"]);
  });

  it("lee lo guardado y descarta lo raro", () => {
    expect(leer(null)).toEqual({});
    expect(leer("no es json")).toEqual({});
    expect(leer("[1,2]")).toEqual({});
    expect(leer(JSON.stringify({ valle: "miembro", taller: "pedido", raro: "dueño", otro: 3 }))).toEqual({
      valle: "miembro",
      taller: "pedido",
    });
  });

  it("una clave heredada como 'constructor' no cuenta como membresía", () => {
    expect(estadoDe(INICIAL, "constructor")).toBe("no-miembro");
  });
});
