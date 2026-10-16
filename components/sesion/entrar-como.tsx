"use client";

import { useEffect, useState } from "react";
import { useTextos } from "@/lib/idioma/cliente";
import { useSesion } from "./contexto";

/**
 * "Entrar como…" del modo de prueba (sin Privy, nunca en producción de Vercel): vive en Sumarte, que es la puerta de entrada.
 * Sin Privy ni modo de prueba avisa que el registro no está configurado en este entorno. Con sesión no muestra nada.
 */
export function EntrarComo() {
  const { estado, privyDisponible, entrarComo } = useSesion();
  const t = useTextos("sumarte").entrarComo;
  const [emails, setEmails] = useState<string[] | null>(null);

  useEffect(() => {
    if (estado !== "sin-sesion") return;
    let vigente = true;
    fetch("/api/sesion/prueba", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { activo?: boolean; emails?: string[] } | null) => {
        if (vigente) setEmails(d?.activo && Array.isArray(d.emails) ? d.emails : []);
      })
      .catch(() => {
        if (vigente) setEmails([]);
      });
    return () => {
      vigente = false;
    };
  }, [estado]);

  if (estado !== "sin-sesion" || emails === null) return null;
  if (emails.length === 0 && privyDisponible) return null;

  return (
    <section
      id="entrar-como"
      tabIndex={-1}
      aria-labelledby="entrar-como-titulo"
      className="rounded-xl border border-dashed border-faint p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
    >
      <h2 id="entrar-como-titulo" className="text-base font-semibold">
        {t.titulo}
      </h2>
      {emails.length > 0 ? (
        <>
          <p className="mt-1 text-sm text-muted">{t.modoPrueba}</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {emails.map((e) => (
              <li key={e}>
                <button
                  type="button"
                  className="w-fit rounded-lg border border-faint px-4 py-1.5 font-medium hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
                  onClick={() => entrarComo(e)}
                >
                  {e}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-1 text-sm text-muted">{t.sinConfigurar}</p>
      )}
    </section>
  );
}
