// Textos de ejemplo del terreno común y de los lugares de interés (no vienen del GeoJSON).
export const TEXTO_COMUN = {
  para: "Agua, energía, vivero y los espacios que usan todas las tribus (ejemplo).",
  cuida: "El Guardián del Lighthouse, con la participación de todas las tribus (ejemplo).",
};

const LUGARES: Record<string, string> = {
  "lugar-olivos": "Olivar existente de la zona, parte del paisaje productivo (ejemplo).",
  "lugar-temazcal": "Espacio de encuentro y ceremonia (ejemplo).",
  "lugar-restaurant-coliving-cowork-sala-de-practicas-banos":
    "Servicios compartidos: restaurante, coliving, cowork, sala de prácticas y baños (ejemplo).",
  "lugar-gaia-sapiens-institute": "Instituto de formación y aprendizaje del territorio (ejemplo).",
  "lugar-nave-tierra-piramidal": "Construcción singular de tierra con forma piramidal (ejemplo).",
};

// Nombres legibles (el JSON fuente los trae sin mayúsculas ni tildes).
const NOMBRES: Record<string, string> = {
  "lugar-temazcal": "Temazcal",
  "lugar-restaurant-coliving-cowork-sala-de-practicas-banos": "Restaurante, coliving, cowork, sala de prácticas y baños",
};

/** Nombre para mostrar; si no hay mapeo, el del dato. */
export function nombreDeLugar(id: string, nombre: string): string {
  return Object.hasOwn(NOMBRES, id) ? NOMBRES[id] : nombre;
}

/** Una línea de descripción; si falta, "sin dato". */
export function descripcionDeLugar(id: string): string {
  return Object.hasOwn(LUGARES, id) ? LUGARES[id] : "sin dato";
}
