// Degradado del héroe del valle (ux-explorar, design §8): el texto va directo sobre la foto, sin caja. El degradado va del color de fondo
// del tema al 90 % abajo hasta el 0 % arriba; el texto queda en la parte baja, donde la opacidad (`via-bg/NN`, hasta el 65 % de la
// altura) nunca baja de ese valor. Esa opacidad la lee `lib/tema-contraste.test.ts` para probar el contraste del texto en el peor
// caso (foto toda blanca o toda negra detrás). Si se cambia, el test vuelve a medir.
export const CLASE_DEGRADADO_DEL_HEROE = "bg-linear-to-t from-bg/90 via-bg/80 via-65% to-bg/0";
