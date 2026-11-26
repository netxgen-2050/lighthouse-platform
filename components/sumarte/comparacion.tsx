import Link from "next/link";
import { TextoBilingue } from "@/components/texto-bilingue";
import type { Idioma } from "@/lib/idioma/tipos";
import { GLOSARIO } from "@/lib/idioma/glosario";
import { FILAS } from "@/lib/sumarte/datos";
import { columnaDeLaTabla, type PlanVista } from "./planes";

type TextosComparativa = { titulo: string; funcion: string; incluido: string; noIncluido: string; verSellos: string };

/**
 * Tabla comparativa (≥ 768 px, ux-sumarte design §3): encabezado fijo bajo la barra y la columna del plan elegido resaltada
 * con fondo y negrita. En el celular no se muestra: ahí `ListaDelPlan` dice lo mismo, dentro del plan elegido.
 */
export function TablaComparacion({ plan, idioma, t }: { plan: PlanVista | null; idioma: Idioma; t: TextosComparativa }) {
  const elegida = columnaDeLaTabla(plan);
  const celda = (i: number) => (i === elegida ? "bg-surface-2" : "");
  const encabezado = (i: number) => `p-2 ${celda(i)} ${i === elegida ? "font-bold" : "font-medium"}`;
  return (
    <section aria-labelledby="comparativa" className="hidden min-w-0 rounded-xl border border-line bg-surface p-4 md:block">
      <h2 id="comparativa" className="mb-2 text-xl font-semibold">{t.titulo}</h2>
      {/* relative: los textos sr-only de la tabla (position: absolute) no ensanchan la página. */}
      <div className="relative">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="sticky top-[var(--alto-fijo,0px)] z-10 bg-surface">
            <tr className="border-b border-line">
              <td className="p-2"><span className="sr-only">{t.funcion}</span></td>
              <th scope="col" className={encabezado(0)}>{GLOSARIO.explorador[idioma]}</th>
              <th scope="col" className={encabezado(1)}>{GLOSARIO.miembro[idioma]}</th>
              <th scope="col" className={encabezado(2)}>{GLOSARIO.paseFundador[idioma]}</th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map((f) => (
              <tr key={f.texto.es} className="border-b border-line">
                <th scope="row" className="p-2 font-normal">
                  <TextoBilingue valor={f.texto} sinNota />
                </th>
                {f.incluye.map((si, i) => (
                  <td key={i} className={`p-2 ${celda(i)}`}>
                    <span aria-hidden="true">{si ? "✓" : "—"}</span>
                    <span className="sr-only">{si ? t.incluido : t.noIncluido}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm">
        <Link className="underline" href="/pasaporte">{t.verSellos}</Link>
      </p>
    </section>
  );
}

/**
 * Lo mismo que la tabla, para el celular (< 768 px): una lista del plan elegido con ✓ / — y el texto al lado, nunca solo el
 * símbolo. Comunidad no tiene columna en la tabla: ya lista lo que incluye en su propia tarjeta.
 */
export function ListaDelPlan({
  plan,
  titulo,
  t,
}: {
  plan: PlanVista;
  titulo: string;
  t: TextosComparativa;
}) {
  const columna = columnaDeLaTabla(plan);
  if (columna === null) return null;
  return (
    <section aria-labelledby="que-incluye" className="grid gap-2 border-t border-line pt-3 md:hidden">
      <h3 id="que-incluye" className="font-semibold">{titulo}</h3>
      <ul className="grid gap-1.5 text-sm">
        {FILAS.map((f) => {
          const si = f.incluye[columna];
          return (
            <li key={f.texto.es} className="flex gap-2">
              <span aria-hidden="true" className="w-4 shrink-0 text-center">{si ? "✓" : "—"}</span>
              <span>
                <TextoBilingue valor={f.texto} sinNota />
                {" · "}
                <span className={si ? "font-medium" : "text-muted"}>{si ? t.incluido : t.noIncluido}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-sm">
        <Link className="underline" href="/pasaporte">{t.verSellos}</Link>
      </p>
    </section>
  );
}
