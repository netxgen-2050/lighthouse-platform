import type { Compromiso } from "./tipos";

export type Accion =
  | { tipo: "registrar"; compromiso: Compromiso }
  | { tipo: "quitar"; id: string }
  | { tipo: "borrarTodo" }
  | { tipo: "cargar"; compromisos: Compromiso[] };

/** Más reciente primero. */
function ordenar(lista: Compromiso[]): Compromiso[] {
  return lista
    .map((c, i) => ({ c, i }))
    .sort((a, b) => (a.c.creado === b.c.creado ? a.i - b.i : a.c.creado < b.c.creado ? 1 : -1))
    .map((x) => x.c);
}

export function reducir(estado: Compromiso[], accion: Accion): Compromiso[] {
  switch (accion.tipo) {
    case "registrar":
      return ordenar([accion.compromiso, ...estado]);
    case "quitar":
      return estado.filter((c) => c.id !== accion.id);
    case "borrarTodo":
      return [];
    case "cargar":
      return ordenar(accion.compromisos);
  }
}

function esCompromiso(x: unknown): x is Compromiso {
  if (typeof x !== "object" || x === null) return false;
  const c = x as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    (c.tipo === "ofrezco" || c.tipo === "necesito") &&
    (c.clase === "tiempo" || c.clase === "bienes") &&
    typeof c.descripcion === "string" &&
    typeof c.para === "string" &&
    typeof c.creado === "string" &&
    (c.horasPorMes === undefined || typeof c.horasPorMes === "number") &&
    (c.cantidadBienes === undefined || typeof c.cantidadBienes === "string")
  );
}

/** Lee el JSON guardado; si es inválido se descarta y se empieza vacío. */
export function cargar(json: string | null): Compromiso[] {
  if (!json) return [];
  try {
    const dato: unknown = JSON.parse(json);
    if (!Array.isArray(dato) || !dato.every(esCompromiso)) return [];
    return dato;
  } catch {
    return [];
  }
}
