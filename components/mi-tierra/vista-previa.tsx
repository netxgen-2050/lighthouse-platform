"use client";

import { MapPin, Sprout } from "lucide-react";
import { BarraAvance } from "@/components/ui/barra-avance";
import { enteroEn, faroEn } from "@/lib/bien-comun/formato";
import { PLAN_CUOTAS, faroDelPlan, planDeLote } from "@/lib/bien-comun/modelo";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { usdEn } from "@/lib/lotes/formato";
import { precioLote } from "@/lib/lotes/modelo";
import { lotesDelGrupo } from "@/lib/territorios/loteo";
import { FilaPosicion } from "./fila-posicion";

/**
 * Vista previa atenuada del estado vacío (ux-mi-tierra, design §5): cómo se ve Mi tierra con un lote. Los valores son de ejemplo y
 * salen de los módulos del modelo (nada escrito a mano); cada uno lleva la marca "ejemplo". El padre la oculta a los lectores de pantalla.
 */
export function VistaPreviaMiTierra() {
  const idioma = useIdioma();
  const t = useTextos("miTierra");
  const lote = lotesDelGrupo("norte")[0];
  const precio = lote ? precioLote(lote.superficieM2) : null;
  const plan = planDeLote(precio, PLAN_CUOTAS.dePartida);
  const faro = lote ? faroDelPlan(lote.superficieM2, PLAN_CUOTAS.dePartida) : null;
  const fraccion = plan && precio ? plan.anticipo / precio : null;
  const ej = t.sinCompras.ejemplo;
  return (
    <div className="grid gap-3 rounded-lg border border-dashed border-line p-4">
      <p className="text-[13px] text-muted">
        {t.encabezado.unLote} · {ej}
      </p>
      <p className="font-mono text-[32px] font-semibold leading-tight tabular-nums text-ink">{usdEn(plan?.anticipo ?? null, idioma)}</p>
      <BarraAvance etiqueta={t.encabezado.avance} fraccion={fraccion} />
      <ul className="m-0 grid list-none divide-y divide-line p-0">
        <li>
          <FilaPosicion
            icono={<MapPin size={16} />}
            nombre={lote ? t.posiciones.lote(lote.numero) : t.posiciones.titulo}
            detalle={`${t.posiciones.estados.enCuotas} · ${ej}`}
            valor={t.posiciones.cuotas("0", enteroEn(plan?.cuotas ?? null, idioma))}
          />
        </li>
        <li>
          <FilaPosicion icono={<Sprout size={16} />} nombre="FARO" detalle={`${t.posiciones.faroDetalle} · ${ej}`} valor={faroEn(faro?.anticipo ?? null, idioma)} />
        </li>
      </ul>
    </div>
  );
}
