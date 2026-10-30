import type { Page } from "@playwright/test";
import { VERSION_MANIFIESTO_VRN } from "../lib/manifiestos/lighthouse-vrn";

/**
 * SIEMBRA DE TEST (no es un flujo de la app): deja a la persona con la adhesión al manifiesto de Lighthouse VRN ya
 * registrada ("pedido", en la versión vigente), que es lo que hace falta para votar en el Fogón y repartir créditos en
 * las consultas. Solo la primera vez, para que recargar no pise lo que la pantalla guardó. Pasando `version` se siembra
 * una adhesión a otra versión (para probar que hay que volver a adherir).
 */
export async function conAdhesionAlManifiesto(page: Page, version: string = VERSION_MANIFIESTO_VRN) {
  await page.addInitScript((v) => {
    if (window.localStorage.getItem("lh-adhesion-version")) return;
    const membresias = JSON.parse(window.localStorage.getItem("lh-membresia") ?? "{}") as Record<string, string>;
    window.localStorage.setItem("lh-membresia", JSON.stringify({ ...membresias, lighthouse: membresias.lighthouse ?? "pedido" }));
    window.localStorage.setItem("lh-adhesion-version", JSON.stringify({ lighthouse: v }));
  }, version);
}

/** Deja el sello de identidad ya obtenido (solo la primera vez, para que recargar no pise lo que la pantalla guardó). */
export async function conIdentidadVerificada(page: Page) {
  await page.addInitScript(() => {
    if (window.localStorage.getItem("lh-kyc")) return;
    window.localStorage.setItem(
      "lh-kyc",
      JSON.stringify({ estado: "aprobado", enviado: "2026-10-01T12:00:00.000Z", aprobado: "2026-10-02T12:00:00.000Z" }),
    );
  });
}

/**
 * SIEMBRA DE TEST (no es un flujo de la app): igual que `conAdhesionAlManifiesto` (con `lighthouse: "pedido"` y la
 * versión vigente del manifiesto). Se mantiene el nombre porque lo usan los tests de equipos y territorio.
 */
export async function conAdhesionAlLighthouse(page: Page) {
  await conAdhesionAlManifiesto(page);
}

/**
 * SIEMBRA DE TEST (no es un flujo de la app): escribe en `compartido:pactos-constancias` la respuesta de la tribu a la
 * última propuesta pendiente y recarga la página, como si quien lidera hubiera respondido desde `/pactos/responder`.
 * Los tests que solo necesitan "un pacto aceptado" (Semillas, Mi recorrido, axe) la usan para no repetir el cambio de persona;
 * el flujo real de las dos personas se prueba en `e2e/pactos-dos-partes.spec.ts`.
 */
export async function sembrarRespuestaDeLaTribu(
  page: Page,
  respuesta: "acepta" | "no-acepta",
  motivo = "Por ahora no puede ser",
) {
  await page.evaluate(
    ([esquema, texto]) => {
      type C = { id: string; esquema: string; sobre: string; version: number; apuntaA: string | null };
      const clave = "compartido:pactos-constancias";
      const lista = JSON.parse(window.localStorage.getItem(clave) ?? "[]") as C[];
      const respondida = (c: C) => lista.some((r) => (r.esquema === "pacto-acepta" || r.esquema === "pacto-no-acepta") && r.apuntaA === c.id);
      const revocada = (c: C) => lista.some((r) => r.esquema === "revoca" && r.apuntaA === c.id);
      const propuesta = [...lista].reverse().find((c) => c.esquema === "pacto-propone" && !respondida(c) && !revocada(c));
      if (!propuesta) throw new Error("No hay una propuesta pendiente para responder");
      const comunidad = propuesta.sobre.slice("pacto:".length).split(":")[0];
      lista.push({
        id: `p${lista.length + 1}-${esquema}`,
        esquema,
        afirma: comunidad === "lighthouse" ? "comunidad:lighthouse" : `tribu:${comunidad}`,
        por: "prueba:tribu-de-prueba@prueba.test",
        sobre: propuesta.sobre,
        version: propuesta.version,
        apuntaA: propuesta.id,
        cuando: new Date().toISOString(),
        revocable: esquema === "pacto-acepta",
        datos: esquema === "pacto-no-acepta" ? { motivo: texto } : {},
      } as C & Record<string, unknown>);
      window.localStorage.setItem(clave, JSON.stringify(lista));
    },
    [`pacto-${respuesta}`, motivo] as const,
  );
  await page.reload();
}

/**
 * Pedidos de infraestructura de terceros que no son la app ni llevan datos de la persona:
 * la barra de Vercel en los previews (vercel.live) y el SDK de login (Privy y WalletConnect).
 * Los tests de "sin pedidos de red" los ignoran.
 */
export function esInfraDeTerceros(url: string): boolean {
  const host = new URL(url).hostname;
  return (
    host === "vercel.live" ||
    host.endsWith(".vercel.live") ||
    host === "privy.io" ||
    host.endsWith(".privy.io") ||
    host.endsWith(".walletconnect.com") ||
    host.endsWith(".walletconnect.org")
  );
}

/** Para los tests de "sin pedidos de red": infraestructura de terceros o pedidos HEAD y OPTIONS (no llevan cuerpo ni datos). */
export function ignorarEnSinRed(r: { url(): string; method(): string }): boolean {
  return r.method() === "HEAD" || r.method() === "OPTIONS" || esInfraDeTerceros(r.url());
}
