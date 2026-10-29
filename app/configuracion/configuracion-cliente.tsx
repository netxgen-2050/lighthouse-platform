"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { EVENTO_CAMBIO } from "@/lib/actividad/almacen";
import { EVENTO_PREFERENCIAS, guardarPreferencias, usePreferencias } from "@/lib/configuracion/almacen";
import {
  notaTipoDeCambio,
  tiposAviso,
  type Moneda,
  type Preferencias,
  type TamanoTexto,
  type Tema,
} from "@/lib/configuracion/preferencias";
import { borrarDemo } from "@/lib/demo/borrar";
import { CLAVES_COMPARTIDAS, personaEnSesion } from "@/lib/demo/claves";
import { quitarConstanciasDe } from "@/lib/pactos/registro-compartido";
import { useCambiarIdioma, useIdioma, useIdiomaDePlataforma, useTextos } from "@/lib/idioma/cliente";
import type { Idioma } from "@/lib/idioma/tipos";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const SECCION = "grid gap-3 rounded-xl border border-faint bg-surface p-4";
const OPCION = "flex items-start gap-2";
const CONTROL = `mt-1 size-4 accent-deep ${FOCO}`;

const TEMAS: readonly Tema[] = ["claro", "oscuro", "sistema"];
const TEXTOS: readonly TamanoTexto[] = ["normal", "grande"];
const MONEDAS: readonly Moneda[] = ["USD", "ARS"];

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
  const idioma = useIdioma();
  const t = useTextos("configuracion");
  const preferencias = usePreferencias();
  const idiomaPlataforma = useIdiomaDePlataforma();
  const cambiarIdiomaDePlataforma = useCambiarIdioma();
  // La plataforma cambia de idioma cuando el servidor responde; hasta entonces el radio muestra lo recién elegido.
  const [elegido, setElegido] = useState<{ valor: Idioma; desde: Idioma } | null>(null);
  const idiomaMostrado = elegido && elegido.desde === idiomaPlataforma ? elegido.valor : idiomaPlataforma;
  function cambiarIdioma(valor: Idioma) {
    setElegido({ valor, desde: idiomaPlataforma });
    cambiarIdiomaDePlataforma(valor);
  }
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [mensaje, setMensaje] = useState({ n: 0, texto: "" });

  function cambiar(parcial: Partial<Preferencias>) {
    setFalloAlmacen(!guardarPreferencias({ ...preferencias, ...parcial }));
  }

  function borrar() {
    if (!window.confirm(t.datos.confirmar)) return;
    const fallidas = borrarDemo((c) => window.localStorage.removeItem(c));
    // Sus pactos también salen del registro compartido: si no, la tribu vería pendiente un pacto que ya no existe.
    const persona = personaEnSesion();
    if (persona && !quitarConstanciasDe(persona)) fallidas.push(CLAVES_COMPARTIDAS.pactosConstancias);
    // Para que la campanita, la bandeja y la apariencia se enteren.
    window.dispatchEvent(new Event(EVENTO_CAMBIO));
    window.dispatchEvent(new Event(EVENTO_PREFERENCIAS));
    // El número cambia en cada borrado: el texto se vuelve a montar y la región de estado lo anuncia otra vez.
    setMensaje((previo) => ({
      n: previo.n + 1,
      texto: fallidas.length > 0 ? t.datos.fallo : t.datos.listo,
    }));
  }

  return (
    <div className="grid gap-6">
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          {t.errorAlmacenamiento}
        </p>
      )}

      <Seccion id="apariencia" titulo={t.apariencia.titulo}>
        <fieldset className="grid gap-1">
          <legend className="font-medium">{t.apariencia.tema}</legend>
          {TEMAS.map((id) => (
            <label key={id} className={OPCION}>
              <input
                type="radio"
                name="tema"
                value={id}
                checked={preferencias.tema === id}
                onChange={() => cambiar({ tema: id })}
                className={CONTROL}
              />
              {t.apariencia.temas[id]}
            </label>
          ))}
        </fieldset>
        <fieldset className="grid gap-1">
          <legend className="font-medium">{t.apariencia.tamano}</legend>
          {TEXTOS.map((id) => (
            <label key={id} className={OPCION}>
              <input
                type="radio"
                name="texto"
                value={id}
                checked={preferencias.texto === id}
                onChange={() => cambiar({ texto: id })}
                className={CONTROL}
              />
              {t.apariencia.tamanos[id]}
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
          {t.apariencia.reducir}
        </label>
      </Seccion>

      <Seccion id="notificaciones" titulo={t.avisos.titulo}>
        <p className="text-sm text-muted">
          {t.avisos.introAntes}<Link className="underline" href="/bandeja">{t.avisos.introEnlace}</Link>{t.avisos.introDespues}
        </p>
        <fieldset className="grid gap-2">
          <legend className="sr-only">{t.avisos.tiposAria}</legend>
          {tiposAviso(idioma).map((tipo) => (
            <label key={tipo.id} className={OPCION}>
              <input
                type="checkbox"
                checked={preferencias.avisos[tipo.id]}
                onChange={(e) => cambiar({ avisos: { ...preferencias.avisos, [tipo.id]: e.target.checked } })}
                className={CONTROL}
              />
              <span>
                {tipo.etiqueta}
                <span className="block text-sm text-muted">{tipo.detalle}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </Seccion>

      <Seccion id="asistente" titulo={t.asistente.titulo}>
        <label className={OPCION}>
          <input
            type="checkbox"
            checked={preferencias.mostrarHifa}
            onChange={(e) => cambiar({ mostrarHifa: e.target.checked })}
            className={CONTROL}
          />
          <span>
            {t.asistente.mostrar}
            <span className="block text-sm text-muted">{t.asistente.detalle}</span>
          </span>
        </label>
      </Seccion>

      <Seccion id="moneda" titulo={t.moneda.titulo}>
        <fieldset className="grid gap-1">
          <legend className="sr-only">{t.moneda.aria}</legend>
          {MONEDAS.map((id) => (
            <label key={id} className={OPCION}>
              <input
                type="radio"
                name="moneda"
                value={id}
                checked={preferencias.moneda === id}
                onChange={() => cambiar({ moneda: id })}
                className={CONTROL}
              />
              {id === "USD" ? t.moneda.usd : t.moneda.ars}
            </label>
          ))}
        </fieldset>
        <p className="text-sm text-muted">{t.moneda.nota(notaTipoDeCambio(idioma))}</p>
      </Seccion>

      <Seccion id="idioma" titulo={t.idioma.titulo}>
        <fieldset className="grid gap-1">
          <legend className="sr-only">{t.idioma.aria}</legend>
          {/* Es la misma preferencia que el selector ES / EN de la barra superior. */}
          <label className={OPCION}>
            <input
              type="radio"
              name="idioma"
              value="es"
              checked={idiomaMostrado === "es"}
              onChange={() => cambiarIdioma("es")}
              className={CONTROL}
            />
            <span lang="es">Español</span>
          </label>
          <label className={OPCION}>
            <input
              type="radio"
              name="idioma"
              value="en"
              checked={idiomaMostrado === "en"}
              onChange={() => cambiarIdioma("en")}
              className={CONTROL}
            />
            <span lang="en">English</span>
          </label>
        </fieldset>
      </Seccion>

      <Seccion id="datos" titulo={t.datos.titulo}>
        <p className="text-sm text-muted">{t.datos.texto}</p>
        <p>
          <Link className={`underline ${FOCO}`} href="/panel/bitacora">{t.datos.bitacora}</Link>
        </p>
        <p>
          <Link className={`underline ${FOCO}`} href="/mis-datos">{t.datos.misDatos}</Link>
          {" · "}
          <Link className={`underline ${FOCO}`} href="/privacidad">{t.datos.privacidad}</Link>
        </p>
        <button
          type="button"
          onClick={borrar}
          className={`w-fit rounded-lg border border-muted px-3 py-1.5 hover:bg-surface-2 ${FOCO}`}
        >
          {t.datos.borrar}
        </button>
        <p role="status" className="text-sm font-medium">
          <span key={mensaje.n} data-borrado={mensaje.n}>{mensaje.texto}</span>
        </p>
      </Seccion>
    </div>
  );
}
