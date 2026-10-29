"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { KycDialogo } from "@/components/kyc-dialogo";
import { MarcaSemillas } from "@/components/marca-semillas";
import { useSesion } from "@/components/sesion/contexto";
import { comunidadesQueResponde, respuestaDe, sobrePuntual } from "@/lib/pactos/constancias";
import { horasDePostulacion, horasParaConciliar, marcarHecha, retirarHecha } from "@/lib/pactos/horas";
import { conciliarYGuardar, publicarLoQueFalta, publicarPostulacion, publicarPropuesta, quienRespondeDe } from "@/lib/pactos/navegador";
import {
  aperturaDePostulacion,
  comunidadQueResponde,
  holonDeId,
  nombreDeHolon,
  relacionConHolon,
} from "@/lib/pactos/postulacion";
import { buscarNecesidad, holonDe, idDeHolon } from "@/lib/tribus/necesidades";
import type { Idioma } from "@/lib/idioma/tipos";
import { PostulacionesATareas } from "./postulaciones";
import { actualizarEnNavegador, leerDelNavegador, revocarEnNavegador } from "@/lib/pactos/registro-compartido";
import { CLAVES } from "@/lib/demo/claves";
import { TerminoEconomico } from "@/components/termino-economico";
import { TerminoLegal } from "@/components/termino-legal";
import { semillasDePlata, semillasPorMes } from "@/lib/pactos/calculo";
import {
  HORAS,
  HOUR_REF_ARS,
  HOUR_REF_USD,
  HORAS_PUNTUAL,
  MONTO_USD,
  PESTANAS,
  RANGO_VARIABLE,
  ROLES,
  buscarRol,
  pasosDelPacto,
  textoDeRol,
  tituloDePestana,
  type ClaveRol,
} from "@/lib/pactos/datos";
import {
  INICIAL,
  MAX_DESCRIPCION,
  MAX_ROL_OTRO,
  compromisoDelPacto,
  deComunidad,
  leer,
  motivoNoDeclara,
  pactoCompleto,
  puntualDe,
  rangoValido,
  puntualesDe,
  reducir,
  reducirPuntual,
  totalAportes,
  ultimaPostulacion,
  ultimaPropuesta,
  type Accion,
  type AccionPuntual,
  type EdicionPuntual,
  type EstadoPactos,
  type RespuestaAplicada,
} from "@/lib/pactos/estado";
import { registrarEvento } from "@/lib/actividad/almacen";
import { usePreferencias } from "@/lib/configuracion/almacen";
import { formatearMonto, notaTipoDeCambio } from "@/lib/configuracion/preferencias";
import { EVENTOS } from "@/lib/actividad/eventos";
import { conMayuscula, formatearFecha, formatearNumero, nombreDelMes } from "@/lib/idioma/formatos";
import { aceptaFormato } from "@/lib/pactos/formatos";
import { mesDe } from "@/lib/pactos/mes";
import { declararMes } from "@/lib/pactos/mensual";
import { mesAtras } from "@/lib/semillas/calculo";
import { textoHorasDelPacto } from "@/lib/pactos/texto-horas";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { COMUNIDAD_LIGHTHOUSE, comunidadesDondeEsMiembro, estadoDe, leerMembresiaDelNavegador, type Membresias } from "@/lib/membresia/estado";
import { DATOS_VACIOS, type DatosPersona } from "@/lib/pasaporte/datos";
import { leerPasaporteDelNavegador } from "@/lib/pasaporte/del-navegador";
import { useKyc } from "@/lib/pasaporte/usar-kyc";
import { buscarTribu } from "@/lib/tribus/datos";

// Todo queda solo en este navegador: no hay pedidos de red ni cobros.
const BOTON =
  "w-fit rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60";
const BOTON_PRIMARIO = `${BOTON} bg-deep text-on-deep hover:bg-deep-2`;
const AVISO = "rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink";
const PANEL_LATERAL = "grid content-start gap-3 rounded-xl bg-surface-2 p-4";
const CAMPO = "rounded-lg border border-muted bg-surface px-3 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

function Ejemplo({ texto = "ejemplo" }: { texto?: string }) {
  return <span className="ml-1 rounded-full border border-faint px-2 text-xs text-muted">{texto}</span>;
}

function nombreComunidad(id: string): string {
  return id === COMUNIDAD_LIGHTHOUSE ? "Lighthouse" : (buscarTribu(id)?.nombre ?? id);
}

/**
 * Un campo numérico de horas (mínimo o máximo del rango). Guarda lo que se escribe como texto y solo lo manda cuando es un entero
 * par entre 0 y 80 (o al salir del campo, que lo acota): así escribir "30" no salta a "4" cuando se tipea el 3.
 */
function CampoHoras({ etiqueta, valor, alCambiar, descritoPor, invalido }: { etiqueta: string; valor: number; alCambiar: (n: number) => void; descritoPor?: string; invalido?: boolean }) {
  const [texto, setTexto] = useState(String(valor));
  useEffect(() => {
    setTexto(String(valor));
  }, [valor]);
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium">{etiqueta}</span>
      <input
        type="number"
        inputMode="numeric"
        min={RANGO_VARIABLE.min}
        max={RANGO_VARIABLE.max}
        step={RANGO_VARIABLE.paso}
        value={texto}
        aria-describedby={descritoPor}
        aria-invalid={invalido ? true : undefined}
        onChange={(e) => {
          setTexto(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value.trim() !== "" && Number.isInteger(n) && n >= RANGO_VARIABLE.min && n <= RANGO_VARIABLE.max && n % RANGO_VARIABLE.paso === 0) alCambiar(n);
        }}
        onBlur={() => {
          const n = Number(texto);
          if (texto.trim() === "" || !Number.isFinite(n)) setTexto(String(valor));
          else alCambiar(n);
        }}
        className={`${CAMPO} w-28`}
      />
    </label>
  );
}

type TextosPactos = ReturnType<typeof useTextos<"pactos">>;

/** El texto que se anuncia (y queda en pantalla) cuando se aplican respuestas de la tribu; vacío si no hubo ninguna. */
function anuncioDe(aplicadas: RespuestaAplicada[], tx: TextosPactos, idioma: Idioma): string {
  const a = aplicadas[aplicadas.length - 1];
  if (!a) return "";
  const donde = nombreComunidad(a.comunidad);
  const mes = a.mes ? nombreDelMes(a.mes, idioma) : "";
  if (a.tipo === "confirma-mes") return tx.mensual.confirmoLaComunidad(donde, mes);
  if (a.tipo === "revisa-mes") return tx.mensual.pidioRevisar(donde, mes, a.motivo ?? "");
  if (a.tipo === "preadmite") return tx.puntual.anuncios.preadmitida(holonConArticulo(a.holon, idioma, tx), tareaDe(a.necesidadId, idioma));
  if (a.tipo === "verifica")
    return tx.puntual.anunciosHecha.verificada(holonConArticulo(a.holon, idioma, tx), tareaDe(a.necesidadId, idioma), a.semillas ?? 0);
  if (a.tipo === "pide-revisar")
    return tx.puntual.anunciosHecha.pidioRevisar(holonConArticulo(a.holon, idioma, tx), tareaDe(a.necesidadId, idioma), a.motivo ?? "");
  if (a.tipo === "no-preadmite")
    return tx.puntual.anuncios.noPreadmitida(holonConArticulo(a.holon, idioma, tx), tareaDe(a.necesidadId, idioma), a.motivo ?? "");
  if (a.tipo === "acepta") return a.esCambio ? tx.anuncios.cambioAceptado(donde, a.version) : tx.anuncios.pactoAceptado(donde);
  return a.esCambio ? tx.avisoCambioNoAceptado(donde, a.motivo ?? "") : tx.anuncios.pactoNoAceptado(donde, a.motivo ?? "");
}

/** "El círculo Energía solar" (con mayúscula inicial) a partir del id del holón (`circulo:valle-3`). */
function holonConArticulo(holonId: string | undefined, idioma: Idioma, tx: TextosPactos): string {
  const h = holonId ? holonDeId(holonId) : null;
  if (!h) return "";
  const { nombre, tipo } = nombreDeHolon(h, idioma);
  const s = tx.puntual.holon(nombre, tipo);
  return s[0].toUpperCase() + s.slice(1);
}

