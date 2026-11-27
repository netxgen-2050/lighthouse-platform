import { expect, test as base } from "@playwright/test";
// Versión de la política vigente: el consentimiento sembrado tiene que ser de esta versión.
import { VERSION_POLITICA } from "@/lib/privacidad/consentimiento";

export { expect };
export const VERSION_PRUEBA = VERSION_POLITICA;
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
export type PlanPrueba = "explorador" | "miembro" | "fundador" | "ninguno";

/**
 * Consentimiento de privacidad con el que arranca la persona: "completo" (política y datos sensibles del KYC, el valor por
 * defecto para que los e2e existentes no pasen por la pantalla de consentimiento), "basico" (solo la política) o "ninguno".
 */
export type ConsentimientoPrueba = "completo" | "basico" | "ninguno";

/**
 * Con qué email entra la persona: "fija" (el de `EMAILS`, el de siempre) o "propia" (uno inventado para ese test). Desde
 * `consentimiento-en-la-base` el consentimiento vive en la base del servidor, que **comparten todos los tests** (y los
 * workers en paralelo): un test que acepta, retira o necesita no haber aceptado nunca tiene que usar su propio email, o le
 * cambiaría el estado a los demás. Con `consentimiento: "ninguno"` la identidad es siempre "propia".
 */
export type IdentidadPrueba = "fija" | "propia";

type Opciones = { rol: RolPrueba; plan: PlanPrueba; consentimiento: ConsentimientoPrueba; identidad: IdentidadPrueba };

/** Un email de prueba que ningún otro test usa (`.test` no existe en internet: ADR-008). */
export function emailUnico(local = "persona"): string {
  return `${local}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}@prueba.test`;
}

/** Todos los emails fijos con los que un e2e puede entrar (por la cookie o por "Entrar como…"). */
const EMAILS_CONOCIDOS = [...Object.values(EMAILS), EMAIL_FUERA_DE_LISTA, "nueva@prueba.test"];

type Contexto = import("@playwright/test").BrowserContext;

/**
 * Siembra el consentimiento por la API, como lo haría la persona (`POST /api/consentimientos` con el modo de prueba, design §4).
 * Es idempotente: si ya aceptó la versión vigente no escribe nada.
 */
async function sembrarConsentimiento(context: Contexto, baseURL: string, emails: string[]): Promise<void> {
  await Promise.all(
    emails.map(async (email) => {
      const r = await context.request.post(`${baseURL}/api/consentimientos`, {
        headers: { "x-lh-prueba": email },
        data: { accion: "acepta", canal: "al-entrar", version: VERSION_POLITICA },
      });
      if (!r.ok()) throw new Error(`No se pudo sembrar el consentimiento de una persona de prueba (${r.status()}).`);
    }),
  );
}

/**
 * `test` de todos los e2e: antes de navegar, la persona entra con el modo de prueba (cookie) y el almacenamiento
 * del navegador traduce las claves `lh-*` de los tests (sembrar y leer datos) a las claves con el prefijo de esa persona.
 * Con `test.use({ rol: "ninguno" })` no hay sesión (para probar Sumarte como puerta de entrada).
 * Con `test.use({ plan: "explorador" })` la persona arranca como Explorador; por defecto es Miembro, para que los e2e
 * que participan (Pactos, Semillas, Fogón) sigan pasando. `plan: "fundador"` siembra un Pase Fundador Brote (simulado).
 * `plan: "ninguno"` no siembra nada (queda Explorador).
 */
