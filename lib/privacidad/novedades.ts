import type { CanalRegistrado, RegistroNovedades } from "./estado";

/**
 * Consentimiento opcional de novedades por email (cambio `consentimiento-alta`, design §9). Con sesión vive en el servidor
 * (`consentimiento-en-la-base`): la última fila de tipo `novedades` del libro `consentimientos`, y la regla "la casilla de
 * los pasos no pisa una elección anterior" la aplica el servidor. En el prototipo no se manda ningún email: solo queda la elección.
 * Se pide y se cambia con `aceptarEnServidor` y `cambiarNovedadesEnServidor` (`consentimiento.ts`).
 */

export type CanalNovedades = CanalRegistrado;
export type Novedades = RegistroNovedades;
