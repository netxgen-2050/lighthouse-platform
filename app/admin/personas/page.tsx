import { PanelPersonas } from "@/components/sesion/panel-personas";
import { exigirSuperAdmin } from "@/lib/sesion/pagina";

export const dynamic = "force-dynamic";

export default async function AdminPersonasPage() {
  await exigirSuperAdmin();
  return (
    <>
      <h1 className="text-3xl font-semibold">Personas y roles</h1>
      <PanelPersonas />
    </>
  );
}
