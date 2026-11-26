// Fondo del héroe del valle (ux-explorar, design §8): el texto va directo sobre la foto, sin caja. Todo el bloque de texto lleva el color de
// fondo del tema con una opacidad fija (`bg-bg/NN`), sin importar cuánto alto tenga el contenido (a 390 px el texto se parte en más líneas).
// Arriba, una franja sin texto desvanece la foto hacia ese mismo color. Esa opacidad la lee `lib/tema-contraste.test.ts` para probar el
// contraste del texto en el peor caso (foto toda blanca o toda negra detrás). Si se cambia, el test vuelve a medir.
export const CLASE_FONDO_DEL_TEXTO_DEL_HEROE = "bg-bg/80";
export const CLASE_DESVANECIDO_DEL_HEROE = "bg-linear-to-b from-bg/0 to-bg/80";
