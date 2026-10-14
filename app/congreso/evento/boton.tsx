import type { ReactNode } from "react";

export type VarianteBoton = "corona" | "linea" | "linea-clara";

type Props = {
  variante?: VarianteBoton;
  /** Con destino se dibuja un enlace; sin destino, un botón. */
  href?: string;
  onClick?: () => void;
  chico?: boolean;
  children: ReactNode;
};

export function Boton({ variante = "corona", href, onClick, chico = false, children }: Props) {
  const clase = `ev-boton ev-boton-${variante}${chico ? " ev-boton-chico" : ""}`;
  if (href !== undefined) {
    return (
      <a className={clase} href={href}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={clase} onClick={onClick}>
      {children}
    </button>
  );
}