function tareaDe(necesidadId: string | undefined, idioma: Idioma): string {
  return (necesidadId && buscarNecesidad(necesidadId, idioma)?.titulo) || "";
}

/** Mi recorrido: una sola vez por respuesta (todos los eventos llevan clave, también el rechazo de un cambio). */
function registrarEventosDe(aplicadas: RespuestaAplicada[], idioma: Idioma, tx: TextosPactos): void {
  for (const a of aplicadas) {
    const donde = nombreComunidad(a.comunidad);
    if (a.tipo === "confirma-mes" || a.tipo === "revisa-mes") {
      // Pedir revisar no registra evento: el motivo queda en el mes y se anuncia en pantalla.
      if (a.tipo === "confirma-mes" && a.mes) registrarEvento(EVENTOS.horasDelMesConfirmadas(a.mes, donde, a.comunidad));
    } else if (a.necesidadId && (a.tipo === "verifica" || a.tipo === "pide-revisar")) {
      const holon = holonConArticulo(a.holon, idioma, tx);
      const tarea = tareaDe(a.necesidadId, idioma);
      registrarEvento(
        a.tipo === "verifica"
          ? EVENTOS.horasVerificadas(holon, tarea, a.comunidad, a.necesidadId)
          : EVENTOS.horasARevisar(holon, tarea, a.comunidad, a.respuestaId ?? a.propuestaId),
      );
    } else if (a.necesidadId && (a.tipo === "preadmite" || a.tipo === "no-preadmite")) {
      const holon = holonConArticulo(a.holon, idioma, tx);
      const tarea = tareaDe(a.necesidadId, idioma);
      registrarEvento(
        a.tipo === "preadmite"
          ? EVENTOS.postulacionPreadmitida(holon, tarea, a.comunidad, a.necesidadId)
          : EVENTOS.postulacionNoPreadmitida(holon, tarea, a.comunidad, a.propuestaId),
      );
    } else if (a.tipo === "acepta") {
      if (a.esCambio) registrarEvento(EVENTOS.cambioDePactoAceptado(donde, a.comunidad, a.version));
      else {
        registrarEvento(EVENTOS.pactoAceptado(donde, a.comunidad));
        registrarEvento(EVENTOS.rondaAbierta(donde, a.comunidad));
      }
    } else if (a.esCambio) registrarEvento(EVENTOS.cambioDePactoRechazado(donde, a.comunidad, a.propuestaId));
    else registrarEvento(EVENTOS.pactoNoAceptado(donde, a.comunidad, a.propuestaId));
  }
}

