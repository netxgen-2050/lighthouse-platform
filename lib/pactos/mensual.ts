// Las horas de cada mes de un pacto de horas variables (openspec/changes/pactos-horas-variables, design §3), en el registro
// compartido. Todo puro: las listas se releen antes de llamar y las fechas vienen de afuera.
//
// Una declaración es una `pacto-propone-horas` con `sobre` = `pacto:<comunidad>:<persona>` y `datos.mes`. La comunidad la
// confirma con una `pacto-confirma-horas` o pide revisarla con un `pacto-no-acepta` (con motivo). Las funciones de las tareas
// (`horas.ts`) las ignoran porque exigen un `sobre` de postulación.
import {
  MAX_MOTIVO,
  afirmaComunidad,
  afirmaPersona,
  agregar,
  comunidadDeSobre,
  comunidadesQueResponde,
  estaRevocada,
  horasDelMes,
  personaDeAfirma,
  respuestaDe,
  revocar,
  sobreDe,
  type ConstanciaPacto,
  type QuienResponde,
} from "./constancias";
import { RANGO_VARIABLE } from "./datos";
import { mesValido } from "./mes";

/** ¿Es una declaración de horas de un mes bien formada (de una persona, sobre el pacto de una comunidad)? */
export function esDeclaracionDeMes(h: ConstanciaPacto): boolean {
  return (
    h.esquema === "pacto-propone-horas" &&
    comunidadDeSobre(h.sobre) !== null &&
    personaDeAfirma(h.afirma) !== null &&
    mesValido(h.datos.mes) &&
    horasDelMes(h) !== null
  );
}

/** ¿Esta respuesta cuenta para esa declaración? Afirma la comunidad, no la da la misma persona y copia las horas (o trae motivo). */
function respuestaValida(lista: readonly ConstanciaPacto[], h: ConstanciaPacto, r: ConstanciaPacto): boolean {
  const comunidad = comunidadDeSobre(h.sobre);
  if (comunidad === null || r.apuntaA !== h.id || r.sobre !== h.sobre || estaRevocada(lista, r.id)) return false;
  if (r.afirma !== afirmaComunidad(comunidad) || r.por === personaDeAfirma(h.afirma)) return false;
  if (r.esquema === "pacto-confirma-horas") return r.datos.horas === h.datos.horas && r.datos.mes === h.datos.mes;
  return r.esquema === "pacto-no-acepta" && (r.datos.motivo ?? "").trim().length > 0;
}

/**
 * La respuesta (confirmación o pedido de revisar) que cuenta para una declaración: la primera válida que está ANTES de cualquier
 * `revoca` de la declaración (gana la respuesta). null si no hay.
 */
export function respuestaDeMes(lista: readonly ConstanciaPacto[], h: ConstanciaPacto): ConstanciaPacto | null {
  if (!esDeclaracionDeMes(h)) return null;
  const limite = lista.findIndex((c) => c.esquema === "revoca" && c.apuntaA === h.id);
  const hasta = limite < 0 ? lista.length : limite;
  for (let i = 0; i < hasta; i++) {
    const c = lista[i];
    if ((c.esquema === "pacto-confirma-horas" || c.esquema === "pacto-no-acepta") && respuestaValida(lista, h, c)) return c;
  }
  return null;
}

/** ¿Retirada? Hay un `revoca` y ninguna respuesta que cuente llegó antes. */
export function declaracionRetirada(lista: readonly ConstanciaPacto[], h: ConstanciaPacto): boolean {
  return lista.some((c) => c.esquema === "revoca" && c.apuntaA === h.id) && respuestaDeMes(lista, h) === null;
}

/** La declaración más nueva (no retirada) de esa persona, comunidad y mes; o null. */
export function declaracionVigente(
  lista: readonly ConstanciaPacto[],
  idPersona: string,
  comunidad: string,
  mes: string,
): ConstanciaPacto | null {
  const sobre = sobreDe(comunidad, idPersona);
  const hs = lista.filter(
    (h) =>
      h.sobre === sobre &&
      h.afirma === afirmaPersona(idPersona) &&
      h.datos.mes === mes &&
      esDeclaracionDeMes(h) &&
      !declaracionRetirada(lista, h),
  );
  return hs.length > 0 ? hs[hs.length - 1] : null;
}

/** ¿Son horas que se pueden declarar? Enteras, de 0 a 80, en pasos de 2. */
export function horasDeclarables(horas: number): boolean {
  return Number.isInteger(horas) && horas >= RANGO_VARIABLE.min && horas <= RANGO_VARIABLE.max && horas % RANGO_VARIABLE.paso === 0;
}

export type ResultadoDeclarar = "ok" | "horas-invalidas" | "mes-invalido" | "ya-respondida";

/**
 * La persona declara las horas de un mes sobre la lista RELEÍDA. Si ya había una declaración de ese mes: sin respuesta, se revoca
 * (corregir); con una confirmación, no se escribe nada ("ya-respondida"); con un pedido de revisar, se declara de nuevo.
 * El rango y el mes en curso los comprueba quien llama contra el pacto de la persona; acá se cuida lo del registro.
 */
