import type { Tribu } from "./tipos";

// Datos de ejemplo copiados de TRIBES en docs/referencia/netx-tribus-mockup-v6.html.
const TRIBUS: Tribu[] = [
  {
    id: "semilla", territorioId: "lighthouse", plata: { comprometida: 140000, meta: 220000 }, roles: { cubiertos: 8, necesarios: 10 }, avales: 4,
nombre: "Semilla Viva", iniciales: "SV", barrio: 1, foco: "Suelo y semillas", estado: "activa",
    hogares: "6 hogares · 14 personas", subtitulo: "Banco de semillas y huerta intensiva",
    declaracion: "Cuidamos el suelo y las semillas criollas para que todo el Lighthouse coma bien.",
    tiene: ["Huerta", "Compost", "Banco de semillas"], busca: ["Riego"],
    ritual: "Una jornada de minga en la huerta y una ronda de palabra.", formaJuridica: "Asociación civil",
    pozo: ["200 kg de verdura por mes", "3.000 plantines por temporada"],
  },
  {
    id: "barda", territorioId: "lighthouse", plata: { comprometida: 520000, meta: 600000 }, roles: { cubiertos: 6, necesarios: 8 }, avales: 1,
nombre: "Barda Productiva", iniciales: "BP", barrio: 2, foco: "Huerto y fermentación", estado: "formacion",
    hogares: "4 hogares", subtitulo: "Olivos y vid · proyectos individuales",
    declaracion: "Producimos aceite y vino con manejo regenerativo, y abrimos la bodega a los vecinos.",
    tiene: ["Agronomía", "Enología", "Comercialización"], busca: ["Riego"],
    ritual: "Entrevista con los socios de la SAS y aporte mínimo de capital.", formaJuridica: "SAS",
    pozo: ["120 litros de aceite por año", "Visitas guiadas a la bodega"],
  },
  {
    id: "grano", territorioId: "lighthouse", plata: { comprometida: 0, meta: 260000 }, roles: { cubiertos: 0, necesarios: 10 }, avales: 0,
nombre: "Barrio 3", iniciales: "+", barrio: 3, foco: "Granos y proteína", estado: "vacante",
    hogares: "lugar para 6–8 hogares",
    tiene: [], busca: ["Agricultura extensiva", "Animales", "Molienda"],
    ritual: "Convocatoria abierta: la tribu que llegue define su ritual.", formaJuridica: "A definir",
  },
  {
    id: "monte", territorioId: "lighthouse", plata: { comprometida: 60000, meta: 300000 }, roles: { cubiertos: 4, necesarios: 9 }, avales: 2,
nombre: "Monte Nuevo", iniciales: "MN", barrio: 4, foco: "Bosque y materiales", estado: "formacion",
    hogares: "3 hogares", subtitulo: "Forestación, madera y bioconstrucción",
    declaracion: "Plantamos el bosque que va a dar la madera y la paja de las casas del Lighthouse.",
    tiene: ["Forestación", "Carpintería"], busca: ["Bioconstrucción", "Maquinaria"],
    ritual: "Plantar un árbol con la tribu y pasar tres días en obra.", formaJuridica: "SAS de propósito",
    pozo: ["Madera para 2 domos por año", "Talleres de bioconstrucción"],
  },
  {
    id: "agua", territorioId: "lighthouse", plata: { comprometida: 40000, meta: 180000 }, roles: { cubiertos: 3, necesarios: 7 }, avales: 3,
nombre: "Agua Clara", iniciales: "AC", barrio: 5, foco: "Agua", estado: "formacion",
    hogares: "2 hogares + equipo técnico", subtitulo: "El servicio de agua de todo el Lighthouse",
    declaracion: "Diseñamos y cuidamos el agua común: toma, cisterna, riego y tratamiento.",
    tiene: ["Hidráulica"], busca: ["Plomería", "Tratamiento de aguas"],
    ritual: "Una visita técnica al río y una entrevista con el equipo.", formaJuridica: "Cooperativa",
    pozo: ["Servicio de agua a los 12 barrios"],
  },
  {
    id: "valle", territorioId: "lighthouse", plata: { comprometida: 310000, meta: 480000 }, roles: { cubiertos: 9, necesarios: 14 }, avales: 5,
nombre: "Valle Solar", iniciales: "VS", barrio: 6, foco: "Energía y circularidad", estado: "activa",
    hogares: "7 hogares · 18 personas", subtitulo: "Familias · solarpunk · consentimiento",
    declaracion: "Familias que quieren criar en comunidad, con energía y agua propias.",
    tiene: ["Huerta", "Carpintería", "Crianza compartida"], busca: ["Energía solar", "Bioconstrucción", "Eventos y comunidad"],
    ritual: "Dos llamadas, un fin de semana de convivencia y el consentimiento del grupo.", formaJuridica: "Asociación civil",
    pozo: ["Energía solar para el núcleo común", "30 noches de hospedaje por año"],
  },
  {
    id: "taller", territorioId: "lighthouse", plata: { comprometida: 90000, meta: 150000 }, roles: { cubiertos: 7, necesarios: 9 }, avales: 3,
nombre: "Taller Común", iniciales: "TC", barrio: 7, foco: "Oficios y reparación", estado: "activa",
    hogares: "5 hogares", subtitulo: "Herrería, carpintería y reparación",
    declaracion: "Arreglamos, fabricamos y enseñamos. Nada se tira si se puede reparar.",
    tiene: ["Herrería", "Carpintería", "Electrónica"], busca: ["Textil"],
    ritual: "Traer algo para reparar y arreglarlo con la tribu.", formaJuridica: "Asociación civil",
    pozo: ["40 horas de taller por mes"],
  },
  {
    id: "cuidado", territorioId: "lighthouse", plata: { comprometida: 0, meta: 200000 }, roles: { cubiertos: 0, necesarios: 9 }, avales: 0,
nombre: "Barrio 8", iniciales: "+", barrio: 8, foco: "Cuidado", estado: "vacante",
    hogares: "lugar para 6 hogares",
    tiene: [], busca: ["Salud", "Crianza", "Acompañamiento de mayores"],
    ritual: "Convocatoria abierta: la tribu que llegue define su ritual.", formaJuridica: "A definir",
  },
  {
    id: "escuela", territorioId: "lighthouse", plata: { comprometida: 0, meta: 240000 }, roles: { cubiertos: 0, necesarios: 10 }, avales: 0,
nombre: "Barrio 9", iniciales: "+", barrio: 9, foco: "Aprendizaje", estado: "vacante",
    hogares: "lugar para 6 hogares",
    tiene: [], busca: ["Docencia", "Permacultura", "Pedagogía Waldorf"],
    ritual: "Convocatoria abierta: la tribu que llegue define su ritual.", formaJuridica: "A definir",
  },
  {
    id: "avelan", territorioId: "lighthouse", plata: { comprometida: 140000, meta: 650000 }, roles: { cubiertos: 5, necesarios: 12 }, avales: 2,
nombre: "Fundación Avelan Kerum", iniciales: "AK", barrio: 10, foco: "Cultura y vida interior", estado: "formacion",
    hogares: "Núcleo en formación", subtitulo: "Ciudad consciente · comunidad online de más de 200 personas",
    declaracion: "Una comunidad que se organiza en áreas con representantes elegidos entre pares.",
    areas: ["Nutrición", "Educación", "Sanación", "Energía", "Intercambio", "Acuerdos", "Cuidado", "Comunicación", "Tecnología", "Encuentros"],
    areasAbiertas: ["Nutrición", "Energía", "Encuentros"],
    tiene: ["Arquitectura", "Derecho", "Sanación"], busca: ["Producción de alimentos"],
    ritual: "Convocatoria por áreas: convivencia virtual y elección del representante entre pares.", formaJuridica: "Fundación",
    pozo: ["Retiros y encuentros abiertos"],
  },
  {
    id: "puerto", territorioId: "lighthouse", plata: { comprometida: 260000, meta: 400000 }, roles: { cubiertos: 7, necesarios: 11 }, avales: 4,
nombre: "Puerto Trueque", iniciales: "PT", barrio: 11, foco: "Intercambio y hospitalidad", estado: "formacion",
    hogares: "5 hogares", subtitulo: "Hospedaje, mercado y eventos",
    declaracion: "La puerta de entrada del Lighthouse: hospedaje, mercado de los barrios y eventos.",
    tiene: ["Hospitalidad", "Cocina", "Eventos"], busca: ["Marketing"],
    ritual: "Trabajar un evento con la tribu.", formaJuridica: "SAS de propósito",
    pozo: ["Noches para el Pase de estadías", "Mercado mensual"],
  },
  {
    id: "guardia", territorioId: "lighthouse", plata: { comprometida: 0, meta: 120000 }, roles: { cubiertos: 0, necesarios: 6 }, avales: 0,
nombre: "Barrio 12", iniciales: "+", barrio: 12, foco: "Ecología y biorregión", estado: "vacante",
    hogares: "lugar para 4 hogares",
    tiene: [], busca: ["Biología", "Monitoreo", "Guardaparques"],
    ritual: "Convocatoria abierta: la tribu que llegue define su ritual.", formaJuridica: "A definir",
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
const ETAPAS: Record<string, string> = {
  barda: "Reuniendo socios",
  monte: "Armando su propuesta",
  agua: "Armando su propuesta",
  avelan: "Eligiendo representantes",
  puerto: "Sumando hogares",
};

function conEtapa(t: Tribu): Tribu {
  return t.estado === "formacion" ? { ...t, etapa: ETAPAS[t.id] } : t;
}

export function listarTribus(): Tribu[] {
  return TRIBUS.map(conEtapa).sort((a, b) => a.barrio - b.barrio);
}

export function buscarTribu(id: string): Tribu | undefined {
  const t = TRIBUS.find((x) => x.id === id);
  return t && conEtapa(t);
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
