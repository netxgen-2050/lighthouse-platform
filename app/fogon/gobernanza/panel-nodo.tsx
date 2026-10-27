"use client";

import Link from "next/link";
import { TerminoLegal } from "@/components/termino-legal";
import { buscarNodo, hijosDe, rolesDe, type NodoContenedor, type NodoH, type Rol } from "@/lib/gobernanza/holarquia";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";

export const ENLACE = "underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
export const BOTON_LINEA =
  "rounded-lg border border-muted px-3 py-1 text-left text-sm hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const CHIP = "rounded-full border border-faint px-3 py-0.5 text-sm";
export const GLIFO_ESTADO = { activa: "●", formacion: "◐", vacante: "○" } as const;

export function useEtiquetas() {
  const tx = useTextos("gobernanza");
  const estados = useTextos("comunes").estadoTribu;
  const nombreRol = (rol: Rol) => tx.roles[rol];
  const tipoDe = (n: NodoH): string => {
    switch (n.tipo) {
      case "comun":
        return tx.tipos.comun;
      case "consejo":
        return tx.tipos.consejo;
      case "tribu":
        return tx.tipos.tribu;
      case "circulo":
        return n.clase === "transversal" ? tx.tipos.transversal : n.clase === "de-tribu" ? tx.tipos["circulo-tribu"] : tx.tipos["circulo-comun"];
      case "rol":
        return tx.tipos.rol;
      case "lugar":
        return tx.tipos.lugar;
      case "lugar-libre":
        return tx.tipos["lugar-libre"];
    }
  };
  return { tx, estados, nombreRol, tipoDe };
}

/** El camino de un nodo en texto: "Lighthouse › Valle Solar › Cuidado de la tierra". */
export function textoDeCamino(camino: readonly NodoH[]): string {
  return camino.map((n) => ("nombre" in n ? n.nombre : n.id)).join(" › ");
}

type PropsPersona = {
  raiz: NodoH;
  personaId: string;
  nombre: string;
  enfocar: (id: string) => void;
  seleccionar: (id: string | null) => void;
};

