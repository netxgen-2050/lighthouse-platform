# Proposal

## Why

Quinta zona de la plataforma bilingüe (ver `idioma-base` y ADR-004): el espacio personal. Perfil, Mi recorrido, la bandeja de notificaciones y Configuración son lo que una persona del exterior usa todos los días. Entra en una noche.

## What Changes

- **Perfil (`/perfil`) en inglés:** secciones, preguntas de la entrevista (`lib/perfil/preguntas.ts`, `modelo.ts`), propuesta de perfil (`propuesta.ts`), roles, ayudas y errores. Lo que escribe la persona (nombre, frase, respuestas) nunca se traduce.
- **Mi recorrido (`/panel`) en inglés:** avance, próximo paso (`lib/panel/proximo-paso.ts`) y línea de tiempo (`linea-tiempo.ts`) con fechas según idioma.
- **Notificaciones (`/bandeja` y la campanita) en inglés:** hoy cada evento guarda su texto ya armado en español. Pasa a guardar **tipo y datos** (comunidad, descripción) y el texto se arma al mostrarlo, en el idioma actual. Los eventos guardados antes, sin datos, se siguen mostrando con su texto original y `lang="es"`.
- **Configuración (`/configuracion`) en inglés:** apariencia, avisos por tipo (`TIPOS_AVISO`), Hifa, moneda (con su nota), idioma y "Borrar todo" (con su confirmación).
- Las cuatro rutas se suman a `RUTAS_TRADUCIDAS`.

### Fuera de alcance

- Hifa (el asistente flotante) y el botón de reportes: `idioma-hifa-avisos`.
- Mis datos (descarga, retiro del consentimiento, borrar cuenta): `idioma-legal`, por su peso legal.
- Cambiar qué se pregunta en la entrevista o el alcance de Perfil, Pasaporte y Mi recorrido (B4).

## Capabilities

### New Capabilities
- `idioma-perfil-recorrido`: Perfil, Mi recorrido, notificaciones y Configuración en inglés, con notificaciones que se arman en el idioma actual.

### Modified Capabilities
- (ninguna)

## Impact

- Código: `lib/idioma/textos/perfil.ts`, `recorrido.ts`, `bandeja.ts` y `configuracion.ts` (nuevos), `app/perfil/**`, `app/panel/page.tsx` y `recorrido.tsx`, `app/bandeja/**`, `components/campanita.tsx`, `app/configuracion/**`, `lib/perfil/preguntas.ts`, `modelo.ts`, `propuesta.ts`, `lib/panel/proximo-paso.ts`, `linea-tiempo.ts`, `lib/actividad/eventos.ts` y `actividad.ts` (tipo y datos, compatible con lo guardado), `lib/configuracion/preferencias.ts` (`TIPOS_AVISO` por idioma), `lib/idioma/rutas.ts`.
- **Cambia la forma de un dato guardado en el navegador** (eventos de actividad: suma `datos` opcional; los viejos se siguen leyendo). No es un dato personal nuevo ni toca la base; queda anotado para cuando la actividad se mude a la base (`datos-en-la-nube`).
- Tests: `lib/actividad/actividad.test.ts` (evento nuevo con datos en los dos idiomas; evento viejo solo con texto), diccionarios; `e2e/idioma-perfil-recorrido.spec.ts`; los e2e en español (`perfil`, `panel`, `bandeja`, `configuracion`) siguen iguales.
- Depende de `idioma-base`.
