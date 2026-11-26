import Image from "next/image";
import type { ReactNode } from "react";
import { CLASE_DEGRADADO_DEL_HEROE } from "./heroe-valle-clases";

/**
 * Foto del valle a sangre dentro del área de contenido (el layout no pone padding al `<main>`), con el contenido directo encima,
 * sin caja translúcida. La foto es decorativa (`alt=""`); un degradado con el color de fondo del tema (0 % arriba, 90 % abajo)
 * sostiene el contraste del texto en los dos temas. El alto sigue al contenido (sin `100vh`). La leyenda "Imagen ilustrativa"
 * lleva su propio fondo. Sin parallax ni animación.
 */
export function HeroeValle({ leyenda, children }: { leyenda: string; children: ReactNode }) {
  return (
    <section className="relative isolate flex flex-col justify-end overflow-hidden">
      <Image src="/imagenes/lighthouse-valle.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden="true" className={`absolute inset-0 -z-10 ${CLASE_DEGRADADO_DEL_HEROE}`} />
      <div className="mx-auto grid w-full max-w-5xl gap-4 px-6 pb-8 pt-32 sm:px-10 sm:pt-44">{children}</div>
      <p className="absolute right-3 top-3 rounded bg-bg/85 px-2 py-1 text-xs text-ink">{leyenda}</p>
    </section>
  );
}
