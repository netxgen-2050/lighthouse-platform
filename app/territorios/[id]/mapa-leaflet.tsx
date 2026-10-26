"use client";

import "leaflet/dist/leaflet.css";
import type { PathOptions } from "leaflet";
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
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { SELLOS_PERMACULTURA, listarElementosPermacultura, type CapaPermacultura, type ElementoPermacultura } from "@/lib/territorios/permacultura";
import { nombreDeLugar } from "@/lib/territorios/textos";
import { listarTribus } from "@/lib/tribus/datos";
import { textoDeEstado, type EstadoTribu } from "@/lib/tribus/tipos";

export type VistaMapa = "barrios" | "permacultura";

type Props = {
  /** Id del elemento elegido (barrio, común, finca, lugar o elemento de la alternativa), o null. */
  seleccion: string | null;
  alElegir: (id: string) => void;
  /** Qué se dibuja dentro del macrolote: la distribución ilustrativa de barrios o el borrador de permacultura. */
  vista?: VistaMapa;
};

/** Lo que el resaltado necesita de una capa: un polígono, una línea o un grupo GeoJSON. */
type Resaltable = { setStyle(estilo: PathOptions): unknown; bringToFront(): unknown };

const aLatLng = (a: Anillo): [number, number][] => a.map(([lng, lat]) => [lat, lng]);

