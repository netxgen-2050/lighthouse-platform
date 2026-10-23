# ADR-003 · El Congreso es bilingüe en `/congreso/en`, con diccionarios propios y sin librería de traducciones

- **Estado:** Propuesta
- **Fecha:** 2026-10-14
- **Cambio OpenSpec relacionado:** congreso-bilingue
- **Nota 23-oct-2026:** el Congreso de febrero 2027 se canceló. La decisión no cambia (los diccionarios propios siguen como base de ADR-004); queda pendiente si `/congreso/en` se reutiliza o se retira.

## Contexto
Gus pidió la página del Congreso en inglés para inversores del exterior, sin traducir el resto de la plataforma. La página de los organizadores va a enlazar a la versión en inglés: esa dirección, una vez publicada, cuesta cambiarla (romperíamos enlaces impresos, mails y la página oficial). Además, elegir ahora cómo se guardan los textos condiciona cómo se traduce la plataforma entera el día que se decida.

## Opciones
| Opción | A favor | En contra |
|---|---|---|
| A · `/congreso/en` + diccionarios tipados propios (`lib/congreso/interfaz.ts`, `netx/textos.ts`) | Dirección corta para los organizadores; sin dependencias; TypeScript obliga a que el inglés tenga todas las claves; se limita a `/congreso` | Dos maneras de manejar textos en el repo; si la plataforma entera pasa a i18n con prefijo (`/en/...`), esta dirección queda distinta y hay que mantenerla como redirección |
| B · Librería de i18n (por ejemplo next-intl) con prefijo `/en/congreso` desde ahora | Mismo esquema que tendría la plataforma bilingüe; no habría que migrar | Toca el layout y el ruteo de toda la app para una sola página; trae una dependencia y una decisión que todavía no se tomó; más grande que una noche |
| C · `?lang=en` en la misma dirección | Ninguna ruta nueva | Enlace largo y frágil con UTM y anclas; peor para buscadores; la dirección deja de decir qué idioma es |
| D · No hacer nada todavía (solo español) | Cero costo | No cumple el pedido: el inversor del exterior llega a una página en español |

## Decisión
Opción A. Es la más chica que cumple el pedido y deja la puerta abierta: los textos ya quedan separados en `{ es, en }`, así que migrarlos a una librería es mecánico. La dirección `/congreso/en` se trata como **promesa pública**: si algún día se adopta otro esquema, se mantiene como redirección permanente.

## Consecuencias
- Ganamos una versión en inglés enlazable en una noche, sin tocar el resto de la plataforma.
- Aceptamos dos sistemas de textos (el del Congreso con diccionarios y el resto en español fijo) y una persona en inglés que cae en páginas en español (Sumarte, política de privacidad, mapa), avisado en los enlaces.
- Los ⚖ en inglés son todos borrador y la bitácora lo registra así.
- Revisar cuando se decida traducir otra parte de la plataforma (Sumarte o la política de privacidad son las primeras candidatas): ahí se escribe el ADR de i18n general y este queda reemplazado.

## En palabras simples
La página del Congreso va a tener una versión en inglés en una dirección propia, `/congreso/en`, que los organizadores pueden poner en su web. Los textos en inglés viven al lado de los en español, y un test avisa si falta alguno. El resto de NetX sigue en español por ahora. Esa dirección no la vamos a cambiar después: si un día traducimos toda la plataforma, `/congreso/en` va a seguir funcionando y llevando al lugar correcto.
