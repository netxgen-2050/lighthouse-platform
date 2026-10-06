# Design

## Context

Repo nuevo (Next.js 15 App Router, React 19, Tailwind 4). No hay base de datos ni auth todavía. La referencia visual y de datos es `docs/referencia/netx-tribus-mockup-v6.html` (constante `TRIBES`, vistas `V.tribus` y `V.tribu`, catálogo `LEGAL`).

## Goals / Non-Goals

**Goals:** páginas estáticas, rápidas, accesibles y fieles al tono del mock-up; un tipo de datos que después se pueda mover a la base sin cambiar las páginas.

**Non-Goals:** sistema de diseño completo, navegación global, i18n, base de datos.

## Decisions

- **Datos en `lib/tribus/datos.ts`** como arreglo tipado `Tribu[]`, con una función `listarTribus()` y `buscarTribu(id)`. Las páginas solo usan esas funciones, así mañana se cambia la fuente por Neon sin tocar la UI. Alternativa descartada: JSON suelto (pierde el tipado).
- **Se copian solo los campos dentro del alcance:** `id, nombre, iniciales, barrio, foco, estado, hogares, subtitulo, declaracion, tiene, busca, areas?, areasAbiertas?, ritual, formaJuridica, pozo`. Quedan afuera `cap`, `hum`, `avales`, `fit`.
- **Estado como unión** `"activa" | "formacion" | "vacante"`. El texto visible sale de un mapa (`Activa`, `En formación`, `Busca tribu`).
- **Generación estática:** `generateStaticParams` con los 12 ids y `dynamicParams = false`, así un id desconocido da 404 sin código extra.
- **`TerminoLegal`** en `components/termino-legal.tsx` (componente cliente): botón ⚖ con `aria-expanded`, `aria-controls` y `aria-label`; el panel es un elemento con `role="dialog"` no modal. Catálogo en `lib/legal/terminos.ts` con `as const`, así la clave es un tipo cerrado y una clave inválida no compila.
- **Estilos:** Tailwind con una paleta cercana al mock-up (tierra, verde, dorado). Sin librerías de UI.

## Risks / Trade-offs

- [Los datos de ejemplo parecen reales] → aviso visible en las dos páginas y la nota del mock-up.
- [Textos legales desactualizados] → solo los dos ya escritos; cualquier texto nuevo pasa por Gabriel.

## Migration Plan

Nada que migrar. Se publica con el merge a `main`.
