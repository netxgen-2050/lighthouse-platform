import { CLAVES } from "@/lib/demo/claves";
import { DATOS_VACIOS, leerDatos, type DatosPersona } from "./datos";

/**
 * Lo que la persona cargó en "Tus datos" (pasaporte), leído del navegador.
 * Solo se llama en el cliente, tras hidratar. Sin datos o sin acceso al almacenamiento: vacío (sin dato, no un valor inventado).
 */
export function leerPasaporteDelNavegador(): DatosPersona {
  try {
    return leerDatos(window.localStorage.getItem(CLAVES.pasaporte));
  } catch {
    return DATOS_VACIOS;
  }
}
