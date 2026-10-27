// Registro de lentes (parte pura). Una lente dice cómo se pinta cada nodo, qué muestra su leyenda y, si quiere, qué marcas
// numeradas dibuja. Sumar una lente es agregar una entrada a `LENTES` (y sus textos al diccionario); el dibujo, la
// leyenda y la barra de lentes no conocen ninguna por nombre. Los paneles (React) se suman en
// `app/fogon/gobernanza/lentes/`.
import type { Decision } from "@/lib/fogon/datos";
import type { Idioma } from "@/lib/idioma/tipos";
import { caminoDe, caminoEnArbol } from "./caminos";
import { caminoHasta, type LugarMio, type NodoContenedor, type NodoH } from "./holarquia";
import type { Proposito } from "./tipos";

/** Nombres de los tokens del tema: el dibujo los traduce a `var(--color-…)`. Ninguna lente puede meter un color suelto. */
export type TokenColor =
  | "surface"
  | "surface-2"
  | "ink"
  | "muted"
  | "faint"
  | "deep"
  | "green"
  | "green-soft"
  | "gold"
  | "gold-soft"
  | "blue"
  | "blue-soft"
  | "violet"
  | "violet-soft"
  | "rose"
  | "rose-soft"
  | "gray";

export type Pintura = {
  relleno: TokenColor | "ninguno";
  borde: TokenColor | "ninguno";
  grosor: 1 | 1.5 | 3;
  punteado: boolean;
  atenuado: boolean;
};

/** Ruta de un texto dentro del diccionario `gobernanza` (por ejemplo "propositos.tierra"). */
export type ClaveTexto = string;

export type EntradaLeyenda = { muestra: Pintura; texto: ClaveTexto; glifo?: string };
export type Marca = { nodoId: string; texto: string };

export type ContextoLente = {
  raiz: NodoH;
  foco: NodoH;
  seleccion: string | null;
  idioma: Idioma;
  /** La decisión elegida en la lente Decisiones (ya resuelta), si hay. */
  decision: Decision | null;
  /** Dónde participa la persona (lente Desde mí). Se lee después de montar. */
  mios: readonly LugarMio[];
};

export type LentePura = {
  id: string;
  nombre: ClaveTexto;
  pintar(nodo: NodoH, ctx: ContextoLente): Pintura;
  leyenda(ctx: ContextoLente): EntradaLeyenda[];
  marcas?(ctx: ContextoLente): Marca[];
};

const PINTURA_BASE: Pintura = { relleno: "surface", borde: "faint", grosor: 1, punteado: false, atenuado: false };

export const TOKEN_DE_PROPOSITO: Record<Proposito, { relleno: TokenColor; borde: TokenColor }> = {
  tierra: { relleno: "green-soft", borde: "green" },
  agua: { relleno: "blue-soft", borde: "blue" },
  economia: { relleno: "gold-soft", borde: "gold" },
  comunidad: { relleno: "rose-soft", borde: "rose" },
  conocimiento: { relleno: "violet-soft", borde: "violet" },
  gobierno: { relleno: "surface-2", borde: "deep" },
};

export const PROPOSITOS: readonly Proposito[] = ["tierra", "agua", "economia", "comunidad", "conocimiento", "gobierno"];

function esContenedor(n: NodoH): n is NodoContenedor {
  return n.tipo === "comun" || n.tipo === "consejo" || n.tipo === "tribu" || n.tipo === "circulo";
}

/** Pintura de la estructura: la que usan las demás lentes de base. */
function pintarEstructura(n: NodoH): Pintura {
  switch (n.tipo) {
    case "comun":
      return { ...PINTURA_BASE, relleno: "green-soft", borde: "green" };
    case "consejo":
      return { ...PINTURA_BASE, relleno: "gold-soft", borde: "gold", grosor: 1.5 };
    case "tribu":
      if (n.estado === "activa") return { ...PINTURA_BASE, borde: "green", grosor: 1.5 };
      return { ...PINTURA_BASE, borde: n.estado === "formacion" ? "green" : "gray", grosor: 1.5, punteado: true };
    case "circulo":
      return PINTURA_BASE;
    case "rol":
      return { ...PINTURA_BASE, relleno: "surface-2", borde: "muted" };
    case "lugar":
      return { ...PINTURA_BASE, relleno: "gold-soft", borde: "gold" };
    case "lugar-libre":
      return { ...PINTURA_BASE, borde: "gray", punteado: true };
  }
}

const L = (relleno: Pintura["relleno"], borde: Pintura["borde"], punteado = false, grosor: Pintura["grosor"] = 1.5): Pintura => ({
  relleno,
  borde,
  grosor,
  punteado,
  atenuado: false,
});

