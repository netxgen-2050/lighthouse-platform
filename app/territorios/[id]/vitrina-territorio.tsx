"use client";

import { useEffect, useState } from "react";
import { useSesion } from "@/components/sesion/contexto";
import { guardarPedido, leerBandejaDelNavegador } from "@/lib/contactos/almacen";
import type { Pedido } from "@/lib/contactos/tipos";
import { textoEn } from "@/lib/idioma/tipos";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import type { territorio } from "@/lib/idioma/textos/territorio";
import type { Textos } from "@/lib/idioma/tipos";
import { listarBarrios, listarFincas, terrenoComun, tribuDeBarrio } from "@/lib/territorios/biopueblo";
import { FASE_ACTUAL, FASES, type Fase } from "@/lib/territorios/fases";
import {
  VISTAS,
  elegibles,
  esDeHoy,
  frentesEn,
  leerEntrada,
  type FuentePlanId,
  type VistaId,
} from "@/lib/territorios/vistas";
import { listarTribus } from "@/lib/tribus/datos";
import { FichaLateral } from "./ficha-lateral";
import MapaCliente from "./mapa-cliente";

type Tx = Textos<typeof territorio.es>;

type Grupo = {
  id: string;
  titulo: React.ReactNode;
  items: { clase: string; texto: string }[];
  nota?: string;
};

