import type { ClaveTermino } from "@/lib/legal/terminos";
import type { DatosPersona } from "./datos";

export type EstadoCamino = "abierto" | "no" | "condiciones" | "completar";

export const TEXTO_ESTADO: Record<EstadoCamino, string> = {
  abierto: "Abierto",
  no: "Por ahora, no",
  condiciones: "Con condiciones",
  completar: "Completá tus datos",
};

export type Camino = {
  id: "membresia" | "tribus" | "sumarte" | "chacra" | "aporte";
  titulo: string;
  estado: EstadoCamino;
  texto: string;
  /** ⚖ que va junto al título. */
  legalTitulo?: ClaveTermino[];
  /** ⚖ que va al final del texto. */
  legalTexto?: ClaveTermino[];
};

export type Emision = { cupoNoCalificados: number; noCalificados: number };

// Textos copiados de V.pasaporte del mock-up v6.
export function caminos(d: DatosPersona, emision: Emision): Camino[] {
  const quedan = emision.cupoNoCalificados - emision.noCalificados;

  const sumarte: Camino =
    d.residencia === "argentina"
      ? {
          id: "sumarte",
          titulo: "Sumarte al proyecto",
          estado: d.inversor === undefined ? "completar" : "abierto",
          legalTitulo: ["sumarte"],
          legalTexto: ["circulo"],
          texto:
            d.inversor === undefined
              ? "Completá tu tipo de inversor para ver si este camino está abierto y cuántos lugares quedan."
              : d.inversor === "no-calificado"
                ? `Abierto, por invitación. Ocupás uno de los ${emision.cupoNoCalificados} lugares para inversores no calificados (quedan ${quedan}).`
                : "Abierto, por invitación.",
        }
      : d.residencia === "exterior"
        ? {
            id: "sumarte",
            titulo: "Sumarte al proyecto",
            estado: "no",
            legalTitulo: ["sumarte"],
            legalTexto: ["hacienda"],
            texto:
              "Por ahora, no. Tu residencia fiscal es del exterior: si entrás al fideicomiso, todo el fideicomiso pasa a pagar Ganancias como sujeto. El equipo está estudiando una vía separada para aportantes del exterior.",
          }
        : {
            id: "sumarte",
            titulo: "Sumarte al proyecto",
            estado: "completar",
            legalTitulo: ["sumarte"],
            texto: "Completá tu residencia fiscal para ver si este camino está abierto.",
          };

  const chacra: Camino =
    d.nacionalidad === "argentina"
      ? {
          id: "chacra",
          titulo: "Tu chacra a futuro",
          estado: "abierto",
          legalTitulo: ["chacra"],
          texto: "Sin restricciones por nacionalidad.",
        }
      : d.nacionalidad === "otra"
        ? {
            id: "chacra",
            titulo: "Tu chacra a futuro",
            estado: "condiciones",
            legalTitulo: ["chacra"],
            legalTexto: ["ribera"],
            texto:
              "Siendo extranjera, no podrías quedarte con el dominio de tierra rural ribereña. Depende de si el predio queda dentro del ejido urbano.",
          }
        : {
            id: "chacra",
            titulo: "Tu chacra a futuro",
            estado: "completar",
            legalTitulo: ["chacra"],
            texto: "Completá tu nacionalidad para ver qué condiciones tiene este camino.",
          };

  const aporte: Camino =
    d.modalidad === "obra"
      ? d.horas === undefined
        ? {
            id: "aporte",
            titulo: "Horas de obra",
            estado: "completar",
            legalTitulo: ["obra"],
            texto: "Completá cuántas horas por mes querés aportar.",
          }
        : {
            id: "aporte",
            titulo: "Horas de obra",
            estado: "condiciones",
            legalTitulo: ["obra"],
            texto: `Tus ${d.horas} h/mes presenciales necesitan seguro de accidentes y una modalidad definida antes de empezar.`,
          }
      : d.modalidad === "remoto"
        ? {
            id: "aporte",
            titulo: "Aporte remoto",
            estado: "condiciones",
            legalTitulo: ["remoto"],
            texto: "Tus horas desde el exterior se formalizan como servicio.",
          }
        : {
            id: "aporte",
            titulo: "Horas de obra o aporte remoto",
            estado: "completar",
            texto: "Completá tu modalidad de aporte (obra presencial o remoto).",
          };

  return [
    {
      id: "membresia",
      titulo: "Membresía de la red y Pase de estadías",
      estado: "abierto",
      legalTitulo: ["membresia", "pase"],
      texto: "Abiertos.",
    },
    { id: "tribus", titulo: "Tribus, salas y pactos de tiempo", estado: "abierto", texto: "Abiertos." },
    sumarte,
    chacra,
    aporte,
  ];
}
