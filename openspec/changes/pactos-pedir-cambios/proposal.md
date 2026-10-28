# Proposal

## Why

Con `pactos-dos-partes` la tribu solo puede aceptar o no aceptar. Pero lo más común no es un sí o un no: es "nos sirve, pero con 16 h/mes en lugar de 32". La nota 16 §2.2 de `NS_platform` dice que cada parte "propone cambios y acepta", y en la consultoría web3 del 23-oct (punto 3) se pidió que la tribu pueda negociar. Este cambio completa el ida y vuelta: la tribu devuelve una contrapropuesta y la persona la acepta o retira su pacto. **Depende de `pactos-dos-partes`** (usa sus constancias y su vista de la tribu).

## What Changes

- **"Pedir cambios" en la vista de la tribu** (`/pactos/responder`), junto a "Aceptar" y "No aceptar": quien lidera elige otras **horas por mes** y escribe un **mensaje** (obligatorio). Funciona para un pacto nuevo y para un cambio a un pacto aceptado.
- **La contrapropuesta es una propuesta de la tribu**: queda como constancia `pacto-propone` que afirma la tribu, apunta a la propuesta de la persona y lleva la versión, las horas y el mensaje. La propuesta de la persona deja de estar pendiente; la de la tribu queda pendiente **del lado de la persona**.
- **En `/pactos`, la persona ve "Valle Solar pide cambios"** con lo que propuso ella, lo que propone la tribu y el mensaje, y dos botones:
  - **"Aceptar los cambios"**: la persona afirma la aceptación de la contrapropuesta; el pacto (o el cambio) queda aceptado con esas horas y el número de versión siguiente.
  - **"Retirar"**: revoca su propuesta; el pacto vuelve a Borrador con **su** contenido (o el cambio vuelve a borrador del cambio), para editarlo y volver a enviarlo si quiere.
- **La tribu ve el estado** de lo que pidió ("Esperando que <persona> responda tus cambios") en una sección aparte de `/pactos/responder`, sin botones.
- Mi recorrido: "Valle Solar pidió cambios a tu pacto" (al conciliar, una sola vez).
- Textos es/en. El ⚖ `pactoDosPartes` sigue en el estado "Aceptado"; no hace falta uno nuevo.

**Fuera de alcance:**
- Que la tribu cambie el **rol** o la **descripción** (es el texto de la persona): lo pide en el mensaje, y la persona retira y edita.
- Más de una vuelta automática (la persona no contrapropone a la contrapropuesta: retira, edita y vuelve a enviar).
- Comentarios en hilo, notificaciones reales, la base, firmas y cadena (igual que `pactos-dos-partes`).

## Capabilities

### New Capabilities

### Modified Capabilities
- `pactos-acuerdo`: se suma "pedir cambios" a las respuestas de la tribu y "aceptar los cambios" o "retirar" del lado de la persona. (La capability la crea `pactos-dos-partes`; este cambio se archiva después de ese.)

## Impact

`lib/pactos/constancias.ts` (contrapropuesta: pendiente del lado de la persona; acordada con la aceptación de la persona), `lib/pactos/estado.ts` (`conciliar` con contrapropuesta y acción `aceptarCambiosDeLaTribu`), `app/pactos/pactos-cliente.tsx`, `app/pactos/responder/`, `lib/idioma/textos/pactos.ts`, `lib/actividad/eventos.ts`, `e2e/pactos-dos-partes.spec.ts`.
