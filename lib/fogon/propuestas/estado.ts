// Estado derivado de una propuesta (design §3b, §4, §4b y §4c). Nada se guarda: la fase, los concerns, los grupos, la
// participación y el resultado salen de los registros (de solo agregar) y de `ahora`, que se inyecta (en la página, después de
// montar; en los tests, fijo). Misma entrada, misma salida. Módulo puro: sin React, sin red.
import {
  alVencer,
  concernAbierto,
  FASES_DE_AGRUPACION,
  MATERIAS_SIN_URGENCIA,
  minimoParticipacion,
  plazosDe,
  REGISTROS_QUE_CUENTAN,
  REGLAS,
  sumarDias,
  type Plazos,
} from "./reglas";
import { RECORRIDOS } from "./fases";
import type {
  AcuseVista,
  ConcernVista,
  EstadoPropuesta,
  Fase,
  FaseVista,
  GrupoVista,
  ItemHistorial,
  MecanismoVista,
  Propuesta,
  Recorrido,
  Registro,
  Resultado,
  SugerenciaVista,
  UrgenciaVista,
} from "./tipos";

export type OpcionesEstado = {
  /** = `puedeDefinirAmbitoConsejo`: solo entonces se aplican los registros `ambito-consejo` (design §3b). Por defecto, false. */
  aplicaAmbitoConsejo?: boolean;
};

const ORDEN_GLOBAL: readonly Fase[] = ["borrador", "presentacion", "preguntas", "discusion", "concerns", "resolver", "llamado", "objetar", "cierre"];

const ms = (iso: string): number => Date.parse(iso);
const dia = (iso: string): string => iso.slice(0, 10);
const finDelDia = (fecha: string): number => Date.parse(`${fecha}T23:59:59.999Z`);

// ---- Cronograma (B2): fechas en UTC ----

export type Cronograma = { fases: { fase: Fase; desde: string; vence: string }[]; vence: string };

/** `inicio` es el día en que empieza la primera fase con plazo. En una revisión solo hay resolver, llamado y cierre. */
export function cronograma(recorrido: Recorrido, inicio: string, plazos: Plazos, esRevision = false): Cronograma {
  if (esRevision) {
    const vence = sumarDias(inicio, plazos.resolver);
    return {
      fases: [
        { fase: "resolver", desde: inicio, vence },
        { fase: "llamado", desde: vence, vence },
        { fase: "cierre", desde: vence, vence },
      ],
      vence,
    };
  }
  if (recorrido === "simple") {
    const vence = sumarDias(inicio, plazos.simple);
    return {
      fases: [
        { fase: "presentacion", desde: inicio, vence: inicio },
        { fase: "objetar", desde: inicio, vence },
        { fase: "cierre", desde: vence, vence },
      ],
      vence,
    };
  }
  const finPreguntas = sumarDias(inicio, plazos.preguntas);
  const finDiscusion = sumarDias(finPreguntas, plazos.discusion);
  const vence = sumarDias(finDiscusion, plazos.resolver);
  return {
    fases: [
      { fase: "borrador", desde: inicio, vence: inicio },
      { fase: "presentacion", desde: inicio, vence: inicio },
      { fase: "preguntas", desde: inicio, vence: finPreguntas },
      { fase: "discusion", desde: finPreguntas, vence: finDiscusion },
      { fase: "concerns", desde: finPreguntas, vence: finDiscusion },
      { fase: "resolver", desde: finDiscusion, vence },
      { fase: "llamado", desde: vence, vence },
      { fase: "cierre", desde: vence, vence },
    ],
    vence,
  };
}

// ---- Una pasada por los registros, en orden ----

type Contexto = { ahora: Date; opts: OpcionesEstado; revision: Registro | null; corteAmbito: number | null };

type Pasada = {
  fase: Fase;
  recorrido: Recorrido;
  version: number;
  inicio: string;
  concerns: ConcernVista[];
  grupos: GrupoVista[];
  mecanismos: MecanismoVista[];
  sugerencias: SugerenciaVista[];
  acuses: AcuseVista[];
  participantes: string[];
  participacion: EstadoPropuesta["participacion"];
  tamanoAmbito: number | null;
  ambitoConsejo: EstadoPropuesta["ambitoConsejo"];
  urgencia: UrgenciaVista | null;
  afectadas: EstadoPropuesta["afectadas"];
  aUnLado: EstadoPropuesta["aUnLado"];
  historial: ItemHistorial[];
  cierre: Registro | null;
};

