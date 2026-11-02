# Proposal

## Why

Gus lo reportó con el botón de bugs (**issue #50**, 9-oct): "no puedo proponer modificar pactos; esperaba proponerlos y que un admin los acepte o no". Hoy, una vez enviado, el pacto de tiempo **no se puede tocar**: ni retirarlo antes de que lo acepten, ni proponer un cambio después (más horas, otro rol). La US-17 de la nota 15 ya pedía "borrador → en revisión → aceptado por las partes, **con historial de versiones**", y la pantalla muestra un "Versión N" que en realidad es el número de paso.

## What Changes

- **Proponer un cambio a un pacto aceptado.** En un pacto de tiempo aceptado aparece **"Proponer un cambio"**. Abre un borrador con los datos de la versión vigente (rol, descripción, horas) que se puede editar y **enviar a la comunidad**. Mientras tanto la **versión aceptada sigue vigente**: Semillas sigue sumando con sus horas.
- **Respuesta de la comunidad (simulada, como hoy):** con el cambio enviado aparecen **"Simular: la comunidad acepta el cambio"** y **"Simular: la comunidad no lo acepta"**.
  - Si lo acepta, el cambio pasa a ser la versión vigente, con número de versión nuevo, y Semillas usa sus horas.
  - Si no lo acepta, el cambio se descarta y queda un aviso: "Quien administra <comunidad> no aceptó el cambio. Sigue vigente la versión N."
- **Descartar** un cambio que todavía está en borrador, sin tocar la versión vigente.
- **Retirar un pacto enviado** que todavía no fue aceptado: vuelve a borrador para editarlo.
- **Número de versión real** (1 al aceptar el primero, +1 por cada cambio aceptado) en lugar del número de paso, y un **historial** plegable con cada versión aceptada (rol, horas, descripción y fecha).
- **Mi recorrido**: se registran "Propusiste un cambio a tu pacto en <comunidad>", "<comunidad> aceptó el cambio" y "<comunidad> no aceptó el cambio", con el mismo mecanismo de eventos de hoy.
- Lo guardado con el formato actual se sigue leyendo: un pacto aceptado queda como versión 1.

**Fuera de alcance:**
- La aprobación real por el admin de la comunidad (va con `aprobaciones-admin`, después de `base-neon` y de la decisión R28). Este cambio deja el flujo de la persona listo para enchufarle esa aprobación.
- Cambiar o retirar aportes en plata.
- Dar de baja un pacto aceptado (terminarlo): es otro flujo, con consecuencias en Semillas que hay que decidir.
- Recalcular Semillas de meses pasados: Semillas sigue mostrando el cálculo mensual con la versión vigente, como hoy.

## Capabilities

### New Capabilities
- `pactos-proponer-cambio`: retirar un pacto enviado, proponer cambios a un pacto aceptado, versiones e historial.

### Modified Capabilities

## Impact

`lib/pactos/estado.ts` (cambio pendiente, versión, historial, acciones nuevas, lectura del formato anterior; `pactosAceptados` devuelve siempre la versión vigente), `app/pactos/pactos-cliente.tsx`, `lib/actividad/eventos.ts` (tres eventos), tests de Vitest y `e2e/pactos.spec.ts`. Semillas no cambia de código: sigue leyendo `pactosAceptados`. Cierra el issue #50.
