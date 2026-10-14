import { useId } from "react";

/**
 * Eclipse del hero: decorativo. La luna cubre el sol una sola vez al cargar; con "reducir animaciones"
 * la hoja del tema deja la animación en "none" y queda ya formado. Sin colores acá: todo va por clases.
 */
export function Eclipse() {
  const id = useId();
  return (
    <div className="ev-eclipse" aria-hidden="true">
      <svg viewBox="0 0 400 400" focusable="false">
        <defs>
          <radialGradient id={`${id}-halo`} cx="50%" cy="50%" r="50%">
            <stop className="ev-halo-0" offset="45%" />
            <stop className="ev-halo-1" offset="62%" />
            <stop className="ev-halo-2" offset="100%" />
          </radialGradient>
          <radialGradient id={`${id}-sol`} cx="50%" cy="50%" r="50%">
            <stop className="ev-sol-0" offset="0%" />
            <stop className="ev-sol-1" offset="70%" />
            <stop className="ev-sol-2" offset="100%" />
          </radialGradient>
        </defs>
        <circle className="ev-corona-halo" cx="200" cy="200" r="200" fill={`url(#${id}-halo)`} />
        <circle cx="200" cy="200" r="120" fill={`url(#${id}-sol)`} />
        <circle className="ev-luna" cx="200" cy="200" r="106" />
      </svg>
    </div>
  );
}
