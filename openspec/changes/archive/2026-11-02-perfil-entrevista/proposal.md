# Proposal

## Why

"Encontrar mi tribu" empieza con una entrevista corta en lugar de un formulario (módulo `perfil/` de la It.1). Más adelante la conducirá un agente con la API de Claude, siguiendo el patrón "el agente propone, la persona confirma". Hoy construimos el recorrido y la confirmación **sin IA**, para validar la experiencia y dejar el lugar donde después se enchufa el agente.

## What Changes

- Página `/perfil` con las 6 preguntas del mock-up v6 (Qué te trae; Qué paisaje te imaginás; Cómo te gustaría decidir en comunidad; Qué sabés hacer que pueda sumar; Cuánto tiempo podrías dedicar; Qué no negociarías), de a una, como conversación.
- Por cada respuesta, la plataforma **propone** un dato del perfil (en esta versión, la propia respuesta recortada) y la persona lo **confirma** o lo **corrige**.
- Panel lateral "Tu perfil" con el avance (n/6) y los datos confirmados.
- Todo queda **solo en el navegador**, con aviso visible y un botón para borrar.
- Una interfaz `propuestaDePerfil(pregunta, respuesta)` aislada, que mañana reemplaza el agente.

**Fuera de alcance:** IA, cuentas, envío de datos al servidor, sugerencia de tribus, datos sensibles (identidad, plata, residencia fiscal).

## Capabilities

### New Capabilities
- `perfil-entrevista`: la entrevista guiada y la confirmación del perfil.

### Modified Capabilities

## Impact

`app/perfil/`, `lib/perfil/`. Sin dependencias nuevas.