function pasada(p: Propuesta, regs: readonly Registro[], ctx: Contexto): Pasada {
  const historial: ItemHistorial[] = [];
  const ignora = (r: Registro, clave: string) => historial.push({ id: r.id, cuando: r.cuando, quien: r.quien, tipo: "ignorado", clave });
  const quienPresenta = new Set<string>([p.presenta.personaId]);
  for (const r of regs) if (r.nivel === "presenta") quienPresenta.add(r.quien);

  const concerns = new Map<string, ConcernVista>();
  const respaldosDeSugerencia = new Map<string, Set<string>>();
  const nombresGrupo = new Map<string, string>();
  const mecanismos: MecanismoVista[] = [];
  const afectadas: (EstadoPropuesta["afectadas"][number] & { id: string })[] = [];
  const aUnLado: EstadoPropuesta["aUnLado"] = [];
  const acuseRegs: Registro[] = [];
  const respaldoRegs: Registro[] = [];
  const ambitoRegs: Registro[] = [];
  let urgenciaReg: Registro | null = null;
  let urgenciaCaida = false;
  let cierre: Registro | null = null;

  let recorrido = p.recorrido;
  let inicio = p.inicio;
  let version = 1;
  let fase: Fase = RECORRIDOS[recorrido][0];
  const sinUrgencia = p.materia !== undefined && (MATERIAS_SIN_URGENCIA as readonly string[]).includes(p.materia);

  for (const r of regs) {
    const objetivo = r.apuntaA ? concerns.get(r.apuntaA) : undefined;
    switch (r.tipo) {
      case "fase":
        fase = (r.datos?.fase as Fase) ?? fase;
        break;
      case "recorrido":
        recorrido = "importante";
        fase = "preguntas";
        inicio = dia(r.cuando);
        break;
      case "version":
        version = Math.max(version, r.version);
        break;
      case "revision":
        version = Math.max(version, r.version);
        fase = "resolver";
        inicio = dia(r.cuando);
        break;
      case "cierre":
        cierre = r;
        fase = "cierre";
        break;
      case "concern":
      case "bloqueo": {
        const esBloqueo = r.tipo === "bloqueo";
        concerns.set(r.id, {
          id: r.id,
          clase: esBloqueo ? "bloqueo" : "concern",
          quien: r.quien,
          nivel: r.nivel,
          version: r.version,
          razon: r.texto ?? "",
          principio: r.principio,
          sinNombre: r.sinNombre === true,
          sobreUrgencia: r.datos?.sobre === "urgencia",
          estado: esBloqueo ? "bloqueo" : "abierto",
          sumados: [],
          apuntaA: r.apuntaA,
          bloqueoNoLegitimo: false,
          legitimo: null,
        });
        if (r.apuntaA && !objetivo) {
          const set = respaldosDeSugerencia.get(r.apuntaA) ?? new Set<string>();
          set.add(r.quien);
          respaldosDeSugerencia.set(r.apuntaA, set);
        }
        break;
      }
      case "sumarse":
        if (objetivo && objetivo.quien !== r.quien && !objetivo.sumados.includes(r.quien)) objetivo.sumados.push(r.quien);
        break;
      case "retiro":
        if (objetivo) objetivo.estado = "retirado";
        break;
      case "resolucion":
        if (objetivo) objetivo.estado = r.datos?.aceptada === true ? "resuelto" : "resolviendo";
        break;
      case "a-un-lado":
        aUnLado.push({ quien: r.quien, razon: r.texto ?? "" });
        if (objetivo) objetivo.estado = "a-un-lado";
        break;
      case "legitimidad": {
        if (quienPresenta.has(r.quien)) {
          ignora(r, "legitimidad-de-quien-presenta");
          continue;
        }
        if (!objetivo) break;
        const legitimo = r.datos?.legitimo === true;
        objetivo.legitimo = legitimo;
        if (objetivo.clase === "bloqueo") {
          objetivo.bloqueoNoLegitimo = !legitimo;
          objetivo.estado = legitimo ? "bloqueo" : "abierto";
        }
        if (objetivo.sobreUrgencia && legitimo) urgenciaCaida = true;
        break;
      }
      case "agrupar": {
        const accion = r.datos?.accion;
        const grupoId = String(r.datos?.grupoId ?? "");
        if (accion === "sacar") {
          const esAutora = objetivo !== undefined && objetivo.quien === r.quien;
          const comoProceso = r.nivel === "proceso" && FASES_DE_AGRUPACION.includes(fase);
          if (!objetivo || !((comoProceso) || (esAutora && fase !== "cierre"))) {
            ignora(r, "sacar-no-permitido");
            continue;
          }
          objetivo.grupoId = undefined;
          if (objetivo.estado === "agrupado") objetivo.estado = "abierto";
        } else if (accion === "agrupar" || accion === "renombrar") {
          if (r.nivel !== "proceso" || !FASES_DE_AGRUPACION.includes(fase)) {
            ignora(r, "agrupar-fuera-de-fase");
            continue;
          }
          const nombre = String(r.datos?.nombre ?? "").trim();
          if (grupoId && nombre) nombresGrupo.set(grupoId, nombre);
          if (accion === "agrupar" && objetivo && grupoId) {
            objetivo.grupoId = grupoId;
            if (objetivo.estado === "abierto") objetivo.estado = "agrupado";
          }
        }
        break;
      }
      case "mecanismo":
        mecanismos.push({
          id: r.id,
          quien: r.quien,
          mecanismo: (r.datos?.mecanismo as MecanismoVista["mecanismo"]) ?? "otro",
          nombre: typeof r.datos?.nombre === "string" ? r.datos.nombre : undefined,
          fin: String(r.datos?.fin ?? ""),
          apuntaA: r.apuntaA,
        });
        break;
      case "afectada":
        afectadas.push({ id: r.id, quien: r.quien, motivo: typeof r.texto === "string" ? r.texto : (r.texto?.es ?? ""), vigente: true });
        break;
      case "objecion-afectada": {
        const a = afectadas.find((x) => x.id === r.apuntaA);
        if (a) a.vigente = false;
        break;
      }
      case "acuse":
        acuseRegs.push(r);
        break;
      case "urgencia":
        if (r.nivel !== "presenta" || sinUrgencia || urgenciaReg) {
          ignora(r, "urgencia-no-valida");
          continue;
        }
        urgenciaReg = r;
        break;
      case "respaldo-urgencia":
        if (quienPresenta.has(r.quien)) {
          ignora(r, "respaldo-de-quien-presenta");
          continue;
        }
        respaldoRegs.push(r);
        break;
      case "ambito-consejo":
        ambitoRegs.push(r);
        break;
      default:
        break;
    }
    if (r.tipo !== "ambito-consejo") historial.push({ id: r.id, cuando: r.cuando, quien: r.quien, tipo: r.tipo });
  }

  // Ámbito del consejo (G1): lista del board + cambios del super admin, solo si quien mira es super admin y con corte en el tiempo.
  let tamanoAmbito = p.tamanoAmbito;
  let ambitoConsejo: Pasada["ambitoConsejo"] = null;
  if (p.ambitoConsejo) {
    const personas = new Set(p.ambitoConsejo.personas);
    let porSuperAdmin = false;
    if (ctx.opts.aplicaAmbitoConsejo) {
      for (const r of ambitoRegs) {
        if (ctx.corteAmbito !== null && ms(r.cuando) > ctx.corteAmbito) continue;
        const agrega = typeof r.datos?.agrega === "string" ? r.datos.agrega : null;
        const quita = typeof r.datos?.quita === "string" ? r.datos.quita : null;
        if (agrega) personas.add(agrega);
        if (quita) personas.delete(quita);
        porSuperAdmin = true;
        historial.push({
          id: r.id,
          cuando: r.cuando,
          quien: r.quien,
          tipo: "ambito-consejo",
          clave: agrega !== null && agrega === r.quien ? "se-incluyo-a-si-mismo" : agrega ? "agrego" : "quito",
          datos: r.datos,
        });
      }
    }
    ambitoConsejo = {
      personas: [...personas],
      definidoPor: porSuperAdmin ? "superadmin-en-nombre-del-board" : "board-netxgen",
    };
    // Lista vacía: ámbito sin definir. Nunca un quórum de 0.
    tamanoAmbito = personas.size > 0 ? personas.size : null;
  }
  historial.sort((a, b) => ms(a.cuando) - ms(b.cuando));

  // Grupos: un grupo con un solo concern deja de ser grupo.
  const porGrupo = new Map<string, ConcernVista[]>();
  for (const c of concerns.values()) if (c.grupoId) porGrupo.set(c.grupoId, [...(porGrupo.get(c.grupoId) ?? []), c]);
  const grupos: GrupoVista[] = [];
  for (const [id, miembros] of porGrupo) {
    if (miembros.length < 2) {
      for (const c of miembros) {
        c.grupoId = undefined;
        if (c.estado === "agrupado") c.estado = "abierto";
      }
      continue;
    }
    const autoras = new Set<string>();
    for (const c of miembros) {
      if (!c.sinNombre) autoras.add(c.quien);
      for (const s of c.sumados) autoras.add(s);
    }
    grupos.push({ id, nombre: nombresGrupo.get(id) ?? "", concerns: miembros, autoras: [...autoras] });
  }

  // Acuses: valen para una versión (B5). Un acuse seguido de un concern se ve reemplazado y sigue contando.
  const cuandoDe = new Map(regs.map((r) => [r.id, ms(r.cuando)]));
  const acuses: AcuseVista[] = acuseRegs.map((a) => ({
    id: a.id,
    quien: a.quien,
    nivel: a.nivel,
    version: a.version,
    vigente: a.version === version,
    reemplazadoPorConcern: [...concerns.values()].some(
      (c) => c.quien === a.quien && !c.sobreUrgencia && c.version === a.version && c.clase === "concern" && (cuandoDe.get(c.id) ?? 0) > ms(a.cuando),
    ),
  }));

  // Participación (B3): del ámbito o afectadas, una vez cada una.
  const participantes = new Set<string>();
  let firmaron = 0;
  const firmantes = new Set<string>();
  for (const r of regs) {
    if (!REGISTROS_QUE_CUENTAN.includes(r.tipo)) continue;
    if (r.nivel !== "ambito" && r.nivel !== "afectada") continue;
    if (r.tipo === "acuse") {
      if (r.version !== version) continue;
      firmantes.add(r.quien);
    }
    participantes.add(r.quien);
  }
  firmaron = firmantes.size;
  const minimo = minimoParticipacion(tamanoAmbito);
  const participacion = {
    cuenta: participantes.size,
    acuses: firmaron,
    minimo,
    falta: minimo === null ? null : Math.max(0, minimo - participantes.size),
  };

  // Urgencia (D4): pedida → validada → caída.
  let urgencia: UrgenciaVista | null = null;
  if (urgenciaReg) {
    const porQuien = new Map<string, Registro["nivel"]>();
    for (const r of respaldoRegs) {
      if (r.nivel !== "ambito" && r.nivel !== "proceso") continue;
      const previo = porQuien.get(r.quien);
      if (previo === "ambito") continue;
      porQuien.set(r.quien, r.nivel);
    }
    const deAmbito = [...porQuien].filter(([, n]) => n === "ambito").map(([q]) => q);
    const deProceso = [...porQuien].filter(([, n]) => n === "proceso").map(([q]) => q);
    const validos = [...deAmbito, ...deProceso.slice(0, REGLAS.urgencia.maxRespaldosDeFacilitacion)];
    const faltan = Math.max(0, REGLAS.urgencia.respaldosMinimos - validos.length);
    urgencia = {
      id: urgenciaReg.id,
      quien: urgenciaReg.quien,
      datos: urgenciaReg.datos ?? {},
      estado: urgenciaCaida ? "caida" : faltan === 0 ? "validada" : "pedida",
      respaldos: validos,
      faltan,
    };
  }

  // Sugerencias del Guardián que ya aparecieron (fase alcanzada). Sin respaldo no cambian nada.
  const posActual = ORDEN_GLOBAL.indexOf(fase);
  const sugerencias: SugerenciaVista[] = p.guion.guardian
    .filter((s) => ORDEN_GLOBAL.indexOf(s.fase) <= posActual)
    .map((s) => {
      const respaldos = [...(respaldosDeSugerencia.get(s.id) ?? [])];
      return { ...s, respaldos, estado: respaldos.length > 0 ? ("respaldada" as const) : ("sin-respaldo" as const) };
    });

  return {
    fase,
    recorrido,
    version,
    inicio,
    concerns: [...concerns.values()],
    grupos,
    mecanismos,
    sugerencias,
    acuses,
    participantes: [...participantes],
    participacion,
    tamanoAmbito,
    ambitoConsejo,
    urgencia,
    afectadas: afectadas.map(({ quien, motivo, vigente }) => ({ quien, motivo, vigente })),
    aUnLado,
    historial,
    cierre,
  };
}

