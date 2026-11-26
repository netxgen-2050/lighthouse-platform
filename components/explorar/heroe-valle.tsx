import Image from "next/image";
import type { ReactNode } from "react";
import { CLASE_DESVANECIDO_DEL_HEROE, CLASE_FONDO_DEL_TEXTO_DEL_HEROE } from "./heroe-valle-clases";

/**
 * Foto del valle a sangre dentro del área de contenido (el layout no pone padding al `<main>`), con el contenido directo encima,
 * sin caja translúcida. La foto es decorativa (`alt=""`); una franja superior sin texto la desvanece hacia el color de fondo del tema y
 * todo el bloque de texto lleva ese color al 80 %, así el contraste se sostiene en los dos temas con cualquier alto de contenido.
 * La leyenda "Imagen ilustrativa" lleva su propio fondo. Sin parallax ni animación.
 */
export function HeroeValle({ leyenda, children }: { leyenda: string; children: ReactNode }) {
  return (
    <section className="relative isolate flex flex-col justify-end overflow-hidden">
      <Image src="/imagenes/lighthouse-valle.webp" alt="" fill priority sizes="100vw" className="-z-20 object-cover" />
      <div aria-hidden="true" className={`h-32 sm:h-44 ${CLASE_DESVANECIDO_DEL_HEROE}`} />
      <div className={CLASE_FONDO_DEL_TEXTO_DEL_HEROE}>
        <div className="mx-auto grid w-full max-w-5xl gap-4 px-6 pb-8 pt-2 sm:px-10">{children}</div>
      </div>
      <p className="absolute right-3 top-3 rounded bg-bg/85 px-2 py-1 text-xs text-ink">{leyenda}</p>
    </section>
  );
}
