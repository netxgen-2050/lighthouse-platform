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
import { ETIQUETA_AMBITO, ETIQUETA_ESTADO, ETIQUETA_MODO, ETIQUETA_VOTO, type VistaConsulta } from "@/lib/fogon/consultas/tipos";
import { Acta, QuienFalta, ResultadoDelGrupo, TablaDeRepartos } from "./resultado-grupo";

// El reparto guardado queda solo en este navegador: no hay pedidos de red.

const BOTON =
  "rounded-lg border px-4 py-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON_SUAVE = `${BOTON} border-muted hover:bg-surface-2`;
const BOTON_PRINCIPAL = `${BOTON} border-deep bg-deep text-on-deep`;
const BOTON_VOTO = `${BOTON} min-h-11 min-w-11 border-muted text-lg font-semibold hover:bg-surface-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-50`;
const CHIP = "rounded-full border border-faint px-3 py-0.5 text-sm";
const CAJA = "grid gap-3 rounded-xl border border-faint bg-surface p-4";

export function ConsultaCliente({ id }: { id: string }) {
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
        <h1 className="text-3xl font-semibold">Consulta</h1>
        <p className="mt-2 text-muted">Cargando la consulta…</p>
        {region}
      </>
    );
  }
  if (!lectura.ok) {
    return (
      <>
        <h1 className="text-3xl font-semibold">Consulta</h1>
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

  function cambiar(opcionId: string, delta: 1 | -1) {
    const siguiente = mover(consulta, reparto, opcionId, delta);
    if (siguiente === reparto) return;
    setReparto(siguiente);
    setErrorGuardar(null);
    const etiqueta = consulta.opciones.find((o) => o.id === opcionId)!.etiqueta;
    const v = votosDe(siguiente, opcionId);
    anunciar(`${etiqueta}: ${textoVotos(v)}, ${textoCreditos(costo(v))}. Te quedan ${creditosRestantes(siguiente)}.`);
  }

  async function guardar() {
    const r = await repo.guardarReparto(id, reparto);
    if (r.ok) {
      setErrorGuardar(null);
      await recargar(true);
      anunciar("Tu reparto quedó guardado (simulado).");
      return;
    }
    const texto =
      r.error === "cerrada"
        ? "La consulta ya cerró: no se puede guardar el reparto."
        : r.error === "sin-sesion"
          ? "Entrá para guardar tu reparto."
          : r.error === "invalido"
            ? `Tu reparto no es válido: ${(r.motivos ?? []).join(", ") || "revisalo"}.`
            : "No pudimos guardar tu reparto. Probá de nuevo.";
    setErrorGuardar(texto);
    if (r.error === "cerrada") await recargar(false);
  }

  async function cerrar() {
    const r = await repo.cerrar(id);
    await recargar(true);
    anunciar(r.ok ? "Consulta cerrada (simulado)." : "No se pudo cerrar la consulta.");
  }

  async function reabrir() {
    const r = await repo.reabrir?.(id);
    await recargar(true);
    anunciar(r?.ok ? "Consulta abierta de nuevo (simulado)." : "No se pudo volver a abrir la consulta.");
  }

  const porciones = consulta.opciones.map((o) => ({
    id: o.id,
    etiqueta: o.etiqueta,
    valor: costo(votosDe(reparto, o.id)),
  }));
  const usados = creditosUsados(reparto);
  const idAviso = "aviso-voto";
  const monto = consulta.presupuesto;

  return (
    <div className="grid gap-5">
      <header className="grid gap-2">
        <p className="text-sm font-medium text-muted">Fogón · consulta</p>
        <h1 className="text-3xl font-semibold">{consulta.titulo}</h1>
        <p className="max-w-2xl text-muted">{consulta.descripcion}</p>
        <p className="flex flex-wrap gap-2">
          <span className={CHIP}>{ETIQUETA_MODO[consulta.modo]}</span>
          <span className={CHIP}>{ETIQUETA_AMBITO[consulta.ambito]}</span>
          <span className={CHIP}>{ETIQUETA_VOTO[consulta.voto]}</span>
          <span className={`${CHIP} ${cerrada ? "text-muted" : "border-deep text-deep"}`}>{ETIQUETA_ESTADO[vista.estado]}</span>
        </p>
        <p className="text-sm">{textoCierre(consulta, vista.estado)}</p>
        {monto && (
          <p className="text-sm">
            <span className="font-medium">Monto a repartir: {formatoPlata(monto.montoCentavos, monto.moneda)}</span>
            {monto.nota && <span className="block text-muted">{monto.nota}</span>}
          </p>
        )}
        <p className="text-sm text-muted">{textoVoto(consulta)}</p>
      </header>

      <section aria-labelledby="h-mi-reparto" className={CAJA}>
        <h2 id="h-mi-reparto" className="font-semibold">Mi reparto</h2>

        {cerrada ? (
          <p className="text-sm">
            La consulta está cerrada: tu reparto se ve solo para leer.
            {!vista.miReparto && " No repartiste en esta consulta."}
          </p>
        ) : (
          <>
            {consulta.voto === "abierto" ? (
              <p id={idAviso} className="rounded-lg border border-gold bg-warn-bg px-3 py-2 text-sm text-warn-ink">
                <span aria-hidden="true">ⓘ </span>
                <strong>Tu reparto lo va a ver todo el padrón</strong>{" "}
                {consulta.resultadoVisible === "al-votar" ? "en cuanto lo guardes." : "cuando cierre la consulta."}
              </p>
            ) : (
              <p id={idAviso} className="rounded-lg border border-faint bg-surface-2 px-3 py-2 text-sm">
                <span aria-hidden="true">ⓘ </span>
                Voto secreto: nadie ve tu reparto, solo el resultado del grupo.
              </p>
            )}
            <p className="text-sm text-muted">
              Poner n votos en una opción cuesta n² créditos: el primero cuesta 1, el segundo 3, el tercero 5.
            </p>
          </>
        )}

        <Medidor titulo="Créditos usados" actual={usados} tope={CREDITOS_POR_PERSONA} />
        <p className="font-medium">
          Te quedan {restantes} de {CREDITOS_POR_PERSONA} créditos
        </p>

        <ul className="grid gap-3">
          {consulta.opciones.map((o) => {
            const v = votosDe(reparto, o.id);
            const bloqueoMas = motivoNoSumar(reparto, o.id);
            const bloqueoMenos = motivoNoQuitar(consulta, reparto, o.id);
            const idMas = `mas-${o.id}`;
            const idMenos = `menos-${o.id}`;
            const plata = enPlata[o.id];
            return (
              <li key={o.id} className="grid gap-1 border-t border-faint pt-3 first:border-t-0 first:pt-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-medium">{o.etiqueta}</span>
                  <span className="flex items-center gap-2">
                    {!cerrada && (
                      <button
                        type="button"
                        aria-label={`Quitar un voto a ${o.etiqueta}`}
                        aria-disabled={bloqueoMenos ? "true" : undefined}
                        aria-describedby={bloqueoMenos ? idMenos : undefined}
                        onClick={() => cambiar(o.id, -1)}
                        className={BOTON_VOTO}
                      >
                        <span aria-hidden="true">−</span>
                      </button>
                    )}
                    <span className="min-w-36 text-center">
                      {textoVotos(v)} · {textoCreditos(costo(v))}
                    </span>
                    {!cerrada && (
                      <button
                        type="button"
                        aria-label={`Sumar un voto a ${o.etiqueta}`}
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
                    Con tu reparto irían{plata === null || plata === undefined ? ": " : " "}
                    {formatoPlata(plata ?? null, monto.moneda)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <Donut
          titulo="Mis créditos"
          porciones={porciones}
          resto={{ etiqueta: "Sin usar", valor: restantes }}
          formatoValor={(n) => textoCreditos(n)}
        />

        {!cerrada && (
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={guardar} aria-describedby={idAviso} className={BOTON_PRINCIPAL}>
              Guardar mi reparto
            </button>
            {sinGuardar && (
              <span className={`${CHIP} border-gold text-warn-ink`}>
                <span aria-hidden="true">● </span>Sin guardar
              </span>
            )}
            {!sinGuardar && vista.miReparto && (
              <span className="text-sm text-muted">
                <span aria-hidden="true">✓ </span>Guardado
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
          <h2 id="h-simulacion" className="font-semibold">Simulación</h2>
          <p className="text-sm text-muted">Solo para probar el prototipo: el cierre queda en este navegador.</p>
          <div>
            {vista.puedeCerrar ? (
              <button type="button" onClick={cerrar} className={BOTON_SUAVE}>Simular el cierre</button>
            ) : (
              <button type="button" onClick={reabrir} className={BOTON_SUAVE}>Volver a abrir (simulado)</button>
            )}
          </div>
        </section>
      )}

      {region}
    </div>
  );
}
