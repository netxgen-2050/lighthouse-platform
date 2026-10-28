"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Donut } from "@/components/donut";
import { ErrorDeLectura } from "@/components/fogon/error-lectura";
import { Medidor } from "@/components/medidor";
import { CREDITOS_POR_PERSONA, type Reparto } from "@/lib/cuadratico/motor";
import { repositorioConsultas } from "@/lib/fogon/consultas/fuente";
import type { Lectura } from "@/lib/fogon/consultas/repositorio";
import { formatoPlata, textoCierre, textoVoto } from "@/lib/fogon/consultas/reglas";
import {
  creditosRestantes,
  creditosUsados,
  mismoReparto,
  motivoNoQuitar,
  motivoNoSumar,
  mover,
  repartoEnPlata,
  textoCreditos,
  textoVotos,
  votosDe,
} from "@/lib/fogon/consultas/reparto";
import { costo } from "@/lib/cuadratico/motor";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textoEn } from "@/lib/idioma/tipos";
import type { VistaConsulta } from "@/lib/fogon/consultas/tipos";
import { Acta, QuienFalta, ResultadoDelGrupo, TablaDeRepartos, useTextosDonut } from "./resultado-grupo";

// El reparto guardado queda solo en este navegador: no hay pedidos de red.

const BOTON =
  "rounded-lg border px-4 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_SUAVE = `${BOTON} border-muted hover:bg-surface-2`;
const BOTON_PRINCIPAL = `${BOTON} border-deep bg-deep text-on-deep`;
const BOTON_VOTO = `${BOTON} min-h-11 min-w-11 border-muted text-lg font-semibold hover:bg-surface-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50`;
const CHIP = "rounded-full border border-faint px-3 py-0.5 text-sm";
const CAJA = "grid gap-3 rounded-xl border border-faint bg-surface p-4";

