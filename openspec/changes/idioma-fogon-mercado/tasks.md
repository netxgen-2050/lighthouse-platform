# Tasks

Requisito previo: `idioma-base` mergeado. Rama `agente/idioma-fogon-mercado`. El cómo está en el design de `idioma-base` (§3, §7, §8 y §10). Español idéntico al de hoy. Cada diccionario y archivo de datos con inglés se anota como `pendiente` en `lib/idioma/revision-nativa.ts` y se regenera la lista con `pnpm idioma:pendientes` (`idioma-base` design §12).

## 1. Fogón

- [ ] 1.1 Crear `lib/idioma/textos/fogon.ts`; `AMBITOS` y `OPCIONES` de `lib/fogon/datos.ts` por idioma; título y descripción de cada decisión de ejemplo como `Bilingue` con `original: "es"` y su inglés; pasar `app/fogon/**` a leerlo, con `TextoBilingue` (en inglés, nota "Translated from Spanish"). Verificar con `pnpm test:e2e e2e/fogon.spec.ts` (español en verde).

## 2. Compromisos y Mercado

- [ ] 2.1 Crear `lib/idioma/textos/compromisos.ts`; pasar `app/compromisos/**`, `lib/compromisos/validar.ts` (mensajes por idioma), `formato.ts`, `tipos.ts` (etiquetas) y `mercado.ts` (estados y ofertas de ejemplo como `Bilingue` con `original: "es"`, mostradas con `TextoBilingue`); las ofertas que publica la persona, tal cual, con `lang="es"` en inglés. Tests de `validar.test.ts` y `formato.test.ts` en inglés. Verificar con `pnpm test` y `pnpm test:e2e e2e/compromisos.spec.ts`.

## 3. Canales

- [ ] 3.1 Crear `lib/idioma/textos/canales.ts`; `NOMBRES`, `PLANES` y `PASES` de `lib/canales/puertas.ts` desde el glosario y por idioma; pasar `app/canales/page.tsx`. Verificar con `pnpm test` y `pnpm test:e2e e2e/canales.spec.ts`.

## 4. Pruebas

- [ ] 4.1 Sumar `/fogon`, `/compromisos` y `/canales` a `RUTAS_TRADUCIDAS` y crear `e2e/idioma-fogon-mercado.spec.ts` con los escenarios de la spec. Verificar con `pnpm test:e2e e2e/idioma-fogon-mercado.spec.ts e2e/idioma.spec.ts`.
- [ ] 4.2 Sumar las tres páginas en inglés a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm verificar`, `pnpm build` y `pnpm test:e2e`.
