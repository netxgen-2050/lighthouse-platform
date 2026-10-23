import Link from "next/link";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";

export default async function TerritorioNoEncontrado() {
  const idioma = await idiomaDelPedido();
  const t = textos("territorio", idioma).noEncontrado;
  return (
    // El lang propio evita que la página quede marcada como español si la puerta la envuelve como "sin traducir".
    <div lang={idioma} data-no-encontrada className="mx-auto max-w-3xl p-6 sm:p-10">
      <h1 className="text-3xl font-semibold">{t.titulo}</h1>
      <p className="mt-2">
        <Link className="underline" href="/">{t.volver}</Link>
      </p>
    </div>
  );
}
