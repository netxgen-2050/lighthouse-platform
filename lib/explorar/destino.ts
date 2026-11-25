/** Las tres secciones de Explorar. Cada una tiene su página (spec explorar-paginas). */
export const SECCIONES_EXPLORAR = ["territorio", "barrio", "lotes"] as const;
export type SeccionExplorar = (typeof SECCIONES_EXPLORAR)[number];

/** La ruta de la página de cada sección. */
export const RUTA_SECCION: Record<SeccionExplorar, string> = {
  territorio: "/explorar/territorio",
  barrio: "/explorar/barrio-norte",
  lotes: "/explorar/lotes",
};

/** Parámetros del mapa que sobreviven a la redirección de una URL vieja. */
export const PARAMETROS_DEL_MAPA = ["vista", "fase", "sel"] as const;

type Entrada = Record<string, string | string[] | undefined>;

/**
 * La dirección de la página de una sección de Explorar, conservando `vista`, `fase` y `sel` (el primer valor si vienen repetidos),
 * sin ancla. Los demás parámetros se descartan. Sirve para las redirecciones de `/territorios/lighthouse`, `/barrios/norte` y
 * `/lotes` y para los enlaces internos que apuntan al mapa.
 */
export function urlExplorar(seccion: SeccionExplorar, entrada: Entrada = {}): string {
  const query = new URLSearchParams();
  for (const nombre of PARAMETROS_DEL_MAPA) {
    const valor = entrada[nombre];
    const uno = Array.isArray(valor) ? valor[0] : valor;
    if (uno) query.set(nombre, uno);
  }
  const texto = query.toString();
  return `${RUTA_SECCION[seccion]}${texto ? `?${texto}` : ""}`;
}
