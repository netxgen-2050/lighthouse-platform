import { LogoGoogle } from "./logo-google";

type Props = {
  ocupado: boolean;
  onClick: () => void;
};

/**
 * Botón "Continuar con Google" según las pautas de marca de Google (login-google-estandar): logo "G" de cuatro colores sin
 * modificar, Roboto Medium 14/20, 40 px de alto, colores del tema (tokens `google-*`).
 */
export function BotonGoogle({ ocupado, onClick }: Props) {
  return (
    <button
      type="button"
      aria-disabled={ocupado}
      onClick={() => {
        if (!ocupado) onClick();
      }}
      className="flex h-10 w-full max-w-sm items-center justify-center gap-2.5 rounded-[4px] border border-google-borde bg-google-fondo px-3 font-google text-sm font-medium leading-5 text-google-texto hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep aria-disabled:opacity-60"
    >
      <LogoGoogle />
      <span>Continuar con Google</span>
    </button>
  );
}
