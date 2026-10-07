# Proposal

## Why

"Encontrar mi tribu" promete, en el mock-up v6 y en la US-07 de la nota 15 (prioridad M), **tres tribus sugeridas con el porqué** al terminar la entrevista, una de ellas con valores distintos para comparar. Hoy la entrevista (`perfil-entrevista`) termina con un enlace genérico a `/tribus` y la portada tuvo que dejar de prometer la sugerencia porque no existía (`portada-caminos`, design). Sin este paso, el recorrido de la It.1 "Explorar" (Lucía y Lucas hasta el perfil) no cierra: el perfil no sirve para nada visible. Es también la pieza que después reemplaza el agente con la API de Claude, así que conviene dejar ya su lugar y su contrato.

## What Changes

- **Sección "Sugeridas para vos"** arriba del directorio en `/tribus`, con **tres tribus** calculadas a partir de las respuestas **confirmadas** del perfil: las dos de mayor afinidad y una de menor afinidad, para comparar.
- Cada tarjeta muestra: nivel de **afinidad** en texto ("Afinidad alta", "media" o "baja") con el ⚖ `afinidad`, sello, nombre, barrio, **el porqué** en lenguaje natural ("Coinciden en…", "Vos aportás…, que hoy buscan") armado solo con palabras que la persona escribió y datos de la tribu, y los botones **"Ver la tribu"** y, salvo afinidad baja, **"Proponer mi pacto"** (→ `/pactos`).
- La tarjeta de afinidad baja lleva un aviso respetuoso: "Sus valores parecen distintos de los tuyos. Te la mostramos para que compares."
- **Sin perfil confirmado:** en lugar de sugerencias, "Completá tu perfil para ver tribus sugeridas" con enlace a `/perfil`. Nunca sugerencias inventadas.
- **Cierre de la entrevista:** el enlace final de `/perfil` pasa a decir "Ver mis tribus" y lleva a `/tribus#sugeridas`.
- **Un ⚖ nuevo en el catálogo:** `afinidad`, con el texto **copiado tal cual** del mock-up v6 (`LEGAL.afinidad`), así que no es borrador.
- El cálculo es una **función pura y testeada**, separada de la pantalla, para que el agente de IA la reemplace sin tocar la interfaz.

**Fuera de alcance:**
- IA o API de Claude: el cálculo es por coincidencia de palabras, explicado en el design.
- Usar el nivel de permanencia (`perfil-permanencia`) o datos sensibles (plata, residencia) en la afinidad.
- Mostrar la afinidad en la ficha de cada tribu (`/tribus/[id]`) o en el mapa del territorio.
- Sugerir barrios vacantes ("busca tribu"): no hay personas con quienes coincidir.
- Filtrar o esconder tribus del directorio: la sugerencia nunca es un filtro de ingreso; el directorio completo sigue igual debajo.
- Guardar las sugerencias o mandarlas a un servidor: se calculan cada vez en el navegador.

## Capabilities

### New Capabilities
- `tribus-sugeridas`: la sugerencia de tribus afines a partir del perfil confirmado, con nivel de afinidad, explicación y aviso de que no es un filtro.

### Modified Capabilities

## Impact

`lib/tribus/afinidad.ts` (cálculo puro, con tests), `app/tribus/page.tsx` y un componente cliente `app/tribus/sugeridas.tsx`, `app/perfil/entrevista.tsx` (texto y destino del enlace final), `lib/legal/terminos.ts` (clave `afinidad`), `e2e/tribus.spec.ts`, `e2e/perfil.spec.ts`, `e2e/marco.spec.ts` si usa el enlace final del perfil. Lee el perfil con `CLAVES.perfil` y `leerGuardado`. Sin dependencias nuevas.
