import type { IdProyecto } from "./estado-administrativo";

// Rutas que muestran lotes y los proyectos cuyo estado administrativo muestra cada una.
// Cada ruta debe mostrar el componente EstadoAdministrativo de cada uno de sus proyectos
// (lo exige e2e/estado-administrativo.spec.ts). ¿Tu vista muestra lotes? Sumala acá.
export const VISTAS_CON_LOTES: readonly { ruta: string; proyectos: readonly IdProyecto[] }[] = [
  { ruta: "/territorios/lighthouse", proyectos: ["soluna", "lighthouse-norte"] },
  { ruta: "/lotes", proyectos: ["lighthouse-norte"] },
  // La puerta "Comprar un lote" de Sumarte muestra el estado de Norte en forma compacta.
  { ruta: "/sumarte", proyectos: ["lighthouse-norte"] },
  // Una ficha de lote, como muestra de todas (`/lotes/[id]`).
  { ruta: "/lotes/lote-1", proyectos: ["lighthouse-norte"] },
];
