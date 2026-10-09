// Los sellos del pasaporte: cada uno certifica algo y abre puertas concretas.
// El estado sale de lo que ya hay en el navegador (Sumarte, membresía, Congreso, KYC);
// lo que abre sale del servicio de permisos (`lib/permisos/`).
import { filasDePuertas, type TribuAceptada } from "@/lib/canales/puertas";
import type { ClaveTermino } from "@/lib/legal/terminos";
import { COMUNIDAD_LIGHTHOUSE, estadoDe, type Membresias } from "@/lib/membresia/estado";
import type { Persona } from "@/lib/permisos/tipos";
import type { EstadoSumarte } from "@/lib/sumarte/estado";
import { listarTribus } from "@/lib/tribus/datos";
import type { DatosPersona } from "./datos";
import type { EstadoKyc } from "./kyc";

export type EstadoSello = "obtenido" | "en-tramite" | "disponible" | "no-disponible";

export const TEXTO_ESTADO_SELLO: Record<EstadoSello, string> = {
  obtenido: "Obtenido",
  "en-tramite": "En trámite",
  disponible: "Disponible",
  "no-disponible": "No disponible todavía",
};

export type AccionSello = { tipo: "enlace"; texto: string; href: string } | { tipo: "kyc"; texto: string };

export type Sello = {
  id: string;
  nombre: string;
  estado: EstadoSello;
  /** ISO. Solo cuando está obtenido. */
  fecha?: string;
  /** Una línea que explica qué certifica o por qué está así. */
  detalle: string;
  accion?: AccionSello;
  /** Puertas que abre, en lenguaje simple. */
  abre: string[];
  legal?: ClaveTermino[];
  /** Término que se explica junto al detalle (no junto al título). */
  legalDetalle?: ClaveTermino;
};

export type FechasSellos = Record<string, string>;

export type EntradaSellos = {
  sumarte: EstadoSumarte;
  membresias: Membresias;
  kyc: EstadoKyc;
  datos: DatosPersona;
  /** Ticket del Congreso registrado (todavía no es presencia). */
  ticket: boolean;
  /** Check-in confirmado por el anfitrión. En el prototipo nunca se confirma solo. */
  presenciaGenesis: boolean;
  fechas: FechasSellos;
};

const SIN_PERSONA: Persona = { plan: "explorador", pase: null, tribus: [], presenciaGenesis: false, residente: false };

/** Las comunidades con sello: el Lighthouse y las tribus que existen de verdad (no los barrios vacantes). */
export function comunidadesConSello(): { id: string; nombre: string }[] {
  const tribus = listarTribus()
    .filter((t) => t.estado !== "vacante")
    .map((t) => ({ id: t.id, nombre: t.nombre }));
  return [{ id: COMUNIDAD_LIGHTHOUSE, nombre: "Lighthouse" }, ...tribus];
}

/** Puertas que se abren al tener esta fuente y que una persona sin nada (Explorador) no tiene. */
export function puertasQueAbre(cambios: Partial<Persona>, tribus: readonly TribuAceptada[] = []): string[] {
  const base = new Set(filasDePuertas(SIN_PERSONA, []).filter((f) => f.abierta).map((f) => f.clave));
  const con: Persona = { ...SIN_PERSONA, ...cambios };
  return filasDePuertas(con, tribus)
    .filter((f) => f.abierta && !base.has(f.clave))
    .map((f) => `${f.nombre} · ${f.estado}`);
}

