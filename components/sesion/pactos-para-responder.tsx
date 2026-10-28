"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTextos } from "@/lib/idioma/cliente";
import { pendientesParaVer, puedeResponder, comunidadDeSobre } from "@/lib/pactos/constancias";
import { quienRespondeDe } from "@/lib/pactos/navegador";
import { leerDelNavegador } from "@/lib/pactos/registro-compartido";
import { useSesion } from "./contexto";

/**
 * "Pactos para responder (N)": solo la ve quien lidera esa tribu. N cuenta los pactos que esa persona puede responder
 * (no su propio pacto). Con el registro ilegible muestra "(sin dato)".
 */
export function PactosParaResponder({ tribu }: { tribu: string }) {
  const { estado, sesion, tribuLider } = useSesion();
  const t = useTextos("pactos").responder;
  // undefined = todavía no se leyó; null = no se pudo leer.
  const [cantidad, setCantidad] = useState<number | null | undefined>(undefined);
  const idPersona = sesion?.idPersona ?? null;
  const rol = sesion?.rol ?? null;

  useEffect(() => {
    // Lectura del registro del navegador tras hidratar (no existe en el servidor).
    const q = quienRespondeDe(idPersona && rol ? { idPersona, rol } : null, tribuLider);
    if (!q || tribuLider !== tribu) {
      setCantidad(undefined);
      return;
    }
    const lista = leerDelNavegador();
    setCantidad(
      lista === null
        ? null
        : pendientesParaVer(lista, q).filter((c) => comunidadDeSobre(c.sobre) === tribu && puedeResponder(q, tribu, c)).length,
    );
  }, [idPersona, rol, tribuLider, tribu]);

  if (estado !== "ok" || tribuLider !== tribu || cantidad === undefined) return null;
  return (
    <p className="mt-2">
      <Link className="underline" href="/pactos/responder">
        {cantidad === null ? t.enlaceFichaSinDato : t.enlaceFicha(cantidad)}
      </Link>
    </p>
  );
}
