# Design

## Context

Cuatro componentes cliente escriben en `localStorage`: `app/perfil/entrevista.tsx`, `app/compromisos/formulario.tsx`, `app/congreso/registro-ticket.tsx` (con `CLAVES` de `lib/demo/claves.ts`) y `app/sumarte/sumarte-cliente.tsx` (con una constante propia, `"lh-sumarte"`). `lib/demo/borrar.ts` borra las claves de `CLAVES` y lo usa `/panel`. El catálogo `lib/legal/terminos.ts` es un objeto `as const` con `titulo` y `texto`.

## Goals / Non-Goals

**Goals:** un único punto que decide si se puede guardar; un aviso reutilizable; una página de privacidad; marca de borrador en el catálogo.

**Non-Goals:** almacenamiento en servidor, vencimiento, analítica.

## Decisions

1. **`lib/demo/consentimiento.ts`** (lógica pura + acceso a `localStorage` aislado): `VERSION_CONSENTIMIENTO` (entero, arranca en 1), `leerConsentimiento(crudo)` → `{ fecha, version } | null` (inválido o versión vieja → `null`), y `guardarSiHayOk(clave, valor)` que escribe solo si hay OK vigente. Clave nueva `CLAVES.consentimiento = "lh-consentimiento"`.
2. **Hook `useConsentimiento()`** en un componente cliente: devuelve `{ ok, aceptar, retirar }` y escucha el evento `storage` para que dos pestañas queden sincronizadas. Las cuatro pantallas reemplazan su `localStorage.setItem` por `guardarSiHayOk` y renderizan `<AvisoConsentimiento />` arriba de su contenido. Al aceptar, cada pantalla guarda su estado actual en memoria (así no se pierde lo hecho antes del OK).
3. **Sumarte entra a `CLAVES`** como `CLAVES.sumarte = "lh-sumarte"` (mismo valor, para no perder lo guardado). Si `canales-acceso` ya lo hizo, se reutiliza. Con eso `borrarTodo()` de `lib/demo/borrar.ts` borra Sumarte y el OK sin cambios en `/panel`.
4. **Aviso no modal**: una región (`role="region"`, `aria-label="Permiso para guardar"`) en el flujo de la página, no un diálogo. Motivo: no bloquear la exploración y evitar trampas de foco.
5. **Catálogo con borrador**: el tipo de cada término pasa a `{ titulo: string; texto: string; borrador?: true }` (validado con `satisfies Record<string, Termino>` para no perder las claves literales). `TerminoLegal` agrega la línea "Borrador: texto a revisar" cuando `borrador` es `true`. El test del catálogo verifica que `datos` es borrador y que los términos copiados del mock-up no lo son.
6. **Texto del ⚖ `datos` (borrador, redactado por el agente):** "Tus datos personales están protegidos por la Ley 25.326. Solo se usan para lo que aceptaste, podés pedir verlos, corregirlos o borrarlos cuando quieras, y no te pedimos datos sensibles (salud, creencias, origen). En este prototipo nada sale de tu navegador."

## Risks / Trade-offs

- [Los e2e existentes guardan datos y van a fallar] → un helper de Playwright `darOk(page)` que acepta el aviso; se ajustan los specs de perfil, compromisos, congreso, sumarte y panel en el mismo PR.
- [Conflicto con `canales-acceso` en `lib/demo/claves.ts`] → los dos usan el mismo nombre y valor (`CLAVES.sumarte = "lh-sumarte"`); el segundo en mergearse lo reutiliza.
- [Texto legal sin revisar] → `borrador: true` y "Borrador para revisión" en la página; vuelve a revisión con R14.
