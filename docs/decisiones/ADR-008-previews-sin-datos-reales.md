# ADR-008 · Los previews nunca tienen datos reales: su rama de Neon sale de una rama `previews` sin datos reales y el modo de prueba solo acepta emails `.test`

- **Estado:** Aceptada (Gus eligió B + C el 2026-10-15; D descartada porque ADR-009 cambia el login a Neon Auth)
- **Fecha:** 2026-10-15 (propuesta y aceptación)
- **Cambio OpenSpec relacionado:** base-neon (rama `previews`, datos de ejemplo y regla `.test`); también login-neon-auth (Neon Auth en previews), consentimiento-en-la-base y fogon-cuadratico-en-la-base

## Contexto
Con `fogon-cuadratico-en-la-base` producción va a tener los primeros datos reales que importan: emails, consentimientos y votos con su persona. Cada preview de Vercel tiene su rama de Neon, y la integración de Neon con Vercel, por defecto, crea esa rama **a partir de la rama principal**: una copia de producción (a verificar en su panel si se puede elegir otra rama madre). A la vez, para probar contra Neon el preview necesita el modo de prueba (`LH_AUTH_PRUEBA=1`), que deja ser **cualquier email** mandando una cabecera. Juntas, las dos cosas dejan que quien tenga la dirección del preview se haga pasar por una persona real y vea su voto, y que los agentes (que corren e2e contra previews) toquen datos de producción, cosa que `CLAUDE.md` prohíbe. Con Neon Auth (ADR-009) se suma un tercer motivo: cada rama copia también los **usuarios y sesiones de login** de su rama madre. La skill `base-de-datos` ya dice "nunca una copia de producción"; faltaba decidir cómo se garantiza.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada (ramas copiadas de producción, modo de prueba con cualquier email) | Cero trabajo; el preview "se parece" a producción | Un preview con modo de prueba es una puerta a los datos reales; los agentes trabajarían sobre datos reales; con Neon Auth, cada preview copiaría los emails y sesiones reales |
| B · Rama madre sin datos reales para los previews (`previews`: migraciones + datos de ejemplo) | El preview nunca tiene nada real; los e2e siempre encuentran a las personas de prueba; con Neon Auth, los previews traen solo usuarios de prueba | Hay que configurarlo en la integración (si lo permite) y mantener los datos de ejemplo |
| C · Modo de prueba solo con emails `.test` (dominio reservado, nunca de una persona real) | Una línea de código con su test; protege aunque una rama tenga datos reales por error | Solo cierra la puerta del modo de prueba, no la copia de los datos |
| D · App de Privy aparte para previews | La cuenta de prueba de Privy nunca existe en producción | Una app más que configurar; **deja de tener sentido con ADR-009** (el login pasa a Neon Auth, que ya se separa por rama) |
| E · No usar Neon en previews (PGlite también ahí) | Nada real en previews | PGlite en Vercel no comparte datos entre instancias; no prueba ni el driver ni la migración en Postgres de Neon |

## Decisión
**B + C** (decisión de Gus, 15-oct-2026). B es lo que de verdad saca los datos reales de los previews; C es el cinturón por si B falla (una rama mal configurada, un `DATABASE_URL` con el alcance equivocado) y cuesta una línea. **D queda descartada**: con ADR-009 el login pasa a Neon Auth, y Neon Auth vive en cada rama de la base, así que la rama `previews` de B ya trae sus propios usuarios de prueba; no hace falta una segunda app de login. El equivalente de D con Neon Auth es parte de B: los usuarios de prueba de Neon Auth se crean **solo en la rama `previews`** (detalle en `login-neon-auth`).

**Si la integración de Neon no deja elegir la rama madre** (plan B): Gus desactiva la creación automática de ramas por preview y carga a mano, en Vercel, un `DATABASE_URL` con alcance "Preview" que apunta a la rama `previews` (una sola rama compartida por todos los previews). Si tampoco eso se puede, queda solo C y la prueba de los previews contra Neon pasa a ser un guion manual sobre una rama creada a mano por Gus. En cualquiera de los dos casos, **Neon Auth no se activa en producción** hasta que los previews no copien datos reales (ADR-009, punto 4).

## Consecuencias
- Ganamos: un preview nunca puede mostrar el voto, el email ni el consentimiento de una persona real, aunque tenga el modo de prueba prendido.
- Ganamos: los agentes pueden correr e2e contra previews sin tocar datos de producción.
- Ganamos: con Neon Auth, los previews pueden probar el login real con usuarios de prueba de la rama `previews`, sin una segunda app.
- Aceptamos: los previews no reproducen problemas que solo aparecen con los datos de producción; para eso, una rama a mano de Gus, nunca de un agente.
- Aceptamos: hay que mantener la rama `previews` (el script de datos de ejemplo de `base-neon` la llena; las migraciones nuevas las aplica cada preview en su build).
- Aceptamos: el modo de prueba ya no sirve con emails reales, tampoco en local (la fixtura ya usa `@prueba.test`).
- Aceptamos (plan B): si todos los previews comparten la rama `previews`, dos PRs con migraciones distintas pueden chocar en esa rama; se resuelve recreando la rama desde cero con el script.
- Revisar cuando: se muestre la plataforma fuera del equipo (R14), si Neon cambia cómo crea las ramas de previews, o si la integración resulta no dejar elegir la rama madre.

## En palabras simples
Cada versión de prueba de la plataforma (un "preview") tiene su propia copia de la base. Si esa copia saliera de la base real, traería los emails, los votos y hasta las cuentas de login del equipo, y en los previews hay un atajo para "entrar como" cualquier email sin contraseña. Decidimos dos cosas: las copias de prueba salen de una base con personas inventadas (por ejemplo `super@prueba.test`), nunca de la real; y el atajo solo sirve con emails inventados que terminan en `.test`. Así, aunque alguien abra un preview, no puede entrar como Martín, ver los datos del equipo ni votar en su nombre.

## Fuentes
- Decisión de Gus del 15-oct-2026 (B + C; D descartada por ADR-009), transmitida en la corrida del especificador del 15-oct-2026.
- `docs/decisiones/ADR-009-identidad-privy-o-neon-auth.md` (Neon Auth por rama: "copia los usuarios y sesiones de la rama madre"; punto 4 de la decisión).
- `.claude/skills/base-de-datos/SKILL.md` (Ambientes: "nunca una copia de producción").
- `CLAUDE.md` (Seguridad: los agentes no tocan producción ni su base).
- `lib/sesion/personas.ts` (`modoPruebaActivo`) y `lib/sesion/verificar.ts` (`resolverSesion`), leídos el 15-oct-2026.
- `openspec/changes/base-neon/` (rama `previews`, datos de ejemplo, regla `.test`) y `openspec/changes/fogon-cuadratico-en-la-base/design.md` §6.
- RFC 2606 (dominios reservados `.test`).
- Integración de Neon con Vercel: si deja elegir la rama madre de los previews **sigue sin verificar** (no se pudo leer su panel ni su documentación desde la nube el 15-oct-2026); lo verifica Gus con los pasos de `base-neon`.
