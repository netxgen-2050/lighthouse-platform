"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTextos } from "@/lib/idioma/cliente";
import { RUTA_SECCION, SECCIONES_EXPLORAR } from "@/lib/explorar/destino";

/**
 * Entrada a Explorar (spec explorar-paginas, design §4). El servidor no ve el `#`, así que la redirección se hace acá:
 * `/explorar#lotes` (enlaces de ayer) va a `/explorar/lotes`; sin ancla, o con una desconocida, va a Territorio.
 * Conserva la query. Sin JavaScript queda el enlace a Territorio.
 */
export function RedirigirExplorar() {
  const router = useRouter();
  const t = useTextos("explorar");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const seccion = SECCIONES_EXPLORAR.find((s) => s === hash) ?? "territorio";
    router.replace(`${RUTA_SECCION[seccion]}${window.location.search}`);
  }, [router]);

  return (
    <p className="text-sm" role="status">
      {t.abriendo}{" "}
      <Link className="underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep" href={RUTA_SECCION.territorio}>
        {t.barra.territorio}
      </Link>
    </p>
  );
}
