import type { Reparto } from "@/lib/cuadratico/motor";
import type { Consulta, Persona } from "./tipos";

// Datos de ejemplo del prototipo: las consultas U1 a U4 de la nota del 15-oct-2026 y un padrón de personas ficticias.

/** La persona que mira. */
export const VOS: Persona = { id: "vos", nombre: "Vos" };

/** Seis personas ficticias; la 6 no votó (para que se vea "Faltan votar"). */
export const PADRON_EJEMPLO: Persona[] = [1, 2, 3, 4, 5, 6].map((n) => ({ id: `p${n}`, nombre: `Persona de ejemplo ${n}` }));

/** Todo el padrón en el orden en que se muestra: las personas de ejemplo y, al final, quien mira. */
export const PADRON: Persona[] = [...PADRON_EJEMPLO, VOS];

export const CONSULTAS: Consulta[] = [
  {
    id: "u1",
    titulo: "¿Para qué optimiza el Lighthouse?",
    descripcion: "Ordenar qué importa más cuando hay que elegir (Decisión A del modelo híbrido).",
    modo: "prioridades",
    ambito: "equipo",
    cierre: "2026-11-15T23:59:00-03:00",
    votosEnContra: false,
    resultadoVisible: "al-cierre",
    voto: "abierto",
    opciones: [
      { id: "regeneracion", etiqueta: "Regeneración ecológica" },
      { id: "resiliencia", etiqueta: "Resiliencia comunitaria" },
      { id: "accesibilidad", etiqueta: "Accesibilidad" },
      { id: "retorno", etiqueta: "Retorno económico" },
      { id: "id", etiqueta: "I+D / innovación" },
      { id: "replicabilidad", etiqueta: "Replicabilidad (RTMM)" },
    ],
  },
  {
    id: "u2",
    titulo: "¿Cuánta tierra silvestre en la fase 1?",
    descripcion: "Escenarios para la fase 1: partir de 10 % y llegar a un máximo de 50 %.",
    modo: "prioridades",
    ambito: "equipo",
    cierre: "2026-11-15T23:59:00-03:00",
    votosEnContra: false,
    // Para ver en la demo la regla "el resultado se ve al votar".
    resultadoVisible: "al-votar",
    voto: "abierto",
    opciones: [
      { id: "diez", etiqueta: "10 % de tierra silvestre" },
      { id: "veinte", etiqueta: "20 % de tierra silvestre" },
      { id: "treintaytres", etiqueta: "33 % de tierra silvestre" },
      { id: "cincuenta", etiqueta: "50 % de tierra silvestre" },
    ],
  },
  {
    id: "u3",
    titulo: "Usos del cono de 120 ha (fase 1)",
    descripcion: "Qué uso priorizar dentro del cono de 120 hectáreas de la fase 1.",
    modo: "prioridades",
    ambito: "equipo",
    cierre: "2026-11-30T23:59:00-03:00",
    votosEnContra: false,
    resultadoVisible: "al-cierre",
    // Para ver en la demo la regla "voto secreto".
    voto: "secreto",
    opciones: [
      { id: "residencial", etiqueta: "Residencial" },
      { id: "chacras", etiqueta: "Chacras productivas con riego" },
      { id: "bosque", etiqueta: "Restauración de bosque nativo" },
      { id: "centro", etiqueta: "Centro comunitario / cowork" },
      { id: "vivero", etiqueta: "Vivero y banco de semillas" },
      { id: "costa", etiqueta: "Costa del río en conservación" },
    ],
  },
  {
    id: "u4",
    titulo: "Primer presupuesto de regeneración",
    descripcion: "Cómo repartir el primer presupuesto de regeneración entre cinco frentes.",
    modo: "presupuesto",
    ambito: "equipo",
    cierre: "2026-11-30T23:59:00-03:00",
    votosEnContra: false,
    resultadoVisible: "al-cierre",
    voto: "abierto",
    presupuesto: { montoCentavos: 2_000_000, moneda: "USD", nota: "Sugerencia del equipo: lo decide Franz" },
    opciones: [
      { id: "hidrologico", etiqueta: "Estudio hidrológico" },
      { id: "piedra", etiqueta: "Obras de piedra a mano en el cauce" },
      { id: "vivero", etiqueta: "Vivero de nativas" },
      { id: "linea-base", etiqueta: "Línea de base y monitoreo" },
      { id: "permacultura", etiqueta: "Diseño de permacultura profesional" },
    ],
  },
];

/** Votos de ejemplo por consulta y persona, en el orden de las opciones. La persona 6 no votó. */
const VOTOS: Record<string, number[][]> = {
  u1: [
    [5, 4, 1, 1, 2, 3],
    [6, 3, 2, 0, 1, 2],
    [4, 5, 0, 2, 3, 1],
    [7, 2, 1, 1, 0, 3],
    [3, 3, 3, 2, 2, 2],
  ],
  u2: [
    [3, 5, 2, 1],
    [2, 4, 3, 0],
    [4, 3, 1, 1],
    [1, 3, 4, 2],
    [2, 2, 2, 2],
  ],
  u3: [
    [3, 2, 4, 3, 2, 1],
    [1, 4, 3, 2, 3, 3],
    [2, 3, 5, 1, 1, 2],
    [4, 1, 2, 3, 2, 2],
    [2, 2, 3, 2, 4, 1],
  ],
  u4: [
    [4, 3, 5, 2, 1],
    [3, 2, 6, 3, 0],
    [5, 4, 2, 2, 1],
    [2, 5, 3, 1, 3],
    [3, 3, 4, 3, 2],
  ],
};

/** Repartos de ejemplo: consulta → persona → reparto (todos válidos; lo prueba un test). */
export const REPARTOS_EJEMPLO: Record<string, Record<string, Reparto>> = Object.fromEntries(
  CONSULTAS.map((c) => [
    c.id,
    Object.fromEntries(
      VOTOS[c.id].map((votos, i) => [PADRON_EJEMPLO[i].id, Object.fromEntries(c.opciones.map((o, k) => [o.id, votos[k]]))]),
    ),
  ]),
);

export function buscarConsulta(id: string): Consulta | undefined {
  return CONSULTAS.find((c) => c.id === id);
}
