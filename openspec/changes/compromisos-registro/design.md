# Design

## Context

No hay cuentas ni base todavía. `perfil-entrevista` y `congreso-registro` ya establecieron el patrón "modo demostración en `localStorage` con aviso visible y botón de borrar". Este cambio lo reutiliza para compromisos de tiempo y bienes.

## Goals / Non-Goals

**Goals:**
- Validar el formulario y la lista en el preview.
- Separar lógica pura (testeable con Vitest) de la página.

**Non-Goals:**
- Plata, persistencia en servidor, compromisos de tribus, pozo común, emparejamiento.
- Leyendas legales ("no vinculante" u otras): las decide Gabriel.

## Decisions

- **Archivos:**
  - `lib/compromisos/tipos.ts`: `Compromiso = { id, tipo: "ofrezco" | "necesito", clase: "tiempo" | "bienes" | "plata", descripcion, horasPorMes?: number, cantidadBienes?: string, montoUsd?: number, para: "lighthouse" | idTribu, creado: string }`. La clase `"plata"` se agregó en la vuelta de corrección del 7-oct (fase de prototipo): monto orientativo en USD, entero de 1 a 1000000, opcional; nunca se cobra.
  - `lib/compromisos/validar.ts`: `validarCompromiso(borrador)` → `{ ok: true, compromiso } | { ok: false, errores: Record<campo, mensaje> }`.
  - `lib/compromisos/estado.ts`: reducer puro (`registrar`, `quitar`, `borrarTodo`, `cargar`).
  - `lib/compromisos/formato.ts`: `describirCompromiso(c, tribus)` → la línea que muestra la lista ("Ofrezco · Tiempo · … · 8 h/mes · Para: Semilla Viva"), con "sin dato" cuando falta la cantidad.
- **Página cliente** `app/compromisos/page.tsx` (Server Component con metadata) + `app/compromisos/formulario.tsx` (`"use client"`). La clave de `localStorage` es `lighthouse.compromisos.v1`; si el JSON guardado es inválido, se descarta y se empieza vacío.
- **Ids** con `crypto.randomUUID()`; la fecha `creado` solo se usa para ordenar, no se muestra.
- **Sin `<main>` propio** y **solo tokens del tema** (`bg-surface`, `border-line`, `text-ink`, `text-muted`, `bg-deep` / `text-on-deep` para el botón principal, `bg-warn-bg` / `text-warn-ink` para el aviso de demostración). Prohibido `stone-*`, `emerald-*`, `amber-*` y hex sueltos. Lección de la integración del 6-oct.
- **Errores accesibles:** cada campo con `<label>`, error en un `<p id>` referenciado por `aria-describedby` y `aria-invalid`; al fallar, foco al primer campo con error. Tipo y clase como grupos de radio (`<fieldset>` + `<legend>`).
- **Campo de cantidad condicional:** cambia según la clase; al pasar de Tiempo a Bienes se limpia el valor anterior para no mezclar unidades.

## Risks / Trade-offs

- [Alguien escribe un monto en la descripción] → no se valida el texto libre (sería frágil); la UI nunca sugiere plata y la spec lo deja fuera. Si Gus quiere un filtro, va en otro cambio.
- [Sin leyenda legal, alguien puede leer "compromiso" como obligación] → el aviso deja claro que es una demostración local; la leyenda definitiva queda como pregunta para Gabriel antes de guardar datos reales.
- [Conflicto con otras ramas que tocan el encabezado] → el cambio en el encabezado es un ítem más del arreglo de enlaces.
