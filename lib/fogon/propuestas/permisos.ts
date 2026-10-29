// Permisos DENTRO de una decisión del Fogón, según cuánto implica la decisión a cada persona (A3). Son de ejemplo y simulados.
// NO son las puertas de la plataforma (`lib/permisos/niveles.ts`: quién entra a qué pantalla). Son cosas distintas y este
// módulo no importa nada de allá ni de `lib/sesion/` (ADR-022: los permisos dentro de una decisión se calculan aparte;
// quien presenta sigue sin decidir la legitimidad de los concerns sobre su pedido).
// La matriz es la tabla del design §2 de `openspec/changes/fogon-propuestas`, con los cambios de Gus: A2 (visita sin acceso)
// y C4 (quien presenta levanta concerns y bloquea, pero no se hace a un lado).
import type { Ambito } from "@/lib/fogon/datos";
import type { Accion, AccionDeProceso, AccionMatriz, Celda, Condicion, NivelImplicacion } from "./tipos";

export const NIVELES_IMPLICACION: readonly NivelImplicacion[] = ["visita", "red", "comun", "ambito", "afectada", "proceso", "presenta"];

const SI: Celda = "si";
const NO: Celda = "no";
const c = (condicion: Condicion): Celda => ({ condicion });

// Orden de columnas: visita, red, común, ámbito, afectada, proceso, presenta.
const fila = (red: Celda, comun: Celda, ambito: Celda, afectada: Celda, proceso: Celda, presenta: Celda): Record<NivelImplicacion, Celda> => ({
  visita: NO,
  red,
  comun,
  ambito,
  afectada,
  proceso,
  presenta,
});

export const MATRIZ: Readonly<Record<AccionMatriz, Readonly<Record<NivelImplicacion, Celda>>>> = {
  "leer-propuesta": fila(SI, SI, SI, SI, SI, SI),
  "leer-discusion": fila(c("solo-comun"), SI, SI, SI, SI, SI),
  preguntar: fila(c("solo-comun"), SI, SI, SI, SI, SI),
  comentar: fila(NO, c("solo-comun"), SI, SI, SI, SI),
  "levantar-concern": fila(NO, c("solo-comun"), SI, SI, SI, SI),
  "sumarse-concern": fila(NO, c("solo-comun"), SI, SI, SI, SI),
  "proponer-resolucion": fila(NO, NO, SI, SI, SI, SI),
  editar: fila(NO, NO, NO, NO, c("solo-forma"), SI),
  "pasar-fase": fila(NO, NO, NO, NO, c("quien-facilita"), NO),
  "hacerse-a-un-lado": fila(NO, NO, SI, SI, SI, NO),
  bloquear: fila(NO, NO, SI, SI, c("solo-como-miembro"), SI),
  "decidir-legitimidad": fila(NO, NO, c("por-consenso-del-grupo"), c("participa-en-la-discusion"), c("facilita-nunca-decide"), NO),
  "derivar-o-pausar": fila(NO, NO, c("con-acuerdo-del-grupo"), NO, c("lo-propone"), NO),
  "escribir-acta": fila(NO, NO, NO, NO, c("rol-memoria"), NO),
  "recibir-avisos": fila(c("si-se-suscribe"), c("si-se-suscribe"), SI, SI, SI, SI),
};

/** Acciones de proceso que no están en el boceto. La visita es siempre "no" (A2). */
export const ACCIONES_DE_PROCESO: Readonly<Record<AccionDeProceso, Readonly<Record<NivelImplicacion, Celda>>>> = {
  "declararse-afectada": fila(SI, SI, NO, NO, NO, NO),
  "objetar-afectada": fila(NO, NO, SI, NO, NO, NO),
  "pedir-recorrido-importante": fila(NO, NO, SI, SI, NO, NO),
  evaluar: fila(NO, NO, c("participa-en-la-discusion"), c("participa-en-la-discusion"), c("participa-en-la-discusion"), c("participa-en-la-discusion")),
  "agrupar-concerns": fila(NO, NO, NO, NO, SI, NO),
  // Las mismas celdas que levantar un concern; `acciones.ts` exige además que sea la autora del concern.
  "sacar-propio-del-grupo": MATRIZ["levantar-concern"],
  // D2: las mismas celdas que comentar.
  "sugerir-mecanismo": MATRIZ.comentar,
  // B5: del ámbito y afectadas.
  "acusar-conformidad": fila(NO, NO, SI, SI, NO, NO),
  "marcar-urgente": fila(NO, NO, NO, NO, NO, SI),
  "respaldar-urgencia": fila(NO, NO, SI, NO, c("quien-facilita"), NO),
  "objetar-urgencia": MATRIZ["levantar-concern"],
  "abrir-revision": fila(NO, NO, NO, NO, c("quien-facilita"), NO),
};

/** Acciones que quien presenta nunca puede hacer sobre su propia propuesta, aunque otro de sus niveles las permita (F3, C4). */
export const RESTRICCIONES_DE_QUIEN_PRESENTA: readonly Accion[] = ["decidir-legitimidad", "hacerse-a-un-lado", "respaldar-urgencia"];

export function celdasDe(accion: Accion): Readonly<Record<NivelImplicacion, Celda>> {
  return accion in MATRIZ ? MATRIZ[accion as AccionMatriz] : ACCIONES_DE_PROCESO[accion as AccionDeProceso];
}

export type ResultadoPermiso = { estado: "si" | "no" | "condicion"; condiciones: Condicion[] };

const PESO = { no: 0, condicion: 1, si: 2 } as const;

/**
 * Lo que puede una persona con estos niveles (la unión: gana el mejor estado de cada nivel). `solo-comun` se evalúa con el
 * ámbito de la decisión; el resto de las condiciones son descriptivas y la acción se ofrece con la condición escrita.
 */
export function permiso(accion: Accion, niveles: readonly NivelImplicacion[], ctx: { ambito: Ambito }): ResultadoPermiso {
  if (niveles.includes("presenta") && RESTRICCIONES_DE_QUIEN_PRESENTA.includes(accion)) return { estado: "no", condiciones: [] };
  const celdas = celdasDe(accion);
  let mejor: ResultadoPermiso = { estado: "no", condiciones: [] };
  for (const nivel of niveles) {
    const celda = celdas[nivel];
    let actual: ResultadoPermiso;
    if (celda === "si") actual = { estado: "si", condiciones: [] };
    else if (celda === "no") actual = { estado: "no", condiciones: [] };
    else if (celda.condicion === "solo-comun") actual = { estado: ctx.ambito === "comun" ? "si" : "no", condiciones: ["solo-comun"] };
    else actual = { estado: "condicion", condiciones: [celda.condicion] };
    if (PESO[actual.estado] > PESO[mejor.estado]) mejor = actual;
  }
  return mejor;
}
