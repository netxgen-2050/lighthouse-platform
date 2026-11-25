import { bandeja } from "@/lib/idioma/textos/bandeja";
import { marco } from "@/lib/idioma/textos/marco";
import type { Idioma } from "@/lib/idioma/tipos";

/** Qué mensaje se muestra de un evento: la clave de su texto en el diccionario `bandeja` (un `tipo` junta varios mensajes). */
export type ClaveMensaje = keyof (typeof bandeja)["es"]["eventos"];

/** Lo que el mensaje necesita para armarse: el nombre de la comunidad o la descripción que escribió la persona (no se traducen). */
export type DatosEvento = { comunidad?: string; descripcion?: string; tarea?: string };

/** Mensajes que usan además el nombre de una tarea (la tarea no se traduce): el segundo dato, después de `comunidad`. */
const CON_TAREA: readonly string[] = [
  "tePostulaste",
  "postulacionPreadmitida",
  "postulacionNoPreadmitida",
  "marcasteHecha",
  "horasVerificadas",
  "horasARevisar",
  "declarasteHoras",
  "horasDelMesConfirmadas",
];

/** Qué dato usa cada mensaje: `null` = ninguno. */
const DATO_DEL_MENSAJE: Record<ClaveMensaje, keyof DatosEvento | null> = {
  adheriste: "comunidad",
  adhesionAceptada: "comunidad",
  propusistePacto: "comunidad",
  pactoAceptado: "comunidad",
  pactoNoAceptado: "comunidad",
  propusisteCambioDePacto: "comunidad",
  cambioDePactoAceptado: "comunidad",
  cambioDePactoRechazado: "comunidad",
  rondaAbierta: "comunidad",
  publicasteEnMercado: "descripcion",
  interesEnOferta: null,
  enviastePostulacion: "comunidad",
  postulacionRecibida: null,
  registrasteTicket: null,
  enviasteRonda: "comunidad",
  tePostulaste: "comunidad",
  postulacionPreadmitida: "comunidad",
  postulacionNoPreadmitida: "comunidad",
  marcasteHecha: "comunidad",
  horasVerificadas: "comunidad",
  horasARevisar: "comunidad",
  declarasteHoras: "comunidad",
  horasDelMesConfirmadas: "comunidad",
};

function esClaveMensaje(x: unknown): x is ClaveMensaje {
  return typeof x === "string" && Object.prototype.hasOwnProperty.call(DATO_DEL_MENSAJE, x);
}

