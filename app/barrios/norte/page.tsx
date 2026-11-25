import { redirect } from "next/navigation";
import { urlExplorar } from "@/lib/explorar/destino";

// Barrio Norte ahora es una sección de Explorar (spec explorar-unificado): la dirección vieja sigue andando.
export default async function BarrioNortePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  redirect(urlExplorar("barrio", await searchParams));
}
