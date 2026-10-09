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
