import type { Page } from "@playwright/test";

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

/** Para los tests de "sin pedidos de red": infraestructura de terceros o pedidos HEAD (no llevan cuerpo ni datos). */
export function ignorarEnSinRed(r: { url(): string; method(): string }): boolean {
  return r.method() === "HEAD" || esInfraDeTerceros(r.url());
}
