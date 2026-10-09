import { cargar } from "@/lib/compromisos/estado";
import { esCodigoValido, normalizarCodigo } from "@/lib/congreso/ticket";
import { basicosCompletos, cargarPerfil, datosCompletos, perfilVacio, TOTAL_DATOS } from "@/lib/perfil/modelo";
import { CLAVES } from "./claves";

export type Paso = "perfil" | "compromisos" | "congreso";

export type ResumenDemo = {
  /** null = no hay dato guardado (nunca 0 inventado). */
  perfil: { completos: number; total: number; basicos: boolean } | null;
  compromisos: { ofrezco: number; necesito: number } | null;
  ticket: string | null;
  /** Primer paso que falta; null si no falta nada. */
  proximo: Paso | null;
};

export function resumirDemo(leer: (clave: string) => string | null): ResumenDemo {
  // El perfil nuevo; si no hay, lo migrado de la entrevista anterior.
  const datos = cargarPerfil(leer(CLAVES.perfilDatos), leer(CLAVES.perfil));
  const perfil = perfilVacio(datos)
    ? null
    : { completos: datosCompletos(datos), total: TOTAL_DATOS, basicos: basicosCompletos(datos) };

  const lista = cargar(leer(CLAVES.compromisos));
  const compromisos =
    lista.length === 0
      ? null
      : {
          ofrezco: lista.filter((c) => c.tipo === "ofrezco").length,
          necesito: lista.filter((c) => c.tipo === "necesito").length,
        };

  const crudo = leer(CLAVES.congreso);
  const ticket = crudo && esCodigoValido(crudo) ? normalizarCodigo(crudo) : null;

  let proximo: Paso | null = null;
  if (!perfil || !perfil.basicos) proximo = "perfil";
  else if (!compromisos) proximo = "compromisos";
  else if (!ticket) proximo = "congreso";

  return { perfil, compromisos, ticket, proximo };
}
