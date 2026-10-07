"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { borrarDemo } from "@/lib/demo/borrar";
import { resumirDemo, type Paso, type ResumenDemo } from "@/lib/demo/resumen";

const ENLACE =
  "w-fit rounded-lg border border-muted px-3 py-1.5 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const ENLACE_PRINCIPAL =
  "w-fit rounded-lg bg-deep px-4 py-1.5 text-on-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

const PASOS: Record<Paso, { texto: string; enlace: string; href: string }> = {
  perfil: { texto: "Terminá la entrevista de tu perfil.", enlace: "Terminar la entrevista", href: "/perfil" },
  compromisos: {
    texto: "Registrá tu primer compromiso.",
    enlace: "Registrar un compromiso",
    href: "/compromisos",
  },
  congreso: { texto: "Registrá tu ticket del Congreso.", enlace: "Registrar mi ticket", href: "/congreso" },
};

export function Resumen() {
  const [listo, setListo] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [resumen, setResumen] = useState<ResumenDemo | null>(null);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      setResumen(resumirDemo((c) => window.localStorage.getItem(c)));
    } catch {
      setFalloAlmacen(true);
    }
    setListo(true);
  }, []);

  function borrar() {
    if (!window.confirm("¿Borrar todo lo que guardaste en este navegador?")) return;
    try {
      borrarDemo((c) => window.localStorage.removeItem(c));
      setResumen(resumirDemo((c) => window.localStorage.getItem(c)));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
    }
  }

  const aviso = (
    <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
      Modo demostración: este panel lee lo que guardaste en este navegador.
    </p>
  );

  if (!listo) return <p role="status">Cargando…</p>;

  if (falloAlmacen || !resumen) {
    return (
      <div className="grid gap-4">
        {aviso}
        <p role="alert" className="text-sm font-medium text-danger">
          Error: tu navegador no permite leer los datos guardados en este sitio, así que el panel no puede
          mostrar tu recorrido. Revisá la configuración de privacidad o probá en otro navegador.
        </p>
      </div>
    );
  }

  const { perfil, compromisos, ticket, proximo } = resumen;
  const paso = proximo ? PASOS[proximo] : null;

  return (
    <div className="grid gap-6">
      <section aria-labelledby="proximo" className="grid gap-3 rounded-xl border border-faint bg-surface-2 p-4">
        <h2 id="proximo" className="text-xl font-semibold">Tu próximo paso</h2>
        {paso ? (
          <>
            <p>{paso.texto}</p>
            <Link href={paso.href} className={ENLACE_PRINCIPAL}>{paso.enlace}</Link>
          </>
        ) : (
          <p>Ya recorriste todo lo que hay por ahora.</p>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <section aria-labelledby="t-perfil" className="grid content-start gap-3 rounded-xl border border-faint bg-surface p-4">
          <h2 id="t-perfil" className="text-xl font-semibold">Perfil</h2>
          <p>
            {perfil
              ? `${perfil.confirmados} de ${perfil.total} datos confirmados`
              : "Todavía no empezaste la entrevista"}
          </p>
          <Link href="/perfil" className={ENLACE}>Ir a Perfil</Link>
        </section>

        <section aria-labelledby="t-compromisos" className="grid content-start gap-3 rounded-xl border border-faint bg-surface p-4">
          <h2 id="t-compromisos" className="text-xl font-semibold">Compromisos</h2>
          <p>
            {compromisos
              ? `${compromisos.ofrezco} ofrecés · ${compromisos.necesito} necesitás`
              : "Todavía no registraste compromisos"}
          </p>
          <Link href="/compromisos" className={ENLACE}>Ir a Compromisos</Link>
        </section>

        <section aria-labelledby="t-congreso" className="grid content-start gap-3 rounded-xl border border-faint bg-surface p-4">
          <h2 id="t-congreso" className="text-xl font-semibold">Congreso</h2>
          <p>
            {ticket ? (
              <>
                Ticket {ticket} registrado · <b>Genesis pendiente</b>
              </>
            ) : (
              "Sin ticket registrado"
            )}
          </p>
          <Link href="/congreso" className={ENLACE}>Ir a Congreso</Link>
        </section>
      </div>

      <div className="grid gap-3">
        {aviso}
        <button
          type="button"
          onClick={borrar}
          className="w-fit rounded-lg border border-muted px-3 py-1.5 hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
        >
          Borrar todo lo de este navegador
        </button>
      </div>
    </div>
  );
}
