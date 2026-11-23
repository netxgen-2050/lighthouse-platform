# Design

## Sección Token Inversor

- Componente `app/netx/financiamiento/seccion-token-inversor.tsx` (servidor), como las demás secciones. Números leídos de `lib/bien-comun/barrio.ts` con los parámetros de partida de `BARRIO`: `montoALevantar`, `coberturaAFechaFija(…, 12)` y `(…, 24)`, `cobrandoConLasCuotas` (mes y total del caso base). La prima sale de `BARRIO.prima`.
- Plazo máximo: no está en el doc 34 → "sin dato".
- Textos en español, en el archivo de la sección (la página no es bilingüe hoy), sin números escritos.
- Arriba, el mismo texto de sello que `/bien-comun` (versión y fecha leídas de `VERSION_PROPUESTA`). Aviso de simulación con `TERMINOS.avisosimulador`.
- Va en el índice después de "Dinero temprano".
- Si `lib/bien-comun/barrio.ts` no existe todavía (cambio 2 sin implementar), se frena y se reporta: no se copian los cálculos.
- <!-- arquitecto: alcance del permiso --> **El permiso `vista-netx` oculta, no protege** (ADR-015): el HTML de `/netx/financiamiento` lo arma el servidor y la Puerta decide en el navegador. Por eso esta sección no suma nada que no esté ya en `/bien-comun` (que es pública): monto, cobertura, prima y mes del caso base, todos de ejemplo. Nada de nombres de inversores, montos comprometidos ni condiciones de una ronda real. Si algún día hace falta, eso pide protección en el servidor (como `/admin`, ADR-016), en otro cambio.
- <!-- arquitecto --> **Sumarte es pública:** la línea del Token Inversor es una frase y un enlace, sin números ni invitación a invertir ("en discusión, todavía no se ofrece").

## Barrido de contradicciones

Lista inicial (grep del 23-nov), que la tarea de barrido confirma y completa:

| Dónde | Hoy | Pasa a |
|---|---|---|
| `lib/idioma/textos/hibrido.ts` (es, `resto…`) | "El resto saldría de: token del bien común, ingresos del bien común…" | "FARO no levanta capital. El resto saldría de lo que el común produce (estadías, cocina, talleres), del prepago de servicios y de los barrios que sigan: sin dato." |
| `lib/idioma/textos/hibrido.ts` (en) | "commons token, commons income…" | equivalente en inglés |
| `lib/idioma/textos/bien-comun.ts` `enlace` | "El token del bien común: ver la simulación" | "El bien común y los tokens: ver la propuesta en discusión" |
| `app/netx/page.tsx` tarjeta "Bien común" | sin enlace | enlace a `/bien-comun` |
| `lib/idioma/textos/sumarte.ts` `invertir` | series y SAFU | se suma una línea sobre el Token Inversor en discusión |

Grep de control (palabra entera, porque "tramo" está dentro de "mostramos"): `grep -rniwE "tramos?|tranches?|staking" app components lib/idioma/textos lib/legal/terminos.ts` solo devuelve la clave `cambios` del diccionario del bien común. Los comentarios de `lib/sesion/rutas-publicas.ts` y `lib/idioma/rutas.ts` usan "tramo" como parte de una ruta y quedan fuera.

<!-- arquitecto: un solo vigilante --> El test de barrido nuevo y el test de promesas de `lib/lotes/sin-numeros-escritos.test.ts` (cambio 1) no tienen que pedir excepciones distintas para la misma palabra: la excepción es siempre la clave `cambios` del diccionario del bien común, definida una vez (constante compartida o importada) y usada por los dos.

El e2e del bien común busca el enlace por su nombre: hay que actualizarlo en `e2e/bien-comun.spec.ts` y `e2e/lotes.spec.ts`.
