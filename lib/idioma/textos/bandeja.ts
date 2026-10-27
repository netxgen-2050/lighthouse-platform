// Textos de la Bandeja (`/bandeja`) y de cada evento de la actividad. Cada evento nuevo guarda su clave y sus datos
// (`lib/actividad/actividad.ts`) y el texto se arma acá, al mostrarlo, en el idioma actual. Cada función recibe el único dato
// que usa: el nombre de la comunidad o la descripción de lo que publicó la persona (no se traducen).
import { GLOSARIO } from "../glosario";
import type { Textos } from "../tipos";

const G = GLOSARIO;

const es = {
  pagina: {
    titulo: "Bandeja",
    volverInicio: `← ${G.inicio.es}`,
    h1: "Tu bandeja",
    intro: "Acá aparece lo que te pasa en la plataforma: respuestas de las comunidades, rondas que se abren y avisos.",
  },
  notificaciones: "Notificaciones",
  marcarTodas: "Marcar todas como leídas",
  todasLeidas: "Todas las notificaciones quedaron como leídas.",
  noSeGuardo: "No se pudo guardar en este navegador: las notificaciones vuelven a figurar sin leer al recargar.",
  vacio: "Todavía no tenés notificaciones. Cuando una comunidad responda a lo que hiciste, te avisamos acá.",
  leida: "Leída",
  sinLeer: "Sin leer",
  mensajes: { titulo: "Mensajes", pronto: "Pronto vas a poder recibir mensajes de tu comunidad y del equipo" },
  /** Lo que se lee cuando el evento no trae el nombre de la comunidad (una postulación sin nombre). */
  tuComunidad: "tu comunidad",
  eventos: {
    adheriste: (comunidad: string) => `Adheriste al manifiesto de ${comunidad}`,
    adhesionAceptada: (comunidad: string) => `${comunidad} aceptó tu adhesión`,
    propusistePacto: (comunidad: string) => `Propusiste un pacto en ${comunidad}`,
    pactoAceptado: (comunidad: string) => `${comunidad} aceptó tu pacto`,
    propusisteCambioDePacto: (comunidad: string) => `Propusiste un cambio a tu pacto en ${comunidad}`,
    cambioDePactoAceptado: (comunidad: string) => `${comunidad} aceptó el cambio a tu pacto`,
    cambioDePactoRechazado: (comunidad: string) => `${comunidad} no aceptó el cambio a tu pacto`,
    rondaAbierta: (comunidad: string) => `Se abrió una ronda de reconocimiento en ${comunidad}`,
    publicasteEnMercado: (descripcion: string) => `Publicaste en el mercado: ${descripcion}`,
    interesEnOferta: () => "Alguien se interesó en tu oferta (simulado)",
    enviastePostulacion: (comunidad: string) => `Enviaste una postulación de ${comunidad}`,
    postulacionRecibida: () => "Recibimos tu postulación",
    registrasteTicket: () => "Registraste tu ticket del Congreso",
    enviasteRonda: (comunidad: string) => `Enviaste tu ronda de reconocimiento en ${comunidad}`,
  },
};

const en: Textos<typeof es> = {
  pagina: {
    titulo: "Inbox",
    volverInicio: `← ${G.inicio.en}`,
    h1: "Your inbox",
    intro: "This is where what happens to you on the platform shows up: replies from communities, rounds that open and notices.",
  },
  notificaciones: "Notifications",
  marcarTodas: "Mark all as read",
  todasLeidas: "All notifications are now marked as read.",
  noSeGuardo: "Could not save in this browser: the notifications show as unread again when you reload.",
  vacio: "You don't have any notifications yet. When a community responds to what you did, we'll let you know here.",
  leida: "Read",
  sinLeer: "Unread",
  mensajes: { titulo: "Messages", pronto: "Soon you'll be able to receive messages from your community and the team" },
  tuComunidad: "your community",
  eventos: {
    adheriste: (comunidad: string) => `You endorsed the ${comunidad} manifesto`,
    adhesionAceptada: (comunidad: string) => `${comunidad} accepted your membership`,
    propusistePacto: (comunidad: string) => `You proposed a pact in ${comunidad}`,
    pactoAceptado: (comunidad: string) => `${comunidad} accepted your pact`,
    propusisteCambioDePacto: (comunidad: string) => `You proposed a change to your pact in ${comunidad}`,
    cambioDePactoAceptado: (comunidad: string) => `${comunidad} accepted the change to your pact`,
    cambioDePactoRechazado: (comunidad: string) => `${comunidad} did not accept the change to your pact`,
    rondaAbierta: (comunidad: string) => `A recognition round opened in ${comunidad}`,
    publicasteEnMercado: (descripcion: string) => `You posted in the market: ${descripcion}`,
    interesEnOferta: () => "Someone is interested in your offer (simulated)",
    enviastePostulacion: (comunidad: string) => `You sent an application for ${comunidad}`,
    postulacionRecibida: () => "We received your application",
    registrasteTicket: () => "You registered your Congress ticket",
    enviasteRonda: (comunidad: string) => `You sent your recognition round in ${comunidad}`,
  },
};

export const bandeja = { es, en };
