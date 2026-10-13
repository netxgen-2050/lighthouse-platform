/** Las variables que deciden el modo de prueba y el acceso (se leen explícitas para no pasar todo `process.env`). */
export function entornoDeSesion() {
  return { LH_AUTH_PRUEBA: process.env.LH_AUTH_PRUEBA, VERCEL_ENV: process.env.VERCEL_ENV, LH_ACCESO: process.env.LH_ACCESO };
}
