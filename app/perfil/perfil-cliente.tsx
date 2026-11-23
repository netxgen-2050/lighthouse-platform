"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSesion } from "@/components/sesion/contexto";
import { CLAVES } from "@/lib/demo/claves";
import { useIdioma, useTextos } from "@/lib/idioma/cliente";
import { COMUNIDAD_LIGHTHOUSE, leer as leerMembresia, type Membresias } from "@/lib/membresia/estado";
import { ROLES, buscarRol, textoDeRol } from "@/lib/pactos/datos";
import { leerPactosConciliados, pactosAceptados } from "@/lib/pactos/estado";
import {
  PERFIL_VACIO,
  borradorInicial,
  cargarPerfil,
  iniciales,
  normalizar,
  perfilVacio,
  validar,
  type ErroresPerfil,
  type Perfil,
} from "@/lib/perfil/modelo";
import { totalConDato } from "@/lib/semillas/calculo";
import { semillasDeComunidad } from "@/lib/semillas/estado";
import { buscarTribu } from "@/lib/tribus/datos";

const FOCO = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
const BOTON = `w-fit rounded-lg border border-muted px-4 py-1.5 hover:bg-surface-2 ${FOCO}`;
const BOTON_PRINCIPAL = `w-fit rounded-lg bg-deep px-4 py-1.5 text-on-deep hover:bg-deep-2 ${FOCO}`;
const CAMPO = `mt-1 block w-full rounded-lg border border-muted bg-surface px-3 py-1.5 text-ink ${FOCO}`;
const TARJETA = "grid content-start gap-3 rounded-xl border border-faint bg-surface p-5";
const ETIQUETA = "rounded-full border border-muted bg-surface-2 px-3 py-0.5 text-sm";

/** Campos del formulario en el orden en que se ven, para llevar el foco al primer error. */
const ORDEN_CAMPOS: (keyof ErroresPerfil)[] = ["nombre", "lugar", "frase", "ofrezco", "rolOtro", "decision", "noNegociables"];

type Resumen = { pactos: number | null; semillas: number | null };
type Comunidad = { id: string; nombre: string; href: string; estado: "miembro" | "pedido" };

function resumir(pactosCrudo: string | null): Resumen {
  // Con las respuestas de la tribu aplicadas en memoria (no se guarda nada).
  const estado = leerPactosConciliados(pactosCrudo);
  const semillas = totalConDato(Object.keys(estado.comunidades).map((id) => semillasDeComunidad(pactosCrudo, id).total));
  // Sin ningún pacto guardado no hay dato (no es un 0 inventado).
  const hayPactos = Object.keys(estado.comunidades).length > 0;
  return { pactos: hayPactos ? pactosAceptados(estado).length : null, semillas };
}

function comunidadesDe(m: Membresias): Comunidad[] {
  const salida: Comunidad[] = [];
  for (const [id, estado] of Object.entries(m)) {
    if (id === COMUNIDAD_LIGHTHOUSE) {
      salida.push({ id, nombre: "Lighthouse", href: "/territorios/lighthouse", estado });
    } else {
      const tribu = buscarTribu(id);
      salida.push({ id, nombre: tribu ? tribu.nombre : id, href: tribu ? `/tribus/${id}` : "/tribus", estado });
    }
  }
  return salida;
}

