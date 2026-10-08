"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { cargar, reducir } from "@/lib/compromisos/estado";
import { describirCantidad, describirCompromiso, TEXTO_CLASE, TEXTO_TIPO } from "@/lib/compromisos/formato";
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

export function Formulario() {
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
    const r = validarCompromiso(b);
    if (!r.ok) {
      setErrores(r.errores);
      anunciar("");
      const primero = (["descripcion", "horas", "bienes", "monto"] as CampoError[]).find((k) => r.errores[k]);
      if (primero) refs.current[primero]?.focus();
      return;
    }
    despachar({ tipo: "registrar", compromiso: r.compromiso });
    setErrores({});
    setB({ ...VACIO, tipo: b.tipo, clase: b.clase });
    // Se vacía la región y se vuelve a llenar en el siguiente tick para que el lector
    // anuncie cada registro aunque el texto sea el mismo.
    anunciar("Compromiso registrado.");
  }

  const describe = (k: CampoError) => (errores[k] ? `err-${k}` : undefined);

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="grid gap-8">
      <form onSubmit={enviar} noValidate className="grid gap-5 rounded-xl border border-line bg-surface p-5">
        <fieldset className="grid gap-2">
          <legend className="font-medium">Tipo</legend>
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
          <legend className="font-medium">Medio de intercambio</legend>
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
            Descripción <span className="font-normal text-muted">(hasta {MAX_DESCRIPCION} caracteres)</span>
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
              Error: {errores.descripcion}
            </p>
          )}
        </div>

        {b.clase === "tiempo" ? (
          <div>
            <label htmlFor="horas" className="font-medium">
              Horas por mes <span className="font-normal text-muted">(opcional, de 1 a 160)</span>
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
                Error: {errores.horas}
              </p>
            )}
          </div>
        ) : b.clase === "plata" ? (
          <div>
            <label htmlFor="monto" className="font-medium">
              Monto orientativo en USD <span className="font-normal text-muted">(opcional, de {MIN_MONTO} a {MAX_MONTO})</span>
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
                Error: {errores.monto}
              </p>
            )}
            <p className="mt-1 text-sm text-muted">
              Es solo una referencia: en el prototipo no se cobra ni se paga nada.
            </p>
          </div>
        ) : b.clase === "trueque" ? (
          <p className="text-sm text-muted">
            En el trueque no se pone cantidad: contá en la descripción qué ofrecés y a cambio de qué.
          </p>
        ) : (
          <div>
            <label htmlFor="bienes" className="font-medium">
              Cantidad orientativa <span className="font-normal text-muted">(opcional, por ejemplo &quot;20 kg por mes&quot;)</span>
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
                Error: {errores.bienes}
              </p>
            )}
            <p className="mt-1 text-sm text-muted">Hasta {MAX_BIENES} caracteres.</p>
          </div>
        )}

        <div>
          <button type="submit" className={`${boton} bg-deep text-on-deep hover:bg-deep-2`}>
            Registrar
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
          >Tus compromisos</h2>
          {lista.length > 0 && (
            <button
              type="button"
              onClick={() => {
                despachar({ tipo: "borrarTodo" });
                tituloLista.current?.focus();
                anunciar("Se borraron todos los compromisos.");
              }}
              className={`${boton} border border-faint bg-surface hover:bg-surface-2`}
            >
              Borrar todo
            </button>
          )}
        </div>
        {!cargado ? null : lista.length === 0 ? (
          <p className="mt-3 text-muted">Todavía no registraste compromisos.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {lista.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4"
              >
                <span>{describirCompromiso(c)}</span>
                <button
                  type="button"
                  aria-label={`Quitar ${c.descripcion}`}
                  onClick={() => {
                    despachar({ tipo: "quitar", id: c.id });
                    tituloLista.current?.focus();
                    anunciar("Compromiso quitado.");
                  }}
                  className={`${boton} border border-faint bg-surface hover:bg-surface-2`}
                >
                  Quitar
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

function textoConteo(n: number): string {
  return n === 1 ? "1 publicación" : `${n} publicaciones`;
}

function Mercado({ propios }: { propios: Compromiso[] }) {
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
    const tipo = nuevo.tipo === "todos" ? "Todos los tipos" : TEXTO_TIPO[nuevo.tipo];
    const medio = nuevo.clase === "todas" ? "todos los medios" : TEXTO_CLASE[nuevo.clase];
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
      <h2 id="titulo-mercado" className="text-xl font-semibold">Mercado</h2>
      <p className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm">
        El primer paso para entrar al mercado es publicar una oferta o una necesidad: registrala en el formulario y aparece acá.
      </p>
      <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
        Pronto, una inteligencia artificial va a sugerirte el mejor match entre ofertas y necesidades.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="filtro-tipo" className="font-medium">Filtrar por tipo</label>
          <select
            id="filtro-tipo"
            value={filtro.tipo}
            onChange={(e) => cambiarFiltro({ ...filtro, tipo: e.target.value as FiltroMercado["tipo"] })}
            className={campo}
          >
            {TIPOS_FILTRO.map((t) => (
              <option key={t} value={t}>{t === "todos" ? "Todos" : TEXTO_TIPO[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filtro-medio" className="font-medium">Filtrar por medio de intercambio</label>
          <select
            id="filtro-medio"
            value={filtro.clase}
            onChange={(e) => cambiarFiltro({ ...filtro, clase: e.target.value as FiltroMercado["clase"] })}
            className={campo}
          >
            {CLASES_FILTRO.map((c) => (
              <option key={c} value={c}>{c === "todas" ? "Todos" : TEXTO_CLASE[c]}</option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-sm text-muted">{textoConteo(items.length)}</p>
      {/* Solo se anuncia cuando cambia un filtro, no al registrar o quitar compromisos. */}
      <p aria-live="polite" className="sr-only">{anuncio}</p>
      {items.length === 0 ? (
        <p className="text-muted">No hay publicaciones con esos filtros.</p>
      ) : (
        <ul className="grid gap-3" aria-label="Publicaciones del mercado">
          {items.map(({ compromiso: c, autor, propio }) => {
            const cantidad = describirCantidad(c);
            const marcado = interesa.has(c.id);
            return (
              <li key={c.id} className="grid gap-2 rounded-xl border border-line bg-surface p-4">
                <p className="text-sm font-medium">
                  {TEXTO_TIPO[c.tipo]} · {TEXTO_CLASE[c.clase]}
                  {cantidad !== null && ` · ${cantidad}`}
                </p>
                <p>{c.descripcion}</p>
                <p className="text-sm text-muted">Publica: {autor}</p>
                {!propio && (
                  <div>
                    <button
                      type="button"
                      aria-pressed={marcado}
                      aria-label={`Me interesa: ${c.descripcion}`}
                      onClick={() => alternar(c.id)}
                      className={`${boton} border border-faint ${marcado ? "bg-deep text-on-deep" : "bg-surface hover:bg-surface-2"}`}
                    >
                      Me interesa
                    </button>
                    {marcado && <span className="ml-2 text-sm font-medium">Marcado como de interés (simulado)</span>}
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
