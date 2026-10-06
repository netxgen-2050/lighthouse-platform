import type { Tribu } from "./tipos";

// Datos de ejemplo copiados de TRIBES en docs/referencia/netx-tribus-mockup-v6.html.
const TRIBUS: Tribu[] = [
  {
    id: "semilla", nombre: "Semilla Viva", iniciales: "SV", barrio: 1, foco: "Suelo y semillas", estado: "activa",
    hogares: "6 hogares · 14 personas", subtitulo: "Banco de semillas y huerta intensiva",
    declaracion: "Cuidamos el suelo y las semillas criollas para que todo el Lighthouse coma bien.",
    tiene: ["Huerta", "Compost", "Banco de semillas"], busca: ["Riego"],
    ritual: "Una jornada de minga en la huerta y una ronda de palabra.", formaJuridica: "Asociación civil",
    pozo: ["200 kg de verdura por mes", "3.000 plantines por temporada"],
  },
  {
    id: "barda", nombre: "Barda Productiva", iniciales: "BP", barrio: 2, foco: "Huerto y fermentación", estado: "activa",
    hogares: "4 hogares", subtitulo: "Olivos y vid · proyectos individuales",
    declaracion: "Producimos aceite y vino con manejo regenerativo, y abrimos la bodega a los vecinos.",
    tiene: ["Agronomía", "Enología", "Comercialización"], busca: ["Riego"],
    ritual: "Entrevista con los socios de la SAS y aporte mínimo de capital.", formaJuridica: "SAS",
    pozo: ["120 litros de aceite por año", "Visitas guiadas a la bodega"],
  },
  {
    id: "grano", nombre: "Barrio 3", iniciales: "+", barrio: 3, foco: "Granos y proteína", estado: "vacante",
    hogares: "lugar para 6–8 hogares",
    tiene: [], busca: ["Agricultura extensiva", "Animales", "Molienda"],
    ritual: "Convocatoria abierta: la tribu que llegue define su ritual.", formaJuridica: "A definir",
  },
  {
    id: "monte", nombre: "Monte Nuevo", iniciales: "MN", barrio: 4, foco: "Bosque y materiales", estado: "formacion",
    hogares: "3 hogares", subtitulo: "Forestación, madera y bioconstrucción",
    declaracion: "Plantamos el bosque que va a dar la madera y la paja de las casas del Lighthouse.",
    tiene: ["Forestación", "Carpintería"], busca: ["Bioconstrucción", "Maquinaria"],
    ritual: "Plantar un árbol con la tribu y pasar tres días en obra.", formaJuridica: "SAS de propósito",
    pozo: ["Madera para 2 domos por año", "Talleres de bioconstrucción"],
  },
  {
    id: "agua", nombre: "Agua Clara", iniciales: "AC", barrio: 5, foco: "Agua", estado: "formacion",
    hogares: "2 hogares + equipo técnico", subtitulo: "El servicio de agua de todo el Lighthouse",
    declaracion: "Diseñamos y cuidamos el agua común: toma, cisterna, riego y tratamiento.",
    tiene: ["Hidráulica"], busca: ["Plomería", "Tratamiento de aguas"],
    ritual: "Una visita técnica al río y una entrevista con el equipo.", formaJuridica: "Cooperativa",
    pozo: ["Servicio de agua a los 12 barrios"],
  },
  {
    id: "valle", nombre: "Valle Solar", iniciales: "VS", barrio: 6, foco: "Energía y circularidad", estado: "activa",
    hogares: "7 hogares · 18 personas", subtitulo: "Familias · solarpunk · consentimiento",
    declaracion: "Familias que quieren criar en comunidad, con energía y agua propias.",
    tiene: ["Huerta", "Carpintería", "Crianza compartida"], busca: ["Energía solar", "Bioconstrucción", "Eventos y comunidad"],
    ritual: "Dos llamadas, un fin de semana de convivencia y el consentimiento del grupo.", formaJuridica: "Asociación civil",
    pozo: ["Energía solar para el núcleo común", "30 noches de hospedaje por año"],
  },
  {
    id: "taller", nombre: "Taller Común", iniciales: "TC", barrio: 7, foco: "Oficios y reparación", estado: "activa",
    hogares: "5 hogares", subtitulo: "Herrería, carpintería y reparación",
    declaracion: "Arreglamos, fabricamos y enseñamos. Nada se tira si se puede reparar.",
    tiene: ["Herrería", "Carpintería", "Electrónica"], busca: ["Textil"],
    ritual: "Traer algo para reparar y arreglarlo con la tribu.", formaJuridica: "Asociación civil",
    pozo: ["40 horas de taller por mes"],
  },
  {
    id: "cuidado", nombre: "Barrio 8", iniciales: "+", barrio: 8, foco: "Cuidado", estado: "vacante",
    hogares: "lugar para 6 hogares",
    tiene: [], busca: ["Salud", "Crianza", "Acompañamiento de mayores"],
    ritual: "Convocatoria abierta: la tribu que llegue define su ritual.", formaJuridica: "A definir",
  },
  {
    id: "escuela", nombre: "Escuela de la Tierra", iniciales: "ET", barrio: 9, foco: "Aprendizaje", estado: "formacion",
    hogares: "3 hogares", subtitulo: "Escuela al aire libre y cursos",
    declaracion: "Una escuela para los chicos del Lighthouse y de los barrios vecinos.",
    tiene: ["Docencia", "Permacultura"], busca: ["Pedagogía Waldorf", "Administración"],
    ritual: "Dar una clase abierta y una entrevista con las familias.", formaJuridica: "Asociación civil",
    pozo: ["Cursos para vecinos", "Estadías de aprendizaje"],
  },
  {
    id: "avelan", nombre: "Fundación Avelan Kerum", iniciales: "AK", barrio: 10, foco: "Cultura y vida interior", estado: "formacion",
    hogares: "Núcleo en formación", subtitulo: "Ciudad consciente · comunidad online de más de 200 personas",
    declaracion: "Una comunidad que se organiza en áreas con representantes elegidos entre pares.",
    areas: ["Nutrición", "Educación", "Sanación", "Energía", "Intercambio", "Acuerdos", "Cuidado", "Comunicación", "Tecnología", "Encuentros"],
    areasAbiertas: ["Nutrición", "Energía", "Encuentros"],
    tiene: ["Arquitectura", "Derecho", "Sanación"], busca: ["Producción de alimentos"],
    ritual: "Convocatoria por áreas: convivencia virtual y elección del representante entre pares.", formaJuridica: "Fundación",
    pozo: ["Retiros y encuentros abiertos"],
  },
  {
    id: "puerto", nombre: "Puerto Trueque", iniciales: "PT", barrio: 11, foco: "Intercambio y hospitalidad", estado: "activa",
    hogares: "5 hogares", subtitulo: "Hospedaje, mercado y eventos",
    declaracion: "La puerta de entrada del Lighthouse: hospedaje, mercado de los barrios y eventos.",
    tiene: ["Hospitalidad", "Cocina", "Eventos"], busca: ["Marketing"],
    ritual: "Trabajar un evento con la tribu.", formaJuridica: "SAS de propósito",
    pozo: ["Noches para el Pase de estadías", "Mercado mensual"],
  },
  {
    id: "guardia", nombre: "Guardianes del Monte", iniciales: "GM", barrio: 12, foco: "Ecología y biorregión", estado: "formacion",
    hogares: "2 hogares", subtitulo: "Monitoreo del bosque ribereño y del santuario",
    declaracion: "Cuidamos el bosque ribereño y medimos cómo mejora la tierra año a año.",
    tiene: ["Biología", "Monitoreo"], busca: ["Datos", "Guardaparques"],
    ritual: "Una caminata de monitoreo y una entrevista.", formaJuridica: "Asociación civil",
    pozo: ["Informe de biodiversidad anual"],
  },
];

export function listarTribus(): Tribu[] {
  return [...TRIBUS].sort((a, b) => a.barrio - b.barrio);
}

export function buscarTribu(id: string): Tribu | undefined {
  return TRIBUS.find((t) => t.id === id);
}