export function PerfilCliente() {
  const { sesion, nombre: nombreCuenta } = useSesion();
  const idioma = useIdioma();
  const t = useTextos("perfil");
  const comunes = useTextos("comunes");
  const [listo, setListo] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VACIO);
  const [comunidades, setComunidades] = useState<Comunidad[] | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState<Perfil>(PERFIL_VACIO);
  const [errores, setErrores] = useState<ErroresPerfil>({});
  const [guardado, setGuardado] = useState(false);
  const editarRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  // Adónde mandar el foco después del próximo render.
  const foco = useRef<"editar" | "formulario" | null>(null);

  useEffect(() => {
    // Lectura del almacenamiento del navegador tras hidratar (no existe en el servidor).
    try {
      const ls = window.localStorage;
      setPerfil(cargarPerfil(ls.getItem(CLAVES.perfilDatos), ls.getItem(CLAVES.perfil)));
      setComunidades(comunidadesDe(leerMembresia(ls.getItem(CLAVES.membresia))));
      setResumen(resumir(ls.getItem(CLAVES.pactos)));
    } catch {
      setFalloAlmacen(true);
    }
    setListo(true);
  }, []);

  useEffect(() => {
    const destino = foco.current;
    if (!destino) return;
    foco.current = null;
    if (destino === "editar") editarRef.current?.focus();
    else formRef.current?.querySelector<HTMLElement>("input, textarea")?.focus();
  });

  function empezar() {
    // Primera vez: si Privy trae el nombre (por ejemplo de Google), el formulario arranca con él.
    setBorrador(borradorInicial(perfil, nombreCuenta));
    setErrores({});
    setGuardado(false);
    setEditando(true);
    foco.current = "formulario";
  }

  function cancelar() {
    setEditando(false);
    foco.current = "editar";
  }

  function cambiar<K extends keyof Perfil>(campo: K, valor: Perfil[K]) {
    setBorrador((b) => ({ ...b, [campo]: valor }));
  }

  function alternarRol(clave: Perfil["roles"][number], marcado: boolean) {
    setBorrador((b) => ({ ...b, roles: marcado ? [...b.roles, clave] : b.roles.filter((r) => r !== clave) }));
  }

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    const errs = validar(borrador, idioma);
    setErrores(errs);
    if (Object.keys(errs).length > 0) {
      // El foco al primer campo con error (descrito por su mensaje) hace que el lector lo anuncie.
      const primero = ORDEN_CAMPOS.find((c) => errs[c]);
      if (primero) formRef.current?.querySelector<HTMLElement>(`[data-campo="${primero}"]`)?.focus();
      return;
    }
    const limpio = normalizar(borrador);
    let seGuardo = true;
    try {
      window.localStorage.setItem(CLAVES.perfilDatos, JSON.stringify(limpio));
    } catch {
      seGuardo = false;
    }
    setFalloAlmacen(!seGuardo);
    setPerfil(limpio);
    setEditando(false);
    // Si no se pudo guardar, solo se muestra el error (nunca el "Listo").
    setGuardado(seGuardo);
    foco.current = "editar";
  }

  if (!listo) return <p role="status" className="text-muted">{comunes.cargando}</p>;

  /** "sin dato" / "no data": el dato que falta no es cero. */
  const sinDato = <span className="text-muted">{comunes.sinDato}</span>;
  /** Lo que escribió la persona se muestra tal cual; con la plataforma en inglés se marca como español (no se traduce). */
  const propio = (texto: string): ReactNode => (idioma === "en" ? <span lang="es">{texto}</span> : texto);

  const vacio = perfilVacio(perfil);
  const nombresRoles = perfil.roles.map((c) => {
    if (c === "otro" && perfil.rolOtro) return <>{t.datos.rolOtro}{propio(perfil.rolOtro)}</>;
    const rol = buscarRol(c);
    return rol ? textoDeRol(rol, idioma).nombre : c;
  });
  const aviso = (
    <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">{t.aviso}</p>
  );

  // Función común (no componente): devuelve el aviso del campo, o nada si está bien.
  const error = (campo: keyof ErroresPerfil) =>
    errores[campo] ? (
      <p id={`error-${campo}`} role="alert" className="mt-1 text-sm font-medium text-danger">
        Error: {errores[campo]}
      </p>
    ) : null;
  const describe = (campo: keyof ErroresPerfil) => (errores[campo] ? `error-${campo}` : undefined);

  if (editando) {
    const f = t.formulario;
    return (
      <form ref={formRef} onSubmit={guardar} noValidate aria-labelledby="editar-perfil" className={`${TARJETA} max-w-3xl`}>
        <h2 id="editar-perfil" className="text-xl font-semibold">{f.titulo}</h2>
        <div>
          <label htmlFor="p-nombre">{f.nombre}</label>
          <input
            id="p-nombre"
            data-campo="nombre"
            value={borrador.nombre}
            onChange={(e) => cambiar("nombre", e.target.value)}
            aria-invalid={Boolean(errores.nombre)}
            aria-describedby={describe("nombre")}
            autoComplete="name"
            className={CAMPO}
          />
          {error("nombre")}
        </div>
        <div>
          <label htmlFor="p-lugar">{f.lugar}</label>
          <input
            id="p-lugar"
            data-campo="lugar"
            value={borrador.lugar}
            onChange={(e) => cambiar("lugar", e.target.value)}
            aria-invalid={Boolean(errores.lugar)}
            aria-describedby={describe("lugar")}
            className={CAMPO}
          />
          {error("lugar")}
        </div>
        <div>
          <label htmlFor="p-frase">{f.frase}</label>
          <input
            id="p-frase"
            data-campo="frase"
            value={borrador.frase}
            onChange={(e) => cambiar("frase", e.target.value)}
            aria-invalid={Boolean(errores.frase)}
            aria-describedby={describe("frase")}
            className={CAMPO}
          />
          {error("frase")}
        </div>
        <div>
          <label htmlFor="p-ofrezco">{f.ofrezco}</label>
          <textarea
            id="p-ofrezco"
            data-campo="ofrezco"
            rows={3}
            value={borrador.ofrezco}
            onChange={(e) => cambiar("ofrezco", e.target.value)}
            aria-invalid={Boolean(errores.ofrezco)}
            aria-describedby={describe("ofrezco")}
            className={CAMPO}
          />
          {error("ofrezco")}
        </div>
        <fieldset className="grid gap-2">
          <legend className="font-medium">{f.roles}</legend>
          <p className="text-sm text-muted">{f.rolesAyuda}</p>
          <div className="grid gap-1 sm:grid-cols-2">
            {ROLES.map((r) => (
              <label key={r.clave} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={borrador.roles.includes(r.clave)}
                  onChange={(e) => alternarRol(r.clave, e.target.checked)}
                  className={FOCO}
                />
                {textoDeRol(r, idioma).nombre}
              </label>
            ))}
          </div>
        </fieldset>
        {borrador.roles.includes("otro") && (
          <div>
            <label htmlFor="p-rol-otro">{f.rolOtro}</label>
            <input
              id="p-rol-otro"
              data-campo="rolOtro"
              value={borrador.rolOtro}
              onChange={(e) => cambiar("rolOtro", e.target.value)}
              aria-invalid={Boolean(errores.rolOtro)}
              aria-describedby={describe("rolOtro")}
              className={CAMPO}
            />
            {error("rolOtro")}
          </div>
        )}
        <div>
          <label htmlFor="p-decision">{f.decision}</label>
          <textarea
            id="p-decision"
            data-campo="decision"
            rows={3}
            value={borrador.decision}
            onChange={(e) => cambiar("decision", e.target.value)}
            aria-invalid={Boolean(errores.decision)}
            aria-describedby={describe("decision")}
            className={CAMPO}
          />
          {error("decision")}
        </div>
        <div>
          <label htmlFor="p-no-negociables">{f.noNegociables}</label>
          <textarea
            id="p-no-negociables"
            data-campo="noNegociables"
            rows={3}
            value={borrador.noNegociables}
            onChange={(e) => cambiar("noNegociables", e.target.value)}
            aria-invalid={Boolean(errores.noNegociables)}
            aria-describedby={describe("noNegociables")}
            className={CAMPO}
          />
          {error("noNegociables")}
        </div>
        <div className="flex gap-2">
          <button type="submit" className={BOTON_PRINCIPAL}>{f.guardar}</button>
          <button type="button" className={BOTON} onClick={cancelar}>{f.cancelar}</button>
        </div>
      </form>
    );
  }

  const d = t.datos;
  const cita = (frase: string) => (idioma === "en" ? <>“{propio(frase)}”</> : `«${frase}»`);

  return (
    <div className="grid gap-6">
      {aviso}
      {sesion?.email && (
        <p className="text-sm text-muted">
          {t.tuCuenta}<span className="font-medium text-ink">{sesion.email}</span>
        </p>
      )}
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          Error: {t.errorAlmacenamiento}
        </p>
      )}
      <p role="status" className="text-sm font-medium">{guardado ? t.guardado : ""}</p>

      <section aria-labelledby="encabezado" className={`${TARJETA} sm:grid-cols-[auto_1fr_auto] sm:items-center`}>
        <span
          aria-hidden="true"
          className="grid h-16 w-16 place-items-center rounded-full border-2 border-deep bg-green-soft text-xl font-semibold text-deep"
        >
          {iniciales(perfil.nombre) || "?"}
        </span>
        <div>
          <h2 id="encabezado" className="text-2xl font-semibold">
            {perfil.nombre ? propio(perfil.nombre) : sinDato}
          </h2>
          <p>
            <span className="text-muted">{d.deDonde}</span>
            {perfil.lugar ? propio(perfil.lugar) : sinDato}
          </p>
          <p>
            <span className="text-muted">{d.sobreVos}</span>
            {perfil.frase ? cita(perfil.frase) : sinDato}
          </p>
        </div>
        <button ref={editarRef} type="button" className={BOTON_PRINCIPAL} onClick={empezar}>
          {vacio ? t.completar : t.editar}
        </button>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section aria-labelledby="t-hacer" className={TARJETA}>
          <h2 id="t-hacer" className="text-xl font-semibold">{d.ofrezcoTitulo}</h2>
          <p>{perfil.ofrezco ? propio(perfil.ofrezco) : sinDato}</p>
          {nombresRoles.length > 0 ? (
            <ul aria-label={d.rolesAria} className="flex flex-wrap gap-2">
              {nombresRoles.map((n, i) => (
                <li key={perfil.roles[i]} className={ETIQUETA}>{n}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{d.rolesSinDato}</p>
          )}
        </section>

        <section aria-labelledby="t-comunidades" className={TARJETA}>
          <h2 id="t-comunidades" className="text-xl font-semibold">{t.comunidades.titulo}</h2>
          {comunidades === null ? (
            <p>{sinDato}</p>
          ) : comunidades.length > 0 ? (
            <ul className="grid gap-2">
              {comunidades.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-2">
                  <Link className="underline" href={c.href} translate="no">{c.nombre}</Link>
                  <span className={ETIQUETA}>
                    <span aria-hidden="true">{c.estado === "miembro" ? "✓ " : "… "}</span>
                    {c.estado === "miembro" ? t.comunidades.miembro : t.comunidades.pedido}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">
              {t.comunidades.ninguna} <Link className="underline" href="/tribus">{t.comunidades.mirar}</Link>.
            </p>
          )}
        </section>

        <section aria-labelledby="t-resumen" className={TARJETA}>
          <h2 id="t-resumen" className="text-xl font-semibold">{t.resumen.titulo}</h2>
          <p>
            {t.resumen.pactosActivos}<b>{resumen && resumen.pactos !== null ? resumen.pactos : sinDato}</b>{" "}
            <Link className="underline" href="/pactos">{t.resumen.irPactos}</Link>
          </p>
          <p>
            {t.resumen.semillasTotales}<b>{resumen && resumen.semillas !== null ? resumen.semillas : sinDato}</b>{" "}
            <Link className="underline" href="/semillas">{t.resumen.irSemillas}</Link>
          </p>
        </section>

        <section aria-labelledby="t-decidis" className={TARJETA}>
          <h2 id="t-decidis" className="text-xl font-semibold">{d.decidisTitulo}</h2>
          <p>
            <span className="text-muted">{d.comoDecidir}</span>
            {perfil.decision ? propio(perfil.decision) : sinDato}
          </p>
          <p>
            <span className="text-muted">{d.noNegocias}</span>
            {perfil.noNegociables ? propio(perfil.noNegociables) : sinDato}
          </p>
        </section>
      </div>
    </div>
  );
}
