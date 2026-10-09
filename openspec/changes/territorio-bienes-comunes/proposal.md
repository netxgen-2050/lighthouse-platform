# Proposal

## Why

La ficha del territorio es parte del módulo `descubrir/` de la It.1 "Explorar" (Desarrollo/06), y la US-04 (nota 15) pide que la persona vea **qué se va a construir en común y cuánto falta** para confiar. Hoy `/territorios/lighthouse` lista los cuatro bienes comunes **solo por nombre**: `territorio-ficha` dejó afuera a propósito las barras de "Plata" y "Horas de trabajo" del mock-up v6 y los ⚖ de "Guardianes de la tierra" y "Pacto de convivencia", porque en ese momento no se mostraba plata. Desde el 7-oct-2026 (fase de prototipo interno, `CLAUDE.md`) la plata está permitida y el prototipo tiene que dejar claro que la plataforma **va a captar plata y horas** para el Fondo Común. Los bienes comunes son el lugar más concreto donde se ve **para qué** se pide.

## What Changes

- La sección "Bienes comunes" de `/territorios/lighthouse` pasa a ser **"Bienes comunes del Lighthouse"** con la marca de ejemplo, como en `V.territorio` del mock-up v6:
  - Una tarjeta por bien (Agua; Energía; Núcleo común; Vivero y banco de semillas) con **dos medidores**: "Plata" (USD comprometidos de USD necesarios) y "Horas de trabajo" (horas comprometidas de horas necesarias), con los números del mock-up.
  - Si a un bien le falta un número, se muestra "sin dato" en lugar del medidor (nunca 0).
  - Al lado del título: "Plata y horas, en el espejo del proyecto" con el ⚖ `espejo` (ya existe en el catálogo).
  - Al pie: "Cómo se protege la tierra: Guardianes de la tierra ⚖ y un Pacto de convivencia ⚖, con reglas sobre lo que se hace, no sobre lo que se piensa."
  - Un enlace "Ofrecer tiempo o plata" a `/compromisos`.
- El catálogo legal suma el término `guardianes` ("Guardianes de la tierra"), copiado **textual** del objeto `LEGAL` del mock-up v6 (no es borrador). `pacto` ya existe.
- El modelo de territorio pasa de una lista de nombres a una lista de bienes con plata y horas opcionales.

## Fuera de alcance

- Aportar plata o horas a un bien desde la ficha (botón de pago o formulario propio): el enlace lleva al registro de compromisos que ya existe, sin preseleccionar el bien.
- El espejo real con datos del fiduciario o del Guardián (It.4).
- Bienes comunes de Chacras de Soluna o de otros territorios.
- La "barra de interés declarado" de la US-04 original: la reemplazan los medidores de plata y horas del mock-up v6.
- Avances por frente (Legal, Masterplan, Financiero, Comunidad) de la US-04: no hay datos en el mock-up v6; necesita fuente.
- Cambios en el mapa o en la ficha lateral del territorio.

## Capabilities

### New Capabilities
- `territorio-bienes-comunes`: los bienes comunes del territorio con la plata y las horas que necesitan y las que ya tienen comprometidas.

### Modified Capabilities

## Impact

`lib/territorios/` (tipo y datos de los bienes, y su test), `app/territorios/[id]/page.tsx` (sección de bienes comunes), `lib/legal/terminos.ts` (clave `guardianes`) y su test, `e2e/territorio.spec.ts` y `e2e/accesibilidad.spec.ts`. Reusa `components/medidor.tsx` y `components/termino-legal.tsx`. Sin dependencias nuevas.
