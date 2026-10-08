# Proposal

## Why

Gus quiere probar (*nice-to-have*, **no es parte del MVP**; se valida con el equipo antes de decidir si queda) que Compromisos sea la puerta a un **mercado** de ofertas y necesidades, sin entrar todavía en el detalle del Commitment Pool de la tokenomics. Decisiones de Gus del 8-oct-2026 (dictado sobre la app en producción). Fase de prototipo interno (ver `CLAUDE.md`).

## What Changes

- **Simplificar el registro:** *Ofrezco* o *Necesito*, una descripción y el **medio de intercambio** (Tiempo, Bienes, Plata, Trueque). **Se quita "Para quién":** el compromiso se publica en el mercado y quien esté interesado responde.
- **Vista del mercado** al lado (o debajo en el celular): tarjetas con las ofertas y necesidades publicadas (las de la persona más ejemplos de la comunidad), con filtros por Ofrezco/Necesito y por medio de intercambio, y un botón "Me interesa" (simulado).
- Un aviso visible: "Pronto, una inteligencia artificial va a sugerirte el mejor match entre ofertas y necesidades." (simulado, sin IA real).
- Un texto corto que deja claro que **el primer paso para entrar al mercado es publicar una oferta o una necesidad**.
- Sin imágenes.

**Fuera de alcance:** imágenes, notificaciones de respuestas, IA real, el detalle del Commitment Pool.

## Capabilities

### New Capabilities
- `compromisos-mercado`: ver specs.

### Modified Capabilities

## Impact

`app/compromisos/`, `lib/compromisos/`, e2e de compromisos.
