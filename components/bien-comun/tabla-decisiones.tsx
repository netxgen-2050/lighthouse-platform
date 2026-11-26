import type { ReactNode } from "react";
import { ChipEstado } from "@/components/ui/chip-estado";
import { TablaFilas } from "./tabla-filas";

// Las decisiones del doc 34 §7: pregunta, recomendación de Gus y estado, dicho en texto y con ícono (no solo con color).
// El título y la introducción los pone la página (`SeccionPlegable`).
export type FilaDecision = {
  id: string;
  pregunta: string;
  recomendacion: string;
  /** Si está abierta, el chip lo dice solo; si está decidida, esta línea cuenta cuándo y quién. */
  estado: "abierta" | "decidida";
  detalleEstado?: string;
  /** ⚖ de la palabra legal que usa la recomendación, si la hay. */
  termino?: ReactNode;
};

export type PropsDecisiones = {
  caption: string;
  columnas: { pregunta: string; recomendacion: string; estado: string };
  filas: FilaDecision[];
};

export function TablaDecisiones(p: PropsDecisiones) {
  return (
    <TablaFilas
      caption={p.caption}
      columnas={{ nombre: p.columnas.pregunta, detalle: p.columnas.recomendacion, estado: p.columnas.estado }}
      filas={p.filas.map((f) => ({
        id: f.id,
        nombre: f.pregunta,
        detalle: (
          <>
            {f.recomendacion}
            {f.termino}
          </>
        ),
        estado: (
          <span className="grid w-fit gap-1">
            <ChipEstado estado={f.estado} />
            {f.detalleEstado ? <span className="text-sm">{f.detalleEstado}</span> : null}
          </span>
        ),
      }))}
    />
  );
}