export function PactosCliente() {
  const idioma = useIdioma();
  const tx = useTextos("pactos");
  const { sesion, tribuLider } = useSesion();
  const idPersona = sesion?.idPersona ?? null;
  const email = sesion?.email ?? null;
  const rolSesion = sesion?.rol ?? null;
  const quien = quienRespondeDe(idPersona && rolSesion ? { idPersona, rol: rolSesion } : null, tribuLider);
  // Lo que la carga inicial necesita de la sesión, sin volver a cargar cuando cambia (p. ej. al terminar de calcular el nivel).
  const contexto = useRef({ tx, quien, email, idioma });
  useEffect(() => {
    contexto.current = { tx, quien, email, idioma };
  });
  const router = useRouter();
  // El parámetro `necesidad` de la dirección se procesa una sola vez.
  const necesidadProcesada = useRef(false);
  const [membresias, setMembresias] = useState<Membresias>({});
  // Postulación cuyo estado recibe el foco después de enviarla o retirarla (el botón apretado desaparece).
  const [focoPuntual, setFocoPuntual] = useState<string | null>(null);
  const [mensajeNecesidad, setMensajeNecesidad] = useState<{ tipo: "no-se-puede" } | { tipo: "sin-relacion"; tribu: string } | null>(null);
  const pasaporte = useTextos("pasaporte");
  const comunes = useTextos("comunes");
  const textoSemillas = useTextos("semillas");
  // Lo que escribe la persona (descripción del pacto, rol "Otro") nunca se traduce. No se guarda en qué idioma se escribió:
  // con la interfaz en inglés se marca como español, que es lo que se escribe hoy.
  const langTexto = idioma === "en" ? "es" : undefined;
  /** Número según el idioma: "1.200" en español, "1,200" en inglés. */
  const miles = (n: number) => formatearNumero(n, idioma);
  const [estado, setEstado] = useState<EstadoPactos>(INICIAL);
  useEffect(() => {
    if (!focoPuntual) return;
    document.getElementById(`estado-puntual-${focoPuntual}`)?.focus();
    setFocoPuntual(null);
  }, [focoPuntual, estado]);
  const [errorHoras, setErrorHoras] = useState<{ necesidadId: string; texto: string } | null>(null);
  // Horas de un mes de un pacto variable: lo que se escribe (por comunidad y mes) y el último error.
  const [horasMes, setHorasMes] = useState<Record<string, string>>({});
  const [errorMes, setErrorMes] = useState<{ clave: string; texto: string } | null>(null);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [listo, setListo] = useState(false);
  const foco = useRef(false);
  const [anuncio, setAnuncio] = useState("");
  // La propuesta no llegó al registro compartido (el navegador no dejó): la tribu no la va a ver.
  const [falloPublicar, setFalloPublicar] = useState<"envio" | "retiro" | null>(null);
  // Lo que la persona cargó en "Tus datos"; lo que no cargó queda sin dato.
  const [datos, setDatos] = useState<DatosPersona>(DATOS_VACIOS);
  // Comunidades donde la persona es miembro: solo ahí puede proponer un pacto.
  const [miembro, setMiembro] = useState<string[]>([]);
  const [elegida, setElegida] = useState("");
  const [monto, setMonto] = useState(String(MONTO_USD.inicial));
  const [dialogoKyc, setDialogoKyc] = useState(false);
  const kyc = useKyc();
  const { moneda } = usePreferencias();

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    setDatos(leerPasaporteDelNavegador());
    const todas = leerMembresiaDelNavegador();
    setMembresias(todas);
    const comunidades = comunidadesDondeEsMiembro(todas);
    setMiembro(comunidades);
    const parametros = new URLSearchParams(window.location.search);
    const pedida = parametros.get("comunidad");
    let leido: EstadoPactos = INICIAL;
    try {
      leido = leer(window.localStorage.getItem(CLAVES.pactos));
    } catch {
      setFalloAlmacen(true);
    }
    if (idPersona) {
      const { tx: t, quien: q, email: correo, idioma: lang } = contexto.current;
      // Un pacto enviado antes de este cambio se publica una vez (design §8); con el registro ilegible no se publica nada.
      const registro = publicarLoQueFalta(
        leido,
        leerDelNavegador(),
        { idPersona, email: correo, comunidadesQueResponde: q ? comunidadesQueResponde(q) : [] },
        new Date().toISOString(),
      );
      // Las respuestas de la tribu se aplican, se guardan, se anuncian y se registran una sola vez.
      const r = conciliarYGuardar(leido, registro, idPersona);
      if (!r.guardado) setFalloAlmacen(true);
      if (r.aplicadas.length > 0) {
        setAnuncio(anuncioDe(r.aplicadas, t, lang));
        registrarEventosDe(r.aplicadas, lang, t);
      }
      leido = r.estado;
      // El parámetro `necesidad` se procesa una sola vez y recién ahora, con la membresía ya leída (design §5).
      const necesidadPedida = parametros.get("necesidad");
      if (necesidadPedida && !necesidadProcesada.current) {
        necesidadProcesada.current = true;
        const apertura = aperturaDePostulacion(todas, pedida ?? "", necesidadPedida);
        if (apertura.tipo === "crear") {
          const nuevo = reducirPuntual(leido, { tipo: "nuevoPuntual", comunidad: apertura.necesidad.tribuId, necesidad: apertura.necesidad });
          if (nuevo !== leido) {
            try {
              window.localStorage.setItem(CLAVES.pactos, JSON.stringify(nuevo));
            } catch {
              setFalloAlmacen(true);
            }
            setAnuncio(t.puntual.creada(buscarNecesidad(necesidadPedida, lang)?.titulo ?? ""));
          }
          leido = nuevo;
        } else {
          setMensajeNecesidad(apertura.tipo === "sin-relacion" ? { tipo: "sin-relacion", tribu: apertura.tribu } : { tipo: "no-se-puede" });
        }
        // La dirección vuelve a la de siempre: recargar no vuelve a crear nada.
        router.replace(pedida ? `/pactos?comunidad=${encodeURIComponent(pedida)}` : "/pactos");
      }
    }
    // Comunidades donde se puede estar: donde es miembro y donde tiene postulaciones (aspirante, o miembro de otra tribu del círculo).
    const conPostulaciones = puntualesDe(leido).map((x) => x.comunidad);
    const opcionesLeidas = [...new Set([...comunidades, ...conPostulaciones])];
    setElegida(pedida && opcionesLeidas.includes(pedida) ? pedida : (opcionesLeidas[0] ?? ""));
    setEstado(leido);
    setListo(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- el router y el contexto no deben volver a disparar la carga
  }, [idPersona]);

  // El botón de paso desaparece al apretarlo: el foco pasa al estado nuevo.
  const tiempoActual = elegida ? deComunidad(estado, elegida).tiempo : null;
  const pasoActual = tiempoActual ? tiempoActual.paso * 10 + (tiempoActual.cambio ? tiempoActual.cambio.paso + 1 : 0) : 0;
  useEffect(() => {
    if (!foco.current) return;
    document.querySelector<HTMLElement>("[data-foco-paso]")?.focus();
    foco.current = false;
  }, [pasoActual]);

  function dispatch(original: Accion) {
    // Las fechas las pone la pantalla: el reductor es puro.
    const ahora = new Date().toISOString();
    const accion: Accion = original;
    const siguiente = reducir(estado, accion);
    const comunidadId = "comunidad" in accion ? accion.comunidad : null;
    if (comunidadId !== null && siguiente !== estado && idPersona) {
      const antes = deComunidad(estado, comunidadId).tiempo;
      const lidera = quien ? comunidadesQueResponde(quien).includes(comunidadId) : false;
      const persona = { idPersona, email, lidera };
      if (accion.tipo === "avanzar" && antes.paso === 0) {
        // Enviar escribe la propuesta en el registro compartido; si el navegador no deja, no se envía.
        // El contenido sale del estado nuevo: al enviar, el pacto variable ya lleva el compromiso de la comunidad.
        const ok = publicarPropuesta(
          { comunidad: comunidadId, tipo: "nuevo", contenido: deComunidad(siguiente, comunidadId).tiempo, version: antes.version + 1 },
          persona,
          ahora,
        );
        setFalloPublicar(ok === null ? "envio" : null);
        if (ok === null) return;
      } else if (accion.tipo === "enviarCambio" && antes.cambio) {
        const ok = publicarPropuesta(
          { comunidad: comunidadId, tipo: "cambio", contenido: antes.cambio, version: antes.version + 1, vigente: { modalidad: antes.modalidad, horas: antes.horas, rango: antes.rango } },
          persona,
          ahora,
        );
        setFalloPublicar(ok === null ? "envio" : null);
        if (ok === null) return;
      } else if (accion.tipo === "retirar" || accion.tipo === "retirarCambio") {
        const registro = leerDelNavegador();
        const propuesta = registro ? ultimaPropuesta(registro, idPersona, comunidadId, accion.tipo === "retirar" ? "nuevo" : "cambio") : null;
        if (registro && propuesta) {
          if (respuestaDe(registro, propuesta.id)) {
            // La tribu ya respondió: se aplica su respuesta y no se retira nada.
            const r = conciliarYGuardar(estado, registro, idPersona);
            if (!r.guardado) setFalloAlmacen(true);
            foco.current = true;
            setAnuncio(anuncioDe(r.aplicadas, tx, idioma));
            registrarEventosDe(r.aplicadas, idioma, tx);
            setEstado(r.estado);
            return;
          }
          // Si no se pudo escribir, no se retira: la tribu seguiría viendo la propuesta pendiente.
          const ok = revocarEnNavegador(propuesta.id, idPersona, ahora);
          setFalloPublicar(ok === null ? "retiro" : null);
          if (ok === null) return;
        }
      }
    }
    if (comunidadId !== null && siguiente !== estado) {
      const despuesT = deComunidad(siguiente, comunidadId).tiempo;
      const donde = nombreComunidad(comunidadId);
      if (accion.tipo === "retirarCambio") {
        foco.current = true;
        setAnuncio(tx.anuncios.cambioRetirado(donde));
      } else if (accion.tipo === "retirar") {
        foco.current = true;
        setAnuncio(tx.anuncios.retiraste(donde));
      } else if (accion.tipo === "proponerCambio") {
        foco.current = true;
        setAnuncio(tx.anuncios.cambioAbierto);
      } else if (accion.tipo === "enviarCambio") {
        foco.current = true;
        setAnuncio(tx.anuncios.cambioEnviado(donde));
        registrarEvento(EVENTOS.propusisteCambioDePacto(donde, comunidadId));
      } else if (accion.tipo === "descartarCambio") {
        foco.current = true;
        setAnuncio(tx.anuncios.cambioDescartado(despuesT.version));
      }
    }
    try {
      window.localStorage.setItem(CLAVES.pactos, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      // No se pudo guardar: la pantalla sigue respondiendo en memoria y se avisa.
      setFalloAlmacen(true);
    }
    if (accion.tipo === "avanzar") {
      foco.current = true;
      // Solo se anuncia lo que provoca la persona en esta sesión, no lo que ya estaba guardado.
      const paso = deComunidad(siguiente, accion.comunidad).tiempo.paso;
      const donde = nombreComunidad(accion.comunidad);
      setAnuncio(paso === 1 ? tx.anuncios.pactoEnviado(donde) : "");
      const antes = deComunidad(estado, accion.comunidad).tiempo.paso;
      if (paso === 1 && antes === 0) registrarEvento(EVENTOS.propusistePacto(donde, accion.comunidad));
    }
    setEstado(siguiente);
  }

  function guardarEstado(siguiente: EstadoPactos) {
    try {
      window.localStorage.setItem(CLAVES.pactos, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
    }
    setEstado(siguiente);
  }

  /** Marcar la tarea hecha: escribe la propuesta de horas en el registro (releído) y recién después cambia el estado. */
  function marcarHechaDe(comunidadId: string, necesidadId: string, horas: number) {
    if (!idPersona) return;
    if (!Number.isInteger(horas) || horas < HORAS_PUNTUAL.min || horas > HORAS_PUNTUAL.max) {
      setErrorHoras({ necesidadId, texto: tx.puntual.horasFuera });
      return;
    }
    setErrorHoras(null);
    const puntual = puntualDe(estado, comunidadId, necesidadId);
    const n = buscarNecesidad(necesidadId, idioma);
    if (!puntual || puntual.paso !== "preadmitido" || !n) return;
    let resultado = "";
    let propuestaHorasId = "";
    const nueva = actualizarEnNavegador((lista) => {
      const r = marcarHecha(lista, { idPersona, necesidadId, sobre: sobrePuntual(necesidadId, idPersona), horas }, new Date().toISOString());
      resultado = r.resultado;
      propuestaHorasId = r.id ?? "";
      return r.resultado === "ok" ? r.lista : null;
    });
    if (resultado === "ya-marcada") {
      // El registro ya tiene la propuesta (otra pestaña, o el estado local quedó atrás): se concilia el estado local, no es error.
      const registro = leerDelNavegador();
      const post = registro ? ultimaPostulacion(registro, idPersona, necesidadId) : null;
      const viva = registro && post ? horasDePostulacion(registro, post.id) : null;
      const horasViva = viva ? Number(viva.datos.horas) : horas;
      setFalloPublicar(null);
      setAnuncio(tx.puntual.anunciosHecha.marcada(n.titulo));
      const marcado = reducirPuntual(estado, { tipo: "marcarHecha", comunidad: comunidadId, necesidadId, horasReales: Number.isInteger(horasViva) ? horasViva : horas });
      if (registro) {
        // Si el holón ya respondió esas horas, se aplica su respuesta sobre el estado marcado (y se anuncia una sola vez).
        const r = conciliarYGuardar(marcado, registro, idPersona);
        if (!r.guardado) setFalloAlmacen(true);
        if (r.aplicadas.length > 0) {
          setAnuncio(anuncioDe(r.aplicadas, tx, idioma));
          registrarEventosDe(r.aplicadas, idioma, tx);
        }
        setEstado(r.estado);
      } else {
        guardarEstado(marcado);
      }
      setFocoPuntual(necesidadId);
      return;
    }
    if (nueva === null || resultado !== "ok") {
      setFalloPublicar("envio");
      setAnuncio(tx.puntual.anunciosHecha.noSePudo);
      return;
    }
    setFalloPublicar(null);
    if (resultado === "ok") registrarEvento(EVENTOS.marcasteHecha(n.titulo, nombreComunidad(n.tribuId), comunidadId, necesidadId, propuestaHorasId));
    setAnuncio(tx.puntual.anunciosHecha.marcada(n.titulo));
    guardarEstado(reducirPuntual(estado, { tipo: "marcarHecha", comunidad: comunidadId, necesidadId, horasReales: horas }));
    setFocoPuntual(necesidadId);
  }

  /** Retirar lo hecho: relee el registro; si el holón ya respondió, no escribe el `revoca` y se aplica su respuesta. */
  function retirarHechaDe(comunidadId: string, necesidadId: string) {
    if (!idPersona) return;
    const registro = leerDelNavegador();
    if (!registro) {
      setFalloPublicar("retiro");
      return;
    }
    const post = ultimaPostulacion(registro, idPersona, necesidadId);
    const h = post ? horasParaConciliar(registro, post.id) : null;
    if (h) {
      let resultado = "";
      const nueva = actualizarEnNavegador((lista) => {
        const r = retirarHecha(lista, { idPersona, propuestaHorasId: h.id }, new Date().toISOString());
        resultado = r.resultado;
        return r.resultado === "ok" ? r.lista : null;
      });
      if (nueva === null) {
        setFalloPublicar("retiro");
        return;
      }
      if (resultado === "ya-respondida") {
        const r = conciliarYGuardar(estado, nueva, idPersona);
        if (!r.guardado) setFalloAlmacen(true);
        setAnuncio(r.aplicadas.length > 0 ? anuncioDe(r.aplicadas, tx, idioma) : tx.puntual.anunciosHecha.yaRespondidas);
        registrarEventosDe(r.aplicadas, idioma, tx);
        setEstado(r.estado);
        setFocoPuntual(necesidadId);
        return;
      }
    }
    setFalloPublicar(null);
    setAnuncio(tx.puntual.anunciosHecha.retirada);
    guardarEstado(reducirPuntual(estado, { tipo: "retirarHecha", comunidad: comunidadId, necesidadId }));
    setFocoPuntual(necesidadId);
  }

  /**
   * Declarar (o corregir) las horas de un mes de un pacto variable: sin proponer un cambio. Se relee el registro y, si la declaración
   * ya tiene respuesta, no se escribe nada y se concilia; recién después cambia el estado.
   */
  function declararHoras(comunidadId: string, mes: string, texto: string) {
    if (!idPersona) return;
    const clave = `${comunidadId}|${mes}`;
    const fallo = (t: string) => {
      setErrorMes({ clave, texto: t });
      setAnuncio("");
    };
    const t = deComunidad(estado, comunidadId).tiempo;
    const horas = Number(texto);
    if (texto.trim() === "" || !Number.isInteger(horas) || horas < RANGO_VARIABLE.min || horas > RANGO_VARIABLE.max || horas % RANGO_VARIABLE.paso !== 0) {
      fallo(tx.mensual.horasInvalidas);
      return;
    }
    const ahora = new Date().toISOString();
    const motivoNo = motivoNoDeclara(t, mes, horas, ahora);
    if (motivoNo !== null) {
      fallo(
        motivoNo === "fuera-de-rango"
          ? tx.mensual.fueraDeRango(miles(t.rango.min), miles(t.rango.max))
          : motivoNo === "confirmada"
            ? tx.mensual.yaConfirmado
            : motivoNo === "mes"
              ? tx.mensual.mesNoDeclarable
              : tx.mensual.sinPacto,
      );
      return;
    }
    setErrorMes(null);
    let resultado = "";
    let propuestaId = "";
    const nueva = actualizarEnNavegador((lista) => {
      const r = declararMes(lista, { idPersona, comunidad: comunidadId, mes, horas }, ahora);
      resultado = r.resultado;
      propuestaId = r.id ?? "";
      return r.resultado === "ok" ? r.lista : null;
    });
    if (nueva === null || (resultado !== "ok" && resultado !== "ya-respondida")) {
      setFalloPublicar("envio");
      setAnuncio(tx.mensual.noSePudo);
      return;
    }
    if (resultado === "ya-respondida") {
      // La comunidad ya confirmó ese mes (otra pestaña, o el estado local quedó atrás): se concilia y no se corrige.
      const r = conciliarYGuardar(estado, nueva, idPersona);
      if (!r.guardado) setFalloAlmacen(true);
      setAnuncio(r.aplicadas.length > 0 ? anuncioDe(r.aplicadas, tx, idioma) : tx.mensual.yaRespondidas);
      registrarEventosDe(r.aplicadas, idioma, tx);
      setEstado(r.estado);
      return;
    }
    setFalloPublicar(null);
    const corrigio = t.declaradas[mes]?.estado === "declarada";
    // Una vez por comunidad y mes: corregir no agrega otro evento (la clave del evento lo evita).
    registrarEvento(EVENTOS.declarasteHoras(horas, mes, nombreComunidad(comunidadId), comunidadId));
    const nombreMes = nombreDelMes(mes, idioma);
    setAnuncio(corrigio ? tx.mensual.corregiste(nombreMes, horas) : tx.mensual.declaraste(nombreMes, horas));
    guardarEstado(reducir(estado, { tipo: "declarar", comunidad: comunidadId, mes, horas, propuestaId, ahora }));
  }

  /** Las postulaciones a tareas: enviar y retirar escriben en el registro compartido; las respuestas del holón solo llegan por conciliación. */
  function accionPuntual(accion: AccionPuntual) {
    const siguiente = reducirPuntual(estado, accion);
    if (siguiente === estado) return;
    const ahora = new Date().toISOString();
    const comunidadId = accion.comunidad;
    const necesidadId = "necesidadId" in accion ? accion.necesidadId : accion.necesidad.id;
    const n = buscarNecesidad(necesidadId, idioma);
    const holon = n ? holonDe(n) : null;
    if (accion.tipo === "enviarPuntual" && idPersona) {
      const puntual = puntualDe(siguiente, comunidadId, necesidadId);
      const relacion = holon ? relacionConHolon(membresias, holon) : null;
      if (!puntual || !n || !holon || !relacion) {
        setFalloPublicar("envio");
        return;
      }
      const lidera = quien ? comunidadesQueResponde(quien).includes(comunidadQueResponde(holon)) : false;
      // Enviar escribe la postulación en el registro compartido; si el navegador no deja, no se envía.
      const ok = publicarPostulacion({ comunidad: comunidadId, puntual, holon: idDeHolon(holon), relacion, lidera }, { idPersona, email }, ahora);
      setFalloPublicar(ok === null ? "envio" : null);
      if (ok === null) return;
      registrarEvento(EVENTOS.tePostulaste(n.titulo, nombreComunidad(n.tribuId), comunidadId, necesidadId, ok.envio));
      setAnuncio(tx.puntual.anuncios.enviada);
      setFocoPuntual(necesidadId);
    } else if (accion.tipo === "retirarPuntual" && idPersona) {
      const registro = leerDelNavegador();
      // Con el registro ilegible no se puede retirar: el holón seguiría viendo la postulación (se avisa y sigue Enviada).
      if (!registro) {
        setFalloPublicar("retiro");
        return;
      }
      const propuesta = ultimaPostulacion(registro, idPersona, necesidadId);
      if (propuesta) {
        if (respuestaDe(registro, propuesta.id)) {
          // El holón ya respondió: se aplica su respuesta y no se retira nada.
          const r = conciliarYGuardar(estado, registro, idPersona);
          if (r.aplicadas.length > 0) {
            if (!r.guardado) setFalloAlmacen(true);
            setAnuncio(anuncioDe(r.aplicadas, tx, idioma));
            registrarEventosDe(r.aplicadas, idioma, tx);
            setEstado(r.estado);
            setFocoPuntual(necesidadId);
            return;
          }
          // La respuesta no vale (p. ej. la dio la misma persona): la postulación sigue pendiente y se puede retirar.
        }
        // Si no se pudo escribir, no se retira: el holón seguiría viendo la postulación pendiente.
        const ok = revocarEnNavegador(propuesta.id, idPersona, ahora);
        setFalloPublicar(ok === null ? "retiro" : null);
        if (ok === null) return;
      }
      setAnuncio(tx.puntual.anuncios.retirada);
      setFocoPuntual(necesidadId);
    } else if (accion.tipo === "descartarPuntual") {
      setAnuncio(tx.puntual.anuncios.descartada);
    }
    try {
      window.localStorage.setItem(CLAVES.pactos, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
    }
    setEstado(siguiente);
  }

  function alTeclearPestana(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const n = PESTANAS.length;
    const j = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : (i + delta + n) % n;
    dispatch({ tipo: "pestana", pestana: PESTANAS[j][0] });
    document.getElementById(`pestana-${PESTANAS[j][0]}`)?.focus();
  }

  if (!listo) return <p role="status" className="text-sm text-muted">{tx.cargando}</p>;

  // Se puede estar en una comunidad como miembro o con postulaciones a sus tareas (aspirante, o miembro de otra tribu del círculo).
  const opciones = [...new Set([...miembro, ...puntualesDe(estado).map((x) => x.comunidad)])];
  const avisoNecesidad = mensajeNecesidad && (
    <p role="status" className={AVISO} data-testid="aviso-necesidad">
      {mensajeNecesidad.tipo === "sin-relacion" ? (
        <>
          {tx.puntual.sinRelacion(nombreComunidad(mensajeNecesidad.tribu))}{" "}
          <Link className="underline" href={`/tribus/${mensajeNecesidad.tribu}/manifiesto`}>
            {tx.puntual.verManifiesto}
          </Link>
        </>
      ) : (
        tx.puntual.noSePuede
      )}
    </p>
  );

  if (opciones.length === 0) {
    return (
      <div className="grid gap-4">
        {avisoNecesidad}
        <section aria-label={tx.sinComunidad.aria} className="grid gap-3 rounded-xl border border-faint bg-surface p-4">
          <p>{tx.sinComunidad.texto}</p>
          <Link className={BOTON_PRIMARIO} href="/tribus">
            {tx.sinComunidad.ver}
          </Link>
        </section>
      </div>
    );
  }

  const comunidad = opciones.includes(elegida) ? elegida : opciones[0];
  const esMiembro = miembro.includes(comunidad);
  const puntualesDeLaComunidad = deComunidad(estado, comunidad).puntuales;
  const nombre = nombreComunidad(comunidad);
  const mias = deComunidad(estado, comunidad);
  const t = mias.tiempo;
  const rol = buscarRol(t.rol);
  const editable = t.paso === 0;
  const pasoCambio = t.cambio?.paso ?? 0;
  const cambioCompleto = t.cambio ? pactoCompleto(t.cambio) : false;
  const semillas = semillasPorMes(t.horas);
  const esVariable = t.modalidad === "variable";
  const puedeVariable = aceptaFormato(comunidad, "variable");
  // Con horas variables, el aviso de aporte remoto mira el máximo del rango.
  const horasTope = esVariable ? t.rango.max : t.horas;
  const ahoraRender = new Date().toISOString();
  const mesEnCurso = mesDe(ahoraRender);
  const lineaDeMes = (mes: string): string => {
    const d = Object.hasOwn(t.declaradas, mes) ? t.declaradas[mes] : undefined;
    const m = conMayuscula(nombreDelMes(mes, idioma));
    if (!d) return tx.mensual.estado.sinDato(m);
    if (d.estado === "confirmada") return tx.mensual.estado.confirmada(m, d.horas, nombre);
    return d.estado === "declarada" ? tx.mensual.estado.declarada(m, d.horas, nombre) : tx.mensual.estado.aRevisar(m, d.horas, nombre);
  };
  /** Campo de horas de un mes y su botón. Es una función (no un componente) para no perder el foco al escribir. */
  const formularioDeMes = (mes: string, boton: string) => {
    const clave = `${comunidad}|${mes}`;
    const previa = Object.hasOwn(t.declaradas, mes) ? t.declaradas[mes] : undefined;
    const valorCampo = horasMes[clave] ?? (previa ? String(previa.horas) : "");
    const error = errorMes?.clave === clave ? errorMes.texto : "";
    const m = conMayuscula(nombreDelMes(mes, idioma));
    return (
      <div className="grid gap-2">
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">{tx.mensual.campo(m)}</span>
            <input
              type="number"
              inputMode="numeric"
              min={t.rango.min}
              max={t.rango.max}
              step={RANGO_VARIABLE.paso}
              value={valorCampo}
              aria-describedby={error ? `error-mes-${mes}` : undefined}
              aria-invalid={error ? true : undefined}
              onChange={(e) => {
                setHorasMes((h) => ({ ...h, [clave]: e.target.value }));
                setErrorMes(null);
              }}
              className={`${CAMPO} w-28`}
            />
          </label>
          <button type="button" className={BOTON_PRIMARIO} onClick={() => declararHoras(comunidad, mes, valorCampo)}>
            {boton}
          </button>
        </div>
        {error && (
          <p id={`error-mes-${mes}`} role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    );
  };
  const montoNumero = Number(monto);
  const montoValido = monto.trim() !== "" && Number.isInteger(montoNumero) && montoNumero >= MONTO_USD.min && montoNumero <= MONTO_USD.max;
  const totalPlata = totalAportes(mias);

  return (
    <div className="grid gap-4">
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          {tx.errorAlmacenamiento}
        </p>
      )}
      {falloPublicar && (
        <p role="alert" className="text-sm font-medium text-danger">
          {falloPublicar === "retiro" ? tx.anuncios.noSePudoRetirar : tx.anuncios.noSePudoPublicar}
        </p>
      )}
      {avisoNecesidad}
      <section aria-label={tx.comunidad.aria} className="grid gap-2 rounded-xl border border-faint bg-surface p-4">
        <label className="grid gap-1 text-sm">
          <span className="font-medium">{tx.comunidad.pregunta}</span>
          <select
            value={comunidad}
            onChange={(e) => {
              setAnuncio("");
              setElegida(e.target.value);
            }}
            className={`${CAMPO} w-fit`}
          >
            {opciones.map((id) => (
              <option key={id} value={id}>
                {nombreComunidad(id)}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-muted"><MarcaSemillas texto={tx.comunidad.ayuda} /></p>
      </section>

      {!esMiembro && (
        <>
          <p className="rounded-xl border border-faint bg-surface p-4" data-testid="nota-aspirante">
            {estadoDe(membresias, comunidad) === "pedido" ? tx.puntual.aspirante(nombreComunidad(comunidad)) : tx.puntual.porOtraTribu(nombreComunidad(comunidad))}
          </p>
          <p role="status" className="sr-only">
            {anuncio}
          </p>
        </>
      )}
      {esMiembro && (
      <section aria-label={tx.estadoAria} className="grid gap-4 rounded-xl border border-faint bg-surface p-4">
        {estado.pestana === "tiempo" && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ol className="flex flex-wrap gap-2" aria-label={tx.pasosAria}>
              {pasosDelPacto(idioma).map((p, i) => (
                <li
                  key={p}
                  aria-current={i === t.paso ? "step" : undefined}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    i <= t.paso ? "border-deep bg-green-soft font-medium text-deep" : "border-faint text-muted"
                  }`}
                >
                  {i < t.paso ? "✓ " : ""}
                  {p}
                </li>
              ))}
            </ol>
            {t.version > 0 && <span className="text-sm text-muted" data-testid="version-pacto">{tx.version(t.version)}</span>}
          </div>
        )}

        <div role="tablist" aria-label={tx.tipoAria} className="flex flex-wrap gap-2 border-b border-line pb-2">
          {PESTANAS.map(([clave], i) => {
            const titulo = tituloDePestana(clave, idioma);
            const activa = estado.pestana === clave;
            return (
              <button
                key={clave}
                id={`pestana-${clave}`}
                type="button"
                role="tab"
                aria-selected={activa}
                aria-controls={`panel-${clave}`}
                tabIndex={activa ? 0 : -1}
                onClick={() => dispatch({ tipo: "pestana", pestana: clave })}
                onKeyDown={(e) => alTeclearPestana(e, i)}
                className={`rounded-lg px-4 py-1.5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep ${
                  activa ? "bg-deep text-on-deep" : "border border-muted hover:bg-surface-2"
                }`}
              >
                {titulo}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" id={`panel-${estado.pestana}`} aria-labelledby={`pestana-${estado.pestana}`}>
          {estado.pestana === "tiempo" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid content-start gap-4">
              <fieldset disabled={!editable} className="grid content-start gap-4 border-0 p-0">
                <legend className="sr-only">{tx.tiempo.legend(nombre)}</legend>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">{tx.tiempo.rol(nombre)}</span>
                  <select
                    value={t.rol}
                    onChange={(e) => dispatch({ tipo: "rol", comunidad, rol: e.target.value as ClaveRol | "" })}
                    className={`${CAMPO} w-fit`}
                  >
                    <option value="">{tx.tiempo.elegiRol}</option>
                    {ROLES.map((r) => (
                      <option key={r.clave} value={r.clave}>
                        {textoDeRol(r, idioma).nombre}
                      </option>
                    ))}
                  </select>
                </label>
                {rol && (
                  <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm" data-testid="rol-descripcion">
                    <b>{textoDeRol(rol, idioma).nombre}</b>: {textoDeRol(rol, idioma).descripcion}
                  </p>
                )}
                {t.rol === "otro" && (
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">{tx.tiempo.queRol}</span>
                    <input
                      type="text"
                      maxLength={MAX_ROL_OTRO}
                      value={t.rolOtro}
                      lang={langTexto}
                      onChange={(e) => dispatch({ tipo: "rolOtro", comunidad, texto: e.target.value })}
                      className={CAMPO}
                    />
                  </label>
                )}
                {t.rol && (
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">{tx.tiempo.descripcion}</span>
                    <textarea
                      rows={3}
                      maxLength={MAX_DESCRIPCION}
                      value={t.descripcion}
                      lang={langTexto}
                      onChange={(e) => dispatch({ tipo: "descripcion", comunidad, texto: e.target.value })}
                      className={CAMPO}
                    />
                  </label>
                )}
                {(puedeVariable || esVariable) && (
                  <fieldset className="grid gap-2 border-0 p-0" data-testid="modalidad">
                    <legend className="mb-1 text-sm font-medium">{tx.tiempo.modalidad.legend}</legend>
                    {(["fija", "variable"] as const).map((m) => (
                      <label key={m} className="flex items-start gap-2 text-sm">
                        <input
                          type="radio"
                          name={`modalidad-${comunidad}`}
                          checked={t.modalidad === m}
                          onChange={() => dispatch({ tipo: "modalidad", comunidad, modalidad: m })}
                          className="mt-1 accent-deep"
                        />
                        <span>
                          <b>{m === "fija" ? tx.tiempo.modalidad.fija : tx.tiempo.modalidad.variable}</b>
                          <span className="block text-muted">{m === "fija" ? tx.tiempo.modalidad.ayudaFija : tx.tiempo.modalidad.ayudaVariable}</span>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                )}
                {esVariable ? (
                  <div className="grid gap-2">
                    <div className="flex flex-wrap gap-4">
                      <CampoHoras
                        etiqueta={tx.tiempo.rangoMin}
                        valor={t.rango.min}
                        alCambiar={(n) => dispatch({ tipo: "rango", comunidad, min: n })}
                        descritoPor="aviso-rango"
                        invalido={!rangoValido(t.rango)}
                      />
                      <CampoHoras
                        etiqueta={tx.tiempo.rangoMax}
                        valor={t.rango.max}
                        alCambiar={(n) => dispatch({ tipo: "rango", comunidad, max: n })}
                        descritoPor="aviso-rango"
                        invalido={!rangoValido(t.rango)}
                      />
                    </div>
                    <p id="aviso-rango" className={`text-sm ${rangoValido(t.rango) ? "font-medium" : "font-medium text-danger"}`} data-testid="rango-linea">
                      {rangoValido(t.rango) ? tx.tiempo.rango(miles(t.rango.min), miles(t.rango.max)) : tx.tiempo.rangoAlReves}
                    </p>
                  </div>
                ) : (
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">{tx.tiempo.compromiso(t.horas)}</span>
                    <input
                      type="range"
                      min={HORAS.min}
                      max={HORAS.max}
                      step={HORAS.paso}
                      value={t.horas}
                      onChange={(e) => dispatch({ tipo: "horas", comunidad, horas: Number(e.target.value) })}
                      className="accent-deep"
                    />
                  </label>
                )}
                <p className="grid gap-1 text-sm">
                  <span className="font-medium">{tx.tiempo.valorHora}</span>
                  <span>
                    ARS {miles(HOUR_REF_ARS)} ≈ USD {miles(HOUR_REF_USD)}
                    <Ejemplo texto={tx.tiempo.referenciaPorAhora} />
                  </span>
                </p>
                {datos.modalidad === "obra" ? (
                  <p className={AVISO}>
                    {tx.tiempo.obra}
                    <TerminoLegal clave="obra" idioma={idioma} />
                    {tx.tiempo.obraFin}
                  </p>
                ) : datos.modalidad === "remoto" ? (
                  <p className={AVISO}>
                    {tx.tiempo.remoto}
                    <TerminoLegal clave="remoto" idioma={idioma} />
                    {horasTope > 20 ? tx.tiempo.remotoLargo(horasTope, datos.paisResidencia ?? "") : tx.tiempo.remotoCorto}
                  </p>
                ) : (
                  <p className={AVISO}>
                    {tx.tiempo.sinModalidad}{" "}
                    <Link className="underline" href="/pasaporte">
                      {tx.tiempo.cargala}
                    </Link>{" "}
                    {tx.tiempo.sinModalidadFin}
                  </p>
                )}
              </fieldset>
              {esVariable && (
                <p className="text-sm" data-testid="compromiso-minimo">
                  {tx.tiempo.compromisoMinimo(compromisoDelPacto(t, comunidad, false))}
                  <TerminoLegal clave="compromisominimo" idioma={idioma} />
                </p>
              )}
              </div>
              <div className={PANEL_LATERAL}>
                <p className="font-mono text-sm text-muted">{tx.tiempo.porMes}</p>
                <div>
                  {esVariable ? (
                    <p className="text-2xl font-semibold" data-testid="semillas-mes">
                      {tx.tiempo.variableSemillas}
                    </p>
                  ) : (
                    <p className="text-2xl font-semibold" data-testid="semillas-mes">
                      <MarcaSemillas texto={textoSemillas.cantidad(miles(semillas))} />
                    </p>
                  )}
                  <p className="text-sm text-muted">
                    <span translate="no">{tx.tiempo.semillas}</span>
                    <TerminoEconomico clave="semillas" />
                    {tx.tiempo.deNombre(nombre)}
                  </p>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                  <dt className="text-muted">{tx.tiempo.formula}</dt>
                  <dd>{esVariable ? tx.tiempo.variableAclaracion : tx.tiempo.formulaValor}</dd>
                </dl>
                <p className="text-sm text-muted"><MarcaSemillas texto={esVariable ? tx.tiempo.variableNota : tx.tiempo.nota} /></p>
              </div>
            </div>
          )}

          {estado.pestana === "plata" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid content-start gap-3">
                <p className="text-sm">
                  {tx.plata.antes} <b>{nombre}</b>
                  <MarcaSemillas texto={tx.plata.medio} />
                  <TerminoEconomico clave="semillas" />
                  {tx.plata.fin}
                </p>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">{tx.plata.monto}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={MONTO_USD.min}
                    max={MONTO_USD.max}
                    step={1}
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    aria-describedby="ayuda-monto"
                    className={`${CAMPO} w-40`}
                  />
                </label>
                <p id="ayuda-monto" className="text-sm text-muted">
                  {montoValido
                    ? <MarcaSemillas texto={tx.plata.equivale(miles(semillasDePlata(montoNumero)), moneda === "ARS" ? formatearMonto(montoNumero, moneda, idioma) : "")} />
                    : tx.plata.montoInvalido(miles(MONTO_USD.min), miles(MONTO_USD.max))}
                </p>
                {moneda === "ARS" && <p className="text-sm text-muted">{notaTipoDeCambio(idioma)}</p>}
                <button
                  type="button"
                  className={BOTON_PRIMARIO}
                  disabled={!montoValido}
                  onClick={() => {
                    // Sin el sello de identidad, primero se ofrece la verificación.
                    if (kyc.verificada) dispatch({ tipo: "aporte", comunidad, montoUsd: montoNumero });
                    else setDialogoKyc(true);
                  }}
                >
                  {tx.plata.registrar}
                </button>
                <p className={AVISO}>{tx.plata.ningunCobro}</p>
              </div>
              <div className={PANEL_LATERAL}>
                <p className="font-mono text-sm text-muted">{tx.plata.registradoEn(nombre)}</p>
                {mias.aportes.length === 0 ? (
                  <p className="text-sm text-muted">{tx.plata.sinAportes}</p>
                ) : (
                  <>
                    <p className="text-2xl font-semibold" data-testid="semillas-plata">
                      <MarcaSemillas texto={tx.plata.total(miles(semillasDePlata(totalPlata)))} />
                    </p>
                    <ul className="grid gap-1 text-sm">
                      {mias.aportes.map((a, i) => (
                        <li key={i}>
                          <MarcaSemillas texto={`${formatearMonto(a, moneda, idioma)} · ${miles(semillasDePlata(a))} Semillas`} />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {estado.pestana === "tiempo" && (
          <div className="flex flex-wrap items-center gap-3">
            {t.paso === 0 && (
              <>
                <button
                  type="button"
                  data-foco-paso
                  className={BOTON_PRIMARIO}
                  aria-disabled={!pactoCompleto(t)}
                  aria-describedby={!pactoCompleto(t) ? "ayuda-enviar" : undefined}
                  onClick={() => {
                    if (pactoCompleto(t)) dispatch({ tipo: "avanzar", comunidad });
                  }}
                >
                  {tx.pasos.enviar}
                </button>
                {!pactoCompleto(t) && (
                  <span id="ayuda-enviar" className="text-sm text-muted">
                    {t.rol === "otro" && !t.rolOtro.trim() && t.descripcion.trim()
                      ? tx.pasos.nombrarRol
                      : tx.pasos.elegirRol}
                  </span>
                )}
              </>
            )}
            {t.paso === 1 && (
              <>
                <span
                  tabIndex={-1}
                  data-foco-paso
                  data-testid="esperando-respuesta"
                  className="rounded-full border border-dashed border-deep px-3 py-1 text-sm font-medium text-deep"
                >
                  {tx.pasos.esperando(nombre)}
                </span>
                <button
                  type="button"
                  className={`${BOTON} border border-muted hover:bg-surface-2`}
                  onClick={() => dispatch({ tipo: "retirar", comunidad })}
                >
                  {tx.pasos.retirar}
                </button>
              </>
            )}
            {t.paso === 2 && (
              <>
                <span
                  tabIndex={-1}
                  data-foco-paso={t.cambio ? undefined : true}
                  className="rounded-full border border-deep bg-green-soft px-3 py-1 text-sm font-medium text-deep"
                >
                  {tx.pasos.aceptado}
                </span>
                <TerminoLegal clave="pactoDosPartes" idioma={idioma} />
                <span className="text-sm text-muted"><MarcaSemillas texto={tx.pasos.verLibro(nombre)} /></span>
                {!t.cambio && (
                  <button
                    type="button"
                    className={`${BOTON} border border-muted hover:bg-surface-2`}
                    onClick={() => dispatch({ tipo: "proponerCambio", comunidad })}
                  >
                    {tx.pasos.proponerCambio}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {estado.pestana === "tiempo" && t.paso === 2 && t.cambio && (
          <section aria-labelledby="titulo-cambio" className="grid gap-4 rounded-xl border border-dashed border-deep p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="titulo-cambio" className="text-lg font-semibold">
                {tx.cambio.titulo}
              </h2>
              <ol className="flex flex-wrap gap-2" aria-label={tx.cambio.pasosAria}>
                {pasosDelPacto(idioma).slice(0, 2).map((p, i) => (
                  <li
                    key={p}
                    aria-current={i === pasoCambio ? "step" : undefined}
                    className={`rounded-full border px-3 py-1 text-sm ${
                      i <= pasoCambio ? "border-deep bg-green-soft font-medium text-deep" : "border-faint text-muted"
                    }`}
                  >
                    {i < pasoCambio ? "✓ " : ""}
                    {p}
                  </li>
                ))}
              </ol>
            </div>
            <p className="text-sm text-muted">
              <MarcaSemillas
                texto={
                  esVariable
                    ? tx.cambio.vigenteVariable(t.version, textoHorasDelPacto(t, idioma))
                    : tx.cambio.vigente(t.version, textoHorasDelPacto(t, idioma), miles(semillas))
                }
              />
            </p>
            <fieldset disabled={t.cambio.paso !== 0} className="grid content-start gap-4 border-0 p-0">
              <legend className="sr-only">{tx.cambio.legend(nombre)}</legend>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">{tx.cambio.rol}</span>
                <select
                  value={t.cambio.rol}
                  onChange={(e) =>
                    dispatch({ tipo: "editarCambio", comunidad, cambios: { rol: e.target.value as ClaveRol | "" } })
                  }
                  className={`${CAMPO} w-fit`}
                >
                  <option value="">{tx.tiempo.elegiRol}</option>
                  {ROLES.map((r) => (
                    <option key={r.clave} value={r.clave}>
                      {textoDeRol(r, idioma).nombre}
                    </option>
                  ))}
                </select>
              </label>
              {t.cambio.rol === "otro" && (
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">{tx.cambio.queRol}</span>
                  <input
                    type="text"
                    maxLength={MAX_ROL_OTRO}
                    value={t.cambio.rolOtro}
                    lang={langTexto}
                    onChange={(e) => dispatch({ tipo: "editarCambio", comunidad, cambios: { rolOtro: e.target.value } })}
                    className={CAMPO}
                  />
                </label>
              )}
              <label className="grid gap-1 text-sm">
                <span className="font-medium">{tx.cambio.descripcion}</span>
                <textarea
                  rows={3}
                  maxLength={MAX_DESCRIPCION}
                  value={t.cambio.descripcion}
                  lang={langTexto}
                  onChange={(e) => dispatch({ tipo: "editarCambio", comunidad, cambios: { descripcion: e.target.value } })}
                  className={CAMPO}
                />
              </label>
              {(puedeVariable || t.cambio.modalidad === "variable") && (
                <fieldset className="grid gap-2 border-0 p-0" data-testid="modalidad-cambio">
                  <legend className="mb-1 text-sm font-medium">{tx.cambio.modalidad}</legend>
                  {(["fija", "variable"] as const).map((m) => (
                    <label key={m} className="flex items-start gap-2 text-sm">
                      <input
                        type="radio"
                        name={`modalidad-cambio-${comunidad}`}
                        checked={t.cambio?.modalidad === m}
                        onChange={() => dispatch({ tipo: "editarCambio", comunidad, cambios: { modalidad: m } })}
                        className="mt-1 accent-deep"
                      />
                      <b>{m === "fija" ? tx.tiempo.modalidad.fija : tx.tiempo.modalidad.variable}</b>
                    </label>
                  ))}
                </fieldset>
              )}
              {t.cambio.modalidad === "variable" ? (
                <div className="grid gap-2">
                  <div className="flex flex-wrap gap-4">
                    <CampoHoras
                      etiqueta={tx.tiempo.rangoMin}
                      valor={t.cambio.rango.min}
                      alCambiar={(n) => dispatch({ tipo: "editarCambio", comunidad, cambios: { rango: { min: n, max: t.cambio?.rango.max ?? n } } })}
                      descritoPor="aviso-rango-cambio"
                      invalido={!rangoValido(t.cambio.rango)}
                    />
                    <CampoHoras
                      etiqueta={tx.tiempo.rangoMax}
                      valor={t.cambio.rango.max}
                      alCambiar={(n) => dispatch({ tipo: "editarCambio", comunidad, cambios: { rango: { min: t.cambio?.rango.min ?? n, max: n } } })}
                      descritoPor="aviso-rango-cambio"
                      invalido={!rangoValido(t.cambio.rango)}
                    />
                  </div>
                  <p id="aviso-rango-cambio" className={`text-sm ${rangoValido(t.cambio.rango) ? "font-medium" : "font-medium text-danger"}`}>
                    {rangoValido(t.cambio.rango) ? tx.tiempo.rango(miles(t.cambio.rango.min), miles(t.cambio.rango.max)) : tx.tiempo.rangoAlReves}
                  </p>
                </div>
              ) : (
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">{tx.cambio.compromiso(t.cambio.horas)}</span>
                  <input
                    type="range"
                    min={HORAS.min}
                    max={HORAS.max}
                    step={HORAS.paso}
                    value={t.cambio.horas}
                    onChange={(e) => dispatch({ tipo: "editarCambio", comunidad, cambios: { horas: Number(e.target.value) } })}
                    className="accent-deep"
                  />
                </label>
              )}
            </fieldset>
            {t.cambio.modalidad === "variable" && (
              <p className="text-sm" data-testid="compromiso-minimo-cambio">
                {tx.tiempo.compromisoMinimo(compromisoDelPacto(t, comunidad, true))}
                <TerminoLegal clave="compromisominimo" idioma={idioma} />
              </p>
            )}
            <p className="text-sm" data-testid="semillas-cambio">
              <MarcaSemillas texto={t.cambio.modalidad === "variable" ? tx.cambio.conCambioVariable : tx.cambio.conCambio(miles(semillasPorMes(t.cambio.horas)))} />
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {t.cambio.paso === 0 ? (
                <>
                  <button
                    type="button"
                    data-foco-paso
                    className={BOTON_PRIMARIO}
                    aria-disabled={!pactoCompleto(t.cambio)}
                    aria-describedby={!pactoCompleto(t.cambio) ? "ayuda-enviar-cambio" : undefined}
                    onClick={() => {
                      if (cambioCompleto) dispatch({ tipo: "enviarCambio", comunidad });
                    }}
                  >
                    {tx.cambio.enviar}
                  </button>
                  <button
                    type="button"
                    className={`${BOTON} border border-muted hover:bg-surface-2`}
                    onClick={() => dispatch({ tipo: "descartarCambio", comunidad })}
                  >
                    {tx.cambio.descartar}
                  </button>
                  {!pactoCompleto(t.cambio) && (
                    <span id="ayuda-enviar-cambio" className="text-sm text-muted">
                      {t.cambio.rol === "otro" && !t.cambio.rolOtro.trim() && t.cambio.descripcion.trim()
                        ? tx.pasos.nombrarRol
                        : tx.pasos.elegirRol}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span
                    tabIndex={-1}
                    data-foco-paso
                    data-testid="esperando-respuesta-cambio"
                    className="rounded-full border border-dashed border-deep px-3 py-1 text-sm font-medium text-deep"
                  >
                    {tx.pasos.esperando(nombre)}
                  </span>
                  <button
                    type="button"
                    className={`${BOTON} border border-muted hover:bg-surface-2`}
                    onClick={() => dispatch({ tipo: "retirarCambio", comunidad })}
                  >
                    {tx.cambio.retirar}
                  </button>
                </>
              )}
            </div>
          </section>
        )}

        {estado.pestana === "tiempo" && estado.ultimaRespuesta && estado.ultimaRespuesta.comunidad === comunidad && (
          <p className={AVISO} data-testid="aviso-no-aceptado">
            <span lang={langTexto}>
              {estado.ultimaRespuesta.esCambio
                ? tx.avisoCambioNoAceptado(nombre, estado.ultimaRespuesta.motivo)
                : tx.avisoNoAceptado(nombre, estado.ultimaRespuesta.motivo)}
            </span>
          </p>
        )}

        {estado.pestana === "tiempo" && t.paso === 2 && t.historial.length > 0 && (
          <details className="rounded-lg border border-faint px-3 py-2">
            <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep">
              {tx.historial.titulo(t.historial.length)}
            </summary>
            <ul className="mt-2 grid gap-2 text-sm" aria-label={tx.historial.aria}>
              {[...t.historial].reverse().map((v) => {
                const rolDeVersion = buscarRol(v.rol);
                return (
                  <li key={v.version} className="grid gap-0.5">
                    <span>
                      <b>{tx.historial.version(v.version)}</b> ·{" "}
                      {v.rol === "otro" ? (
                        <span lang={langTexto}>{v.rolOtro}</span>
                      ) : rolDeVersion ? (
                        textoDeRol(rolDeVersion, idioma).nombre
                      ) : (
                        comunes.sinDato
                      )}{" "}
                      · {v.modalidad === "variable" ? `${tx.historial.modalidad(true)} · ` : ""}{textoHorasDelPacto(v, idioma)} · {v.aceptado ? formatearFecha(v.aceptado, idioma) : tx.historial.fechaSinDato}
                    </span>
                    <span className="text-muted" lang={langTexto}>{v.descripcion}</span>
                  </li>
                );
              })}
            </ul>
          </details>
        )}
        {estado.pestana === "tiempo" && t.paso === 2 && esVariable && mesEnCurso !== "" && (
          <section aria-labelledby="titulo-mes" className="grid gap-3 rounded-xl border border-faint p-4" data-testid="horas-del-mes">
            <h2 id="titulo-mes" className="text-lg font-semibold">
              {tx.mensual.titulo(conMayuscula(nombreDelMes(mesEnCurso, idioma)))}
            </h2>
            <p className="text-sm text-muted">{tx.mensual.ayuda(miles(t.rango.min), miles(t.rango.max))}</p>
            {t.declaradas[mesEnCurso]?.estado === "confirmada"
              ? null
              : formularioDeMes(mesEnCurso, t.declaradas[mesEnCurso]?.estado === "declarada" ? tx.mensual.corregir : tx.mensual.declarar)}
            <p className="font-medium" data-testid="estado-mes-en-curso">
              {lineaDeMes(mesEnCurso)}
            </p>
            {t.declaradas[mesEnCurso]?.estado === "a-revisar" && (
              <p className={AVISO} data-testid="motivo-mes-en-curso">
                {tx.mensual.estado.motivo} <span lang={langTexto}>{t.declaradas[mesEnCurso].motivo}</span>
              </p>
            )}
            {(() => {
              // Los dos meses anteriores (solo lectura) y cualquier mes pasado que la comunidad pidió revisar.
              const previos = [...new Set([mesAtras(mesEnCurso, 1), mesAtras(mesEnCurso, 2), ...Object.keys(t.declaradas).filter((m) => m < mesEnCurso && t.declaradas[m].estado === "a-revisar")])].sort().reverse();
              return (
                <div className="grid gap-2">
                  <h3 className="text-sm font-medium text-muted">{tx.mensual.mesesAnteriores}</h3>
                  <ul className="grid gap-3 text-sm" aria-label={tx.mensual.mesesAnteriores}>
                    {previos.map((mes) => {
                      const d = Object.hasOwn(t.declaradas, mes) ? t.declaradas[mes] : undefined;
                      return (
                        <li key={mes} className="grid gap-2" data-testid={`mes-${mes}`}>
                          <span>{lineaDeMes(mes)}</span>
                          {d?.estado === "a-revisar" && (
                            <>
                              <span className={AVISO}>
                                {tx.mensual.estado.motivo} <span lang={langTexto}>{d.motivo}</span>
                              </span>
                              {formularioDeMes(mes, tx.mensual.volverADeclarar(conMayuscula(nombreDelMes(mes, idioma))))}
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })()}
          </section>
        )}
        <p role="status" className="sr-only">
          {anuncio}
        </p>
      </section>
      )}
      {puntualesDeLaComunidad.length > 0 && (
        <PostulacionesATareas
          comunidad={comunidad}
          puntuales={puntualesDeLaComunidad}
          alEditar={(necesidadId, cambios: EdicionPuntual) => accionPuntual({ tipo: "editarPuntual", comunidad, necesidadId, cambios })}
          alEnviar={(necesidadId) => accionPuntual({ tipo: "enviarPuntual", comunidad, necesidadId })}
          alRetirar={(necesidadId) => accionPuntual({ tipo: "retirarPuntual", comunidad, necesidadId })}
          alDescartar={(necesidadId) => accionPuntual({ tipo: "descartarPuntual", comunidad, necesidadId })}
          alMarcarHecha={(necesidadId, horas) => marcarHechaDe(comunidad, necesidadId, horas)}
          alRetirarHecha={(necesidadId) => retirarHechaDe(comunidad, necesidadId)}
          errorHoras={errorHoras}
        />
      )}
      <KycDialogo
        abierto={dialogoKyc}
        kyc={kyc.kyc}
        motivo={pasaporte.kyc.motivoAporte}
        alCerrar={() => {
          setDialogoKyc(false);
          // Con el sello ya obtenido, se sigue con lo que la persona quería hacer.
          if (kyc.verificada && montoValido) dispatch({ tipo: "aporte", comunidad, montoUsd: montoNumero });
        }}
        alEnviar={kyc.enviar}
        alAprobar={kyc.aprobar}
      />
    </div>
  );
}
