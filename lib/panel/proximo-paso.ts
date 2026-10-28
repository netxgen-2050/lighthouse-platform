import { esCodigoValido } from "@/lib/congreso/ticket";
import { CLAVES } from "@/lib/demo/claves";
import { recorrido } from "@/lib/idioma/textos/recorrido";
import type { Idioma } from "@/lib/idioma/tipos";
import { leer as leerMembresia } from "@/lib/membresia/estado";
import { leer as leerPactos } from "@/lib/pactos/estado";
import { basicosCompletos, cargarPerfil } from "@/lib/perfil/modelo";
import { leerKyc } from "@/lib/pasaporte/kyc";

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

/** A dónde lleva cada paso (el texto sale del diccionario `recorrido`). */
const HREF_DEL_PASO: Record<ClavePaso, string> = {
  perfil: "/perfil",
  comunidad: "/tribus",
  pacto: "/pactos",
  identidad: "/pasaporte",
  ticket: "/congreso",
};

function paso(clave: ClavePaso, idioma: Idioma): ProximoPaso {
  return { clave, ...recorrido[idioma].pasos[clave], href: HREF_DEL_PASO[clave] };
}

/** El único próximo paso, en este orden y en el idioma pedido. null si no falta nada. */
export function proximoPaso(p: Progreso, idioma: Idioma = "es"): ProximoPaso | null {
  if (!p.perfilCompleto) return paso("perfil", idioma);
  if (!p.adhirioAComunidad) return paso("comunidad", idioma);
  if (!p.propusoPacto) return paso("pacto", idioma);
  if (p.quiereInvertir && !p.identidadVerificada) return paso("identidad", idioma);
  if (!p.tieneTicket) return paso("ticket", idioma);
  return null;
}

/**
 * Lee el progreso del navegador. Deja pasar los errores del almacenamiento para que la pantalla
 * los muestre (no se confunde "no se pudo leer" con "no hizo nada").
 * El perfil se lee del modelo nuevo (o de la entrevista vieja, migrada). "Quiere invertir" = inició el
 * KYC del Pasaporte; la identidad está verificada cuando el KYC fue aprobado.
 */
export function leerProgreso(leer: (clave: string) => string | null): Progreso {
  const perfil = cargarPerfil(leer(CLAVES.perfilDatos), leer(CLAVES.perfil));
  const kyc = leerKyc(leer(CLAVES.kyc));
  const pactos = leerPactos(leer(CLAVES.pactos));
  const membresia = leerMembresia(leer(CLAVES.membresia));
  const crudoTicket = leer(CLAVES.congreso);
  return {
    perfilCompleto: basicosCompletos(perfil),
    adhirioAComunidad: Object.keys(membresia).length > 0,
    propusoPacto: Object.values(pactos.comunidades).some((c) => c.tiempo.paso >= 1 || c.aportes.length > 0),
    quiereInvertir: kyc.estado !== "sin-tramite",
    identidadVerificada: kyc.estado === "aprobado",
    tieneTicket: crudoTicket !== null && esCodigoValido(crudoTicket),
  };
}
