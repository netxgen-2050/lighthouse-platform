# Proposal

## Why

Estamos en fase de pruebas y revisión interna: Gus quiere que **cualquiera** que pruebe la plataforma pueda reportar un bug o una idea, también sin entrar. Hoy el botón Reportar solo aparece desde el nivel Explorador con la política de privacidad aceptada (`SoloConCapacidad capacidad="reportar"` en `app/layout.tsx`) y `POST /api/reportes` responde 401 sin sesión (`sesionDelPedido`), así que quien recorre las páginas públicas sin cuenta no tiene cómo avisar lo que ve. Pedido de Gus (15-oct-2026).

## What Changes

- **El botón Reportar se ve en todas las páginas para toda persona**, con o sin sesión, también en las públicas (`/`, `/tribus`, `/territorios/…`, `/sumarte`, `/privacidad`) y en la pantalla de consentimiento. Sigue siendo el mismo círculo con el bicho, usable con teclado.
- **Modo sin cuenta del formulario.** Cuando no hay una sesión con la política aceptada, el diálogo:
  - pide un **email opcional** ("Tu email", para responderte) en lugar de "Tu nombre o email", y valida que tenga forma de email si se completa;
  - avisa en palabras simples que **el reporte se publica como un issue en GitHub** que ve el equipo y quien tenga acceso a ese repositorio, que si deja el email queda escrito ahí, qué datos de contexto se envían (los que ya muestra "Esto se adjunta al reporte") y que la IP solo se usa un rato para limitar envíos y no va al issue.
- **Con sesión y política aceptada, sigue como hoy** (mismo texto, mismo envío con las cabeceras de sesión).
- **`POST /api/reportes` acepta pedidos sin sesión** con protecciones sin base de datos:
  - **tamaño máximo del cuerpo** (rechazo 413 antes de leerlo entero);
  - **campo trampa** (ya existe): se responde como si estuviera bien y no se crea nada;
  - **validación de entrada** (la de hoy, más el formato de email sin cuenta);
  - **límite por IP en memoria, por ventana de tiempo**, más un tope total sin cuenta por instancia; al pasarse responde **429** con cuánto esperar, y el diálogo lo dice en palabras simples sin perder lo escrito. Es un límite de mejor esfuerzo: el límite real por persona llega con Neon (backlog **L9**);
  - **etiqueta `sin-cuenta`** en el issue y una línea "Enviado sin cuenta" en el cuerpo;
  - **sin datos sensibles en el issue**: sin IP, sin cabeceras, sin cookies, y la URL y la ruta van **sin query ni fragmento** (pueden llevar códigos de login); el pedido de privacidad (`privacidad: true`, "borren mi cuenta") se ignora sin cuenta.
  - El token de GitHub sigue solo en el servidor.
- **Política de privacidad (borrador):** la fila "Reportar un problema o idea" suma que sin cuenta se usa la IP un rato solo para limitar envíos y que el reporte se publica como issue.

**Fuera de alcance:**
- Captcha o verificación de terceros (Turnstile, hCaptcha, reCAPTCHA).
- Límite persistente o por persona (backlog **L9**, con Neon) y cualquier almacenamiento (KV, Redis, Upstash).
- Límite para los reportes con sesión (siguen sin límite hasta L9).
- Hifa sin cuenta pasándole ideas al equipo (sigue como en `descubrir-publico`).
- Capturas de pantalla adjuntas, vista de reportes dentro de la app.
- Cambiar el aspecto del botón (spec `reportar-circulo`).

## Capabilities

### New Capabilities
- `reportes-sin-cuenta`: reportar sin sesión desde cualquier página, con aviso de publicación, contacto opcional por email y protecciones del servidor sin base de datos (tamaño, trampa, validación, límite por IP, etiqueta y datos mínimos).

### Modified Capabilities
<!-- Ninguna spec vigente cambia: `reportar-circulo` (aspecto) se mantiene. Los requisitos de `reportes` (cambio `reportes-bugs`) y de visibilidad del botón en `descubrir-publico` y `sumarte-acceso` todavía no están archivados; este cambio deja escrito que los reemplaza en lo que respecta a quién ve el botón. -->

## Impact

- `app/layout.tsx` (el botón deja de ir dentro de `SoloConCapacidad`), `components/boton-reportar.tsx` (modo sin cuenta, aviso, email, mensaje 429).
- `app/api/reportes/route.ts`, `lib/reportes/reporte.ts` (validación del email, etiqueta, URL sin query) y un módulo nuevo `lib/reportes/limite.ts` (límite en memoria).
- `lib/permisos/niveles.ts`: `reportar` pasa a `sin-cuenta`.
- `lib/privacidad/politica.ts` (texto borrador).
- Tests: `app/api/reportes/route.test.ts`, `lib/reportes/*.test.ts`, `e2e/reportes.spec.ts`; se actualizan los e2e que hoy afirman que Reportar no aparece sin cuenta o sin consentimiento (`e2e/descubrir-publico.spec.ts`, `e2e/privacidad.spec.ts`).
- Sin dependencias nuevas ni variables de entorno nuevas. Contradice lo escrito en `descubrir-publico` ("Reportar solo con sesión") y `sumarte-acceso` ("Reportar desde Explorador"): este cambio lo reemplaza por decisión de Gus.
