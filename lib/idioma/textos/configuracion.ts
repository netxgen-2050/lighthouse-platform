// Textos de Configuración (`/configuracion`): apariencia, avisos por tipo, Hifa, moneda, idioma y "Borrar todo".
// La nota del tipo de cambio sale de `comunes` (`notaTipoDeCambio` en `lib/configuracion/preferencias.ts`).
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";

const G = GLOSARIO;

const es = {
  pagina: {
    titulo: G.configuracion.es,
    volverInicio: `← ${G.inicio.es}`,
    h1: G.configuracion.es,
    intro:
      "Tus preferencias se guardan solo en este navegador y se aplican al instante. Todavía no hay cuentas, así que no viajan con vos a otro dispositivo.",
  },
  errorAlmacenamiento:
    "Error: tu navegador no permite guardar datos en este sitio, así que el cambio no se va a recordar al recargar. Revisá la configuración de privacidad o probá en otro navegador.",
  apariencia: {
    titulo: "Apariencia",
    tema: "Tema",
    temas: { claro: "Claro", oscuro: "Oscuro", sistema: "El del sistema" },
    tamano: "Tamaño del texto",
    tamanos: { normal: "Normal", grande: "Grande" },
    reducir: "Reducir animaciones",
  },
  avisos: {
    titulo: "Notificaciones",
    introAntes: "Elegí qué avisos aparecen en la campanita y en ",
    introEnlace: "tu bandeja",
    introDespues: ".",
    tiposAria: "Tipos de aviso",
    tipos: {
      comunidades: { etiqueta: "Comunidades", detalle: "Cuando una comunidad acepta tu adhesión." },
      pactos: { etiqueta: "Pactos", detalle: "Cuando una comunidad acepta tu pacto." },
      rondas: { etiqueta: "Rondas de reconocimiento", detalle: "Cuando se abre una ronda en tu comunidad." },
      mercado: { etiqueta: "Mercado", detalle: "Cuando alguien se interesa en lo que publicaste." },
      postulaciones: { etiqueta: "Postulaciones", detalle: "Cuando recibimos la postulación de tu comunidad." },
    },
  },
  asistente: {
    titulo: "Asistente",
    mostrar: "Mostrar a Hifa",
    detalle: "El botón del asistente, abajo a la derecha de cada página.",
  },
  moneda: {
    titulo: "Moneda de referencia",
    aria: "Moneda para mostrar montos",
    usd: "Dólares (USD)",
    ars: "Pesos argentinos (ARS)",
    /** `nota` es la nota del tipo de cambio ya armada en el idioma. */
    nota: (nota: string) => `Es solo para mostrar los montos; no se cobra nada de verdad. ${nota}`,
  },
  idioma: { titulo: "Idioma", aria: "Idioma de la plataforma" },
  datos: {
    titulo: "Tus datos",
    texto: "Todo lo que hacés en el prototipo queda solo en este navegador.",
    bitacora: "Ver la Bitácora",
    misDatos: "Mis datos: descargarlos, retirar mi consentimiento o pedir el borrado",
    privacidad: "Política de privacidad",
    borrar: "Borrar todo lo guardado en este navegador",
    confirmar: "¿Borrar todo lo que guardaste en este navegador?",
    fallo: "Error: no se pudo borrar todo. Algunos datos siguen guardados en este navegador.",
    listo: "Listo: se borró todo lo guardado en este navegador, incluidas estas preferencias.",
  },
};

const en: Textos<typeof es> = {
  pagina: {
    titulo: G.configuracion.en,
    volverInicio: `← ${G.inicio.en}`,
    h1: G.configuracion.en,
    intro:
      "Your preferences are saved only in this browser and apply right away. There are no accounts yet, so they don't travel with you to another device.",
  },
  errorAlmacenamiento:
    "Error: your browser doesn't allow saving data on this site, so the change won't be remembered after reloading. Check your privacy settings or try another browser.",
  apariencia: {
    titulo: "Appearance",
    tema: "Theme",
    temas: { claro: "Light", oscuro: "Dark", sistema: "Match the system" },
    tamano: "Text size",
    tamanos: { normal: "Regular", grande: "Large" },
    reducir: "Reduce animations",
  },
  avisos: {
    titulo: "Notifications",
    introAntes: "Choose which notices appear in the bell and in ",
    introEnlace: "your inbox",
    introDespues: ".",
    tiposAria: "Notice types",
    tipos: {
      comunidades: { etiqueta: "Communities", detalle: "When a community accepts your membership." },
      pactos: { etiqueta: "Pacts", detalle: "When a community accepts your pact." },
      rondas: { etiqueta: "Recognition rounds", detalle: "When a round opens in your community." },
      mercado: { etiqueta: "Market", detalle: "When someone is interested in what you posted." },
      postulaciones: { etiqueta: "Applications", detalle: "When we receive your community's application." },
    },
  },
  asistente: {
    titulo: "Assistant",
    mostrar: "Show Hifa",
    detalle: "The assistant button, at the bottom right of every page.",
  },
  moneda: {
    titulo: "Reference currency",
    aria: "Currency for showing amounts",
    usd: "US dollars (USD)",
    ars: "Argentine pesos (ARS)",
    nota: (nota: string) => `It is only for showing amounts; nothing is really charged. ${nota}`,
  },
  idioma: { titulo: "Language", aria: "Platform language" },
  datos: {
    titulo: "Your data",
    texto: "Everything you do in the prototype stays only in this browser.",
    bitacora: "View the Log",
    misDatos: "My data: download it, withdraw my consent or ask for deletion",
    privacidad: "Privacy policy",
    borrar: "Delete everything saved in this browser",
    confirmar: "Delete everything you saved in this browser?",
    fallo: "Error: could not delete everything. Some data is still saved in this browser.",
    listo: "Done: everything saved in this browser was deleted, including these preferences.",
  },
};

export const configuracion = { es, en };