export const test = base.extend<Opciones & { emailActual: string }>({
  rol: ["superadmin", { option: true }],
  plan: ["miembro", { option: true }],
  consentimiento: ["completo", { option: true }],
  identidad: ["fija", { option: true }],
  /** El email con el que entra este test (vacío sin sesión). */
  emailActual: async ({ rol, consentimiento, identidad }, entregar) => {
    if (rol === "ninguno") return entregar("");
    await entregar(identidad === "propia" || consentimiento === "ninguno" ? emailUnico(rol) : EMAILS[rol]);
  },
  page: async ({ page, context, baseURL, rol, plan, consentimiento, emailActual }, entregar) => {
    if (consentimiento !== "ninguno") {
      // El consentimiento de las personas de prueba se siembra en el servidor, por la API (con o sin sesión en este test, porque
      // algunos entran después con "Entrar como…"). Los emails fijos que no usa este test se siembran igual: es idempotente.
      // El de los datos sensibles del KYC sigue en el navegador (todavía no se mudó, `datos-en-la-nube`).
      if (baseURL) await sembrarConsentimiento(context, baseURL, [...new Set([...EMAILS_CONOCIDOS, ...(emailActual ? [emailActual] : [])])]);
      await page.addInitScript(
        ([prefijos, version, completo]) => {
          if (!completo) return;
          try {
            for (const prefijo of prefijos) {
              const clave = `${prefijo}lh-consentimiento-sensibles`;
              if (window.localStorage.getItem(clave) !== null) continue;
              window.localStorage.setItem(clave, JSON.stringify({ version, aceptadoEn: new Date().toISOString() }));
            }
          } catch {
            // Páginas sin almacenamiento (about:blank): no hay nada que sembrar.
          }
        },
        [[...EMAILS_CONOCIDOS, ...(emailActual ? [emailActual] : [])].map(prefijoDe), VERSION_POLITICA, consentimiento === "completo"] as const,
      );
    }
    if (rol !== "ninguno" && baseURL) {
      const email = emailActual;
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
              window.localStorage.setItem(
                "lh-sumarte",
                JSON.stringify(planInicial === "fundador" ? { plan: "miembro", pase: "brote", nivelPase: "brote" } : { plan: planInicial }),
              );
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

// --- Ayudas para los tests de consentimiento (el consentimiento vive en el servidor) -----------------------------------

type PeticionesApi = import("@playwright/test").APIRequestContext;

/** Lo que el servidor guardó del consentimiento de ese email de prueba (estado vigente y todas las filas del libro). */
export async function consentimientoDe(request: PeticionesApi, email: string) {
  const r = await request.get("/api/consentimientos?filas=1", { headers: { "x-lh-prueba": email } });
  if (!r.ok()) throw new Error(`No se pudo leer el consentimiento de prueba (${r.status()}).`);
  return (await r.json()) as {
    estado: {
      general: "vigente" | "pendiente" | "retirado";
      version: string | null;
      registradoAt: string | null;
      canal: string | null;
      novedades: boolean;
      novedadesRegistro: { evento: string; version: string; registradoAt: string; canal: string | null } | null;
    };
    filas?: { tipo: string; evento: string; version: string; canal: string | null }[];
  };
}

/** Registra en el servidor, como lo haría esa persona, un `acepta` (o el pedido que se pase). Siembra de test, no un flujo de la app. */
export async function registrarConsentimientoDe(request: PeticionesApi, email: string, cuerpo: Record<string, unknown> = {}) {
  const r = await request.post("/api/consentimientos", {
    headers: { "x-lh-prueba": email },
    data: { accion: "acepta", canal: "al-entrar", version: VERSION_POLITICA, ...cuerpo },
  });
  if (!r.ok()) throw new Error(`No se pudo registrar el consentimiento de prueba (${r.status()}).`);
}

// --- Ayudas para los tests de lotes (las reservas viven en el servidor: `lotes-en-la-base`) -----------------------------

/** Lo que la persona vio al reservar, para sembrar por la API (los números son de ejemplo). */
export const VIO_PRUEBA = { precio: 100_000, aporte: 5_000, expensa: 200, version: "prueba" } as const;

/**
 * Libera lotes como el super admin de prueba: manda `deshacer` por la ruta normal (agrega una fila `deshace`; ninguna ruta
 * toca el trigger del libro). Cada archivo de e2e la llama en su `beforeAll` con SUS lotes, para no heredar reservas de una
 * corrida anterior contra el mismo preview. Sin nada vigente es un no-op.
 */
export async function liberarLotes(request: PeticionesApi, ids: string[]) {
  await registrarConsentimientoDe(request, EMAILS.superadmin);
  for (const loteId of ids) {
    const r = await request.post("/api/lotes/reservas", { headers: { "x-lh-prueba": EMAILS.superadmin }, data: { accion: "deshacer", loteId } });
    if (!r.ok()) throw new Error(`No se pudo liberar un lote de prueba (${r.status()}).`);
  }
}

/** Siembra una reserva por la API, como esa persona (con consentimiento sembrado). `pagar: true` la deja pagada (simulado). */
export async function reservarPorApi(
  request: PeticionesApi,
  email: string,
  loteId: string,
  opciones: { opcion?: string; pagar?: boolean; vio?: Record<string, unknown> } = {},
) {
  await registrarConsentimientoDe(request, email);
  const headers = { "x-lh-prueba": email };
  const r = await request.post("/api/lotes/reservas", {
    headers,
    data: { accion: "reservar", loteId, opcion: opciones.opcion ?? "solo-lote", vio: opciones.vio ?? VIO_PRUEBA },
  });
  if (!r.ok()) throw new Error(`No se pudo sembrar una reserva de prueba (${r.status()}).`);
  if (opciones.pagar) {
    const p = await request.post("/api/lotes/reservas", { headers, data: { accion: "pagar", loteId } });
    if (!p.ok()) throw new Error(`No se pudo sembrar un pago de prueba (${p.status()}).`);
  }
}

/** Las compras vigentes de esa persona, leídas de la API. */
export async function comprasPorApi(request: PeticionesApi, email: string) {
  const r = await request.get("/api/lotes/reservas", { headers: { "x-lh-prueba": email } });
  if (!r.ok()) throw new Error(`No se pudieron leer las reservas de prueba (${r.status()}).`);
  return ((await r.json()) as { compras: { loteId: string; paso: string }[] }).compras;
}

/**
 * Hace que el panel "Entrar como…" de Sumarte ofrezca ESE email (en lugar de los de `LH_PERSONAS`): así un test que necesita una
 * persona sin consentimiento previo entra con un email propio, que ningún otro test comparte en la base del servidor.
 */
export async function panelConEmail(page: import("@playwright/test").Page, email: string) {
  await page.route("**/api/sesion/prueba", (ruta) => ruta.fulfill({ json: { activo: true, emails: [email] } }));
}
