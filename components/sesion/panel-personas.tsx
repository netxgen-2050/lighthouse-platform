"use client";

import { useSesion } from "./contexto";

const ROL: Record<string, string> = { superadmin: "Super admin", "admin-tribu": "Admin de Valle Solar", persona: "Persona" };
const PERFIL: Record<string, string> = { usuario: "Usuario", inversor: "Inversor", comunidad: "Comunidad" };

/** Lista de acceso en solo lectura: email, rol y perfil de prueba de cada persona. Editarla llega con Neon. */
export function PanelPersonas() {
  const { sesion } = useSesion();
  const personas = sesion?.personas;
  if (sesion?.rol !== "superadmin" || !personas) return null;
  return (
    <section aria-labelledby="t-personas" className="mb-4 rounded-xl border border-faint bg-surface p-4">
      <h2 id="t-personas" className="mb-1 text-lg font-semibold">
        Personas y roles
      </h2>
      <p className="mb-3 text-sm text-muted">Editar roles llega con la base de datos (Neon).</p>
      {personas.length === 0 ? (
        <p className="text-sm">sin dato</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Personas con acceso al prototipo</caption>
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="py-1 pr-4 font-medium">
                  Email
                </th>
                <th scope="col" className="py-1 pr-4 font-medium">
                  Rol
                </th>
                <th scope="col" className="py-1 font-medium">
                  Perfil de prueba
                </th>
              </tr>
            </thead>
            <tbody>
              {personas.map((p) => (
                <tr key={p.email} className="border-b border-line last:border-0">
                  <th scope="row" className="py-1 pr-4 font-normal break-all">
                    {p.email}
                  </th>
                  <td className="py-1 pr-4">{ROL[p.rol] ?? p.rol}</td>
                  <td className="py-1">{PERFIL[p.perfil] ?? p.perfil}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
