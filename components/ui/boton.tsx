import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type VarianteBoton = "principal" | "secundario" | "texto";
export type TamanoBoton = "m" | "s";

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-[var(--dur)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";

const VARIANTES: Record<VarianteBoton, string> = {
  principal: "bg-deep text-on-deep hover:bg-deep-2",
  secundario: "border border-line bg-surface text-ink hover:bg-surface-2",
  texto: "bg-transparent text-ink hover:underline",
};

// `m` mide 44 px; `s` mide 36 px y solo en compu (en celular vuelve a 44 px para el dedo).
const TAMANOS: Record<TamanoBoton, string> = {
  m: "min-h-11 rounded-[var(--radius-m)] px-5 py-2",
  s: "min-h-11 rounded-[var(--radius-s)] px-4 py-1.5 text-sm sm:min-h-9",
};

export function claseBoton(variante: VarianteBoton = "principal", tamano: TamanoBoton = "m", extra = ""): string {
  return `${BASE} ${VARIANTES[variante]} ${TAMANOS[tamano]} ${extra}`.trim();
}

type Comun = { variante?: VarianteBoton; tamano?: TamanoBoton; children: ReactNode; className?: string };

/** Botón de la app (ux-base, design §5). Con `href` se dibuja como enlace; sin `href`, como `button`. */
export function Boton(props: Comun & ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href">)): ReactNode;
export function Boton(props: Comun & ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)): ReactNode;
export function Boton(props: Comun & { href?: string } & Record<string, unknown>): ReactNode {
  const { variante = "principal", tamano = "m", className = "", children, href, ...resto } = props;
  const clase = claseBoton(variante, tamano, className);
  if (href !== undefined) {
    return (
      <Link href={href} className={clase} {...(resto as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }
  const { type = "button", ...botonResto } = resto as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={clase} {...botonResto}>
      {children}
    </button>
  );
}
