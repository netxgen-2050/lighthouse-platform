# Design

## Context

En la rama de integración del 7-oct, cada pantalla en modo demostración define su clave adentro del componente cliente:

| Pantalla | Archivo | Clave | Lector existente |
|---|---|---|---|
| Perfil | `app/perfil/entrevista.tsx` | `lh-perfil-entrevista` | `leerGuardado` en `lib/perfil/estado.ts` (+ `cantidadConfirmados`) |
| Compromisos | `app/compromisos/formulario.tsx` | `lighthouse.compromisos.v1` | `cargar` en `lib/compromisos/estado.ts` |
| Congreso | `app/congreso/registro-ticket.tsx` | `lh-congreso-ticket` | `esCodigoValido` / `normalizarCodigo` en `lib/congreso/ticket.ts` |

Los tres lectores ya descartan datos inválidos. Falta un lugar común para las claves y una función que arme el resumen.

## Goals / Non-Goals

**Goals:**
- Un resumen puro y testeable del estado de la demo.
- Claves centralizadas sin perder lo que ya está guardado.

**Non-Goals:**
- Cambiar los nombres de las claves (eso borraría lo guardado; se decide cuando haya cuentas).
- Plata, alertas legales, lotes, pactos, notificaciones.

## Decisions

- **`lib/demo/claves.ts`:** `CLAVES = { perfil: "lh-perfil-entrevista", compromisos: "lighthouse.compromisos.v1", congreso: "lh-congreso-ticket" } as const` (los valores actuales, tal cual). Los tres componentes reemplazan su `const CLAVE = …` por `CLAVES.<x>`. Un test fija los valores para que nadie los cambie sin querer.
- **`lib/demo/resumen.ts`:** `resumirDemo(leer: (clave: string) => string | null): ResumenDemo`, pura, que recibe la función de lectura (en el navegador, `localStorage.getItem`; en los tests, un objeto). Devuelve `{ perfil: { confirmados, total } | null, compromisos: { ofrezco, necesito } | null, ticket: string | null, proximo: "perfil" | "compromisos" | "congreso" | null }`. `null` = no hay dato (el estado vacío), nunca 0 inventado. Reusa `leerGuardado`, `cantidadConfirmados`, `cargar` y `esCodigoValido`.
- **Regla del próximo paso** en la misma función: perfil si `confirmados < 6` o no hay perfil; si no, compromisos si no hay ninguno; si no, congreso si no hay ticket; si no, `null`.
- **`lib/demo/borrar.ts`:** `borrarDemo(quitar: (clave: string) => void)` recorre `Object.values(CLAVES)`.
- **Página:** `app/panel/page.tsx` (Server Component con `metadata`, título "Mi recorrido") + `app/panel/resumen.tsx` (`"use client"`) que lee después de hidratar (mientras tanto "Cargando…", como `entrevista.tsx`). Si `localStorage` lanza, muestra el error en texto (`role="alert"`) y no los estados vacíos.
- **Orden en pantalla:** "Tu próximo paso" arriba, después las tarjetas Perfil, Compromisos y Congreso (`<section>` con `<h2>` cada una), después el aviso y el botón de borrado. El estado de cada tarjeta es una frase; si se agrega un ícono, va con `aria-hidden` y el texto dice lo mismo.
- **Confirmación de borrado:** `window.confirm("¿Borrar todo lo que guardaste en este navegador?")`. Es accesible por teclado y suficiente para una demo; un diálogo propio queda para cuando haya un componente de diálogo.
- **Encabezado:** `{ href: "/panel", texto: "Mi recorrido" }` al final del arreglo `enlaces`.
- **Estilo:** solo tokens del tema (`bg-surface`, `border-line`, `text-ink`, `text-muted`, `bg-warn-bg` / `text-warn-ink` para el aviso, `text-danger` para el error); sin `<main>` propio.

## Risks / Trade-offs

- [El panel queda desactualizado si otra pestaña cambia datos] → se relee al montar; escuchar el evento `storage` es una mejora menor que puede sumarse sin cambiar la spec.
- [Tocar tres componentes de otros cambios] → el cambio es solo importar la clave; los e2e de esas pantallas tienen que seguir en verde (tarea 3.2).
- [El encabezado llega a 7 enlaces si también entra `portada-caminos`] → ver preguntas abiertas sobre un menú plegable.
- [`window.confirm` se ve distinto en cada navegador] → aceptable en modo demostración.
