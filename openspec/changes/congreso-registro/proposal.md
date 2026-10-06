# Proposal

## Why

El Congreso de febrero 2027 es el momento de lanzamiento. La plataforma no vende el ticket (lo vende el organizador), pero sí lo **registra** para conectar la presencia con el perfil y dar el registro Genesis (nota 18, punto 2). Queremos la página del Congreso visible en el preview, con la agenda y el registro del ticket en **modo demostración**.

## What Changes

- Página `/congreso` con: título, explicación, agenda de 5 días (del mock-up v6), registro del código de ticket con validación de formato y explicación de Genesis.
- El registro del ticket es **demostración**: se guarda solo en el navegador, con un aviso visible, y no llama a ninguna API ni ticketera.
- Tres términos ⚖ nuevos en el catálogo, copiados **textualmente** del mock-up v6: `ticket`, `presencia`, `obra`.

**Fuera de alcance:** precio del Congreso o del glamping, check-in real, QR, integración con Luma u otra ticketera, insignia on-chain.

## Capabilities

### New Capabilities
- `congreso`: la página del evento y el registro de ticket (modo demostración).

### Modified Capabilities

## Impact

`app/congreso/`, `lib/congreso/`, y tres claves nuevas en `lib/legal/terminos.ts` (y su test, que hoy espera solo dos claves).
