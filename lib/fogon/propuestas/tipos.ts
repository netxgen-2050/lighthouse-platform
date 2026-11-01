// Tipos de las propuestas del Fogón (fogon-propuestas). Módulo puro: sin React, sin red, sin `lib/permisos/` ni `lib/sesion/`.

/** Un texto de ejemplo en los dos idiomas. */
export type Bi = { es: string; en: string };

export type Recorrido = "simple" | "importante";

export type Fase =
  | "borrador"
  | "presentacion"
  | "preguntas"
  | "discusion"
  | "concerns"
  | "resolver"
  | "llamado"
  | "objetar"
  | "cierre";

/** Cuánto implica la decisión a una persona (A3). La persona del navegador simula uno de estos. */
export type NivelImplicacion = "visita" | "red" | "comun" | "ambito" | "afectada" | "proceso" | "presenta";

/** Las 15 acciones de la matriz del boceto. */
export type AccionMatriz =
  | "leer-propuesta"
  | "leer-discusion"
  | "preguntar"
  | "comentar"
  | "levantar-concern"
  | "sumarse-concern"
  | "proponer-resolucion"
  | "editar"
  | "pasar-fase"
  | "hacerse-a-un-lado"
  | "bloquear"
  | "decidir-legitimidad"
  | "derivar-o-pausar"
  | "escribir-acta"
  | "recibir-avisos";

/** Acciones de proceso que no están en la matriz del boceto. */
export type AccionDeProceso =
  | "declararse-afectada"
  | "objetar-afectada"
  | "pedir-recorrido-importante"
  | "evaluar"
  | "agrupar-concerns"
  | "sacar-propio-del-grupo"
  | "sugerir-mecanismo"
  | "acusar-conformidad"
  | "marcar-urgente"
  | "respaldar-urgencia"
  | "objetar-urgencia"
  | "abrir-revision";

export type Accion = AccionMatriz | AccionDeProceso;

export type Condicion =
  | "solo-comun"
  | "solo-forma"
  | "quien-facilita"
  | "solo-como-miembro"
  | "por-consenso-del-grupo"
  | "participa-en-la-discusion"
  | "facilita-nunca-decide"
  | "con-acuerdo-del-grupo"
  | "lo-propone"
  | "rol-memoria"
  | "si-se-suscribe";

export type Celda = "si" | "no" | { condicion: Condicion };

export type PrincipioId =
  | "vida-en-el-centro"
  | "derechos-madre-tierra"
  | "tierra-no-mercancia"
  | "suelo-vivo"
  | "agua-viva"
  | "aire-limpio"
  | "biodiversidad"
  | "nada-se-tira"
  | "recursos-con-medida"
  | "generaciones-futuras"
  | "voz-afectada"
  | "subsidiariedad"
  | "cuidado-del-proceso"
  | "poder-compartido"
  | "plata-vuelve-a-la-tierra"
  | "personas-deciden";

export type TipoRegistro =
  | "pregunta"
  | "respuesta"
  | "comentario"
  | "concern"
  | "sumarse"
  | "retiro"
  | "agrupar"
  | "resolucion"
  | "mecanismo"
  | "version"
  | "fase"
  | "recorrido"
  | "afectada"
  | "objecion-afectada"
  | "a-un-lado"
  | "bloqueo"
  | "legitimidad"
  | "acuse"
  | "ambito-consejo"
  | "urgencia"
  | "respaldo-urgencia"
  | "revision"
  | "cierre"
  | "acta"
  | "evaluacion";

/** Forma de constancia (ADR-012), de solo agregar. Siempre de una persona; nunca de Hifa ni del Guardián. */
export type Registro = {
  id: string;
  propuestaId: string;
  version: number;
  /** Id de la persona ("vos" es la persona del navegador). */
  quien: string;
  /** Nivel simulado con el que actuó. En la base lo calcularía el servidor (ADR-022). */
  nivel: NivelImplicacion;
  /** ISO. */
  cuando: string;
  /** Id de otro registro o de una sugerencia del Guardián o de Hifa. */
  apuntaA?: string;
  tipo: TipoRegistro;
  texto?: Bi | string;
  principio?: PrincipioId;
  sinNombre?: boolean;
  datos?: Record<string, string | number | boolean>;
  /** Persona que confirmó una propuesta de Hifa. */
  confirmadoPor?: string;
  simulado: true;
};

export type PersonaEjemplo = { id: string; nombre: Bi };

export type Mecanismo = "cuadratico" | "puntos" | "conviccion" | "otro";

export type SugerenciaGuardian = {
  id: string;
  /** En qué fase aparece; siempre antes de "llamado" o dentro de "objetar". */
  fase: Fase;
  tipo: "posible-impacto" | "posible-ilegitimidad" | "posible-no-urgente" | "posible-no-reversible";
  principio?: PrincipioId;
  /** `decisionId` de una propuesta ya adoptada. */
  decisionPrevia?: string;
  /** Id del registro `urgencia` que cita. */
  urgencia?: string;
  texto: Bi;
};

