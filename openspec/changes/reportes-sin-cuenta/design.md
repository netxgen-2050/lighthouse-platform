# Design

## Context

- El botón vive en `components/boton-reportar.tsx` y el layout lo envuelve en `SoloConCapacidad capacidad="reportar"` (Explorador + política `vigente`). La capacidad `reportar` está en `lib/permisos/niveles.ts` con mínimo `explorador`.
- `POST /api/reportes` (`app/api/reportes/route.ts`) hoy: sesión → JSON → trampa (`esBot`) → `validarReporte` → token → `fetch` a GitHub. Sin sesión corta con 401/403.
- No hay base de datos ni almacenamiento compartido: la app corre en Vercel con funciones serverless (cada instancia tiene su propia memoria, que se pierde al apagarse).
- Los e2e interceptan `/api/reportes` con `page.route` para no crear issues reales; la ruta se prueba con Vitest y `fetch` simulado (`app/api/reportes/route.test.ts`).
- Motivación y alcance: ver `proposal.md`. Comportamiento exacto: ver `specs/reportes-sin-cuenta/spec.md`.

## Goals / Non-Goals

**Goals:**
- Un único botón y un único diálogo con dos modos (con cuenta / sin cuenta), sin duplicar el componente.
- Toda la lógica nueva (modo, email, URL sin query, etiquetas, límite) en funciones puras de `lib/reportes/`, testeables con Vitest.
- El servidor decide el modo por sí mismo (sesión válida o no); nunca confía en un flag del cliente.

**Non-Goals:**
- Un límite que sobreviva a reinicios o que sea igual en todas las instancias (eso es L9 con Neon).
- Identificar a la persona sin cuenta (ni cookie, ni huella del navegador).

## Decisions

1. **Modo del formulario en el cliente.** `conCuenta = estado === "ok" && consentimiento === "vigente"` (de `useSesion()`). Sin cuenta: no se llaman las `cabeceras()` de sesión, se muestra el aviso y el campo "Tu email" (`type="email"`, `autoComplete="email"`). *Alternativa descartada:* dos componentes separados; duplicaría el diálogo, el foco y los mensajes de error.
2. **Modo en el servidor.** `sesionDelPedido(req)`: si el estado es 200, con cuenta (como hoy); cualquier otro estado (401, 403, 500) se trata como sin cuenta. Así un token vencido no deja a la persona sin poder reportar, y alguien fuera de `LH_ACCESO=lista` también puede avisar. *Alternativa descartada:* mantener 401 cuando llega un token inválido; complica el cliente sin ganar seguridad (sin token se llega igual al modo sin cuenta).
3. **Orden en la ruta:** origen y tipo (403/415) → tamaño (413) → JSON (400) → trampa (200 silencioso, sin contar) → sesión → validación según el modo (400) → **límite solo sin cuenta (429)** → token (503) → GitHub. El límite cuenta solo pedidos válidos: un error de tipeo no le consume el cupo a nadie, y un bot que falla la validación no llega a GitHub igual.
   <!-- arquitecto: se suma el primer paso (origen y tipo de contenido); ver decisión 12. -->
