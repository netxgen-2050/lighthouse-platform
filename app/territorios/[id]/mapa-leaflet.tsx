"use client";

import "leaflet/dist/leaflet.css";
import type { Path, PathOptions } from "leaflet";
import { useEffect, useRef } from "react";
import {
  listarBarrios,
  listarContexto,
  listarFincas,
  listarLugares,
  macrolote7,
  solunaContorno,
  terrenoComun,
  tribuDeBarrio,
  type Anillo,
  type EstadoFinca,
} from "@/lib/territorios/biopueblo";
import { TEXTO_ESTADO, type EstadoTribu } from "@/lib/tribus/tipos";

type Props = {
  /** Id del elemento elegido (barrio, común, finca o lugar), o null. */
  seleccion: string | null;
  alElegir: (id: string) => void;
};

const aLatLng = (a: Anillo): [number, number][] => a.map(([lng, lat]) => [lat, lng]);

/** Lee un token del tema: el canvas de Leaflet no entiende `var(--…)`. */
function token(nombre: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${nombre}`).trim();
}

function estiloBarrio(estado: EstadoTribu): PathOptions {
  if (estado === "activa") return { color: token("deep"), weight: 2, fillColor: token("green"), fillOpacity: 0.5 };
  if (estado === "formacion")
    return { color: token("gold-ink"), weight: 2, dashArray: "2 5", lineCap: "round", fillColor: token("gold"), fillOpacity: 0.4 };
  return { color: token("muted"), weight: 2, dashArray: "6 4", fillColor: token("surface"), fillOpacity: 0.35 };
}

function estiloFinca(estado: EstadoFinca | undefined): PathOptions {
  if (estado === "disponible") return { color: token("deep"), weight: 1, fillColor: token("green"), fillOpacity: 0.55 };
  if (estado === "reservada")
    return { color: token("gold-ink"), weight: 1.5, dashArray: "3 3", fillColor: token("gold"), fillOpacity: 0.6 };
  return { color: token("muted"), weight: 1, fillColor: token("gray"), fillOpacity: 0.6 };
}

export default function MapaLeaflet({ seleccion, alElegir }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const elegir = useRef(alElegir);
  elegir.current = alElegir;
  // Capas por id, con su estilo base, para resaltar la elegida sin rehacer el mapa.
  const capas = useRef(new Map<string, { capa: Path; base: PathOptions; limites: () => L.LatLngBounds }>());
  const mapaRef = useRef<L.Map | null>(null);
  const ultima = useRef<string | null>(null);
  const seleccionActual = useRef<string | null>(seleccion);
  seleccionActual.current = seleccion;

  function resaltar(id: string | null) {
    if (ultima.current) {
      const previa = capas.current.get(ultima.current);
      previa?.capa.setStyle({ ...previa.base, weight: previa.base.weight ?? 1 });
    }
    ultima.current = id;
    const nueva = id ? capas.current.get(id) : undefined;
    if (nueva) {
      nueva.capa.setStyle({ color: token("ink"), weight: 4, dashArray: undefined, fillOpacity: Math.min(0.85, (nueva.base.fillOpacity ?? 0.4) + 0.3) });
      nueva.capa.bringToFront();
      const m = mapaRef.current;
      if (m && id?.startsWith("finca-")) m.fitBounds(nueva.limites(), { padding: [40, 40], maxZoom: 17 });
    }
  }

  useEffect(() => {
    let cancelado = false;
    let destruir: (() => void) | undefined;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelado || !contenedor.current) return;

      const macro = macrolote7();
      const mapa = L.map(contenedor.current, { attributionControl: false });
      mapaRef.current = mapa;
      destruir = () => {
        mapa.remove();
        mapaRef.current = null;
        capas.current.clear();
        ultima.current = null;
      };
      // La vista tiene que existir antes de agregar capas.
      mapa.fitBounds(L.latLngBounds(aLatLng(macro.anillo)), { padding: [8, 8] });

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
      }).addTo(mapa);

      const renderer = L.canvas({ padding: 0.5 });
      const registrar = (id: string, capa: L.Polygon, base: PathOptions) => {
        capas.current.set(id, { capa, base, limites: () => capa.getBounds() });
        capa.on("click", () => elegir.current(id));
      };

      // Orden: contexto, Soluna y fincas, macrolote, común, barrios, lugares.
      for (const z of listarContexto()) {
        L.polygon(aLatLng(z.anillo), {
          renderer,
          interactive: false,
          color: token("muted"),
          weight: 1,
          opacity: 0.6,
          fillColor: token("gray"),
          fillOpacity: 0.15,
        }).addTo(mapa);
      }
      L.polygon(aLatLng(solunaContorno().anillo), {
        renderer,
        interactive: false,
        color: token("blue"),
        weight: 2.5,
        fillOpacity: 0,
      }).addTo(mapa);
      for (const f of listarFincas()) {
        const base = estiloFinca(f.estado);
        const capa = L.polygon(aLatLng(f.anillo), { renderer, ...base }).addTo(mapa);
        registrar(f.id, capa, base);
      }
      L.polygon(aLatLng(macro.anillo), {
        renderer,
        interactive: false,
        color: token("on-deep"),
        weight: 3.5,
        fillColor: token("deep"),
        fillOpacity: 0.08,
      }).addTo(mapa);
      const comun = terrenoComun();
      const baseComun: PathOptions = { color: token("gold-ink"), weight: 2, fillColor: token("gold-soft"), fillOpacity: 0.6 };
      registrar(comun.id, L.polygon(aLatLng(comun.anillo), { renderer, ...baseComun }).addTo(mapa), baseComun);

      const barrios = listarBarrios();
      for (const b of barrios) {
        const t = tribuDeBarrio(b);
        const base = estiloBarrio(t?.estado ?? "vacante");
        registrar(b.id, L.polygon(aLatLng(b.anillo), { renderer, ...base }).addTo(mapa), base);
      }

      // Marcadores con foco de teclado: se leen como botones y eligen lo mismo que el clic.
      const marcar = (id: string, centro: L.LatLngExpression, texto: string, etiqueta: string, clase: string, tam: number) => {
        // El texto se arma con textContent: nunca se interpreta como HTML.
        const sello = document.createElement("span");
        sello.className = `mapa-sello ${clase}`;
        sello.textContent = texto;
        const marcador = L.marker(centro, {
          keyboard: true,
          icon: L.divIcon({ className: "mapa-sello-wrap", html: sello, iconSize: [tam, tam], iconAnchor: [tam / 2, tam / 2] }),
        }).addTo(mapa);
        const el = marcador.getElement();
        if (el) {
          el.setAttribute("role", "button");
          el.setAttribute("aria-label", etiqueta);
          el.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              elegir.current(id);
            }
          });
        }
        marcador.on("click", () => elegir.current(id));
      };

      for (const b of barrios) {
        const t = tribuDeBarrio(b);
        const estado = t?.estado ?? "vacante";
        const etiqueta =
          estado === "vacante" ? `Barrio ${b.barrio} · Busca tribu` : `Barrio ${b.barrio} · ${t?.nombre} · ${TEXTO_ESTADO[estado]}`;
        const centro = capas.current.get(b.id)!.limites().getCenter();
        marcar(b.id, centro, estado === "vacante" ? "+" : (t?.iniciales ?? ""), etiqueta, `mapa-sello-${estado}`, 40);
      }
      marcar(
        comun.id,
        capas.current.get(comun.id)!.limites().getCenter(),
        "C",
        "Terreno común del Lighthouse",
        "mapa-sello-comun",
        40,
      );
      for (const l of listarLugares()) {
        marcar(l.id, [l.punto[1], l.punto[0]], "•", `Lugar de interés · ${l.nombre}`, "mapa-sello-lugar", 24);
      }

      resaltar(seleccionActual.current);
    })();

    return () => {
      cancelado = true;
      destruir?.();
    };
  }, []);

  useEffect(() => {
    if (mapaRef.current) resaltar(seleccion);
  }, [seleccion]);

  return <div ref={contenedor} className="mapa-leaflet h-[26rem] w-full rounded-xl border border-faint" />;
}