/** Lee un token del tema: el canvas de Leaflet no entiende `var(--…)`. */
function token(nombre: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--color-${nombre}`).trim();
}

function estiloBarrio(estado: EstadoTribu): PathOptions {
  if (estado === "activa") return { color: token("deep"), weight: 2, fillColor: token("green"), fillOpacity: 0.5 };
  if (estado === "formacion")
    return { color: token("gold-ink"), weight: 2, dashArray: "2 5", lineCap: "round", fillColor: token("gold"), fillOpacity: 0.4 };
  return { color: token("faint"), weight: 2, dashArray: "6 4", fillColor: token("surface"), fillOpacity: 0.35 };
}

/** Estilo por capa de la alternativa: además del color, cada grupo tiene su trazo (nada solo con color). */
function estiloPermacultura(e: ElementoPermacultura): PathOptions {
  const porCapa: Record<CapaPermacultura, PathOptions> = {
    agua: { color: token("blue"), weight: 2, fillColor: token("blue-soft"), fillOpacity: 0.5 },
    produccion: { color: token("gold-ink"), weight: 2, dashArray: "6 4", fillColor: token("gold"), fillOpacity: 0.35 },
    asentamiento: { color: token("violet"), weight: 3, fillColor: token("violet-soft"), fillOpacity: 0.7 },
    implementacion: { color: token("rose"), weight: 3, fillColor: token("rose-soft"), fillOpacity: 0.6 },
    silvestre: { color: token("deep"), weight: 1.5, dashArray: "2 4", lineCap: "round", fillColor: token("green"), fillOpacity: 0.3 },
    camino: { color: token("surface"), weight: 4, opacity: 0.95, fillOpacity: 0 },
    sector: { color: token("green"), weight: 4, dashArray: "1 7", lineCap: "round", fillOpacity: 0 },
    obra: { color: token("ink"), weight: 1.5, fillColor: token("blue"), fillOpacity: 0.9 },
  };
  const base = porCapa[e.capa];
  // El crecimiento por etapas es un contorno, para que se vea lo que hay debajo.
  if (e.id.startsWith("pc-crecimiento")) return { ...base, weight: 2.5, dashArray: "10 6", fillOpacity: 0.08 };
  // La zona 4 se distingue de la 5 por un relleno más leve y otro trazo.
  if (e.id === "pc-zona-4") return { ...base, dashArray: "8 4", fillOpacity: 0.15 };
  return base;
}

function estiloFinca(estado: EstadoFinca | undefined): PathOptions {
  if (estado === "disponible") return { color: token("blue-soft"), weight: 1, fillColor: token("blue"), fillOpacity: 0.55 };
  if (estado === "reservada")
    return { color: token("clay-ink"), weight: 1.5, dashArray: "3 3", fillColor: token("clay"), fillOpacity: 0.6 };
  return { color: token("muted"), weight: 1.5, dashArray: "1 4", lineCap: "round", fillColor: token("gray"), fillOpacity: 0.6 };
}

export default function MapaLeaflet({ seleccion, alElegir, vista = "barrios" }: Props) {
  const idioma = useIdioma();
  const tx = useTextos("territorio");
  const contenedor = useRef<HTMLDivElement>(null);
  const elegir = useRef(alElegir);
  elegir.current = alElegir;
  // Capas por id, con su estilo base, para resaltar la elegida sin rehacer el mapa.
  const capas = useRef(new Map<string, { capa: Resaltable; base: PathOptions; limites: () => L.LatLngBounds }>());
  const mapaRef = useRef<L.Map | null>(null);
  // Los dos grupos que cambian con la vista; el resto (contexto, Soluna, fincas, macrolote, lugares) queda siempre.
  const grupos = useRef<{ barrios: L.LayerGroup; permacultura: L.LayerGroup } | null>(null);
  const vistaActual = useRef<VistaMapa>(vista);
  vistaActual.current = vista;

  function mostrarVista(v: VistaMapa) {
    const m = mapaRef.current;
    const g = grupos.current;
    if (!m || !g) return;
    const [mostrar, ocultar] = v === "permacultura" ? [g.permacultura, g.barrios] : [g.barrios, g.permacultura];
    if (m.hasLayer(ocultar)) m.removeLayer(ocultar);
    if (!m.hasLayer(mostrar)) m.addLayer(mostrar);
  }
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
      if (m) {
        const esFinca = id?.startsWith("finca-");
        const limites = nueva.limites();
        if (limites.isValid()) m.fitBounds(limites, { padding: [40, 40], maxZoom: esFinca ? 17 : 15 });
      }
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
        grupos.current = null;
        capas.current.clear();
        ultima.current = null;
      };
      // La vista tiene que existir antes de agregar capas.
      mapa.fitBounds(L.latLngBounds(aLatLng(macro.anillo)), { padding: [8, 8] });

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
      }).addTo(mapa);

      const renderer = L.canvas({ padding: 0.5 });
      const registrar = (id: string, capa: L.Polygon | L.GeoJSON, base: PathOptions) => {
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
      const grupoBarrios = L.layerGroup();
      const grupoPermacultura = L.layerGroup();
      grupos.current = { barrios: grupoBarrios, permacultura: grupoPermacultura };

      const comun = terrenoComun();
      const baseComun: PathOptions = { color: token("violet"), weight: 2, fillColor: token("violet-soft"), fillOpacity: 0.6 };
      registrar(comun.id, L.polygon(aLatLng(comun.anillo), { renderer, ...baseComun }).addTo(grupoBarrios), baseComun);

      const barrios = listarBarrios();
      const tribus = listarTribus(idioma);
      for (const b of barrios) {
        const t = tribuDeBarrio(b, tribus);
        const base = estiloBarrio(t?.estado ?? "vacante");
        registrar(b.id, L.polygon(aLatLng(b.anillo), { renderer, ...base }).addTo(grupoBarrios), base);
      }

      // La alternativa de permacultura: de lo más grande a lo más chico, para que lo chico quede arriba y se pueda tocar.
      const elementos = listarElementosPermacultura().sort((a, b) => (b.areaHa ?? 0) - (a.areaHa ?? 0));
      for (const e of elementos) {
        const base = estiloPermacultura(e);
        const capa = L.geoJSON(
          { type: "Feature", properties: {}, geometry: e.geometria } as GeoJSON.Feature,
          {
            style: () => base,
            pointToLayer: (_f, latlng) => L.circleMarker(latlng, { ...base, radius: 6 }),
          },
        ).addTo(grupoPermacultura);
        registrar(e.id, capa, base);
      }

      // Marcadores con foco de teclado: se leen como botones y eligen lo mismo que el clic.
      const marcar = (
        id: string,
        centro: L.LatLngExpression,
        texto: string,
        etiqueta: string,
        clase: string,
        tam: number,
        destino: L.Map | L.LayerGroup = mapa,
      ) => {
        // El texto se arma con textContent: nunca se interpreta como HTML.
        const sello = document.createElement("span");
        sello.className = `mapa-sello ${clase}`;
        sello.textContent = texto;
        const marcador = L.marker(centro, {
          keyboard: true,
          icon: L.divIcon({ className: "mapa-sello-wrap", html: sello, iconSize: [tam, tam], iconAnchor: [tam / 2, tam / 2] }),
        }).addTo(destino);
        // Un marcador dentro de un grupo oculto todavía no tiene elemento: se prepara al agregarse al mapa.
        const preparar = () => {
          const el = marcador.getElement();
          if (!el || el.dataset.preparado) return;
          el.dataset.preparado = "1";
          el.setAttribute("role", "button");
          el.setAttribute("aria-label", etiqueta);
          el.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              elegir.current(id);
            }
          });
        };
        preparar();
        marcador.on("add", preparar);
        marcador.on("click", () => elegir.current(id));
      };

      for (const b of barrios) {
        const t = tribuDeBarrio(b, tribus);
        const estado = t?.estado ?? "vacante";
        const etiqueta =
          estado === "vacante"
            ? tx.marcador.barrioBuscaTribu(b.barrio)
            : tx.marcador.barrioTribu(b.barrio, t?.nombre ?? "", textoDeEstado(estado, idioma));
        const centro = capas.current.get(b.id)!.limites().getCenter();
        marcar(b.id, centro, estado === "vacante" ? "+" : (t?.iniciales ?? ""), etiqueta, `mapa-sello-${estado}`, 40, grupoBarrios);
      }
      marcar(
        comun.id,
        capas.current.get(comun.id)!.limites().getCenter(),
        "C",
        tx.marcador.comun,
        "mapa-sello-comun",
        40,
        grupoBarrios,
      );
      // Sellos de la alternativa: la primera hectárea, el núcleo y los clusters.
      const textoSello = (id: string) => (id === "pc-hectarea-1" ? "1ha" : id === "pc-nucleo" ? "N" : id.replace("pc-cluster-", "C"));
      for (const id of SELLOS_PERMACULTURA) {
        const e = elementos.find((x) => x.id === id);
        if (!e) continue;
        const centro = capas.current.get(id)!.limites().getCenter();
        marcar(id, centro, textoSello(id), tx.permacultura.sello(e.textos[idioma].nombre), `mapa-sello-pc mapa-sello-pc-${e.capa}`, 34, grupoPermacultura);
      }
      for (const l of listarLugares()) {
        marcar(l.id, [l.punto[1], l.punto[0]], "•", tx.marcador.lugar(nombreDeLugar(l.id, l.nombre, idioma)), "mapa-sello-lugar", 24);
      }

      mostrarVista(vistaActual.current);
      resaltar(seleccionActual.current);
    })();

    return () => {
      cancelado = true;
      destruir?.();
    };
    // Si cambia el idioma el mapa se arma de nuevo, para que los nombres accesibles de los marcadores cambien con él.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idioma]);

  useEffect(() => {
    if (mapaRef.current) resaltar(seleccion);
  }, [seleccion]);

  useEffect(() => {
    mostrarVista(vista);
    const m = mapaRef.current;
    // Al cambiar de vista se vuelve a mirar el macrolote entero.
    if (m) m.fitBounds(aLatLng(macrolote7().anillo), { padding: [8, 8] });
  }, [vista]);

  return <div ref={contenedor} className="mapa-leaflet h-[26rem] w-full rounded-xl border border-faint" />;
}
