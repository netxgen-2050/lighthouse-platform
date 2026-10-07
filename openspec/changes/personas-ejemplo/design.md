# Design

## Context

`perfil-entrevista` (en la rama de integración del 7-oct) tiene: `lib/perfil/preguntas.ts` con las seis preguntas (`CHATS`, sin el nombre de la persona), `lib/perfil/propuesta.ts` con `propuestaDePerfil(pregunta, respuesta)` como única función de propuesta, `lib/perfil/estado.ts` con el reducer y `app/perfil/entrevista.tsx` (cliente, guarda en `localStorage` con la clave `lh-perfil-entrevista`). El mock-up v6 define `PEOPLE` (datos de Lucía y Lucas) y `CHATS.lucia` / `CHATS.lucas` (pregunta, respuesta, etiqueta, resumen) en `docs/referencia/netx-tribus-mockup-v6.html`.

## Goals / Non-Goals

**Goals:**
- Poder mostrar y testear el recorrido "portada → perfil completo" de Lucía y de Lucas sin tipear.
- No tocar el contrato de `propuestaDePerfil` (sigue siendo la única función que mañana reemplaza el agente).

**Non-Goals:**
- Datos de plata, residencia fiscal, nacionalidad o modalidad de obra.
- Afinidad y tribus sugeridas.
- Que la persona elegida cambie otras pantallas (tribus, congreso, compromisos).

## Decisions

- **Datos en `lib/personas/datos.ts`:** `PERSONAS: Record<"lucia" | "lucas", Persona>` con `Persona = { id, nombre, edad, ciudad, descripcion, respuestas: readonly { respuesta: string; resumen: string }[] }`. `descripcion` es `bio` del mock-up; `respuestas` sale de `CHATS.<id>` (columnas 2 y 4), **en el mismo orden** que `lib/perfil/preguntas.ts`. Se copian textualmente; un test lo compara contra el mock-up igual que `lib/legal/terminos.test.ts`.
- **El tipo `Persona` no tiene** campos de plata, nacionalidad ni residencia: agregarlos obliga a cambiar la spec.
- **Estado del selector en `lib/personas/estado.ts`:** `leerPersona(crudo: string | null): IdPersona | null` (devuelve `null` ante cualquier valor desconocido) y la clave `CLAVE_PERSONA = "lighthouse.persona.v1"`. Los componentes cliente leen después de hidratar, como `entrevista.tsx`.
- **Sincronía entre la portada y el perfil:** cada página lee la clave al montar; dentro de una misma página, el selector avisa con un callback. No hace falta un contexto global porque el selector no está en el encabezado.
- **Componente `components/selector-persona.tsx`** (`"use client"`): `<fieldset>` con `<legend>Ver como</legend>` y tres `<input type="radio">` con su `<label>`. Radios nativos = teclado y lector de pantalla resueltos; la opción elegida se marca con el estado del radio y con peso de fuente, no solo con color.
- **Tarjeta de la portada:** `components/tarjeta-persona.tsx` (cliente) que recibe el id y muestra nombre, edad, ciudad, descripción y la marca "Persona de ejemplo". La portada sigue siendo Server Component y monta una isla cliente que agrupa selector y tarjeta.
- **Botón en la entrevista:** en `app/perfil/entrevista.tsx`, si hay persona y la entrevista no terminó, un botón `type="button"` "Usar la respuesta de ejemplo de <nombre>" que hace `setTexto(persona.respuestas[n].respuesta)` y pone el foco en el campo. No despacha `responder`.
- **Propuesta:** `propuestaDePerfil(pregunta, respuesta)` primero busca, entre las dos personas, la respuesta de ejemplo de la pregunta (por la posición de `pregunta` en `CHATS`) que coincida exactamente con `respuesta.trim()`; si la encuentra, devuelve su `resumen`; si no, sigue con el recorte actual. La firma no cambia y no depende de qué persona está elegida (así una respuesta guardada se vuelve a proponer igual).
- **Estilo:** solo tokens del tema; sin `<main>` propio.

## Risks / Trade-offs

- [El texto de Lucía habla de "poner mis ahorros" e "invertir"] → es narrativa de la persona sin montos ni ofertas; se copia textualmente para no reescribir el mock-up. Si Gus prefiere suavizarlo, es una edición de datos (ver preguntas abiertas).
- [Si el orden de `CHATS` en el mock-up y en `lib/perfil/preguntas.ts` diverge, las respuestas quedan en la pregunta equivocada] → el test de datos compara también las etiquetas.
- [Dos claves de `localStorage` con estilos distintos (`lh-perfil-entrevista` y `lighthouse.persona.v1`)] → se usa el estilo de `compromisos-registro`; unificar las claves es tarea de `panel-recorrido`.
