import Link from "next/link";
import { destinosDeGrupo, etiquetaDeDestino } from "@/lib/navegacion";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";

/**
 * Subnavegación de Explorar: Territorio, Barrios (cuando exista), Lotes y Comunidades, arriba del contenido.
 * Son enlaces a páginas distintas (no pestañas de una sola página). `actual` es el href del destino marcado.
 * A 390 px se desplaza dentro de su propio contenedor si no entra, sin ensanchar la página.
 */
export async function SubnavExplorar({ actual }: { actual: string }) {
  const idioma = await idiomaDelPedido();
  const t = textos("marco", idioma);
  return (
    <nav aria-label={t.rail.subnavegacion} className="border-b border-line">
      <ul className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-8">
        {destinosDeGrupo("explorar").map((d) => {
          const esActual = d.href === actual;
          return (
            <li key={d.href} className="shrink-0">
              <Link
                href={d.href}
                aria-current={esActual ? "page" : undefined}
                className={`flex min-h-11 items-center border-b-2 px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-deep ${
                  esActual ? "border-ink font-bold text-ink" : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {etiquetaDeDestino(d, idioma)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
