import { EnEspanol } from "@/components/en-espanol";
import { EstadoAdministrativo } from "@/components/estado-administrativo";
import { Aviso } from "@/components/ui/aviso";
import type { IdProyecto } from "@/lib/legal/estado-administrativo";
import type { Idioma } from "@/lib/idioma/tipos";

/**
 * Los estados administrativos de una vista con lotes (regla C1, Ord. 173/2026) en un solo bloque `legal` (ux-base, design §4).
 * Cada proyecto conserva su `section`, su `aria-label` y su texto de siempre: solo cambia que van juntos y con un solo borde.
 * El estado de Soluna sigue en español (marcado) hasta `idioma-legal`.
 */
export function EstadosAdministrativos({ proyectos, idioma = "es" }: { proyectos: readonly IdProyecto[]; idioma?: Idioma }) {
  return (
    <Aviso tono="legal" rol={null} className="mt-4">
      <div className="grid gap-3 divide-y divide-line [&>*:not(:first-child)]:pt-3">
        {proyectos.map((p) =>
          p === "soluna" ? (
            <EnEspanol key={p}>
              <EstadoAdministrativo proyecto={p} enGrupo />
            </EnEspanol>
          ) : (
            <EstadoAdministrativo key={p} proyecto={p} idioma={idioma} enGrupo />
          ),
        )}
      </div>
    </Aviso>
  );
}
