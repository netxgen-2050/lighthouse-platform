# ADR-024 · Mientras el consejo no tenga representantes elegidos, quién es "del ámbito" en sus propuestas lo define el board de NetXGen; en el prototipo lo marca el super admin desde el navegador, y en la base lo registra el servidor

- **Estado:** Propuesta
- **Fecha:** 2026-10-29
- **Cambio OpenSpec relacionado:** `fogon-propuestas` (design §2 y §3b). Es una excepción acotada a ADR-022 ("ningún rol de la plataforma da por sí solo un nivel dentro de una propuesta"). Se apoya en ADR-015 (acceso en el navegador, datos en el servidor) y ADR-016 (cookie del super admin limitada a `/admin`). Se escribió como ADR-023 y pasó a 024 porque el manifiesto (ya en `dev`) usa ADR-023.

## Contexto
En una propuesta del consejo, "del ámbito" son sus representantes, y hoy ningún lugar tiene representante elegido. Gus decidió (29-oct, PR #132) que mientras tanto lo defina el board de NetXGen y que en el prototipo lo marque el super admin en su nombre. Eso hace que un rol de plataforma decida quién tiene voz en una deliberación, justo lo que ADR-022 evitaba. Además, la sesión del super admin real solo llega al servidor en `/admin` (ADR-016), así que la página de la propuesta no puede verificarla en el servidor.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer nada todavía: el ámbito del consejo queda vacío y nadie es "del ámbito" | Ningún rol de plataforma pesa en una decisión | Las propuestas del consejo no se pueden mostrar completas (quórum "sin dato", nadie bloquea) |
| B · Lista fija de ejemplo en los datos, sin control | Cero permisos nuevos | No se puede probar qué pasa cuando cambia el ámbito; no refleja la decisión de Gus |
| **C · Lista de ejemplo + control para el super admin, habilitado en el cliente con `useSesion()`; registros `ambito-consejo` en su navegador que solo se aplican si quien mira es super admin** | Muestra la decisión de Gus; no toca ADR-016; cuando haya base cambia un solo lugar | El control solo se oculta en el navegador; los cambios no se comparten con el equipo |
| D · Igual que C, pero verificado en el servidor con una cookie de super admin en `/` | Verificación real | Ensancha la cookie de ADR-016 a todo el sitio para proteger una simulación que no escribe nada en el servidor |

## Decisión
**C.** El control solo cambia el navegador del propio super admin, así que verificarlo en el servidor hoy no protege nada (ADR-015) y D agrandaría la superficie de la cookie del super admin sin beneficio.

Reglas:
- La excepción a ADR-022 es **solo** "definir quién es del ámbito en propuestas del consejo" y **solo** hasta que haya representantes elegidos. El super admin no gana ninguna otra acción ni nivel en la propuesta por su rol.
- **El super admin puede incluirse a sí mismo** en el ámbito (confirmado por Gus, 29-oct). Cada registro guarda quién hizo el cambio, y cuando se incluye a sí mismo la página lo dice ("se incluyó a sí mismo").
- Todo cambio dice "en nombre del board de NetXGen (simulado)" y queda en el historial.
- Un ámbito vacío es "sin dato": nunca un quórum de 0.
- **En el prototipo alcanza con que los cambios vivan en el navegador** del super admin (confirmado por Gus, 29-oct); no se comparten con el equipo.
- **En la base:** el cambio lo registra el servidor con la identidad verificada de quien actúa por el board, en una tabla de solo agregar; nunca se acepta del navegador. La lista vale por propuesta (o por período), no se edita hacia atrás en propuestas cerradas.

## Consecuencias
- Ganamos: se ve la regla de Gus funcionando, con quórum que cambia según el ámbito, sin tocar la protección de `/admin`.
- Aceptamos: en el prototipo, los cambios del super admin solo los ve el super admin; el resto ve la lista de ejemplo.
- Aceptamos un riesgo de gobernanza: una persona de NetXGen decide quién decide en el consejo, y puede incluirse, en tensión con el principio "Poder compartido". Se mitiga con la marca visible, el registro de quién lo hizo y el límite temporal.
- **Revisar:** cuando se elijan representantes del consejo, o antes de pasar las propuestas a la base.

## En palabras simples
Para decidir algo en el consejo hay que saber quiénes deciden. Como todavía no hay representantes elegidos, por ahora esa lista la arma el board de NetXGen, y en el prototipo Gus (como super admin) la puede tocar para probar. Por ejemplo, si Gus se agrega a la propuesta de la bomba, el ámbito pasa de 7 a 8 personas (el quórum sigue en 4), y la página dice que lo definió el super admin en nombre del board y que se incluyó a sí mismo. Es un permiso transitorio: cuando haya representantes, la lista sale de ellos.

## Fuentes
- `openspec/changes/fogon-propuestas/` (design §2, §3b y §4b; respuestas de Gus del 29-oct en PR #132).
- ADR-015, ADR-016, ADR-022; `lib/sesion/cookies.ts` (`path=/admin`); `components/sesion/solo-super-admin.tsx`.
