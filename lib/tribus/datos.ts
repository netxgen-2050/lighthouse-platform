import { textoEn, type BilingueConOriginal, type Idioma } from "@/lib/idioma/tipos";
import type { Tribu, TribuBilingue } from "./tipos";

/** Un texto descriptivo de ejemplo, escrito por la plataforma, con su inglés (pendiente de revisión nativa). */
const b = (es: string, en: string): BilingueConOriginal => ({ es, en });
/** La declaración de la tribu es su voz: se escribió en español y en inglés se muestra como traducida. */
const voz = (es: string, en: string): BilingueConOriginal => ({ es, en, original: "es" });

// Datos de ejemplo copiados de TRIBES en docs/referencia/netx-tribus-mockup-v6.html.
// Los nombres de las tribus y de los barrios son propios: no se traducen.
const TRIBUS: TribuBilingue[] = [
  {
    id: "semilla", territorioId: "lighthouse", plata: { comprometida: 140000, meta: 220000 }, roles: { cubiertos: 8, necesarios: 10 }, avales: 4,
    nombre: "Semilla Viva", iniciales: "SV", barrio: 1, foco: b("Suelo y semillas", "Soil and seeds"), estado: "activa",
    hogares: b("6 hogares · 14 personas", "6 households · 14 people"),
    subtitulo: b("Banco de semillas y huerta intensiva", "Seed bank and intensive vegetable garden"),
    declaracion: voz(
      "Cuidamos el suelo y las semillas criollas para que todo el Lighthouse coma bien.",
      "We look after the soil and the native seeds so that all of the Lighthouse eats well.",
    ),
    tiene: [b("Huerta", "Vegetable garden"), b("Compost", "Compost"), b("Banco de semillas", "Seed bank")],
    busca: [b("Riego", "Irrigation")],
    ritual: b("Una jornada de minga en la huerta y una ronda de palabra.", "A work-party day in the garden and a talking circle."),
    formaJuridica: b("Asociación civil", "Civil association"),
    pozo: [b("200 kg de verdura por mes", "200 kg of vegetables per month"), b("3.000 plantines por temporada", "3,000 seedlings per season")],
  },
  {
    id: "barda", territorioId: "lighthouse", plata: { comprometida: 520000, meta: 600000 }, roles: { cubiertos: 6, necesarios: 8 }, avales: 1,
    nombre: "Barda Productiva", iniciales: "BP", barrio: 2, foco: b("Huerto y fermentación", "Orchard and fermentation"), estado: "formacion",
    hogares: b("4 hogares", "4 households"),
    subtitulo: b("Olivos y vid · proyectos individuales", "Olive trees and vines · individual projects"),
    declaracion: voz(
      "Producimos aceite y vino con manejo regenerativo, y abrimos la bodega a los vecinos.",
      "We produce oil and wine with regenerative farming, and we open the winery to our neighbors.",
    ),
    tiene: [b("Agronomía", "Agronomy"), b("Enología", "Winemaking"), b("Comercialización", "Marketing and sales")],
    busca: [b("Riego", "Irrigation")],
    ritual: b(
      "Entrevista con los socios de la SAS y aporte mínimo de capital.",
      "Interview with the partners of the SAS and a minimum capital contribution.",
    ),
    formaJuridica: b("SAS", "SAS (simplified corporation)"),
    pozo: [b("120 litros de aceite por año", "120 liters of oil per year"), b("Visitas guiadas a la bodega", "Guided visits to the winery")],
  },
  {
    id: "grano", territorioId: "lighthouse", plata: { comprometida: 0, meta: 260000 }, roles: { cubiertos: 0, necesarios: 10 }, avales: 0,
    nombre: "Barrio 3", iniciales: "+", barrio: 3, foco: b("Granos y proteína", "Grains and protein"), estado: "vacante",
    hogares: b("lugar para 6–8 hogares", "room for 6–8 households"),
    tiene: [], busca: [b("Agricultura extensiva", "Extensive farming"), b("Animales", "Livestock"), b("Molienda", "Milling")],
    ritual: b(
      "Convocatoria abierta: la tribu que llegue define su ritual.",
      "Open call: the tribe that arrives defines its own ritual.",
    ),
    formaJuridica: b("A definir", "To be defined"),
  },
  {
    id: "monte", territorioId: "lighthouse", plata: { comprometida: 60000, meta: 300000 }, roles: { cubiertos: 4, necesarios: 9 }, avales: 2,
    nombre: "Monte Nuevo", iniciales: "MN", barrio: 4, foco: b("Bosque y materiales", "Forest and materials"), estado: "formacion",
    hogares: b("3 hogares", "3 households"),
    subtitulo: b("Forestación, madera y bioconstrucción", "Forestry, timber and natural building"),
    declaracion: voz(
      "Plantamos el bosque que va a dar la madera y la paja de las casas del Lighthouse.",
      "We are planting the forest that will provide the timber and straw for the Lighthouse homes.",
    ),
    tiene: [b("Forestación", "Forestry"), b("Carpintería", "Carpentry")],
    busca: [b("Bioconstrucción", "Natural building"), b("Maquinaria", "Machinery")],
    ritual: b("Plantar un árbol con la tribu y pasar tres días en obra.", "Plant a tree with the tribe and spend three days on the building site."),
    formaJuridica: b("SAS de propósito", "Purpose-driven SAS"),
    pozo: [b("Madera para 2 domos por año", "Timber for 2 domes per year"), b("Talleres de bioconstrucción", "Natural building workshops")],
  },
  {
    id: "agua", territorioId: "lighthouse", plata: { comprometida: 40000, meta: 180000 }, roles: { cubiertos: 3, necesarios: 7 }, avales: 3,
    nombre: "Agua Clara", iniciales: "AC", barrio: 5, foco: b("Agua", "Water"), estado: "formacion",
    hogares: b("2 hogares + equipo técnico", "2 households + technical team"),
    subtitulo: b("El servicio de agua de todo el Lighthouse", "The water service for the whole Lighthouse"),
    declaracion: voz(
      "Diseñamos y cuidamos el agua común: toma, cisterna, riego y tratamiento.",
      "We design and look after the shared water: intake, cistern, irrigation and treatment.",
    ),
    tiene: [b("Hidráulica", "Hydraulics")],
    busca: [b("Plomería", "Plumbing"), b("Tratamiento de aguas", "Water treatment")],
    ritual: b("Una visita técnica al río y una entrevista con el equipo.", "A technical visit to the river and an interview with the team."),
    formaJuridica: b("Cooperativa", "Cooperative"),
    pozo: [b("Servicio de agua a los 12 barrios", "Water service for all 12 neighborhoods")],
  },
  {
    id: "valle", territorioId: "lighthouse", plata: { comprometida: 310000, meta: 480000 }, roles: { cubiertos: 9, necesarios: 14 }, avales: 5,
    nombre: "Valle Solar", iniciales: "VS", barrio: 6, foco: b("Energía y circularidad", "Energy and circularity"), estado: "activa",
    hogares: b("7 hogares · 18 personas", "7 households · 18 people"),
    subtitulo: b("Familias · solarpunk · consentimiento", "Families · solarpunk · consent"),
    declaracion: voz(
      "Familias que quieren criar en comunidad, con energía y agua propias.",
      "Families who want to raise their children in community, with their own energy and water.",
    ),
    tiene: [b("Huerta", "Vegetable garden"), b("Carpintería", "Carpentry"), b("Crianza compartida", "Shared parenting")],
    busca: [b("Energía solar", "Solar energy"), b("Bioconstrucción", "Natural building"), b("Eventos y comunidad", "Events and community")],
    ritual: b(
      "Dos llamadas, un fin de semana de convivencia y el consentimiento del grupo.",
      "Two calls, a weekend living together and the consent of the group.",
    ),
    formaJuridica: b("Asociación civil", "Civil association"),
    pozo: [
      b("Energía solar para el núcleo común", "Solar energy for the common core"),
      b("30 noches de hospedaje por año", "30 nights of lodging per year"),
    ],
  },
  {
    id: "taller", territorioId: "lighthouse", plata: { comprometida: 90000, meta: 150000 }, roles: { cubiertos: 7, necesarios: 9 }, avales: 3,
    nombre: "Taller Común", iniciales: "TC", barrio: 7, foco: b("Oficios y reparación", "Trades and repair"), estado: "activa",
    hogares: b("5 hogares", "5 households"),
    subtitulo: b("Herrería, carpintería y reparación", "Blacksmithing, carpentry and repair"),
    declaracion: voz(
      "Arreglamos, fabricamos y enseñamos. Nada se tira si se puede reparar.",
      "We fix, make and teach. Nothing gets thrown away if it can be repaired.",
    ),
    tiene: [b("Herrería", "Blacksmithing"), b("Carpintería", "Carpentry"), b("Electrónica", "Electronics")],
    busca: [b("Textil", "Textiles")],
    ritual: b("Traer algo para reparar y arreglarlo con la tribu.", "Bring something to repair and fix it together with the tribe."),
    formaJuridica: b("Asociación civil", "Civil association"),
    pozo: [b("40 horas de taller por mes", "40 workshop hours per month")],
  },
  {
    id: "cuidado", territorioId: "lighthouse", plata: { comprometida: 0, meta: 200000 }, roles: { cubiertos: 0, necesarios: 9 }, avales: 0,
    nombre: "Barrio 8", iniciales: "+", barrio: 8, foco: b("Cuidado", "Care"), estado: "vacante",
    hogares: b("lugar para 6 hogares", "room for 6 households"),
    tiene: [], busca: [b("Salud", "Health"), b("Crianza", "Parenting"), b("Acompañamiento de mayores", "Support for older adults")],
    ritual: b(
      "Convocatoria abierta: la tribu que llegue define su ritual.",
      "Open call: the tribe that arrives defines its own ritual.",
    ),
    formaJuridica: b("A definir", "To be defined"),
  },
  {
    id: "escuela", territorioId: "lighthouse", plata: { comprometida: 0, meta: 240000 }, roles: { cubiertos: 0, necesarios: 10 }, avales: 0,
    nombre: "Barrio 9", iniciales: "+", barrio: 9, foco: b("Aprendizaje", "Learning"), estado: "vacante",
    hogares: b("lugar para 6 hogares", "room for 6 households"),
    tiene: [], busca: [b("Docencia", "Teaching"), b("Permacultura", "Permaculture"), b("Pedagogía Waldorf", "Waldorf education")],
    ritual: b(
      "Convocatoria abierta: la tribu que llegue define su ritual.",
      "Open call: the tribe that arrives defines its own ritual.",
    ),
    formaJuridica: b("A definir", "To be defined"),
  },
  {
    id: "avelan", territorioId: "lighthouse", plata: { comprometida: 140000, meta: 650000 }, roles: { cubiertos: 5, necesarios: 12 }, avales: 2,
    nombre: "Fundación Avelan Kerum", iniciales: "AK", barrio: 10, foco: b("Cultura y vida interior", "Culture and inner life"), estado: "formacion",
    hogares: b("Núcleo en formación", "Core group forming"),
    subtitulo: b(
      "Ciudad consciente · comunidad online de más de 200 personas",
      "Conscious city · online community of more than 200 people",
    ),
    declaracion: voz(
      "Una comunidad que se organiza en áreas con representantes elegidos entre pares.",
      "A community organized in areas, with representatives chosen among peers.",
    ),
    areas: [
      b("Nutrición", "Nutrition"),
      b("Educación", "Education"),
      b("Sanación", "Healing"),
      b("Energía", "Energy"),
      b("Intercambio", "Exchange"),
      b("Acuerdos", "Agreements"),
      b("Cuidado", "Care"),
      b("Comunicación", "Communication"),
      b("Tecnología", "Technology"),
      b("Encuentros", "Gatherings"),
    ],
    areasAbiertas: [b("Nutrición", "Nutrition"), b("Energía", "Energy"), b("Encuentros", "Gatherings")],
    tiene: [b("Arquitectura", "Architecture"), b("Derecho", "Law"), b("Sanación", "Healing")],
    busca: [b("Producción de alimentos", "Food production")],
    ritual: b(
      "Convocatoria por áreas: convivencia virtual y elección del representante entre pares.",
      "Call by area: virtual coexistence and election of the representative among peers.",
    ),
    formaJuridica: b("Fundación", "Foundation"),
    pozo: [b("Retiros y encuentros abiertos", "Retreats and open gatherings")],
  },
  {
    id: "puerto", territorioId: "lighthouse", plata: { comprometida: 260000, meta: 400000 }, roles: { cubiertos: 7, necesarios: 11 }, avales: 4,
    nombre: "Puerto Trueque", iniciales: "PT", barrio: 11, foco: b("Intercambio y hospitalidad", "Exchange and hospitality"), estado: "formacion",
    hogares: b("5 hogares", "5 households"),
    subtitulo: b("Hospedaje, mercado y eventos", "Lodging, market and events"),
    declaracion: voz(
      "La puerta de entrada del Lighthouse: hospedaje, mercado de los barrios y eventos.",
      "The front door of the Lighthouse: lodging, the neighborhoods' market and events.",
    ),
    tiene: [b("Hospitalidad", "Hospitality"), b("Cocina", "Cooking"), b("Eventos", "Events")],
    busca: [b("Marketing", "Marketing")],
    ritual: b("Trabajar un evento con la tribu.", "Work an event together with the tribe."),
    formaJuridica: b("SAS de propósito", "Purpose-driven SAS"),
    pozo: [b("Noches para el Pase de estadías", "Nights for the stay pass"), b("Mercado mensual", "Monthly market")],
  },
  {
    id: "guardia", territorioId: "lighthouse", plata: { comprometida: 0, meta: 120000 }, roles: { cubiertos: 0, necesarios: 6 }, avales: 0,
    nombre: "Barrio 12", iniciales: "+", barrio: 12, foco: b("Ecología y biorregión", "Ecology and bioregion"), estado: "vacante",
    hogares: b("lugar para 4 hogares", "room for 4 households"),
    tiene: [], busca: [b("Biología", "Biology"), b("Monitoreo", "Monitoring"), b("Guardaparques", "Park rangers")],
    ritual: b(
      "Convocatoria abierta: la tribu que llegue define su ritual.",
      "Open call: the tribe that arrives defines its own ritual.",
    ),
    formaJuridica: b("A definir", "To be defined"),
  },
];

