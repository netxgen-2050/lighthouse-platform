// Textos de Compromisos (`/compromisos`) y su Mercado: formulario de registro, validaciones, tipos y medios de intercambio,
// formatos de cantidad, filtros y avisos del Mercado. Las ofertas de ejemplo del Mercado viven en
// `lib/compromisos/mercado.ts` con su inglés. Lo que escribe la persona (descripción, cantidad de bienes) nunca se traduce.
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";

const G = GLOSARIO;

const es = {
  pagina: {
    titulo: G.compromisos.es,
    volverInicio: `← ${G.inicio.es}`,
    h1: G.compromisos.es,
    intro:
      "Publicá qué ofrecés o qué necesitás y el medio de intercambio (tiempo, bienes, plata o trueque). Los montos son orientativos; ningún pago es real.",
    modoDemo: "Modo demostración: lo que registres queda solo en este navegador.",
  },
  tipo: { ofrezco: "Ofrezco", necesito: "Necesito" },
  clase: { tiempo: "Tiempo", bienes: "Bienes", plata: "Plata", trueque: "Trueque" },
  /** Cantidad orientativa en palabras (el monto, "USD 500", se escribe igual en los dos idiomas). */
  cantidad: {
    horas: (n: number) => `${n} h/mes`,
    sinDato: "sin dato",
  },
  formulario: {
    tipo: "Tipo",
    medio: "Medio de intercambio",
    descripcion: "Descripción",
    hastaCaracteres: (n: number) => `(hasta ${n} caracteres)`,
    horas: "Horas por mes",
    horasAyuda: "(opcional, de 1 a 160)",
    monto: "Monto orientativo en USD",
    montoAyuda: (min: number, max: number) => `(opcional, de ${min} a ${max})`,
    montoNota: "Es solo una referencia: en el prototipo no se cobra ni se paga nada.",
    trueque: "En el trueque no se pone cantidad: contá en la descripción qué ofrecés y a cambio de qué.",
    bienes: "Cantidad orientativa",
    bienesAyuda: `(opcional, por ejemplo "20 kg por mes")`,
    bienesMax: (n: number) => `Hasta ${n} caracteres.`,
    registrar: "Registrar",
    error: "Error:",
  },
  /** Mensajes de validación, asociados al campo. */
  errores: {
    descripcionVacia: "Escribí una descripción.",
    descripcionLarga: (max: number) => `La descripción puede tener hasta ${max} caracteres.`,
    horas: (min: number, max: number) => `Las horas por mes son un número entero entre ${min} y ${max}, o dejalo vacío.`,
    monto: (min: number, max: number) => `El monto es un número entero de USD entre ${min} y ${max}, o dejalo vacío.`,
    bienes: (max: number) => `La cantidad puede tener hasta ${max} caracteres.`,
  },
  lista: {
    titulo: "Tus compromisos",
    borrarTodo: "Borrar todo",
    vacia: "Todavía no registraste compromisos.",
    quitar: "Quitar",
    quitarAria: (descripcion: string) => `Quitar ${descripcion}`,
  },
  anuncios: {
    registrado: "Compromiso registrado.",
    quitado: "Compromiso quitado.",
    borrados: "Se borraron todos los compromisos.",
    todosLosTipos: "Todos los tipos",
    todosLosMedios: "todos los medios",
  },
  mercado: {
    titulo: "Mercado",
    primerPaso:
      "El primer paso para entrar al mercado es publicar una oferta o una necesidad: registrala en el formulario y aparece acá.",
    pronto: "Pronto, una inteligencia artificial va a sugerirte el mejor match entre ofertas y necesidades.",
    filtroTipo: "Filtrar por tipo",
    filtroMedio: "Filtrar por medio de intercambio",
    todos: "Todos",
    publicaciones: (n: number) => (n === 1 ? "1 publicación" : `${n} publicaciones`),
    sinResultados: "No hay publicaciones con esos filtros.",
    listaAria: "Publicaciones del mercado",
    publica: "Publica:",
    vos: "Vos",
    comunidadEjemplo: "Comunidad (ejemplo)",
    meInteresa: "Me interesa",
    meInteresaAria: (descripcion: string) => `Me interesa: ${descripcion}`,
    marcado: "Marcado como de interés (simulado)",
  },
};

const en: Textos<typeof es> = {
  pagina: {
    titulo: G.compromisos.en,
    volverInicio: `← ${G.inicio.en}`,
    h1: G.compromisos.en,
    intro:
      "Post what you offer or what you need, and the means of exchange (time, goods, money or barter). Amounts are indicative; no payment is real.",
    modoDemo: "Demo mode: what you register stays only in this browser.",
  },
  tipo: { ofrezco: "I offer", necesito: "I need" },
  clase: { tiempo: "Time", bienes: "Goods", plata: "Money", trueque: "Barter" },
  cantidad: {
    horas: (n: number) => `${n} h/month`,
    sinDato: "no data",
  },
  formulario: {
    tipo: "Type",
    medio: "Means of exchange",
    descripcion: "Description",
    hastaCaracteres: (n: number) => `(up to ${n} characters)`,
    horas: "Hours per month",
    horasAyuda: "(optional, from 1 to 160)",
    monto: "Indicative amount in USD",
    montoAyuda: (min: number, max: number) => `(optional, from ${min} to ${max})`,
    montoNota: "It is only a reference: in the prototype nothing is charged or paid.",
    trueque: "Barter has no amount: say in the description what you offer and in exchange for what.",
    bienes: "Indicative quantity",
    bienesAyuda: `(optional, for example "20 kg per month")`,
    bienesMax: (n: number) => `Up to ${n} characters.`,
    registrar: "Register",
    error: "Error:",
  },
  errores: {
    descripcionVacia: "Write a description.",
    descripcionLarga: (max: number) => `The description can have up to ${max} characters.`,
    horas: (min: number, max: number) => `Hours per month must be a whole number between ${min} and ${max}, or leave it empty.`,
    monto: (min: number, max: number) => `The amount must be a whole number of USD between ${min} and ${max}, or leave it empty.`,
    bienes: (max: number) => `The quantity can have up to ${max} characters.`,
  },
  lista: {
    titulo: "Your commitments",
    borrarTodo: "Delete all",
    vacia: "You haven't registered any commitments yet.",
    quitar: "Remove",
    quitarAria: (descripcion: string) => `Remove ${descripcion}`,
  },
  anuncios: {
    registrado: "Commitment registered.",
    quitado: "Commitment removed.",
    borrados: "All commitments were deleted.",
    todosLosTipos: "All types",
    todosLosMedios: "all means",
  },
  mercado: {
    titulo: "Market",
    primerPaso:
      "The first step into the market is to post an offer or a need: register it in the form and it appears here.",
    pronto: "Soon, an artificial intelligence will suggest the best match between offers and needs.",
    filtroTipo: "Filter by type",
    filtroMedio: "Filter by means of exchange",
    todos: "All",
    publicaciones: (n: number) => (n === 1 ? "1 post" : `${n} posts`),
    sinResultados: "There are no posts with those filters.",
    listaAria: "Market posts",
    publica: "Posted by:",
    vos: "You",
    comunidadEjemplo: "Community (sample)",
    meInteresa: "I'm interested",
    meInteresaAria: (descripcion: string) => `I'm interested: ${descripcion}`,
    marcado: "Marked as interesting (simulated)",
  },
};

export const compromisos = { es, en };
