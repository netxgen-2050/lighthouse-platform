"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorDeLectura } from "@/components/fogon/error-lectura";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textoEn } from "@/lib/idioma/tipos";
import { repositorioConsultas } from "@/lib/fogon/consultas/fuente";
import type { Lectura } from "@/lib/fogon/consultas/repositorio";
import { textoCierre } from "@/lib/fogon/consultas/reglas";
import type { ResumenConsulta } from "@/lib/fogon/consultas/tipos";

const CHIP = "rounded-full border border-faint px-3 py-0.5 text-sm";

export function ListaConsultas() {
  const idioma = useIdioma();
  const t = useTextos("fogonConsultas");
  const comunes = useTextos("comunes");
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

  if (!lectura) return <p className="text-muted" role="status">{t.pagina.cargando}</p>;
  if (!lectura.ok) return <ErrorDeLectura error={lectura.error} />;

  return (
    <ul className="grid gap-3">
      {lectura.valor.map((r) => {
        const idTitulo = `consulta-${r.consulta.id}`;
        const traducido = idioma !== (r.consulta.titulo.original ?? "es");
        return (
          <li key={r.consulta.id} aria-labelledby={idTitulo} className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
            <div>
              <h2 id={idTitulo} className="font-semibold">
                <Link className="underline" href={`/fogon/consultas/${r.consulta.id}`}>{textoEn(r.consulta.titulo, idioma)}</Link>
              </h2>
              {traducido && <p className="text-xs text-muted">{comunes.traducidoDelOriginal}</p>}
            </div>
            <p className="text-sm text-muted">{textoEn(r.consulta.descripcion, idioma)}</p>
            <p className="flex flex-wrap gap-2">
              <span className={CHIP}>{t.modo[r.consulta.modo]}</span>
              <span className={CHIP}>{t.ambito[r.consulta.ambito]}</span>
              <span className={CHIP}>{t.voto[r.consulta.voto]}</span>
              <span className={`${CHIP} ${r.estado === "abierta" ? "border-deep text-deep" : "text-muted"}`}>
                {t.estado[r.estado]}
              </span>
            </p>
            <p className="text-sm">{textoCierre(r.consulta, r.estado, idioma)}</p>
            <p className="text-sm text-muted">
              {r.participantes
                ? t.lista.repartieron(r.participantes.repartieron, r.participantes.padron)
                : t.lista.repartieronSinDato}
            </p>
            {r.yaReparti && (
              <p className="w-fit rounded-lg border border-deep bg-green-soft px-3 py-1 text-sm text-deep">
                <span aria-hidden="true">✓ </span>{t.lista.yaRepartiste}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
