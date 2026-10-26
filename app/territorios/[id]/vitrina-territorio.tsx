"use client";

import { useEffect, useRef, useState } from "react";
import { useSesion } from "@/components/sesion/contexto";
import { guardarPedido, leerBandejaDelNavegador } from "@/lib/contactos/almacen";
import type { Pedido } from "@/lib/contactos/tipos";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import type { territorio } from "@/lib/idioma/textos/territorio";
import type { Textos } from "@/lib/idioma/tipos";
import { buscarElemento, listarBarrios,listarFincas, terrenoComun, tribuDeBarrio } from "@/lib/territorios/biopueblo";
import { CAPAS_PERMACULTURA, buscarElementoPermacultura, elementosDeCapa, resumenPermacultura } from "@/lib/territorios/permacultura";
import { listarTribus } from "@/lib/tribus/datos";
import { FichaLateral } from "./ficha-lateral";
import { FichaPermacultura } from "./ficha-permacultura";
import MapaCliente from "./mapa-cliente";
import type { VistaMapa } from "./mapa-leaflet";

type Leyenda = Textos<typeof territorio.es>["leyenda"];

// Los títulos de los dos primeros grupos son nombres propios (Lighthouse · Macrolote 7, Chacras de Soluna): no se traducen.
function grupos(l: Leyenda) {
  return [
    {
      id: "leyenda-lighthouse",
      titulo: <span translate="no">Lighthouse · Macrolote 7</span>,
      items: [
        { clase: "mapa-leyenda-activa", texto: l.activa },
        { clase: "mapa-leyenda-formacion", texto: l.formacion },
        { clase: "mapa-leyenda-vacante", texto: l.vacante },
        { clase: "mapa-leyenda-nucleo", texto: l.comun },
      ],
    },
    {
      id: "leyenda-soluna",
      titulo: (
        <>
          <span translate="no">Chacras de Soluna</span> · {l.ventaPrivada}
        </>
      ),
      items: [
        { clase: "mapa-leyenda-finca-disponible", texto: l.fincaDisponible },
        { clase: "mapa-leyenda-finca-reservada", texto: l.fincaReservada },
        { clase: "mapa-leyenda-finca-cantera", texto: l.fincaCantera },
        { clase: "mapa-leyenda-soluna", texto: l.contornoSoluna },
      ],
    },
    {
      id: "leyenda-lugares",
      titulo: <>{l.lugares}</>,
      items: [{ clase: "mapa-leyenda-lugar", texto: l.lugar }],
    },
  ];
}

const botonLista =
  "rounded-lg border border-faint bg-surface px-3 py-1 text-sm hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep aria-pressed:border-ink aria-pressed:bg-surface-2 aria-pressed:font-semibold";

