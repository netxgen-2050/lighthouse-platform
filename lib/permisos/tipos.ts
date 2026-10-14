export type Plan = "explorador" | "miembro";
export type Pase = "semilla" | "brote" | "raiz";

/** Estado de una persona: las cinco fuentes de la nota 18 §3. */
export interface Persona {
  plan: Plan;
  pase: Pase | null;
  /** Ids de las tribus donde la persona fue aceptada. */
  tribus: string[];
  presenciaGenesis: boolean;
  residente: boolean;
}

export type Puerta =
  | "mapa-tribus-eventos"
  | "registrar-ticket"
  | "foros-red"
  | "sala-tribu"
  | "canal-fundadores"
  | "voz-tribu"
  | "voz-fondo-comun"
  | "voto-asamblea-residentes"
  | "voto-fideicomiso"
  | "creditos";

export type Motivo = "plan" | "pase" | "tribu" | "presencia" | "rol";

export type Grado =
  | "abierta"
  | "visita"
  | "completa"
  | "segun estatuto"
  | "1 voz"
  | "1 persona = 1 voto";

/** Columnas de la tabla de la nota 18 §3. */
export type Columna =
  | "explorador"
  | "miembro"
  | "pase"
  | "tribu"
  | "presencia"
  | "residente";

/** Una celda con contenido (las celdas "—" son null en la tabla). */
export interface Celda {
  grado: Grado;
  /** Solo vale para las tribus donde la persona fue aceptada. */
  soloSuTribu?: boolean;
  /** No abre la puerta por sí sola: solo refuerza (presencia en el Fondo Común). */
  soloRefuerzo?: boolean;
}

export type Refuerzo = "a decidir";

export interface Resultado {
  abierta: boolean;
  grado: Grado | null;
  motivos: Motivo[];
  /** Tribus donde rige la celda "su tribu" (sala-tribu y voz-tribu). */
  tribusPropias?: string[];
  /** Refuerzo de la voz por presencia: nunca un número hasta que se decida. */
  refuerzoPresencia?: Refuerzo;
}
