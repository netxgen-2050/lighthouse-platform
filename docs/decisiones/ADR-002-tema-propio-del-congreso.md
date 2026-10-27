# ADR-002 · El Congreso tiene un tema visual propio, encerrado en `/congreso` y en piezas portables

- **Estado:** Propuesta
- **Fecha:** 2026-10-14
- **Cambio OpenSpec relacionado:** `congreso-tema-evento` (base) y `congreso-vitrina` (página)
- **Nota 23-oct-2026:** el Congreso de febrero 2027 se canceló. La decisión no cambia; queda pendiente si `/congreso` se reutiliza para eventos de comunidad o se retira.

## Contexto
Gus necesita mostrarle al CEO y a un inversor el Congreso de febrero 2027 como una página de evento con fuerza de marketing, al estilo de las páginas de evento de UnityHub. La regla del repo es "solo tokens del tema" (los de NetX, en `app/globals.css`), y un test la vigila. Además, los organizadores podrían querer su propia página, fuera de NetX (servida por ellos o por UnityHub, con enlaces de vuelta a NetX), y NetX quiere conservar una vitrina dentro de su sección Congreso. Hay que decidir cómo se ve distinto sin desordenar el estilo de toda la plataforma, y cómo se arma para poder llevarlo afuera.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · Usar solo los tokens de NetX | Cero excepciones; un único sistema de estilo | No transmite la identidad del evento; en la versión real la página la diseña el organizador o UnityHub, así que la vitrina mostraría algo que no va a existir |
| B · Tema con alcance: tokens `--evento-*` solo dentro de `.tema-evento`, una única hoja en `app/congreso/`, vigilada por tests | Identidad propia; la excepción queda encerrada y se puede borrar en una carpeta; los tests impiden que se filtre al resto | Dos sistemas de estilo conviven; hay que mantener una tabla de contraste propia |
| C · Iframe de la página real del evento | Es "la de verdad" | Hoy está bloqueado (UnityHub tiene que habilitar el dominio); se ve pegado (dos estilos, scroll doble); no hay página real todavía |
| D · No hacerlo todavía | Nada que mantener | Gus no tiene qué mostrar en la reunión con el CEO y el inversor |

## Decisión
**B.** Es la única que muestra la identidad del evento hoy sin depender de nadie, y la excepción queda acotada: todo selector bajo `.tema-evento`, colores literales solo en declaraciones `--evento-*`, `--evento-*` prohibido fuera de `app/congreso/`, contraste AA verificado por un test propio. Las secciones del evento son **piezas portables** (`app/congreso/evento/`): reciben todo por props desde `obtenerEvento()` y no importan nada del marco de NetX (sesión, permisos, rail, barra, almacenamiento). Lo que es de NetX (ticket vinculado, tribus, sello Genesis, cinta de prototipo) vive aparte (`app/congreso/netx/`) y se enchufa solo en nuestra versión.

## Consecuencias
- Ganamos: una vitrina convincente, sin tocar el resto de la plataforma, y piezas listas para llevarse a otra página.
- Las piezas portables no importan el ⚖ (`TerminoLegal` usa la bitácora del navegador y el catálogo legal de NetX): reciben las marcas legales y las acciones ("Comprar", página oficial) por props, y las pone la página que las compone.
- Aceptamos: un segundo sistema de estilo (acotado) y una tabla de contraste más que mantener. `next/font` ata las fuentes a Next; fuera de Next habría que cambiar un archivo.
- **Opciones futuras, fuera de alcance hoy:** servir la vitrina fuera de NetX con (1) una ruta sin marco dentro de este mismo proyecto (por ejemplo un grupo de rutas con su propio layout), (2) un dominio propio apuntando a esa ruta, (3) un export estático de las piezas para que lo hospede el organizador, o (4) un iframe de nuestra vitrina en la página de UnityHub. Cada una requiere su propio cambio y una decisión de Gus.
- Revisar esta decisión: cuando el organizador o UnityHub publiquen la página oficial del evento (si la vitrina pasa a ser solo un resumen que enlaza a ella), o antes de mostrar la plataforma fuera del equipo (pendiente R14).

## En palabras simples
La página del Congreso va a tener "ropa propia" (colores y letras del evento), distinta de la de NetX, pero solo dentro de esa página: el menú de la izquierda y la barra de arriba siguen siendo de NetX. Unos tests automáticos cuidan que esos colores no se escapen al resto. Además, la página está armada como bloques de Lego: los bloques del evento se pueden llevar a otra web (por ejemplo, la de los organizadores), y los bloques de NetX (tu ticket, tu tribu, tu sello Genesis) se quedan acá.

## Fuentes
- `NS_platform/Documentation/integraciones/UnityHub/04 - Brief para el especificador · Congreso × UnityHub.md` (v3, 14-oct-2026), sección "Tema del evento".
- `NS_platform/Documentation/integraciones/UnityHub/01 - Guía de arquitectura (cómo planear integraciones).md`, secciones 1 (Idea 4: niveles de integración) y 2.
- Mock-up v2: `docs/referencia/congreso-unityhub-mockup-v2.html`.
- Página de evento de referencia: `app.unityhub.life/unityfest-2026/` (consultada por Gus el 14-oct-2026).