/** "Todos los roles de {nombre} (ejemplo)": un botón por rol que hace zoom a ese círculo y mantiene a la persona elegida. */
export function RolesDePersona({ raiz, personaId, nombre, enfocar, seleccionar }: PropsPersona) {
  const { tx, nombreRol } = useEtiquetas();
  const roles = rolesDe(raiz, personaId);
  return (
    <section aria-labelledby="persona-titulo" className="grid gap-2 rounded-lg border border-deep bg-green-soft p-3" data-testid="roles-de-persona">
      <h3 id="persona-titulo" className="font-semibold" translate="no">
        {tx.panel.todosLosRoles(nombre)}
      </h3>
      <ul className="grid gap-2">
        {roles.map((r) => (
          <li key={r.nodoRolId}>
            <button type="button" onClick={() => enfocar(r.circuloId)} className={BOTON_LINEA}>
              {tx.panel.rolEn(nombreRol(r.rol), r.circulo, r.lugar.tipo === "tribu" ? r.lugar.nombre : tx.panel.elComun)}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => seleccionar(null)} className={`${BOTON_LINEA} justify-self-start`}>
        {tx.panel.quitarPersona}
      </button>
    </section>
  );
}

type PropsNodo = {
  raiz: NodoH;
  nodo: NodoH;
  /** Persona elegida (id de persona) para marcar su botón. */
  personaId: string | null;
  enfocar: (id: string) => void;
  seleccionar: (id: string | null) => void;
};

/** El detalle de un nivel: tipo, propósito, "Decide sobre", círculos o roles y validación. */
export function DetalleNodo({ raiz, nodo, personaId, enfocar, seleccionar }: PropsNodo) {
  const { tx, estados, nombreRol, tipoDe } = useEtiquetas();
  const idioma = useIdioma();
  const p = tx.panel;

  if (nodo.tipo === "lugar-libre") {
    return (
      <div className="grid gap-2">
        <h3 className="text-xl font-semibold">{p.lugarLibre}</h3>
        <p className="text-sm">
          <span className="font-medium">{p.tipo}:</span> {tipoDe(nodo)}
        </p>
        <p className="text-sm">{p.lugarLibreTexto}</p>
      </div>
    );
  }
  if (nodo.tipo === "lugar") {
    return (
      <div className="grid gap-2">
        <h3 className="text-xl font-semibold">{p.lugarDe(nodo.nombre)}</h3>
        <p className="text-sm">
          <span className="font-medium">{p.tipo}:</span> {tipoDe(nodo)}
        </p>
        <p className="text-sm">
          {p.sinRepresentante}
          <TerminoLegal clave="representante" />
        </p>
      </div>
    );
  }
  if (nodo.tipo === "rol") {
    return (
      <div className="grid gap-2">
        <h3 className="text-xl font-semibold" translate="no">{p.persona(nodo.persona)}</h3>
        <p className="text-sm">{nombreRol(nodo.rol)}</p>
      </div>
    );
  }

  const n: NodoContenedor = nodo;
  const hijos = hijosDe(n);
  const roles = hijos.filter((h) => h.tipo === "rol");
  const contenedores = hijos.filter((h) => h.tipo === "tribu" || h.tipo === "circulo" || h.tipo === "consejo");
  const proposito = n.proposito ? tx.propositos[n.proposito] : p.sinDato;
  const tribusQueParticipan = (n.tribus ?? [])
    .map((id) => buscarNodo(raiz, id))
    .filter((x): x is NodoContenedor => x !== null && "nombre" in x)
    .map((x) => x.nombre);
  const y = new Intl.ListFormat(idioma, { style: "long", type: "conjunction" });

  return (
    <div className="grid gap-3">
      <h3 className="text-xl font-semibold" translate="no">{n.nombre}</h3>
      <p className="text-sm">
        <span className="font-medium">{p.tipo}:</span> {tipoDe(n)}
        {n.ejemplo && <span className="text-muted"> {p.ejemplo}</span>}
      </p>
      {n.tipo === "tribu" && n.estado && (
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <span className={CHIP}>
            {p.estado} <span aria-hidden="true">{GLIFO_ESTADO[n.estado]} </span>
            {estados[n.estado]}
          </span>
          {n.estado !== "vacante" && (
            <span className={CHIP}>{n.validada ? tx.arbol.validada : tx.arbol.noValidada}</span>
          )}
          {n.estado === "vacante" && <span className={CHIP}>{p.sinLugar}</span>}
        </p>
      )}
      <p className="text-sm">{p.proposito(proposito)}</p>
      <div>
        <h4 className="text-sm font-semibold">
          {p.decideSobre}
          <TerminoLegal clave="dominio" />
        </h4>
        {n.decide.length > 0 ? (
          <ul className="mt-1 flex flex-wrap gap-2">
            {n.decide.map((d) => (
              <li key={d} className={CHIP}>{d}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted">{p.sinDato}</p>
        )}
      </div>

      {n.clase === "transversal" && (
        <p className="text-sm">
          {tribusQueParticipan.length > 0 ? p.participan(y.format(tribusQueParticipan)) : p.sinTribus}
          <span className="block text-muted">{p.zonaSinDato}</span>
        </p>
      )}

      {n.tipo === "tribu" && (
        <p className="text-sm">
          <Link className={ENLACE} href={`/tribus/${n.id}`}>{p.verFicha}</Link>
        </p>
      )}

      {n.tipo === "tribu" && n.estado === "vacante" && (
        <p className="text-sm">
          <span className="font-medium">{p.lugarLibre}.</span> {p.lugarLibreTexto}
        </p>
      )}

      {n.tipo === "consejo" && (
        <div className="grid gap-2">
          <h4 className="text-sm font-semibold">
            {p.lugaresConsejo}
            <TerminoLegal clave="consejo" />
          </h4>
          <p className="text-sm">{p.consejoIntro}</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {hijos.map((l) =>
              l.tipo === "lugar" ? (
                <li key={l.id} className="rounded-lg border border-faint px-3 py-2 text-sm">
                  <span className="font-medium" translate="no">{p.lugarDe(l.nombre)}</span>
                  <span className="block text-muted">
                    {p.sinRepresentante}
                    <TerminoLegal clave="representante" />
                  </span>
                </li>
              ) : null,
            )}
          </ul>
          <p className="text-sm text-muted">{p.votan}</p>
        </div>
      )}

      {contenedores.length > 0 && n.tipo !== "consejo" && (
        <div className="grid gap-2">
          <h4 className="text-sm font-semibold">
            {p.circulos}
            <TerminoLegal clave="circulotrabajo" />
          </h4>
          <ul className="flex flex-wrap gap-2">
            {contenedores.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => enfocar(c.id)} className={BOTON_LINEA} translate="no">
                  {"nombre" in c ? c.nombre : c.id}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {n.tipo === "tribu" && n.estado !== "vacante" && contenedores.length === 0 && (
        <p className="text-sm text-muted">{p.sinCirculos}</p>
      )}

      {n.tipo === "circulo" && (
        <div className="grid gap-2">
          <h4 className="text-sm font-semibold">
            {p.roles}
            <TerminoLegal clave="dobleenlace" />
          </h4>
          <p className="text-xs text-muted">{p.rolesNota}</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {roles.map((r) =>
              r.tipo === "rol" ? (
                <li key={r.id}>
                  <button
                    type="button"
                    aria-pressed={personaId === r.personaId}
                    onClick={() => seleccionar(r.id)}
                    className={`${BOTON_LINEA} w-full`}
                  >
                    <span translate="no">{p.persona(r.persona)}</span>
                    <span className="block text-muted">{nombreRol(r.rol)}</span>
                  </button>
                </li>
              ) : null,
            )}
          </ul>
          <p className="text-xs text-muted">{p.verPersona}</p>
        </div>
      )}
    </div>
  );
}
