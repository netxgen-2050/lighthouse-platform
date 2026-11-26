// Clases repetidas de /bien-comun, en un único lugar para poder repintarlas (solo tokens del tema).
// Una sola capa de cajas (ux-bien-comun, design §4): fondo `surface` y borde `line`; una caja nunca lleva otra caja adentro.
export const CAJA = "grid content-start gap-2 rounded-[var(--radius-m)] border border-line bg-surface p-4";
// Lo que va dentro de una caja se separa con una línea, no con otra caja.
export const SEPARADOR = "border-t border-line pt-3";
export const LECTURA = "max-w-[68ch]";
export const TH = "px-2 py-1.5 text-left font-semibold";
export const TD = "px-2 py-1.5 align-top";
export const REGION = "overflow-x-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-deep";
