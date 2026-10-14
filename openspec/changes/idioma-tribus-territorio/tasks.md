# Tasks

Requisito previo: `idioma-base` mergeado (mejor también `idioma-portada-sumarte`). Rama `agente/idioma-tribus-territorio`. El cómo está en el design de `idioma-base` (§3, §7, §9 y §10). Español idéntico al de hoy.

## 1. Datos

- [ ] 1.1 Pasar a `Bilingue` los campos descriptivos de `lib/tribus/tipos.ts`/`datos.ts` (lista en la propuesta) con su inglés, y resolverlos con el idioma donde se leen (tribus, Sumarte, Pactos, Vista NetX). Test en `lib/tribus/datos.test.ts`: todo campo descriptivo tiene `es` y `en` no vacíos y distintos; `declaracion` sigue siendo texto en español. Verificar con `pnpm test`.
- [ ] 1.2 `lib/territorios/textos.ts`: `TEXTO_COMUN`, `LUGARES` y los nombres descriptivos de `NOMBRES` como `Bilingue`; `descripcionDeLugar(id, idioma)` devuelve "no data" en inglés sin dato. Tests. Verificar con `pnpm test`.

## 2. Páginas

- [ ] 2.1 Crear `lib/idioma/textos/tribus.ts` y pasar `app/tribus/page.tsx`, `app/tribus/[id]/page.tsx`, `acciones.tsx`, `components/membresia-acciones.tsx`, `components/sello-tribu.tsx` y `lib/membresia/estado.ts` (mensajes) a leerlo; nombres con `translate="no"`; montos con `formatearMonto(…, idioma)`. Verificar con `pnpm test:e2e e2e/tribus.spec.ts e2e/membresia.spec.ts` (español en verde).
- [ ] 2.2 Interfaz del manifiesto (`app/tribus/[id]/manifiesto/**`) en inglés con el texto del manifiesto y la declaración en `lang="es"` y la nota "Written in Spanish". Postulación (`app/tribus/[id]/postular/**`, mensajes de `lib/postulaciones/postulaciones.ts`) en inglés. Verificar con `pnpm test:e2e e2e/postulacion.spec.ts e2e/descubrir-publico.spec.ts`.
- [ ] 2.3 Crear `lib/idioma/textos/territorio.ts` y pasar `app/territorios/[id]/**` (vitrina, ficha lateral, controles y leyenda del mapa, `not-found`) a leerlo. Verificar con `pnpm test:e2e e2e/territorio.spec.ts e2e/territorio-mapa.spec.ts`.

## 3. Pruebas

- [ ] 3.1 Sumar las cinco rutas a `RUTAS_TRADUCIDAS` y crear `e2e/idioma-tribus-territorio.spec.ts` con los escenarios de la spec (estados, ficha de Valle Solar, lugar del mapa, manifiesto marcado, error de la postulación con foco). Verificar con `pnpm test:e2e e2e/idioma-tribus-territorio.spec.ts e2e/idioma.spec.ts`.
- [ ] 3.2 Sumar `/tribus/valle` y `/territorios/lighthouse` en inglés a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm verificar`, `pnpm build` y `pnpm test:e2e`.
