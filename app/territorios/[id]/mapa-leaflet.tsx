"use client";

import "leaflet/dist/leaflet.css";
import type { Path, PathOptions } from "leaflet";
import { useEffect, useRef } from "react";
import { nombreDeEquipo } from "@/lib/equipos/equipos";
import { listarFrentes } from "@/lib/equipos/frentes";
import { FASE_ACTUAL, type Fase } from "@/lib/territorios/fases";
import {
  listarBarrios,
  listarContexto,
  listarFincas,
  listarLugares,
  macrolote7,
  solunaContorno,
  terrenoComun,
  tribuDeBarrio,
} from "@/lib/territorios/biopueblo";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { nombreDeLugar } from "@/lib/territorios/textos";
import { esDeHoy, frentesEn, numeroDeFrente, type VistaId } from "@/lib/territorios/vistas";
import { listarTribus } from "@/lib/tribus/datos";
import { textoDeEstado } from "@/lib/tribus/tipos";
import { ORDEN_GRUPOS, aLatLng, estiloBarrio, estiloBarrioPlan, estiloFinca, gruposDeVista, token, type Grupo } from "./capas";

type Props = {
  /** Id del elemento elegido (frente, barrio, común, finca o lugar), o null. */
  seleccion: string | null;
  alElegir: (id: string) => void;
  vista: VistaId;
  fase: Fase;
};

