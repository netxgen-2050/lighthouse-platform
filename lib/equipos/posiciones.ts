// Posiciones abiertas de cada equipo (círculo del común). Todas son EJEMPLOS a definir (spec participa-mapa-equipos):
// no son ofertas de empleo, no prometen pago, sueldo ni prioridad, y no hay postulación real a una posición.
// Los ids de los equipos son los de `CIRCULOS_DEL_COMUN` (con prefijo `comun-`).
import { textoEn, type BilingueConOriginal, type Idioma } from "@/lib/idioma/tipos";

/** Cómo se acuerda la participación: nunca es un sueldo. */
export type Modalidad = "pacto" | "voluntariado" | "a-definir";

export type Posicion = {
  id: string;
  titulo: BilingueConOriginal;
  /** Tiempo estimado, por ejemplo "4–6 h por semana". */
  dedicacion: BilingueConOriginal;
  /** Qué buscamos: de 2 a 3 puntos. */
  busca: BilingueConOriginal[];
  modalidad: Modalidad;
};

const b = (es: string, en: string): BilingueConOriginal => ({ es, en });

const p = (
  id: string,
  titulo: BilingueConOriginal,
  dedicacion: BilingueConOriginal,
  modalidad: Modalidad,
  ...busca: BilingueConOriginal[]
): Posicion => ({ id, titulo, dedicacion, busca, modalidad });