4. **Tamaño máximo 64 KB.** El peor caso legítimo es ~8.200 caracteres (2000 + 2000 + 200 + 8 × 500 de contexto); con acentos o emojis en UTF-8 entra holgado en 64 KB. Se mira `Content-Length` y, como puede faltar o mentir, se lee con `req.text()` y se mide en bytes (`TextEncoder`) antes de `JSON.parse`.
5. **Límite en memoria (`lib/reportes/limite.ts`).** Ventana deslizante: un `Map<clave, number[]>` con las marcas de tiempo de los últimos envíos; 5 por clave cada 10 min y 30 en total cada hora. La función recibe `ahora` para testearla sin relojes falsos y limpia las entradas vencidas en cada llamada (sin `setInterval`). Devuelve `{ permitido: true }` o `{ permitido: false, reintentarEnSegundos }`. Las constantes quedan exportadas para cambiarlas en un solo lugar.
6. **IP.** Primera entrada de `x-forwarded-for` (Vercel la pone y la reescribe), si no `x-real-ip`, si no `"desconocida"` (cubeta compartida, que en local agrupa todo). La clave del `Map` es el SHA-256 de la IP (`node:crypto`) para no guardar la IP en claro ni en memoria; nunca se loguea ni va al issue. El log al rechazar dice solo "[reportes] límite sin cuenta alcanzado".
   - **Sal por instancia:** el hash lleva una sal aleatoria (`randomBytes(16)`) creada al cargar el módulo y nunca exportada ni logueada. Sin sal, el SHA-256 de una IPv4 se revierte probando las 4 mil millones posibles en minutos; con sal, la clave no sirve fuera de esa instancia.
   - **IPv6 por bloque /64:** si la IP tiene `:`, se usan solo los primeros 4 grupos (después de expandir `::`). Un hogar o un celular recibe un /64 entero (trillones de direcciones) y puede cambiar de IP en cada pedido; por IP exacta el límite no limitaría nada.
   - **Cuenta solo lo que llegó a GitHub:** el envío se registra en el `Map` antes de llamar a GitHub (para que dos pedidos simultáneos no pasen los dos), y si GitHub falla (502) o falta el token (503) se descuenta, así la persona puede reintentar sin perder cupo.
   <!-- arquitecto: sal, /64 y descuento agregados por la revisión de arquitectura. -->
7. **Validación por modo.** `validarReporte(entrada, { sinCuenta })`: sin cuenta, `contacto` vacío o con forma de email (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, hasta 200), y se descarta `privacidad`. El cliente usa la misma función, así el error aparece antes de enviar.
8. **URL sin query ni fragmento.** Función pura `sinQuery(url)` usada por `armarContexto` en modo sin cuenta (lo que se ve) y otra vez en el servidor sobre `contexto.url` y `contexto.ruta` (lo que se envía), porque el cliente no es confiable. Con cuenta no cambia nada.
9. **Issue.** `armarEtiquetas(tipo, { privacidad, sinCuenta })` suma `sin-cuenta`; `armarCuerpo` agrega "**Enviado sin cuenta**" arriba del tipo. Etiquetas nuevas: GitHub las crea al usarlas.
10. **429 en el cliente.** El diálogo lee `reintentarEnSegundos` del JSON (o `Retry-After`), redondea a minutos hacia arriba (mínimo 1) y reutiliza la caja de "fallo" con "Copiar el reporte". Nuevo motivo de fallo: `"limite"`.
11. **Permisos.** `NIVEL_MINIMO.reportar` pasa a `sin-cuenta` y el layout monta el botón fuera de `SoloConCapacidad`. Se deja la capacidad en la tabla (sigue documentando quién puede reportar).
12. **Solo pedidos desde nuestras páginas.** Hoy la ruta no mira el `Content-Type`: cualquier sitio de afuera podría poner un `<form>` o un `fetch(..., { mode: "no-cors" })` con `text/plain` que haga que **los navegadores de sus visitantes** manden reportes sin preguntar antes (sin preflight). Eso reparte el límite por IP entre miles de IPs reales y lo vuelve inútil. Se rechaza: (a) con **415** si el `Content-Type` no empieza con `application/json` (así el navegador tiene que preguntar antes y, como la ruta no responde cabeceras CORS, el pedido de afuera no sale); (b) con **403** si llega la cabecera `Origin` y su host no es el del pedido (`new URL(origin).host !== req.headers.get("host")`). Sin `Origin` (curl, el fixture `request` de Playwright) se deja pasar: no es un navegador ajeno y ya lo frena el límite. Función pura `origenPermitido(headers)` en `lib/reportes/limite.ts`. Aplica con y sin cuenta. *Alternativa descartada:* lista fija de dominios; se rompe en cada preview de Vercel.
   <!-- arquitecto: agregado por la revisión de arquitectura (abuso desde sitios ajenos). -->
