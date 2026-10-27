import { textos } from "@/lib/idioma/textos";
import type { Idioma } from "@/lib/idioma/tipos";
import type { ClaveTermino } from "@/lib/legal/terminos";
import { puede } from "@/lib/permisos/calcular";
import { COLUMNAS, TABLA } from "@/lib/permisos/tabla";
import type { Columna, Grado, Motivo, Persona, Puerta, Resultado } from "@/lib/permisos/tipos";
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
export const NOMBRES: Record<Puerta, string> = textos("pasaporte", "es").puertas.nombres;

const TERMINO_DE_PUERTA: Partial<Record<Puerta, ClaveTermino>> = {
  "canal-fundadores": "pasefundador",
  "voz-fondo-comun": "guardian",
  "voto-fideicomiso": "gobernanzafideicomiso",
  creditos: "creditos",
};

const TEXTO_MOTIVO: Record<Motivo, string> = {
  plan: "por tu plan",
  pase: "por tu pase",
  tribu: "por tu tribu",
  presencia: "por tu presencia",
  rol: "por tu rol",
};

/** Qué la abre, por columna de la tabla de la nota 18 (sin la columna del plan Explorador). */
const TEXTO_COLUMNA: Record<Columna, string> = {
  explorador: "plan Explorador",
  miembro: "plan Miembro",
  pase: "Pase Fundador",
  tribu: "ser aceptado en una tribu",
  presencia: "presencia Genesis",
  residente: "ser residente",
};

export const PLANES = { explorador: "Explorador", miembro: "Miembro" } as const;
export const PASES = { semilla: "Semilla", brote: "Brote", raiz: "Raíz" } as const;

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
function textoAbreCon(puerta: Puerta, tribuEspecifica: boolean): string {
  const partes: string[] = [];
  for (const col of COLUMNAS) {
    if (col === "explorador") continue;
    const celda = TABLA[puerta][col];
    if (!celda || celda.soloRefuerzo) continue;
    let texto = TEXTO_COLUMNA[col];
    if (col === "tribu" && tribuEspecifica) texto = "ser aceptado en otra tribu";
    if (celda.grado === "visita") texto += " (como visita)";
    partes.push(texto);
  }
  if (partes.length <= 1) return partes.join("");
  return `${partes.slice(0, -1).join(", ")} o ${partes[partes.length - 1]}`;
}

function fila(
  clave: string,
  puerta: Puerta,
  nombre: string,
  r: Resultado,
  tribuEspecifica: boolean,
  idioma: Idioma,
): FilaPuerta {
  const base: FilaPuerta = {
    clave,
    puerta,
    nombre,
    abierta: r.abierta,
    estado: textoEstado(r.abierta ? r.grado : null, idioma),
    motivos: r.abierta ? r.motivos.map((m) => TEXTO_MOTIVO[m]) : [],
  };
  if (!r.abierta) base.abreCon = textoAbreCon(puerta, tribuEspecifica);
  if (r.refuerzoPresencia) base.refuerzo = `Refuerzo por presencia: ${r.refuerzoPresencia}`;
  const termino = TERMINO_DE_PUERTA[puerta];
  if (termino) base.termino = termino;
  return base;
}

/**
 * Una fila por puerta. La sala y la voz de tribu llevan una fila por cada tribu
 * aceptada y otra para "otras tribus" (o "tu tribu" si no hay ninguna aceptada).
 */
export function filasDePuertas(persona: Persona, tribus: readonly TribuAceptada[] = [], idioma: Idioma = "es"): FilaPuerta[] {
  // Con otro idioma se traducen el nombre y el estado de la puerta (lo que muestra el Pasaporte); los motivos, "se abre con"
  // y el refuerzo siguen en español hasta que se traduzca Canales.
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