export const estructura: LentePura = {
  id: "estructura",
  nombre: "lentes.estructura",
  pintar: (n) => pintarEstructura(n),
  leyenda: () => [
    { muestra: L("green-soft", "green"), texto: "leyenda.estructura.comun" },
    { muestra: L("surface", "green"), texto: "leyenda.estructura.tribuActiva", glifo: "●" },
    { muestra: L("surface", "green", true), texto: "leyenda.estructura.tribuFormacion", glifo: "◐" },
    { muestra: L("surface", "gray", true), texto: "leyenda.estructura.tribuVacante", glifo: "○" },
    { muestra: L("gold-soft", "gold"), texto: "leyenda.estructura.consejo" },
    { muestra: L("surface", "faint", false, 1), texto: "leyenda.estructura.circulo" },
    { muestra: L("surface-2", "muted", false, 1), texto: "leyenda.estructura.persona" },
  ],
};

/** El propósito de un nodo o, para una persona, el de su círculo. */
function propositoDe(n: NodoH, ctx: ContextoLente): Proposito | null {
  if (n.tipo === "rol") {
    const camino = caminoHasta(ctx.raiz, n.id);
    const circulo = camino[camino.length - 2];
    return circulo && esContenedor(circulo) ? circulo.proposito : null;
  }
  return esContenedor(n) && n.tipo === "circulo" ? n.proposito : null;
}

export const propositos: LentePura = {
  id: "propositos",
  nombre: "lentes.propositos",
  pintar(n, ctx) {
    const p = propositoDe(n, ctx);
    if (!p) return pintarEstructura(n);
    const t = TOKEN_DE_PROPOSITO[p];
    return { ...PINTURA_BASE, relleno: t.relleno, borde: t.borde, grosor: n.tipo === "rol" ? 1 : 1.5 };
  },
  leyenda: () =>
    PROPOSITOS.map((p) => ({
      muestra: L(TOKEN_DE_PROPOSITO[p].relleno, TOKEN_DE_PROPOSITO[p].borde),
      texto: `propositos.${p}`,
    })),
};

/** Los ids del camino de la decisión elegida que existen en el árbol (en orden). */
function caminoElegido(ctx: ContextoLente): string[] {
  if (!ctx.decision) return [];
  const c = caminoDe(ctx.decision);
  return c ? caminoEnArbol(ctx.raiz, c.camino) : [];
}

export const decisiones: LentePura = {
  id: "decisiones",
  nombre: "lentes.decisiones",
  pintar(n, ctx) {
    const base = pintarEstructura(n);
    if (!ctx.decision) return base;
    const camino = caminoElegido(ctx);
    if (camino.includes(n.id)) return { ...base, borde: "gold", grosor: 3 };
    return { ...base, atenuado: n.tipo === "rol" };
  },
  leyenda: () => [
    { muestra: L("surface", "gold", false, 3), texto: "leyenda.decisiones.camino", glifo: "1 2 3" },
    { muestra: L("surface", "faint", false, 1), texto: "leyenda.decisiones.fuera" },
  ],
  marcas: (ctx) => caminoElegido(ctx).map((nodoId, i) => ({ nodoId, texto: String(i + 1) })),
};

export const desdeMi: LentePura = {
  id: "desdeMi",
  nombre: "lentes.desdeMi",
  pintar(n, ctx) {
    const base = pintarEstructura(n);
    const mio = ctx.mios.some((m) => m.nodoId === n.id) || (n.tipo === "rol" && n.esYo);
    if (mio) return { ...base, borde: "gold", grosor: 3 };
    return { ...base, atenuado: n.tipo === "rol" };
  },
  leyenda: () => [
    { muestra: L("surface", "gold", false, 3), texto: "leyenda.desdeMi.mio" },
    { muestra: L("surface", "faint", false, 1), texto: "leyenda.desdeMi.otro" },
  ],
};

/** Las lentes puras en el orden de la barra. La página real las completa con sus paneles. */
export const LENTES_PURAS: readonly LentePura[] = [estructura, propositos, decisiones, desdeMi];

function buscar<T extends { id: string }>(lentes: readonly T[], id: string): T {
  return lentes.find((l) => l.id === id) ?? lentes[0];
}

export function pinturasDe(lentes: readonly LentePura[], lenteId: string, nodos: readonly NodoH[], ctx: ContextoLente): Map<string, Pintura> {
  const lente = buscar(lentes, lenteId);
  return new Map(nodos.map((n) => [n.id, lente.pintar(n, ctx)]));
}

export function leyendaDe(lentes: readonly LentePura[], lenteId: string, ctx: ContextoLente): EntradaLeyenda[] {
  return buscar(lentes, lenteId).leyenda(ctx);
}

export function marcasDe(lentes: readonly LentePura[], lenteId: string, ctx: ContextoLente): Marca[] {
  return buscar(lentes, lenteId).marcas?.(ctx) ?? [];
}

/** El texto de una clave del diccionario (`a.b.c`), o null si no existe o no es un texto. */
export function resolverTexto(diccionario: unknown, clave: ClaveTexto): string | null {
  let actual: unknown = diccionario;
  for (const parte of clave.split(".")) {
    if (typeof actual !== "object" || actual === null || !(parte in actual)) return null;
    actual = (actual as Record<string, unknown>)[parte];
  }
  return typeof actual === "string" && actual.trim() !== "" ? actual : null;
}
