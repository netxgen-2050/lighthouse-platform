/** Las dos variables que deciden si existe el modo de prueba (se leen explícitas para no pasar todo `process.env`). */
export function entornoDeSesion() {
  return { LH_AUTH_PRUEBA: process.env.LH_AUTH_PRUEBA, VERCEL_ENV: process.env.VERCEL_ENV };
}
