"use client";

import dynamic from "next/dynamic";
import { useTextos } from "@/lib/idioma/cliente";

function Cargando() {
  const t = useTextos("territorio");
  return <p className="p-4 text-sm text-muted">{t.cargandoMapa}</p>;
}

// Leaflet toca `window` al importarse: solo se carga en el navegador.
const MapaLeaflet = dynamic(() => import("./mapa-leaflet"), {
  ssr: false,
  loading: () => <Cargando />,
});

export default MapaLeaflet;
