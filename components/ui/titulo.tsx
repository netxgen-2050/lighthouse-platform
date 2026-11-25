"use client";

import { createContext, useContext, type ComponentPropsWithoutRef, type ReactNode } from "react";

// Nivel del título principal de un bloque reutilizable. Por defecto es 2 (como cuando el bloque es una página);
// dentro de una sección de otra página se baja con <NivelTitulos nivel={3}> para no repetir niveles (spec explorar-unificado).
const Nivel = createContext(2);

export function NivelTitulos({ nivel, children }: { nivel: number; children: ReactNode }) {
  return <Nivel.Provider value={nivel}>{children}</Nivel.Provider>;
}

/** Título cuyo nivel es el del bloque más `extra` (0 = título principal del bloque, 1 = su subtítulo...). */
export function Titulo({ extra = 0, ...props }: { extra?: number } & ComponentPropsWithoutRef<"h2">) {
  const base = useContext(Nivel);
  const H = `h${Math.min(6, base + extra)}` as "h2";
  return <H {...props} />;
}
