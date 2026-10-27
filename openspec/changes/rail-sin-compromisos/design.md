# Design

## Context

Ver `proposal.md` (Why). Relevamiento del 27-oct-2026 sobre `app/`, `components/` y `lib/`:

**Navegación.** Sale de una sola lista, `DESTINOS` en `lib/navegacion.ts`:
- `destinosDisponibles()` filtra por `existe`; `destinosDeGrupo(grupo)` filtra los disponibles por grupo.
- El rail (`components/rail.tsx`) arma los grupos Descubrir, Participar y Sumarte con `destinosDeGrupo`, y Admin con `destinosDeGrupo("interno")`. Es el mismo componente en la computadora y en el celular; no hay otro menú móvil.
- La barra superior (`components/barra-superior.tsx`) usa solo los grupos `persona` e `interno`: Compromisos nunca estuvo ahí.
- `destinosDisponibles()` también se usa en tres páginas para saber si existe `/pactos`; `app/page.tsx` mira `DESTINOS` para saber si existe `/sumarte`. Ninguno mira Compromisos.
- `lib/navegacion.test.ts` compara `existe` de cada destino con las páginas reales de `app/`, y fija el orden de la lista y de cada grupo.

**Avisos.** La actividad vive en el navegador (`lib/actividad/`):
- `EVENTOS.publicasteEnMercado` (`lib/actividad/eventos.ts:60`) guarda un evento tipo `mercado`, **no** notificación, con enlace a `/compromisos`. Por no ser notificación no aparece en la bandeja ni en la campanita: se ve en **Mi recorrido** (`app/panel/recorrido.tsx`, vía `listarActividad`).
- `EVENTOS.interesEnOferta` (línea 62) guarda una notificación tipo `interes-oferta`, visible 20 segundos después, con enlace a `/compromisos`. Se ve en la bandeja (`app/bandeja/bandeja-cliente.tsx`, vía `listarNotificaciones` y `contarNoLeidas`), en la campanita (`components/campanita.tsx`, vía `contarNoLeidas`) y en Mi recorrido.
- Los dos solo se generan al publicar desde `/compromisos`.

**Configuración.** `lib/configuracion/preferencias.ts` declara `TipoAviso` con `mercado`, la lista `IDS_AVISO`, `tiposAviso(idioma)` (lo que pinta `app/configuracion/configuracion-cliente.tsx`), `TIPOS_AVISO` (que usan `leerPreferencias` y `tiposOcultos`) y `EVENTOS_DE_AVISO.mercado = ["interes-oferta"]`. Los textos son `lib/idioma/textos/configuracion.ts:36` ("Mercado") y `:95` ("Market").

**Política.** `lib/privacidad/politica.ts` (borrador, solo en español) nombra los compromisos en el `RESUMEN` (línea 18), en la fila "Votos y Compromisos" de `DATOS_POR_PANTALLA` (49-50) y en `FINALIDADES` (82). `VERSION_POLITICA = "2026-10-14-borrador"` vive en `lib/privacidad/consentimiento.ts:15`; si cambia, `consentimientoVigente` deja de ser verdadero para todos y se vuelve a pedir el consentimiento (y el de datos sensibles).

**Lo que no enlaza a Compromisos.** El Fogón, el Pasaporte, la portada y Sumarte no enlazan a `/compromisos` desde el contenido. `lib/permisos/niveles.ts:77, 112` y `lib/idioma/textos/sumarte.ts:25` lo nombran en los avisos de plan, que solo se ven entrando por la URL. Los "compromisos" de los manifiestos de tribu y el "compromiso mensual" de los pactos son otro concepto.

## Goals / Non-Goals

**Goals:**
- Que la plataforma deje de ofrecer Compromisos (navegación, avisos, configuración, política) con cambios mínimos y reversibles.
- No borrar código ni datos guardados: volver atrás tiene que ser deshacer marcas, no reescribir.
- Dejar una nota que explique cómo volver.

