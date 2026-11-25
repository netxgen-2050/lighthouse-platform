import type { Metadata } from "next";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { MiTierraCliente } from "./mi-tierra-cliente";

// Mi tierra (spec mi-tierra): el portafolio simulado de la persona. Es pública: sin sesión muestra solo un aviso para entrar.
// Las reservas se leen en el navegador, por `lib/lotes/reservas.ts`; el servidor no recibe ni guarda nada.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("miTierra", await idiomaDelPedido()).titulo };
}

export default async function MiTierraPage() {
  const t = textos("miTierra", await idiomaDelPedido());
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-6 py-10 sm:px-10">
      <header className="grid gap-2">
        <h1 className="text-4xl font-bold">{t.titulo}</h1>
        <p className="max-w-3xl text-lg text-ink">{t.bajada}</p>
      </header>
      <MiTierraCliente />
    </div>
  );
}