export type EventoActividad = {
  id: string;
  /** Qué clase de cosa pasó; sirve para no repetir el mismo aviso. */
  tipo: string;
  /** El texto en español, tal como se armó al registrar el evento. Los eventos con `mensaje` y `datos` se muestran armados en el idioma actual. */
  texto: string;
  /** Qué mensaje es (con `datos`, permite armar el texto en cualquier idioma). Ausente en los eventos guardados antes de este campo. */
  mensaje?: ClaveMensaje;
  datos?: DatosEvento;
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
  mensaje?: ClaveMensaje;
  datos?: DatosEvento;
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

/**
 * El mensaje y los datos de un evento leído, solo si están completos y bien formados. Si no, se descartan los dos y el
 * evento se muestra con su texto en español (como un evento viejo).
 */
function mensajeValido(e: Record<string, unknown>): { mensaje: ClaveMensaje; datos: DatosEvento } | null {
  if (!esClaveMensaje(e.mensaje)) return null;
  const crudos = e.datos;
  if (typeof crudos !== "object" || crudos === null || Array.isArray(crudos)) return null;
  const usado = DATO_DEL_MENSAJE[e.mensaje];
  if (usado === null) return { mensaje: e.mensaje, datos: {} };
  const valor = (crudos as Record<string, unknown>)[usado];
  if (typeof valor !== "string") return null;
  if (!CON_TAREA.includes(e.mensaje)) return { mensaje: e.mensaje, datos: { [usado]: valor } };
  const tarea = (crudos as Record<string, unknown>).tarea;
  return typeof tarea === "string" ? { mensaje: e.mensaje, datos: { [usado]: valor, tarea } } : null;
}

/** Lee lo guardado. Ante datos dañados o ausentes devuelve una lista vacía y descarta lo que no sirve. */
export function leerEventos(crudo: string | null): EventoActividad[] {
  if (!crudo) return [];
  try {
    const dato: unknown = JSON.parse(crudo);
    if (!Array.isArray(dato)) return [];
    return dato
      .filter(
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
      )
      .map((e) => {
        const valido = mensajeValido(e as unknown as Record<string, unknown>);
        const base: EventoActividad = { ...e };
        delete base.mensaje;
        delete base.datos;
        return valido ? { ...base, ...valido } : base;
      });
  } catch {
    return [];
  }
}

/** El texto de un mensaje en un idioma. Sin nombre de comunidad ("") dice "tu comunidad" / "your community". */
export function armarTexto(mensaje: ClaveMensaje, datos: DatosEvento, idioma: Idioma): string {
  const t = bandeja[idioma];
  const usado = DATO_DEL_MENSAJE[mensaje];
  const valor = usado === null ? "" : (datos[usado] ?? "");
  const dato = usado === "comunidad" && valor.trim() === "" ? t.tuComunidad : valor;
  return (t.eventos[mensaje] as (dato: string, tarea?: string) => string)(dato, datos.tarea ?? "");
}

const MARCA = "\u0001";

/**
 * El texto de un mensaje partido en lo que va antes del dato, el dato que no se traduce (comunidad o descripción) y lo
 * que va después. Se arma desde la plantilla, sin buscar el dato dentro del texto. `dato` es `null` si el mensaje no
 * usa ninguno o si no hay nombre (dice "tu comunidad"): entonces todo va en `antes`.
 */
export function partesDeTexto(
  mensaje: ClaveMensaje,
  datos: DatosEvento,
  idioma: Idioma,
): { antes: string; dato: string | null; despues: string } {
  const usado = DATO_DEL_MENSAJE[mensaje];
  const valor = usado === null ? "" : (datos[usado] ?? "");
  const partes =
    valor.trim() === ""
      ? []
      : (bandeja[idioma].eventos[mensaje] as (d: string, tarea?: string) => string)(MARCA, datos.tarea ?? "").split(MARCA);
  if (partes.length !== 2) return { antes: armarTexto(mensaje, datos, idioma), dato: null, despues: "" };
  return { antes: partes[0], dato: valor, despues: partes[1] };
}

/**
 * El texto de un evento en el idioma pedido. Un evento con mensaje y datos se arma en ese idioma; uno guardado antes
 * (solo texto) o con datos dañados devuelve su texto original, y el `idioma` que vuelve es "es" para marcarlo así.
 */
export function textoDeEvento(e: EventoActividad, idioma: Idioma): { texto: string; idioma: Idioma } {
  if (e.mensaje && e.datos) return { texto: armarTexto(e.mensaje, e.datos, idioma), idioma };
  return { texto: e.texto, idioma: "es" };
}

/** Agrega un evento. Con `clave` repetida no hace nada. Conserva solo los últimos MAX_EVENTOS. */
export function registrar(lista: EventoActividad[], nuevo: NuevoEvento, ahora: Date, id: string): EventoActividad[] {
  if (nuevo.clave && lista.some((e) => e.clave === nuevo.clave)) return lista;
  const evento: EventoActividad = {
    id,
    tipo: nuevo.tipo,
    texto: nuevo.texto,
    ...(nuevo.mensaje && nuevo.datos ? { mensaje: nuevo.mensaje, datos: nuevo.datos } : {}),
    fecha: ahora.toISOString(),
    enlace: nuevo.enlace,
    notificacion: nuevo.notificacion ?? false,
    leida: false,
    ...(nuevo.demoraSegundos ? { visibleDesde: new Date(ahora.getTime() + nuevo.demoraSegundos * 1000).toISOString() } : {}),
    ...(nuevo.clave ? { clave: nuevo.clave } : {}),
  };
  return [...lista, evento].slice(-MAX_EVENTOS);
}

/**
 * Tipos de evento que se guardan pero no se muestran ni se cuentan (bandeja, campanita, Mi recorrido): llevan a
 * /compromisos, que está en pausa por decisión de Gus del 27-oct-2026. No cambia qué se guarda; para volver,
 * vaciar esta lista (ver docs/notas/compromisos-en-pausa.md).
 */
export const TIPOS_EN_PAUSA: readonly string[] = ["mercado", "interes-oferta"];

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
    .filter((e) => e.notificacion && yaSeVe(e, ahora) && !tiposOcultos.includes(e.tipo) && !TIPOS_EN_PAUSA.includes(e.tipo))
    .sort(masNuevoPrimero);
}

/** Todo lo que hizo o le pasó a la persona, de lo más nuevo a lo más viejo (para Mi recorrido). */
export function listarActividad(lista: EventoActividad[], ahora: Date): EventoActividad[] {
  return lista.filter((e) => yaSeVe(e, ahora) && !TIPOS_EN_PAUSA.includes(e.tipo)).sort(masNuevoPrimero);
}

export function contarNoLeidas(lista: EventoActividad[], ahora: Date, tiposOcultos: readonly string[] = []): number {
  return listarNotificaciones(lista, ahora, tiposOcultos).filter((e) => !e.leida).length;
}

/** Marca como leídas las notificaciones que ya se ven. Las que todavía no llegaron, o están en pausa, siguen sin leer. */
export function marcarTodasLeidas(lista: EventoActividad[], ahora: Date): EventoActividad[] {
  return lista.map((e) =>
    e.notificacion && !e.leida && yaSeVe(e, ahora) && !TIPOS_EN_PAUSA.includes(e.tipo) ? { ...e, leida: true } : e,
  );
}

/** Texto accesible de la campanita. */
export function nombreCampanita(noLeidas: number, idioma: Idioma = "es"): string {
  const t = marco[idioma].campanita;
  if (noLeidas === 0) return t.sinNovedades;
  return noLeidas === 1 ? t.una : t.varias(noLeidas);
}