export function ConsultaCliente({ id }: { id: string }) {
  const idioma = useIdioma();
  const t = useTextos("fogonConsultas");
  const c = t.consulta;
  const comunes = useTextos("comunes");
  const textosDonut = useTextosDonut();
  const repo = useMemo(() => repositorioConsultas(), []);
  const [lectura, setLectura] = useState<Lectura<VistaConsulta> | null>(null);
  const [reparto, setReparto] = useState<Reparto>({});
  const [anuncio, setAnuncio] = useState("");
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const recargar = useCallback(
    async (reiniciarBorrador: boolean) => {
      let l: Lectura<VistaConsulta>;
      try {
        l = await repo.abrir(id);
      } catch {
        l = { ok: false, error: "falla" };
      }
      setLectura(l);
      if (l.ok && reiniciarBorrador) setReparto(l.valor.miReparto ?? {});
    },
    [repo, id],
  );

  useEffect(() => {
    // Lee lo guardado en este navegador tras hidratar (no existe en el servidor).
    void recargar(true);
  }, [recargar]);

  function anunciar(texto: string) {
    // Se vacía primero y se escribe en el próximo tick: si el texto es igual al anterior React no tocaría el DOM
    // y el lector de pantalla no anunciaría nada.
    setAnuncio("");
    setTimeout(() => setAnuncio(texto), 50);
  }

  const region = (
    <p role="status" className="sr-only">
      {anuncio}
    </p>
  );

  if (!lectura) {
    return (
      <>
        <h1 className="text-3xl font-semibold">{t.pagina.tituloConsulta}</h1>
        <p className="mt-2 text-muted">{c.cargando}</p>
        {region}
      </>
    );
  }
  if (!lectura.ok) {
    return (
      <>
        <h1 className="text-3xl font-semibold">{t.pagina.tituloConsulta}</h1>
        <div className="mt-3">
          <ErrorDeLectura error={lectura.error} />
        </div>
        {region}
      </>
    );
  }

  const vista = lectura.valor;
  const { consulta } = vista;
  const cerrada = vista.estado === "cerrada";
  const sinGuardar = !mismoReparto(reparto, vista.miReparto ?? {});
  const enPlata = repartoEnPlata(consulta, reparto);
  const restantes = creditosRestantes(reparto);
  const traducido = idioma !== (consulta.titulo.original ?? "es");

  function cambiar(opcionId: string, delta: 1 | -1) {
    const siguiente = mover(consulta, reparto, opcionId, delta);
    if (siguiente === reparto) return;
    setReparto(siguiente);
    setErrorGuardar(null);
    const etiqueta = textoEn(consulta.opciones.find((o) => o.id === opcionId)!.etiqueta, idioma);
    const v = votosDe(siguiente, opcionId);
    anunciar(t.anuncios.voto(etiqueta, textoVotos(v, idioma), textoCreditos(costo(v), idioma), creditosRestantes(siguiente)));
  }

  async function guardar() {
    const r = await repo.guardarReparto(id, reparto);
    if (r.ok) {
      setErrorGuardar(null);
      await recargar(true);
      anunciar(t.anuncios.guardado);
      return;
    }
    const e = t.errorGuardar;
    const texto =
      r.error === "cerrada"
        ? e.cerrada
        : r.error === "sin-sesion"
          ? e.sinSesion
          : r.error === "invalido"
            ? e.invalido((r.motivos ?? []).map((m) => t.motivos[m]).join(", ") || e.revisalo)
            : e.falla;
    setErrorGuardar(texto);
    if (r.error === "cerrada") await recargar(false);
  }

  async function cerrar() {
    const r = await repo.cerrar(id);
    await recargar(true);
    anunciar(r.ok ? t.anuncios.cerrado : t.anuncios.noCerro);
  }

  async function reabrir() {
    const r = await repo.reabrir?.(id);
    await recargar(true);
    anunciar(r?.ok ? t.anuncios.reabierto : t.anuncios.noReabrio);
  }

  const porciones = consulta.opciones.map((o) => ({
    id: o.id,
    etiqueta: textoEn(o.etiqueta, idioma),
    valor: costo(votosDe(reparto, o.id)),
  }));
  const usados = creditosUsados(reparto);
  const idAviso = "aviso-voto";
  const monto = consulta.presupuesto;

  return (
    <div className="grid gap-5">
      <header className="grid gap-2">
        <p className="text-sm font-medium text-muted">{c.sobretitulo}</p>
        <div>
          <h1 className="text-3xl font-semibold">{textoEn(consulta.titulo, idioma)}</h1>
          {traducido && <p className="text-xs text-muted">{comunes.traducidoDelOriginal}</p>}
        </div>
        <p className="max-w-2xl text-muted">{textoEn(consulta.descripcion, idioma)}</p>
        <p className="flex flex-wrap gap-2">
          <span className={CHIP}>{t.modo[consulta.modo]}</span>
          <span className={CHIP}>{t.ambito[consulta.ambito]}</span>
          <span className={CHIP}>{t.voto[consulta.voto]}</span>
          <span className={`${CHIP} ${cerrada ? "text-muted" : "border-deep text-deep"}`}>{t.estado[vista.estado]}</span>
        </p>
        <p className="text-sm">{textoCierre(consulta, vista.estado, idioma)}</p>
        {monto && (
          <p className="text-sm">
            <span className="font-medium">{c.monto(formatoPlata(monto.montoCentavos, monto.moneda, idioma))}</span>
            {monto.nota && <span className="block text-muted">{textoEn(monto.nota, idioma)}</span>}
          </p>
        )}
        <p className="text-sm text-muted">{textoVoto(consulta, idioma)}</p>
      </header>

      <section aria-labelledby="h-mi-reparto" className={CAJA}>
        <h2 id="h-mi-reparto" className="font-semibold">{c.miReparto}</h2>

        {cerrada ? (
          <p className="text-sm">
            {c.cerradaSoloLeer}
            {!vista.miReparto && ` ${c.noRepartiste}`}
          </p>
        ) : (
          <>
            {consulta.voto === "abierto" ? (
              <p id={idAviso} className="rounded-lg border border-gold bg-warn-bg px-3 py-2 text-sm text-warn-ink">
                <span aria-hidden="true">ⓘ </span>
                <strong>{c.abiertoNegrita}</strong>{" "}
                {consulta.resultadoVisible === "al-votar" ? c.abiertoAlVotar : c.abiertoAlCierre}
              </p>
            ) : (
              <p id={idAviso} className="rounded-lg border border-faint bg-surface-2 px-3 py-2 text-sm">
                <span aria-hidden="true">ⓘ </span>
                {c.secretoAviso}
              </p>
            )}
            <p className="text-sm text-muted">{c.costoCuadratico}</p>
          </>
        )}

        <Medidor titulo={c.creditosUsados} actual={usados} tope={CREDITOS_POR_PERSONA} />
        <p className="font-medium">{c.quedan(restantes, CREDITOS_POR_PERSONA)}</p>

        <ul className="grid gap-3">
          {consulta.opciones.map((o) => {
            const v = votosDe(reparto, o.id);
            const bloqueoMas = motivoNoSumar(reparto, o.id, idioma);
            const bloqueoMenos = motivoNoQuitar(consulta, reparto, o.id, idioma);
            const idMas = `mas-${o.id}`;
            const idMenos = `menos-${o.id}`;
            const plata = enPlata[o.id];
            const etiqueta = textoEn(o.etiqueta, idioma);
            return (
              <li key={o.id} className="grid gap-1 border-t border-faint pt-3 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-medium">{etiqueta}</span>
                  <span className="flex items-center gap-2">
                    {!cerrada && (
                      <button
                        type="button"
                        aria-label={c.quitar(etiqueta)}
                        aria-disabled={bloqueoMenos ? "true" : undefined}
                        aria-describedby={bloqueoMenos ? idMenos : undefined}
                        onClick={() => cambiar(o.id, -1)}
                        className={BOTON_VOTO}
                      >
                        <span aria-hidden="true">−</span>
                      </button>
                    )}
                    <span className="min-w-36 text-center">
                      {textoVotos(v, idioma)} · {textoCreditos(costo(v), idioma)}
                    </span>
                    {!cerrada && (
                      <button
                        type="button"
                        aria-label={c.sumar(etiqueta)}
                        aria-disabled={bloqueoMas ? "true" : undefined}
                        aria-describedby={bloqueoMas ? idMas : undefined}
                        onClick={() => cambiar(o.id, 1)}
                        className={BOTON_VOTO}
                      >
                        <span aria-hidden="true">+</span>
                      </button>
                    )}
                  </span>
                </div>
                {!cerrada && bloqueoMas && (
                  <p id={idMas} className="text-sm text-danger">
                    <span aria-hidden="true">⚠ </span>
                    {bloqueoMas}
                  </p>
                )}
                {!cerrada && bloqueoMenos && (
                  <span id={idMenos} className="sr-only">
                    {bloqueoMenos}
                  </span>
                )}
                {consulta.modo === "presupuesto" && monto && (
                  <p className="text-sm text-muted">
                    {plata === null || plata === undefined ? c.irianSinDato : c.irianConDato(formatoPlata(plata, monto.moneda, idioma))}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <Donut
          titulo={c.misCreditos}
          porciones={porciones}
          resto={{ etiqueta: c.sinUsar, valor: restantes }}
          formatoValor={(n) => textoCreditos(n, idioma)}
          sinDato={t.donut.sinDato}
          columnaEtiqueta={t.donut.opcion}
          textos={textosDonut}
        />

        {!cerrada && (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={guardar} aria-describedby={idAviso} className={BOTON_PRINCIPAL}>
              {c.guardar}
            </button>
            {sinGuardar && (
              <span className={`${CHIP} border-gold text-warn-ink`}>
                <span aria-hidden="true">● </span>{c.sinGuardar}
              </span>
            )}
            {!sinGuardar && vista.miReparto && (
              <span className="text-sm text-muted">
                <span aria-hidden="true">✓ </span>{c.guardado}
              </span>
            )}
          </div>
        )}
        {errorGuardar && (
          <p role="alert" className="text-sm font-medium text-danger">
            <span aria-hidden="true">⚠ </span>
            {errorGuardar}
          </p>
        )}
      </section>

      <ResultadoDelGrupo vista={vista} />
      <TablaDeRepartos vista={vista} />
      {vista.padron && <QuienFalta padron={vista.padron} cerrada={cerrada} />}
      {cerrada && <Acta vista={vista} />}

      {(vista.puedeCerrar || (cerrada && vista.cierreManual && repo.reabrir)) && (
        <section aria-labelledby="h-simulacion" className={CAJA}>
          <h2 id="h-simulacion" className="font-semibold">{c.simulacion}</h2>
          <p className="text-sm text-muted">{c.simulacionTexto}</p>
          <div>
            {vista.puedeCerrar ? (
              <button type="button" onClick={cerrar} className={BOTON_SUAVE}>{c.simularCierre}</button>
            ) : (
              <button type="button" onClick={reabrir} className={BOTON_SUAVE}>{c.reabrir}</button>
            )}
          </div>
        </section>
      )}

      {region}
    </div>
  );
}