export const POSICIONES: Record<string, Posicion[]> = {
  "comun-permacultura": [
    p(
      "vivero-nativas",
      b("Vivero de nativas (jarilla, alpataco, chañar)", "Native plant nursery (jarilla, alpataco, chañar)"),
      b("4–6 h por semana", "4–6 h per week"),
      "voluntariado",
      b("Gusto por trabajar con las manos y con semillas", "A taste for working with your hands and with seeds"),
      b("Ganas de aprender de quien conoce la estepa", "Willingness to learn from people who know the steppe"),
    ),
    p(
      "agroforesteria-curvas",
      b("Diseño de agroforestería en curvas de nivel", "Agroforestry design along contour lines"),
      b("6–8 h por semana", "6–8 h per week"),
      "pacto",
      b("Experiencia en diseño de permacultura o agroforestería", "Experience in permaculture or agroforestry design"),
      b("Lectura de curvas de nivel y de suelos", "Reading contour lines and soils"),
      b("Disposición para trabajar en el terreno", "Willingness to work on site"),
    ),
    p(
      "suelo-compost",
      b("Suelo y compost del común", "Soil and compost of the commons"),
      b("3–4 h por semana", "3–4 h per week"),
      "a-definir",
      b("Interés en el suelo vivo y el compostaje", "Interest in living soil and composting"),
      b("Constancia: el compost pide visitas regulares", "Steadiness: compost needs regular visits"),
    ),
  ],
  "comun-agua": [
    p(
      "diques-medias-lunas",
      b("Diseño de diques y medias lunas", "Design of check dams and half-moon basins"),
      b("6–8 h por semana", "6–8 h per week"),
      "pacto",
      b("Hidrología, ingeniería civil o conservación de suelos", "Hydrology, civil engineering or soil conservation"),
      b("Experiencia con obras de piedra o de contención", "Experience with stone or retention works"),
      b("Disposición para trabajar en el cañadón", "Willingness to work in the canyon"),
    ),
    p(
      "monitoreo-napa",
      b("Monitoreo de napa y caudales", "Water table and flow monitoring"),
      b("3–5 h por semana", "3–5 h per week"),
      "voluntariado",
      b("Rigor para tomar y anotar mediciones", "Rigor in taking and recording measurements"),
      b("Cuaderno de campo o planilla al día", "A field notebook or spreadsheet kept up to date"),
    ),
    p(
      "cisternas",
      b("Cuidado de las cisternas compartidas", "Care of the shared cisterns"),
      b("2–3 h por semana", "2–3 h per week"),
      "a-definir",
      b("Manos para el mantenimiento y la limpieza", "Hands for maintenance and cleaning"),
      b("Buen trato para coordinar con los vecinos", "Good manners to coordinate with neighbors"),
    ),
  ],
  "comun-legal": [
    p(
      "estatuto",
      b("Estatuto del común (con estudio externo)", "Bylaws of the commons (with an outside firm)"),
      b("4–6 h por semana", "4–6 h per week"),
      "pacto",
      b("Formación en derecho societario o de asociaciones", "Training in corporate or association law"),
      b("Escritura clara, pensada para que cualquiera la entienda", "Clear writing that anyone can understand"),
    ),
    p(
      "contratos-pactos",
      b("Contratos de pactos", "Pact contracts"),
      b("3–5 h por semana", "3–5 h per week"),
      "a-definir",
      b("Redacción de contratos sencillos", "Drafting simple contracts"),
      b("Ganas de traducir lo legal a palabras simples", "Willingness to turn legal language into plain words"),
    ),
  ],
  "comun-token": [
    p(
      "diseno-semillas",
      b("Diseño del juego de las Semillas", "Design of the Seeds game"),
      b("4–6 h por semana", "4–6 h per week"),
      "voluntariado",
      b("Gusto por los sistemas y las reglas de juego", "A taste for systems and game rules"),
      b("Cuidado de que nada prometa lo que no puede cumplir", "Care that nothing promises what it cannot deliver"),
    ),
    p(
      "banco-semillas",
      b("Banco de semillas del vivero", "Seed bank of the nursery"),
      b("2–4 h por semana", "2–4 h per week"),
      "a-definir",
      b("Orden para catalogar y guardar semillas", "Tidiness for cataloguing and storing seeds"),
      b("Curiosidad por las especies del lugar", "Curiosity about local species"),
    ),
    p(
      "simulaciones",
      b("Simulaciones y modelos de ejemplo", "Sample simulations and models"),
      b("4–6 h por semana", "4–6 h per week"),
      "pacto",
      b("Planillas o Python para modelar", "Spreadsheets or Python for modelling"),
      b("Explicar los números con honestidad: son de ejemplo", "Explaining the numbers honestly: they are samples"),
    ),
  ],
  "comun-marketing": [
    p(
      "relato-fotografia",
      b("Relato y fotografía del territorio", "Storytelling and photography of the territory"),
      b("4–6 h por semana", "4–6 h per week"),
      "voluntariado",
      b("Mirada propia para fotografiar o escribir", "Your own eye for photography or writing"),
      b("Respeto por las personas y por el lugar", "Respect for the people and the place"),
    ),
    p(
      "bienvenida",
      b("Bienvenida a quien llega", "Welcoming newcomers"),
      b("2–4 h por semana", "2–4 h per week"),
      "voluntariado",
      b("Escucha y paciencia", "Listening and patience"),
      b("Respuestas claras y amables", "Clear, kind answers"),
    ),
    p(
      "eventos-comunidad",
      b("Encuentros y eventos de comunidad", "Community gatherings and events"),
      b("5–7 h por semana", "5–7 h per week"),
      "a-definir",
      b("Organización de encuentros chicos y medianos", "Organizing small and medium gatherings"),
      b("Ganas de armar equipo con otras personas", "Willingness to build a team with others"),
    ),
  ],
  "comun-cuidado": [
    p(
      "mediacion",
      b("Mediación cuando un conflicto crece", "Mediation when a conflict grows"),
      b("3–5 h por semana", "3–5 h per week"),
      "pacto",
      b("Formación o experiencia en mediación", "Training or experience in mediation"),
      b("Confidencialidad y buen oído", "Confidentiality and a good ear"),
    ),
    p(
      "acuerdos-convivencia",
      b("Acuerdos de convivencia", "Coexistence agreements"),
      b("3–4 h por semana", "3–4 h per week"),
      "voluntariado",
      b("Facilitar charlas entre vecinos", "Facilitating conversations between neighbors"),
      b("Escribir acuerdos que se puedan cumplir", "Writing agreements that can be kept"),
    ),
  ],
  "comun-plataforma": [
    p(
      "desarrollo-plataforma",
      b("Desarrollo de la plataforma", "Platform development"),
      b("6–10 h por semana", "6–10 h per week"),
      "pacto",
      b("TypeScript, React y Next.js", "TypeScript, React and Next.js"),
      b("Cuidado por la accesibilidad", "Care for accessibility"),
      b("Trabajar con revisión de pares", "Working with peer review"),
    ),
    p(
      "privacidad-datos",
      b("Privacidad y datos", "Privacy and data"),
      b("3–5 h por semana", "3–5 h per week"),
      "a-definir",
      b("Criterio sobre qué datos conviene guardar y cuáles no", "Judgment on which data to keep and which not to"),
      b("Lectura de políticas de privacidad", "Reading privacy policies"),
    ),
    p(
      "granja-solar",
      b("Monitoreo de la granja solar", "Solar farm monitoring"),
      b("2–3 h por semana", "2–3 h per week"),
      "voluntariado",
      b("Nociones de electricidad o electrónica", "Basics of electricity or electronics"),
      b("Registro simple de lo que produce", "Simple records of what it produces"),
    ),
  ],
  "comun-contratistas": [
    p(
      "convocatorias",
      b("Convocatorias y pliegos de obra", "Calls for tender and work specifications"),
      b("4–6 h por semana", "4–6 h per week"),
      "pacto",
      b("Experiencia en obras o compras", "Experience in construction or procurement"),
      b("Poner los principios del común en cada pliego", "Putting the principles of the commons into each specification"),
    ),
    p(
      "seguimiento-entregas",
      b("Seguimiento de entregas", "Delivery follow-up"),
      b("3–5 h por semana", "3–5 h per week"),
      "a-definir",
      b("Orden y puntualidad para visitar la obra", "Order and punctuality to visit the works"),
      b("Registro claro con fotos y fechas", "Clear records with photos and dates"),
    ),
    p(
      "compost-galpon",
      b("Galpón, herramientas y compost", "Shed, tools and compost"),
      b("2–4 h por semana", "2–4 h per week"),
      "voluntariado",
      b("Manos para ordenar y reparar", "Hands to tidy up and repair"),
      b("Ganas de cuidar lo que es de todos", "Willingness to look after what belongs to everyone"),
    ),
  ],
  "comun-gobernanza": [
    p(
      "facilitacion-rondas",
      b("Facilitación de rondas", "Facilitating rounds"),
      b("3–5 h por semana", "3–5 h per week"),
      "voluntariado",
      b("Facilitar grupos sin imponer una salida", "Facilitating groups without imposing an outcome"),
      b("Cuidar los tiempos y que todas las voces se oigan", "Keeping time and making sure every voice is heard"),
    ),
    p(
      "cuidado-manifiesto",
      b("Cuidado del manifiesto", "Care of the manifesto"),
      b("2–4 h por semana", "2–4 h per week"),
      "a-definir",
      b("Lectura atenta y escritura clara", "Careful reading and clear writing"),
      b("Registrar cada cambio y su porqué", "Recording each change and the reason for it"),
    ),
    p(
      "proceso-propuestas",
      b("Proceso de propuestas del Fogón", "The Fogón proposals process"),
      b("3–4 h por semana", "3–4 h per week"),
      "pacto",
      b("Experiencia en toma de decisiones colectivas", "Experience in collective decision-making"),
      b("Paciencia para que cada propuesta madure a su tiempo", "Patience to let each proposal mature in its own time"),
    ),
  ],
};

/** El id corto de un equipo (el de `?equipo=`): el del círculo sin el prefijo `comun-`. */
export function idCortoDeEquipo(circuloId: string): string {
  return circuloId.replace(/^comun-/, "");
}

/** El id del círculo para un id corto de la URL (no verifica que exista). */
export function circuloDeIdCorto(corto: string): string {
  return `comun-${corto}`;
}

export type PosicionEnIdioma = {
  id: string;
  titulo: string;
  dedicacion: string;
  busca: string[];
  modalidad: Modalidad;
};

/** Las posiciones abiertas de un equipo en el idioma pedido ([] si el id no es de un equipo). */
export function posicionesDe(circuloId: string, idioma: Idioma): PosicionEnIdioma[] {
  return (Object.hasOwn(POSICIONES, circuloId) ? POSICIONES[circuloId] : []).map((x) => ({
    id: x.id,
    titulo: textoEn(x.titulo, idioma),
    dedicacion: textoEn(x.dedicacion, idioma),
    busca: x.busca.map((s) => textoEn(s, idioma)),
    modalidad: x.modalidad,
  }));
}
