import { CLAVES } from "@/lib/demo/claves";
import type { OrigenPedido } from "@/lib/contactos/tipos";

export const CAMINOS_VALIDOS = ["tribus", "perfil", "congreso"] as const;
export type CaminoId = (typeof CAMINOS_VALIDOS)[number];

/** Único límite: evita que un link malicioso llene el navegador con un texto gigante. */
const MAX_VALOR = 200;

export type Parametros = {
  camino?: CaminoId;
  fuente?: string;
  medio?: string;
  campana?: string;
};

/** Lo que queda en `lh-origen`. */
export type OrigenGuardado = Parametros & { fecha: string };

type Valor = string | string[] | undefined | null;

/**
 * Guarda el valor tal como viene en el link (decisión de Gus, 13-oct-2026: sin filtros):
 * solo saca los espacios de los bordes y corta a 200 caracteres. Vacío → undefined.
 * React lo muestra siempre como texto, así que no hay riesgo de inyectar HTML.
 */
export function limpiar(valor: Valor): string | undefined {
  const primero = Array.isArray(valor) ? valor[0] : valor;
  if (typeof primero !== "string") return undefined;
  const limpio = primero.trim().slice(0, MAX_VALOR);
  return limpio === "" ? undefined : limpio;
}

/** El camino sí se valida: solo puede ser uno de los caminos de la portada. */
function caminoValido(valor: Valor): CaminoId | undefined {
  const limpio = limpiar(valor)?.toLowerCase();
  return CAMINOS_VALIDOS.find((c) => c === limpio);
}

function sinVacios<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

/** Toma de la URL solo lo permitido; todo lo demás se descarta. */
export function leerParametros(params: Record<string, Valor>): Parametros {
  return sinVacios({
    camino: caminoValido(params.camino),
    fuente: limpiar(params.utm_source),
    medio: limpiar(params.utm_medium),
    campana: limpiar(params.utm_campaign),
  });
}

export function hayCampana(p: Parametros): boolean {
  return Boolean(p.fuente || p.medio || p.campana);
}

/** Lee `lh-origen`; si no es válido o no tiene fuente, medio ni campaña, devuelve null. */
export function leerOrigen(texto: string | null): OrigenGuardado | null {
  if (!texto) return null;
  try {
    const dato: unknown = JSON.parse(texto);
    if (typeof dato !== "object" || dato === null || Array.isArray(dato)) return null;
    const o = dato as Record<string, unknown>;
    const texto1 = (v: unknown) => (typeof v === "string" ? v : undefined);
    const p = sinVacios({
      fuente: limpiar(texto1(o.fuente)),
      medio: limpiar(texto1(o.medio)),
      campana: limpiar(texto1(o.campana)),
      camino: caminoValido(texto1(o.camino)),
    });
    if (!hayCampana(p)) return null;
    return { ...p, fecha: texto1(o.fecha) ?? "" };
  } catch {
    return null;
  }
}

/** "fuente · medio · campaña", con "sin dato" en cada parte que falte; sin origen, "sin dato". */
export function formatoOrigen(origen: OrigenPedido | undefined): string {
  if (!origen || !(origen.fuente || origen.medio || origen.campana)) return "sin dato";
  return [origen.fuente, origen.medio, origen.campana].map((x) => x ?? "sin dato").join(" · ");
}

type Almacen = Pick<Storage, "getItem" | "setItem">;

/** Guarda el origen solo si no hay uno válido (se conserva el primero). Devuelve true si guardó. */
export function guardarSiNoHay(almacen: Almacen, p: Parametros, ahora: Date): boolean {
  if (!hayCampana(p)) return false;
  if (leerOrigen(almacen.getItem(CLAVES.origen))) return false;
  const origen: OrigenGuardado = { ...p, fecha: ahora.toISOString() };
  almacen.setItem(CLAVES.origen, JSON.stringify(origen));
  return true;
}

/** Origen guardado en este navegador, listo para pegar a un pedido (sin camino ni fecha). Sin origen: undefined. */
export function origenDelNavegador(): OrigenPedido | undefined {
  try {
    const o = leerOrigen(window.localStorage.getItem(CLAVES.origen));
    if (!o) return undefined;
    return sinVacios({ fuente: o.fuente, medio: o.medio, campana: o.campana });
  } catch {
    return undefined;
  }
}

/** Para el componente que guarda: un fallo del navegador no rompe la página. */
export function guardarOrigenDelNavegador(p: Parametros): void {
  try {
    guardarSiNoHay(window.localStorage, p, new Date());
  } catch {
    // Sin almacenamiento: la visita sigue sin origen.
  }
}
