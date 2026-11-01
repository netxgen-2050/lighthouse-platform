// Principios propios de una tribu (cambio `manifiesto-lighthouse-vrn`, design §5). Una tribu SUMA principios a los de
// Lighthouse VRN: nunca los contradice, afloja ni reemplaza. El modelo no tiene forma de quitar o editar un principio
// de Lighthouse VRN, así que lo único que se puede expresar mal es una excepción o un id pisado, y las dos se
// rechazan acá. La revisión de fondo (si un texto contradice en los hechos) la hace el común en el Fogón.
import type { BilingueConOriginal } from "@/lib/idioma/tipos";
import { principioVrnPorId, type PrincipioId } from "./lighthouse-vrn";

export type PrincipioDeTribu = {
  id: string;
  nombre: BilingueConOriginal;
  practica: BilingueConOriginal;
  /** Qué principios de Lighthouse VRN cuida más (puede ir vacío). */
  profundiza: PrincipioId[];
  /** Existe solo para poder rechazarlo: una tribu no puede exceptuarse de un principio de Lighthouse VRN. */
  excepcionA?: PrincipioId;
};

export type ErrorPrincipio = "id-de-vrn" | "contradice" | "profundiza-inexistente" | "texto-vacio" | "id-repetido";

export type ResultadoValidacion = { ok: true } | { ok: false; errores: { id: string; error: ErrorPrincipio }[] };

/** Cómo se muestra cada motivo. */
export const TEXTO_ERROR_PRINCIPIO: Record<ErrorPrincipio, string> = {
  "id-de-vrn": "usa el id de un principio de Lighthouse VRN",
  contradice: "contradice un principio de Lighthouse VRN",
  "profundiza-inexistente": "cita un principio de Lighthouse VRN que no existe",
  "texto-vacio": "tiene un texto vacío",
  "id-repetido": "repite el id de otro principio de la tribu",
};

const vacio = (t: BilingueConOriginal) => t.es.trim() === "" || (t.en ?? "").trim() === "";

export function validarPrincipiosDeTribu(lista: PrincipioDeTribu[]): ResultadoValidacion {
  const errores: { id: string; error: ErrorPrincipio }[] = [];
  const vistos = new Set<string>();
  for (const x of lista) {
    if (principioVrnPorId(x.id)) errores.push({ id: x.id, error: "id-de-vrn" });
    if (vistos.has(x.id)) errores.push({ id: x.id, error: "id-repetido" });
    vistos.add(x.id);
    if (x.excepcionA !== undefined) errores.push({ id: x.id, error: "contradice" });
    if (x.profundiza.some((p) => !principioVrnPorId(p))) errores.push({ id: x.id, error: "profundiza-inexistente" });
    if (vacio(x.nombre) || vacio(x.practica)) errores.push({ id: x.id, error: "texto-vacio" });
  }
  return errores.length === 0 ? { ok: true } : { ok: false, errores };
}
