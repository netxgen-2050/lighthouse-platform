"use client";

import Link from "next/link";
import { EstadoAdministrativo } from "@/components/estado-administrativo";
import { EstadoDeUnLote } from "@/components/lotes/estado-del-lote";
import { TerminoLegal } from "@/components/termino-legal";
import { usdEn } from "@/lib/lotes/formato";
import { precioLote } from "@/lib/lotes/modelo";
import { faroEn } from "@/lib/bien-comun/formato";
import { faroDeLote } from "@/lib/bien-comun/modelo";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textoSuperficieM2 } from "@/lib/territorios/biopueblo";
import { fuenteDelLoteo, listarLotes } from "@/lib/territorios/loteo";
import type { EstadoLote } from "@/lib/territorios/loteo-estados";
import { proyectoDeGrupo } from "@/lib/legal/estado-administrativo";
import { fuenteTexto, parcelasPorUso, parcelasSinUso, resumenDePrimeros, resumenDelLoteo } from "@/lib/territorios/loteo-textos";
import { MARCA_EJEMPLO } from "./ficha-frente";

// Vista Lotes (spec loteo-norte): marca provisoria, estado en texto y forma, panel del lote y resumen.
// El precio de ejemplo se ve también acá; las acciones están en la ficha (`lote-ficha-y-compra`).

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
          {fuenteDelLoteo() === "martin" && <> {t.lecturaMartin}</>}
        </p>
      )}
    </>
  );
}

/** Ficha de un lote elegido: nombre, superficie, precio de ejemplo, estado, marca y estado administrativo. Sin acciones. */
export function FichaLote({ id }: { id: string }) {
  const idioma = useIdioma();
  const tx = useTextos("territorio");
  const lt = useTextos("lotes");
  const tb = useTextos("biencomun");
  const lote = listarLotes().find((l) => l.id === id);
  if (!lote) return null;
  const precio = precioLote(lote.superficieM2);
  return (
    <div className="grid gap-3">
      <p className="text-sm text-muted" translate="no">Lighthouse VRN</p>
      <h2 className="text-xl font-semibold">{tx.loteo.lote(lote.numero)}</h2>
      <p className="text-sm">
        <strong>{tx.ficha.superficie}</strong> {textoSuperficieM2(lote.superficieM2, idioma)}
      </p>
      <p className="text-sm">
        <strong>{lt.precio.titulo}:</strong>{" "}
        {precio === null ? lt.precio.sinSuperficie : lt.precio.valor(usdEn(precio, idioma))}
        <TerminoLegal clave="precioreferencia" idioma={idioma} />
      </p>
      <p className="text-sm">
        <strong>{tb.ficha.faroPanel}:</strong> {faroEn(faroDeLote(lote.superficieM2), idioma)}
        <TerminoLegal clave="tokenbiencomun" idioma={idioma} />
      </p>
      <p className="text-sm font-medium">
        {tx.ficha.estado} <EstadoDeUnLote id={lote.id} />
      </p>
      <MarcaLoteo conFuente />
      <p className="text-sm text-muted">{tx.loteo.estadosEjemplo}</p>
      <EstadoAdministrativo proyecto={proyectoDeGrupo(lote.grupo)} compacto idioma={idioma} />
      <Link
        href={`/lotes/${lote.id}`}
        className="w-fit rounded-lg bg-deep px-4 py-1.5 text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
      >
        {lt.lista.verLaFicha}
      </Link>
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
      {resumenDePrimeros(idioma) && <p className="text-sm font-medium">{resumenDePrimeros(idioma)}</p>}
      <p className="text-sm">{resumenDelLoteo(idioma)}</p>
      {parcelasSinUso(idioma) && <p className="text-sm">{parcelasSinUso(idioma)}</p>}
      {parcelasPorUso(idioma).length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer font-medium">{t.parcelasTitulo}</summary>
          <ul className="mt-1 grid gap-1">
            {parcelasPorUso(idioma).map((p) => (
              <li key={p.uso}>
                <strong>{p.codigos.join(", ")}:</strong> {p.uso}
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="text-sm font-medium">{t.sinFases}</p>
      <p className="text-sm text-muted">{t.elegiUno}</p>
    </div>
  );
}
