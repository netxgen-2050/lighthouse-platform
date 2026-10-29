import { describe, expect, it } from "vitest";
import { confirmarPedido, estadoSumarme, leerPedidos, listarEquipos, pedir, type EntradaSumarme } from "./equipos";

describe("listarEquipos", () => {
  it("Agua, Permacultura y Contratistas van antes que Tokenomics", () => {
    const ids = listarEquipos("es").map((e) => e.circulo.id);
    const pos = (id: string) => ids.indexOf(id);
    for (const id of ["comun-agua", "comun-permacultura", "comun-contratistas"]) {
      expect(pos(id)).toBeGreaterThanOrEqual(0);
      expect(pos(id)).toBeLessThan(pos("comun-token"));
    }
  });

  it("hay un equipo por círculo del común y los que tienen más frentes van primero", () => {
    const e = listarEquipos("es");
    expect(e).toHaveLength(8);
    expect(e[0].circulo.id).toBe("comun-permacultura");
    expect(e[1].circulo.id).toBe("comun-agua");
  });

  it("separa lo de ahora de lo de una fase futura", () => {
    const c = listarEquipos("es").find((x) => x.circulo.id === "comun-contratistas")!;
    expect(c.frentesAhora.map((f) => f.id)).toEqual(["acceso-camino"]);
    expect(c.frentesDespues.map((f) => f.id)).toEqual(["primer-obrador", "parque-agrovoltaico"]);
    const f1 = listarEquipos("es", 1).find((x) => x.circulo.id === "comun-contratistas")!;
    expect(f1.frentesDespues).toEqual([]);
  });

  it("un círculo sin frentes queda con las dos listas vacías", () => {
    const t = listarEquipos("es").find((x) => x.circulo.id === "comun-token")!;
    expect(t.frentesAhora).toEqual([]);
    expect(t.frentesDespues).toEqual([]);
  });
});

describe("pedir y leerPedidos", () => {
  it("pedir es idempotente", () => {
    const una = pedir({}, "comun-agua");
    expect(una).toEqual({ "comun-agua": "pedido" });
    expect(pedir(una, "comun-agua")).toBe(una);
  });

  it("descarta ids que no son del común, como valle y __proto__", () => {
    expect(pedir({}, "valle")).toEqual({});
    expect(pedir({}, "__proto__")).toEqual({});
  });

  it("leerPedidos tolera JSON roto y descarta entrada por entrada", () => {
    expect(leerPedidos(null)).toEqual({});
    expect(leerPedidos("{roto")).toEqual({});
    expect(leerPedidos("[1]")).toEqual({});
    const crudo = '{"comun-agua":"pedido","valle":"pedido","comun-legal":"miembro","__proto__":"pedido","constructor":"pedido"}';
    const r = leerPedidos(crudo);
    expect(Object.keys(r)).toEqual(["comun-agua"]);
    expect(Object.getPrototypeOf(r)).toBe(Object.prototype);
  });
});

const ok: EntradaSumarme = { conSesion: true, puedeAdherir: true, adhirio: true, pedidos: {}, circuloId: "comun-agua" };

describe("estadoSumarme", () => {
  it("sin sesión", () => expect(estadoSumarme({ ...ok, conSesion: false }).tipo).toBe("sin-sesion"));
  it("sin capacidad", () => expect(estadoSumarme({ ...ok, puedeAdherir: false }).tipo).toBe("sin-capacidad"));
  it("sin adhesión al Lighthouse", () => expect(estadoSumarme({ ...ok, adhirio: false }).tipo).toBe("sin-adhesion"));
  it("puede", () => expect(estadoSumarme(ok).tipo).toBe("puede"));
  it("pedido", () => expect(estadoSumarme({ ...ok, pedidos: { "comun-agua": "pedido" } }).tipo).toBe("pedido"));
  it("un pedido hecho se sigue viendo aunque después baje de plan", () => {
    const x = { ...ok, puedeAdherir: false, adhirio: false, pedidos: { "comun-agua": "pedido" } as const };
    expect(estadoSumarme(x).tipo).toBe("pedido");
  });
  it("sin sesión gana sobre un pedido guardado", () => {
    expect(estadoSumarme({ ...ok, conSesion: false, pedidos: { "comun-agua": "pedido" } }).tipo).toBe("sin-sesion");
  });
});

describe("confirmarPedido", () => {
  it("sin sesión, sin capacidad o sin adhesión devuelve null", () => {
    expect(confirmarPedido({ ...ok, conSesion: false })).toBeNull();
    expect(confirmarPedido({ ...ok, puedeAdherir: false })).toBeNull();
    expect(confirmarPedido({ ...ok, adhirio: false })).toBeNull();
  });
  it("con puede devuelve el pedido", () => {
    expect(confirmarPedido(ok)).toEqual({ "comun-agua": "pedido" });
  });
  it("si ya había pedido devuelve null", () => {
    expect(confirmarPedido({ ...ok, pedidos: { "comun-agua": "pedido" } })).toBeNull();
  });
  it("un id que no es del común no escribe nada", () => {
    expect(confirmarPedido({ ...ok, circuloId: "valle" })).toBeNull();
  });
});
