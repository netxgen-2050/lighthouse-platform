"use client";

import type { ComponentType } from "react";
import { MembresiaAcciones } from "@/components/membresia-acciones";
import { nombreDeEquipo } from "@/lib/equipos/equipos";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { COMUNIDAD_LIGHTHOUSE } from "@/lib/membresia/estado";
import { destinosDisponibles } from "@/lib/navegacion";
import { contarTribusPorEstado, macrolote7, textoHectareas } from "@/lib/territorios/biopueblo";
import type { Fase } from "@/lib/territorios/fases";
import { FUENTES_PLAN, esDeHoy, frentesEn, numeroDeFrente, type FuentePlanId, type VistaId } from "@/lib/territorios/vistas";
import { listarTribus } from "@/lib/tribus/datos";
import { MARCA_EJEMPLO } from "./ficha-frente";

// Panel de la ficha lateral cuando no hay nada elegido, uno por vista (mismo patrón que las lentes de la holarquía).
// Para sumar una vista: una entrada en `VISTAS` (lib/territorios/vistas.ts) y un componente acá.

export type PropsPanel = {
  fase: Fase;
  fuente: FuentePlanId;
  alElegir: (id: string) => void;
  seleccion: string | null;
};

const boton =
  "rounded-lg border border-faint bg-surface px-3 py-1 text-left text-sm hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep aria-pressed:border-ink aria-pressed:bg-surface-2 aria-pressed:font-semibold";

function PanelAhora({ fase, alElegir, seleccion }: PropsPanel) {
  const idioma = useIdioma();
  const tx = useTextos("territorio");
  const t = tx.ahora;
  const { conLugar, sinLugar, despues } = frentesEn(fase, idioma);
  const equipo = (id: string) => nombreDeEquipo(id, idioma) ?? id;
  return (
    <div className="grid gap-3">
      <h2 className="text-xl font-semibold" translate="no">{macrolote7().nombre}</h2>
      <h3 className="font-semibold">{t.donde}</h3>
      <p className="text-sm text-muted">{t.explicacion}</p>
      <p className={MARCA_EJEMPLO}>{tx.frente.ejemplo}</p>
      {conLugar.length === 0 ? (
        <p className="text-sm text-muted">{t.ninguno}</p>
      ) : (
        <ul aria-label={t.donde} className="grid gap-2">
          {conLugar.map((f) => (
            <li key={f.id}>
              <button type="button" className={`${boton} w-full`} aria-pressed={seleccion === f.id} onClick={() => alElegir(f.id)}>
                {numeroDeFrente(f.id)} · {f.nombre} · {equipo(f.circuloId)}
                {!esDeHoy(f) && <> · {tx.frente.masAdelante(f.desde)}</>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {sinLugar.length > 0 && (
        <>
          <h3 className="font-semibold">{t.sinLugar}</h3>
          <ul aria-label={t.sinLugar} className="grid gap-1 text-sm">
            {sinLugar.map((f) => (
              <li key={f.id}>
                {f.nombre} · {equipo(f.circuloId)}
              </li>
            ))}
          </ul>
        </>
      )}
      {despues.length > 0 && (
        <>
          <h3 className="font-semibold">{t.masAdelante}</h3>
          <ul aria-label={t.masAdelante} className="grid gap-1 text-sm">
            {despues.map((f) => (
              <li key={f.id}>
                {f.nombre} · {equipo(f.circuloId)} · {tx.frente.masAdelante(f.desde)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function PanelPlan(_: PropsPanel) {
  const tx = useTextos("territorio");
  const t = tx.plan;
  const pendientes = FUENTES_PLAN.filter((f) => f.estado === "pendiente");
  const disponibles = FUENTES_PLAN.filter((f) => f.estado === "disponible");
  return (
    <div className="grid gap-3">
      <h2 className="text-xl font-semibold">{t.titulo}</h2>
      <p className="text-sm">{t.explicacion}</p>
      <p className="text-sm font-medium">{t.sinFases}</p>
      <h3 className="font-semibold">{t.fuentes}</h3>
      {/* Con una sola fuente disponible no hay nada que elegir: se lee en texto. El grupo de botones llega con la segunda. */}
      <ul aria-label={t.fuentes} className="grid gap-1 text-sm">
        {disponibles.map((f) => (
          <li key={f.id}>
            <strong>{t.fuente}</strong> {t[f.id]}
          </li>
        ))}
        {pendientes.map((f) => (
          <li key={f.id}>{t[f.id]}</li>
        ))}
      </ul>
    </div>
  );
}

function PanelVision({ fase }: PropsPanel) {
  const idioma = useIdioma();
  const tx = useTextos("territorio");
  const t = tx.ficha;
  const conteo = contarTribusPorEstado(listarTribus(idioma));
  const cifras = [
    { etiqueta: t.activas, valor: conteo.activa },
    { etiqueta: t.formacion, valor: conteo.formacion },
    { etiqueta: t.vacantes, valor: conteo.vacante },
  ];
  return (
    <div className="grid gap-3">
      <h2 className="text-xl font-semibold" translate="no">{macrolote7().nombre}</h2>
      <p className="text-sm">{t.resumen(textoHectareas(macrolote7().areaHa, idioma))}</p>
      <p className="text-sm font-medium">{tx.vision.fase[fase]}</p>
      <p className="text-sm text-muted">{t.elegiUno}</p>
      <h3 className="font-semibold">{t.tribusDelTerritorio}</h3>
      <p className={MARCA_EJEMPLO}>{tx.vision.ejemploTribus}</p>
      <dl className="grid grid-cols-3 gap-2">
        {cifras.map((c) => (
          <div key={c.etiqueta} className="grid gap-1 rounded-lg border border-faint bg-surface-2 p-2">
            <dt className="text-sm text-muted">{c.etiqueta}</dt>
            <dd className="text-2xl font-semibold">{c.valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export const PANELES: Record<VistaId, ComponentType<PropsPanel>> = {
  ahora: PanelAhora,
  plan: PanelPlan,
  vision: PanelVision,
};

/** Lo que se repite en todas las vistas bajo el panel: pertenecer al Lighthouse. */
export function PertenecerAlLighthouse() {
  const t = useTextos("territorio").ficha;
  return (
    <>
      <h3 className="font-semibold">{t.pertenecer}</h3>
      <MembresiaAcciones
        comunidad={COMUNIDAD_LIGHTHOUSE}
        nombre="Lighthouse"
        pactos={destinosDisponibles().some((d) => d.href === "/pactos")}
      />
    </>
  );
}
