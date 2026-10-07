// Datos que la persona carga en "Tus datos". Simulado: se guardan solo en este navegador, sin KYC real.
// Todo es opcional hasta que la persona lo completa: lo que falta no se inventa.
export type Nacionalidad = "argentina" | "otra";
export type Residencia = "argentina" | "exterior";
export type TipoInversor = "calificado" | "no-calificado";
export type Modalidad = "obra" | "remoto";

export type DatosPersona = {
  nacionalidad?: Nacionalidad;
  /** País, cuando la nacionalidad no es argentina. */
  paisNacionalidad?: string;
  residencia?: Residencia;
  /** País, cuando la residencia fiscal es en el exterior. */
  paisResidencia?: string;
  origenFondos?: string;
  inversor?: TipoInversor;
  modalidad?: Modalidad;
  /** Horas de obra por mes. */
  horas?: number;
};

export const DATOS_VACIOS: DatosPersona = {};

const MAX_TEXTO = 120;
const MAX_HORAS = 744;

function texto(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim().slice(0, MAX_TEXTO);
  return t === "" ? undefined : t;
}

/** Lee lo guardado; cualquier valor raro se descarta campo por campo. */
export function leerDatos(crudo: string | null): DatosPersona {
  if (!crudo) return DATOS_VACIOS;
  try {
    const o = JSON.parse(crudo) as Record<string, unknown>;
    if (typeof o !== "object" || o === null) return DATOS_VACIOS;
    const horas = typeof o.horas === "number" && Number.isFinite(o.horas) && o.horas >= 0 && o.horas <= MAX_HORAS ? Math.round(o.horas) : undefined;
    return {
      nacionalidad: o.nacionalidad === "argentina" || o.nacionalidad === "otra" ? o.nacionalidad : undefined,
      paisNacionalidad: texto(o.paisNacionalidad),
      residencia: o.residencia === "argentina" || o.residencia === "exterior" ? o.residencia : undefined,
      paisResidencia: texto(o.paisResidencia),
      origenFondos: texto(o.origenFondos),
      inversor: o.inversor === "calificado" || o.inversor === "no-calificado" ? o.inversor : undefined,
      modalidad: o.modalidad === "obra" || o.modalidad === "remoto" ? o.modalidad : undefined,
      horas,
    };
  } catch {
    return DATOS_VACIOS;
  }
}

export function hayDatos(d: DatosPersona): boolean {
  return Object.values(d).some((v) => v !== undefined);
}