export function declararMes(
  lista: readonly ConstanciaPacto[],
  pedido: { idPersona: string; comunidad: string; mes: string; horas: number },
  cuando: string,
): { lista: ConstanciaPacto[]; resultado: ResultadoDeclarar; id?: string } {
  const igual = [...lista];
  if (!horasDeclarables(pedido.horas)) return { lista: igual, resultado: "horas-invalidas" };
  if (!mesValido(pedido.mes)) return { lista: igual, resultado: "mes-invalido" };
  const vigente = declaracionVigente(lista, pedido.idPersona, pedido.comunidad, pedido.mes);
  let base: ConstanciaPacto[] = igual;
  if (vigente) {
    const r = respuestaDeMes(lista, vigente);
    if (r?.esquema === "pacto-confirma-horas") return { lista: igual, resultado: "ya-respondida" };
    if (r === null) base = revocar(lista, vigente.id, pedido.idPersona, cuando);
  }
  const nueva = agregar(
    base,
    {
      esquema: "pacto-propone-horas",
      afirma: afirmaPersona(pedido.idPersona),
      por: pedido.idPersona,
      sobre: sobreDe(pedido.comunidad, pedido.idPersona),
      version: 0,
      datos: { mes: pedido.mes, horas: String(pedido.horas) },
    },
    cuando,
  );
  return { lista: nueva, resultado: "ok", id: nueva[nueva.length - 1].id };
}

/** Las declaraciones vivas (no retiradas, sin respuesta que cuente y las más nuevas de su mes) que esperan a la comunidad. */
export function declaracionesEsperando(lista: readonly ConstanciaPacto[]): ConstanciaPacto[] {
  return lista.filter((h) => {
    if (!esDeclaracionDeMes(h) || declaracionRetirada(lista, h) || respuestaDeMes(lista, h) !== null) return false;
    const persona = personaDeAfirma(h.afirma);
    const comunidad = comunidadDeSobre(h.sobre);
    if (persona === null || comunidad === null) return false;
    return declaracionVigente(lista, persona, comunidad, h.datos.mes)?.id === h.id;
  });
}

/** Las que esperan a la comunidad y esta sesión ve: las de las comunidades donde responde (con `puede` false si son sus propias horas). */
export function declaracionesParaVer(lista: readonly ConstanciaPacto[], sesion: QuienResponde): { h: ConstanciaPacto; comunidad: string; puede: boolean }[] {
  const propias = comunidadesQueResponde(sesion);
  const salida: { h: ConstanciaPacto; comunidad: string; puede: boolean }[] = [];
  for (const h of declaracionesEsperando(lista)) {
    const comunidad = comunidadDeSobre(h.sobre);
    if (comunidad === null || !propias.includes(comunidad)) continue;
    salida.push({ h, comunidad, puede: personaDeAfirma(h.afirma) !== sesion.idPersona });
  }
  return salida;
}

/** La última propuesta del pacto de esa persona y comunidad (`sobre`) que la comunidad aceptó (sin revocar), o null: es la versión vigente. */
export function propuestaAceptadaDe(lista: readonly ConstanciaPacto[], sobre: string): ConstanciaPacto | null {
  const aceptadas = lista.filter(
    (c) => c.esquema === "pacto-propone" && c.sobre === sobre && !estaRevocada(lista, c.id) && respuestaDe(lista, c.id)?.esquema === "pacto-acepta",
  );
  return aceptadas.length > 0 ? aceptadas[aceptadas.length - 1] : null;
}

/** El nombre (o las iniciales) con que la persona se presentó en su pacto de esa comunidad; null si no hay. */
export function quienDeSobre(lista: readonly ConstanciaPacto[], sobre: string): string | null {
  for (let i = lista.length - 1; i >= 0; i--) {
    const c = lista[i];
    if (c.esquema === "pacto-propone" && c.sobre === sobre && (c.datos.nombre || c.datos.iniciales)) return c.datos.nombre || c.datos.iniciales;
  }
  return null;
}

export type ResultadoMes ="ok" | "ya-respondida" | "sin-permiso" | "sin-motivo";

/** Confirma o pide revisar unas horas de un mes sobre la lista RELEÍDA. Una sola respuesta por declaración. */
export function responderMes(
  lista: readonly ConstanciaPacto[],
  pedido: { declaracionId: string; confirma: boolean; motivo?: string; sesion: QuienResponde },
  cuando: string,
): { lista: ConstanciaPacto[]; resultado: ResultadoMes } {
  const igual = [...lista];
  const h = lista.find((c) => c.id === pedido.declaracionId);
  if (!h || !esDeclaracionDeMes(h) || declaracionRetirada(lista, h) || respuestaDeMes(lista, h) !== null) return { lista: igual, resultado: "ya-respondida" };
  const persona = personaDeAfirma(h.afirma);
  const comunidad = comunidadDeSobre(h.sobre);
  if (persona === null || comunidad === null || declaracionVigente(lista, persona, comunidad, h.datos.mes)?.id !== h.id) {
    return { lista: igual, resultado: "ya-respondida" };
  }
  if (persona === pedido.sesion.idPersona || !comunidadesQueResponde(pedido.sesion).includes(comunidad)) return { lista: igual, resultado: "sin-permiso" };
  const motivo = (pedido.motivo ?? "").trim();
  if (!pedido.confirma && motivo.length === 0) return { lista: igual, resultado: "sin-motivo" };
  return {
    lista: agregar(
      lista,
      {
        esquema: pedido.confirma ? "pacto-confirma-horas" : "pacto-no-acepta",
        afirma: afirmaComunidad(comunidad),
        por: pedido.sesion.idPersona,
        sobre: h.sobre,
        version: h.version,
        apuntaA: h.id,
        datos: pedido.confirma ? { horas: h.datos.horas, mes: h.datos.mes } : { motivo: motivo.slice(0, MAX_MOTIVO), mes: h.datos.mes },
      },
      cuando,
    ),
    resultado: "ok",
  };
}
