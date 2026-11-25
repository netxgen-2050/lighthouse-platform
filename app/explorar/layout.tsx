import type { ReactNode } from "react";
import { HeroeValle } from "@/components/explorar/heroe-valle";
import { PestanasExplorar } from "@/components/explorar/pestanas-explorar";
import { SelloPrototipo } from "@/components/ui/sello-prototipo";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";

// Explorar (spec explorar-paginas): el héroe de Barrio Norte y las pestañas son comunes a las tres páginas (Territorio,
// Barrio Norte y Lotes). El layout no se vuelve a montar al cambiar de pestaña. El h1 es el del héroe; cada página abre con su h2.
export default async function ExplorarLayout({ children }: { children: ReactNode }) {
  const idioma = await idiomaDelPedido();
  const t = textos("explorar", idioma);

  return (
    <div className="min-h-full">
      <HeroeValle leyenda={textos("portada", idioma).leyendaImagen}>
        <SelloPrototipo variante="venta" />
        <div className="grid gap-3">
          <p className="font-mono text-sm uppercase text-ink">{t.sobretitulo}</p>
          <h1 className="text-4xl font-bold sm:text-5xl">{t.titulo}</h1>
          <p className="max-w-2xl text-lg text-ink">{t.bajada}</p>
        </div>
      </HeroeValle>

      <PestanasExplorar />

      <div className="mx-auto grid max-w-5xl gap-14 px-6 py-10 sm:px-10">{children}</div>
    </div>
  );
}
