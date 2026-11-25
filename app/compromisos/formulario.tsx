"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { registrarEvento } from "@/lib/actividad/almacen";
import { EVENTOS } from "@/lib/actividad/eventos";
import { cargar, reducir } from "@/lib/compromisos/estado";
import { TextoBilingue } from "@/components/texto-bilingue";
import { describirCantidad, etiquetasDe } from "@/lib/compromisos/formato";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { textoEn } from "@/lib/idioma/tipos";
import { armarMercado, filtrarMercado, type FiltroMercado } from "@/lib/compromisos/mercado";
import {
  MAX_BIENES,
  MAX_DESCRIPCION,
  MAX_MONTO,
  MIN_MONTO,
  type Borrador,
  type ClaseCompromiso,
  type Compromiso,
  type TipoCompromiso,
} from "@/lib/compromisos/tipos";
import { validarCompromiso, type CampoError } from "@/lib/compromisos/validar";
import { CLAVES } from "@/lib/demo/claves";

const VACIO: Borrador = {
  tipo: "ofrezco",
  clase: "tiempo",
  descripcion: "",
  horas: "",
  bienes: "",
  monto: "",
};

const campo =
  "mt-1 block w-full rounded-lg border border-faint bg-surface px-3 py-2 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep aria-[invalid=true]:border-warn-ink";
const boton =
  "rounded-full px-5 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

/** Lo que escribió la persona no se traduce: con la plataforma en inglés se marca como español. */
const ES = { lang: "es" } as const;

