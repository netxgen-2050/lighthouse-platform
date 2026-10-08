# Proposal

## Why

La nota 18 (§1, punto 3) propone **"Mi Raíz"**: un solo lugar con el estado de la persona en la red (su Pase, sus créditos, su presencia, sus Semillas y su voz). Hoy esos datos están dispersos entre `/sumarte`, `/congreso`, `/semillas`, `/canales` y `/panel`, y para el prototipo eso hace difícil mostrar **qué obtiene alguien que paga el Pase Fundador**. Con el Pase, los créditos y la presencia ya simulados, Mi Raíz cierra la historia "pagaste → esto es lo tuyo" sin datos nuevos: solo lee lo que ya guarda el navegador.

## What Changes

- Página nueva **`/mi-raiz`** ("Mi Raíz") con cinco bloques, cada uno con su ⚖ y un enlace a la pantalla donde se cambia:
  - **Tu pase:** plan actual y Pase Fundador (nivel o "Sin Pase Fundador"), leído de `/sumarte`.
  - **Créditos comunes y de estadía:** con Pase, el total asignado del nivel (Semilla USD 90 · Brote USD 450 · Raíz USD 1.500, "en 3 años"); disponible hoy y vencimientos como **"sin dato"**; sin Pase, "Los créditos vienen con el Pase Fundador".
  - **Presencia:** ticket, Genesis y días de presencia, leídos de `/congreso`.
  - **Semillas:** Semillas de tiempo de los 3 meses del pacto aceptado (mismo cálculo que `/semillas`) o "sin dato".
  - **Tu voz:** las tres puertas de voz del servicio de permisos (voz en la tribu, voz en el Fondo Común, voto en la Asamblea de residentes) con su estado en texto; el refuerzo por presencia sigue "a decidir".
- Aviso fijo: Mi Raíz no es una cuenta de plata; nada de lo que muestra se vende, se transfiere ni da rendimiento.
- ⚖ nuevo `miraiz` en `lib/legal/terminos.ts` con `borrador: true`.
- "Mi Raíz" en el rail de navegación y un enlace "Ver Mi Raíz" en Mi recorrido (`/panel`).

**Fuera de alcance:** canje de créditos, calendario de entrega y vencimiento de créditos (lo define el Guardián), separar créditos comunes de créditos de estadía, saldos on-chain o wallets (Privy), "Mi Raíz" de otra persona, avales, historial de movimientos, exportar datos. No guarda nada nuevo: es solo lectura.

## Capabilities

### New Capabilities
- `mi-raiz`: la vista única, de solo lectura, del estado de la persona en la red (pase, créditos, presencia, Semillas y voz).

### Modified Capabilities
(ninguna: `openspec/specs/` todavía está vacío; el enlace del rail y del panel quedan en `mi-raiz`)

## Impact

`app/mi-raiz/` (página y componente cliente), un módulo nuevo `lib/mi-raiz/` que reúne lecturas existentes (`lib/sumarte/estado.ts`, `lib/congreso/presencia.ts`, `lib/semillas/`, `lib/canales/`), `lib/navegacion.ts`, `app/panel/`, una clave nueva en `lib/legal/terminos.ts`, y e2e nuevos más accesibilidad. Sin dependencias nuevas. **Depende de `congreso-checkin-genesis`** (lectura de la presencia y `personaReal`).
