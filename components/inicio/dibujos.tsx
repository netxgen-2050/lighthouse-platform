import type { ReactNode } from "react";

// Dibujos de línea de Inicio (ux-inicio, design §3 y §4): trazo de 1,5 px con `currentColor`, sin relleno, decorativos (`aria-hidden`).
// Mismo estilo que los íconos del mapa de Participa. Todos caben en una grilla de 48 x 48.

function Dibujo({ tamano, children }: { tamano: number; children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 48 48"
      width={tamano}
      height={tamano}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

type Props = { tamano?: number };

/** Agua: una gota con curvas de nivel. */
export function DibujoAgua({ tamano = 40 }: Props) {
  return (
    <Dibujo tamano={tamano}>
      <path d="M24 5 C24 5 11 19 11 28 a13 13 0 0 0 26 0 C37 19 24 5 24 5 Z" />
      <path d="M15 29 q4.5 -3 9 0 t9 0" />
      <path d="M17 35 q3.5 -2.5 7 0 t7 0" />
    </Dibujo>
  );
}

/** Trabajo: un brote con una herramienta. */
export function DibujoTrabajo({ tamano = 40 }: Props) {
  return (
    <Dibujo tamano={tamano}>
      <path d="M18 42 V26" />
      <path d="M18 28 C10 28 8 21 8 16 C14 16 18 19 18 28 Z" />
      <path d="M18 24 C18 17 22 13 29 13 C29 20 25 24 18 24 Z" />
      <path d="M32 42 L40 22" />
      <path d="M37 20 q5 1 5 6" />
    </Dibujo>
  );
}

/** Comunidad: un fogón con su llama y las piedras. */
export function DibujoComunidad({ tamano = 40 }: Props) {
  return (
    <Dibujo tamano={tamano}>
      <path d="M24 8 C27 14 33 18 33 26 a9 9 0 0 1 -18 0 C15 21 18 19 19 15 C21 17 22 19 22 21 C25 18 26 13 24 8 Z" />
      <path d="M10 41 H38" />
      <path d="M14 41 l-3 -4 M34 41 l3 -4" />
    </Dibujo>
  );
}

/** Quiero vivir ahí: una casa sobre el terreno. */
export function DibujoVivir({ tamano = 48 }: Props) {
  return (
    <Dibujo tamano={tamano}>
      <path d="M8 24 L24 10 L40 24" />
      <path d="M13 21 V38 H35 V21" />
      <path d="M21 38 V28 H27 V38" />
      <path d="M4 42 H44" />
    </Dibujo>
  );
}

/** Quiero invertir: una semilla que se vuelve brote sobre barras que crecen. */
export function DibujoInvertir({ tamano = 48 }: Props) {
  return (
    <Dibujo tamano={tamano}>
      <path d="M8 42 H40" />
      <path d="M12 42 V34 M22 42 V28 M32 42 V22" />
      <path d="M32 18 C26 18 24 13 24 9 C30 9 33 12 32 18 Z" />
    </Dibujo>
  );
}

/** Quiero cuidar el bien común: tres personas alrededor de un punto en común. */
export function DibujoCuidar({ tamano = 48 }: Props) {
  return (
    <Dibujo tamano={tamano}>
      <circle cx="24" cy="26" r="3" />
      <circle cx="24" cy="10" r="3.5" />
      <circle cx="11" cy="36" r="3.5" />
      <circle cx="37" cy="36" r="3.5" />
      <path d="M24 14 V22 M14 33 L21 28 M34 33 L27 28" />
    </Dibujo>
  );
}

/** Los cinco capitales, uno por id (`lib/portada-vrn.ts`). */
export function DibujoCapital({ id, tamano = 32 }: { id: string; tamano?: number }) {
  switch (id) {
    case "natural":
      return (
        <Dibujo tamano={tamano}>
          <path d="M24 42 V20" />
          <path d="M24 24 C14 24 10 17 10 10 C19 10 24 15 24 24 Z" />
          <path d="M24 30 C24 21 29 16 38 16 C38 25 33 30 24 30 Z" />
        </Dibujo>
      );
    case "humano":
      return (
        <Dibujo tamano={tamano}>
          <circle cx="24" cy="14" r="6" />
          <path d="M11 41 C11 31 17 26 24 26 C31 26 37 31 37 41 Z" />
        </Dibujo>
      );
    case "social":
      return (
        <Dibujo tamano={tamano}>
          <circle cx="16" cy="18" r="5" />
          <circle cx="32" cy="18" r="5" />
          <path d="M5 40 C5 32 10 28 16 28 C19 28 21 29 24 31" />
          <path d="M43 40 C43 32 38 28 32 28 C29 28 27 29 24 31" />
        </Dibujo>
      );
    case "construido":
      return (
        <Dibujo tamano={tamano}>
          <path d="M6 42 H42" />
          <path d="M10 42 V18 H24 V42" />
          <path d="M24 42 V10 H38 V42" />
          <path d="M15 25 H19 M15 32 H19 M29 18 H33 M29 25 H33 M29 32 H33" />
        </Dibujo>
      );
    default:
      return (
        <Dibujo tamano={tamano}>
          <circle cx="24" cy="24" r="14" />
          <path d="M24 15 V33 M29 19 C29 17 27 16 24 16 C21 16 19 17.5 19 20 C19 23 29 24 29 28 C29 30.5 27 32 24 32 C21 32 19 31 19 29" />
        </Dibujo>
      );
  }
}