/** Los concerns que cuentan como oposición (no los que discuten la urgencia). */
function oposicion(concerns: readonly ConcernVista[]): ConcernVista[] {
  return concerns.filter((c) => !c.sobreUrgencia && (concernAbierto(c) || c.estado === "bloqueo"));
}

// ---- Derivación completa ----

function derivarCon(p: Propuesta, regs: readonly Registro[], ahora: Date, opts: OpcionesEstado): EstadoPropuesta {
  const plazos = plazosDe(p.holonId);
  const ignorados: ItemHistorial[] = [];
  const ignorar = (r: Registro, clave: string) =>
    ignorados.push({ id: r.id, cuando: r.cuando, quien: r.quien, tipo: "ignorado", clave });

  // 1. Revisión (única puerta para reabrir algo cerrado, D3): solo sobre una medida provisoria, de rol de proceso, una vez.
  const sinRevision = regs.filter((r) => r.tipo !== "revision");
  let revision: Registro | null = null;
  let previoRevision: Resultado | null = null;
  for (const rev of regs.filter((r) => r.tipo === "revision")) {
    if (revision) {
      ignorar(rev, "revision-ya-abierta");
      continue;
    }
    const previo = derivarCon(p, sinRevision.filter((r) => ms(r.cuando) < ms(rev.cuando)), new Date(rev.cuando), opts);
    if (rev.nivel === "proceso" && previo.resultado?.tipo === "provisoria") {
      revision = rev;
      previoRevision = previo.resultado;
    } else {
      ignorar(rev, "revision-no-valida");
    }
  }

  // 2. Cierre por consenso (B3): hace falta quórum. Solo cuenta el primero válido.
  let cierre: Registro | null = null;
  let resultadoCierre: Resultado | null = null;
  const sinCierres = regs.filter((r) => r.tipo !== "cierre");
  for (const c of regs.filter((r) => r.tipo === "cierre")) {
    if (cierre) {
      ignorar(c, "cierre-ya-hecho");
      continue;
    }
    if (c.nivel !== "proceso") {
      ignorar(c, "cierre-sin-rol");
      continue;
    }
    if (revision && ms(c.cuando) < ms(revision.cuando)) {
      ignorar(c, "cierre-anterior-a-la-revision");
      continue;
    }
    const pre = derivarCon(p, sinCierres.filter((r) => ms(r.cuando) <= ms(c.cuando)), ahora, opts);
    if (pre.participacion.minimo === null || pre.participacion.cuenta < pre.participacion.minimo) {
      ignorar(c, "cierre-sin-quorum");
      continue;
    }
    const abiertos = oposicion(pre.concerns);
    if (abiertos.some((x) => x.clase === "bloqueo" && x.legitimo === true)) resultadoCierre = { tipo: "bloqueada" };
    else if (abiertos.length > 0) resultadoCierre = { tipo: "sin-consenso" };
    else resultadoCierre = { tipo: "consenso", conLadoA: pre.aUnLado.map((x) => x.quien) };
    cierre = c;
  }

  const validos = regs.filter((r) => (r.tipo !== "cierre" || r === cierre) && (r.tipo !== "revision" || r === revision));
  const crono = (rec: Recorrido, inicio: string) => cronograma(rec, inicio, plazos, revision !== null);

  // 3. Pasada principal. El corte del ámbito del consejo es el cierre o, si venció, el fin del último día.
  const primera = pasada(p, validos, { ahora, opts, revision, corteAmbito: cierre ? ms(cierre.cuando) : null });
  const cr = crono(primera.recorrido, primera.inicio);
  const hoy = ahora.toISOString().slice(0, 10);
  const vencido = cierre === null && hoy > cr.vence;
  const base = vencido
    ? pasada(p, validos, { ahora, opts, revision, corteAmbito: finDelDia(cr.vence) })
    : primera;

  // 4. Resultado.
  let resultado: Resultado | null = null;
  if (cierre) {
    resultado = resultadoCierre;
  } else if (vencido) {
    const corte = pasada(p, validos.filter((r) => dia(r.cuando) <= cr.vence), {
      ahora,
      opts,
      revision,
      corteAmbito: finDelDia(cr.vence),
    });
    const opos = oposicion(corte.concerns);
    const bloqueos = corte.concerns.filter((c) => c.clase === "bloqueo" && c.estado === "bloqueo");
    const participantes = new Set(corte.participantes);
    const sinApoyo = new Set(opos.map((c) => c.quien));
    const apoyan = [...participantes].filter((q) => !sinApoyo.has(q)).length;
    resultado = alVencer({
      recorrido: corte.recorrido,
      esRevision: revision !== null,
      concernAbierto: corte.concerns.some((c) => !c.sobreUrgencia && concernAbierto(c)),
      bloqueo: bloqueos.length > 0,
      bloqueoLegitimo: bloqueos.some((c) => c.legitimo === true),
      cuenta: corte.participacion.cuenta,
      apoyan,
      minimo: corte.participacion.minimo,
      urgencia: corte.urgencia?.estado ?? null,
      holonId: p.holonId,
      vencimiento: cr.vence,
      diasRevision: plazos.diasRevision,
      concernsQueObligan: corte.concerns
        .filter((c) => (!c.sobreUrgencia && (concernAbierto(c) || c.bloqueoNoLegitimo)) || (c.sobreUrgencia && c.legitimo !== true))
        .map((c) => c.id),
    });
  } else if (revision && previoRevision?.tipo === "provisoria") {
    // Mientras la revisión está abierta, la medida provisoria sigue aplicándose.
    resultado = { ...previoRevision, enRevision: true };
  }

  const fase: Fase = cierre || vencido ? "cierre" : base.fase;
  const indice = RECORRIDOS[base.recorrido].indexOf(fase);
  const fases: FaseVista[] = cr.fases.map((f) => {
    const i = RECORRIDOS[base.recorrido].indexOf(f.fase);
    return {
      fase: f.fase,
      desde: f.desde,
      vence: f.vence,
      hecha: indice >= 0 && i >= 0 ? i < indice : false,
      actual: f.fase === fase,
    };
  });

  return {
    fase,
    recorrido: base.recorrido,
    version: base.version,
    fases,
    vence: cr.vence,
    concerns: base.concerns,
    grupos: base.grupos,
    mecanismos: base.mecanismos,
    sugerenciasGuardian: base.sugerencias,
    acuses: base.acuses,
    participacion: base.participacion,
    tamanoAmbito: base.tamanoAmbito,
    ambitoConsejo: base.ambitoConsejo,
    urgencia: base.urgencia,
    afectadas: base.afectadas,
    resultado,
    aUnLado: base.aUnLado,
    historial: [...base.historial, ...ignorados].sort((a, b) => ms(a.cuando) - ms(b.cuando)),
  };
}

/**
 * Deriva el estado de una propuesta: `p.registros` (ejemplo) + `extra` (los del navegador) + `ahora`. No escribe nada.
 */
export function derivarEstado(p: Propuesta, extra: readonly Registro[], ahora: Date, opciones: OpcionesEstado = {}): EstadoPropuesta {
  const todos = [...p.registros, ...extra.filter((r) => r.propuestaId === p.decisionId)]
    .map((r, i) => ({ r, i }))
    .sort((a, b) => ms(a.r.cuando) - ms(b.r.cuando) || a.i - b.i)
    .map((x) => x.r);
  return derivarCon(p, todos, ahora, opciones);
}