export function VitrinaTerritorio() {
  const idioma = useIdioma();
  const tx = useTextos("territorio");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaMapa>("barrios");
  const [consultas, setConsultas] = useState<string[]>([]);

  useEffect(() => {
    // Enlace compartible: ?vista=permacultura abre la alternativa y ?sel=barrio-6 deja elegido ese elemento.
    const params = new URLSearchParams(window.location.search);
    const v: VistaMapa = params.get("vista") === "permacultura" ? "permacultura" : "barrios";
    setVista(v);
    const sel = params.get("sel");
    if (sel && (v === "permacultura" ? buscarElementoPermacultura(sel) : buscarElemento(sel))) setSeleccion(sel);
  }, []);

  function cambiarVista(v: VistaMapa) {
    if (v === vista) return;
    setVista(v);
    // Lo elegido en una vista no existe en la otra.
    setSeleccion(null);
    const url = new URL(window.location.href);
    if (v === "permacultura") url.searchParams.set("vista", v);
    else url.searchParams.delete("vista");
    url.searchParams.delete("sel");
    window.history.replaceState(window.history.state, "", url);
  }

  // La selección queda en la URL (?sel=…, sin recargar ni sumar al historial): al entrar, la página se rearma
  // y la persona sigue viendo lo que había elegido. No se toca la URL hasta que la selección cambia, para no borrar un ?sel= recién llegado.
  const escrita = useRef<string | null>(null);
  useEffect(() => {
    if (seleccion === escrita.current) return;
    escrita.current = seleccion;
    const url = new URL(window.location.href);
    if (seleccion) url.searchParams.set("sel", seleccion);
    else url.searchParams.delete("sel");
    window.history.replaceState(window.history.state, "", url);
  }, [seleccion]);

  const { estado: estadoSesion } = useSesion();
  const conSesion = estadoSesion === "ok";

  useEffect(() => {
    // Sin sesión no hay bandeja de la persona que leer.
    if (!conSesion) return;
    // Lectura de la bandeja del navegador tras hidratar (no existe en el servidor).
    setConsultas(
      leerBandejaDelNavegador()
        .filter((p) => p.motivo === "consulta-lote")
        .map((p) => p.referencia),
    );
  }, [conSesion]);

  function consultar(pedido: Pedido): boolean {
    if (!guardarPedido(pedido)) return false;
    setConsultas((previas) => [...previas, pedido.referencia]);
    return true;
  }

  const barrios = listarBarrios();
  const disponibles = listarFincas().filter((f) => f.estado === "disponible");
  const comun = terrenoComun();
  const tribus = listarTribus(idioma);
  const pc = tx.permacultura;
  const enPermacultura = vista === "permacultura";

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-3">
      <section aria-labelledby="mapa-titulo" className="grid min-w-0 content-start gap-3 md:col-span-2">
        <h2 id="mapa-titulo" className="text-xl font-semibold">
          {tx.mapaDe} <span translate="no">Macrolote 7</span>
        </h2>
        <div role="group" aria-label={tx.vista.grupo} className="flex flex-wrap gap-2">
          {(["barrios", "permacultura"] as const).map((v) => (
            <button key={v} type="button" className={botonLista} aria-pressed={vista === v} onClick={() => cambiarVista(v)}>
              {tx.vista[v]}
            </button>
          ))}
        </div>
        {enPermacultura && (
          <div className="grid gap-1 rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
            <p className="font-semibold">{pc.aviso}</p>
            <p>{pc.avisoDiseno}</p>
          </div>
        )}
        <MapaCliente seleccion={seleccion} alElegir={setSeleccion} vista={vista} />
        {enPermacultura ? (
          <div role="group" aria-label={tx.leyenda.grupo} className="grid gap-2 text-sm">
            <p className="font-semibold">{pc.leyendaTitulo}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {CAPAS_PERMACULTURA.map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <span aria-hidden="true" className={`mapa-leyenda mapa-leyenda-pc-${c}`} />
                  {pc.capas[c]}
                </li>
              ))}
            </ul>
          </div>
        ) : (
        <div role="group" aria-label={tx.leyenda.grupo} className="grid gap-3 text-sm">
          {grupos(tx.leyenda).map((g) => (
            <div key={g.id} className="grid gap-1">
              <p id={g.id} className="font-semibold">
                {g.titulo}
              </p>
              <ul aria-labelledby={g.id} className="flex flex-wrap gap-x-5 gap-y-2">
                {g.items.map((l) => (
                  <li key={l.texto} className="flex items-center gap-2">
                    <span aria-hidden="true" className={`mapa-leyenda ${l.clase}`} />
                    {l.texto}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        )}
        <p className="text-sm text-muted">
          {enPermacultura ? (
            <>
              {pc.notaMetodo} <span lang="es">{resumenPermacultura().metodo}</span>
            </>
          ) : (
            tx.notaDistribucion
          )}
        </p>
        <p className="text-sm text-muted">
          {tx.notaImagen}{" "}
          <a className="underline" href="https://www.esri.com" target="_blank" rel="noreferrer">
            Esri
          </a>
        </p>

        {enPermacultura ? (
          <section aria-labelledby="elegir-titulo" className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
            <h3 id="elegir-titulo" className="font-semibold">
              {pc.elegirTitulo}
            </h3>
            {CAPAS_PERMACULTURA.map((c) => (
              <div key={c} className="grid gap-1">
                <p id={`elegir-pc-${c}`} className="text-sm font-medium">
                  {pc.capas[c]}
                </p>
                <ul aria-labelledby={`elegir-pc-${c}`} className="flex flex-wrap gap-2">
                  {elementosDeCapa(c).map((e) => (
                    <li key={e.id}>
                      <button type="button" className={botonLista} aria-pressed={seleccion === e.id} onClick={() => setSeleccion(e.id)}>
                        {e.textos[idioma].nombre}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ) : (
        <section aria-labelledby="elegir-titulo" className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
          <h3 id="elegir-titulo" className="font-semibold">
            {tx.elegir.titulo}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {barrios.map((b) => {
              const t = tribuDeBarrio(b, tribus);
              return (
                <li key={b.id}>
                  <button type="button" className={botonLista} aria-pressed={seleccion === b.id} onClick={() => setSeleccion(b.id)}>
                    {tx.elegir.barrio(b.barrio)}
                    {t?.estado !== "vacante" && (
                      <>
                        {" · "}
                        <span translate="no">{t?.nombre}</span>
                      </>
                    )}
                  </button>
                </li>
              );
            })}
            <li>
              <button type="button" className={botonLista} aria-pressed={seleccion === comun.id} onClick={() => setSeleccion(comun.id)}>
                {tx.elegir.comun}
              </button>
            </li>
          </ul>
          <details>
            <summary className="w-fit cursor-pointer rounded text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
              {tx.elegir.fincasDisponibles(disponibles.length)}
            </summary>
            <ul className="mt-2 flex flex-wrap gap-2">
              {disponibles.map((f) => (
                <li key={f.id}>
                  <button type="button" className={botonLista} aria-pressed={seleccion === f.id} onClick={() => setSeleccion(f.id)}>
                    {tx.elegir.finca(f.numero === undefined ? tx.elegir.sinNumero : String(f.numero))}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </section>
        )}
      </section>

      <aside
        aria-label={tx.ficha.aria}
        aria-live="polite"
        className="grid min-w-0 content-start gap-3 rounded-xl border border-faint bg-surface p-4 md:self-start"
      >
        {enPermacultura ? (
          <FichaPermacultura seleccion={seleccion} />
        ) : (
          <FichaLateral seleccion={seleccion} consultas={consultas} alConsultar={consultar} />
        )}
        {seleccion && (
          <button
            type="button"
            onClick={() => setSeleccion(null)}
            className="w-fit rounded text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
          >
            {tx.ficha.volverAlResumen}
          </button>
        )}
      </aside>
    </div>
  );
}
