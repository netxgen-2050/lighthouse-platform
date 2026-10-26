# ADR-015 · Las páginas se ocultan en el navegador y los datos de personas se protegen en el servidor; la Vista NetX abre su relato a toda persona con sesión

- **Estado:** Propuesta
- **Fecha:** 2026-10-26
- **Cambio OpenSpec relacionado:** vista-netx-financiamiento (y vista-netx-modelo-financiamiento)

## Contexto
Gus (26-oct) abrió el relato de la Vista NetX (Resumen, Simulador, Modelo de financiamiento) a toda persona con sesión y dejó las operaciones (personas y roles, postulaciones, bandeja) solo para el super admin. Hoy quién ve qué página lo deciden componentes del navegador (`Puerta`, `SoloSuperAdmin`): ocultan la página, pero lo que arma el servidor viaja igual en la respuesta, y quien pida la dirección sin sesión puede leerlo en el código. La sesión vive en el navegador (token en cabecera), así que el servidor de la página no sabe quién pide. Hay que dejar escrito qué protege cada capa antes de que la vista la vea más gente.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · Seguir como hoy, sin escribir la regla | Cero trabajo | El próximo cambio puede poner datos de personas en una página "oculta" creyendo que está protegida |
| B · Ocultar en el navegador + regla: ninguna página lee datos de personas en su servidor; esos datos van solo por `/api/*` con la sesión verificada en el servidor (403); prueba e2e sin sesión y `noindex` | Una regla clara, probada, sin código de acceso nuevo; alcanza para números de ejemplo | El relato es legible para quien tenga el enlace, aunque no tenga sesión |
| C · Control en el servidor ya (sesión en cookie y layout que no renderiza sin permiso) | Lo que se ve es lo que se protege | Cambia cómo se maneja la sesión en toda la plataforma (Privy hoy, Neon Auth según ADR-009); es más de una noche y no hace falta para números de ejemplo |

## Decisión
**B.** Para el prototipo interno alcanza con que las páginas se oculten en el navegador, siempre que **ningún dato de personas** llegue por el servidor de una página: esos datos se leen solo por `/api/*` que verifica rol y persona en el servidor (como `/api/personas`). La Vista NetX suma `noindex` y un e2e sin sesión que comprueba que sus respuestas no traen emails.

## Consecuencias
- Ganamos: una regla simple que cualquier agente puede seguir y probar; el relato se abre al equipo sin código de acceso nuevo.
- Aceptamos: los números del relato (SAFE, TIR, reparto de las series) los puede leer cualquiera que tenga la dirección, con o sin sesión. Son ilustrativos de NS_Tokenomics y no tienen datos de personas.
- Aceptamos: "con sesión" no es "solo NetXGen" mientras el registro sea abierto (`LH_ACCESO` sin `lista`) ni en previews con modo de prueba (ADR-008).
- Revisar cuando: se muestre la plataforma fuera del equipo (R14); la bandeja, las postulaciones u otra operación pasen a la base; o una pestaña de `/netx` necesite un dato real o que no sea de ejemplo. En cualquiera de esos casos, se pasa a C.

- Actualización del 26-oct (opción B de Gus): las operaciones del super admin salen de la Vista NetX a `/admin`, que sí se protege en el servidor (ADR-016). La Vista NetX queda sin datos de personas y sigue con esta decisión.

## En palabras simples
Hoy la plataforma "tapa" las páginas en la pantalla, pero no las guarda bajo llave: quien sabe mirar el código de la página puede leer lo que está tapado. Para los números de ejemplo del relato de NetX eso está bien, y lo decimos en voz alta. Lo que sí está bajo llave son los datos de las personas (por ejemplo la lista de personas y roles): esos solo los entrega el servidor, y solo al super admin. Antes de mostrar la plataforma afuera, se cambia la tapa por una llave.

## Fuentes
- `components/sesion/puerta.tsx`, `components/sesion/solo-super-admin.tsx`, `app/api/personas/route.ts`, `lib/sesion/nivel.ts`, `lib/sesion/personas.ts` (leídos el 2026-10-26).
- `openspec/changes/vista-netx-financiamiento/design.md` §2 (quién ve qué).
- ADR-008 (previews sin datos reales) y ADR-009 (identidad).
- `CLAUDE.md`, "Fase de prototipo interno" (R14).