/**
 * Destino del botón "Proponer una comunidad" de un barrio vacante.
 * Lleva al formulario de postulación de ese barrio.
 */
export function rutaProponerComunidad(id: string): string {
  return `/tribus/${id}/postular`;
}

/** Etapa de ejemplo de las tribus en formación (dato de prototipo). */
const ETAPAS: Record<string, BilingueConOriginal> = {
  barda: b("Reuniendo socios", "Gathering partners"),
  monte: b("Armando su propuesta", "Putting together its proposal"),
  agua: b("Armando su propuesta", "Putting together its proposal"),
  avelan: b("Eligiendo representantes", "Choosing representatives"),
  puerto: b("Sumando hogares", "Adding households"),
};

function conEtapa(t: TribuBilingue): TribuBilingue {
  return t.estado === "formacion" && Object.hasOwn(ETAPAS, t.id) ? { ...t, etapa: ETAPAS[t.id] } : t;
}

function lista(l: readonly BilingueConOriginal[] | undefined, idioma: Idioma): string[] | undefined {
  return l?.map((x) => textoEn(x, idioma));
}

/** La tribu con todos sus campos descriptivos en un idioma. En español queda idéntica a como era antes. */
export function resolverTribu(t: TribuBilingue, idioma: Idioma): Tribu {
  return {
    ...t,
    foco: textoEn(t.foco, idioma),
    hogares: textoEn(t.hogares, idioma),
    subtitulo: t.subtitulo && textoEn(t.subtitulo, idioma),
    declaracion: t.declaracion && textoEn(t.declaracion, idioma),
    tiene: lista(t.tiene, idioma) ?? [],
    busca: lista(t.busca, idioma) ?? [],
    areas: lista(t.areas, idioma),
    areasAbiertas: lista(t.areasAbiertas, idioma),
    ritual: textoEn(t.ritual, idioma),
    formaJuridica: textoEn(t.formaJuridica, idioma),
    pozo: lista(t.pozo, idioma),
    etapa: t.etapa && textoEn(t.etapa, idioma),
  };
}

