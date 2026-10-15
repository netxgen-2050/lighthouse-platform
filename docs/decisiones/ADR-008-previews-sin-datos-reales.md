# ADR-008 · Los previews nunca tienen datos reales: su rama de Neon no sale de producción, el modo de prueba solo acepta emails `.test` y Privy de previews es otra app

- **Estado:** Propuesta
- **Fecha:** 2026-10-15
- **Cambio OpenSpec relacionado:** fogon-cuadratico-en-la-base (primera prueba contra Neon en un preview); también consentimiento-en-la-base y base-neon

## Contexto
Con `fogon-cuadratico-en-la-base` producción va a tener los primeros datos reales que importan: emails, consentimientos y votos con su persona. Cada preview de Vercel tiene su rama de Neon, y la integración de Neon con Vercel, por defecto, crea esa rama **a partir de la rama principal**: una copia de producción (a verificar en su panel si se puede elegir otra rama madre). A la vez, para probar contra Neon el preview necesita el modo de prueba (`LH_AUTH_PRUEBA=1`), que deja ser **cualquier email** mandando una cabecera. Juntas, las dos cosas dejan que quien tenga la dirección del preview se haga pasar por una persona real y vea su voto, y que los agentes (que corren e2e contra previews) toquen datos de producción, cosa que `CLAUDE.md` prohíbe. La skill `base-de-datos` ya dice "nunca una copia de producción"; falta decidir cómo se garantiza.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada (ramas copiadas de producción, modo de prueba con cualquier email) | Cero trabajo; el preview "se parece" a producción | Un preview con modo de prueba es una puerta a los datos reales; los agentes trabajarían sobre datos reales |
| B · Rama madre sin datos reales para los previews (`previews`: migraciones + datos de ejemplo) | El preview nunca tiene nada real; los e2e siempre encuentran a las personas de prueba | Hay que configurarlo en la integración (si lo permite) y mantener los datos de ejemplo |
| C · Modo de prueba solo con emails `.test` (dominio reservado, nunca de una persona real) | Una línea de código con su test; protege aunque una rama tenga datos reales por error | Solo cierra la puerta del modo de prueba, no la copia de los datos |
| D · App de Privy aparte para previews | La cuenta de prueba de Privy nunca existe en producción; habilita el token de prueba sin pantalla | Una app más que configurar en Privy y en Vercel |
| E · No usar Neon en previews (PGlite también ahí) | Nada real en previews | PGlite en Vercel no comparte datos entre instancias; no prueba ni el driver ni la migración en Postgres de Neon |

## Decisión
**B + C + D.** B es lo que de verdad saca los datos reales de los previews; C es el cinturón por si B falla (una rama mal configurada, un `DATABASE_URL` con el alcance equivocado) y cuesta una línea; D evita una cuenta con código fijo en la app de producción. Si la integración de Neon no deja elegir la rama madre, se queda C + D y la prueba del preview contra Neon pasa a ser un guion manual sobre una rama creada a mano.

## Consecuencias
- Ganamos: un preview nunca puede mostrar el voto, el email ni el consentimiento de una persona real, aunque tenga el modo de prueba prendido.
- Ganamos: los agentes pueden correr e2e contra previews sin tocar datos de producción.
- Aceptamos: los previews no reproducen problemas que solo aparecen con los datos de producción; para eso, una rama a mano de Gus, nunca de un agente.
- Aceptamos: una segunda app de Privy (otro `appId`, otro secreto con alcance "Preview" en Vercel).
- Aceptamos: el modo de prueba ya no sirve con emails reales, tampoco en local (la fixtura ya usa `@prueba.test`).
- Revisar cuando: se muestre la plataforma fuera del equipo (R14), o si Neon cambia cómo crea las ramas de previews.

## En palabras simples
Cada versión de prueba de la plataforma (un "preview") tiene su propia copia de la base. Hoy esa copia saldría de la base real, con los emails y los votos del equipo, y en los previews hay un atajo para "entrar como" cualquier email sin contraseña. Decidimos tres cosas: las copias de prueba salen de una base con datos de ejemplo, nunca de la real; el atajo solo sirve con emails inventados que terminan en `.test`; y el login de los previews usa otra cuenta de Privy. Así, aunque alguien abra un preview, no puede ver cómo votó Martín.

## Fuentes
- `.claude/skills/base-de-datos/SKILL.md` (Ambientes: "nunca una copia de producción").
- `CLAUDE.md` (Seguridad: los agentes no tocan producción ni su base).
- `lib/sesion/personas.ts` (`modoPruebaActivo`) y `lib/sesion/verificar.ts` (`resolverSesion`), leídos el 15-oct-2026.
- `openspec/changes/base-neon/` (rama de Neon por preview, migraciones en el build) y `openspec/changes/fogon-cuadratico-en-la-base/design.md` §6.
- RFC 2606 (dominios reservados `.test`).
- Integración de Neon con Vercel: comportamiento por defecto de la rama madre según lo conocido a junio de 2026; **a verificar en su panel** antes de aceptar este ADR.
