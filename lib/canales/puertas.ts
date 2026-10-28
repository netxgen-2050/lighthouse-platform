import { textos } from "@/lib/idioma/textos";
import type { Idioma } from "@/lib/idioma/tipos";
import type { ClaveTermino } from "@/lib/legal/terminos";
import { puede } from "@/lib/permisos/calcular";
import { COLUMNAS, TABLA } from "@/lib/permisos/tabla";
import type { Grado, Persona, Puerta, Resultado } from "@/lib/permisos/tipos";
import type { EstadoSumarte } from "@/lib/sumarte/estado";

/** Una tribu a la que la persona fue aceptada (solo existe en el simulador). */
export type TribuAceptada = { id: string; nombre: string };

export type FilaPuerta = {
  /** Clave estable de la fila (la puerta, más la tribu si es una fila por tribu). */
  clave: string;
  puerta: Puerta;
  nombre: string;
  abierta: boolean;
  /** "Abierta", "Abierta como visita", "Abierta · 1 voz" o "Cerrada". */
  estado: string;
  /** "por tu plan", "por tu pase"… Vacío si está cerrada. */
  motivos: string[];
  /** "Se abre con: …". Solo si está cerrada. */
  abreCon?: string;
  /** "Refuerzo por presencia: a decidir". Nunca un número. */
  refuerzo?: string;
  /** ⚖ del catálogo que acompaña la fila. */
  termino?: ClaveTermino;
};

/** Nombres en lenguaje simple de las 10 puertas del servicio de permisos. */
export const NOMBRES: Record<Puerta, string> = textos("canales", "es").nombres;

const TERMINO_DE_PUERTA: Partial<Record<Puerta, ClaveTermino>> = {
  "canal-fundadores": "pasefundador",
  "voz-fondo-comun": "guardian",
  "voto-fideicomiso": "gobernanzafideicomiso",
  creditos: "creditos",
};

/** Nombres de los planes y de los niveles del pase (los del glosario y de Sumarte) en el idioma pedido. */
export function nombresDePlanes(idioma: Idioma = "es") {
  return textos("canales", idioma).planes;
}
export function nombresDePases(idioma: Idioma = "es") {
  return textos("canales", idioma).pases;
}

/** Persona armada con lo elegido en Sumarte: sin tribu, sin presencia, no residente. */
export function personaDesdeSumarte(estado: Pick<EstadoSumarte, "plan" | "pase">): Persona {
  return {
    plan: estado.plan,
    pase: estado.pase,
    tribus: [],
    presenciaGenesis: false,
    residente: false,
  };
}

function textoEstado(grado: Grado | null, idioma: Idioma): string {
  const e = textos("pasaporte", idioma).puertas.estados;
  switch (grado) {
    case null:
      return e.cerrada;
    case "visita":
      return e.visita;
    case "segun estatuto":
      return e.estatuto;
    case "1 voz":
      return e.unaVoz;
    case "1 persona = 1 voto":
      return e.unVoto;
    default:
      return e.abierta;
  }
}

/** "A, B o C", a partir de las columnas que no están vacías en la tabla (las de refuerzo no abren). */
function textoAbreCon(puerta: Puerta, tribuEspecifica: boolean, idioma: Idioma): string {
  const t = textos("canales", idioma);
  const partes: string[] = [];
  for (const col of COLUMNAS) {
    if (col === "explorador") continue;
    const celda = TABLA[puerta][col];
    if (!celda || celda.soloRefuerzo) continue;
    let texto = t.columnas[col];
    if (col === "tribu" && tribuEspecifica) texto = t.otraTribu;
    if (celda.grado === "visita") texto += t.comoVisita;
    partes.push(texto);
  }
  if (partes.length <= 1) return partes.join("");
  return `${partes.slice(0, -1).join(", ")}${t.o}${partes[partes.length - 1]}`;
}

function fila(
  clave: string,
  puerta: Puerta,
  nombre: string,
  r: Resultado,
  tribuEspecifica: boolean,
  idioma: Idioma,
): FilaPuerta {
  const t = textos("canales", idioma);
  const base: FilaPuerta = {
    clave,
    puerta,
    nombre,
    abierta: r.abierta,
    estado: textoEstado(r.abierta ? r.grado : null, idioma),
    motivos: r.abierta ? r.motivos.map((m) => t.motivos[m]) : [],
  };
  if (!r.abierta) base.abreCon = textoAbreCon(puerta, tribuEspecifica, idioma);
  // El único valor posible hoy es "a decidir"; nunca un número.
  if (r.refuerzoPresencia) base.refuerzo = t.refuerzo(r.refuerzoPresencia === "a decidir" ? t.aDecidir : r.refuerzoPresencia);
  const termino = TERMINO_DE_PUERTA[puerta];
  if (termino) base.termino = termino;
  return base;
}

/**
 * Una fila por puerta. La sala y la voz de tribu llevan una fila por cada tribu
 * aceptada y otra para "otras tribus" (o "tu tribu" si no hay ninguna aceptada).
 */
export function filasDePuertas(persona: Persona, tribus: readonly TribuAceptada[] = [], idioma: Idioma = "es"): FilaPuerta[] {
  // Todo lo de la fila (nombre, estado, motivos, "se abre con" y refuerzo) sale en el idioma pedido.
  const p = textos("pasaporte", idioma).puertas;
  const aceptadas = tribus.filter((t) => persona.tribus.includes(t.id));
  const filas: FilaPuerta[] = [];
  const conTribus: Array<{ puerta: Puerta; propia: (n: string) => string; otras: string }> = [
    { puerta: "sala-tribu", propia: p.salaDe, otras: p.otrasSalas },
    { puerta: "voz-tribu", propia: p.vozEn, otras: p.otrasVoces },
  ];
  for (const puerta of Object.keys(NOMBRES) as Puerta[]) {
    const especial = conTribus.find((c) => c.puerta === puerta);
    if (!especial) {
      filas.push(fila(puerta, puerta, p.nombres[puerta], puede(persona, puerta), false, idioma));
      continue;
    }
    for (const t of aceptadas) {
      filas.push(fila(`${puerta}:${t.id}`, puerta, especial.propia(t.nombre), puede(persona, puerta, t.id), true, idioma));
    }
    const nombre = aceptadas.length > 0 ? especial.otras : p.nombres[puerta];
    filas.push(fila(`${puerta}:otras`, puerta, nombre, puede(persona, puerta), aceptadas.length > 0, idioma));
  }
  return filas;
}
