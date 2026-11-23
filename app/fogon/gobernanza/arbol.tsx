"use client";

import { hijosDe, type NodoH } from "@/lib/gobernanza/holarquia";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { BOTON_LINEA, GLIFO_ESTADO } from "./panel-nodo";

type Props = {
  raiz: NodoH;
  enfocar: (id: string) => void;
  /** Elige a una persona: hace zoom a su círculo y deja elegido el rol. */
  elegirPersona: (circuloId: string, rolId: string) => void;
};

/**
 * La estructura como lista anidada (equivalente accesible del dibujo): un botón por lugar que hace zoom, el estado y el
 * propósito en texto, y las personas como último nivel con su rol.
 */
export function Arbol({ raiz, enfocar, elegirPersona }: Props) {
  const tx = useTextos("gobernanza");
  const estados = useTextos("comunes").estadoTribu;
  const idioma = useIdioma();
  const y = new Intl.ListFormat(idioma, { style: "long", type: "conjunction" });
  const a = tx.arbol;

  function nodoLi(n: NodoH, padre: NodoH | null, tribus: ReadonlyMap<string, string>) {
    switch (n.tipo) {
      case "rol":
        return (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => padre && elegirPersona(padre.id, n.id)}
              className={`${BOTON_LINEA} !py-0.5`}
              translate="no"
            >
              {a.persona(n.persona, tx.roles[n.rol])}
            </button>
          </li>
        );
      case "lugar":
        return (
          <li key={n.id} className="text-sm" translate="no">
            {tx.panel.lugarDe(n.nombre)} <span className="text-muted">· {tx.panel.sinRepresentante}</span>
          </li>
        );
      case "lugar-libre":
        return (
          <li key={n.id} className="text-sm">
            {tx.panel.lugarLibre}
          </li>
        );
      default: {
        const hijos = hijosDe(n);
        const participan = n.tribus?.map((id) => tribus.get(id) ?? id) ?? [];
        return (
          <li key={n.id} className="grid gap-1">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <button type="button" onClick={() => enfocar(n.id)} className={`${BOTON_LINEA} font-medium`} translate="no">
                {n.nombre}
              </button>
              {n.tipo === "tribu" && n.estado && (
                <span className="text-sm">
                  {a.estado} <span aria-hidden="true">{GLIFO_ESTADO[n.estado]} </span>
                  {estados[n.estado]}
                  {n.estado !== "vacante" && ` · ${n.validada ? a.validada : a.noValidada}`}
                </span>
              )}
              {n.proposito && n.tipo === "circulo" && <span className="text-sm text-muted">{a.proposito(tx.propositos[n.proposito])}</span>}
              {n.clase === "transversal" && participan.length > 0 && (
                <span className="text-sm text-muted">{a.transversalTribus(y.format(participan))}</span>
              )}
            </p>
            {hijos.length > 0 && (
              <ul className="ml-4 grid gap-1 border-l border-faint pl-3">{hijos.map((h) => nodoLi(h, n, tribus))}</ul>
            )}
          </li>
        );
      }
    }
  }

  const tribus = new Map<string, string>();
  for (const h of hijosDe(raiz)) if (h.tipo === "tribu") tribus.set(h.id, h.nombre);

  return (
    <details className="rounded-xl border border-faint bg-surface p-4">
      <summary className="cursor-pointer text-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
        {a.resumen}
      </summary>
      <p className="mt-2 text-sm text-muted">{a.intro}</p>
      <ul className="mt-3 grid gap-2">{nodoLi(raiz, null, tribus)}</ul>
    </details>
  );
}
