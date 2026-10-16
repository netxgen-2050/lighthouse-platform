import Link from "next/link";
import { idiomaDelPedido } from "@/lib/idioma/servidor";
import { textos } from "@/lib/idioma/textos";

// Con dynamicParams = false, Next responde los ids desconocidos con esta página global.
export default async function NoEncontrada() {
  const idioma = await idiomaDelPedido();
  const t = textos("marco", idioma);
  return (
    // El lang propio evita que la página quede marcada como español si la puerta la envuelve como "sin traducir".
    <div lang={idioma} data-no-encontrada className="mx-auto max-w-3xl p-6 sm:p-10">
      <h1 className="text-3xl font-semibold">{t.noEncontrada.titulo}</h1>
      <p className="mt-2">
        <Link className="underline" href="/tribus">{t.noEncontrada.volver}</Link>
      </p>
    </div>
  );
}
