// Verificación de identidad (KYC) simulada. Todo queda solo en este navegador:
// no se verifica ningún documento y en la versión real lo hace el fiduciario.
import { textos } from "@/lib/idioma/textos";
import type { Idioma } from "@/lib/idioma/tipos";
import type { Nacionalidad, Residencia, TipoInversor, DatosPersona } from "./datos";

/** Estado guardado del trámite. Sin trámite no hay nada guardado. */
export type EstadoKyc =
  | { estado: "sin-tramite" }
  | { estado: "en-tramite"; enviado: string }
  | { estado: "aprobado"; enviado: string; aprobado: string };

export const KYC_VACIO: EstadoKyc = { estado: "sin-tramite" };

/** Lo que la persona escribe en el diálogo. Los datos personales (paso 1) no se guardan. */
export type BorradorKyc = {
  nombre: string;
  documento: string;
  nacimiento: string;
  nacionalidad: Nacionalidad | "";
  paisNacionalidad: string;
  residencia: Residencia | "";
  paisResidencia: string;
  origenFondos: string;
  inversor: TipoInversor | "";
};

export const BORRADOR_VACIO: BorradorKyc = {
  nombre: "",
  documento: "",
  nacimiento: "",
  nacionalidad: "",
  paisNacionalidad: "",
  residencia: "",
  paisResidencia: "",
  origenFondos: "",
  inversor: "",
};

/** Los cinco pasos del diálogo, en español. En otro idioma: `textos("pasaporte", idioma).kyc.pasos`. */
export const PASOS_KYC: readonly string[] = textos("pasaporte", "es").kyc.pasos;

export const MAX_TEXTO = 120;
export const EDAD_MINIMA = 18;

export type ErroresKyc = Partial<Record<keyof BorradorKyc, string>>;

function esFechaValida(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso ? null : d;
}

/** Edad cumplida en años a la fecha `hoy` (ambas en UTC, por día). */
export function edadEn(nacimiento: Date, hoy: Date): number {
  let edad = hoy.getUTCFullYear() - nacimiento.getUTCFullYear();
  const antes =
    hoy.getUTCMonth() < nacimiento.getUTCMonth() ||
    (hoy.getUTCMonth() === nacimiento.getUTCMonth() && hoy.getUTCDate() < nacimiento.getUTCDate());
  if (antes) edad -= 1;
  return edad;
}

/** Errores de un paso (1 a 5), en el idioma pedido. Paso 5 revisa todo. Vacío = el paso es válido. */
export function validarPaso(paso: number, b: BorradorKyc, hoy: Date = new Date(), idioma: Idioma = "es"): ErroresKyc {
  const m = textos("pasaporte", idioma).kyc.errores;
  const e: ErroresKyc = {};
  if (paso === 1 || paso === 5) {
    if (b.nombre.trim().length < 2) e.nombre = m.nombre;
    if (!/^[A-Za-z0-9]{6,12}$/.test(b.documento.trim())) e.documento = m.documento;
    const f = esFechaValida(b.nacimiento);
    if (!f) e.nacimiento = m.nacimiento;
    else if (f.getTime() > hoy.getTime() || edadEn(f, hoy) < EDAD_MINIMA) e.nacimiento = m.mayor(EDAD_MINIMA);
  }
  if (paso === 2 || paso === 5) {
    if (b.nacionalidad === "") e.nacionalidad = m.nacionalidad;
    else if (b.nacionalidad === "otra" && b.paisNacionalidad.trim() === "") e.paisNacionalidad = m.paisNacionalidad;
    if (b.residencia === "") e.residencia = m.residencia;
    else if (b.residencia === "exterior" && b.paisResidencia.trim() === "") e.paisResidencia = m.paisResidencia;
  }
  if (paso === 3 || paso === 5) {
    if (b.origenFondos.trim() === "") e.origenFondos = m.origenFondos;
  }
  if (paso === 4 || paso === 5) {
    if (b.inversor === "") e.inversor = m.inversor;
  }
  return e;
}

/** Lo que se guarda en "Tus datos" (lo que ya leen Pactos, Semillas y Fogón) al enviar. */
export function datosDesdeBorrador(b: BorradorKyc, previos: DatosPersona): DatosPersona {
  const corto = (t: string) => {
    const x = t.trim().slice(0, MAX_TEXTO);
    return x === "" ? undefined : x;
  };
  return {
    ...previos,
    nacionalidad: b.nacionalidad === "" ? undefined : b.nacionalidad,
    paisNacionalidad: b.nacionalidad === "otra" ? corto(b.paisNacionalidad) : undefined,
    residencia: b.residencia === "" ? undefined : b.residencia,
    paisResidencia: b.residencia === "exterior" ? corto(b.paisResidencia) : undefined,
    origenFondos: corto(b.origenFondos),
    inversor: b.inversor === "" ? undefined : b.inversor,
  };
}

export function enviarKyc(ahora: Date): EstadoKyc {
  return { estado: "en-tramite", enviado: ahora.toISOString() };
}

/** La aprobación simulada solo vale si hay un trámite en curso. */
export function aprobarKyc(e: EstadoKyc, ahora: Date): EstadoKyc {
  return e.estado === "en-tramite" ? { estado: "aprobado", enviado: e.enviado, aprobado: ahora.toISOString() } : e;
}

function fechaIso(v: unknown): string | null {
  return typeof v === "string" && !Number.isNaN(Date.parse(v)) ? v : null;
}

/** Lee lo guardado; cualquier cosa rara vuelve a "sin trámite". */
export function leerKyc(crudo: string | null): EstadoKyc {
  if (!crudo) return KYC_VACIO;
  try {
    const o = JSON.parse(crudo) as Record<string, unknown>;
    if (typeof o !== "object" || o === null) return KYC_VACIO;
    const enviado = fechaIso(o.enviado);
    if (!enviado) return KYC_VACIO;
    if (o.estado === "en-tramite") return { estado: "en-tramite", enviado };
    const aprobado = fechaIso(o.aprobado);
    if (o.estado === "aprobado" && aprobado) return { estado: "aprobado", enviado, aprobado };
    return KYC_VACIO;
  } catch {
    return KYC_VACIO;
  }
}

/** Lee el trámite guardado en el navegador. Sin acceso al almacenamiento: sin trámite. */
export function leerKycDelNavegador(clave: string): EstadoKyc {
  try {
    return leerKyc(window.localStorage.getItem(clave));
  } catch {
    return KYC_VACIO;
  }
}

/** Fecha para mostrar: "9 de octubre de 2026" en español (sin depender del locale del entorno) o "October 9, 2026" en inglés. */
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function fechaLarga(iso: string, idioma: Idioma = "es"): string {
  const d = new Date(iso);
  // Hora local de la persona: de noche en Argentina, UTC ya es el día siguiente.
  if (idioma === "en") return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
}
