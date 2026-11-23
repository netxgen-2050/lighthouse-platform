// Preferencia de idioma de la vitrina del Congreso, guardada en el navegador (con el prefijo de la persona si hay
// sesión). Es una preferencia de interfaz: cualquier valor que no sea "es" o "en" se ignora.
import { CLAVES } from "@/lib/demo/claves";
import { esIdioma, type Idioma } from "./idioma";

/** Interpreta lo guardado: solo "es" o "en" valen. */
export function idiomaGuardado(texto: string | null | undefined): Idioma | null {
  return esIdioma(texto) ? texto : null;
}

/** Lee la preferencia de la persona en sesión (o del navegador sin sesión). Sin almacenamiento, null. */
export function leerPreferenciaIdioma(): Idioma | null {
  try {
    return idiomaGuardado(window.localStorage.getItem(CLAVES.idiomaCongreso));
  } catch {
    return null;
  }
}

/**
 * Guardado que espera a la sesión: si se elige mientras carga, la elección queda pendiente y se escribe cuando
 * la sesión termina de cargar (así no se guarda en la clave equivocada ni se pierde).
 */
export function crearGuardadoDiferido(guardar: (idioma: Idioma) => void) {
  let pendiente: Idioma | null = null;
  return {
    elegir(idioma: Idioma, cargando: boolean) {
      if (cargando) pendiente = idioma;
      else guardar(idioma);
    },
    sesionLista() {
      if (!pendiente) return;
      const idioma = pendiente;
      pendiente = null;
      guardar(idioma);
    },
  };
}

/** Guarda la preferencia. Si el navegador no deja guardar, no rompe: la elección vale solo para esta visita. */
export function guardarPreferenciaIdioma(idioma: Idioma): void {
  try {
    window.localStorage.setItem(CLAVES.idiomaCongreso, idioma);
  } catch {
    // Sin almacenamiento: la preferencia es opcional.
  }
}
