"use client";

import { BarraAvance } from "@/components/ui/barra-avance";
import { Boton } from "@/components/ui/boton";
import { ChipEstado, type EstadoChip } from "@/components/ui/chip-estado";
import { enteroEn } from "@/lib/bien-comun/formato";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { porcentajeEn, usdEn } from "@/lib/lotes/formato";
import type { Portafolio } from "@/lib/mi-tierra/portafolio";

/** El estado del chip del encabezado: el más avanzado entre los lotes (vendido > en cuotas > reservado). */
function estadoPrincipal(p: Portafolio): EstadoChip {
  if (p.lotes.some((l) => l.estado === "vendido")) return "vendido";
  if (p.lotes.some((l) => l.estado === "enCuotas")) return "enCuotas";
  return "reservado";
}

/**
 * Encabezado de Mi tierra (ux-mi-tierra, design §1 y §2): lo pagado como número principal (sale del portafolio, nunca escrito
 * a mano), la barra con su porcentaje en texto y las acciones que ya existen. No muestra rendimiento, APY ni ganancia.
 */
export function EncabezadoMiTierra({ portafolio }: { portafolio: Portafolio }) {
  const idioma = useIdioma();
  const t = useTextos("miTierra").encabezado;
  const comunes = useTextos("comunes");
  const { totales, lotes } = portafolio;
  const varios = lotes.length > 1;
  const primero = lotes[0];
  const conPagoPendiente = lotes.find((l) => l.estado === "reservado" && l.plan.tipo !== "no-entra" && l.plan.tipo !== "sin-dato");
  const sinPagos = totales.pagado === 0;
  const cuotas = totales.cuotasDelUnico;
  return (
    <section aria-labelledby="mt-numero-etiqueta" className="grid gap-4 border-b border-line pb-6">
      <div className="grid gap-1">
        <p id="mt-numero-etiqueta" className="text-[13px] text-muted">
          {varios ? t.variosLotes : t.unLote}
        </p>
        <p
          aria-labelledby="mt-numero-etiqueta"
          data-numero-principal
          className="font-mono text-[32px] font-semibold leading-tight tabular-nums text-ink sm:text-[40px]"
        >
          {totales.pagado === null ? comunes.sinDato : usdEn(totales.pagado, idioma)}
        </p>
        {sinPagos && <p className="text-sm text-muted">{t.sinPagos}</p>}
      </div>
      <div className="grid max-w-xl gap-1">
        {totales.fraccionPagada !== null && totales.totalPlanes !== null && (
          <>
            <BarraAvance etiqueta={t.avance} fraccion={totales.fraccionPagada} />
            <p className="text-sm text-muted">
              {t.avanceDe(porcentajeEn(totales.fraccionPagada, idioma), usdEn(totales.totalPlanes, idioma))}
              {cuotas && ` · ${t.cuotaDe(enteroEn(cuotas.pagadas, idioma), enteroEn(cuotas.total, idioma))}`}
            </p>
          </>
        )}
      </div>
      <div>
        <ChipEstado estado={estadoPrincipal(portafolio)} />
      </div>
      <div className="flex flex-wrap gap-2">
        {conPagoPendiente ? (
          <>
            <Boton href={`/lotes/${conPagoPendiente.loteId}`}>{t.primerPago}</Boton>
            <Boton href={varios ? "#mt-posiciones" : `/lotes/${primero.loteId}`} variante="secundario">
              {varios ? t.verLotes : t.verLote}
            </Boton>
          </>
        ) : (
          <Boton href={varios ? "#mt-posiciones" : `/lotes/${primero.loteId}`}>{varios ? t.verLotes : t.verLote}</Boton>
        )}
        <Boton href="#mt-actividad" variante="secundario">
          {t.actividad}
        </Boton>
      </div>
    </section>
  );
}
