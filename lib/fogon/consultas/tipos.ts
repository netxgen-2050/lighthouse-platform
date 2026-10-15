import type { Agregado, Reparto } from "@/lib/cuadratico/motor";

export type Modo = "prioridades" | "presupuesto";
export type AmbitoConsulta = "equipo" | "tribu" | "asamblea";
export type ReglaVoto = "abierto" | "secreto";
export type CuandoSeVe = "al-votar" | "al-cierre";
export type Estado = "abierta" | "cerrada";

export type OpcionConsulta = {
  id: string;
  etiqueta: string;
  /** Lo que la opción pide, en centavos (modo presupuesto). */
  topeCentavos?: number;
  pisoCentavos?: number;
};

export type Consulta = {
  /** Slug de la consulta ("u1"…). */
  id: string;
  titulo: string;
  descripcion: string;
  modo: Modo;
  ambito: AmbitoConsulta;
  /** Fecha de cierre (ISO con huso). */
  cierre: string;
  votosEnContra: boolean;
  resultadoVisible: CuandoSeVe;
  voto: ReglaVoto;
  presupuesto?: {
    /** `null` = sin dato (el monto no está cargado). */
    montoCentavos: number | null;
    moneda: "USD" | "ARS";
    /** Texto que acompaña al monto. */
    nota: string | null;
  };
  opciones: OpcionConsulta[];
};

/** Una persona del padrón. En el navegador, "Persona de ejemplo N" y "Vos". */
export type Persona = { id: string; nombre: string };

export const ETIQUETA_MODO: Record<Modo, string> = { prioridades: "Prioridades", presupuesto: "Presupuesto" };
export const ETIQUETA_AMBITO: Record<AmbitoConsulta, string> = { equipo: "Equipo", tribu: "Tribu", asamblea: "Asamblea" };
export const ETIQUETA_VOTO: Record<ReglaVoto, string> = { abierto: "Voto abierto", secreto: "Voto secreto" };
export const ETIQUETA_ESTADO: Record<Estado, string> = { abierta: "Abierta", cerrada: "Cerrada" };

export type Participantes = { repartieron: number; padron: number };

export type ResumenConsulta = {
  consulta: Consulta;
  estado: Estado;
  yaReparti: boolean;
  /** `null` = sin dato. */
  participantes: Participantes | null;
};

export type ResultadoVista =
  | { visible: true; agregado: Agregado; participantes: Participantes | null }
  | { visible: false; participantes: Participantes | null };

export type PadronVista = {
  /** Personas del padrón que todavía no repartieron (con al menos un voto). */
  faltan: Persona[];
  /** Personas que faltan votar y todavía no aceptaron la política (no se nombran). */
  sinAceptar: number;
  /** Quién repartió cómo; `null` mientras el resultado no es visible. */
  repartos: { persona: Persona; reparto: Reparto; propio: boolean }[] | null;
};

export type VistaConsulta = {
  consulta: Consulta;
  estado: Estado;
  /** Si la persona puede cerrar la consulta (en el navegador, toda consulta abierta: es una simulación). */
  puedeCerrar: boolean;
  /** Cerrada a mano (no por fecha): se puede volver a abrir en la demo. */
  cierreManual: boolean;
  miReparto: Reparto | null;
  resultado: ResultadoVista;
  /** `null` con voto secreto: nadie ve repartos ajenos ni quién falta. */
  padron: PadronVista | null;
};
