**Compromisos y Mercado en pausa: qué pasó y cómo volver**

Nota escrita el 27-oct-2026 con el cambio `openspec/changes/rail-sin-compromisos/` (spec en el PR #121, código en el PR #124).

**1. Qué pasó y por qué**

El 27-oct-2026 Gus decidió que el Mercado de compromisos se lleva fuera de la plataforma. Pidió "quitar los compromisos" y dejar esta nota por si hay que volver. No se borró nada: la plataforma dejó de ofrecer la página, pero sigue existiendo y responde si se entra por su dirección (`/compromisos`).

Fuentes: backlog D6 en `NS_platform/Documentation/Desarrollo/08 - Backlog de producto.md`, `openspec/changes/rail-sin-compromisos/` (`proposal.md` y `design.md`) y el PR #121.

Qué dejó de ofrecerse:
- El enlace "Compromisos" del grupo Participar del rail (computadora y celular).
- Los avisos "Publicaste en el mercado" y "Alguien se interesó en tu oferta": no se listan ni se cuentan en la bandeja, la campanita ni Mi recorrido.
- La casilla "Mercado" en Configuración.
- Las menciones a los compromisos en la política de privacidad (resumen, tabla de datos por pantalla y finalidades).

**2. Qué quedó en el código**

- Página: `app/compromisos/` (`page.tsx`, `formulario.tsx`).
- Lógica: `lib/compromisos/` (incluido `mercado.ts`) y su test `lib/compromisos/compromisos.test.ts`.
- Textos: `lib/idioma/textos/compromisos.ts`, y los textos de avisos en `lib/idioma/textos/bandeja.ts` y `lib/idioma/textos/configuracion.ts`.
- Eventos que se siguen generando y guardando: `lib/actividad/eventos.ts` (`publicasteEnMercado`, `interesEnOferta`).
- Permiso: `lib/permisos/niveles.ts` (la página sigue pidiendo ser Miembro).
- Clave de demo: `lib/demo/claves.ts`.
- Tests e2e: `e2e/compromisos.spec.ts`, `e2e/idioma-fogon-mercado.spec.ts`, `e2e/accesibilidad.spec.ts` (sigue auditando `/compromisos` por su dirección) y `e2e/bandeja.spec.ts`.
- Specs: `openspec/changes/compromisos-registro`, `openspec/changes/compromisos-mercado`, `openspec/changes/bandeja-notificaciones`, `openspec/changes/idioma-fogon-mercado` y `openspec/changes/rail-sin-compromisos`.
- Historia: PR #18 (Compromisos y Mi recorrido), commit `79abeef` (registro simplificado y Mercado), commit `0ddf7e0` (bandeja y campanita), PR #120 (integración en dev de la traducción al inglés, con #115 y #118) y PR #121 (spec de este cambio).

Las marcas que lo dejan en pausa:
- `lib/navegacion.ts`: Compromisos tiene `oculto: true` y `destinosDeGrupo` lo filtra.
- `lib/actividad/actividad.ts`: `TIPOS_EN_PAUSA` (`mercado`, `interes-oferta`).
- `lib/configuracion/preferencias.ts`: `AVISOS_EN_PAUSA` (`mercado`).
- `lib/privacidad/politica.ts`: tres textos sin compromisos y una línea de rastro en la cabecera. `VERSION_POLITICA` (`lib/privacidad/consentimiento.ts`) no se subió, a propósito (`docs/decisiones/ADR-017-version-de-la-politica-solo-al-ampliar.md`).

**3. Pasos para volver a activarlo**

1. Rail: en `lib/navegacion.ts`, quitar `oculto: true` de Compromisos.
2. Avisos: en `lib/actividad/actividad.ts`, vaciar `TIPOS_EN_PAUSA` (`[]`). Los avisos guardados reaparecen.
3. Configuración: en `lib/configuracion/preferencias.ts`, vaciar `AVISOS_EN_PAUSA` (`[]`). La casilla vuelve y se respeta lo que la persona había guardado.
4. Política: en `lib/privacidad/politica.ts`, devolver los tres textos ("compromisos" en `RESUMEN[1]`, la fila "Votos y Compromisos" en `DATOS_POR_PANTALLA` y `FINALIDADES[2]`). Como eso **amplía** lo que se describe, hay que subir `VERSION_POLITICA` en `lib/privacidad/consentimiento.ts` y pedir revisión de Gabriel (R14).
5. Tests: revertir los ajustes de este cambio.
   - `lib/navegacion.test.ts`: lista de Participar y los tests de oculto.
   - `lib/actividad/actividad.test.ts`: los tests de avisos en pausa y los dos que usan `tipo: "x"` para probar la demora.
   - `lib/configuracion/preferencias.test.ts`: los cuatro avisos y el de Mercado guardado.
   - `lib/privacidad/privacidad.test.ts`: el bloque "la política sin Compromisos".
   - e2e: `e2e/marco.spec.ts`, `e2e/descubrir-publico.spec.ts`, `e2e/sumarte-acceso.spec.ts`, `e2e/fixtura.ts` (comentario), `e2e/compromisos.spec.ts`, `e2e/idioma-fogon-mercado.spec.ts`, `e2e/bandeja.spec.ts`, `e2e/configuracion.spec.ts` y `e2e/idioma-perfil-recorrido.spec.ts`.
6. Correr `pnpm verificar`, `pnpm build` y `pnpm test:e2e`.

Atajo: revertir los tres commits de la implementación (`b8a9119`, `a4f78af` y `b77403f`; los dos primeros son el código y los e2e, y deshacerlos por separado deja tests rotos). Si el PR #124 entra a `dev` con squash o con merge, es más simple revertir ese commit de entrada: en ambos casos también borra esta nota, así que hay que recuperarla de la historia si se quiere conservar.

**4. Qué no se tocó**

- La página, el Mercado, sus textos, su permiso y su clave de demo.
- El código que genera los eventos (`lib/actividad/eventos.ts`) y lo que ya estaba guardado en el navegador (`/mis-datos` sigue exportándolo todo).
- Los avisos de plan que nombran `/compromisos` (`lib/permisos/niveles.ts`, `lib/idioma/textos/sumarte.ts`): solo se ven entrando por la dirección.
- Los "compromisos" de los manifiestos de tribu y el "compromiso mensual" de los pactos: son otro concepto.
- El backlog (D6) en `NS_platform`.
