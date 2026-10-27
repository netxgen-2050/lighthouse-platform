// Los sellos del pasaporte: cada uno certifica algo y abre puertas concretas.
// El estado sale de lo que ya hay en el navegador (Sumarte, membresía, Congreso, KYC);
// lo que abre sale del servicio de permisos (`lib/permisos/`).
import { filasDePuertas, type TribuAceptada } from "@/lib/canales/puertas";
import { textos } from "@/lib/idioma/textos";
import type { Idioma } from "@/lib/idioma/tipos";
import type { ClaveTermino } from "@/lib/legal/terminos";
import { COMUNIDAD_LIGHTHOUSE, estadoDe, type Membresias } from "@/lib/membresia/estado";
import type { Persona } from "@/lib/permisos/tipos";
import type { EstadoSumarte } from "@/lib/sumarte/estado";
import { listarTribus } from "@/lib/tribus/datos";
import type { DatosPersona } from "./datos";
import type { EstadoKyc } from "./kyc";

export type EstadoSello = "obtenido" | "en-tramite" | "disponible" | "no-disponible";

/** El texto del estado de un sello en el idioma pedido. */
export function textoEstadoSello(estado: EstadoSello, idioma: Idioma = "es"): string {
  const e = textos("pasaporte", idioma).sellos.estados;
  return { obtenido: e.obtenido, "en-tramite": e.enTramite, disponible: e.disponible, "no-disponible": e.noDisponible }[estado];
}

/** "Genesis" es un nombre propio: no se traduce. */
export const NOMBRE_GENESIS = "Genesis";

export type AccionSello = { tipo: "enlace"; texto: string; href: string };

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
export function puertasQueAbre(cambios: Partial<Persona>, tribus: readonly TribuAceptada[] = [], idioma: Idioma = "es"): string[] {
  const base = new Set(filasDePuertas(SIN_PERSONA, [], idioma).filter((f) => f.abierta).map((f) => f.clave));
  const con: Persona = { ...SIN_PERSONA, ...cambios };
  return filasDePuertas(con, tribus, idioma)
    .filter((f) => f.abierta && !base.has(f.clave))
    .map((f) => `${f.nombre} · ${f.estado}`);
}

