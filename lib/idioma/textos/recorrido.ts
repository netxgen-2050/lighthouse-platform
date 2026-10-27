// Textos de Mi recorrido (`/panel`): encabezado, próximo paso (uno por paso), pestañas, línea de tiempo y Bitácora.
// Los textos de la línea de tiempo (lo que hizo la persona) salen del diccionario `bandeja`, que arma cada evento.
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";

const G = GLOSARIO;

const es = {
  pagina: {
    titulo: G.miRecorrido.es,
    volverInicio: `← ${G.inicio.es}`,
    sobretitulo: "Tu panel",
    h1: G.miRecorrido.es,
    intro: "Lo que sigue y lo que ya hiciste, en un solo lugar.",
  },
  modoDemo: "Modo demostración: este panel lee lo que guardaste en este navegador.",
  errorLectura:
    "tu navegador no permite leer los datos guardados en este sitio, así que el panel no puede mostrar tu recorrido. Revisá la configuración de privacidad o probá en otro navegador.",
  proximo: { titulo: "Tu próximo paso", todoHecho: "Ya recorriste todo lo que hay por ahora." },
  /** Un próximo paso por cada momento del recorrido. */
  pasos: {
    perfil: {
      titulo: "Completá tu perfil",
      detalle: "Terminá la entrevista y confirmá tus datos para que podamos orientarte.",
      boton: "Completar mi perfil",
    },
    comunidad: {
      titulo: "Adherí a una comunidad",
      detalle: "Leé el manifiesto de una comunidad y adherí si te representa.",
      boton: "Ver comunidades",
    },
    pacto: {
      titulo: "Proponé un pacto",
      detalle: "Contá qué vas a aportar a tu comunidad.",
      boton: "Proponer un pacto",
    },
    identidad: {
      titulo: "Verificá tu identidad",
      detalle: "Hace falta para invertir.",
      boton: "Verificar mi identidad",
    },
    ticket: {
      titulo: "Registrá tu ticket del Congreso",
      detalle: "Cargá el código de tu ticket.",
      boton: "Registrar mi ticket",
    },
  },
  pestanas: { aria: G.miRecorrido.es, camino: "Tu camino", bitacora: "Bitácora" },
  vacio: "Todavía no hay nada en tu camino. Lo que hagas en la plataforma va a aparecer acá.",
  bitacora: {
    intro:
      "Lo que te mostramos: anotamos qué estado del loteo y qué explicaciones legales viste, y cuándo, para poder probar con qué información contabas al decidir.",
    prototipo:
      "En el prototipo la bitácora queda solo en este navegador y la podés borrar: todavía no sirve como prueba. Con el login y la base de datos se va a guardar de verdad.",
  },
  borrarAntes: "Para borrar lo que guardaste en este navegador, andá a ",
  borrarEnlace: `${G.configuracion.es}, en Tus datos`,
  tabla: {
    errorLectura:
      "tu navegador no permite leer los datos guardados en este sitio, así que no podemos mostrar la bitácora. Revisá la configuración de privacidad o probá en otro navegador.",
    vacia: "Todavía no hay nada anotado en este navegador.",
    descargar: "Descargar (JSON)",
    aria: "Tabla de lo que te mostramos",
    titulo: "Lo que te mostramos, de lo más nuevo a lo más viejo",
    fecha: "Fecha y hora",
    pantalla: "Pantalla",
    queSeMostro: "Qué se mostró",
    huella: "Huella",
    borrador: "Borrador",
    borradorFila: (si: boolean) => `Borrador: ${si ? "sí" : "no"}`,
    tipos: { estadoLoteo: "Estado del loteo", terminoLegal: "Término legal" },
  },
};

const en: Textos<typeof es> = {
  pagina: {
    titulo: G.miRecorrido.en,
    volverInicio: `← ${G.inicio.en}`,
    sobretitulo: "Your dashboard",
    h1: G.miRecorrido.en,
    intro: "What comes next and what you've already done, all in one place.",
  },
  modoDemo: "Demo mode: this dashboard reads what you saved in this browser.",
  errorLectura:
    "your browser doesn't allow reading the data saved on this site, so the dashboard can't show your journey. Check your privacy settings or try another browser.",
  proximo: { titulo: "Your next step", todoHecho: "You've gone through everything there is for now." },
  pasos: {
    perfil: {
      titulo: "Complete your profile",
      detalle: "Finish the interview and confirm your details so we can guide you.",
      boton: "Complete my profile",
    },
    comunidad: {
      titulo: "Join a community",
      detalle: "Read a community's manifesto and join if it represents you.",
      boton: "See communities",
    },
    pacto: {
      titulo: "Propose a pact",
      detalle: "Tell us what you will contribute to your community.",
      boton: "Propose a pact",
    },
    identidad: {
      titulo: "Verify your identity",
      detalle: "You need this to invest.",
      boton: "Verify my identity",
    },
    ticket: {
      titulo: "Register your Congress ticket",
      detalle: "Enter your ticket code.",
      boton: "Register my ticket",
    },
  },
  pestanas: { aria: G.miRecorrido.en, camino: "Your path", bitacora: "Log" },
  vacio: "There's nothing on your path yet. What you do on the platform will show up here.",
  bitacora: {
    intro:
      "What we showed you: we note which subdivision status and which legal explanations you saw, and when, so we can prove what information you had when you decided.",
    prototipo:
      "In the prototype the log stays only in this browser and you can delete it: it doesn't work as proof yet. With login and the database it will be saved for real.",
  },
  borrarAntes: "To delete what you saved in this browser, go to ",
  borrarEnlace: `${G.configuracion.en}, under Your data`,
  tabla: {
    errorLectura:
      "your browser doesn't allow reading the data saved on this site, so we can't show the log. Check your privacy settings or try another browser.",
    vacia: "Nothing has been noted in this browser yet.",
    descargar: "Download (JSON)",
    aria: "Table of what we showed you",
    titulo: "What we showed you, from newest to oldest",
    fecha: "Date and time",
    pantalla: "Screen",
    queSeMostro: "What was shown",
    huella: "Fingerprint",
    borrador: "Draft",
    borradorFila: (si: boolean) => `Draft: ${si ? "yes" : "no"}`,
    tipos: { estadoLoteo: "Subdivision status", terminoLegal: "Legal term" },
  },
};

export const recorrido = { es, en };
