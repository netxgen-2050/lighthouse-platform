"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { SumarmeEquipo } from "@/components/sumarme-equipo";
import { sinDato } from "@/lib/idioma/formatos";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { C } from "./formas/piezas";
import { formaDe } from "./formas";
import type { EquipoVista, FrenteVista } from "./tipos";

const MARCA = "w-fit rounded-full border border-dashed border-muted px-2 py-0.5 text-xs font-medium";
const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

/** La forma del equipo en grande, sobre un trozo de papel del territorio. Es decorativa: el nombre va en el título. */
export function IlustracionDelEquipo({ circuloId }: { circuloId: string }) {
  const Forma = formaDe(circuloId);
  return (
    <svg viewBox="-140 -150 280 215" className="mapa-ilus ilus-quieta rounded-xl border border-faint" aria-hidden="true" focusable="false">
      <rect x={-140} y={-150} width={280} height={215} fill={C.salvia} fillOpacity={0.55} />
      <rect x={-140} y={-150} width={280} height={215} fill={C.arena} fillOpacity={0.55} />
      {/* Versión quieta: sin `data-activa`, nada se mueve (la animación es solo del mapa, con puntero o foco). */}
      <g className="forma">
        <Forma />
      </g>
    </svg>
  );
}

function Frente({ f }: { f: FrenteVista }) {
  const tx = useTextos("tribus").equipos;
  const tt = useTextos("territorio");
  const nd = sinDato(useIdioma());
  return (
    <li className="grid gap-0.5 rounded-lg border border-faint bg-surface-2 p-3 text-sm">
      <p className="font-semibold">
        {f.nombre} <span className={MARCA}>{tx.marca}</span>
      </p>
      <p>
        <span className="font-medium">{tx.necesita}</span> {f.necesidad}
      </p>
      <p>
        <span className="font-medium">{tx.faltan}</span> {f.faltan ?? nd}
      </p>
      <p>
        <span className="font-medium">{tx.paraCuando}</span> {f.paraCuando ?? nd}
      </p>
      <p>
        <span className="font-medium">{tx.lugar}</span> {f.lugar ? tx.enElMapa : tx.sinLugar}
        {f.hrefMapa && (
          <>
            {" · "}
            <Link className="underline" href={f.hrefMapa} aria-label={`${tt.verEnMapa} · ${f.nombre}`}>
              {tt.verEnMapa}
            </Link>
          </>
        )}
      </p>
      {f.masAdelante !== null && <p className="font-medium">{tx.masAdelante(f.masAdelante)}</p>}
    </li>
  );
}

/** El contenido del detalle de un equipo: ilustración, qué decide, frentes, posiciones abiertas y "Quiero sumarme". */
export function DetalleEquipo({ equipo, idTitulo, onCerrar }: { equipo: EquipoVista; idTitulo: string; onCerrar: () => void }) {
  const t = useTextos("participa").detalle;
  const nd = sinDato(useIdioma());
  return (
    <div className="grid gap-5 p-5 pb-8">
      <div className="flex items-start justify-between gap-3">
        <h2 id={idTitulo} className="text-2xl font-semibold">
          {equipo.nombre}
        </h2>
        <button
          type="button"
          onClick={onCerrar}
          aria-label={t.cerrarAria(equipo.nombre)}
          className={`inline-flex shrink-0 items-center gap-1 rounded-lg border border-muted px-3 py-1.5 text-sm font-medium hover:bg-surface-2 ${FOCO}`}
        >
          <X aria-hidden="true" size={16} />
          {t.cerrar}
        </button>
      </div>

      <IlustracionDelEquipo circuloId={`comun-${equipo.corto}`} />

      <p className="text-sm">
        <span className="font-medium">{t.decide}:</span> {equipo.decide.length ? equipo.decide.join(", ") : nd}
      </p>

      <section aria-labelledby={`${idTitulo}-frentes`} className="grid gap-2">
        <h3 id={`${idTitulo}-frentes`} className="text-lg font-semibold">
          {t.frentes}
        </h3>
        {equipo.frentes.length === 0 ? (
          <p className="text-sm text-muted">{t.sinFrentes}</p>
        ) : (
          <ul className="grid gap-2">
            {equipo.frentes.map((f) => (
              <Frente key={f.id} f={f} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby={`${idTitulo}-posiciones`} className="grid gap-2">
        <h3 id={`${idTitulo}-posiciones`} className="text-lg font-semibold">
          {t.posiciones}
        </h3>
        <p className="text-sm text-muted">{t.posicionesIntro}</p>
        <ul className="grid gap-3">
          {equipo.posiciones.map((p) => (
            <li key={p.id} className="grid gap-1.5 rounded-xl border border-faint bg-bg p-3 text-sm" data-posicion={p.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h4 className="font-display text-base font-semibold">{p.titulo}</h4>
                <span className={MARCA}>{t.marca}</span>
              </div>
              <p>
                <span className="font-medium">{t.dedicacion}:</span> {p.dedicacion}
              </p>
              <div>
                <p className="font-medium">{t.busca}:</p>
                <ul className="ml-5 list-disc">
                  {p.busca.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
              <p>
                <span className="font-medium">{t.modalidad}:</span> {t.modalidades[p.modalidad]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <SumarmeEquipo circuloId={`comun-${equipo.corto}`} nombreEquipo={equipo.nombre} />
    </div>
  );
}