/** Los sellos de la persona con sus textos en el idioma pedido (por defecto español). Lo que cambia con el idioma es solo el texto. */
export function sellos(e: EntradaSellos, ahora: Date, idioma: Idioma = "es"): Sello[] {
  const t = textos("pasaporte", idioma).sellos;
  const hoy = ahora.toISOString();
  const lista: Sello[] = [];
  const fechaDe = (id: string) => e.fechas[id] ?? hoy;
  /** La verificación se completa en la tarjeta de identidad del Pasaporte; los sellos solo llevan hasta ella. */
  const verVerificacion: AccionSello = { tipo: "enlace", texto: t.identidad.accion, href: "/pasaporte#identidad" };

  lista.push({
    id: "explorador",
    nombre: t.explorador.nombre,
    estado: "obtenido",
    fecha: fechaDe("explorador"),
    detalle: t.explorador.detalle,
    abre: filasDePuertas(SIN_PERSONA, [], idioma)
      .filter((f) => f.abierta)
      .map((f) => `${f.nombre} · ${f.estado}`),
  });

  const esMiembro = e.sumarte.plan === "miembro" || e.sumarte.pase !== null;
  lista.push({
    id: "miembro-red",
    nombre: t.miembroRed.nombre,
    estado: esMiembro ? "obtenido" : "disponible",
    fecha: esMiembro ? fechaDe("miembro-red") : undefined,
    detalle: esMiembro ? t.miembroRed.detalleSi : t.miembroRed.detalleNo,
    accion: esMiembro ? undefined : { tipo: "enlace", texto: t.miembroRed.accion, href: "/sumarte" },
    abre: puertasQueAbre({ plan: "miembro" }, [], idioma),
    legal: ["membresia"],
  });

  for (const c of comunidadesConSello()) {
    const m = estadoDe(e.membresias, c.id);
    const id = `comunidad:${c.id}`;
    const esLh = c.id === COMUNIDAD_LIGHTHOUSE;
    lista.push({
      id,
      nombre: t.comunidad.nombre(c.nombre),
      estado: m === "miembro" ? "obtenido" : m === "pedido" ? "en-tramite" : "disponible",
      fecha: m === "miembro" ? fechaDe(id) : undefined,
      detalle:
        m === "miembro"
          ? t.comunidad.detalleMiembro(c.nombre)
          : m === "pedido"
            ? t.comunidad.detallePedido(c.nombre)
            : t.comunidad.detalleDisponible(c.nombre),
      accion: m === "no-miembro" ? { tipo: "enlace", texto: t.comunidad.accion(c.nombre), href: esLh ? "/territorios/lighthouse" : `/tribus/${c.id}` } : undefined,
      abre: puertasQueAbre({ tribus: [c.id] }, [{ id: c.id, nombre: c.nombre }], idioma),
    });
  }

  const kycAprobado = e.kyc.estado === "aprobado";
  lista.push({
    id: "identidad",
    nombre: t.identidad.nombre,
    estado: kycAprobado ? "obtenido" : e.kyc.estado === "en-tramite" ? "en-tramite" : "disponible",
    fecha: e.kyc.estado === "aprobado" ? e.kyc.aprobado : undefined,
    detalle:
      e.kyc.estado === "aprobado"
        ? t.identidad.detalleAprobada
        : e.kyc.estado === "en-tramite"
          ? t.identidad.detalleEnTramite
          : t.identidad.detalleSin,
    accion: e.kyc.estado === "sin-tramite" ? verVerificacion : undefined,
    abre: [t.abre.invitacion, t.abre.aporte],
    legal: ["kyc"],
  });

  // Inversor habilitado: identidad verificada + residencia fiscal en Argentina.
  let inversor: Sello;
  if (kycAprobado && e.datos.residencia === "argentina") {
    inversor = {
      id: "inversor",
      nombre: t.inversor.nombre,
      estado: "obtenido",
      fecha: fechaDe("inversor"),
      detalle: t.inversor.detalleObtenido,
      abre: [t.abre.loteSiete],
      legal: ["sumarte"],
    };
  } else if (kycAprobado && e.datos.residencia === "exterior") {
    inversor = {
      id: "inversor",
      nombre: t.inversor.nombre,
      estado: "no-disponible",
      detalle: t.inversor.detalleExterior,
      abre: [],
      legal: ["sumarte"],
      legalDetalle: "inversorexterior",
    };
  } else {
    inversor = {
      id: "inversor",
      nombre: t.inversor.nombre,
      estado: "disponible",
      detalle: e.kyc.estado === "en-tramite" ? t.inversor.detalleEnTramite : t.inversor.detalleSin,
      accion: e.kyc.estado === "sin-tramite" ? verVerificacion : undefined,
      abre: [t.abre.loteSiete],
      legal: ["sumarte"],
    };
  }
  lista.push(inversor);

  // El nivel del pase se muestra con su nombre en el idioma de la página (en español, como siempre, con el id guardado).
  const nivelDelPase = e.sumarte.pase ? (idioma === "en" ? textos("sumarte", "en").niveles[e.sumarte.pase] : e.sumarte.pase) : "";
  lista.push({
    id: "fundador",
    nombre: t.fundador.nombre,
    estado: e.sumarte.pase ? "obtenido" : "disponible",
    fecha: e.sumarte.pase ? fechaDe("fundador") : undefined,
    detalle: e.sumarte.pase ? t.fundador.detalleSi(nivelDelPase) : t.fundador.detalleNo,
    accion: e.sumarte.pase ? undefined : { tipo: "enlace", texto: t.fundador.accion, href: "/sumarte" },
    abre: puertasQueAbre({ pase: e.sumarte.pase ?? "semilla" }, [], idioma),
    legal: ["pasefundador"],
  });

  lista.push({
    id: "genesis",
    nombre: NOMBRE_GENESIS,
    estado: e.presenciaGenesis ? "obtenido" : e.ticket ? "en-tramite" : "disponible",
    fecha: e.presenciaGenesis ? fechaDe("genesis") : undefined,
    detalle: e.presenciaGenesis ? t.genesis.detalleObtenido : e.ticket ? t.genesis.detalleTicket : t.genesis.detalleSin,
    accion: e.presenciaGenesis || e.ticket ? undefined : { tipo: "enlace", texto: t.genesis.accion, href: "/congreso" },
    abre: puertasQueAbre({ presenciaGenesis: true }, [], idioma),
    legal: ["presencia"],
  });

  lista.push({
    id: "residente",
    nombre: t.residente.nombre,
    estado: "no-disponible",
    detalle: t.residente.detalle,
    abre: puertasQueAbre({ residente: true }, [], idioma),
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
