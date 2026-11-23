# Tasks

**Corte por noche: después de la noche 4.** No hace falta para la reunión del lunes 9-nov; si sobra una noche antes, puede entrar. Rama `agente/portada-vrn`, desde `dev`. Textos en `design.md`.

**Antes de empezar:** comprobar que existe `/lotes` y que `idioma-portada-sumarte` está cerrado; si no, frenar y reportar.

## 1. Datos

- [ ] 1.1 Crear `lib/portada-vrn.ts` con los cinco capitales (design §3) y `CIFRAS` (design §4). Verificar con `lib/portada-vrn.test.ts`: hay cinco capitales con los dos idiomas; toda cifra tiene `fuente` y `consultado` no vacíos; ninguna cifra es externa todavía. `pnpm test lib/portada`.
- [ ] 1.2 Sumar `en` a `ribera` en `lib/legal/terminos.ts`, sin tocar su español. Verificar en `lib/legal/terminos.test.ts` que tiene inglés y que el español sigue coincidiendo con el mock-up. `pnpm test lib/legal`.

## 2. Página

- [ ] 2.1 Reescribir `lib/idioma/textos/portada.ts` y `app/page.tsx` en el orden de design §1, con los textos de design §2. Verificar con `pnpm verificar` (los tipos obligan a los dos idiomas) y sumando a `lib/portada.test.ts` que la página no escribe cifras: `git grep -nE "[0-9]+ ?(mm|ha|km|%)" -- lib/idioma/textos/portada.ts app/page.tsx` sin resultados.
- [ ] 2.2 Cambiar `CAMINOS_VALIDOS` y `caminosDePortada` (design §5). Verificar con `lib/portada.test.ts`: las tres tarjetas, con sus destinos; la descripción de Tribus sigue saliendo de los datos. `pnpm test lib/portada lib/origen`.
- [ ] 2.3 Comprobar el contenido en `e2e/portada.spec.ts`: se leen la promesa, "Argentina, un lugar seguro y abierto", los cinco capitales y "Ver los lotes", que lleva a `/lotes` con el teclado; cada cifra muestra su fuente; **no** aparecen "Congreso", "SMA", "San Martín de los Andes", "Atlántico Sur", "111", "TIR" ni "recupero"; se ve "Prototipo interno · datos de ejemplo". Si Gus no confirmó la lista de capitales, decirlo en el PR. `pnpm test:e2e e2e/portada.spec.ts`.
- [ ] 2.4 Comprobar `?camino=`: `/?camino=lotes` marca "Ver los lotes" con "Recomendado para vos"; `/?camino=congreso` no marca ninguna y no falla; un `lh-origen` viejo con `camino: "congreso"` sigue dando fuente y campaña en un pedido. Actualizar `e2e/idioma-portada-sumarte.spec.ts` y `e2e/descubrir-publico.spec.ts`. Verificar con `pnpm test:e2e e2e/portada.spec.ts e2e/idioma-portada-sumarte.spec.ts e2e/descubrir-publico.spec.ts`.
- [ ] 2.5 Comprobar `?lang=en` sin español suelto, axe en los dos idiomas y 390 × 844 px sin scroll horizontal. `pnpm test:e2e e2e/accesibilidad.spec.ts e2e/portada.spec.ts`.

## 3. Integración

- [ ] 3.1 `git diff --name-only origin/dev` no incluye `lib/permisos/` ni `package.json`. `pnpm verificar` y `pnpm build` en verde.
- [ ] 3.2 Abrir el PR con `scripts/pr.sh` hacia `dev`, aclarando: los textos son borrador; los cinco capitales son una hipótesis si Gus no los confirmó; no hay cifras externas porque no hay ninguna con fuente; y la frase "en el corazón de Vaca Muerta". Verificar con `scripts/preview-url.sh agente/portada-vrn` y `BASE_URL=<url> pnpm test:e2e e2e/portada.spec.ts`.
