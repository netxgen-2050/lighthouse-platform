"use client";

import Link from "next/link";
import { TextoEstado } from "@/components/lotes/estado-del-lote";
import { useCompras } from "@/components/lotes/usar-compras";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { estadoConCompras } from "@/lib/lotes/compra";
import { textoSuperficieM2 } from "@/lib/territorios/biopueblo";
import { lotesDelGrupo, type GrupoLote } from "@/lib/territorios/loteo";

/** Todos los lotes con número, superficie y estado en texto y forma, y el enlace a su ficha. */
export function ListaLotes() {
  const idioma = useIdioma();
  const t = useTextos("lotes");
  const tl = useTextos("territorio").loteo;
  const { compras } = useCompras();
  return (
    <section aria-labelledby="lista-lotes-titulo" className="mt-4 grid gap-2">
      <h2 id="lista-lotes-titulo" className="text-lg font-semibold">
        {t.lista.listaTitulo}
      </h2>
      {(["primeros", "norte"] as GrupoLote[]).map((grupo) => (
      <div key={grupo} className="grid gap-2">
      <h3 className="font-semibold">{grupo === "primeros" ? tl.primerosTitulo : tl.listaTitulo}</h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {lotesDelGrupo(grupo).map((l) => (
          <li key={l.id}>
            <Link
              href={`/lotes/${l.id}`}
              className="block rounded-lg border border-faint bg-surface px-3 py-2 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
            >
              <span className="font-medium underline">{tl.lote(l.etiqueta)}</span>
              {" · "}
              {textoSuperficieM2(l.superficieM2, idioma)}
              {" · "}
              <TextoEstado estado={estadoConCompras(l.id, compras)} />
            </Link>
          </li>
        ))}
      </ul>
      </div>
      ))}
    </section>
  );
}