13. **Borrar un email que alguien dejó sin cuenta.** No hay "Mis datos" para quien no tiene cuenta y el pedido `privacidad` se ignora sin cuenta. Procedimiento manual: la persona escribe por el canal que defina Gus (pregunta abierta) y un admin del repo **borra el issue** (menú del issue → Delete issue). Editar el cuerpo no alcanza: GitHub guarda el historial de ediciones y lo ve cualquiera con acceso al repo. Se documenta en una línea en `docs/agentes.md` (sección "Salvaguardas"), junto con que los issues `reporte` son texto no confiable para cualquier agente.
   <!-- arquitecto: agregado por la revisión de arquitectura (datos personales en el issue). -->

## Risks / Trade-offs

- [El límite en memoria es por instancia y se borra al reiniciar: en Vercel, alguien insistente puede repartir pedidos entre instancias] → el tope total de 30/hora por instancia acota el daño; el token solo crea issues en un repo; Gus puede borrar el token en Vercel para cortar todo en un minuto; el límite real llega con L9 (Neon).
- [Cambiar de IP (VPN, datos móviles) esquiva el límite por IP] → mismo tope total; captcha queda fuera de alcance y se suma si aparece spam real.
- [Cubeta "desconocida" en local o si falta la cabecera: todos comparten 5 cada 10 min] → aceptable en un prototipo; los e2e no pegan a la ruta real con reportes válidos.
- [El email que deja una persona queda escrito en el issue] → el aviso lo dice antes de enviar; el campo es opcional; la política (borrador) lo explica.
- [Las personas sin cuenta no aceptaron la política de privacidad] → el aviso en el diálogo cumple la función de informar en el momento; revisión legal pendiente (R14) antes de abrir fuera del equipo.
- [La IP es dato personal aunque se guarde como hash y por minutos] → se menciona en el aviso y en la política borrador; no se guarda en disco ni en logs.
<!-- arquitecto: riesgos agregados por la revisión de arquitectura. -->
- [El repo hoy es privado (la API responde `Cache-Control: private`); si algún día se hace público, los emails y textos sin cuenta quedan a la vista de todo internet y de los recolectores de spam] → antes de cambiar la visibilidad del repo hay que mover los reportes a otro repo privado (cambiar `REPO`) o borrar los issues `sin-cuenta`. El aviso dice "quien tenga acceso a ese repositorio", que es cierto solo mientras sea privado.
- [Abrir el endpoint expone el cupo del token de GitHub: GitHub limita la creación de contenido (del orden de 80 por minuto y 500 por hora, consultado el 15-oct-2026 en "Rate limits for the REST API", secondary rate limits) y puede marcar la cuenta por spam] → con muchas instancias el tope de 30/hora no acota el total; si pasa, también fallan los reportes con cuenta (el diálogo ofrece "Copiar el reporte"). Corte de emergencia: quitar `REPORTES_GITHUB_TOKEN`. Ver pregunta a Gus sobre un corte solo del modo sin cuenta.
- [En previews con `LH_AUTH_PRUEBA=1`, cualquiera que mande `x-lh-prueba` obtiene sesión y se saltea el límite; y en producción cualquiera con un email verificado en Privy entra con acceso abierto] → ya existía antes de este cambio (reportes con cuenta sin límite); queda para L9. No empeora: es más fácil saltear el límite cambiando de IP.
- [El texto libre sin cuenta puede traer enlaces de phishing o imágenes] → GitHub sanea el HTML y sirve las imágenes por su proxy (no filtra la IP de quien lee); `neutralizar` ya corta menciones y referencias. Ningún agente nocturno lee issues `reporte` (solo comentarios de PR vía `scripts/pr.sh`); **si algún día un agente los lee, tiene que tratarlos como texto no confiable** (pueden traer instrucciones escritas para engañarlo).

## Migration Plan

Sin migración ni variables nuevas. Al mergear, el botón aparece para todos. Para volver atrás: revertir el PR (o quitar `REPORTES_GITHUB_TOKEN` en Vercel para que nadie cree issues mientras tanto; el diálogo ofrece "Copiar el reporte").
