import {
  MAX_BIENES,
  MAX_DESCRIPCION,
  MAX_HORAS,
  MIN_HORAS,
  type Borrador,
  type Compromiso,
} from "./tipos";

export type CampoError = "descripcion" | "horas" | "bienes";

export type ResultadoValidar =
  | { ok: true; compromiso: Compromiso }
  | { ok: false; errores: Partial<Record<CampoError, string>> };

export function validarCompromiso(
  b: Borrador,
  id: string = crypto.randomUUID(),
  ahora: Date = new Date(),
): ResultadoValidar {
  const errores: Partial<Record<CampoError, string>> = {};
  const descripcion = b.descripcion.trim();
  if (descripcion.length === 0) {
    errores.descripcion = "Escribí una descripción.";
  } else if (descripcion.length > MAX_DESCRIPCION) {
    errores.descripcion = `La descripción puede tener hasta ${MAX_DESCRIPCION} caracteres.`;
  }

  let horasPorMes: number | undefined;
  let cantidadBienes: string | undefined;

  if (b.clase === "tiempo") {
    const t = b.horas.trim();
    if (t !== "") {
      const n = /^\d+$/.test(t) ? Number(t) : NaN;
      if (!Number.isInteger(n) || n < MIN_HORAS || n > MAX_HORAS) {
        errores.horas = `Las horas por mes son un número entero entre ${MIN_HORAS} y ${MAX_HORAS}, o dejalo vacío.`;
      } else {
        horasPorMes = n;
      }
    }
  } else {
    const t = b.bienes.trim();
    if (t.length > MAX_BIENES) {
      errores.bienes = `La cantidad puede tener hasta ${MAX_BIENES} caracteres.`;
    } else if (t !== "") {
      cantidadBienes = t;
    }
  }

  if (Object.keys(errores).length > 0) return { ok: false, errores };

  const compromiso: Compromiso = {
    id,
    tipo: b.tipo,
    clase: b.clase,
    descripcion,
    para: b.para,
    creado: ahora.toISOString(),
  };
  if (horasPorMes !== undefined) compromiso.horasPorMes = horasPorMes;
  if (cantidadBienes !== undefined) compromiso.cantidadBienes = cantidadBienes;
  return { ok: true, compromiso };
}
