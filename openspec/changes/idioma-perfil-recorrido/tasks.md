# Tasks

Requisito previo: `idioma-base` mergeado. Rama `agente/idioma-perfil-recorrido`. El cómo está en el design de `idioma-base` (§3, §7, §8 y §10). Español idéntico al de hoy. Cada diccionario y archivo de datos con inglés se anota como `pendiente` en `lib/idioma/revision-nativa.ts` y se regenera la lista con `pnpm idioma:pendientes` (§12). "Semillas" no se traduce (§9).

## 1. Perfil y Mi recorrido

- [x] 1.1 Crear `lib/idioma/textos/perfil.ts`; preguntas y textos de `lib/perfil/preguntas.ts`, `modelo.ts` y `propuesta.ts` por idioma; pasar `app/perfil/**`. Las respuestas de la persona se muestran tal cual (con `lang="es"` si la interfaz está en inglés). Verificar con `pnpm test` y `pnpm test:e2e e2e/perfil.spec.ts`.
- [x] 1.2 Crear `lib/idioma/textos/recorrido.ts`; `lib/panel/proximo-paso.ts` y `linea-tiempo.ts` con idioma (fechas con `formatearFecha`); pasar `app/panel/page.tsx` y `recorrido.tsx`. Tests de `proximo-paso` en inglés. Verificar con `pnpm test` y `pnpm test:e2e e2e/panel.spec.ts`.

## 2. Notificaciones

- [x] 2.1 En `lib/actividad/`: los eventos nuevos guardan `tipo` y `datos` (además de `texto` en español, para que el código viejo los siga leyendo); `textoDeEvento(evento, idioma)` arma el texto con el diccionario `bandeja` y, si el evento no tiene datos, devuelve su `texto` marcado como español. Tests: evento nuevo en los dos idiomas, evento viejo, datos dañados descartados. Verificar con `pnpm test`.
- [x] 2.2 Crear `lib/idioma/textos/bandeja.ts` y pasar `app/bandeja/**` y `components/campanita.tsx` (lista y nombre accesible con la cantidad) a `textoDeEvento`. Verificar con `pnpm test:e2e e2e/bandeja.spec.ts`.

## 3. Configuración

- [x] 3.1 Crear `lib/idioma/textos/configuracion.ts`; `TIPOS_AVISO` por idioma; pasar `app/configuracion/**` (incluida la confirmación de "Borrar todo"). Verificar con `pnpm test:e2e e2e/configuracion.spec.ts`.

## 4. Pruebas

- [x] 4.1 Sumar `/perfil`, `/panel`, `/bandeja` y `/configuracion` a `RUTAS_TRADUCIDAS` y crear `e2e/idioma-perfil-recorrido.spec.ts` con los escenarios de la spec (incluido cambiar de idioma con una notificación ya recibida y un evento viejo sembrado). Verificar con `pnpm test:e2e e2e/idioma-perfil-recorrido.spec.ts e2e/idioma.spec.ts`.
- [x] 4.2 Sumar las cuatro páginas en inglés a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm verificar`, `pnpm build` y `pnpm test:e2e`.
