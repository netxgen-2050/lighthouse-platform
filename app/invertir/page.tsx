import type { Metadata } from "next";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";
import { InvertirCliente } from "./invertir-cliente";

// Invertir (spec invertir): el barrio en financiamiento, su curva de devolución y su libro. Es pública, pero sin sesión
// muestra solo un aviso para entrar: los números se calculan en el navegador, solo con sesión (el HTML no los lleva).
// Ningún cobro, oferta ni botón de invertir: todo es una simulación de ejemplo.
export async function generateMetadata(): Promise<Metadata> {
  return { title: textos("invertir", await idiomaDelPedido()).titulo };
}

export default async function InvertirPage() {
  const t = textos("invertir", await idiomaDelPedido());
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-6 py-10 sm:px-10">
      <header className="grid gap-2">
        <h1 className="text-4xl font-bold">{t.titulo}</h1>
        <p className="max-w-3xl text-lg text-ink">{t.bajada}</p>
      </header>
      <InvertirCliente />
    </div>
  );
}