export function sellos(e: EntradaSellos, ahora: Date): Sello[] {
  const hoy = ahora.toISOString();
  const lista: Sello[] = [];
  const fechaDe = (id: string) => e.fechas[id] ?? hoy;

  lista.push({
    id: "explorador",
    nombre: "Explorador/a",
    estado: "obtenido",
    fecha: fechaDe("explorador"),
    detalle: "Es tu punto de partida: ya podés recorrer el Lighthouse.",
    abre: filasDePuertas(SIN_PERSONA, [])
      .filter((f) => f.abierta)
      .map((f) => `${f.nombre} · ${f.estado}`),
  });

  const esMiembro = e.sumarte.plan === "miembro" || e.sumarte.pase !== null;
  lista.push({
    id: "miembro-red",
    nombre: "Miembro de la red",
    estado: esMiembro ? "obtenido" : "disponible",
    fecha: esMiembro ? fechaDe("miembro-red") : undefined,
    detalle: esMiembro ? "Tenés el plan Miembro (simulado)." : "Se consigue con el plan Miembro en Sumarte. Es simulado: no se cobra nada.",
    accion: esMiembro ? undefined : { tipo: "enlace", texto: "Hacerme Miembro en Sumarte", href: "/sumarte" },
    abre: puertasQueAbre({ plan: "miembro" }),
    legal: ["membresia"],
  });

  for (const c of comunidadesConSello()) {
    const m = estadoDe(e.membresias, c.id);
    const id = `comunidad:${c.id}`;
    const esLh = c.id === COMUNIDAD_LIGHTHOUSE;
    lista.push({
      id,
      nombre: `Miembro de ${c.nombre}`,
      estado: m === "miembro" ? "obtenido" : m === "pedido" ? "en-tramite" : "disponible",
      fecha: m === "miembro" ? fechaDe(id) : undefined,
      detalle:
        m === "miembro"
          ? `Tu pedido fue aceptado en ${c.nombre} (simulado).`
          : m === "pedido"
            ? `Pediste entrar a ${c.nombre}: falta que quien la administra lo acepte.`
            : `Se consigue adhiriendo al manifiesto de ${c.nombre}.`,
      accion: m === "no-miembro" ? { tipo: "enlace", texto: `Pedir entrar a ${c.nombre}`, href: esLh ? "/territorios/lighthouse" : `/tribus/${c.id}` } : undefined,
      abre: puertasQueAbre({ tribus: [c.id] }, [{ id: c.id, nombre: c.nombre }]),
    });
  }

  const kycAprobado = e.kyc.estado === "aprobado";
  lista.push({
    id: "identidad",
    nombre: "Identidad verificada",
    estado: kycAprobado ? "obtenido" : e.kyc.estado === "en-tramite" ? "en-tramite" : "disponible",
    fecha: e.kyc.estado === "aprobado" ? e.kyc.aprobado : undefined,
    detalle:
      e.kyc.estado === "aprobado"
        ? "El fiduciario sabe quién sos (simulado)."
        : e.kyc.estado === "en-tramite"
          ? "Enviaste tus datos. En el prototipo la aprobación se simula."
          : "Se pide solo cuando querés aportar plata. En la versión real lo hace el fiduciario.",
    accion: e.kyc.estado === "sin-tramite" ? { tipo: "kyc", texto: "Verificar mi identidad" } : undefined,
    abre: ["Pedir invitación para invertir en Sumarte", "Registrar un aporte en plata en Pactos"],
    legal: ["kyc"],
  });

  // Inversor habilitado: identidad verificada + residencia fiscal en Argentina.
  let inversor: Sello;
  if (kycAprobado && e.datos.residencia === "argentina") {
    inversor = {
      id: "inversor",
      nombre: "Inversor habilitado",
      estado: "obtenido",
      fecha: fechaDe("inversor"),
      detalle: "Identidad verificada y residencia fiscal en Argentina.",
      abre: ["Sumarte al proyecto del Lote 7, por invitación"],
      legal: ["sumarte"],
    };
  } else if (kycAprobado && e.datos.residencia === "exterior") {
    inversor = {
      id: "inversor",
      nombre: "Inversor habilitado",
      estado: "no-disponible",
      detalle: "Por ahora, no: tu residencia fiscal es del exterior. Ver el motivo en «Aportantes con residencia fiscal en el exterior».",
      abre: [],
      legal: ["sumarte"],
      legalDetalle: "inversorexterior",
    };
  } else {
    inversor = {
      id: "inversor",
      nombre: "Inversor habilitado",
      estado: "disponible",
      detalle:
        e.kyc.estado === "en-tramite"
          ? "Se obtiene cuando se apruebe tu identidad, si tu residencia fiscal es en Argentina."
          : "Se obtiene con la identidad verificada, si tu residencia fiscal es en Argentina.",
      accion: e.kyc.estado === "sin-tramite" ? { tipo: "kyc", texto: "Verificar mi identidad" } : undefined,
      abre: ["Sumarte al proyecto del Lote 7, por invitación"],
      legal: ["sumarte"],
    };
  }
  lista.push(inversor);

  lista.push({
    id: "fundador",
    nombre: "Pase Fundador",
    estado: e.sumarte.pase ? "obtenido" : "disponible",
    fecha: e.sumarte.pase ? fechaDe("fundador") : undefined,
    detalle: e.sumarte.pase ? `Tenés el Pase Fundador ${e.sumarte.pase} (simulado).` : "Se consigue en Sumarte. Es simulado: no se cobra nada.",
    accion: e.sumarte.pase ? undefined : { tipo: "enlace", texto: "Ver el Pase Fundador", href: "/sumarte" },
    abre: puertasQueAbre({ pase: e.sumarte.pase ?? "semilla" }),
    legal: ["pasefundador"],
  });

  lista.push({
    id: "genesis",
    nombre: "Genesis",
    estado: e.presenciaGenesis ? "obtenido" : e.ticket ? "en-tramite" : "disponible",
    fecha: e.presenciaGenesis ? fechaDe("genesis") : undefined,
    detalle: e.presenciaGenesis
      ? "El anfitrión confirmó tu presencia en el check-in del Congreso."
      : e.ticket
        ? "Tu ticket está registrado. Falta el check-in en el Congreso: lo confirma el anfitrión."
        : "Se obtiene con el check-in en el Congreso. Primero registrá tu ticket.",
    accion: e.presenciaGenesis || e.ticket ? undefined : { tipo: "enlace", texto: "Registrar mi ticket", href: "/congreso" },
    abre: puertasQueAbre({ presenciaGenesis: true }),
    legal: ["presencia"],
  });

  lista.push({
    id: "residente",
    nombre: "Residente",
    estado: "no-disponible",
    detalle: "Ejemplo: todavía no se puede pedir. Se abrirá cuando haya residentes en el Lighthouse.",
    abre: puertasQueAbre({ residente: true }),
    legal: ["art32"],
  });

  return lista;
}

