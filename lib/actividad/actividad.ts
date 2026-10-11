export type EventoActividad = {
  id: string;
  /** Qué clase de cosa pasó; sirve para no repetir el mismo aviso. */
  tipo: string;
  texto: string;
  /** Fecha y hora en ISO. */
  fecha: string;
  /** Página a la que lleva el evento. */
  enlace: string;
  /** true: algo que te pasó (va a la bandeja). false: algo que hiciste (solo actividad). */
  notificacion: boolean;
  leida: boolean;
  /** Si existe, el evento no se ve hasta esa fecha (ISO). Sirve para simular avisos "un rato después". */
  visibleDesde?: string;
  /** Si existe, un evento con la misma clave no se registra dos veces. */
  clave?: string;
};

export type NuevoEvento = {
  tipo: string;
  texto: string;
  enlace: string;
  notificacion?: boolean;
  /** Segundos de espera antes de que se vea. */
  demoraSegundos?: number;
  clave?: string;
};

export const MAX_EVENTOS = 200;

/**
 * Solo rutas del propio sitio: empiezan con una sola "/" (no "//" ni "/\") y no tienen
 * espacios ni caracteres de control (el navegador quita tabulaciones y saltos al leer la URL).
 */
function esRutaInterna(enlace: unknown): boolean {
  return (
    typeof enlace === "string" &&
    /^\/(?![/\\])/.test(enlace) &&
    !/[\s\u0000-\u001f\u007f]/.test(enlace)
  );
}

/** Lee lo guardado. Ante datos dañados o ausentes devuelve una lista vacía y descarta lo que no sirve. */
export function leerEventos(crudo: string | null): EventoActividad[] {
  if (!crudo) return [];
  try {
    const dato: unknown = JSON.parse(crudo);
    if (!Array.isArray(dato)) return [];
    return dato.filter(
      (e): e is EventoActividad =>
        typeof e === "object" &&
        e !== null &&
        typeof e.id === "string" &&
        typeof e.tipo === "string" &&
        typeof e.texto === "string" &&
        esRutaInterna(e.enlace) &&
        typeof e.fecha === "string" &&
        !Number.isNaN(Date.parse(e.fecha)) &&
        typeof e.notificacion === "boolean" &&
        typeof e.leida === "boolean",
    );
  } catch {
    return [];
  }
}

/** Agrega un evento. Con `clave` repetida no hace nada. Conserva solo los últimos MAX_EVENTOS. */
export function registrar(lista: EventoActividad[], nuevo: NuevoEvento, ahora: Date, id: string): EventoActividad[] {
  if (nuevo.clave && lista.some((e) => e.clave === nuevo.clave)) return lista;
  const evento: EventoActividad = {
    id,
    tipo: nuevo.tipo,
    texto: nuevo.texto,
    fecha: ahora.toISOString(),
    enlace: nuevo.enlace,
    notificacion: nuevo.notificacion ?? false,
    leida: false,
    ...(nuevo.demoraSegundos ? { visibleDesde: new Date(ahora.getTime() + nuevo.demoraSegundos * 1000).toISOString() } : {}),
    ...(nuevo.clave ? { clave: nuevo.clave } : {}),
  };
  return [...lista, evento].slice(-MAX_EVENTOS);
}

function fechaVisible(e: EventoActividad): number {
  return Date.parse(e.visibleDesde ?? e.fecha);
}

function yaSeVe(e: EventoActividad, ahora: Date): boolean {
  return fechaVisible(e) <= ahora.getTime();
}

function masNuevoPrimero(a: EventoActividad, b: EventoActividad): number {
  return fechaVisible(b) - fechaVisible(a);
}

/**
 * Notificaciones que ya se ven, de la más nueva a la más vieja.
 * `tiposOcultos`: tipos de evento que la persona apagó en Configuración; no se listan ni se cuentan.
 */
export function listarNotificaciones(
  lista: EventoActividad[],
  ahora: Date,
  tiposOcultos: readonly string[] = [],
): EventoActividad[] {
  return lista
    .filter((e) => e.notificacion && yaSeVe(e, ahora) && !tiposOcultos.includes(e.tipo))
    .sort(masNuevoPrimero);
}

/** Todo lo que hizo o le pasó a la persona, de lo más nuevo a lo más viejo (para Mi recorrido). */
export function listarActividad(lista: EventoActividad[], ahora: Date): EventoActividad[] {
  return lista.filter((e) => yaSeVe(e, ahora)).sort(masNuevoPrimero);
}

export function contarNoLeidas(lista: EventoActividad[], ahora: Date, tiposOcultos: readonly string[] = []): number {
  return listarNotificaciones(lista, ahora, tiposOcultos).filter((e) => !e.leida).length;
}

/** Marca como leídas las notificaciones que ya se ven. Las que todavía no llegaron siguen sin leer. */
export function marcarTodasLeidas(lista: EventoActividad[], ahora: Date): EventoActividad[] {
  return lista.map((e) => (e.notificacion && !e.leida && yaSeVe(e, ahora) ? { ...e, leida: true } : e));
}

/** Texto accesible de la campanita. */
export function nombreCampanita(noLeidas: number): string {
  if (noLeidas === 0) return "Notificaciones, sin novedades";
  return noLeidas === 1 ? "1 notificación sin leer" : `${noLeidas} notificaciones sin leer`;
}
