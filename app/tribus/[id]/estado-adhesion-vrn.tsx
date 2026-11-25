"use client";

import { useSesion } from "@/components/sesion/contexto";
import { useTextos } from "@/lib/idioma/cliente";
import { COMUNIDAD_LIGHTHOUSE } from "@/lib/membresia/estado";
import { useMembresia } from "@/lib/membresia/usar-membresia";

/**
 * El estado de adhesión de quien mira, en texto (no solo con color). Va en una zona `role="status"` que no mueve el foco.
 * Sin sesión no hay adhesión que leer: se dice que todavía no adhirió.
 */
export function EstadoAdhesionVrn() {
  const t = useTextos("manifiestoVrn").ficha;
  const { estado: estadoSesion } = useSesion();
  const conSesion = estadoSesion === "ok";
  const { estado, cargado, desactualizada } = useMembresia(COMUNIDAD_LIGHTHOUSE, conSesion);

  const esperando = estadoSesion === "cargando" || (conSesion && !cargado);
  const texto = esperando
    ? t.cargando
    : estado === "no-miembro"
      ? t.sinAdhesion
      : desactualizada
        ? t.desactualizada
        : t.conAdhesion;
  const adherida = !esperando && estado !== "no-miembro" && !desactualizada;

  return (
    <p role="status" className="font-medium">
      <span aria-hidden="true">{adherida ? "✓ " : "○ "}</span>
      {texto}
    </p>
  );
}
