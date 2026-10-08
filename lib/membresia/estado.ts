import { CLAVES } from "@/lib/demo/claves";

/**
 * Clave de localStorage de la membresía (simulada, solo en este navegador).
 * Pactos y Semillas leen `comunidadesDondeEsMiembro` sobre este estado.
 */
export const CLAVE_MEMBRESIA = CLAVES.membresia;

/** Identificador de la comunidad del Lighthouse en sí; las tribus usan su propio id. */
export const COMUNIDAD_LIGHTHOUSE = "lighthouse";

export type EstadoMembresia = "no-miembro" | "pedido" | "miembro";

/** Solo se guardan las comunidades con pedido o con membresía; el resto es "no-miembro". */
export type Membresias = Record<string, "pedido" | "miembro">;

export type Accion = { tipo: "adherir"; comunidad: string } | { tipo: "aceptar"; comunidad: string };

export const INICIAL: Membresias = {};

export function estadoDe(m: Membresias, comunidad: string): EstadoMembresia {
  return Object.hasOwn(m, comunidad) ? m[comunidad] : "no-miembro";
}

export function reducir(m: Membresias, a: Accion): Membresias {
  const actual = estadoDe(m, a.comunidad);
  switch (a.tipo) {
    case "adherir":
      // Solo quien no es miembro puede pedir; un pedido o una membresía no se pisan.
      return actual === "no-miembro" ? { ...m, [a.comunidad]: "pedido" } : m;
    case "aceptar":
      // La aceptación simulada solo tiene sentido si hay un pedido.
      return actual === "pedido" ? { ...m, [a.comunidad]: "miembro" } : m;
  }
}

/** Comunidades (`lighthouse` o ids de tribu) donde la persona es miembro. */
export function comunidadesDondeEsMiembro(m: Membresias): string[] {
  return Object.keys(m).filter((c) => m[c] === "miembro");
}

/** Lee lo guardado; cualquier cosa rara se descarta entrada por entrada. */
export function leer(crudo: string | null): Membresias {
  if (!crudo) return INICIAL;
  try {
    const o: unknown = JSON.parse(crudo);
    if (typeof o !== "object" || o === null || Array.isArray(o)) return INICIAL;
    const salida: Membresias = {};
    for (const [comunidad, valor] of Object.entries(o)) {
      if (valor === "pedido" || valor === "miembro") salida[comunidad] = valor;
    }
    return salida;
  } catch {
    return INICIAL;
  }
}

/** Lee la membresía guardada en el navegador (para Pactos y Semillas). Fuera del navegador devuelve vacío. */
export function leerMembresiaDelNavegador(): Membresias {
  try {
    return leer(window.localStorage.getItem(CLAVE_MEMBRESIA));
  } catch {
    return INICIAL;
  }
}