**Non-Goals:**
- Cambiar `components/rail.tsx`, `components/campanita.tsx`, `app/bandeja/`, `app/panel/recorrido.tsx`, `app/configuracion/` o la barra superior: todo se resuelve en `lib/`.
- Tocar permisos (`lib/permisos/niveles.ts`): `/compromisos` sigue pidiendo ser Miembro.
- Tocar `lib/actividad/eventos.ts`, `lib/compromisos/` o `app/compromisos/`.

## Decisions

**1. Una marca `oculto` en el destino, no sacarlo de la lista.**
Se agrega al tipo `Destino` un campo opcional `oculto?: true` con un comentario que diga por qué (decisión de Gus del 27-oct-2026: el Mercado se lleva fuera de la plataforma; ver `docs/notas/compromisos-en-pausa.md`). Compromisos queda en `DESTINOS`, en su mismo lugar, con `existe: true, oculto: true`.
- *Alternativa descartada:* sacar la línea de `DESTINOS`. Se pierde el registro de que la página existe, el orden para volver a mostrarla y el lugar natural para la próxima página que se oculte.
- *Alternativa descartada:* poner `existe: false`. Mentiría sobre el disco y el test de coincidencia fallaría.

**2. El filtro va en `destinosDeGrupo`, no en `destinosDisponibles`.**
`destinosDeGrupo` es lo que leen el rail y la barra superior, así que filtra `!d.oculto`. `destinosDisponibles()` sigue significando "existe" y no cambia.

**3. Los avisos del Mercado se filtran al listar, por tipo, en `lib/actividad/actividad.ts`.**
Se agrega una constante exportada `TIPOS_EN_PAUSA: readonly string[] = ["mercado", "interes-oferta"]`, con un comentario que remita a la nota. `listarNotificaciones` y `listarActividad` descartan los eventos de esos tipos; `contarNoLeidas` ya usa `listarNotificaciones`, así que la campanita y el número de la bandeja quedan cubiertos. `registrar` y `leerEventos` no cambian: los eventos se siguen guardando, se siguen leyendo enteros (y exportando desde `/mis-datos`) y, si se vuelve atrás, reaparecen.
- **`marcarTodasLeidas` tampoco toca los eventos en pausa.** <!-- arquitecto: sin esto, abrir la bandeja reescribe `leida: true` en avisos que la persona nunca vio, contradice "no cambia qué se guarda" y al volver atrás reaparecen como leídos --> Hoy marca como leídas todas las notificaciones visibles, también las `interes-oferta` que ya no se muestran. Se le agrega la condición `!TIPOS_EN_PAUSA.includes(e.tipo)`: lo guardado de esos avisos queda exactamente como estaba (lo que exporta `/mis-datos` no cambia por abrir la bandeja) y, si se vuelve atrás, reaparecen sin leer, como estaban.
- **Mi recorrido también se filtra.** Gus nombró "Publicaste en el mercado", que en realidad nunca estuvo en la bandeja ni en la campanita sino en Mi recorrido. Sin filtrar `listarActividad`, ese aviso seguiría mostrándose con su enlace a `/compromisos`, que es lo que pidió quitar.
- *Alternativa descartada:* sumar los dos tipos a `tiposOcultos(preferencias)`. Mezcla una decisión de producto con una preferencia de la persona, y `listarActividad` no recibe `tiposOcultos`.
- *Alternativa descartada:* filtrar por `enlace` que empiece con `/compromisos`. Funciona igual hoy, pero un evento futuro podría enlazar ahí por otra razón; el tipo dice qué es.
- *Alternativa descartada:* dejar de registrar los eventos en `eventos.ts`. Gus pidió no borrar el código que los genera.

