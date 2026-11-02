# ADR-028 · NetX muestra los eventos y guarda una intención personal de ir; la inscripción de verdad no se construye todavía y UnityHub sigue como posible capa de convocatoria

- **Estado:** Propuesta
- **Fecha:** 2026-11-02
- **Cambio OpenSpec relacionado:** `eventos` (decisión 10 de su design) y `eventos-reemplaza-congreso`. Precisa la regla 4 de ADR-013, que también está en Propuesta.

## Contexto
ADR-013 propone que la convocatoria a eventos sea de UnityHub y pide un ADR para cada función que se superponga. La nota 20 (§4) también ubica ahí el calendario y la inscripción, "si se acepta el ADR-013". El 2-nov-2026 Gus decidió reemplazar el Congreso por una página de Eventos dentro de NetX, con un botón "Quiero ir". Sin un reparto claro, la misma lista de eventos y las mismas personas anotadas podrían terminar en dos lugares que no coinciden.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · No hacer la página: enlazar directo a UnityHub | Nada que duplicar | ADR-013 sigue sin aceptar; UnityHub todavía no publica una API (verificado el 23-oct-2026); la salida al mercado queda atada a un proveedor pre-seed |
| B · Página en NetX con eventos de ejemplo e intención personal en el navegador; la inscripción de verdad queda para otra decisión | Se prueba hoy sin depender de nadie; nada se manda a un tercero; se puede retirar | Quien organiza no ve las intenciones, así que no sirve para organizar un evento real |
| C · Inscripción completa en NetX, con cupos y lista de asistentes | NetX tiene el dato para las constancias de presencia | Duplica lo que ADR-013 le da a UnityHub; pide base de datos, permisos del organizador y más datos personales; no entra en una noche |
| D · Integrar ya con UnityHub | Una sola agenda | Sin API de solo lectura; su MCP actúa con todos los permisos del usuario y ADR-013 lo prohíbe en producción |

## Decisión
**B.** Es la versión más chica que muestra la dirección nueva y deja abiertas las otras. El reparto propuesto:

| Dato | Quién manda hoy | Si llega una integración |
|---|---|---|
| El evento (nombre, fecha, lugar, cupo) | NetX, en un archivo de ejemplo que se lee solo por `obtenerEventos` | Lo decide Gus. Si manda otro servicio, NetX copia lo mínimo con `proveedor`, `id_externo` y `sincronizado_at`, y conserva su propio `id` |
| "Quiero ir" | La persona, en su navegador | Es de NetX. Con la base, el servidor toma a la persona de la sesión y exige consentimiento vigente (ADR-005) |
| Inscripción y cupo real | Nadie: no existe | Lo decide Gus |
| Presencia | Nadie: no existe | La confirma quien organiza y la constancia la emite NetX (ADR-012, ADR-013, nota 20 §5) |

## Consecuencias
- Ganamos: una página para mostrar hoy, sin credenciales ni datos personales en un tercero. Si cambia la fuente, las pantallas no cambian.
- Aceptamos: "Quiero ir" no avisa a nadie. La página lo dice con palabras, porque alguien podría creer que quien organiza ya lo sabe.
- Aceptamos: la intención no pasa a otro navegador ni a otro dispositivo, igual que el resto del prototipo.
- Riesgo: si se publica un evento real en NetX y también en UnityHub sin definir cuál manda, las fechas pueden no coincidir. Mientras tanto, la lista trae solo ejemplos marcados.
- Cuando la agenda venga de afuera, la pantalla tiene que distinguir "no pudimos cargar" de "no hay eventos", y mostrar la última copia con su fecha (skill `integracion-externa`).
- Revisar: antes de publicar el primer evento real, cuando Gus decida sobre ADR-013, cuando UnityHub publique su API v1 o cuando se especifique el check-in (P3, D31).

## En palabras simples
La página de Eventos es como una cartelera en la entrada: mostramos qué hay y cada persona se anota en su propia libreta que quiere ir. Nadie más ve esa libreta, ni siquiera quien organiza, y por eso la página lo aclara. Si Ana dice "Quiero ir" a la minga, eso no le guarda un lugar: para organizar un evento real va a hacer falta una inscripción, y este ADR deja esa decisión para más adelante. También queda abierto si la cartelera se llena desde UnityHub, pero cambiar eso no obliga a rehacer las pantallas.

## Fuentes
- `openspec/changes/eventos/` (proposal y design, decisiones 1, 4 y 10).
- ADR-005, ADR-012 y ADR-013; skill `integracion-externa`.
- `NS_platform/Documentation/20 - Estrategia de eventos de comunidad (post Congreso).md`, §4 y §5.
- `NS_platform/Documentation/Desarrollo/08 - Backlog de producto.md`: D16, D26, D31 y P3.
