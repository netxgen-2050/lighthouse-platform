// Textos de Perfil (`/perfil`): encabezado, formulario, tarjetas, errores de validación y las seis preguntas de la entrevista
// (la entrevista ya no se muestra en pantalla: sus respuestas se migran al perfil, ver `lib/perfil/modelo.ts`).
// Lo que escribe la persona (nombre, frase, respuestas) nunca se traduce. Los nombres de los roles salen de `lib/pactos/datos.ts`.
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";

const G = GLOSARIO;

const es = {
  pagina: {
    titulo: "Tu perfil",
    volverInicio: `← ${G.inicio.es}`,
    sobretitulo: `Mi lugar · ${G.perfil.es.toLowerCase()}`,
    h1: "Tu perfil",
    intro:
      "Quién sos, qué sabés hacer y cómo te gusta decidir. Sirve para que una comunidad te conozca antes de sumarte.",
  },
  aviso: "Tu perfil queda solo en este navegador. Nadie más lo ve.",
  tuCuenta: "Tu cuenta: ",
  errorAlmacenamiento: "tu navegador no permite guardar datos en este sitio, así que tu perfil se pierde al recargar.",
  guardado: "Listo: guardamos tu perfil.",
  completar: "Completar mi perfil",
  editar: "Editar mi perfil",
  formulario: {
    titulo: "Editar mi perfil",
    nombre: "Nombre",
    lugar: "De dónde sos",
    frase: "Una frase sobre vos",
    ofrezco: "Qué sabés hacer y qué ofrecés",
    roles: "Tus roles",
    rolesAyuda: `Los mismos roles que ves en ${G.pactos.es}.`,
    rolOtro: "Qué otro rol tenés",
    decision: "Cómo te gusta decidir en comunidad",
    noNegociables: "Qué no negociás",
    guardar: "Guardar",
    cancelar: "Cancelar",
  },
  datos: {
    deDonde: "De dónde sos: ",
    sobreVos: "Sobre vos: ",
    ofrezcoTitulo: "Qué sabés hacer y qué ofrecés",
    rolesAria: "Tus roles",
    rolesSinDato: "Roles: sin dato",
    rolOtro: "Otro: ",
    decidisTitulo: "Cómo decidís y qué no negociás",
    comoDecidir: "Cómo te gusta decidir: ",
    noNegocias: "Qué no negociás: ",
  },
  comunidades: {
    titulo: "Tus comunidades",
    miembro: "Miembro",
    pedido: "Pedido enviado",
    ninguna: "Todavía no pertenecés a ninguna comunidad.",
    mirar: `Mirá las ${G.tribus.es.toLowerCase()}`,
  },
  resumen: {
    titulo: "Resumen",
    pactosActivos: "Pactos activos: ",
    irPactos: "Ir a Pactos",
    semillasTotales: "Semillas totales: ",
    irSemillas: "Ir a Semillas",
  },
  errores: {
    nombre: "Escribí tu nombre.",
    nombreMax: (max: number) => `El nombre puede tener hasta ${max} caracteres.`,
    max: (max: number) => `Puede tener hasta ${max} caracteres.`,
    rolOtro: "Contanos qué otro rol tenés.",
  },
  /** Las seis preguntas del mock-up v6; `etiqueta` es el nombre del dato del perfil que se propone. */
  preguntas: [
    { texto: "¿Qué te trae a BioPueblo?", etiqueta: "Qué te trae" },
    { texto: "¿Qué paisaje te imaginás?", etiqueta: "Bioregión" },
    { texto: "¿Cómo te gustaría decidir en comunidad?", etiqueta: "Cómo decidir" },
    { texto: "¿Qué sabés hacer que pueda sumar?", etiqueta: "Lo que aportás" },
    { texto: "¿Cuánto tiempo podrías dedicar?", etiqueta: "Tiempo" },
    { texto: "¿Qué no negociarías?", etiqueta: "No negociables" },
  ],
};

const en: Textos<typeof es> = {
  pagina: {
    titulo: "Your profile",
    volverInicio: `← ${G.inicio.en}`,
    sobretitulo: `My place · ${G.perfil.en.toLowerCase()}`,
    h1: "Your profile",
    intro: "Who you are, what you can do and how you like to decide. It helps a community get to know you before you join.",
  },
  aviso: "Your profile stays only in this browser. Nobody else sees it.",
  tuCuenta: "Your account: ",
  errorAlmacenamiento: "your browser doesn't allow saving data on this site, so your profile is lost when you reload.",
  guardado: "Done: we saved your profile.",
  completar: "Complete my profile",
  editar: "Edit my profile",
  formulario: {
    titulo: "Edit my profile",
    nombre: "Name",
    lugar: "Where you're from",
    frase: "A sentence about you",
    ofrezco: "What you can do and what you offer",
    roles: "Your roles",
    rolesAyuda: `The same roles you see in ${G.pactos.en}.`,
    rolOtro: "What other role do you have",
    decision: "How you like to decide in community",
    noNegociables: "What you won't compromise on",
    guardar: "Save",
    cancelar: "Cancel",
  },
  datos: {
    deDonde: "Where you're from: ",
    sobreVos: "About you: ",
    ofrezcoTitulo: "What you can do and what you offer",
    rolesAria: "Your roles",
    rolesSinDato: "Roles: no data",
    rolOtro: "Other: ",
    decidisTitulo: "How you decide and what you won't compromise on",
    comoDecidir: "How you like to decide: ",
    noNegocias: "What you won't compromise on: ",
  },
  comunidades: {
    titulo: "Your communities",
    miembro: "Member",
    pedido: "Request sent",
    ninguna: "You don't belong to any community yet.",
    mirar: `Browse the ${G.tribus.en.toLowerCase()}`,
  },
  resumen: {
    titulo: "Summary",
    pactosActivos: "Active pacts: ",
    irPactos: "Go to Pacts",
    semillasTotales: "Total Semillas: ",
    irSemillas: "Go to Semillas",
  },
  errores: {
    nombre: "Enter your name.",
    nombreMax: (max: number) => `The name can be up to ${max} characters long.`,
    max: (max: number) => `It can be up to ${max} characters long.`,
    rolOtro: "Tell us what other role you have.",
  },
  preguntas: [
    { texto: "What brings you to BioPueblo?", etiqueta: "What brings you" },
    { texto: "What landscape do you imagine?", etiqueta: "Bioregion" },
    { texto: "How would you like to decide in community?", etiqueta: "How to decide" },
    { texto: "What can you do that could add value?", etiqueta: "What you contribute" },
    { texto: "How much time could you dedicate?", etiqueta: "Time" },
    { texto: "What would you not compromise on?", etiqueta: "Non-negotiables" },
  ],
};

export const perfil = { es, en };