export function Formulario() {
  const idioma = useIdioma();
  const t = useTextos("compromisos");
  const f = t.formulario;
  const { tipo: TEXTO_TIPO, clase: TEXTO_CLASE } = etiquetasDe(idioma);
  const marcaPropia = idioma === "en" ? ES : {};
  const cantidadDe = (c: Compromiso) => describirCantidad(c, idioma);
  const [lista, despachar] = useReducer(reducir, []);
  const [cargado, setCargado] = useState(false);
  const [b, setB] = useState<Borrador>(VACIO);
  const [errores, setErrores] = useState<Partial<Record<CampoError, string>>>({});
  const [aviso, setAviso] = useState("");
  const refs = useRef<Partial<Record<CampoError, HTMLInputElement | null>>>({});

  useEffect(() => {
    let guardado: string | null = null;
    try {
      guardado = window.localStorage.getItem(CLAVES.compromisos);
    } catch {
      guardado = null;
    }
    // Leer el almacenamiento del navegador solo puede hacerse tras montar.
    despachar({ tipo: "cargar", compromisos: cargar(guardado) });
    setCargado(true);
  }, []);

  useEffect(() => {
    if (!cargado) return;
    try {
      window.localStorage.setItem(CLAVES.compromisos, JSON.stringify(lista));
    } catch {
      // Sin almacenamiento: la lista vive solo mientras la página esté abierta.
    }
  }, [lista, cargado]);

  const tituloLista = useRef<HTMLHeadingElement | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  function anunciar(texto: string) {
    if (temporizador.current) clearTimeout(temporizador.current);
    setAviso("");
    if (texto) temporizador.current = setTimeout(() => setAviso(texto), 50);
  }

  function cambiar<K extends keyof Borrador>(k: K, v: Borrador[K]) {
    setB((x) => ({ ...x, [k]: v }));
  }

  function cambiarClase(clase: ClaseCompromiso) {
    // Al cambiar de clase se limpia la cantidad anterior para no mezclar unidades.
    setB((x) => ({ ...x, clase, horas: "", bienes: "", monto: "" }));
    setErrores((e) => ({ ...e, horas: undefined, bienes: undefined, monto: undefined }));
  }

  function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    const r = validarCompromiso(b, undefined, undefined, idioma);
    if (!r.ok) {
      setErrores(r.errores);
      anunciar("");
      const primero = (["descripcion", "horas", "bienes", "monto"] as CampoError[]).find((k) => r.errores[k]);
      if (primero) refs.current[primero]?.focus();
      return;
    }
    despachar({ tipo: "registrar", compromiso: r.compromiso });
    registrarEvento(EVENTOS.publicasteEnMercado(r.compromiso.descripcion));
    if (r.compromiso.tipo === "ofrezco") registrarEvento(EVENTOS.interesEnOferta(r.compromiso.id));
    setErrores({});
    setB({ ...VACIO, tipo: b.tipo, clase: b.clase });
    // Se vacía la región y se vuelve a llenar en el siguiente tick para que el lector
    // anuncie cada registro aunque el texto sea el mismo.
    anunciar(t.anuncios.registrado);
  }

  const describe = (k: CampoError) => (errores[k] ? `err-${k}` : undefined);

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="grid gap-8">
      <form onSubmit={enviar} noValidate className="grid gap-5 rounded-xl border border-line bg-surface p-5">
        <fieldset className="grid gap-2">
          <legend className="font-medium">{f.tipo}</legend>
          <div className="flex flex-wrap gap-4">
            {(Object.keys(TEXTO_TIPO) as TipoCompromiso[]).map((t) => (
              <label key={t} className="flex items-center gap-2">
                <input type="radio" name="tipo" value={t} checked={b.tipo === t} onChange={() => cambiar("tipo", t)} />
                {TEXTO_TIPO[t]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="font-medium">{f.medio}</legend>
          <div className="flex flex-wrap gap-4">
            {(Object.keys(TEXTO_CLASE) as ClaseCompromiso[]).map((c) => (
              <label key={c} className="flex items-center gap-2">
                <input type="radio" name="clase" value={c} checked={b.clase === c} onChange={() => cambiarClase(c)} />
                {TEXTO_CLASE[c]}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="descripcion" className="font-medium">
            {f.descripcion} <span className="font-normal text-muted">{f.hastaCaracteres(MAX_DESCRIPCION)}</span>
          </label>
          <input
            id="descripcion"
            ref={(el) => {
              refs.current.descripcion = el;
            }}
            type="text"
            value={b.descripcion}
            onChange={(e) => cambiar("descripcion", e.target.value)}
            aria-invalid={errores.descripcion ? true : undefined}
            aria-describedby={describe("descripcion")}
            className={campo}
          />
          {errores.descripcion && (
            <p id="err-descripcion" className="mt-1 text-sm font-medium text-warn-ink">
              {f.error} {errores.descripcion}
            </p>
          )}
        </div>

        {b.clase === "tiempo" ? (
          <div>
            <label htmlFor="horas" className="font-medium">
              {f.horas} <span className="font-normal text-muted">{f.horasAyuda}</span>
            </label>
            <input
              id="horas"
              ref={(el) => {
                refs.current.horas = el;
              }}
              type="text"
              inputMode="numeric"
              value={b.horas}
              onChange={(e) => cambiar("horas", e.target.value)}
              aria-invalid={errores.horas ? true : undefined}
              aria-describedby={describe("horas")}
              className={campo}
            />
            {errores.horas && (
              <p id="err-horas" className="mt-1 text-sm font-medium text-warn-ink">
                {f.error} {errores.horas}
              </p>
            )}
          </div>
        ) : b.clase === "plata" ? (
          <div>
            <label htmlFor="monto" className="font-medium">
              {f.monto} <span className="font-normal text-muted">{f.montoAyuda(MIN_MONTO, MAX_MONTO)}</span>
            </label>
            <input
              id="monto"
              ref={(el) => {
                refs.current.monto = el;
              }}
              type="text"
              inputMode="numeric"
              value={b.monto}
              onChange={(e) => cambiar("monto", e.target.value)}
              aria-invalid={errores.monto ? true : undefined}
              aria-describedby={describe("monto")}
              className={campo}
            />
            {errores.monto && (
              <p id="err-monto" className="mt-1 text-sm font-medium text-warn-ink">
                {f.error} {errores.monto}
              </p>
            )}
            <p className="mt-1 text-sm text-muted">{f.montoNota}</p>
          </div>
        ) : b.clase === "trueque" ? (
          <p className="text-sm text-muted">{f.trueque}</p>
        ) : (
          <div>
            <label htmlFor="bienes" className="font-medium">
              {f.bienes} <span className="font-normal text-muted">{f.bienesAyuda}</span>
            </label>
            <input
              id="bienes"
              ref={(el) => {
                refs.current.bienes = el;
              }}
              type="text"
              value={b.bienes}
              onChange={(e) => cambiar("bienes", e.target.value)}
              aria-invalid={errores.bienes ? true : undefined}
              aria-describedby={describe("bienes")}
              className={campo}
            />
            {errores.bienes && (
              <p id="err-bienes" className="mt-1 text-sm font-medium text-warn-ink">
                {f.error} {errores.bienes}
              </p>
            )}
            <p className="mt-1 text-sm text-muted">{f.bienesMax(MAX_BIENES)}</p>
          </div>
        )}

        <div>
          <button type="submit" className={`${boton} bg-deep text-on-deep hover:bg-deep-2`}>
            {f.registrar}
          </button>
        </div>
      </form>

      <p role="status" aria-live="polite" className="text-sm font-medium">
        {aviso}
      </p>

      <section aria-labelledby="titulo-lista" className="-mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="titulo-lista"
            ref={tituloLista}
            tabIndex={-1}
            className="text-xl font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep"
          >{t.lista.titulo}</h2>
          {lista.length > 0 && (
            <button
              type="button"
              onClick={() => {
                despachar({ tipo: "borrarTodo" });
                tituloLista.current?.focus();
                anunciar(t.anuncios.borrados);
              }}
              className={`${boton} border border-faint bg-surface hover:bg-surface-2`}
            >
              {t.lista.borrarTodo}
            </button>
          )}
        </div>
        {!cargado ? null : lista.length === 0 ? (
          <p className="mt-3 text-muted">{t.lista.vacia}</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {lista.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4"
              >
                <span>
                  {TEXTO_TIPO[c.tipo]} · {TEXTO_CLASE[c.clase]} · <span {...marcaPropia}>{c.descripcion}</span>
                  {cantidadDe(c) !== null && (
                    <>
                      {" · "}
                      {c.clase === "bienes" && c.cantidadBienes !== undefined ? (
                        <span {...marcaPropia}>{c.cantidadBienes}</span>
                      ) : (
                        cantidadDe(c)
                      )}
                    </>
                  )}
                </span>
                <button
                  type="button"
                  aria-label={t.lista.quitarAria(c.descripcion)}
                  onClick={() => {
                    despachar({ tipo: "quitar", id: c.id });
                    tituloLista.current?.focus();
                    anunciar(t.anuncios.quitado);
                  }}
                  className={`${boton} border border-faint bg-surface hover:bg-surface-2`}
                >
                  {t.lista.quitar}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>
      <Mercado propios={lista} />
    </div>
  );
}

const TIPOS_FILTRO = ["todos", "ofrezco", "necesito"] as const;
const CLASES_FILTRO = ["todas", "tiempo", "bienes", "plata", "trueque"] as const;

function Mercado({ propios }: { propios: Compromiso[] }) {
  const idioma = useIdioma();
  const tm = useTextos("compromisos");
  const m = tm.mercado;
  const { tipo: TEXTO_TIPO, clase: TEXTO_CLASE } = etiquetasDe(idioma);
  const textoConteo = m.publicaciones;
  const marcaPropia = idioma === "en" ? ES : {};
  const [filtro, setFiltro] = useState<FiltroMercado>({ tipo: "todos", clase: "todas" });
  const [interesa, setInteresa] = useState<Set<string>>(new Set());
  // El anuncio guarda la lista de propios con la que se calculó: si cambia (se registra o quita
  // algo), queda viejo y se deja vacío en vez de decir un número desactualizado.
  const [anunciado, setAnunciado] = useState<{ texto: string; propios: Compromiso[] } | null>(null);
  const anuncio = anunciado && anunciado.propios === propios ? anunciado.texto : "";
  const items = filtrarMercado(armarMercado(propios), filtro);

  function cambiarFiltro(nuevo: FiltroMercado) {
    setFiltro(nuevo);
    const n = filtrarMercado(armarMercado(propios), nuevo).length;
    // Se nombra el filtro elegido para que el anuncio cambie aunque el conteo sea el mismo.
    const tipo = nuevo.tipo === "todos" ? tm.anuncios.todosLosTipos : TEXTO_TIPO[nuevo.tipo];
    const medio = nuevo.clase === "todas" ? tm.anuncios.todosLosMedios : TEXTO_CLASE[nuevo.clase];
    setAnunciado({ texto: `${tipo}, ${medio}: ${textoConteo(n)}`, propios });
  }

  function alternar(id: string) {
    setInteresa((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  return (
    <section aria-labelledby="titulo-mercado" className="grid gap-4">
      <h2 id="titulo-mercado" className="text-xl font-semibold">{m.titulo}</h2>
      <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm">{m.primerPaso}</p>
      <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">{m.pronto}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="filtro-tipo" className="font-medium">{m.filtroTipo}</label>
          <select
            id="filtro-tipo"
            value={filtro.tipo}
            onChange={(e) => cambiarFiltro({ ...filtro, tipo: e.target.value as FiltroMercado["tipo"] })}
            className={campo}
          >
            {TIPOS_FILTRO.map((k) => (
              <option key={k} value={k}>{k === "todos" ? m.todos : TEXTO_TIPO[k]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtro-medio" className="font-medium">{m.filtroMedio}</label>
          <select
            id="filtro-medio"
            value={filtro.clase}
            onChange={(e) => cambiarFiltro({ ...filtro, clase: e.target.value as FiltroMercado["clase"] })}
            className={campo}
          >
            {CLASES_FILTRO.map((c) => (
              <option key={c} value={c}>{c === "todas" ? m.todos : TEXTO_CLASE[c]}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-sm text-muted">{textoConteo(items.length)}</p>
      {/* Solo se anuncia cuando cambia un filtro, no al registrar o quitar compromisos. */}
      <p aria-live="polite" className="sr-only">{anuncio}</p>
      {items.length === 0 ? (
        <p className="text-muted">{m.sinResultados}</p>
      ) : (
        <ul className="grid gap-3" aria-label={m.listaAria}>
          {items.map(({ compromiso: c, propio, descripcion, bienes }) => {
            // La cantidad de bienes de un ejemplo viene traducida; la de la persona va tal cual (con lang="es" en inglés).
            const cantidad = !propio && bienes ? textoEn(bienes, idioma) : describirCantidad(c, idioma);
            const cantidadPropia = propio && c.clase === "bienes" && c.cantidadBienes !== undefined;
            const marcado = interesa.has(c.id);
            return (
              <li key={c.id} className="grid gap-2 rounded-xl border border-line bg-surface p-4">
                <p className="text-sm font-medium">
                  {TEXTO_TIPO[c.tipo]} · {TEXTO_CLASE[c.clase]}
                  {cantidad !== null && (
                    <>
                      {" · "}
                      {cantidadPropia && idioma === "en" ? <span lang="es">{cantidad}</span> : cantidad}
                    </>
                  )}
                </p>
                {/* Lo que publica la persona va tal cual; las ofertas de ejemplo van traducidas, con su nota. */}
                <p>{propio ? <span {...marcaPropia}>{c.descripcion}</span> : <TextoBilingue valor={descripcion} />}</p>
                <p className="text-sm text-muted">{m.publica} {propio ? m.vos : m.comunidadEjemplo}</p>
                {!propio && (
                  <div>
                    <button
                      type="button"
                      aria-pressed={marcado}
                      aria-label={m.meInteresaAria(textoEn(descripcion, idioma))}
                      onClick={() => alternar(c.id)}
                      className={`${boton} border border-faint ${marcado ? "bg-deep text-on-deep" : "bg-surface hover:bg-surface-2"}`}
                    >
                      {m.meInteresa}
                    </button>
                    {marcado && <span className="ml-2 text-sm font-medium">{m.marcado}</span>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