export default function MapaLeaflet({ seleccion, alElegir, vista, fase }: Props) {
  const idioma = useIdioma();
  const tx = useTextos("territorio");
  const contenedor = useRef<HTMLDivElement>(null);
  const elegir = useRef(alElegir);
  elegir.current = alElegir;
  // Capas por id, con su estilo base, para resaltar la elegida sin rehacer el mapa.
  const capas = useRef(new Map<string, { capa: Path; base: PathOptions; limites: () => L.LatLngBounds }>());
  // Sellos (marcadores) por id, para resaltar el elegido.
  const sellos = useRef(new Map<string, HTMLElement>());
  const puntos = useRef(new Map<string, [number, number]>());
  const mapaRef = useRef<L.Map | null>(null);
  const aplicarVista = useRef<(() => void) | null>(null);
  const ultima = useRef<string | null>(null);
  const seleccionActual = useRef<string | null>(seleccion);
  seleccionActual.current = seleccion;
  const vistaActual = useRef({ vista, fase });
  vistaActual.current = { vista, fase };

  function resaltar(id: string | null) {
    if (ultima.current) {
      const previa = capas.current.get(ultima.current);
      previa?.capa.setStyle({ ...previa.base, weight: previa.base.weight ?? 1 });
      sellos.current.get(ultima.current)?.classList.remove("mapa-sello-elegido");
    }
    ultima.current = id;
    if (!id) return;
    sellos.current.get(id)?.classList.add("mapa-sello-elegido");
    const nueva = capas.current.get(id);
    const m = mapaRef.current;
    if (nueva) {
      nueva.capa.setStyle({ color: token("ink"), weight: 4, dashArray: undefined, fillOpacity: Math.min(0.85, (nueva.base.fillOpacity ?? 0.4) + 0.3) });
      nueva.capa.bringToFront();
      if (m) m.fitBounds(nueva.limites(), { padding: [40, 40], maxZoom: id.startsWith("finca-") ? 17 : 15 });
    } else if (m && puntos.current.has(id)) {
      // Frente: un punto, no un polígono.
      m.setView(puntos.current.get(id)!, Math.max(m.getZoom(), 15));
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
        aplicarVista.current = null;
        capas.current.clear();
        sellos.current.clear();
        puntos.current.clear();
        ultima.current = null;
      };
      // La vista tiene que existir antes de agregar capas.
      mapa.fitBounds(L.latLngBounds(aLatLng(macro.anillo)), { padding: [8, 8] });

      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
      }).addTo(mapa);

      const renderer = L.canvas({ padding: 0.5 });
      // Un grupo por capa: cambiar de vista los agrega o quita, sin rehacer el mapa (el zoom se mantiene).
      const grupos = Object.fromEntries(ORDEN_GRUPOS.map((g) => [g, L.layerGroup()])) as Record<Grupo, L.LayerGroup>;
      const registrar = (id: string, capa: L.Polygon, base: PathOptions) => {
        capas.current.set(id, { capa, base, limites: () => capa.getBounds() });
        capa.on("click", () => elegir.current(id));
      };

      // Orden: contexto, Soluna y fincas, macrolote, común, barrios, frentes, lugares.
      for (const z of listarContexto()) {
        L.polygon(aLatLng(z.anillo), {
          renderer,
          interactive: false,
          color: token("muted"),
          weight: 1,
          opacity: 0.6,
          fillColor: token("gray"),
          fillOpacity: 0.15,
        }).addTo(grupos.contexto);
      }
      L.polygon(aLatLng(solunaContorno().anillo), {
        renderer,
        interactive: false,
        color: token("blue"),
        weight: 2.5,
        fillOpacity: 0,
      }).addTo(grupos.soluna);
      for (const f of listarFincas()) {
        const base = estiloFinca(f.estado);
        registrar(f.id, L.polygon(aLatLng(f.anillo), { renderer, ...base }).addTo(grupos.soluna), base);
      }
      L.polygon(aLatLng(macro.anillo), {
        renderer,
        interactive: false,
        color: token("on-deep"),
        weight: 3.5,
        fillColor: token("deep"),
        fillOpacity: 0.08,
      }).addTo(grupos.macrolote);
      const comun = terrenoComun();
      const baseComun: PathOptions = { color: token("violet"), weight: 2, fillColor: token("violet-soft"), fillOpacity: 0.6 };
      registrar(comun.id, L.polygon(aLatLng(comun.anillo), { renderer, ...baseComun }).addTo(grupos.comun), baseComun);

      const barrios = listarBarrios();
      const tribus = listarTribus(idioma);
      for (const b of barrios) {
        const t = tribuDeBarrio(b, tribus);
        const base = estiloBarrio(t?.estado ?? "vacante");
        registrar(b.id, L.polygon(aLatLng(b.anillo), { renderer, ...base }).addTo(grupos.barrios), base);
        // Plan: la misma zona en neutro, sin clic ni sello.
        L.polygon(aLatLng(b.anillo), { renderer, ...estiloBarrioPlan() }).addTo(grupos["barrios-plan"]);
      }

      // Marcadores con foco de teclado: se leen como botones y eligen lo mismo que el clic.
      // Los atributos se ponen cada vez que el marcador entra al mapa: al quitar un grupo Leaflet descarta su elemento.
      const marcar = (
        grupo: L.LayerGroup,
        id: string,
        centro: L.LatLngExpression,
        texto: string,
        etiqueta: string,
        clase: string,
        tam: number,
      ) => {
        // El texto se arma con textContent: nunca se interpreta como HTML.
        const sello = document.createElement("span");
        sello.className = `mapa-sello ${clase}`;
        sello.textContent = texto;
        sellos.current.set(id, sello);
        const marcador = L.marker(centro, {
          keyboard: true,
          icon: L.divIcon({ className: "mapa-sello-wrap", html: sello, iconSize: [tam, tam], iconAnchor: [tam / 2, tam / 2] }),
        });
        marcador.on("add", () => {
          const el = marcador.getElement();
          if (!el) return;
          el.setAttribute("role", "button");
          el.setAttribute("aria-label", etiqueta);
          el.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              elegir.current(id);
            }
          });
        });
        marcador.on("click", () => elegir.current(id));
        marcador.addTo(grupo);
      };

      for (const b of barrios) {
        const t = tribuDeBarrio(b, tribus);
        const estado = t?.estado ?? "vacante";
        const etiqueta =
          estado === "vacante"
            ? tx.marcador.barrioBuscaTribu(b.barrio)
            : tx.marcador.barrioTribu(b.barrio, t?.nombre ?? "", textoDeEstado(estado, idioma));
        const centro = capas.current.get(b.id)!.limites().getCenter();
        marcar(grupos["sellos-barrio"], b.id, centro, estado === "vacante" ? "+" : (t?.iniciales ?? ""), etiqueta, `mapa-sello-${estado}`, 40);
      }
      marcar(grupos.comun, comun.id, capas.current.get(comun.id)!.limites().getCenter(), "C", tx.marcador.comun, "mapa-sello-comun", 40);
      for (const l of listarLugares()) {
        marcar(grupos.lugares, l.id, [l.punto[1], l.punto[0]], "•", tx.marcador.lugar(nombreDeLugar(l.id, l.nombre, idioma)), "mapa-sello-lugar", 24);
      }

      // Frentes: se dibujan los vigentes en la fase elegida. Se rearman al cambiar la fase (son pocos).
      const armarFrentes = (faseElegida: Fase) => {
        for (const f of listarFrentes(idioma)) sellos.current.delete(f.id);
        grupos.frentes.clearLayers();
        for (const f of frentesEn(faseElegida, idioma).conLugar) {
          const n = numeroDeFrente(f.id)!;
          const hoy = esDeHoy(f);
          const [lng, lat] = f.lugar!;
          puntos.current.set(f.id, [lat, lng]);
          marcar(
            grupos.frentes,
            f.id,
            [lat, lng],
            String(n),
            tx.marcador.frente(n, f.nombre, nombreDeEquipo(f.circuloId, idioma) ?? f.circuloId, hoy ? null : f.desde),
            `mapa-sello-frente${hoy ? "" : " mapa-sello-frente-despues"}`,
            32,
          );
        }
      };

      // Agrega y quita los grupos según la vista, siempre en el mismo orden de apilado.
      aplicarVista.current = () => {
        const { vista: v, fase: fs } = vistaActual.current;
        armarFrentes(fs);
        const visibles = gruposDeVista(v);
        for (const g of ORDEN_GRUPOS) grupos[g].removeFrom(mapa);
        for (const g of ORDEN_GRUPOS) if (visibles.has(g)) grupos[g].addTo(mapa);
        // Los sellos de frentes recién armados vuelven a marcar el elegido.
        const id = seleccionActual.current;
        if (id) sellos.current.get(id)?.classList.add("mapa-sello-elegido");
      };
      aplicarVista.current();
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
    aplicarVista.current?.();
  }, [vista, fase]);

  useEffect(() => {
    if (mapaRef.current) resaltar(seleccion);
  }, [seleccion]);

  const faseTexto = fase === FASE_ACTUAL ? tx.mapa.faseHoy(fase) : String(fase);

  return (
    <div
      ref={contenedor}
      role="region"
      aria-label={tx.mapa.aria(tx.vistas[vista].corto, faseTexto)}
      className="mapa-leaflet h-[26rem] w-full rounded-xl border border-faint"
    />
  );
}