**4. La preferencia "Mercado" se oculta al mostrarla, no se borra del tipo.**
En `lib/configuracion/preferencias.ts` se agrega `AVISOS_EN_PAUSA: readonly TipoAviso[] = ["mercado"]` (con comentario que remita a la nota) y `tiposAviso(idioma)` devuelve solo los de `IDS_AVISO` que no están en pausa. Con eso `TIPOS_AVISO` y la pantalla de Configuración quedan con cuatro.
- `leerPreferencias` pasa a recorrer `IDS_AVISO` (todos) en lugar de `TIPOS_AVISO`, para que un `mercado: false` guardado no se pierda al leer y volver a guardar. `TipoAviso`, `PREFERENCIAS_INICIALES` y `EVENTOS_DE_AVISO` no cambian; el código de `tiposOcultos` no cambia, pero como recorre `TIPOS_AVISO` (que pasa a tener cuatro) deja de sumar `interes-oferta` aunque la persona haya apagado Mercado. No hay efecto visible: `TIPOS_EN_PAUSA` ya lo filtra, y al volver atrás `TIPOS_AVISO` recupera Mercado y la preferencia guardada vuelve a valer. <!-- arquitecto: el texto anterior decía que seguía sumando `interes-oferta`; no es así y podía confundir al implementador -->
- Los textos de `lib/idioma/textos/configuracion.ts` quedan (se vuelven a usar al volver atrás).

**5. La política deja de nombrar los compromisos, sin reescribirla.**
En `lib/privacidad/politica.ts`, con el mismo tono y sin agregar nada:
- `RESUMEN[1]`: "…perfil, comunidades, pactos, Semillas, votos, contactos, verificación de identidad y reportes."
- Fila de `DATOS_POR_PANTALLA`: `pantalla: "Votos"`, `datos: "Cómo votás en las rondas."`, `donde` igual.
- `FINALIDADES[2]`: "Registrar tus pactos, Semillas y votos."
El comentario de cabecera ya marca el archivo como borrador (lo revisa Gabriel antes de cualquier uso real, R14) y se mantiene. Se le suma una línea de rastro (ver decisión 6): "27-oct-2026: se quitaron los compromisos del resumen, de la tabla y de las finalidades sin subir `VERSION_POLITICA` (solo reduce lo descrito; cambio `rail-sin-compromisos`, ADR-017)." <!-- arquitecto: sin esta línea, la misma versión tapa dos textos y no queda cómo saber cuál aceptó cada persona -->

**6. `VERSION_POLITICA` no se sube.**
Subir la versión hace que el consentimiento de todas las personas deje de estar vigente y se les vuelva a pedir (también el de datos sensibles del Pasaporte). Eso se justifica cuando la política **amplía** lo que se trata: datos nuevos, finalidades nuevas, encargados nuevos o datos que van a otro lugar. Este cambio va en sentido contrario: solo saca una categoría que la plataforma deja de ofrecer, así que quien aceptó la versión anterior aceptó algo más amplio que lo que ahora se describe, y pedirle de nuevo el consentimiento no le da información nueva. Además es un borrador de prototipo interno. Si Gabriel, al revisar la política (R14), prefiere versionar cada cambio de texto, se sube entonces junto con su revisión.
<!-- arquitecto: rastro y choque con otras specs -->
- **El costo:** la versión `2026-10-14-borrador` pasa a corresponder a dos textos. Hasta ahora la versión era la prueba de qué texto aceptó cada persona (ADR-005; `idioma-legal` design §36: "no puede haber dos textos con la misma versión"). Para no perder esa prueba, la edición queda anotada en la cabecera de `politica.ts` con fecha (decisión 5) y en git: el texto aceptado se reconstruye con la fecha de aceptación de la constancia. La regla general ("se sube solo si amplía; lo que quita se anota") queda propuesta en **ADR-017**.
- **Orden con `consentimiento-alta` e `idioma-legal` (sin implementar):** los dos reescriben `politica.ts` (`VERSIONES_POLITICA`, versión `2026-10-15-borrador`, traducción al inglés). El que se implemente después de este cambio parte del texto sin compromisos y no los vuelve a nombrar; si `consentimiento-alta` ya subió la versión cuando este cambio se implemente, esta edición se anota igual en la cabecera y no se suma a la lista "Qué cambió" (que es para lo que se pide aceptar de nuevo).

