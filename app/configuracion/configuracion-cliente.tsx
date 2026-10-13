"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { EVENTO_CAMBIO } from "@/lib/actividad/almacen";
import { EVENTO_PREFERENCIAS, guardarPreferencias, usePreferencias } from "@/lib/configuracion/almacen";
import {
  NOTA_TIPO_DE_CAMBIO,
  TIPOS_AVISO,
  type Moneda,
  type Preferencias,
  type TamanoTexto,
  type Tema,
} from "@/lib/configuracion/preferencias";
import { borrarDemo } from "@/lib/demo/borrar";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const SECCION = "grid gap-3 rounded-xl border border-faint bg-surface p-4";
const OPCION = "flex items-start gap-2";
const CONTROL = `mt-1 size-4 accent-deep ${FOCO}`;

const TEMAS: readonly { id: Tema; etiqueta: string }[] = [
  { id: "claro", etiqueta: "Claro" },
  { id: "oscuro", etiqueta: "Oscuro" },
  { id: "sistema", etiqueta: "El del sistema" },
];

const TEXTOS: readonly { id: TamanoTexto; etiqueta: string }[] = [
  { id: "normal", etiqueta: "Normal" },
  { id: "grande", etiqueta: "Grande" },
];

const MONEDAS: readonly { id: Moneda; etiqueta: string }[] = [
  { id: "USD", etiqueta: "Dólares (USD)" },
  { id: "ARS", etiqueta: "Pesos argentinos (ARS)" },
];

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={SECCION}>
      <h2 id={id} className="text-xl font-semibold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export function ConfiguracionCliente() {
  const preferencias = usePreferencias();
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [mensaje, setMensaje] = useState({ n: 0, texto: "" });

  function cambiar(parcial: Partial<Preferencias>) {
    setFalloAlmacen(!guardarPreferencias({ ...preferencias, ...parcial }));
  }

  function borrar() {
    if (!window.confirm("¿Borrar todo lo que guardaste en este navegador?")) return;
    const fallidas = borrarDemo((c) => window.localStorage.removeItem(c));
    // Para que la campanita, la bandeja y la apariencia se enteren.
    window.dispatchEvent(new Event(EVENTO_CAMBIO));
    window.dispatchEvent(new Event(EVENTO_PREFERENCIAS));
    // El número cambia en cada borrado: el texto se vuelve a montar y la región de estado lo anuncia otra vez.
    setMensaje((previo) => ({
      n: previo.n + 1,
      texto:
        fallidas.length > 0
          ? "Error: no se pudo borrar todo. Algunos datos siguen guardados en este navegador."
          : "Listo: se borró todo lo guardado en este navegador, incluidas estas preferencias.",
    }));
  }

  return (
    <div className="grid gap-6">
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          Error: tu navegador no permite guardar datos en este sitio, así que el cambio no se va a recordar al recargar.
          Revisá la configuración de privacidad o probá en otro navegador.
        </p>
      )}

      <Seccion id="apariencia" titulo="Apariencia">
        <fieldset className="grid gap-1">
          <legend className="font-medium">Tema</legend>
          {TEMAS.map((t) => (
            <label key={t.id} className={OPCION}>
              <input
                type="radio"
                name="tema"
                value={t.id}
                checked={preferencias.tema === t.id}
                onChange={() => cambiar({ tema: t.id })}
                className={CONTROL}
              />
              {t.etiqueta}
            </label>
          ))}
        </fieldset>
        <fieldset className="grid gap-1">
          <legend className="font-medium">Tamaño del texto</legend>
          {TEXTOS.map((t) => (
            <label key={t.id} className={OPCION}>
              <input
                type="radio"
                name="texto"
                value={t.id}
                checked={preferencias.texto === t.id}
                onChange={() => cambiar({ texto: t.id })}
                className={CONTROL}
              />
              {t.etiqueta}
            </label>
          ))}
        </fieldset>
        <label className={OPCION}>
          <input
            type="checkbox"
            checked={preferencias.reducirAnimaciones}
            onChange={(e) => cambiar({ reducirAnimaciones: e.target.checked })}
            className={CONTROL}
          />
          Reducir animaciones
        </label>
      </Seccion>

      <Seccion id="notificaciones" titulo="Notificaciones">
        <p className="text-sm text-muted">
          Elegí qué avisos aparecen en la campanita y en <Link className="underline" href="/bandeja">tu bandeja</Link>.
        </p>
        <fieldset className="grid gap-2">
          <legend className="sr-only">Tipos de aviso</legend>
          {TIPOS_AVISO.map((t) => (
            <label key={t.id} className={OPCION}>
              <input
                type="checkbox"
                checked={preferencias.avisos[t.id]}
                onChange={(e) => cambiar({ avisos: { ...preferencias.avisos, [t.id]: e.target.checked } })}
                className={CONTROL}
              />
              <span>
                {t.etiqueta}
                <span className="block text-sm text-muted">{t.detalle}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </Seccion>

      <Seccion id="asistente" titulo="Asistente">
        <label className={OPCION}>
          <input
            type="checkbox"
            checked={preferencias.mostrarHifa}
            onChange={(e) => cambiar({ mostrarHifa: e.target.checked })}
            className={CONTROL}
          />
          <span>
            Mostrar a Hifa
            <span className="block text-sm text-muted">El botón del asistente, abajo a la derecha de cada página.</span>
          </span>
        </label>
      </Seccion>

      <Seccion id="moneda" titulo="Moneda de referencia">
        <fieldset className="grid gap-1">
          <legend className="sr-only">Moneda para mostrar montos</legend>
          {MONEDAS.map((m) => (
            <label key={m.id} className={OPCION}>
              <input
                type="radio"
                name="moneda"
                value={m.id}
                checked={preferencias.moneda === m.id}
                onChange={() => cambiar({ moneda: m.id })}
                className={CONTROL}
              />
              {m.etiqueta}
            </label>
          ))}
        </fieldset>
        <p className="text-sm text-muted">
          Es solo para mostrar los montos; no se cobra nada de verdad. {NOTA_TIPO_DE_CAMBIO}
        </p>
      </Seccion>

      <Seccion id="idioma" titulo="Idioma">
        <fieldset className="grid gap-1">
          <legend className="sr-only">Idioma de la plataforma</legend>
          <label className={OPCION}>
            <input type="radio" name="idioma" value="es" checked readOnly className={CONTROL} />
            Español
          </label>
          <label className={`${OPCION} opacity-70`}>
            <input type="radio" name="idioma" value="en" disabled className="mt-1 size-4" />
            <span>
              English
              <span className="ml-2 rounded-full border border-faint px-2 text-xs text-muted">próximamente</span>
            </span>
          </label>
        </fieldset>
      </Seccion>

      <Seccion id="datos" titulo="Tus datos">
        <p className="text-sm text-muted">Todo lo que hacés en el prototipo queda solo en este navegador.</p>
        <p>
          <Link className={`underline ${FOCO}`} href="/panel/bitacora">Ver la Bitácora</Link>
        </p>
        <p>
          <Link className={`underline ${FOCO}`} href="/mis-datos">Mis datos: descargarlos, retirar mi consentimiento o pedir el borrado</Link>
          {" · "}
          <Link className={`underline ${FOCO}`} href="/privacidad">Política de privacidad</Link>
        </p>
        <button
          type="button"
          onClick={borrar}
          className={`w-fit rounded-lg border border-muted px-3 py-1.5 hover:bg-surface-2 ${FOCO}`}
        >
          Borrar todo lo guardado en este navegador
        </button>
        <p role="status" className="text-sm font-medium">
          <span key={mensaje.n} data-borrado={mensaje.n}>{mensaje.texto}</span>
        </p>
      </Seccion>
    </div>
  );
}
