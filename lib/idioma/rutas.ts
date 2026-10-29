import type { Idioma } from "./tipos";

/**
 * Única lista de páginas que ya están traducidas al inglés. Cualquier otra, con la plataforma en inglés, se muestra en
 * español con el aviso "This page is only available in Spanish for now.". Cada cambio de zona suma sus rutas.
 * Cada patrón es una ruta completa: `[id]` es un solo tramo, sin barras.
 */
export const RUTAS_TRADUCIDAS: readonly RegExp[] = [
  // El Congreso tiene su propia traducción y sus propias direcciones (ADR-003).
  /^\/congreso(\/en)?$/,
  // Portada y Sumarte (idioma-portada-sumarte).
  /^\/$/,
  /^\/sumarte$/,
  // Tribus, manifiesto, postulación y territorio (idioma-tribus-territorio).
  /^\/tribus$/,
  /^\/tribus\/[^/]+$/,
  /^\/tribus\/[^/]+\/manifiesto$/,
  /^\/tribus\/[^/]+\/postular$/,
  /^\/territorios\/[^/]+$/,
  // Cómo decidimos (fogon-gobernanza-fractal).
  /^\/fogon\/gobernanza$/,
  // Pasaporte (con la verificación de identidad), Semillas y Pactos (idioma-pasaporte-semillas-pactos).
  /^\/pasaporte$/,
  /^\/semillas$/,
  /^\/pactos$/,
  // La tribu responde los pactos (pactos-dos-partes).
  /^\/pactos\/responder$/,
  // Fogón, Compromisos con su Mercado y Canales (idioma-fogon-mercado).
  /^\/fogon$/,
  // Consultas del Fogón: la lista y cada consulta (idioma-pendientes).
  /^\/fogon\/consultas$/,
  /^\/fogon\/consultas\/[^/]+$/,
  // Propuestas del Fogón (fogon-propuestas).
  /^\/fogon\/propuestas\/[^/]+$/,
  /^\/compromisos$/,
  /^\/canales$/,
  // Perfil, Mi recorrido, la bandeja de notificaciones y Configuración (idioma-perfil-recorrido).
  /^\/perfil$/,
  /^\/panel$/,
  /^\/bandeja$/,
  /^\/configuracion$/,
];

/**
 * Páginas internas del equipo (no se traducen, siguen la excepción de `idioma-hifa-avisos`) o que redirigen. Una página
 * nueva tiene que estar en esta lista o en `RUTAS_TRADUCIDAS`: lo vigila `rutas.test.ts` (regla "toda pantalla nueva nace
 * bilingüe", `idioma-pendientes`).
 */
export const RUTAS_INTERNAS: readonly RegExp[] = [
  /^\/admin(\/.*)?$/,
  /^\/netx(\/.*)?$/,
  /^\/panel\/bitacora$/,
  // Redirige a /netx/simulador.
  /^\/fogon\/simulador$/,
];

/**
 * Páginas de usuarias que todavía esperan su cambio de idioma. Cuando ese cambio las traduce, pasan a `RUTAS_TRADUCIDAS`
 * y salen de acá (el test falla si una ruta está en las dos).
 */
export const RUTAS_PENDIENTES: readonly { ruta: RegExp; cambio: string }[] = [
  { ruta: /^\/mis-datos$/, cambio: "idioma-legal" },
  { ruta: /^\/privacidad$/, cambio: "idioma-legal" },
];

function limpiar(ruta: string): string {
  const limpia = ruta.split(/[?#]/)[0] ?? "";
  return limpia.length > 1 ? limpia.replace(/\/+$/, "") : limpia;
}

/** ¿Esta página ya está traducida? Ignora la barra final, la query y el hash. */
export function estaTraducida(ruta: string | null | undefined): boolean {
  if (!ruta) return false;
  const limpia = limpiar(ruta);
  return RUTAS_TRADUCIDAS.some((r) => r.test(limpia));
}

/**
 * La dirección que corresponde a un idioma. Solo el Congreso tiene una dirección por idioma (`/congreso` y
 * `/congreso/en`, ADR-003); el resto de las páginas tiene la misma en los dos.
 */
export function rutaParaIdioma(ruta: string, idioma: Idioma): string {
  const limpia = limpiar(ruta);
  if (limpia === "/congreso" || limpia === "/congreso/en") return idioma === "en" ? "/congreso/en" : "/congreso";
  return ruta;
}
