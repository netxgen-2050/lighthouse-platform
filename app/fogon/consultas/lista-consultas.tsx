"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorDeLectura } from "@/components/fogon/error-lectura";
import { repositorioConsultas } from "@/lib/fogon/consultas/fuente";
import type { Lectura } from "@/lib/fogon/consultas/repositorio";
import { textoCierre } from "@/lib/fogon/consultas/reglas";
import { ETIQUETA_AMBITO, ETIQUETA_ESTADO, ETIQUETA_MODO, ETIQUETA_VOTO, type ResumenConsulta } from "@/lib/fogon/consultas/tipos";

const CHIP = "rounded-full border border-faint px-3 py-0.5 text-sm";

export function ListaConsultas() {
  const [lectura, setLectura] = useState<Lectura<ResumenConsulta[]> | null>(null);

  useEffect(() => {
    // Lee lo guardado en este navegador tras hidratar (no existe en el servidor).
    let vigente = true;
    repositorioConsultas()
      .listar()
      .then((l) => vigente && setLectura(l))
      .catch(() => vigente && setLectura({ ok: false, error: "falla" }));
    return () => {
      vigente = false;
    };
  }, []);

  if (!lectura) return <p className="text-muted" role="status">Cargando las consultas…</p>;
  if (!lectura.ok) return <ErrorDeLectura error={lectura.error} />;

  return (
    <ul className="grid gap-3">
      {lectura.valor.map((r) => {
        const idTitulo = `consulta-${r.consulta.id}`;
        return (
          <li key={r.consulta.id} aria-labelledby={idTitulo} className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
            <h2 id={idTitulo} className="font-semibold">
              <Link className="underline" href={`/fogon/consultas/${r.consulta.id}`}>{r.consulta.titulo}</Link>
            </h2>
            <p className="text-sm text-muted">{r.consulta.descripcion}</p>
            <p className="flex flex-wrap gap-2">
              <span className={CHIP}>{ETIQUETA_MODO[r.consulta.modo]}</span>
              <span className={CHIP}>{ETIQUETA_AMBITO[r.consulta.ambito]}</span>
              <span className={CHIP}>{ETIQUETA_VOTO[r.consulta.voto]}</span>
              <span className={`${CHIP} ${r.estado === "abierta" ? "border-deep text-deep" : "text-muted"}`}>
                {ETIQUETA_ESTADO[r.estado]}
              </span>
            </p>
            <p className="text-sm">{textoCierre(r.consulta, r.estado)}</p>
            <p className="text-sm text-muted">
              {r.participantes
                ? `${r.participantes.repartieron} de ${r.participantes.padron} personas ya repartieron`
                : "Personas que repartieron: sin dato"}
            </p>
            {r.yaReparti && (
              <p className="w-fit rounded-lg border border-deep bg-green-soft px-3 py-1 text-sm text-deep">
                <span aria-hidden="true">✓ </span>Ya repartiste
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
