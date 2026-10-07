"use client";

import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { Poligono } from "@/lib/territorios/geometria";

export type SelloMapa = {
  barrio: number;
  tribuId: string;
  nombre: string;
  iniciales: string;
  estado: "activa" | "formacion" | "vacante";
  /** Texto del estado ("Activa", "En formación", "Busca tribu"). */
  textoEstado: string;
  poligono: Poligono;
};

type Props = {
  contorno: Poligono;
  nucleo: Poligono;
  sellos: SelloMapa[];
};

const aLatLng = (p: Poligono): [number, number][] => p.map(([lng, lat]) => [lat, lng]);

function centro(p: Poligono): [number, number] {
  const lngs = p.map((x) => x[0]);
  const lats = p.map((x) => x[1]);
  return [(Math.min(...lats) + Math.max(...lats)) / 2, (Math.min(...lngs) + Math.max(...lngs)) / 2];
}

function nombreAccesible(s: SelloMapa): string {
  return s.estado === "vacante"
    ? `Barrio ${s.barrio} · Busca tribu`
    : `Barrio ${s.barrio} · ${s.nombre} · ${s.textoEstado}`;
}

export default function MapaLeaflet({ contorno, nucleo, sellos }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const irA = useRef((ruta: string) => router.push(ruta));
  irA.current = (ruta: string) => router.push(ruta);

  useEffect(() => {
    let cancelado = false;
    let destruir: (() => void) | undefined;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelado || !contenedor.current) return;

      const limites = L.latLngBounds(aLatLng(contorno));
      const mapa = L.map(contenedor.current, { attributionControl: false, maxBounds: limites.pad(0.6) });
      destruir = () => mapa.remove();
      // La vista tiene que existir antes de agregar los marcadores: sin ella Leaflet no crea su elemento.
      mapa.fitBounds(limites, { padding: [8, 8] });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(mapa);
      L.polygon(aLatLng(contorno), { className: "mapa-contorno", interactive: false }).addTo(mapa);
      L.polygon(aLatLng(nucleo), { className: "mapa-nucleo", interactive: false }).addTo(mapa);

      for (const s of sellos) {
        L.polygon(aLatLng(s.poligono), {
          className: `mapa-barrio mapa-barrio-${s.estado}`,
          interactive: false,
        }).addTo(mapa);
      }
      for (const s of sellos) {
        // El sello se arma con textContent: las iniciales nunca se interpretan como HTML.
        const sello = document.createElement("span");
        sello.className = `mapa-sello mapa-sello-${s.estado}`;
        sello.textContent = s.estado === "vacante" ? "+" : s.iniciales;
        const marcador = L.marker(centro(s.poligono), {
          keyboard: true,
          icon: L.divIcon({
            className: "mapa-sello-wrap",
            html: sello,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          }),
        }).addTo(mapa);
        const el = marcador.getElement();
        if (el) {
          el.setAttribute("role", "link");
          el.setAttribute("aria-label", nombreAccesible(s));
          // Leaflet no convierte Enter en clic para los marcadores: un enlace se activa con Enter.
          el.addEventListener("keydown", (e) => {
            if (e.key === "Enter") irA.current(`/tribus/${s.tribuId}`);
          });
        }
        marcador.on("click", () => irA.current(`/tribus/${s.tribuId}`));
      }

    })();

    return () => {
      cancelado = true;
      destruir?.();
    };
  }, [contorno, nucleo, sellos]);

  return <div ref={contenedor} className="mapa-leaflet h-[26rem] w-full rounded-xl border border-faint" />;
}
