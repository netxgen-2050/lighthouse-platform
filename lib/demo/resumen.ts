import { cargar } from "@/lib/compromisos/estado";
import { esCodigoValido, normalizarCodigo } from "@/lib/congreso/ticket";
import { CHATS } from "@/lib/perfil/preguntas";
import { cantidadConfirmados, leerGuardado } from "@/lib/perfil/estado";
import { CLAVES } from "./claves";

export type Paso = "perfil" | "compromisos" | "congreso";

export type ResumenDemo = {
  /** null = no hay dato guardado (nunca 0 inventado). */
  perfil: { confirmados: number; total: number } | null;
  compromisos: { ofrezco: number; necesito: number } | null;
  ticket: string | null;
  /** Primer paso que falta; null si no falta nada. */
  proximo: Paso | null;
};

export function resumirDemo(leer: (clave: string) => string | null): ResumenDemo {
  const estado = leerGuardado(leer(CLAVES.perfil));
  const perfil =
    estado.items.length === 0
      ? null
      : { confirmados: cantidadConfirmados(estado), total: CHATS.length };

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
  if (!perfil || perfil.confirmados < perfil.total) proximo = "perfil";
  else if (!compromisos) proximo = "compromisos";
  else if (!ticket) proximo = "congreso";

  return { perfil, compromisos, ticket, proximo };
}
