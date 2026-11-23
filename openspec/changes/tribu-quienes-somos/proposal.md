# Proposal

## Why

En la consultoría del 23-oct-2026, Gus vio que falta una pieza básica de "Encontrarse": **ver quién está en la plataforma, en qué tribu, y si se conocen**. Bertrand mostró el patrón de la attestation "I met you" de EAS: yo afirmo que te conocí, pero **solo vale si vos lo confirmás**. Es la base del grafo de confianza (doc 10 de NS_Tokenomics: "Trust graph … revocable") y de los avales que hoy son solo un número de ejemplo en cada tribu. Conviene diseñarlo desde ya con la forma de una attestation (quién afirma, sobre quién, a qué apunta, si se retiró) para poder llevarlo a la base y, si se decide, a EAS, sin rehacer pantallas.

## What Changes

- **"Quiénes somos" en cada tribu** (sección en `/tribus/[id]`): las personas de la tribu con nombre de pila, inicial, rol en la tribu y círculo (si `fogon-gobernanza-fractal` ya está), y la marca "Se conocen", "Esperando que confirme" o nada.
  - Personas de ejemplo por tribu, en el repo (Lucía y Lucas del mock-up v6 más personas de ejemplo marcadas como tales). Las vacantes muestran "Todavía no hay personas en esta tribu".
- **Directorio "Personas"** (`/tribus/personas`): todas las personas visibles, con filtro por tribu y búsqueda por nombre.
- **Mostrarme o no:** la persona elige en Configuración "Mostrarme en el directorio de mi tribu" (**apagado por defecto**). Sin eso, no aparece en ninguna lista. Sin consentimiento aceptado (ADR-005), no hay opción: la sesión es anónima y no se muestra.
- **"Nos conocemos", con confirmación de las dos partes:**
  - A elige "Nos conocemos" en la tarjeta de B → queda "Esperando que confirme" para A, y B ve el pedido en su bandeja (`/bandeja`) con "Sí, nos conocemos" y "No la/lo conozco";
  - **solo con las dos afirmaciones** la relación cuenta y se muestra "Se conocen" para los dos;
  - cualquiera de los dos puede **retirarla** ("Ya no quiero mostrar que nos conocemos"): la relación deja de contar para los dos, sin borrar los registros;
  - en el prototipo, la respuesta de una persona de ejemplo se simula con "Simular que <nombre> confirma (simulado)".
- **Registros con forma de attestation** (preparado para attestations, ADR-012 en preparación): cada afirmación, confirmación y retiro es un registro de solo agregar con quién afirma, sobre quién, a qué registro apunta (la confirmación apunta a la afirmación; el retiro, a la relación), cuándo, y revocado o no. Viven en el navegador. Sin blockchain, sin wallets, sin firmas.
- Textos por los diccionarios es/en (ADR-004). ⚖ nuevo "Nos conocemos" (`borrador: true`): qué significa y qué no (no es un aval económico ni una garantía).

**Fuera de alcance:**
- **Costo anti-spam** por afirmación (en algunas apps de Base se paga ~1 USDC por attestation para que nadie "conozca" a todos): pregunta abierta, ver design. En este cambio no hay costo ni límite pagado.
- Avales de tribu (el número `avales` sigue siendo de ejemplo) y evaluación de pares: van con la discusión de Pactos (Collabberry) que Gus pidió aparte.
- Base de datos (va con `datos-en-la-nube`), notificaciones por email o Telegram, perfiles públicos fuera de la plataforma.
- Mostrar emails, teléfonos, ciudad o datos del pasaporte de otras personas: nunca.

## Capabilities

### New Capabilities
- `tribu-personas`: quién está en cada tribu, la visibilidad elegida por cada persona y la relación "nos conocemos" confirmada por las dos partes y revocable.

### Modified Capabilities

## Impact

`app/tribus/[id]/` (sección "Quiénes somos"), `app/tribus/personas/` (directorio), `app/bandeja/` (pedidos de "nos conocemos"), `app/configuracion/` (opción "Mostrarme"), `lib/personas-red/` (datos de ejemplo, relaciones y registros con tests), `lib/demo/claves.ts` (clave nueva, la borra "Borrar todo"), diccionarios es/en, `lib/legal/terminos.ts`, `lib/navegacion.ts` si el directorio va al rail, e2e nuevos. Sin dependencias nuevas. Toca datos de personas (aunque de ejemplo): revisión con la skill `revision-seguridad-datos`.
