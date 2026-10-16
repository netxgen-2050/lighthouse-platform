/**
 * Aviso de una página que todavía no se tradujo: se muestra solo con la plataforma en inglés, arriba de la página, que
 * queda en español. El aviso es inglés (por eso `lang="en"`); el contenido de la página va aparte, marcado como español.
 */
export function AvisoSinTraducir() {
  return (
    <p
      lang="en"
      className="mx-6 mt-4 w-fit rounded-lg sm:mx-10 border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink"
    >
      This page is only available in Spanish for now.
    </p>
  );
}
