# Proposal

## Why

La It.1 "Explorar" incluye la regla de cumplimiento **C16** (datos personales, Ley 25.326: consentimiento explícito, minimización, datos sensibles separados; nota Desarrollo/03 y roadmap Desarrollo/06). Hoy ya hay **cuatro pantallas** que guardan cosas de la persona en el navegador (perfil, compromisos, ticket del Congreso y Sumarte) y ninguna pide permiso antes, ni hay un lugar que explique qué se guarda y cómo se borra. Cada pantalla nueva agranda esa deuda. Es el momento de poner la pieza común, antes de que lleguen las cuentas y la base de datos, y estrenar de paso la marca `borrador: true` del catálogo legal que pide `CLAUDE.md` para textos que no vienen del mock-up.

## What Changes

- **Consentimiento único para el modo demostración:** antes de guardar algo por primera vez en `/perfil`, `/compromisos`, `/congreso` o `/sumarte`, la pantalla muestra un aviso: "Para guardar lo que hagas acá en este navegador necesitamos tu OK", con "Acepto" y "Ahora no", y un enlace a `/privacidad`. Con "Ahora no", la pantalla funciona igual pero **no guarda** (se pierde al recargar) y lo dice. El OK vale para las cuatro pantallas y queda registrado con fecha y versión del texto.
- **Página `/privacidad`** (borrador): qué guarda cada pantalla, dónde (solo en este navegador), hasta cuándo (hasta que lo borres), que nada se envía a un servidor y que no se piden datos sensibles. Botones "Retirar mi OK y borrar todo" y, si no hay OK, "Dar mi OK".
- **Catálogo legal con borradores:** `lib/legal/terminos.ts` acepta `borrador: true`, y el ⚖ de un término borrador muestra "Borrador: texto a revisar" dentro de su explicación.
- **Un ⚖ nuevo, `datos`** ("Tus datos personales"), redactado por el agente y marcado `borrador: true`, en el aviso de consentimiento y en `/privacidad`.
- Enlace "Privacidad" en el pie de todas las páginas.

**Fuera de alcance:**
- Cuentas, servidor, base de datos, HubSpot, cookies de analítica: no existen todavía.
- Vencimiento automático de lo guardado (pendiente R5, decide Gus).
- Política de privacidad definitiva, responsable de la base, registro ante la AAIP: los define el equipo legal.
- Bitácora de exposición (C11): otro cambio.
- Cambiar qué guarda cada pantalla: solo se condiciona el guardado al OK.

## Capabilities

### New Capabilities
- `privacidad-consentimiento`: el permiso para guardar datos en el navegador, la página de privacidad y la marca de borrador en los textos legales.

### Modified Capabilities

## Impact

Código nuevo en `app/privacidad/`, `lib/demo/consentimiento.ts` y un componente de aviso en `components/`; cambio chico en `app/perfil/entrevista.tsx`, `app/compromisos/formulario.tsx`, `app/congreso/registro-ticket.tsx` y `app/sumarte/sumarte-cliente.tsx` (guardar solo con OK); `lib/demo/claves.ts` (clave del consentimiento y de Sumarte), `lib/legal/terminos.ts` y su test, `components/termino-legal.tsx`, `components/pie.tsx`; `e2e/privacidad.spec.ts` y ajustes en los e2e que guardan datos (tienen que dar el OK primero). **Depende de** `perfil-entrevista`, `compromisos-registro`, `congreso-registro`, `sumarte-planes` y `panel-recorrido` en `main`. Sin dependencias npm nuevas.

> **En espera (7-oct, Gus):** aprobada, pero se implementa después de decidir el login (Privy o alternativa), para atar el consentimiento a una cuenta. No va en la cola hasta entonces.