**7. Nota para volver: `docs/notas/compromisos-en-pausa.md`.**
En palabras simples y con fuentes (rutas de archivo y líneas, specs, PRs y commits). Estructura:
1. **Qué pasó y por qué:** decisión de Gus del 27-oct-2026, el Mercado se lleva fuera de la plataforma (backlog D6 en `NS_platform/Documentation/Desarrollo/08 - Backlog de producto.md`; cambio `rail-sin-compromisos`, PR #121).
2. **Qué quedó en el código:** la página (`app/compromisos/`), la lógica (`lib/compromisos/`, incluido `mercado.ts`), los textos (`lib/idioma/textos/compromisos.ts`, los de `bandeja.ts` y `configuracion.ts`), los eventos (`lib/actividad/eventos.ts`), el permiso (`lib/permisos/niveles.ts`), la clave de demo (`lib/demo/claves.ts`), los tests (`lib/compromisos/compromisos.test.ts`, e2e `compromisos.spec.ts`, `idioma-fogon-mercado.spec.ts`, `accesibilidad.spec.ts`, `bandeja.spec.ts`), las specs (`openspec/changes/compromisos-registro`, `compromisos-mercado`, `bandeja-notificaciones`, `idioma-fogon-mercado`, `rail-sin-compromisos`) y los PRs y commits que los trajeron (por lo menos PR #18 `compromisos-registro`, el commit `79abeef` del Mercado, `0ddf7e0` de la bandeja, PR #120 con la traducción; el implementador completa los números de PR que falten con `scripts/pr.sh listar` o `gh api repos/netxgen-2050/lighthouse-platform/...`).
3. **Pasos para volver a activarlo**, en orden y cada uno con el archivo exacto: (a) rail: quitar `oculto: true` de Compromisos en `lib/navegacion.ts`; (b) avisos: vaciar `TIPOS_EN_PAUSA` en `lib/actividad/actividad.ts`; (c) configuración: vaciar `AVISOS_EN_PAUSA` en `lib/configuracion/preferencias.ts`; (d) política: volver a nombrar los compromisos en `lib/privacidad/politica.ts` y, como eso **amplía** lo descrito, subir `VERSION_POLITICA` y pedir revisión de Gabriel; (e) tests: revertir los ajustes de este cambio (listas del rail, conteos, `toHaveCount(0)`, preferencias, avisos) con la lista de archivos de la tarea correspondiente; (f) correr `pnpm verificar`, `pnpm build` y `pnpm test:e2e`. Atajo: `git revert` del commit de implementación de `rail-sin-compromisos` hace todo menos borrar la nota.
4. **Qué no se tocó** (para no buscarlo): los manifiestos, los pactos y los avisos de plan de `/compromisos`.

## Risks / Trade-offs

- [Un e2e que no se listó busca el enlace, la casilla o el aviso y falla] → La tarea final corre todos los e2e; el relevamiento con `grep -rn -i -E "Compromisos|mercado|interes" e2e` muestra solo los listados.
- [`/compromisos` sigue guardando compromisos en el navegador por la URL, y la política ya no los nombra] → La página no se ofrece en ningún lado y es un prototipo interno; los datos siguen bajo "lo que cargues en la plataforma" y se exportan y borran desde `/mis-datos`. La nota lo deja escrito para que, si se vuelve atrás, se vuelva a nombrar en la política.
- [La exportación de `/mis-datos` trae la clave `compromisos` (y eventos `mercado`/`interes-oferta`) que la política ya no nombra] → Es correcto que la exporte (derecho de acceso: se entrega todo lo guardado). La diferencia con el texto queda como pregunta para Gus/Gabriel (R14); si molesta, la salida más chica es que `/compromisos` deje de guardar nuevos datos, que es una decisión de producto fuera de este cambio. <!-- arquitecto -->
- [Una persona publica por la URL y no recibe el aviso de interés] → Esperado: la página está en pausa. El aviso queda guardado y aparece si se vuelve atrás.
- [Alguien interpreta `oculto` o "en pausa" como "sin permiso"] → Los comentarios dicen que solo sacan el destino o el aviso de la vista; la página sigue con su permiso de siempre.
- [Gabriel quería versionar cada cambio de la política] → Decisión 6: se sube con su revisión (R14).

## Migration Plan

Sin datos ni migraciones: no se borra nada guardado en el navegador. Para volver atrás, seguir `docs/notas/compromisos-en-pausa.md` (quitar las marcas, devolver los textos de la política subiendo la versión y revertir los tests).
