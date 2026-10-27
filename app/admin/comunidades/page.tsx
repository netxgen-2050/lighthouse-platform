import Link from "next/link";
import { exigirSuperAdmin } from "@/lib/sesion/pagina";
import { listarTribus } from "@/lib/tribus/datos";
import { textoDeEstado } from "@/lib/tribus/tipos";

export const dynamic = "force-dynamic";

export default async function AdminComunidadesPage() {
  await exigirSuperAdmin();
  const tribus = listarTribus();
  return (
    <>
      <h1 className="text-3xl font-semibold">Comunidades</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">Tribus del directorio (datos de ejemplo). Solo lectura.</p>
      <div className="overflow-x-auto rounded-xl border border-faint bg-surface p-4">
        <table className="w-full text-sm">
          <caption className="sr-only">Comunidades del directorio</caption>
          <thead>
            <tr className="text-left">
              <th scope="col" className="py-1.5 pr-3">Comunidad</th>
              <th scope="col" className="py-1.5 pr-3">Barrio</th>
              <th scope="col" className="py-1.5 pr-3">Estado</th>
              <th scope="col" className="py-1.5 pr-3 text-right">Hogares</th>
              <th scope="col" className="py-1.5 pr-3 text-right">Roles</th>
              <th scope="col" className="py-1.5">Forma jurídica</th>
            </tr>
          </thead>
          <tbody>
            {tribus.map((t) => (
              <tr key={t.id} className="border-t border-line">
                <th scope="row" className="py-1.5 pr-3 text-left font-normal">
                  <Link className="underline" href={`/tribus/${t.id}`}>
                    {t.nombre}
                  </Link>
                </th>
                <td className="py-1.5 pr-3">{t.barrio}</td>
                <td className="py-1.5 pr-3">{textoDeEstado(t.estado)}</td>
                <td className="py-1.5 pr-3 text-right">{t.hogares}</td>
                <td className="py-1.5 pr-3 text-right">
                  {t.roles.cubiertos}/{t.roles.necesarios}
                </td>
                <td className="py-1.5">{t.formaJuridica}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
