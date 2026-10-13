import { expect, test as base } from "@playwright/test";

export { expect };
export type { Locator, Page } from "@playwright/test";

export type RolPrueba = "superadmin" | "admin-tribu" | "persona" | "ninguno";

/**
 * Emails de prueba (inventados, `.test` no existe en internet). Deben coincidir con `LH_PERSONAS` del servidor
 * que se prueba (que solo ajusta rol y perfil: cualquier otro email entra como Explorador): `playwright.config.ts` los
 * carga para el build local; contra un preview hay que tenerlos en su `LH_PERSONAS` o pasar otros con estas variables.
 * Los emails reales del equipo nunca van al repo.
 */
export const EMAILS: Record<Exclude<RolPrueba, "ninguno">, string> = {
  superadmin: process.env.E2E_EMAIL_SUPERADMIN ?? "super@prueba.test",
  "admin-tribu": process.env.E2E_EMAIL_ADMIN_TRIBU ?? "admin@prueba.test",
  persona: process.env.E2E_EMAIL_PERSONA ?? "persona@prueba.test",
};

/** Un email que no está en `LH_PERSONAS`: con el acceso abierto entra como Explorador. */
export const EMAIL_FUERA_DE_LISTA = "intruso@prueba.test";

export const COOKIE_PRUEBA = "lh-auth-prueba";

/** Prefijo con que la app guarda los datos de una persona en modo de prueba (ver `idPersona` en `lib/sesion/verificar.ts`). */
export function prefijoDe(email: string): string {
  return `u:prueba:${email.toLowerCase()}:`;
}

/** Plan de Sumarte con el que arranca la persona de prueba (el nivel sale de lo elegido en Sumarte). */
export type PlanPrueba = "explorador" | "miembro" | "ninguno";

type Opciones = { rol: RolPrueba; plan: PlanPrueba };

/**
 * `test` de todos los e2e: antes de navegar, la persona entra con el modo de prueba (cookie) y el almacenamiento
 * del navegador traduce las claves `lh-*` de los tests (sembrar y leer datos) a las claves con el prefijo de esa persona.
 * Con `test.use({ rol: "ninguno" })` no hay sesión (para probar Sumarte como puerta de entrada).
 * Con `test.use({ plan: "explorador" })` la persona arranca como Explorador; por defecto es Miembro, para que los e2e
 * que participan (Pactos, Semillas, Fogón, Compromisos) sigan pasando. `plan: "ninguno"` no siembra nada (queda Explorador).
 */
export const test = base.extend<Opciones>({
  rol: ["superadmin", { option: true }],
  plan: ["miembro", { option: true }],
  page: async ({ page, context, baseURL, rol, plan }, entregar) => {
    if (rol !== "ninguno" && baseURL) {
      const email = EMAILS[rol];
      await context.addCookies([{ name: COOKIE_PRUEBA, value: encodeURIComponent(email), url: baseURL }]);
      await page.addInitScript(([prefijo, planInicial]) => {
        const proto = Storage.prototype;
        const leer = proto.getItem;
        const guardar = proto.setItem;
        const quitar = proto.removeItem;
        // Las claves de la demo (lh-*, lighthouse.*) van con el prefijo de la persona; la app ya manda las suyas prefijadas.
        const propias = ["lh-ultima-persona", "lh-importacion-resuelta"];
        const mapear = (clave: string) =>
          typeof clave === "string" && (clave.startsWith("lh-") || clave.startsWith("lighthouse.")) && !propias.includes(clave)
            ? prefijo + clave
            : clave;
        proto.getItem = function (clave: string) {
          return leer.call(this, mapear(clave));
        };
        proto.setItem = function (clave: string, valor: string) {
          return guardar.call(this, mapear(clave), valor);
        };
        proto.removeItem = function (clave: string) {
          return quitar.call(this, mapear(clave));
        };
        // Lo elegido en Sumarte define el nivel: se siembra una sola vez (si la persona ya eligió algo, no se pisa).
        if (planInicial !== "ninguno") {
          try {
            if (window.localStorage.getItem("lh-sumarte") === null) {
              window.localStorage.setItem("lh-sumarte", JSON.stringify({ plan: planInicial }));
            }
          } catch {
            // Páginas sin almacenamiento (about:blank): no hay nada que sembrar.
          }
        }
      }, [prefijoDe(email), plan] as const);
    }
    await entregar(page);
  },
});
