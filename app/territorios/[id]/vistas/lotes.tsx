"use client";

import { EstadoAdministrativo } from "@/components/estado-administrativo";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textoSuperficieM2 } from "@/lib/territorios/biopueblo";
import { fuenteDelLoteo, listarLotes } from "@/lib/territorios/loteo";
import { estadoDeLote, type EstadoLote } from "@/lib/territorios/loteo-estados";
import { fuenteTexto, resumenDelLoteo } from "@/lib/territorios/loteo-textos";
import { MARCA_EJEMPLO } from "./ficha-frente";

// Vista Lotes (spec loteo-norte): marca provisoria, estado en texto y forma, panel del lote y resumen.
// Sin precios ni acciones: eso es `lote-ficha-y-compra`.

const GLIFO: Record<EstadoLote, string> = { disponible: "●", reservado: "◐", vendido: "✕" };

/** El estado se dice con una palabra; el símbolo es decorativo. */
export function EstadoDeLote({ estado }: { estado: EstadoLote }) {
  const tx = useTextos("territorio");
  return (
    <>
      <span aria-hidden="true">{GLIFO[estado]} </span>
      {tx.loteo.estado[estado]}
    </>
  );
}

/** "Loteo provisorio, ilustrativo", más la fuente y, con el boceto, lo que no considera. */
export function MarcaLoteo({ conFuente = false }: { conFuente?: boolean }) {
  const idioma = useIdioma();
  const t = useTextos("territorio").loteo;
  return (
    <>
      <p className={MARCA_EJEMPLO}>{t.marca}</p>
      {conFuente && (
        <p className="text-sm text-muted">
          {fuenteTexto(idioma)}
          {fuenteDelLoteo() === "ilustrativa" && <> {t.limites}</>}
        </p>
      )}
    </>
  );
}

/** Ficha de un lote elegido: nombre, superficie, estado, marca y estado administrativo. Sin acciones. */
export function FichaLote({ id }: { id: string }) {
  const idioma = useIdioma();
  const tx = useTextos("territorio");
  const lote = listarLotes().find((l) => l.id === id);
  if (!lote) return null;
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted" translate="no">Lighthouse VRN</p>
      <h2 className="text-xl font-semibold">{tx.loteo.lote(lote.numero)}</h2>
      <p className="text-sm">
        <strong>{tx.ficha.superficie}</strong> {textoSuperficieM2(lote.superficieM2, idioma)}
      </p>
      <p className="text-sm font-medium">
        {tx.ficha.estado} <EstadoDeLote estado={estadoDeLote(lote.id)} />
      </p>
      <MarcaLoteo conFuente />
      <p className="text-sm text-muted">{tx.loteo.estadosEjemplo}</p>
      <EstadoAdministrativo proyecto="lighthouse-norte" compacto idioma={idioma} />
    </div>
  );
}

/** Panel de la vista Lotes cuando no hay nada elegido. */
export function PanelLotes() {
  const idioma = useIdioma();
  const tx = useTextos("territorio");
  const t = tx.loteo;
  return (
    <div className="grid gap-3">
      <h2 className="text-xl font-semibold">{t.panelTitulo}</h2>
      <MarcaLoteo conFuente />
      <p className="text-sm">{resumenDelLoteo(idioma)}</p>
      <p className="text-sm font-medium">{t.sinFases}</p>
      <p className="text-sm text-muted">{t.elegiUno}</p>
    </div>
  );
}
