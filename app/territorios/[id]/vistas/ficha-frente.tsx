"use client";

import { SumarmeEquipo } from "@/components/sumarme-equipo";
import { nombreDeEquipo } from "@/lib/equipos/equipos";
import type { Frente } from "@/lib/equipos/frentes";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { sinDato } from "@/lib/idioma/formatos";
import { esDeHoy, numeroDeFrente } from "@/lib/territorios/vistas";

export const MARCA_EJEMPLO = "w-fit rounded-full border border-dashed border-muted px-2 py-0.5 text-xs font-medium";

/** Ficha de un frente de trabajo: lo que hace falta, y "Quiero sumarme" solo si es de hoy. */
export function FichaFrente({ frente }: { frente: Frente }) {
  const idioma = useIdioma();
  const t = useTextos("territorio").frente;
  const nd = sinDato(idioma);
  const equipo = nombreDeEquipo(frente.circuloId, idioma) ?? frente.circuloId;
  const n = numeroDeFrente(frente.id);
  return (
    <div className="grid gap-3">
      {n !== null && <p className="text-sm text-muted">{t.numero(n)}</p>}
      <h2 className="text-xl font-semibold">{frente.nombre}</h2>
      <p className={MARCA_EJEMPLO}>{t.ejemplo}</p>
      <p className="text-sm">
        <strong>{t.equipo}</strong> {equipo}
      </p>
      <p className="text-sm">
        <strong>{t.necesidad}</strong> {frente.necesidad}
      </p>
      <p className="text-sm">
        <strong>{t.falta}</strong> {frente.faltan ?? nd}
      </p>
      <p className="text-sm">
        <strong>{t.para}</strong> {frente.paraCuando ?? nd}
      </p>
      <p className="text-sm text-muted">{t.lugarIlustrativo}</p>
      {esDeHoy(frente) ? (
        <SumarmeEquipo circuloId={frente.circuloId} nombreEquipo={equipo} desdeFrente />
      ) : (
        <p className="text-sm font-medium">{t.masAdelante(frente.desde)}</p>
      )}
    </div>
  );
}
