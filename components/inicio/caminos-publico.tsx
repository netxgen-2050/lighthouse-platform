import Link from "next/link";
import type { Camino } from "@/lib/portada";
import { DibujoCuidar, DibujoInvertir, DibujoVivir } from "./dibujos";

const DIBUJOS = { vivir: DibujoVivir, invertir: DibujoInvertir, cuidar: DibujoCuidar } as const;

/**
 * Tres caminos, uno por público (ux-inicio, design §4): quien quiere vivir, quien invierte y quien cuida el bien común.
 * Es una lista de opciones, así que son tarjetas iguales en estructura; toda la tarjeta es un solo enlace. La que coincide
 * con `?camino=` lleva la marca "Recomendado para vos" (el orden no cambia).
 */
export function CaminosPublico({
  idTitulo,
  titulo,
  caminos,
  recomendadoId,
  textoRecomendado,
}: {
  idTitulo: string;
  titulo: string;
  caminos: Camino[];
  recomendadoId?: string;
  textoRecomendado: string;
}) {
  return (
    <section aria-labelledby={idTitulo} className="mx-auto grid max-w-5xl gap-6 px-6 pb-12 sm:px-10">
      <h2 id={idTitulo} className="text-xl font-bold">
        {titulo}
      </h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {caminos.map((c) => {
          const Dibujo = DIBUJOS[c.id];
          const recomendado = c.id === recomendadoId;
          return (
            <li key={c.id} className="grid">
              <Link
                href={c.href}
                className={`grid content-start gap-2 rounded-xl bg-surface text-ink hover:border-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${
                  recomendado ? "border-2 border-deep p-[19px]" : "border border-line p-5"
                }`}
              >
                <span className="text-deep-2">
                  <Dibujo tamano={48} />
                </span>
                {recomendado && (
                  <span className="w-fit rounded-full bg-deep px-2 py-0.5 text-xs font-medium text-on-deep">{textoRecomendado}</span>
                )}
                <span className="text-sm text-muted">{c.etiqueta}</span>
                <h3 className="text-xl font-bold">{c.titulo}</h3>
                <span className="text-sm text-muted">{c.descripcion}</span>
                <span className="mt-1 font-medium text-deep-2 underline">{c.accion}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
