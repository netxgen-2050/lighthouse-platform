import { notFound } from "next/navigation";
import { exigirSuperAdmin } from "@/lib/sesion/pagina";

export const dynamic = "force-dynamic";

// Toda dirección bajo /admin que no existe: quien no es super admin recibe 403 (lo da el layout y esta página);
// el super admin recibe 404.
export default async function AdminRutaInexistente() {
  await exigirSuperAdmin();
  notFound();
}
