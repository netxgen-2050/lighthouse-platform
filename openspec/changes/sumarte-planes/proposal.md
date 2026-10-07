# Proposal

## Why

El prototipo tiene que dejar claro que la plataforma **va a captar plata de inversores y usuarios** (decisión de Gus, 7-oct-2026). La pantalla "Sumarte" del mock-up v6 lo muestra entera: los planes de usuarios (Explorador, Miembro, Pase Fundador, Plan Tribu) y la sección "Para inversores" (sumarte al proyecto del Lote 7 por invitación, e invertir en NetX como empresa).

## What Changes

- Página `/sumarte` copiada de `V.sumarte` del mock-up v6 (`docs/referencia/netx-tribus-mockup-v6.html`), con sus datos (`PASSES`, `COHORT`, la tabla "Qué incluye cada plan", y `EMISION` para el círculo de inversores):
  - Selector Mensual / Anual para la membresía (USD 10/mes o USD 100/año).
  - Cuatro planes: Explorador (gratis), Miembro de la red, **Pase Fundador** (Semilla USD 300 · Brote USD 1.500 · Raíz USD 5.000, cohorte Génesis, medidores "Pases de la cohorte" y "Mínimo para abrir el Fondo Común") y Plan Tribu (USD 60/mes).
  - Tabla comparativa de planes.
  - **"Para inversores"**: "Sumarte al proyecto del Lote 7" (por invitación, con los medidores de lugares del círculo y el botón "Pedir invitación") e "Invertir en NetX como empresa" ("Pedir una charla").
- Todo es **simulado**: elegir un plan, el pase o pedir una invitación se guarda solo en el navegador y muestra "(simulado)". No hay pagos.
- Los ⚖ de la pantalla (`membresia`, `semillas`, `pasefundador`, `guardian`, `ronda0`, `creditos`, `plantribu`, `circulo`, `sumarte`, `caja`, `espejo`, `safe`, `hacienda`) se copian del objeto `LEGAL` del mock-up al catálogo.
- Enlace a `/sumarte` en la navegación (si `navegacion-rail` ya está en la base, como un ítem del rail; si no, en el encabezado).

**Fuera de alcance:** cobros reales, pasarela de pago, KYC, residencia fiscal real (la elegibilidad de inversor se muestra como "disponible" con datos de ejemplo).

## Capabilities

### New Capabilities
- `sumarte`: los planes para usuarios y el acceso para inversores, en modo simulado.

### Modified Capabilities

## Impact

`app/sumarte/`, `lib/sumarte/` (datos y estado), claves nuevas en `lib/legal/terminos.ts` y su test, y la navegación. Sin dependencias nuevas.
