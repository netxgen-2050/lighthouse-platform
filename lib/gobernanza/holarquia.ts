// La holarquía: el común, sus círculos, el consejo y las tribus con sus círculos y roles, como un solo árbol puro.
// No depende del navegador: el servidor y el cliente dibujan exactamente lo mismo (design §1).
import { textoEn, type BilingueConOriginal, type Idioma } from "@/lib/idioma/tipos";
import { listarTribus } from "@/lib/tribus/datos";
import type { EstadoTribu } from "@/lib/tribus/tipos";
import {
  CIRCULOS_DEL_COMUN,
  circulosDe,
  circulosTransversales,
  COMUN_ID,
  DECIDE_COMUN,
  DECIDE_CONSEJO,
  DECIDE_TRIBU,
  PERSONA_YO,
  PERSONAS_DE_EJEMPLO,
  personaDeRelleno,
  ROLES_CRUZADOS,
  ROLES_DE_VOS,
} from "./datos";
import { lugaresDelConsejo, validadaPorElComun } from "./registros";
import type { Circulo, Proposito, Registro, Rol } from "./tipos";

export type { Proposito, Rol } from "./tipos";

export const CONSEJO_ID = "consejo";

/** De dónde cuelga un círculo: del común, transversal (también del común) o de una tribu. */
export type ClaseCirculo = "del-comun" | "transversal" | "de-tribu";

export type NodoContenedor = {
  tipo: "comun" | "consejo" | "tribu" | "circulo";
  id: string;
  nombre: string;
  proposito: Proposito | null;
  decide: string[];
  hijos: NodoH[];
  estado?: EstadoTribu;
  validada?: boolean;
  /** Solo en los círculos. */
  clase?: ClaseCirculo;
  /** Ids de las tribus que participan (círculo transversal). */
  tribus?: string[];
  ejemplo: boolean;
};
export type NodoRol = {
  tipo: "rol";
  id: string;
  personaId: string;
  persona: string;
  rol: Rol;
  esYo: boolean;
  ejemplo: boolean;
};
export type NodoLugarLibre = { tipo: "lugar-libre"; id: string };
export type NodoLugar = { tipo: "lugar"; id: string; tribuId: string; nombre: string; representante: null };
export type NodoH = NodoContenedor | NodoRol | NodoLugarLibre | NodoLugar;

export const ORDEN_ROLES: readonly Rol[] = ["facilita", "enlace-arriba", "enlace-de-arriba", "memoria", "miembro"];

const tx = (v: BilingueConOriginal, idioma: Idioma) => textoEn(v, idioma);

/** Los hijos de un nodo (vacío para las hojas). */
export function hijosDe(n: NodoH): NodoH[] {
  return "hijos" in n ? n.hijos : [];
}

/** Recorre el árbol en orden (padre antes que hijos). */
export function recorrer(raiz: NodoH, visitar: (n: NodoH, padres: NodoH[]) => void, padres: NodoH[] = []): void {
  visitar(raiz, padres);
  for (const h of hijosDe(raiz)) recorrer(h, visitar, [...padres, raiz]);
}

export function buscarNodo(raiz: NodoH, id: string): NodoH | null {
  let hallado: NodoH | null = null;
  recorrer(raiz, (n) => {
    if (!hallado && n.id === id) hallado = n;
  });
  return hallado;
}

/** Los nodos desde la raíz hasta el pedido, incluidos los dos; vacío si el id no existe. */
export function caminoHasta(raiz: NodoH, id: string): NodoH[] {
  if (raiz.id === id) return [raiz];
  for (const h of hijosDe(raiz)) {
    const sub = caminoHasta(h, id);
    if (sub.length > 0) return [raiz, ...sub];
  }
  return [];
}

/** El nombre que se muestra de un nodo en migas y listas. */
export function nombreDe(n: NodoH, textoLugarLibre = "Lugar libre"): string {
  if (n.tipo === "rol") return n.persona;
  if (n.tipo === "lugar-libre") return textoLugarLibre;
  return n.nombre;
}

function rolesDelCirculo(circuloId: string): { personaId: string; rol: Rol }[] {
  return [...ROLES_DE_VOS, ...ROLES_CRUZADOS].filter((r) => r.circuloId === circuloId);
}

