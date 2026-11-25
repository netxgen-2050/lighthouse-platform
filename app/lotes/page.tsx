import { redirect } from "next/navigation";
import { urlExplorar } from "@/lib/explorar/destino";

// La lista de lotes ahora es una sección de Explorar (spec explorar-unificado): la dirección vieja sigue andando.
// Las fichas (`/lotes/[id]`, `/lotes/hibrido`) quedan en su dirección.
export default async function LotesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  redirect(urlExplorar("lotes", await searchParams));
}
