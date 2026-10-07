"use client";

import { useEffect } from "react";
import { huella } from "@/lib/demo/bitacora";
import { anotarEnBitacora } from "@/lib/demo/anotar-en-bitacora";
import { esBorrador } from "@/lib/legal/terminos";

// No dibuja nada: anota en la bitácora (C11) que se mostró el estado del loteo.
export function AnotarExposicion({
  proyectoId,
  titulo,
  texto,
}: {
  proyectoId: string;
  titulo: string;
  texto: string;
}) {
  useEffect(() => {
    anotarEnBitacora({
      tipo: "estado-loteo",
      clave: proyectoId,
      mostrado: `${titulo} · ${texto}`,
      huella: huella(titulo, texto),
      // El aviso se apoya en el ⚖ "loteo": hereda su marca de borrador.
      borrador: esBorrador("loteo"),
    });
  }, [proyectoId, titulo, texto]);
  return null;
}
