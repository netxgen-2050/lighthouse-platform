type Env = Record<string, string | undefined>;

/**
 * ¿Existe la prueba? Solo con `LH_PRUEBA_CANDIDE=1`, en cualquier entorno. El código no distingue Production (decisión de Gus,
 * 25-nov-2026): la llave es la variable, y en Production solo la carga Gus, después de ver la prueba andar en dev.
 */
export function pruebaHabilitada(env: Env = process.env): boolean {
  return env.LH_PRUEBA_CANDIDE === "1";
}

/** Modo simulado: sin red ni Candide (e2e y para mirar la página sin clave). */
export function modoSimulado(env: Env = process.env): boolean {
  return env.LH_PRUEBA_CANDIDE_SIMULADO === "1";
}