// Los títulos de los dos primeros grupos son nombres propios (Lighthouse, Macrolote 7, Chacras de Soluna): no se traducen.
function grupos(tx: Tx, vista: VistaId, fase: Fase): Grupo[] {
  const l = tx.leyenda;
  const v = tx.leyendaVistas;
  const hayFrenteQueViene = frentesEn(fase).conLugar.some((f) => !esDeHoy(f));
  const lighthouse: Record<VistaId, Grupo["items"]> = {
    ahora: [
      { clase: "mapa-leyenda-frente", texto: v.frente },
      ...(hayFrenteQueViene ? [{ clase: "mapa-leyenda-frente-despues", texto: v.frenteDespues }] : []),
      { clase: "mapa-leyenda-nucleo", texto: l.comun },
    ],
    plan: [
      { clase: "mapa-leyenda-zona", texto: v.zona },
      { clase: "mapa-leyenda-nucleo", texto: l.comun },
    ],
    vision: [
      { clase: "mapa-leyenda-activa", texto: l.activa },
      { clase: "mapa-leyenda-formacion", texto: l.formacion },
      { clase: "mapa-leyenda-vacante", texto: l.vacante },
      { clase: "mapa-leyenda-nucleo", texto: l.comun },
    ],
  };
  return [
    {
      id: "leyenda-lighthouse",
      titulo: <span translate="no">Lighthouse · Macrolote 7</span>,
      items: lighthouse[vista],
      nota: vista === "vision" ? v.ejemploTribus : undefined,
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

/** Escribe vista, fase y selección juntas, sin recargar ni sumar al historial. La fase de hoy no se escribe. */
function escribirUrl(vista: VistaId, fase: Fase, sel: string | null) {
  const url = new URL(window.location.href);
  url.searchParams.set("vista", vista);
  if (fase === FASE_ACTUAL) url.searchParams.delete("fase");
  else url.searchParams.set("fase", String(fase));
  if (sel) url.searchParams.set("sel", sel);
  else url.searchParams.delete("sel");
  window.history.replaceState(window.history.state, "", url);
}

export function VitrinaTerritorio() {
  const idioma = useIdioma();
  const tx = useTextos("territorio");
  const [vista, setVista] = useState<VistaId>("ahora");
  const [fase, setFase] = useState<Fase>(FASE_ACTUAL);
  const [fuente, setFuente] = useState<FuentePlanId>("ilustrativa");
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [consultas, setConsultas] = useState<string[]>([]);

  useEffect(() => {
    // Enlace compartible: una sola lectura de ?vista=, ?fase= y ?sel= (sin recargar ni cambiar de página).
    const e = leerEntrada(new URLSearchParams(window.location.search));
    setVista(e.vista);
    setFase(e.fase);
    setFuente(e.fuente);
    setSeleccion(e.sel);
  }, []);

  function cambiarVista(id: VistaId) {
    setVista(id);
    setSeleccion(null);
    escribirUrl(id, fase, null);
  }

  function cambiarFase(f: Fase) {
    setFase(f);
    // Una selección que ya no es elegible en esa fase se limpia.
    const sel = seleccion && elegibles(vista, f).includes(seleccion) ? seleccion : null;
    setSeleccion(sel);
    escribirUrl(vista, f, sel);
  }

  function elegir(id: string | null) {
    if (id !== null && !elegibles(vista, fase).includes(id)) return;
    setSeleccion(id);
    escribirUrl(vista, fase, id);
  }

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

  return (
    <div className="mt-6 grid gap-6 md:grid-cols-3">
      <section aria-labelledby="mapa-titulo" className="grid min-w-0 content-start gap-3 md:col-span-2">
        <h2 id="mapa-titulo" className="text-xl font-semibold">
          {tx.mapaDe} <span translate="no">Macrolote 7</span>
        </h2>

        <div role="group" aria-label={tx.vistas.grupo} className="flex flex-wrap gap-2">
          {VISTAS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={botonLista}
              aria-pressed={vista === v.id}
              onClick={() => cambiarVista(v.id)}
            >
              {vista === v.id && <span aria-hidden="true">✓ </span>}
              {tx.vistas[v.id].nombre}
            </button>
          ))}
        </div>

        <fieldset className="grid gap-1 text-sm">
          <legend className="font-semibold">{tx.etapa.titulo}</legend>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5">
            {FASES.map((f) => {
              const cuando = f.cuando ? textoEn(f.cuando, idioma) : null;
              const nombre = textoEn(f.nombre, idioma).toLowerCase();
              let texto = `${tx.etapa.fase} ${f.fase}${cuando ? ` · ${cuando}, ${nombre}` : ` · ${nombre}`}`;
              if (f.fase === FASE_ACTUAL && !/hoy|today/i.test(texto)) texto += ` ${tx.etapa.hoy}`;
              return (
                <label key={f.fase} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="etapa"
                    value={f.fase}
                    checked={fase === f.fase}
                    onChange={() => cambiarFase(f.fase)}
                    className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
                  />
                  {texto}
                </label>
              );
            })}
          </div>
        </fieldset>

        <MapaCliente seleccion={seleccion} alElegir={elegir} vista={vista} fase={fase} />
        <div role="group" aria-label={tx.leyenda.grupo} className="grid gap-3 text-sm">
          {grupos(tx, vista, fase).map((g) => (
            <div key={g.id} className="grid gap-1">
              <p id={g.id} className="font-semibold">
                {g.titulo}
              </p>
              {g.nota && <p className="text-muted">{g.nota}</p>}
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
        <p className="text-sm text-muted">{vista === "ahora" ? tx.frente.lugarIlustrativo : tx.notaDistribucion}</p>
        <p className="text-sm text-muted">
          {tx.notaImagen}{" "}
          <a className="underline" href="https://www.esri.com" target="_blank" rel="noreferrer">
            Esri
          </a>
        </p>

        <section aria-labelledby="elegir-titulo" className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
          <h3 id="elegir-titulo" className="font-semibold">
            {tx.elegir.titulo}
          </h3>
          <ul className="flex flex-wrap gap-2">
            {vista === "vision" &&
              barrios.map((b) => {
                const t = tribuDeBarrio(b, tribus);
                return (
                  <li key={b.id}>
                    <button type="button" className={botonLista} aria-pressed={seleccion === b.id} onClick={() => elegir(b.id)}>
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
              <button type="button" className={botonLista} aria-pressed={seleccion === comun.id} onClick={() => elegir(comun.id)}>
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
                  <button type="button" className={botonLista} aria-pressed={seleccion === f.id} onClick={() => elegir(f.id)}>
                    {tx.elegir.finca(f.numero === undefined ? tx.elegir.sinNumero : String(f.numero))}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        </section>
      </section>

      <aside
        aria-label={tx.ficha.aria}
        aria-live="polite"
        className="grid min-w-0 content-start gap-3 rounded-xl border border-faint bg-surface p-4 md:self-start"
      >
        <FichaLateral
          seleccion={seleccion}
          consultas={consultas}
          alConsultar={consultar}
          vista={vista}
          fase={fase}
          fuente={fuente}
          alElegir={elegir}
        />
        {seleccion && (
          <button
            type="button"
            onClick={() => elegir(null)}
            className="w-fit rounded text-sm underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
          >
            {tx.ficha.volverAlResumen}
          </button>
        )}
      </aside>
    </div>
  );
}
