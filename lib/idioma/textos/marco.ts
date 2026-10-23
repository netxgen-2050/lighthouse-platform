// Textos del marco de la plataforma: rail, barra superior, menú de la persona, campanita, pie, avisos de la puerta y 404.
// Los nombres de las secciones salen del glosario (una sola fuente).
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";

const G = GLOSARIO;

const es = {
  saltar: "Saltar al contenido",
  descripcionSitio: "Plataforma del Lighthouse: territorio y tribus.",
  aviso: "Prototipo interno · datos de ejemplo",
  rail: {
    navegacion: "Principal",
    ayudaExplorador: "Sumate gratis para usar esto",
    ayudaMiembro: "Sumate para participar",
    grupos: { descubrir: G.descubrir.es, participar: G.participar.es, sumarte: G.sumarte.es },
  },
  destinos: {
    inicio: G.inicio.es,
    territorio: G.territorio.es,
    tribus: G.tribus.es,
    pactos: G.pactos.es,
    semillas: G.semillas.es,
    fogon: G.fogon.es,
    compromisos: G.compromisos.es,
    congreso: G.congreso.es,
    sumarte: G.sumarte.es,
    perfil: G.perfil.es,
    pasaporte: G.pasaporte.es,
    miRecorrido: G.miRecorrido.es,
    configuracion: G.configuracion.es,
    misDatos: G.misDatos.es,
    netx: "NetX",
  },
  niveles: {
    sinCuenta: "Sin cuenta",
    explorador: G.explorador.es,
    miembro: G.miembro.es,
    fundador: "Fundador",
    lider: "Líder de tribu",
    superadmin: "Super admin",
  },
  barra: {
    interno: "Interno",
    entrar: "Entrar",
    menuPersona: "Menú de la persona",
    nivel: (nivel: string) => `Nivel: ${nivel}`,
    adminDe: (tribu: string) => `Admin de ${tribu}`,
    salir: "Salir",
  },
  campanita: {
    sinNovedades: "Notificaciones, sin novedades",
    una: "1 notificación sin leer",
    varias: (n: number) => `${n} notificaciones sin leer`,
  },
  pie: {
    prototipo: "Prototipo en desarrollo. Datos de ejemplo.",
    privacidad: "Privacidad",
  },
  noEncontrada: {
    titulo: "No encontramos esa página",
    volver: "Volver a las tribus",
  },
  puerta: {
    sinAccesoTitulo: "Todavía no tenés acceso",
    sinAccesoTexto: "Tu email todavía no tiene acceso a este prototipo. Pedíselo a Gus.",
    entraste: (email: string) => `Entraste con ${email}.`,
    errorTitulo: "No pudimos verificar tu sesión",
    errorTexto: "Probá de nuevo en un momento.",
    volverAEntrada: "Volver a la entrada",
    importarTitulo: "Encontramos datos de antes del login",
    importarTexto:
      "Este navegador tiene datos de ejemplo guardados antes de que existieran las cuentas. ¿Querés pasarlos a tu cuenta? Se ofrece una sola vez.",
    importar: "Importar a mi cuenta",
    noImportar: "No importar",
  },
};

const en: Textos<typeof es> = {
  saltar: "Skip to content",
  descripcionSitio: "Lighthouse platform: territory and tribes.",
  aviso: "Internal prototype · sample data",
  rail: {
    navegacion: "Main",
    ayudaExplorador: "Join for free to use this",
    ayudaMiembro: "Join to take part",
    grupos: { descubrir: G.descubrir.en, participar: G.participar.en, sumarte: G.sumarte.en },
  },
  destinos: {
    inicio: G.inicio.en,
    territorio: G.territorio.en,
    tribus: G.tribus.en,
    pactos: G.pactos.en,
    semillas: G.semillas.en,
    fogon: G.fogon.en,
    compromisos: G.compromisos.en,
    congreso: G.congreso.en,
    sumarte: G.sumarte.en,
    perfil: G.perfil.en,
    pasaporte: G.pasaporte.en,
    miRecorrido: G.miRecorrido.en,
    configuracion: G.configuracion.en,
    misDatos: G.misDatos.en,
    netx: "NetX",
  },
  niveles: {
    sinCuenta: "No account",
    explorador: G.explorador.en,
    miembro: G.miembro.en,
    fundador: "Founder",
    lider: "Tribe leader",
    superadmin: "Super admin",
  },
  barra: {
    interno: "Internal",
    entrar: "Sign in",
    menuPersona: "Person menu",
    nivel: (nivel: string) => `Level: ${nivel}`,
    adminDe: (tribu: string) => `Admin of ${tribu}`,
    salir: "Sign out",
  },
  campanita: {
    sinNovedades: "Notifications, nothing new",
    una: "1 unread notification",
    varias: (n: number) => `${n} unread notifications`,
  },
  pie: {
    prototipo: "Prototype under development. Sample data.",
    privacidad: "Privacy",
  },
  noEncontrada: {
    titulo: "We couldn't find that page",
    volver: "Back to the tribes",
  },
  puerta: {
    sinAccesoTitulo: "You don't have access yet",
    sinAccesoTexto: "Your email doesn't have access to this prototype yet. Ask Gus for it.",
    entraste: (email: string) => `You signed in with ${email}.`,
    errorTitulo: "We couldn't verify your session",
    errorTexto: "Please try again in a moment.",
    volverAEntrada: "Back to the entrance",
    importarTitulo: "We found data from before the login",
    importarTexto:
      "This browser has sample data saved from before accounts existed. Do you want to move it to your account? This is offered only once.",
    importar: "Import to my account",
    noImportar: "Don't import",
  },
};

export const marco = { es, en };
