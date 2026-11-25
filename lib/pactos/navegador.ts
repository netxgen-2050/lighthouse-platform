// Lo que los pactos hacen con el navegador: quién propone, publicar propuestas y guardar lo conciliado.
// Va aparte de `estado.ts` (puro) para que ese archivo no toque `localStorage`.
import { CLAVES } from "@/lib/demo/claves";
import { cargarPerfil } from "@/lib/perfil/modelo";
import { inicialesDeEmail } from "@/lib/sesion/iniciales";
import {
  afirmaPersona,
  datosDePostulacion,
  datosDePropuesta,
  sobreDe,
  sobrePuntual,
  type ConstanciaPacto,
  type QuienResponde,
} from "./constancias";
import {
  conciliar,
  propuestasPorPublicar,
  type EstadoPactos,
  type PactoPuntual,
  type PorPublicar,
  type RespuestaAplicada,
} from "./estado";
import type { Relacion } from "./postulacion";
import { agregarEnNavegador } from "./registro-compartido";

/** Lo mínimo de la sesión del cliente que hace falta para los pactos. */
export function quienRespondeDe(
  sesion: { idPersona: string; rol: string } | null,
  tribuLider: string | null,
): QuienResponde | null {
  return sesion ? { idPersona: sesion.idPersona, esSuperAdmin: sesion.rol === "superadmin", tribuLider } : null;
}

/** Nombre del perfil o, si está vacío, las iniciales del email. El email mismo nunca sale de acá. */
export function quienPropone(email: string | null | undefined): { nombre: string; iniciales: string } {
  let nombre = "";
  try {
    nombre = cargarPerfil(window.localStorage.getItem(CLAVES.perfilDatos), window.localStorage.getItem(CLAVES.perfil)).nombre;
  } catch {
    nombre = "";
  }
  return { nombre: nombre.trim(), iniciales: inicialesDeEmail(email) };
}

/** Publica una propuesta en el registro compartido. Devuelve la lista nueva o null si el navegador no deja. */
export function publicarPropuesta(
  p: PorPublicar,
  persona: { idPersona: string; email: string | null; lidera: boolean; migrada?: boolean },
  cuando: string,
): ConstanciaPacto[] | null {
  const quien = quienPropone(persona.email);
  return agregarEnNavegador(
    {
      esquema: "pacto-propone",
      afirma: afirmaPersona(persona.idPersona),
      por: persona.idPersona,
      sobre: sobreDe(p.comunidad, persona.idPersona),
      version: p.version,
      datos: datosDePropuesta({
        tipo: p.tipo,
        contenido: p.contenido,
        vigente: p.vigente,
        nombre: quien.nombre,
        iniciales: quien.iniciales,
        proponeLider: persona.lidera,
        migrada: persona.migrada,
      }),
    },
    cuando,
  );
}

/**
 * Publica una postulación a una tarea en el registro compartido. Devuelve la lista nueva, el id de la propuesta y el número de
 * envío de esta persona a esta necesidad (para registrar un evento por envío), o null si el navegador no deja.
 */
export function publicarPostulacion(
  p: { comunidad: string; puntual: PactoPuntual; holon: string; relacion: Relacion; lidera: boolean },
  persona: { idPersona: string; email: string | null },
  cuando: string,
): { lista: ConstanciaPacto[]; propuestaId: string; envio: number } | null {
  const quien = quienPropone(persona.email);
  const sobre = sobrePuntual(p.puntual.necesidadId, persona.idPersona);
  const lista = agregarEnNavegador(
    {
      esquema: "pacto-propone",
      afirma: afirmaPersona(persona.idPersona),
      por: persona.idPersona,
      sobre,
      version: 1,
      datos: datosDePostulacion({
        comunidad: p.comunidad,
        necesidad: p.puntual.necesidadId,
        holon: p.holon,
        relacion: p.relacion,
        rol: p.puntual.rol,
        rolOtro: p.puntual.rolOtro,
        descripcion: p.puntual.descripcion,
        horas: p.puntual.horas ?? 0,
        fecha: p.puntual.fecha ?? "",
        tope: p.puntual.tope,
        topeTotal: p.puntual.topeTotal,
        nombre: quien.nombre,
        iniciales: quien.iniciales,
        proponeLider: p.lidera,
      }),
    },
    cuando,
  );
  if (lista === null) return null;
  const propias = lista.filter((c) => c.esquema === "pacto-propone" && c.sobre === sobre);
  return { lista, propuestaId: propias[propias.length - 1].id, envio: propias.length };
}

/** Compatibilidad (design §8): publica lo enviado antes de este cambio que no está en el registro. Devuelve el registro al día. */
export function publicarLoQueFalta(
  estado: EstadoPactos,
  registro: ConstanciaPacto[] | null,
  persona: { idPersona: string; email: string | null; comunidadesQueResponde: readonly string[] },
  cuando: string,
): ConstanciaPacto[] | null {
  let actual = registro;
  for (const p of propuestasPorPublicar(estado, registro, persona.idPersona)) {
    actual =
      publicarPropuesta(
        p,
        { idPersona: persona.idPersona, email: persona.email, lidera: persona.comunidadesQueResponde.includes(p.comunidad), migrada: true },
        cuando,
      ) ?? actual;
  }
  return actual;
}

/** Concilia y, si hubo respuestas, guarda el estado de la persona. `guardado` es false si el navegador no dejó. */
export function conciliarYGuardar(
  base: EstadoPactos,
  registro: ConstanciaPacto[] | null,
  idPersona: string,
): { estado: EstadoPactos; aplicadas: RespuestaAplicada[]; guardado: boolean } {
  const r = conciliar(base, registro, idPersona);
  if (r.aplicadas.length === 0) return { ...r, guardado: true };
  try {
    window.localStorage.setItem(CLAVES.pactos, JSON.stringify(r.estado));
    return { ...r, guardado: true };
  } catch {
    return { ...r, guardado: false };
  }
}
