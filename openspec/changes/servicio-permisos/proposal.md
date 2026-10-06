# Proposal

## Why

La nota 18 (§3) define que todo acceso (foros, salas de tribu, canal de fundadores, voz, voto, créditos) sale de un único **servicio de permisos** que combina cinco fuentes: plan, pase, tribu, presencia y rol. Es la pieza que después consultan el bot de Telegram, el Fogón y la Ronda 0. Conviene tenerla primero, como lógica pura y muy testeada, antes de que exista la base de datos.

## What Changes

- Un módulo `lib/permisos/` con una función pura que recibe el **estado de una persona** (plan, pase, tribus aceptadas, presencia Genesis, residencia) y devuelve, para cada **puerta** de la tabla de la nota 18, si está abierta, en qué grado (por ejemplo "Visita" o "solo su tribu") y **por qué motivo** (plan, pase, tribu, presencia, rol).
- La tabla de la nota 18 §3 transcrita como datos, no como `if` sueltos, para que se pueda auditar contra el documento.
- Tests que recorren **todas las celdas** de la tabla.
- Lo que la nota deja abierto queda explícito como "a decidir" y no como un número inventado: el refuerzo de la voz por presencia (×1,5 a ×2 con tope).

**Fuera de alcance:** base de datos, UI, bot de Telegram, cobros, emisión de pases.

## Capabilities

### New Capabilities
- `servicio-permisos`: qué puede hacer una persona según su plan, pase, tribu, presencia y rol, y por qué.

### Modified Capabilities

## Impact

Código nuevo en `lib/permisos/`. Sin dependencias, sin UI, sin variables de entorno.
