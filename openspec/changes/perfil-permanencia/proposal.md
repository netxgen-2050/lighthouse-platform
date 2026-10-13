# Proposal

## Why

La It.1 ("Explorar") cierra con la demo "Recorrido Lucía/Lucas hasta el perfil" (roadmap técnico, Desarrollo/06). De las historias Must de esa parte del recorrido, la única que nunca entró al prototipo es **US-05 · Gradiente de permanencia** (nota 15): decir cuánto te querés involucrar (solo invertir / visitar / vivir parte del año / mudarte) para que la plataforma te muestre lo relevante.

Además, "Mi recorrido" hoy no tiene forma de saber si la persona quiere invertir: `lib/panel/proximo-paso.ts` lo deduce de que haya iniciado el KYC del Pasaporte y lo deja escrito ("todavía no hay forma de saberlo en el prototipo"). Con el gradiente, "solo invertir" lo dice la persona, y el paso "Verificá tu identidad (hace falta para invertir)" aparece cuando corresponde. Es la puerta de entrada al camino del inversor que el prototipo tiene que dejar claro (decisión de Gus del 7-oct).

## What Changes

- **Dato nuevo `permanencia`** con cuatro valores: `invertir` ("Solo invertir"), `visitar` ("Visitar"), `parte-del-anio` ("Vivir parte del año") y `mudarme` ("Mudarme"). Se guarda en el navegador con la clave nueva `lh-permanencia` en `lib/demo/claves.ts` (con el prefijo por persona que pone `login-privy`). Sin elegir, o con un valor raro guardado, es **"sin dato"**.
- **En `/perfil`**, arriba del formulario: un grupo de opciones "¿Cuánto te querés involucrar?" con las cuatro opciones. Elegir guarda al instante y se puede cambiar cuando quieras. Debajo, una sola sugerencia "Te sugerimos seguir por…" con un enlace:
  - Solo invertir → la sección "Para inversores" de `/sumarte` (`/sumarte#inversores`, el ancla ya existe).
  - Visitar → `/congreso`.
  - Vivir parte del año / Mudarme → `/tribus`.
- **En "Mi recorrido" (`/panel`)**: `quiereInvertir` pasa a ser verdadero si la persona eligió "Solo invertir" **o** inició el KYC (como hoy). Se muestra el dato "Cómo te querés involucrar: …" o "sin dato".
- "Borrar todo lo de este navegador" quita también `lh-permanencia` (sale solo porque `borrarDemo` recorre `CLAVES`).

## Fuera de alcance

- Reordenar el rail o las pantallas según el gradiente (US-05 lo sugiere; acá es una sola sugerencia).
- Que el agente de la entrevista (Hifa) pregunte o proponga el gradiente.
- Usar el gradiente en la afinidad con tribus, en la Vista NetX (embudo por gradiente) o mandarlo a un CRM (HubSpot sigue pendiente de decisión).
- US-16 (selector Capital / Compromiso / Ambos): descartada en la nota 15.
- Textos legales nuevos: elegir "Solo invertir" no promete nada y no lleva ⚖.

## Capabilities

### New Capabilities
- `perfil-permanencia`: elegir cuánto te querés involucrar, con una sugerencia de por dónde seguir y su efecto en el próximo paso de "Mi recorrido".

### Modified Capabilities

## Impact

`lib/perfil/permanencia.ts` (nuevo, con su test), `lib/demo/claves.ts`, `app/perfil/perfil-cliente.tsx`, `lib/panel/proximo-paso.ts` (y su test), la página de `/panel`, `e2e/perfil.spec.ts`, `e2e/panel.spec.ts` (o el e2e del panel que exista) y `e2e/accesibilidad.spec.ts`. Sin dependencias npm nuevas.
