import { describe, expect, it } from "vitest";
import { textos } from "@/lib/idioma/textos";
import { DECISIONES_BASE } from "@/lib/fogon/datos";
import { buscarNodo, construirHolarquia, hijosDe, recorrer, type NodoContenedor, type NodoH } from "./holarquia";
import {
  decisiones,
  leyendaDe,
  LENTES_PURAS,
  marcasDe,
  pinturasDe,
  PROPOSITOS,
  resolverTexto,
  TOKEN_DE_PROPOSITO,
  type ContextoLente,
  type LentePura,
  type Pintura,
} from "./lentes";

const raiz = construirHolarquia("es");
const nodos: NodoH[] = [];
recorrer(raiz, (n) => nodos.push(n));
const ctx: ContextoLente = { raiz, foco: raiz, seleccion: null, idioma: "es", decision: null, mios: [] };
const ctxDecision = (id: string): ContextoLente => ({ ...ctx, decision: DECISIONES_BASE.find((d) => d.id === id) ?? null });

describe("lentes", () => {
  it("son cuatro, en este orden", () => {
    expect(LENTES_PURAS.map((l) => l.id)).toEqual(["estructura", "propositos", "decisiones", "desdeMi"]);
  });

  it("cada propósito tiene token y texto en los dos idiomas", () => {
    for (const p of PROPOSITOS) {
      expect(TOKEN_DE_PROPOSITO[p].relleno).toBeTruthy();
      expect(TOKEN_DE_PROPOSITO[p].borde).toBeTruthy();
      for (const idioma of ["es", "en"] as const) {
        expect(resolverTexto(textos("gobernanza", idioma), `propositos.${p}`), `${idioma} ${p}`).toBeTruthy();
      }
    }
  });

  it("ninguna entrada de leyenda queda sin texto, en los dos idiomas", () => {
    for (const lente of LENTES_PURAS) {
      for (const idioma of ["es", "en"] as const) {
        const tx = textos("gobernanza", idioma);
        expect(resolverTexto(tx, lente.nombre), `${lente.id} nombre`).toBeTruthy();
        for (const e of leyendaDe(LENTES_PURAS, lente.id, ctx)) {
          expect(resolverTexto(tx, e.texto), `${idioma} ${lente.id} ${e.texto}`).toBeTruthy();
        }
      }
    }
  });

  it("Propósitos pinta cada círculo según su propósito", () => {
    const banco = buscarNodo(raiz, "semilla-0")!;
    const p = pinturasDe(LENTES_PURAS, "propositos", nodos, ctx).get(banco.id)!;
    expect(p.borde).toBe(TOKEN_DE_PROPOSITO.tierra.borde);
    const agua = buscarNodo(raiz, "comun-agua")!;
    expect(pinturasDe(LENTES_PURAS, "propositos", nodos, ctx).get(agua.id)!.borde).toBe("blue");
  });

  it("todo círculo de ejemplo tiene propósito y 'Decide sobre'", () => {
    for (const n of nodos) {
      if (n.tipo !== "circulo") continue;
      expect((n as NodoContenedor).proposito, n.id).not.toBeNull();
      expect((n as NodoContenedor).decide.length, n.id).toBeGreaterThan(0);
    }
  });

  it("Decisiones marca el camino numerado en orden y deja el borde grueso", () => {
    const c = ctxDecision("consejo-bomba");
    const marcas = marcasDe(LENTES_PURAS, "decisiones", c);
    expect(marcas).toEqual([
      { nodoId: "valle-0", texto: "1" },
      { nodoId: "valle", texto: "2" },
      { nodoId: "consejo", texto: "3" },
      { nodoId: "lighthouse", texto: "4" },
    ]);
    const p = pinturasDe(LENTES_PURAS, "decisiones", nodos, c);
    expect(p.get("valle")!.grosor).toBe(3);
    expect(p.get("valle")!.borde).toBe("gold");
    expect(p.get("semilla")!.grosor).not.toBe(3);
  });

  it("Decisiones sin decisión elegida no marca nada", () => {
    expect(marcasDe(LENTES_PURAS, "decisiones", ctx)).toEqual([]);
  });

  it("Desde mí marca los lugares y las personas 'Vos'", () => {
    const c: ContextoLente = { ...ctx, mios: [{ nodoId: "valle-0", rol: "enlace-arriba", ejemplo: true }] };
    const p = pinturasDe(LENTES_PURAS, "desdeMi", nodos, c);
    expect(p.get("valle-0")!.grosor).toBe(3);
    expect(p.get("semilla-0")!.grosor).not.toBe(3);
  });

  it("un id desconocido cae a la primera lente", () => {
    expect(leyendaDe(LENTES_PURAS, "no-existe", ctx)).toEqual(leyendaDe(LENTES_PURAS, "estructura", ctx));
  });
});

describe("extensibilidad", () => {
  const rareza: Pintura = { relleno: "violet-soft", borde: "rose", grosor: 1.5, punteado: true, atenuado: false };
  const lentePrueba: LentePura = {
    id: "prueba",
    nombre: "lentes.estructura",
    pintar: () => rareza,
    leyenda: () => [{ muestra: rareza, texto: "propositos.tierra", glifo: "★" }],
    marcas: (c) => [{ nodoId: c.foco.id, texto: "!" }],
  };
  const registro = [...LENTES_PURAS, lentePrueba];

  it("una lente agregada solo en el test pinta, tiene leyenda y marcas sin cambiar otro código", () => {
    expect(pinturasDe(registro, "prueba", nodos, ctx).get("valle")).toEqual(rareza);
    expect(leyendaDe(registro, "prueba", ctx)).toHaveLength(1);
    expect(marcasDe(registro, "prueba", ctx)).toEqual([{ nodoId: raiz.id, texto: "!" }]);
  });

  it("y no está en el registro real", () => {
    expect(LENTES_PURAS.map((l) => l.id)).not.toContain("prueba");
    expect(decisiones.id).toBe("decisiones");
    expect(hijosDe(raiz).length).toBeGreaterThan(0);
  });
});

describe("resolverTexto", () => {
  it("devuelve null para rutas que no son un texto", () => {
    const tx = textos("gobernanza", "es");
    expect(resolverTexto(tx, "leyenda")).toBeNull();
    expect(resolverTexto(tx, "no.existe")).toBeNull();
    expect(resolverTexto(tx, "panel.proposito")).toBeNull();
  });
});
