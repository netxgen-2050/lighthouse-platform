import type { Reparto } from "@/lib/cuadratico/motor";
import type { ResumenConsulta, VistaConsulta } from "./tipos";

/**
 * Una lectura distingue "no hay" de "no pude saber": la pantalla nunca muestra una lista vacía ni ceros cuando falló.
 * "sin-sesion" cubre también "sin consentimiento vigente" (las dos llevan a "Entrar").
 */
export type ErrorLectura = "no-encontrada" | "sin-sesion" | "falla";
export type Lectura<T> = { ok: true; valor: T } | { ok: false; error: ErrorLectura };

export type ResultadoGuardar =
  | { ok: true }
  | { ok: false; error: "invalido" | "cerrada" | "sin-permiso" | "sin-sesion" | "falla"; motivos?: string[] };

/**
 * La costura entre las pantallas del Fogón y los datos de las consultas. Hoy la implementa el navegador
 * (`RepositorioNavegador`); `fogon-cuadratico-en-la-base` suma la versión con API sin tocar las pantallas.
 * Es asíncrona desde ahora aunque el navegador responda al instante.
 */
export interface RepositorioConsultas {
  listar(): Promise<Lectura<ResumenConsulta[]>>;
  abrir(id: string): Promise<Lectura<VistaConsulta>>;
  guardarReparto(id: string, reparto: Reparto): Promise<ResultadoGuardar>;
  /** Solo si `puedeCerrar`. */
  cerrar(id: string): Promise<{ ok: boolean }>;
  /** Solo la versión del navegador (para repetir la demo). */
  reabrir?(id: string): Promise<{ ok: boolean }>;
}

/** Texto de cada error de lectura, para las pantallas (`error` en `Lectura`). */
export const TEXTO_ERROR_LECTURA: Record<ErrorLectura, string> = {
  "no-encontrada": "No encontramos esta consulta",
  "sin-sesion": "Entrá para ver las consultas del Fogón",
  falla: "No pudimos cargar las consultas. Probá de nuevo.",
};
