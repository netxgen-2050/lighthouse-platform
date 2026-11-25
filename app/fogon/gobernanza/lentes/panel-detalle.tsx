"use client";

import { buscarNodo } from "@/lib/gobernanza/holarquia";
import { DetalleNodo, RolesDePersona } from "../panel-nodo";
import type { PropsPanel } from "./tipos";

/** Panel de las lentes Estructura y Propósitos: el detalle del nivel y, si hay una persona elegida, todos sus roles. */
export function PanelDetalle({ ctx, enfocar, seleccionar }: PropsPanel) {
  const sel = ctx.seleccion ? buscarNodo(ctx.raiz, ctx.seleccion) : null;
  const persona = sel?.tipo === "rol" ? sel : null;
  const nodo = sel && sel.tipo !== "rol" ? sel : ctx.foco;
  return (
    <div className="grid gap-4">
      {persona && (
        <RolesDePersona raiz={ctx.raiz} personaId={persona.personaId} nombre={persona.persona} enfocar={enfocar} seleccionar={seleccionar} />
      )}
      <DetalleNodo raiz={ctx.raiz} nodo={nodo} personaId={persona?.personaId ?? null} enfocar={enfocar} seleccionar={seleccionar} />
    </div>
  );
}
