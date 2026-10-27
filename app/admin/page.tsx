import { exigirSuperAdmin } from "@/lib/sesion/pagina";
import { BandejaPedidos } from "./bandeja-pedidos";
import { PostulacionesComunidades } from "./postulaciones-comunidades";

export const dynamic = "force-dynamic";

export default async function AdminPendientesPage() {
  await exigirSuperAdmin();
  return (
    <>
      <h1 className="text-3xl font-semibold">Pendientes</h1>
      <p className="mt-2 mb-4 max-w-2xl text-muted">
        Postulaciones de comunidades y pedidos de contacto guardados en este navegador (simulado). Todavía no se pueden
        responder desde acá.
      </p>
      <PostulacionesComunidades />
      <BandejaPedidos />
    </>
  );
}
