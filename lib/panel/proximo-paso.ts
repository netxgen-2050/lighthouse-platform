import { esCodigoValido } from "@/lib/congreso/ticket";
import { CLAVES } from "@/lib/demo/claves";
import { leer as leerMembresia } from "@/lib/membresia/estado";
import { leer as leerPactos } from "@/lib/pactos/estado";
import { cantidadConfirmados, leerGuardado } from "@/lib/perfil/estado";
import { CHATS } from "@/lib/perfil/preguntas";

export type ClavePaso = "perfil" | "comunidad" | "pacto" | "identidad" | "ticket";

export type Progreso = {
  perfilCompleto: boolean;
  adhirioAComunidad: boolean;
  propusoPacto: boolean;
  /** Quiere invertir (todavía no hay forma de saberlo en el prototipo: ver `leerProgreso`). */
  quiereInvertir: boolean;
  identidadVerificada: boolean;
  tieneTicket: boolean;
};

export type ProximoPaso = { clave: ClavePaso; titulo: string; detalle: string; boton: string; href: string };

const PASOS: Record<ClavePaso, ProximoPaso> = {
  perfil: {
    clave: "perfil",
    titulo: "Completá tu perfil",
    detalle: "Terminá la entrevista y confirmá tus datos para que podamos orientarte.",
    boton: "Completar mi perfil",
    href: "/perfil",
  },
  comunidad: {
    clave: "comunidad",
    titulo: "Adherí a una comunidad",
    detalle: "Leé el manifiesto de una comunidad y adherí si te representa.",
    boton: "Ver comunidades",
    href: "/tribus",
  },
  pacto: {
    clave: "pacto",
    titulo: "Proponé un pacto",
    detalle: "Contá qué vas a aportar a tu comunidad.",
    boton: "Proponer un pacto",
    href: "/pactos",
  },
  identidad: {
    clave: "identidad",
    titulo: "Verificá tu identidad",
    detalle: "Hace falta para invertir.",
    boton: "Verificar mi identidad",
    href: "/pasaporte",
  },
  ticket: {
    clave: "ticket",
    titulo: "Registrá tu ticket del Congreso",
    detalle: "Cargá el código de tu ticket.",
    boton: "Registrar mi ticket",
    href: "/congreso",
  },
};

/** El único próximo paso, en este orden. null si no falta nada. */
export function proximoPaso(p: Progreso): ProximoPaso | null {
  if (!p.perfilCompleto) return PASOS.perfil;
  if (!p.adhirioAComunidad) return PASOS.comunidad;
  if (!p.propusoPacto) return PASOS.pacto;
  if (p.quiereInvertir && !p.identidadVerificada) return PASOS.identidad;
  if (!p.tieneTicket) return PASOS.ticket;
  return null;
}

/**
 * Lee el progreso del navegador. Deja pasar los errores del almacenamiento para que la pantalla
 * los muestre (no se confunde "no se pudo leer" con "no hizo nada").
 * Pendiente (cambio `pasaporte-sellos`): hasta que exista el sello de identidad y una forma de saber
 * si la persona quiere invertir, `quiereInvertir` es false y el paso de identidad no aparece.
 */
export function leerProgreso(leer: (clave: string) => string | null): Progreso {
  const perfil = leerGuardado(leer(CLAVES.perfil));
  const pactos = leerPactos(leer(CLAVES.pactos));
  const membresia = leerMembresia(leer(CLAVES.membresia));
  const crudoTicket = leer(CLAVES.congreso);
  return {
    perfilCompleto: perfil.items.length > 0 && cantidadConfirmados(perfil) >= CHATS.length,
    adhirioAComunidad: Object.keys(membresia).length > 0,
    propusoPacto: Object.values(pactos.comunidades).some((c) => c.tiempo.paso >= 1 || c.aportes.length > 0),
    quiereInvertir: false,
    identidadVerificada: false,
    tieneTicket: crudoTicket !== null && esCodigoValido(crudoTicket),
  };
}
