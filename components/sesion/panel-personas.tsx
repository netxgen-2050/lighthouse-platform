"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { PersonaGestionada } from "@/lib/sesion/gestion";
import { useSesion } from "./contexto";

const ROL: Record<string, string> = { superadmin: "Super admin", "admin-tribu": "Admin de tribu", persona: "Persona" };
const PERFIL: Record<string, string> = { usuario: "Usuario", inversor: "Inversor", comunidad: "Comunidad" };

const CAMPO =
  "rounded-lg border border-faint bg-surface px-2 py-1 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep disabled:opacity-60";
const BOTON =
  "w-fit rounded-lg bg-deep px-4 py-1.5 font-medium text-on-deep hover:bg-deep-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep disabled:opacity-60";

type Cambios = Partial<Pick<PersonaGestionada, "rol" | "perfil" | "tribuAdmin" | "acceso">>;

/** Personas y roles: el super admin cambia rol, perfil de prueba, tribu y acceso, y suma personas por email. Cada cambio queda auditado. */
export function PanelPersonas() {
  const { sesion, cabeceras } = useSesion();
  const [personas, setPersonas] = useState<PersonaGestionada[] | null>(null);
  const [estado, setEstado] = useState<"cargando" | "ok" | "error">("cargando");
  const [aviso, setAviso] = useState<{ texto: string; error: boolean } | null>(null);
  const [email, setEmail] = useState("");
  const [rolNuevo, setRolNuevo] = useState("persona");
  const [ocupado, setOcupado] = useState(false);
  const esSuper = sesion?.rol === "superadmin";

  const pedir = useCallback(
    async (metodo: "GET" | "POST" | "PATCH", cuerpo?: unknown) => {
      const h = await cabeceras();
      const res = await fetch("/api/personas", {
        method: metodo,
        headers: { ...h, ...(cuerpo ? { "Content-Type": "application/json" } : {}) },
        body: cuerpo ? JSON.stringify(cuerpo) : undefined,
        cache: "no-store",
      });
      const datos = (await res.json().catch(() => ({}))) as { personas?: PersonaGestionada[]; persona?: PersonaGestionada; error?: string };
      return { ok: res.ok, datos };
    },
    [cabeceras],
  );

  useEffect(() => {
    if (!esSuper) return;
    let vigente = true;
    pedir("GET")
      .then(({ ok, datos }) => {
        if (!vigente) return;
        if (ok && datos.personas) {
          setPersonas(datos.personas);
          setEstado("ok");
        } else setEstado("error");
      })
      .catch(() => vigente && setEstado("error"));
    return () => {
      vigente = false;
    };
  }, [esSuper, pedir]);

  if (!esSuper) return null;

  async function cambiar(p: PersonaGestionada, cambios: Cambios) {
    setOcupado(true);
    setAviso(null);
    try {
      const { ok, datos } = await pedir("PATCH", { id: p.id, ...cambios });
      if (ok && datos.persona) {
        const nueva = datos.persona;
        setPersonas((lista) => lista?.map((x) => (x.id === nueva.id ? nueva : x)) ?? null);
        setAviso({ texto: `Guardado: ${nueva.email}.`, error: false });
      } else setAviso({ texto: datos.error ?? "No se pudo guardar.", error: true });
    } catch {
      setAviso({ texto: "No se pudo guardar.", error: true });
    } finally {
      setOcupado(false);
    }
  }

  async function sumar(e: FormEvent) {
    e.preventDefault();
    setOcupado(true);
    setAviso(null);
    try {
      const { ok, datos } = await pedir("POST", { email, rol: rolNuevo });
      if (ok && datos.persona) {
        const nueva = datos.persona;
        setPersonas((lista) => [...(lista ?? []), nueva].sort((a, b) => a.email.localeCompare(b.email)));
        setEmail("");
        setAviso({ texto: `Sumada: ${nueva.email}.`, error: false });
      } else setAviso({ texto: datos.error ?? "No se pudo sumar.", error: true });
    } catch {
      setAviso({ texto: "No se pudo sumar.", error: true });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section aria-labelledby="t-personas" className="mb-4 rounded-xl border border-faint bg-surface p-4">
      <h2 id="t-personas" className="mb-1 text-lg font-semibold">
        Personas y roles
      </h2>
      <p className="mb-3 text-sm text-muted">
        Cambiá el rol, el perfil de prueba, la tribu o el acceso. Cada cambio queda registrado con quién lo hizo. Quien no está en la lista
        entra como persona común.
      </p>
      <p role="status" className={`mb-3 min-h-5 text-sm ${aviso?.error ? "font-medium text-warn-ink" : ""}`}>
        {aviso ? `${aviso.error ? "Error: " : ""}${aviso.texto}` : ""}
      </p>

      {estado === "cargando" && <p className="text-sm">Cargando…</p>}
      {estado === "error" && <p className="text-sm">No pudimos leer la lista de personas. Probá recargar la página.</p>}
      {estado === "ok" && personas && (
        <>
          {personas.length === 0 ? (
            <p className="text-sm">sin dato</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Personas con acceso a la plataforma: rol, perfil de prueba, tribu que administra y acceso</caption>
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="py-1 pr-4 font-medium">Email</th>
                    <th scope="col" className="py-1 pr-4 font-medium">Rol</th>
                    <th scope="col" className="py-1 pr-4 font-medium">Perfil de prueba</th>
                    <th scope="col" className="py-1 pr-4 font-medium">Tribu que administra</th>
                    <th scope="col" className="py-1 font-medium">Acceso</th>
                  </tr>
                </thead>
                <tbody>
                  {personas.map((p) => (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <th scope="row" className="py-1 pr-4 font-normal break-all">{p.email}</th>
                      <td className="py-1 pr-4">
                        <select
                          aria-label={`Rol de ${p.email}`}
                          className={CAMPO}
                          disabled={ocupado}
                          value={p.rol}
                          onChange={(e) => void cambiar(p, { rol: e.target.value as PersonaGestionada["rol"] })}
                        >
                          {Object.entries(ROL).map(([v, t]) => (
                            <option key={v} value={v}>{t}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1 pr-4">
                        <select
                          aria-label={`Perfil de prueba de ${p.email}`}
                          className={CAMPO}
                          disabled={ocupado}
                          value={p.perfil}
                          onChange={(e) => void cambiar(p, { perfil: e.target.value as PersonaGestionada["perfil"] })}
                        >
                          {Object.entries(PERFIL).map(([v, t]) => (
                            <option key={v} value={v}>{t}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-1 pr-4">
                        <select
                          aria-label={`Tribu que administra ${p.email}`}
                          className={CAMPO}
                          disabled={ocupado || p.rol !== "admin-tribu"}
                          value={p.tribuAdmin ?? ""}
                          onChange={(e) => void cambiar(p, { tribuAdmin: e.target.value === "valle" ? "valle" : null })}
                        >
                          <option value="">Ninguna</option>
                          <option value="valle">Valle Solar</option>
                        </select>
                      </td>
                      <td className="py-1">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            disabled={ocupado}
                            checked={p.acceso}
                            onChange={(e) => void cambiar(p, { acceso: e.target.checked })}
                          />
                          <span>{p.acceso ? "Con acceso" : "Sin acceso"}</span>
                          <span className="sr-only"> de {p.email}</span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <form onSubmit={sumar} className="mt-4 flex flex-wrap items-end gap-3" aria-label="Sumar una persona">
            <div>
              <label htmlFor="persona-email" className="block text-sm font-medium">Email de la persona</label>
              <input
                id="persona-email"
                type="email"
                required
                autoComplete="off"
                className={`${CAMPO} mt-1 w-64`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="persona-rol" className="block text-sm font-medium">Rol</label>
              <select id="persona-rol" className={`${CAMPO} mt-1`} value={rolNuevo} onChange={(e) => setRolNuevo(e.target.value)}>
                {Object.entries(ROL).map(([v, t]) => (
                  <option key={v} value={v}>{t}</option>
                ))}
              </select>
            </div>
            <button type="submit" className={BOTON} disabled={ocupado}>
              Sumar persona
            </button>
          </form>
        </>
      )}
    </section>
  );
}
