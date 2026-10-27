"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { TarjetaIdentidad } from "./tarjeta-identidad";
import { KycDialogo } from "@/components/kyc-dialogo";
import { useSesion } from "@/components/sesion/contexto";
import { SelloBilletera } from "./sello-billetera";
import { TerminoLegal } from "@/components/termino-legal";
import { esCodigoValido } from "@/lib/congreso/ticket";
import { CLAVES } from "@/lib/demo/claves";
import { leerMembresiaDelNavegador, type Membresias } from "@/lib/membresia/estado";
import { DATOS_VACIOS, leerDatos, MAX_HORAS, type DatosPersona } from "@/lib/pasaporte/datos";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { fechaLarga } from "@/lib/pasaporte/kyc";
import {
  fechasPorGuardar,
  fechasPorQuitar,
  leerFechas,
  NOMBRE_GENESIS,
  sellos,
  textoEstadoSello,
  type EstadoSello,
  type FechasSellos,
  type Sello,
} from "@/lib/pasaporte/sellos";
import { useKyc } from "@/lib/pasaporte/usar-kyc";
import { INICIAL, leer as leerSumarte, type EstadoSumarte } from "@/lib/sumarte/estado";

// Todo queda solo en este navegador: no hay pedidos de red ni KYC real.

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON = `w-fit rounded-lg px-4 py-1.5 font-medium ${FOCO}`;
const BOTON_SUAVE = `${BOTON} border border-muted hover:bg-surface-2`;
const CAMPO = `mt-1 block w-full rounded-lg border border-faint bg-surface px-3 py-2 text-ink ${FOCO}`;
const TARJETA = "grid content-start gap-4 rounded-xl border border-faint bg-surface p-5";

// El sello es decorativo (el estado también está escrito): cambia la forma del borde, no solo el color.
const SELLO_VISUAL: Record<EstadoSello, string> = {
  obtenido: "-rotate-3 border-4 border-double border-deep bg-green-soft text-deep",
  "en-tramite": "border-4 border-dashed border-gold-ink bg-gold-soft text-gold-ink",
  disponible: "border-2 border-dashed border-faint bg-surface-2 text-muted",
  "no-disponible": "border-2 border-dotted border-faint bg-surface-2 text-muted",
};
const ICONO: Record<EstadoSello, string> = { obtenido: "✓", "en-tramite": "…", disponible: "○", "no-disponible": "—" };
const ETIQUETA: Record<EstadoSello, string> = {
  obtenido: "border-deep bg-green-soft text-deep",
  "en-tramite": "border-gold-ink bg-gold-soft text-gold-ink",
  disponible: "border-muted bg-surface-2 text-muted",
  "no-disponible": "border-muted bg-surface-2 text-muted",
};

function Opcion<T extends string>({
  nombre,
  valor,
  actual,
  etiqueta,
  alElegir,
}: {
  nombre: string;
  valor: T;
  actual: T | undefined;
  etiqueta: string;
  alElegir: (v: T) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input type="radio" name={nombre} checked={actual === valor} onChange={() => alElegir(valor)} />
      {etiqueta}
    </label>
  );
}