/** Construye el árbol completo en un idioma. Los registros del navegador solo cambian validaciones y lugares del consejo. */
export function construirHolarquia(idioma: Idioma, registros: readonly Registro[] = []): NodoH {
  const nombresPersona = new Map<string, string>(PERSONAS_DE_EJEMPLO.map((p) => [p.id, tx(p.nombre, idioma)]));
  let contadorRelleno = 0;
  let indiceCirculo = 0;

  function nodoCirculo(c: Circulo, clase: ClaseCirculo): NodoContenedor {
    const fijos = rolesDelCirculo(c.id);
    const tomados = new Set<Rol>(fijos.map((f) => f.rol));
    const pares = indiceCirculo++ % 2 === 0;
    const quiere: Rol[] = ["facilita", pares ? "enlace-arriba" : "enlace-de-arriba", "memoria"];
    const roles: { personaId: string; persona: string; rol: Rol }[] = fijos.map((f) => ({
      personaId: f.personaId,
      persona: nombresPersona.get(f.personaId) ?? f.personaId,
      rol: f.rol,
    }));
    for (const rol of [...quiere.filter((r) => !tomados.has(r)), "miembro" as Rol]) {
      const p = personaDeRelleno(contadorRelleno++);
      roles.push({ personaId: p.id, persona: tx(p.nombre, idioma), rol });
    }
    return {
      tipo: "circulo",
      id: c.id,
      nombre: tx(c.nombre, idioma),
      proposito: c.proposito ?? null,
      decide: (c.decide ?? []).map((x) => tx(x, idioma)),
      clase,
      tribus: c.tribus.length > 0 ? c.tribus : undefined,
      ejemplo: true,
      hijos: roles.map((r, k) => ({
        tipo: "rol" as const,
        id: `${c.id}-rol-${k + 1}`,
        personaId: r.personaId,
        persona: r.persona,
        rol: r.rol,
        esYo: r.personaId === PERSONA_YO.id,
        ejemplo: true,
      })),
    };
  }

  const tribus = listarTribus(idioma);
  const lugares = lugaresDelConsejo(registros);
  const nombreTribu = (id: string) => tribus.find((t) => t.id === id)?.nombre ?? id;

  const delComun = CIRCULOS_DEL_COMUN.map((c) => nodoCirculo(c, "del-comun"));
  const consejo: NodoContenedor = {
    tipo: "consejo",
    id: CONSEJO_ID,
    nombre: idioma === "en" ? "Council of tribes" : "Consejo de tribus",
    proposito: "gobierno",
    decide: DECIDE_CONSEJO.map((x) => tx(x, idioma)),
    ejemplo: true,
    hijos: lugares.map((l) => ({
      tipo: "lugar" as const,
      id: `consejo-${l.tribuId}`,
      tribuId: l.tribuId,
      nombre: nombreTribu(l.tribuId),
      representante: null,
    })),
  };
  const transversales = circulosTransversales().map((c) => nodoCirculo(c, "transversal"));
  const nodosTribu = tribus.map<NodoContenedor>((t) => {
    const circulos = circulosDe(t.id).map((c) => nodoCirculo(c, "de-tribu"));
    return {
      tipo: "tribu",
      id: t.id,
      nombre: t.nombre,
      proposito: null,
      decide: t.estado === "vacante" ? [] : DECIDE_TRIBU.map((x) => tx(x, idioma)),
      estado: t.estado,
      validada: validadaPorElComun(t.id, registros),
      ejemplo: true,
      hijos: t.estado === "vacante" ? [{ tipo: "lugar-libre", id: `${t.id}-libre` }] : circulos,
    };
  });

  return {
    tipo: "comun",
    id: COMUN_ID,
    nombre: "Lighthouse",
    proposito: "gobierno",
    decide: DECIDE_COMUN.map((x) => tx(x, idioma)),
    ejemplo: true,
    hijos: [...delComun, consejo, ...transversales, ...nodosTribu],
  };
}

/** Dónde queda un círculo: en una tribu o en el común (los círculos del común y los transversales). */
export type LugarDeRol = { tipo: "tribu"; tribuId: string; nombre: string } | { tipo: "comun" };

export type RolDePersona = {
  nodoRolId: string;
  rol: Rol;
  circuloId: string;
  circulo: string;
  lugar: LugarDeRol;
};

/** Todos los roles de una persona (por id, nunca por nombre), en el orden del árbol: primero el común, después las tribus. */
export function rolesDe(raiz: NodoH, personaId: string): RolDePersona[] {
  const salida: RolDePersona[] = [];
  recorrer(raiz, (n, padres) => {
    if (n.tipo !== "rol" || n.personaId !== personaId) return;
    const circulo = padres[padres.length - 1];
    if (!circulo || circulo.tipo !== "circulo") return;
    const tribu = padres.find((p) => p.tipo === "tribu");
    salida.push({
      nodoRolId: n.id,
      rol: n.rol,
      circuloId: circulo.id,
      circulo: circulo.nombre,
      lugar: tribu ? { tipo: "tribu", tribuId: tribu.id, nombre: (tribu as NodoContenedor).nombre } : { tipo: "comun" },
    });
  });
  return salida;
}

/** Un lugar donde participa quien mira: marca un nodo que ya existe en el árbol (no crea nodos). */
export type LugarMio = { nodoId: string; rol: Rol; ejemplo: boolean };

/**
 * Los lugares de "Desde mí": los dos roles de ejemplo de "Vos" más lo que el navegador ya sabe (membresías aceptadas de
 * tribu y la tribu que lidera en Sumarte). Solo lee lo que recibe: no escribe ni manda nada.
 */
export function lugaresMios(
  membresias: Readonly<Record<string, string>> | null | undefined,
  tribuLider: string | null | undefined,
  tribusValidas: readonly string[] = [],
): LugarMio[] {
  const salida: LugarMio[] = ROLES_DE_VOS.map((r) => ({ nodoId: r.circuloId, rol: r.rol, ejemplo: true }));
  const existe = (id: string) => tribusValidas.length === 0 || tribusValidas.includes(id);
  const miembro = membresias
    ? Object.keys(membresias).filter((c) => membresias[c] === "miembro" && c !== COMUN_ID && existe(c))
    : [];
  for (const id of miembro) {
    if (id !== tribuLider) salida.push({ nodoId: id, rol: "miembro", ejemplo: false });
  }
  if (tribuLider && existe(tribuLider)) salida.push({ nodoId: tribuLider, rol: "facilita", ejemplo: false });
  return salida;
}
