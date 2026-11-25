# Design

## Context

- Las tribus (`lib/tribus/`) no tienen personas: solo `roles` y `avales` como números de ejemplo. El mock-up v6 trae dos personas (Lucía, Lucas) en `PEOPLE`.
- La membresía de la persona en una tribu existe en el navegador (`lib/membresia/`); la bandeja (`app/bandeja/`) ya recibe avisos simulados.
- ADR-005: sin consentimiento aceptado la sesión es anónima. ADR-001: lo que tiene valor va en libros de solo agregar.
- `fogon-gobernanza-fractal` define un `Registro` con forma de attestation en `lib/gobernanza/registros.ts`. Si ya está en `dev`, este cambio lo reutiliza; si no, crea el mismo tipo en `lib/personas-red/` y el que llegue segundo lo unifica (anotarlo en el PR).

## Goals / Non-Goals

**Goals:**
- Relación "nos conocemos" que solo vale con las dos partes, revocable y auditable.
- Privacidad por defecto: nadie aparece si no lo eligió.
- Registros copiables 1 a 1 a una tabla de la base o a una attestation real.

**Non-Goals:**
- Avales económicos, evaluación de pares, reputación con puntaje (van con la discusión de Pactos/Collabberry).
- Anti-spam pagado.

## Decisions

1. **Registros** (mismo tipo que `fogon-gobernanza-fractal`):
   `Registro = { id; esquema: "nos-conocemos" | "confirma" | "rechaza" | "revoca"; afirma; sobre; apuntaA: string | null; cuando }`.
   El estado de la relación entre A y B se **calcula** desde los registros: `pendiente` (afirmación sin respuesta), `activa` (afirmación + confirmación sin revocación), `rechazada`, `retirada`. Nada se guarda como estado editable.
   Alternativa descartada: una fila `relacion { a, b, estado }` editable (no deja historia, no se puede llevar a una attestation).
2. **Mapeo futuro a EAS** (solo documentado, no implementado): `nos-conocemos` = attestation de A con `recipient` B; `confirma` = attestation de B con `recipient` A y `refUID` a la de A; `revoca` = revocación de cualquiera de las dos. Así funciona el "I met you" que mostró Bertrand.
3. **Visibilidad**: `mostrarme: boolean` en la configuración de la persona (default `false`), guardado en el navegador. Las listas filtran por `mostrarme` y por consentimiento aceptado. Las personas de ejemplo tienen `ejemplo: true` y una marca visible "Ejemplo".
4. **Personas de ejemplo**: Lucía y Lucas del mock-up más 2 a 4 por tribu activa o en formación, solo con nombre de pila, inicial, rol y tribu; en `lib/personas-red/datos.ts`. Nada de edad, ciudad ni datos del pasaporte (aunque el mock-up los tenga).
5. **Simulación**: para responder por una persona de ejemplo, el botón "Simular que <nombre> confirma (simulado)" agrega el registro `confirma` con `afirma` = esa persona de ejemplo.
6. **Directorio**: `/tribus/personas` es una página nueva bajo Tribus (sin ítem nuevo en el rail; se llega desde `/tribus` con "Ver personas").

## Risks / Trade-offs

- [Grafo social = dato personal] → apagado por defecto, solo nombre de pila y rol, nada sale del navegador en este cambio; al ir a la base se agrega al inventario de datos (`NS_platform/Documentation/backend/01`).
- [Colusión o spam ("conozco a todos")] → en el prototipo no hay incentivo económico; la defensa (costo, límite, peso por confirmación) queda como pregunta abierta y se resuelve con la discusión de Pactos y evaluación de pares.
- [Doble tipo `Registro` si este cambio llega antes que la gobernanza] → design §Context: unificar en el segundo PR.

## Open Questions

- **Anti-spam**: ¿costo por afirmación (como las apps de Base que cobran ~1 USDC), límite por semana, o ninguno mientras no haya incentivo económico? Se decide antes de que "nos conocemos" pese en algo (avales, Semillas, acceso).
- ¿Quién ve el grafo completo (quién conoce a quién) en la versión real: solo las dos personas, la tribu, o todos? En el prototipo, cada persona ve solo sus propias relaciones y la marca "Se conocen" en tarjetas ajenas solo si es una de las dos partes.