/** Fechas de los sellos obtenidos que todavía no se guardaron (hoy es el día en que se los vio por primera vez). */
export function fechasPorGuardar(lista: readonly Sello[], previas: FechasSellos): FechasSellos {
  const nuevas: FechasSellos = {};
  for (const s of lista) {
    if (s.estado === "obtenido" && s.fecha && !Object.hasOwn(previas, s.id)) nuevas[s.id] = s.fecha;
  }
  return nuevas;
}

/** Ids de las fechas guardadas de sellos que ya no están obtenidos: hay que borrarlas para que, si se vuelve a obtener, tenga fecha nueva. */
export function fechasPorQuitar(lista: readonly Sello[], previas: FechasSellos): string[] {
  if (lista.length === 0) return [];
  const obtenidos = new Set(lista.filter((s) => s.estado === "obtenido").map((s) => s.id));
  return Object.keys(previas).filter((id) => !obtenidos.has(id));
}

/** Lee las fechas guardadas; descarta lo que no sea una fecha. */
export function leerFechas(crudo: string | null): FechasSellos {
  if (!crudo) return {};
  try {
    const o: unknown = JSON.parse(crudo);
    if (typeof o !== "object" || o === null || Array.isArray(o)) return {};
    const salida: FechasSellos = {};
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === "string" && !Number.isNaN(Date.parse(v))) salida[k] = v;
    }
    return salida;
  } catch {
    return {};
  }
}