/** Las tribus con sus textos en los dos idiomas (para mostrar la nota de traducción y para los tests). */
export function listarTribusBilingues(): TribuBilingue[] {
  return TRIBUS.map(conEtapa).sort((a, c) => a.barrio - c.barrio);
}

export function buscarTribuBilingue(id: string): TribuBilingue | undefined {
  const t = TRIBUS.find((x) => x.id === id);
  return t && conEtapa(t);
}

export function listarTribus(idioma: Idioma = "es"): Tribu[] {
  return listarTribusBilingues().map((t) => resolverTribu(t, idioma));
}

export function buscarTribu(id: string, idioma: Idioma = "es"): Tribu | undefined {
  const t = buscarTribuBilingue(id);
  return t && resolverTribu(t, idioma);
}

export type TribusAgrupadas = { activas: Tribu[]; formacion: Tribu[]; vacantes: Tribu[] };

/** Agrupa por estado, cada grupo en orden de barrio. */
export function agruparPorEstado(tribus: Tribu[] = listarTribus()): TribusAgrupadas {
  const ordenadas = [...tribus].sort((a, b) => a.barrio - b.barrio);
  return {
    activas: ordenadas.filter((t) => t.estado === "activa"),
    formacion: ordenadas.filter((t) => t.estado === "formacion"),
    vacantes: ordenadas.filter((t) => t.estado === "vacante"),
  };
}
