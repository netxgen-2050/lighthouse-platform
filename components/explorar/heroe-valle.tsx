import Image from "next/image";
import type { ReactNode } from "react";
import { CLASE_FONDO_DEL_TEXTO } from "./heroe-valle-clases";

/**
 * Foto del valle a sangre dentro del área de contenido (el layout no pone padding al `<main>`), con el contenido encima.
 * La foto es decorativa (`alt=""`); un degradado con el color de fondo del tema sostiene el contraste del texto en los dos
 * temas y la leyenda lleva su propio fondo. Sin parallax ni animación.
 */
export function HeroeValle({ leyenda, children }: { leyenda: string; children: ReactNode }) {
  return (
    <section className="relative isolate flex min-h-[28rem] flex-col justify-end overflow-hidden sm:min-h-[60vh]">
      <Image src="/imagenes/lighthouse-valle.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/80 to-bg/30" />
      <div className="mx-auto w-full max-w-5xl px-6 pb-10 pt-8 sm:px-10">
        {/* El texto va sobre su propio fondo: así el contraste no depende de qué parte de la foto quede detrás. */}
        <div className={CLASE_FONDO_DEL_TEXTO}>{children}</div>
      </div>
      <p className="absolute right-3 top-3 rounded bg-bg/85 px-2 py-1 text-xs text-ink">{leyenda}</p>
    </section>
  );
}
