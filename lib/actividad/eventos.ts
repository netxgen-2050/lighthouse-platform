import { armarTexto, type ClaveMensaje, type DatosEvento, type NuevoEvento } from "./actividad";

/** Segundos que tarda el aviso simulado de interés en una oferta. */
export const DEMORA_INTERES_SEGUNDOS = 20;

/**
 * Cada evento guarda su mensaje y sus datos (el texto se arma al mostrarlo, en el idioma actual) y además su texto en
 * español, para que el código que solo conoce `texto` lo siga leyendo.
 */
function evento(
  mensaje: ClaveMensaje,
  datos: DatosEvento,
  resto: Omit<NuevoEvento, "texto" | "mensaje" | "datos">,
): NuevoEvento {
  return { ...resto, texto: armarTexto(mensaje, datos, "es"), mensaje, datos };
}

/** Los eventos que registran las pantallas. Los textos viven en el diccionario `bandeja` y no en cada componente. */
export const EVENTOS = {
  adheriste: (comunidad: string, idComunidad: string): NuevoEvento =>
    evento("adheriste", { comunidad }, { tipo: "adhesion", enlace: `/tribus/${idComunidad}/manifiesto` }),
  adhesionAceptada: (comunidad: string, idComunidad: string): NuevoEvento =>
    evento("adhesionAceptada", { comunidad }, {
      tipo: "adhesion-aceptada",
      enlace: `/tribus/${idComunidad}/manifiesto`,
      notificacion: true,
      clave: `adhesion-aceptada:${idComunidad}`,
    }),
  propusistePacto: (comunidad: string, idComunidad: string): NuevoEvento =>
    evento("propusistePacto", { comunidad }, { tipo: "pacto", enlace: `/pactos?comunidad=${idComunidad}` }),
  pactoAceptado: (comunidad: string, idComunidad: string): NuevoEvento =>
    evento("pactoAceptado", { comunidad }, {
      tipo: "pacto-aceptado",
      enlace: `/pactos?comunidad=${idComunidad}`,
      notificacion: true,
      clave: `pacto-aceptado:${idComunidad}`,
    }),
  /** El motivo no se copia al evento: queda en el pacto. `propuestaId` evita registrarlo dos veces. */
  pactoNoAceptado: (comunidad: string, idComunidad: string, propuestaId: string): NuevoEvento =>
    evento("pactoNoAceptado", { comunidad }, {
      tipo: "pacto",
      enlace: `/pactos?comunidad=${idComunidad}`,
      notificacion: true,
      clave: `pacto-no-aceptado:${idComunidad}:${propuestaId}`,
    }),
  propusisteCambioDePacto: (comunidad: string, idComunidad: string): NuevoEvento =>
    evento("propusisteCambioDePacto", { comunidad }, { tipo: "pacto", enlace: `/pactos?comunidad=${idComunidad}` }),
  cambioDePactoAceptado: (comunidad: string, idComunidad: string, version: number): NuevoEvento =>
    evento("cambioDePactoAceptado", { comunidad }, {
      tipo: "pacto-aceptado",
      enlace: `/pactos?comunidad=${idComunidad}`,
      notificacion: true,
      clave: `cambio-pacto-aceptado:${idComunidad}:${version}`,
    }),
  cambioDePactoRechazado: (comunidad: string, idComunidad: string): NuevoEvento =>
    evento("cambioDePactoRechazado", { comunidad }, {
      tipo: "pacto",
      enlace: `/pactos?comunidad=${idComunidad}`,
      notificacion: true,
    }),
  rondaAbierta: (comunidad: string, idComunidad: string): NuevoEvento =>
    evento("rondaAbierta", { comunidad }, {
      tipo: "ronda-abierta",
      enlace: `/semillas?comunidad=${idComunidad}`,
      notificacion: true,
      clave: `ronda-abierta:${idComunidad}`,
    }),
  publicasteEnMercado: (descripcion: string): NuevoEvento =>
    evento("publicasteEnMercado", { descripcion }, { tipo: "mercado", enlace: "/compromisos" }),
  interesEnOferta: (idCompromiso: string): NuevoEvento =>
    evento("interesEnOferta", {}, {
      tipo: "interes-oferta",
      enlace: "/compromisos",
      notificacion: true,
      demoraSegundos: DEMORA_INTERES_SEGUNDOS,
      clave: `interes-oferta:${idCompromiso}`,
    }),
  /** Con el nombre vacío el texto dice "tu comunidad" / "your community". */
  enviastePostulacion: (comunidad: string): NuevoEvento =>
    evento("enviastePostulacion", { comunidad }, { tipo: "postulacion", enlace: "/tribus" }),
  postulacionRecibida: (idPostulacion: string): NuevoEvento =>
    evento("postulacionRecibida", {}, {
      tipo: "postulacion-recibida",
      enlace: "/tribus",
      notificacion: true,
      clave: `postulacion-recibida:${idPostulacion}`,
    }),
  registrasteTicket: (): NuevoEvento => evento("registrasteTicket", {}, { tipo: "ticket", enlace: "/congreso" }),
  enviasteRonda: (comunidad: string, idComunidad: string): NuevoEvento =>
    evento("enviasteRonda", { comunidad }, { tipo: "ronda-enviada", enlace: `/semillas?comunidad=${idComunidad}` }),
};