export type GuionHifa = {
  resumen: Bi;
  agrupaciones: { nombre: Bi; concerns: string[] }[];
  mecanismo?: { mecanismo: Mecanismo; fin: Bi; porque: Bi };
};

export type Propuesta = {
  decisionId: string;
  recorrido: Recorrido;
  /** Nodo de la holarquía que decide; null si no existe en la de ejemplo. */
  holonId: string | null;
  presenta: { personaId: string; desde: Bi };
  problema: Bi;
  propone: Bi;
  /** AAAA-MM-DD: empieza la primera fase con plazo. */
  inicio: string;
  materia?: "tierra" | "reglas" | "manifiesto";
  tema?: "cuidado-conflicto";
  principios: PrincipioId[];
  /** En el consejo se ignora: sale de `ambitoConsejo`. */
  tamanoAmbito: number | null;
  ambitoConsejo?: { personas: string[] };
  plata: { pide: false } | { pide: true };
  personas: PersonaEjemplo[];
  registros: Registro[];
  guion: { hifa: GuionHifa; guardian: SugerenciaGuardian[] };
};

// ---- Estado derivado ----

export type EstadoConcern =
  | "abierto"
  | "agrupado"
  | "resolviendo"
  | "resuelto"
  | "retirado"
  | "a-un-lado"
  | "bloqueo";

export type ConcernVista = {
  id: string;
  /** concern común o bloqueo (con razón y principio). */
  clase: "concern" | "bloqueo";
  quien: string;
  nivel: NivelImplicacion;
  version: number;
  razon: Bi | string;
  principio?: PrincipioId;
  sinNombre: boolean;
  /** Discute la urgencia, no el contenido: no cuenta como oposición. */
  sobreUrgencia: boolean;
  estado: EstadoConcern;
  grupoId?: string;
  sumados: string[];
  apuntaA?: string;
  /** Un bloqueo que el grupo no consideró legítimo vuelve a verse como concern abierto. */
  bloqueoNoLegitimo: boolean;
  /** Solo en bloqueos: true / false / null (pendiente). */
  legitimo: boolean | null;
};

export type GrupoVista = { id: string; nombre: string; concerns: ConcernVista[]; autoras: string[] };

export type AcuseVista = {
  id: string;
  quien: string;
  nivel: NivelImplicacion;
  version: number;
  /** Vale para la versión vigente. */
  vigente: boolean;
  /** Se ve "reemplazado por un concern". */
  reemplazadoPorConcern: boolean;
};

export type MecanismoVista = {
  id: string;
  quien: string;
  mecanismo: Mecanismo;
  nombre?: string;
  fin: string;
  apuntaA?: string;
};

export type SugerenciaVista = SugerenciaGuardian & { respaldos: string[]; estado: "sin-respaldo" | "respaldada" };

export type EstadoUrgencia = "pedida" | "validada" | "caida";

export type UrgenciaVista = {
  id: string;
  quien: string;
  datos: Record<string, string | number | boolean>;
  estado: EstadoUrgencia;
  respaldos: string[];
  faltan: number;
};

export type Resultado =
  | { tipo: "consenso"; conLadoA: string[] }
  | { tipo: "bloqueada" }
  | { tipo: "sin-consenso" }
  | { tipo: "adoptada"; motivo: "nadie-objeto" }
  | {
      tipo: "pausada";
      motivo: "sin-consenso" | "concern-abierto" | "participacion-minima" | "sin-nivel-de-arriba" | "revision-sin-consenso";
    }
  | { tipo: "sube"; a: string | null }
  | { tipo: "provisoria"; revisarAntesDe: string; concernsQueObligan: string[]; enRevision: boolean };

export type FaseVista = { fase: Fase; desde: string; vence: string; hecha: boolean; actual: boolean };

export type ItemHistorial = {
  id: string;
  cuando: string;
  quien: string;
  tipo: TipoRegistro | "ignorado";
  /** Clave corta para elegir el texto; vacía si no hace falta. */
  clave?: string;
  datos?: Record<string, string | number | boolean>;
};

export type EstadoPropuesta = {
  fase: Fase;
  recorrido: Recorrido;
  version: number;
  fases: FaseVista[];
  /** AAAA-MM-DD en que vence la propuesta entera. */
  vence: string;
  concerns: ConcernVista[];
  grupos: GrupoVista[];
  mecanismos: MecanismoVista[];
  sugerenciasGuardian: SugerenciaVista[];
  acuses: AcuseVista[];
  participacion: { cuenta: number; acuses: number; minimo: number | null; falta: number | null };
  tamanoAmbito: number | null;
  ambitoConsejo: { personas: string[]; definidoPor: "board-netxgen" | "superadmin-en-nombre-del-board" } | null;
  urgencia: UrgenciaVista | null;
  afectadas: { quien: string; motivo: string; vigente: boolean }[];
  resultado: Resultado | null;
  /** Personas que se hicieron a un lado, con su razón. */
  aUnLado: { quien: string; razon: Bi | string }[];
  historial: ItemHistorial[];
};
