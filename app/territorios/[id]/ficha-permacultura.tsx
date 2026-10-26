"use client";

import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { sinDato } from "@/lib/idioma/formatos";
import { textoHectareas } from "@/lib/territorios/biopueblo";
import { buscarElementoPermacultura, resumenPermacultura } from "@/lib/territorios/permacultura";

type Props = { seleccion: string | null };

// Ficha de la alternativa de permacultura. A propósito no tiene botones de consultar, reservar ni comprar:
// los clusters y las zonas son una idea de diseño, no lotes.
export function FichaPermacultura({ seleccion }: Props) {
  const idioma = useIdioma();
  const tx = useTextos("territorio");
  const pc = tx.permacultura;
  const el = seleccion ? buscarElementoPermacultura(seleccion) : undefined;

  if (el) {
    const t = el.textos[idioma];
    const esPoligono = el.geometria.type === "Polygon" || el.geometria.type === "MultiPolygon";
    return (
      <div className="grid gap-3">
        <div>
          <p className="text-sm text-muted">{pc.capas[el.capa]}</p>
          <h2 className="text-xl font-semibold">{t.nombre}</h2>
        </div>
        <p className="text-sm">
          <strong>{pc.zona}</strong> {t.zona}
        </p>
        {esPoligono && (
          <p className="text-sm">
            <strong>{tx.ficha.superficie}</strong> {textoHectareas(el.areaHa, idioma)}
          </p>
        )}
        <p>{t.descripcion}</p>
        <p className="text-sm text-muted">
          <strong>{pc.marca}</strong> {el.marca === "[criterio]" ? pc.marcaCriterio : el.marca}
        </p>
        <p className="text-sm text-muted">{pc.aviso}</p>
      </div>
    );
  }

  const r = resumenPermacultura();
  return (
    <div className="grid gap-3">
      <h2 className="text-xl font-semibold">{pc.resumenTitulo}</h2>
      <p className="text-sm">{pc.resumen}</p>
      <p className="text-sm">
        <strong>{pc.proporcion}</strong> {r.proporcionEcologica === undefined ? sinDato(idioma) : `${r.proporcionEcologica} %`}
        <span className="block text-muted">{pc.proporcionNota}</span>
      </p>
      <p className="text-sm">
        <strong>{pc.cuenca}</strong> {r.cuencaHa === undefined ? sinDato(idioma) : textoHectareas(r.cuencaHa, idioma)}
        <span className="block text-muted">{pc.cuencaNota}</span>
      </p>
      <div className="grid gap-1 rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        <p className="font-semibold">{pc.aviso}</p>
        <p>{pc.avisoDiseno}</p>
      </div>
      <p className="text-sm text-muted">{pc.version(r.version, r.fecha)}</p>
      <p className="text-sm text-muted">{pc.elegiUno}</p>
    </div>
  );
}
