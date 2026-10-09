import type { NuevoEvento } from "./actividad";

/** Segundos que tarda el aviso simulado de interés en una oferta. */
export const DEMORA_INTERES_SEGUNDOS = 20;

/** Los eventos que registran las pantallas. Los textos viven acá y no en cada componente. */
export const EVENTOS = {
  adheriste: (comunidad: string, idComunidad: string): NuevoEvento => ({
    tipo: "adhesion",
    texto: `Adheriste al manifiesto de ${comunidad}`,
    enlace: `/tribus/${idComunidad}/manifiesto`,
  }),
  adhesionAceptada: (comunidad: string, idComunidad: string): NuevoEvento => ({
    tipo: "adhesion-aceptada",
    texto: `${comunidad} aceptó tu adhesión`,
    enlace: `/tribus/${idComunidad}/manifiesto`,
    notificacion: true,
    clave: `adhesion-aceptada:${idComunidad}`,
  }),
  propusistePacto: (comunidad: string, idComunidad: string): NuevoEvento => ({
    tipo: "pacto",
    texto: `Propusiste un pacto en ${comunidad}`,
    enlace: `/pactos?comunidad=${idComunidad}`,
  }),
  pactoAceptado: (comunidad: string, idComunidad: string): NuevoEvento => ({
    tipo: "pacto-aceptado",
    texto: `${comunidad} aceptó tu pacto`,
    enlace: `/pactos?comunidad=${idComunidad}`,
    notificacion: true,
    clave: `pacto-aceptado:${idComunidad}`,
  }),
  rondaAbierta: (comunidad: string, idComunidad: string): NuevoEvento => ({
    tipo: "ronda-abierta",
    texto: `Se abrió una ronda de reconocimiento en ${comunidad}`,
    enlace: `/semillas?comunidad=${idComunidad}`,
    notificacion: true,
    clave: `ronda-abierta:${idComunidad}`,
  }),
  publicasteEnMercado: (descripcion: string): NuevoEvento => ({
    tipo: "mercado",
    texto: `Publicaste en el mercado: ${descripcion}`,
    enlace: "/compromisos",
  }),
  interesEnOferta: (idCompromiso: string): NuevoEvento => ({
    tipo: "interes-oferta",
    texto: "Alguien se interesó en tu oferta (simulado)",
    enlace: "/compromisos",
    notificacion: true,
    demoraSegundos: DEMORA_INTERES_SEGUNDOS,
    clave: `interes-oferta:${idCompromiso}`,
  }),
  enviastePostulacion: (comunidad: string): NuevoEvento => ({
    tipo: "postulacion",
    texto: `Enviaste una postulación de ${comunidad}`,
    enlace: "/tribus",
  }),
  postulacionRecibida: (idPostulacion: string): NuevoEvento => ({
    tipo: "postulacion-recibida",
    texto: "Recibimos tu postulación",
    enlace: "/tribus",
    notificacion: true,
    clave: `postulacion-recibida:${idPostulacion}`,
  }),
  registrasteTicket: (): NuevoEvento => ({
    tipo: "ticket",
    texto: "Registraste tu ticket del Congreso",
    enlace: "/congreso",
  }),
  enviasteRonda: (comunidad: string, idComunidad: string): NuevoEvento => ({
    tipo: "ronda-enviada",
    texto: `Enviaste tu ronda de reconocimiento en ${comunidad}`,
    enlace: `/semillas?comunidad=${idComunidad}`,
  }),
};
