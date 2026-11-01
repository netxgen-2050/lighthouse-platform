import { CIRCULOS_DEL_COMUN } from "@/lib/gobernanza/datos";
import type { Circulo } from "@/lib/gobernanza/tipos";
import { textoEn, type Idioma } from "@/lib/idioma/tipos";
import { FASE_ACTUAL, vigenteEn, type Fase } from "@/lib/territorios/fases";
import { frentesDe, type Frente } from "./frentes";

/** Un equipo de trabajo es un círculo del común, con sus frentes de ahora y los de una fase futura. */
export type Equipo = { circulo: Circulo; frentesAhora: Frente[]; frentesDespues: Frente[] };

/**
 * Los equipos: primero los que tienen frentes en la fase actual (más frentes primero), después el resto.
 * El orden entre iguales es el de `CIRCULOS_DEL_COMUN` (el sort de JS es estable).
 */
export function listarEquipos(idioma: Idioma, fase: Fase = FASE_ACTUAL): Equipo[] {
  const equipos = CIRCULOS_DEL_COMUN.map((circulo) => {
    const frentes = frentesDe(circulo.id, idioma);
    return {
      circulo,
      frentesAhora: frentes.filter((f) => vigenteEn(f, fase)),
      frentesDespues: frentes.filter((f) => !vigenteEn(f, fase)),
    };
  });
  return equipos.sort((a, b) => b.frentesAhora.length - a.frentesAhora.length);
}

/** A qué círculos del común pidió sumarse la persona (`lh-equipos`). */
export type PedidosEquipos = Record<string, "pedido">;

const esDelComun = (id: string): boolean => CIRCULOS_DEL_COMUN.some((c) => c.id === id);

/** Lee lo guardado; descarta entrada por entrada todo lo que no sea un id del común con "pedido" (incluye `__proto__`). */
export function leerPedidos(crudo: string | null): PedidosEquipos {
  if (!crudo) return {};
  try {
    const o: unknown = JSON.parse(crudo);
    if (typeof o !== "object" || o === null || Array.isArray(o)) return {};
    const salida: PedidosEquipos = {};
    for (const [id, valor] of Object.entries(o)) {
      if (valor === "pedido" && esDelComun(id)) salida[id] = "pedido";
    }
    return salida;
  } catch {
    return {};
  }
}

/** Suma un pedido. Idempotente; ignora ids que no son de un círculo del común. */
export function pedir(p: PedidosEquipos, circuloId: string): PedidosEquipos {
  if (!esDelComun(circuloId) || Object.hasOwn(p, circuloId)) return p;
  return { ...p, [circuloId]: "pedido" };
}

export type EstadoSumarme =
  | { tipo: "sin-sesion" }
  | { tipo: "sin-capacidad" }
  | { tipo: "sin-adhesion" }
  | { tipo: "puede" }
  | { tipo: "pedido" };

export type EntradaSumarme = {
  conSesion: boolean;
  /** Tiene la capacidad `adherir` (`puedeCapacidad(nivel, "adherir")`). */
  puedeAdherir: boolean;
  /** Adhirió al Lighthouse: sale de `puedeParticiparEnGobernanza(membresias)`; acá no se mira la membresía. */
  adhirio: boolean;
  pedidos: PedidosEquipos;
  circuloId: string;
};

/**
 * Qué ve y qué puede hacer la persona. Orden: sesión; pedido ya hecho (no se borra aunque después baje de plan);
 * capacidad; adhesión; y si nada frena, puede.
 */
export function estadoSumarme(x: EntradaSumarme): EstadoSumarme {
  if (!x.conSesion) return { tipo: "sin-sesion" };
  if (Object.hasOwn(x.pedidos, x.circuloId)) return { tipo: "pedido" };
  if (!x.puedeAdherir) return { tipo: "sin-capacidad" };
  if (!x.adhirio) return { tipo: "sin-adhesion" };
  return { tipo: "puede" };
}

/**
 * Lo que hace el "Confirmar": vuelve a calcular el estado con lo que hay en ese momento y, solo si es `puede`,
 * devuelve los pedidos con el nuevo. Si no, devuelve `null` y no hay nada que escribir.
 */
export function confirmarPedido(x: EntradaSumarme): PedidosEquipos | null {
  if (estadoSumarme(x).tipo !== "puede" || !esDelComun(x.circuloId)) return null;
  return pedir(x.pedidos, x.circuloId);
}

/** Nombre de un equipo (círculo del común) en el idioma pedido; `null` si el id no es de un círculo del común. */
export function nombreDeEquipo(circuloId: string, idioma: Idioma): string | null {
  const c = CIRCULOS_DEL_COMUN.find((x) => x.id === circuloId);
  return c ? textoEn(c.nombre, idioma) : null;
}
