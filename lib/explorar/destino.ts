/** Las tres secciones de `/explorar` y su ancla. */
export const SECCIONES_EXPLORAR = ["territorio", "barrio", "lotes"] as const;
export type SeccionExplorar = (typeof SECCIONES_EXPLORAR)[number];

/** Parámetros del mapa que sobreviven a la redirección de una URL vieja. */
export const PARAMETROS_DEL_MAPA = ["vista", "fase", "sel"] as const;

type Entrada = Record<string, string | string[] | undefined>;

/**
 * La dirección de `/explorar` para una sección, conservando `vista`, `fase` y `sel` (el primer valor si vienen repetidos).
 * Los demás parámetros se descartan. Sirve para las redirecciones de `/territorios/lighthouse`, `/barrios/norte` y `/lotes`
 * y para los enlaces internos que apuntan al mapa.
 */
export function urlExplorar(seccion: SeccionExplorar, entrada: Entrada = {}): string {
  const query = new URLSearchParams();
  for (const nombre of PARAMETROS_DEL_MAPA) {
    const valor = entrada[nombre];
    const uno = Array.isArray(valor) ? valor[0] : valor;
    if (uno) query.set(nombre, uno);
  }
  const texto = query.toString();
  return `/explorar${texto ? `?${texto}` : ""}#${seccion}`;
}