function TarjetaSello({ s }: { s: Sello }) {
  const idioma = useIdioma();
  const t = useTextos("pasaporte").sellos;
  return (
    <li data-sello={s.id} className="grid content-start gap-3 rounded-xl border border-faint bg-surface p-4">
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className={`flex size-20 shrink-0 flex-col items-center justify-center rounded-full text-center ${SELLO_VISUAL[s.estado]}`}
        >
          <span className="text-2xl leading-none">{ICONO[s.estado]}</span>
        </div>
        <div className="grid min-w-0 gap-1">
          <h3 className="text-lg font-semibold break-words">
            {s.nombre === NOMBRE_GENESIS ? <span translate="no">{s.nombre}</span> : s.nombre}
            {s.legal?.map((k) => <TerminoLegal key={k} clave={k} idioma={idioma} />)}
          </h3>
          <p className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-sm font-medium ${ETIQUETA[s.estado]}`}>
              {textoEstadoSello(s.estado, idioma)}
            </span>
            {s.fecha && <span className="text-sm text-muted">{fechaLarga(s.fecha, idioma)}</span>}
          </p>
        </div>
      </div>
      <p className="text-sm">
        {s.detalle}
        {s.legalDetalle && <TerminoLegal clave={s.legalDetalle} idioma={idioma} />}
      </p>
      {s.accion &&
        (s.accion.href.includes("#") ? (
          // Ancla en la misma página: un enlace común mueve el foco y avisa con `hashchange`.
          // Si el hash ya es el mismo no hay `hashchange`: se enfoca el encabezado a mano.
          <a
            className={BOTON_SUAVE}
            href={s.accion.href}
            onClick={() => {
              const destino = document.getElementById("titulo-identidad");
              if (window.location.hash === `#${s.accion?.href.split("#")[1]}` && destino) {
                // Un tick después, para no competir con el foco que mueve el navegador al clicar el enlace.
                setTimeout(() => {
                  destino.scrollIntoView();
                  destino.focus();
                }, 0);
              }
            }}
          >
            {s.accion.texto}
          </a>
        ) : (
          <Link className={BOTON_SUAVE} href={s.accion.href}>
            {s.accion.texto}
          </Link>
        ))}
      {s.abre.length > 0 && (
        <div>
          <p className="text-sm font-medium">{s.estado === "obtenido" ? t.queAbre : t.queAbriria}</p>
          <ul className="list-disc pl-5 text-sm">
            {s.abre.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function PasaporteCliente() {
  const idioma = useIdioma();
  const t = useTextos("pasaporte");
  const kyc = useKyc();
  const { billetera } = useSesion();
  const [listo, setListo] = useState(false);
  const [ahora, setAhora] = useState<Date | null>(null);
  const [sumarte, setSumarte] = useState<EstadoSumarte>(INICIAL);
  const [membresias, setMembresias] = useState<Membresias>({});
  const [ticket, setTicket] = useState(false);
  const [fechas, setFechas] = useState<FechasSellos>({});
  const [dialogo, setDialogo] = useState(false);
  const botonKyc = useRef<HTMLButtonElement>(null);
  const [datosAporte, setDatosAporte] = useState<DatosPersona>(DATOS_VACIOS);
  const [horasTexto, setHorasTexto] = useState("");
  const [falloAlmacen, setFalloAlmacen] = useState(false);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      setSumarte(leerSumarte(window.localStorage.getItem(CLAVES.sumarte)));
      setTicket(esCodigoValido(window.localStorage.getItem(CLAVES.congreso) ?? ""));
      setFechas(leerFechas(window.localStorage.getItem(CLAVES.sellos)));
      const guardados = leerDatos(window.localStorage.getItem(CLAVES.pasaporte));
      setDatosAporte(guardados);
      // Si lo escrito estaba fuera de rango, se restaura el texto para repetir el mensaje.
      const textoCrudo = window.localStorage.getItem(CLAVES.pasaporteHorasTexto);
      setHorasTexto(guardados.horas !== undefined ? String(guardados.horas) : (textoCrudo ?? ""));
    } catch {
      setFalloAlmacen(true);
    }
    setMembresias(leerMembresiaDelNavegador());
    setAhora(new Date());
    setListo(true);
  }, []);

  const lista = useMemo(
    () =>
      ahora && kyc.cargado
        ? sellos(
            { sumarte, membresias, kyc: kyc.kyc, datos: kyc.datos, ticket, presenciaGenesis: false, fechas },
            ahora,
            idioma,
          )
        : [],
    [ahora, kyc.cargado, kyc.kyc, kyc.datos, sumarte, membresias, ticket, fechas, idioma],
  );

  // Cada sello obtenido guarda el día en que se lo vio por primera vez;
  // si deja de estar obtenido, se borra su fecha para que la próxima vez cuente de nuevo.
  useEffect(() => {
    const nuevas = fechasPorGuardar(lista, fechas);
    const quitar = fechasPorQuitar(lista, fechas);
    if (Object.keys(nuevas).length === 0 && quitar.length === 0) return;
    const siguiente = { ...fechas, ...nuevas };
    for (const id of quitar) delete siguiente[id];
    try {
      window.localStorage.setItem(CLAVES.sellos, JSON.stringify(siguiente));
    } catch {
      setFalloAlmacen(true);
    }
    setFechas(siguiente);
  }, [lista, fechas]);

  function cambiarAporte(parcial: Partial<DatosPersona>) {
    // Se relee antes de escribir: el trámite de identidad también guarda en "Tus datos".
    let base = datosAporte;
    try {
      base = leerDatos(window.localStorage.getItem(CLAVES.pasaporte));
    } catch {
      // Sin almacenamiento: se sigue en memoria.
    }
    const siguiente = { ...base, ...parcial };
    try {
      window.localStorage.setItem(CLAVES.pasaporte, JSON.stringify(siguiente));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
    }
    setDatosAporte(siguiente);
  }

  if (!listo || !kyc.cargado) return <p role="status" className="text-sm text-muted">{t.cargando}</p>;

  const horasInvalidas = horasTexto !== "" && datosAporte.horas === undefined;

  return (
    <div className="grid gap-8">
      {(falloAlmacen || kyc.falloAlmacen) && (
        <p role="alert" className="text-sm font-medium text-warn-ink">
          {t.errorAlmacenamiento}
        </p>
      )}

      <TarjetaIdentidad
        kyc={kyc.kyc}
        datos={kyc.datos}
        alCompletar={() => setDialogo(true)}
        alAprobar={kyc.aprobar}
        botonRef={botonKyc}
      />

      <section aria-labelledby="titulo-sellos" className="grid gap-4">
        <h2 id="titulo-sellos" className="text-xl font-semibold">{t.sellos.tusSellos}</h2>
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((s) => (
            <TarjetaSello key={s.id} s={s} />
          ))}
          <SelloBilletera billetera={billetera} />
        </ul>
      </section>

      <section aria-labelledby="titulo-aporte" className={`${TARJETA} max-w-xl`}>
        <h2 id="titulo-aporte" className="text-xl font-semibold">{t.aporte.titulo}</h2>
        <p className="text-sm text-muted">{t.aporte.ayuda}</p>
        <fieldset className="grid gap-2">
          <legend className="font-medium">{t.aporte.modalidad}</legend>
          <div className="flex flex-wrap gap-4">
            <Opcion nombre="modalidad" valor="obra" actual={datosAporte.modalidad} etiqueta={t.aporte.obra} alElegir={(v) => cambiarAporte({ modalidad: v })} />
            <Opcion nombre="modalidad" valor="remoto" actual={datosAporte.modalidad} etiqueta={t.aporte.remoto} alElegir={(v) => cambiarAporte({ modalidad: v })} />
          </div>
        </fieldset>
        {datosAporte.modalidad === "obra" && (
          <div>
            <label htmlFor="horas" className="font-medium">{t.aporte.horas}</label>
            <input
              id="horas"
              type="number"
              min={0}
              max={MAX_HORAS}
              step="any"
              className={CAMPO}
              value={horasTexto}
              aria-invalid={horasInvalidas}
              aria-describedby={horasInvalidas ? "horas-error" : undefined}
              onChange={(e) => {
                const escrito = e.target.value;
                setHorasTexto(escrito);
                try {
                  window.localStorage.setItem(CLAVES.pasaporteHorasTexto, escrito);
                } catch {
                  // el aviso de almacenamiento lo da cambiarAporte()
                }
                const n = escrito === "" ? undefined : Number(escrito);
                cambiarAporte({ horas: n !== undefined && Number.isFinite(n) && n >= 0 && n <= MAX_HORAS ? n : undefined });
              }}
            />
            {horasInvalidas && (
              <p id="horas-error" className="mt-1 text-sm font-medium text-warn-ink">
                {t.aporte.horasError(MAX_HORAS)}
              </p>
            )}
          </div>
        )}
      </section>

      <p className="text-sm text-muted">{t.notaFiduciario}</p>

      <KycDialogo
        abierto={dialogo}
        kyc={kyc.kyc}
        alCerrar={() => {
          setDialogo(false);
          // Tras enviar, el botón de KYC desaparece: el foco va al botón de aprobar o, si no, al encabezado.
          // Se difiere un tick: al cerrarse, el <dialog> devuelve el foco a su origen y pisaría este.
          setTimeout(() => {
            const destino =
              botonKyc.current ??
              document.querySelector<HTMLElement>("#identidad [data-foco-kyc]") ??
              document.getElementById("titulo-identidad");
            destino?.focus();
          }, 0);
        }}
        alEnviar={kyc.enviar}
        alAprobar={kyc.aprobar}
      />
    </div>
  );
}
