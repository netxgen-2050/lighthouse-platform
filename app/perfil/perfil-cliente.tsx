"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CLAVES } from "@/lib/demo/claves";
import { COMUNIDAD_LIGHTHOUSE, leer as leerMembresia, type Membresias } from "@/lib/membresia/estado";
import { ROLES, buscarRol } from "@/lib/pactos/datos";
import { leer as leerPactos, pactosAceptados } from "@/lib/pactos/estado";
import {
  PERFIL_VACIO,
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

type Resumen = { pactos: number | null; semillas: number | null };
type Comunidad = { id: string; nombre: string; href: string; estado: "miembro" | "pedido" };

function SinDato() {
  return <span className="text-muted">sin dato</span>;
}

function resumir(pactosCrudo: string | null): Resumen {
  const estado = leerPactos(pactosCrudo);
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
  const [listo, setListo] = useState(false);
  const [falloAlmacen, setFalloAlmacen] = useState(false);
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VACIO);
  const [comunidades, setComunidades] = useState<Comunidad[]>([]);
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
    setBorrador(perfil);
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
    const errs = validar(borrador);
    setErrores(errs);
    const primero = Object.keys(errs)[0];
    if (primero) {
      // El foco al primer campo con error (descrito por su mensaje) hace que el lector lo anuncie.
      const campo = formRef.current?.querySelector<HTMLElement>(`[data-campo="${primero}"]`);
      campo?.focus();
      return;
    }
    const limpio = normalizar(borrador);
    try {
      window.localStorage.setItem(CLAVES.perfilDatos, JSON.stringify(limpio));
      setFalloAlmacen(false);
    } catch {
      setFalloAlmacen(true);
    }
    setPerfil(limpio);
    setEditando(false);
    setGuardado(true);
    foco.current = "editar";
  }

  if (!listo) return <p role="status" className="text-muted">Cargando…</p>;

  const vacio = perfilVacio(perfil);
  const nombresRoles = perfil.roles.map((c) => (c === "otro" && perfil.rolOtro ? `Otro: ${perfil.rolOtro}` : (buscarRol(c)?.nombre ?? c)));
  const aviso = (
    <p className="rounded-lg border border-dashed border-faint bg-warn-bg px-3 py-2 text-sm text-warn-ink">
      Tu perfil queda solo en este navegador. Nadie más lo ve.
    </p>
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
    return (
      <form ref={formRef} onSubmit={guardar} noValidate aria-labelledby="editar-perfil" className={`${TARJETA} max-w-3xl`}>
        <h2 id="editar-perfil" className="text-xl font-semibold">Editar mi perfil</h2>
        <div>
          <label htmlFor="p-nombre">Nombre</label>
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
          <label htmlFor="p-lugar">De dónde sos</label>
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
          <label htmlFor="p-frase">Una frase sobre vos</label>
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
          <label htmlFor="p-ofrezco">Qué sabés hacer y qué ofrecés</label>
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
          <legend className="font-medium">Tus roles</legend>
          <p className="text-sm text-muted">Los mismos roles que ves en Pactos.</p>
          <div className="grid gap-1 sm:grid-cols-2">
            {ROLES.map((r) => (
              <label key={r.clave} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={borrador.roles.includes(r.clave)}
                  onChange={(e) => alternarRol(r.clave, e.target.checked)}
                  className={FOCO}
                />
                {r.nombre}
              </label>
            ))}
          </div>
        </fieldset>
        {borrador.roles.includes("otro") && (
          <div>
            <label htmlFor="p-rol-otro">Qué otro rol tenés</label>
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
          <label htmlFor="p-decision">Cómo te gusta decidir en comunidad</label>
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
          <label htmlFor="p-no-negociables">Qué no negociás</label>
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
          <button type="submit" className={BOTON_PRINCIPAL}>Guardar</button>
          <button type="button" className={BOTON} onClick={cancelar}>Cancelar</button>
        </div>
      </form>
    );
  }

  return (
    <div className="grid gap-6">
      {aviso}
      {falloAlmacen && (
        <p role="alert" className="text-sm font-medium text-danger">
          Error: tu navegador no permite guardar datos en este sitio, así que tu perfil se pierde al recargar.
        </p>
      )}
      <p role="status" className="text-sm font-medium">{guardado ? "Listo: guardamos tu perfil." : ""}</p>

      <section aria-labelledby="encabezado" className={`${TARJETA} sm:grid-cols-[auto_1fr_auto] sm:items-center`}>
        <span
          aria-hidden="true"
          className="grid h-16 w-16 place-items-center rounded-full border-2 border-deep bg-green-soft text-xl font-semibold text-deep"
        >
          {iniciales(perfil.nombre) || "?"}
        </span>
        <div>
          <h2 id="encabezado" className="text-2xl font-semibold">
            {perfil.nombre || <SinDato />}
          </h2>
          <p>
            <span className="text-muted">De dónde sos: </span>
            {perfil.lugar || <SinDato />}
          </p>
          <p>
            <span className="text-muted">Sobre vos: </span>
            {perfil.frase ? `«${perfil.frase}»` : <SinDato />}
          </p>
        </div>
        <button ref={editarRef} type="button" className={BOTON_PRINCIPAL} onClick={empezar}>
          {vacio ? "Completar mi perfil" : "Editar mi perfil"}
        </button>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section aria-labelledby="t-hacer" className={TARJETA}>
          <h2 id="t-hacer" className="text-xl font-semibold">Qué sabés hacer y qué ofrecés</h2>
          <p>{perfil.ofrezco || <SinDato />}</p>
          {nombresRoles.length > 0 ? (
            <ul aria-label="Tus roles" className="flex flex-wrap gap-2">
              {nombresRoles.map((n) => (
                <li key={n} className={ETIQUETA}>{n}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">Roles: sin dato</p>
          )}
        </section>

        <section aria-labelledby="t-comunidades" className={TARJETA}>
          <h2 id="t-comunidades" className="text-xl font-semibold">Tus comunidades</h2>
          {comunidades.length > 0 ? (
            <ul className="grid gap-2">
              {comunidades.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-2">
                  <Link className="underline" href={c.href}>{c.nombre}</Link>
                  <span className={ETIQUETA}>
                    <span aria-hidden="true">{c.estado === "miembro" ? "✓ " : "… "}</span>
                    {c.estado === "miembro" ? "Miembro" : "Pedido enviado"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">
              Todavía no pertenecés a ninguna comunidad. <Link className="underline" href="/tribus">Mirá las tribus</Link>.
            </p>
          )}
        </section>

        <section aria-labelledby="t-resumen" className={TARJETA}>
          <h2 id="t-resumen" className="text-xl font-semibold">Resumen</h2>
          <p>
            Pactos activos: <b>{resumen && resumen.pactos !== null ? resumen.pactos : <SinDato />}</b>{" "}
            <Link className="underline" href="/pactos">Ir a Pactos</Link>
          </p>
          <p>
            Semillas totales: <b>{resumen && resumen.semillas !== null ? resumen.semillas : <SinDato />}</b>{" "}
            <Link className="underline" href="/semillas">Ir a Semillas</Link>
          </p>
        </section>

        <section aria-labelledby="t-decidis" className={TARJETA}>
          <h2 id="t-decidis" className="text-xl font-semibold">Cómo decidís y qué no negociás</h2>
          <p>
            <span className="text-muted">Cómo te gusta decidir: </span>
            {perfil.decision || <SinDato />}
          </p>
          <p>
            <span className="text-muted">Qué no negociás: </span>
            {perfil.noNegociables || <SinDato />}
          </p>
        </section>
      </div>
    </div>
  );
}
