"use client";

import { useEffect, useState } from "react";
import { CLAVES } from "@/lib/demo/claves";
import { buscarElemento, listarBarrios,listarFincas, terrenoComun, tribuDeBarrio } from "@/lib/territorios/biopueblo";
import { FichaLateral } from "./ficha-lateral";
import MapaCliente from "./mapa-cliente";

const LEYENDA = [
  { clase: "mapa-leyenda-activa", texto: "Barrio con tribu activa" },
  { clase: "mapa-leyenda-formacion", texto: "Barrio con tribu en formación" },
  { clase: "mapa-leyenda-vacante", texto: "Barrio que busca tribu" },
  { clase: "mapa-leyenda-nucleo", texto: "Terreno común" },
  { clase: "mapa-leyenda-finca-disponible", texto: "Finca disponible" },
  { clase: "mapa-leyenda-finca-reservada", texto: "Finca reservada" },
  { clase: "mapa-leyenda-finca-cantera", texto: "Finca cantera" },
  { clase: "mapa-leyenda-soluna", texto: "Contorno de Chacras de Soluna" },
  { clase: "mapa-leyenda-lugar", texto: "Lugar de interés" },
];

const botonLista =
  "rounded-lg border border-faint bg-surface px-3 py-1 text-sm hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep aria-pressed:border-ink aria-pressed:bg-surface-2 aria-pressed:font-semibold";

export function VitrinaTerritorio() {
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [consultas, setConsultas] = useState<string[]>([]);

  useEffect(() => {
    // Enlace compartible: ?sel=barrio-6 deja elegido ese elemento (sin recargar ni cambiar de página).
    const sel = new URLSearchParams(window.location.search).get("sel");
    if (sel && buscarElemento(sel)) setSeleccion(sel);
  }, []);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      const guardado = JSON.parse(window.localStorage.getItem(CLAVES.consultasLotes) ?? "[]");
      if (Array.isArray(guardado)) setConsultas(guardado.filter((x): x is string => typeof x === "string"));
    } catch {
      // Sin almacenamiento o contenido dañado: se empieza sin consultas.
    }
  }, []);

  function consultar(id: string) {
    const nuevas = consultas.includes(id) ? consultas : [...consultas, id];
    setConsultas(nuevas);
    try {
      window.localStorage.setItem(CLAVES.consultasLotes, JSON.stringify(nuevas));
    } catch {
      // Sin almacenamiento: la consulta simulada vale solo mientras la página siga abierta.
    }
  }

  const barrios = listarBarrios();
  const disponibles = listarFincas().filter((f) => f.estado === "disponible");
  const comun = terrenoComun();

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-3">
      <section aria-labelledby="mapa-titulo" className="grid min-w-0 content-start gap-3 md:col-span-2">
        <h2 id="mapa-titulo" className="text-xl font-semibold">
          Mapa del Macrolote 7
        </h2>
        <MapaCliente seleccion={seleccion} alElegir={setSeleccion} />
        <ul aria-label="Leyenda del mapa" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {LEYENDA.map((l) => (
            <li key={l.texto} className="flex items-center gap-2">
              <span aria-hidden="true" className={`mapa-leyenda ${l.clase}`} />
              {l.texto}
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          Los barrios y el terreno común están distribuidos al azar, solo de forma ilustrativa, hasta el masterplan.
        </p>
        <p className="text-sm text-muted">
          Imagen satelital: Esri, Maxar, Earthstar Geographics.{" "}
          <a className="underline" href="https://www.esri.com" target="_blank" rel="noreferrer">
            Esri
          </a>
        </p>

        <section aria-labelledby="elegir-titulo" className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
          <h3 id="elegir-titulo" className="font-semibold">
            Elegir en el mapa
          </h3>
          <ul className="flex flex-wrap gap-2">
            {barrios.map((b) => (
              <li key={b.id}>
                <button type="button" className={botonLista} aria-pressed={seleccion === b.id} onClick={() => setSeleccion(b.id)}>
                  Barrio {b.barrio}
                  {tribuDeBarrio(b)?.estado !== "vacante" && ` · ${tribuDeBarrio(b)?.nombre}`}
                </button>
              </li>
            ))}
            <li>
              <button type="button" className={botonLista} aria-pressed={seleccion === comun.id} onClick={() => setSeleccion(comun.id)}>
                Terreno común
              </button>
            </li>
          </ul>
          <details>
            <summary className="w-fit cursor-pointer rounded text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
              Fincas disponibles de Soluna ({disponibles.length})
            </summary>
            <ul className="mt-2 flex flex-wrap gap-2">
              {disponibles.map((f) => (
                <li key={f.id}>
                  <button type="button" className={botonLista} aria-pressed={seleccion === f.id} onClick={() => setSeleccion(f.id)}>
                    Finca {f.numero}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </section>
      </section>

      <aside
        aria-label="Ficha del territorio"
        aria-live="polite"
        className="grid min-w-0 content-start gap-3 rounded-xl border border-faint bg-surface p-4 md:self-start"
      >
        <FichaLateral seleccion={seleccion} consultas={consultas} alConsultar={consultar} />
        {seleccion && (
          <button
            type="button"
            onClick={() => setSeleccion(null)}
            className="w-fit rounded text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
          >
            Volver al resumen
          </button>
        )}
      </aside>
    </div>
  );
}
