"use client";

import dynamic from "next/dynamic";

// Leaflet toca `window` al importarse: solo se carga en el navegador.
const MapaLeaflet = dynamic(() => import("./mapa-leaflet"), {
  ssr: false,
  loading: () => <p className="p-4 text-sm text-muted">Cargando mapa…</p>,
});

export default MapaLeaflet;
