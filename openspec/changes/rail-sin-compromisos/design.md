# Design

## Context

Ver `proposal.md` (Why). Hoy la navegación sale de una sola lista, `DESTINOS` en `lib/navegacion.ts`:

- `destinosDisponibles()` filtra por `existe`; `destinosDeGrupo(grupo)` filtra los disponibles por grupo.
- El rail (`components/rail.tsx`) arma los grupos Descubrir, Participar y Sumarte con `destinosDeGrupo`, y Admin con `destinosDeGrupo("interno")`. Es el mismo componente en la computadora y en el celular (en el celular solo se angosta); no hay otro menú móvil.
- La barra superior (`components/barra-superior.tsx`) usa solo los grupos `persona` e `interno`: Compromisos nunca estuvo ahí.
- `destinosDisponibles()` también se usa en tres páginas para saber si existe `/pactos` (ficha del territorio, ficha y manifiesto de la tribu); `app/page.tsx` mira `DESTINOS` para saber si existe `/sumarte`. Ninguno mira Compromisos.
- `lib/navegacion.test.ts` compara `existe` de cada destino con las páginas reales de `app/`, y fija el orden de la lista y de cada grupo.

## Goals / Non-Goals

**Goals:**
- Sacar Compromisos de la navegación con un cambio mínimo, reversible en una línea.
- No romper el test de `existe` ni a los que usan `destinosDisponibles()`.

**Non-Goals:**
- Cambiar `components/rail.tsx`, `components/rail-enlaces.tsx` o la barra superior.
- Tocar permisos (`lib/permisos/niveles.ts`): `/compromisos` sigue pidiendo ser Miembro.

## Decisions

**1. Una marca `oculto` en el destino, no sacarlo de la lista.**
Se agrega al tipo `Destino` un campo opcional `oculto?: true` con un comentario que diga por qué (decisión de Gus del 27-oct-2026: el Mercado se lleva fuera de la plataforma). Compromisos queda en `DESTINOS`, en su mismo lugar, con `existe: true, oculto: true`.
- *Alternativa descartada:* sacar la línea de `DESTINOS`. También pasaría el test de `existe` (solo recorre la lista), pero se pierde el registro de que la página existe, el orden para volver a mostrarla y el lugar natural para la próxima página que se oculte (por ejemplo, si se retira `/congreso`).
- *Alternativa descartada:* poner `existe: false`. Mentiría sobre el disco y el test de coincidencia fallaría, que es justo lo que pide no romper.

**2. El filtro va en `destinosDeGrupo`, no en `destinosDisponibles`.**
`destinosDeGrupo` es lo que leen el rail y la barra superior, así que filtra `!d.oculto` y con eso ningún menú lo muestra. `destinosDisponibles()` sigue significando "existe" (lo usan las páginas para saber si hay `/pactos`), y no cambia.

**3. Tests.**
- `lib/navegacion.test.ts`: el orden de `DESTINOS` no cambia (sigue con Compromisos); Participar pasa a `["Pactos", "Semillas", "Fogón", "Congreso"]` y en inglés a `["Pacts", "Semillas", "Fireside", "Congress"]`. Un test nuevo: Compromisos existe, está oculto y no aparece en ningún grupo; y todo destino oculto existe (no tiene sentido ocultar lo que no está).
- e2e que miraban el rail (`marco`, `descubrir-publico`, `sumarte-acceso`): se quita Compromisos de las listas y se agrega que el enlace no está (`toHaveCount(0)`). En `marco`, Participar pasa de 5 a 4 enlaces.
- `compromisos.spec.ts`: ya entra por `page.goto("/compromisos")`; el test "exactamente un main y Compromisos marcado en el encabezado" pasa a verificar un único `<main>`, que no hay enlace Compromisos en el rail y que ningún enlace del rail tiene `aria-current="page"`.
- `idioma-fogon-mercado.spec.ts`: ya entra por la URL; se agrega que el rail en inglés no trae "Commitments".
- `fixtura.ts`: solo el comentario de la línea 53, que nombra los destinos de Participar.
- `accesibilidad.spec.ts`, `idioma.spec.ts`, `configuracion.spec.ts` y `bandeja.spec.ts` ya abren `/compromisos` por la URL: no cambian.

**4. Enlaces y menciones desde el contenido (no se tocan; pregunta abierta para Gus).**
Relevamiento del 27-oct-2026 sobre `app/`, `components/` y `lib/`:

| Dónde | Qué hace | Cómo se llega |
|---|---|---|
| `lib/actividad/eventos.ts:61` (`publicasteEnMercado`) | Evento de la bandeja con enlace a `/compromisos` | Solo se genera al publicar desde `/compromisos` |
| `lib/actividad/eventos.ts:65` (`interesEnOferta`) | Notificación de la campanita ("alguien se interesó") con enlace a `/compromisos` | Igual: solo después de publicar en el Mercado |
| `lib/idioma/textos/configuracion.ts:36` y `lib/configuracion/preferencias.ts` | Preferencia de aviso "Mercado" en `/configuracion` | Visible para todos en Configuración, aunque ya no se llegue al Mercado desde el rail |
| `lib/privacidad/politica.ts:18, 49, 82` | La política de privacidad nombra "Votos y Compromisos" y los compromisos que asumís | Visible en `/mis-datos` y en la política |
| `lib/permisos/niveles.ts:77, 112` y `lib/idioma/textos/sumarte.ts:25` | `/compromisos` sigue en la lista de Participar que pide ser Miembro y en los avisos de plan | Solo se ve si alguien entra por la URL |

El Fogón, el Pasaporte, Mi recorrido, la portada y Sumarte **no** enlazan a `/compromisos` desde el contenido. Los "compromisos" de los manifiestos de tribu (`lib/manifiestos/datos.ts`, `app/tribus/[id]/manifiesto/lectura.tsx`) y el "compromiso mensual" de los pactos son otro concepto y no tienen que ver con este cambio.

## Risks / Trade-offs

- [Un e2e que no se listó busca el enlace "Compromisos" en el rail y falla] → La tarea final corre todos los e2e; el relevamiento con `grep -rn "Compromisos" e2e` muestra solo los listados.
- [La preferencia "Mercado" de Configuración queda huérfana para quien no conoce la URL] → Se deja así a propósito (pide no tocar contenido) y va como pregunta abierta.
- [Alguien interpreta `oculto` como "sin permiso"] → El comentario del campo dice que solo saca el destino de los menús; la página sigue con su permiso de siempre.

## Migration Plan

Sin datos ni migraciones. Para volver atrás alcanza con quitar `oculto: true` de Compromisos y revertir los tests.
