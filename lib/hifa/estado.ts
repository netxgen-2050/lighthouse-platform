import type { Contexto, TipoReporte } from "@/lib/reportes/reporte";
import {
  AL_DECLINAR,
  AL_ELEGIR,
  AL_ENVIAR,
  AL_FALLAR,
  ATAJOS,
  OFRECER,
  RESPUESTAS,
  SALUDO,
  alConfirmar,
  type Atajo,
  type Modo,
} from "./guion";

export type Mensaje = { de: "hifa" | "persona"; texto: string };

/** Lo que Hifa ofreció pasar al equipo. */
export type Pendiente = {
  tipo: Extract<TipoReporte, "idea" | "pregunta">;
  texto: string;
  fase: "ofrecido" | "enviando" | "fallo";
};

export type Estado = { mensajes: Mensaje[]; modo: Modo | null; pendiente: Pendiente | null };

export type Accion =
  | { tipo: "atajo"; atajo: Atajo }
  | { tipo: "escribir"; texto: string; azar: number }
  | { tipo: "decidir"; enviar: boolean }
  | { tipo: "envio-ok"; numero: number }
  | { tipo: "envio-fallo" }
  | { tipo: "cargar"; estado: Estado }
  | { tipo: "borrar" };

export const MAX_MENSAJE = 1000;
const MAX_MENSAJES = 200;

export const ESTADO_INICIAL: Estado = { mensajes: [{ de: "hifa", texto: SALUDO }], modo: null, pendiente: null };

/** Elige una frase; `azar` es un número en [0, 1) para poder probarlo. */
export function elegir<T>(lista: readonly T[], azar: number): T {
  const i = Math.min(lista.length - 1, Math.max(0, Math.floor(azar * lista.length)));
  return lista[i];
}

function sumar(estado: Estado, nuevos: Mensaje[], resto: Partial<Estado>): Estado {
  return { ...estado, ...resto, mensajes: [...estado.mensajes, ...nuevos].slice(-MAX_MENSAJES) };
}

export function reducir(estado: Estado, accion: Accion): Estado {
  switch (accion.tipo) {
    case "atajo": {
      if (estado.pendiente?.fase === "enviando") return estado;
      const etiqueta = ATAJOS.find((a) => a.id === accion.atajo)?.etiqueta ?? "";
      return sumar(
        estado,
        [
          { de: "persona", texto: etiqueta },
          { de: "hifa", texto: AL_ELEGIR[accion.atajo] },
        ],
        { modo: accion.atajo === "quien" ? null : accion.atajo, pendiente: null },
      );
    }
    case "escribir": {
      const texto = accion.texto.trim().slice(0, MAX_MENSAJE);
      if (texto === "" || estado.pendiente?.fase === "enviando") return estado;
      const modo: Modo = estado.modo ?? "libre";
      const nuevos: Mensaje[] = [
        { de: "persona", texto },
        { de: "hifa", texto: elegir(RESPUESTAS[modo], accion.azar) },
        { de: "hifa", texto: OFRECER },
      ];
      const pendiente: Pendiente = {
        tipo: modo === "pregunta" ? "pregunta" : "idea",
        texto: modo === "necesidad" ? `Necesito: ${texto}` : texto,
        fase: "ofrecido",
      };
      return sumar(estado, nuevos, { pendiente });
    }
    case "decidir": {
      const p = estado.pendiente;
      if (!p || p.fase === "enviando") return estado;
      if (!accion.enviar) {
        return sumar(
          estado,
          [
            { de: "persona", texto: "No, gracias" },
            { de: "hifa", texto: AL_DECLINAR },
          ],
          { pendiente: null },
        );
      }
      return sumar(
        estado,
        [
          { de: "persona", texto: "Sí, pasalo" },
          { de: "hifa", texto: AL_ENVIAR },
        ],
        { pendiente: { ...p, fase: "enviando" } },
      );
    }
    case "envio-ok":
      if (estado.pendiente?.fase !== "enviando") return estado;
      return sumar(estado, [{ de: "hifa", texto: alConfirmar(accion.numero) }], { pendiente: null });
    case "envio-fallo":
      if (estado.pendiente?.fase !== "enviando") return estado;
      return sumar(estado, [{ de: "hifa", texto: AL_FALLAR }], {
        pendiente: { ...estado.pendiente, fase: "fallo" },
      });
    case "cargar":
      return accion.estado;
    case "borrar":
      return ESTADO_INICIAL;
  }
}

/** Cuerpo para `/api/reportes`: el texto de la persona y el contexto de la página. */
export function armarReporteHifa(p: Pendiente, contexto: Contexto) {
  return {
    tipo: p.tipo,
    quePaso: p.texto,
    esperabas: "",
    contacto: "",
    contexto: { ...contexto, titulo: `${contexto.titulo} (enviado desde Hifa)` },
  };
}

/** Texto para copiar cuando el envío falló. */
export function textoParaCopiarHifa(p: Pendiente): string {
  return `[${p.tipo}] ${p.texto}`;
}

const MODOS: readonly string[] = ["idea", "necesidad", "pregunta", "libre"];

/** Lee lo guardado en el navegador; ante cualquier dato raro vuelve al estado inicial. */
export function leerGuardado(crudo: string | null): Estado {
  if (!crudo) return ESTADO_INICIAL;
  try {
    const d = JSON.parse(crudo) as Partial<Estado> | null;
    if (!d || !Array.isArray(d.mensajes) || d.mensajes.length === 0 || d.mensajes.length > MAX_MENSAJES) {
      return ESTADO_INICIAL;
    }
    const mensajes: Mensaje[] = [];
    for (const m of d.mensajes as Partial<Mensaje>[]) {
      if (!m || (m.de !== "hifa" && m.de !== "persona") || typeof m.texto !== "string") return ESTADO_INICIAL;
      mensajes.push({ de: m.de, texto: m.texto });
    }
    const modo = d.modo === null || (typeof d.modo === "string" && MODOS.includes(d.modo)) ? (d.modo ?? null) : null;
    let pendiente: Pendiente | null = null;
    const p = d.pendiente as Partial<Pendiente> | null | undefined;
    if (p) {
      if ((p.tipo !== "idea" && p.tipo !== "pregunta") || typeof p.texto !== "string") return ESTADO_INICIAL;
      // Un envío que quedó a medias al cerrar la pestaña se trata como fallido.
      pendiente = { tipo: p.tipo, texto: p.texto, fase: p.fase === "ofrecido" ? "ofrecido" : "fallo" };
    }
    return { mensajes, modo, pendiente };
  } catch {
    return ESTADO_INICIAL;
  }
}
