"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { EnlaceConCuenta } from "@/components/sesion/entrar-para";
import { useSesion } from "@/components/sesion/contexto";
import { CLAVES } from "@/lib/demo/claves";
import { useTextos } from "@/lib/idioma/cliente";
import { leerMembresiaDelNavegador, type Membresias } from "@/lib/membresia/estado";
import { personaDeAfirma, preadmitidasDe } from "@/lib/pactos/constancias";
import { leerPactosConciliados, puntualDe, type PactoPuntual } from "@/lib/pactos/estado";
import { leerDelNavegador } from "@/lib/pactos/registro-compartido";
import { relacionConHolon } from "@/lib/pactos/postulacion";
import { holonDe } from "@/lib/tribus/necesidades";

const ENLACE =
  "w-fit rounded-lg bg-deep px-4 py-1.5 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

type Props = {
  necesidadId: string;
  tribuId: string;
  tribuNombre: string;
  circuloId: string | null;
  /** Nombre del holón y si es círculo o tribu (ya en el idioma de la página). */
  holonNombre: string;
  holonTipo: "circulo" | "tribu";
  /** ¿La tribu acepta pactos puntuales? */
  aceptaPuntuales: boolean;
  /** ¿Abierta y, si es de diseño, con aval? Si no, la ficha ya dice qué falta. */
  tomable: boolean;
};

type Leido = { membresias: Membresias; propio: PactoPuntual | undefined; otros: number | null };

/**
 * Lo que esta persona puede hacer con la necesidad y cómo está para ella (pacto-puntual, design §7). Lee la membresía, sus
 * pactos y el registro compartido de constancias. Sin sesión, sin almacenamiento o con el registro ilegible muestra lo de
 * ejemplo y "Postularme para tomarla", que pide entrar.
 */
export function EstadoNecesidadPropio({ necesidadId, tribuId, tribuNombre, circuloId, holonNombre, holonTipo, aceptaPuntuales, tomable }: Props) {
  const n = useTextos("tribus").ficha.necesidad;
  const { estado, sesion } = useSesion();
  const idPersona = sesion?.idPersona ?? null;
  const [leido, setLeido] = useState<Leido | null>(null);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    if (!idPersona) {
      setLeido(null);
      return;
    }
    let crudo: string | null = null;
    try {
      crudo = window.localStorage.getItem(CLAVES.pactos);
    } catch {
      crudo = null;
    }
    const registro = leerDelNavegador();
    const pactos = leerPactosConciliados(crudo, idPersona, registro);
    const ajenas = registro ? preadmitidasDe(registro, necesidadId).filter((p) => personaDeAfirma(p.afirma) !== idPersona) : null;
    setLeido({
      membresias: leerMembresiaDelNavegador(),
      propio: puntualDe(pactos, tribuId, necesidadId),
      otros: ajenas ? ajenas.length : null,
    });
  }, [idPersona, necesidadId, tribuId]);

  if (!aceptaPuntuales) return <p>{n.noTomaPuntuales(tribuNombre)}</p>;
  if (estado === "cargando") return null;

  const holon = n.elHolon(holonNombre, holonTipo);
  const propio = leido?.propio;
  const enlace = `/pactos?comunidad=${tribuId}`;
  const relacion = leido ? relacionConHolon(leido.membresias, holonDe({ tribuId, circuloId: circuloId ?? undefined })) : null;

  let propioTexto: ReactNode = null;
  if (propio?.paso === "preadmitido") propioTexto = <strong>{n.tomaste}</strong>;
  else if (propio?.paso === "enviado") propioTexto = n.postulaste(holonNombre, holonTipo);
  else if (propio?.paso === "borrador" && propio.noPreadmitida) propioTexto = n.noPreadmitida(holon[0].toUpperCase() + holon.slice(1));
  else if (propio?.paso === "borrador") propioTexto = n.borrador;

  return (
    <div className="grid gap-1" data-testid={`estado-propio-${necesidadId}`}>
      {propioTexto && (
        <p>
          {propioTexto}
          {propio && propio.paso !== "preadmitido" && propio.paso !== "enviado" && (
            <>
              {" · "}
              <Link className="underline" href={enlace}>
                {n.verBorrador}
              </Link>
            </>
          )}
        </p>
      )}
      {leido && leido.otros !== null && leido.otros > 0 && <p>{n.tomaron(leido.otros)}</p>}
      {tomable && !propio && (!idPersona || (leido && relacion)) && (
        <EnlaceConCuenta href={`/pactos?comunidad=${tribuId}&necesidad=${necesidadId}`} textoEntrar={n.postularme} clase={ENLACE}>
          {n.postularme}
        </EnlaceConCuenta>
      )}
      {tomable && !propio && leido && !relacion && (
        <p>
          {n.primeroAspirante(tribuNombre)}{" "}
          <Link className="underline" href={`/tribus/${tribuId}/manifiesto`}>
            {n.verManifiesto}
          </Link>
        </p>
      )}
    </div>
  );
}
