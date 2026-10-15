# Proposal

## Why

Gus quiere **toda la plataforma** en español (voseo) e inglés, no solo el Congreso: hay inversores y miembros del exterior. `congreso-bilingue` resolvió el Congreso con su propia dirección (`/congreso/en`, ADR-003) y sus diccionarios. Antes de traducir zona por zona hace falta una base común: cómo se elige y se recuerda el idioma, cómo viven los textos, qué pasa cuando falta una traducción y cómo se detecta lo que quedó sin traducir. Este cambio es esa base, más el marco de la app (rail, barra superior, pie, avisos de la puerta) ya traducido. Entra en una noche; las zonas vienen en cambios aparte.

## What Changes

- **Idioma por preferencia, sin cambiar las direcciones.** Las páginas siguen en la misma dirección (`/tribus`, `/sumarte`…). El idioma lo define una cookie del navegador (`lh-idioma`, `es` o `en`) que lee el servidor, y además se guarda **por persona** en sus preferencias (para recuperarlo en este navegador si se borra la cookie; en otro dispositivo llega con `datos-en-la-nube`). Sin cuenta, funciona igual con la cookie. Comparación de opciones (prefijo `/en/...`, parámetro, solo preferencia) en `design.md` y en el **ADR-004** (Propuesta; **Gus aceptó la decisión el 15-oct-2026** y lo pasa a Aceptada al mergear). La preferencia queda guardada en el navegador hasta `datos-en-la-nube` (decisión de Gus: alcanza para el prototipo).
- **Idioma inicial: el del navegador** (decisión de Gus, 15-oct-2026). Si la persona no eligió nada (sin cookie ni preferencia guardada), el servidor usa el primer idioma de `Accept-Language`: español → español; inglés → inglés; cualquier otro → **inglés**. La cookie o la preferencia elegida siempre ganan, y lo detectado nunca se guarda como elección.
- **Enlace directo en inglés:** cualquier dirección con `?lang=en` (o `?lang=es`) fija el idioma y redirige a la misma dirección sin el parámetro (conserva UTM y ancla). Sirve para mandarle a un inversor `…/sumarte?lang=en`.
- **Convive con `/congreso/en` (ADR-003):** esa dirección no cambia y siempre muestra inglés. Con preferencia inglés, `/congreso` pasa a `/congreso/en` desde el servidor (sin el parpadeo de hoy). El selector del Congreso y el de la plataforma escriben la misma preferencia.
- **Selector ES / EN** en la barra superior, visible para todos (con y sin cuenta, también en el celular), hecho con dos enlaces; y la opción "English" habilitada en Configuración → Idioma.
- **`<html lang>`** según el idioma; todo texto en español dentro de una página en inglés lleva `lang="es"`.
- **Diccionarios tipados por zona** (`lib/idioma/textos/<zona>.ts`): el inglés tiene el mismo tipo que el español, así que **si falta una clave en inglés, no compila**. Se reutilizan los tipos del Congreso (`Idioma`, `Bilingue`, `resolver`).
- **Caída al español marcada, nunca texto vacío:** un dato de ejemplo sin inglés se muestra en español con `lang="es"` y la marca visible "ES"; una página que todavía no se tradujo muestra arriba "This page is only available in Spanish for now." y su contenido con `lang="es"`.
- **Fechas, números y montos según idioma** (`es-AR` / `en-US`): "15 de octubre de 2026" / "October 15, 2026"; "USD 1.200" / "USD 1,200"; "sin dato" / "no data".
- **Marco traducido:** rail y sus grupos, barra superior, menú de la persona, campanita (nombres accesibles), pie, aviso "Prototipo interno · datos de ejemplo" / "Internal prototype · sample data", "Saltar al contenido", 404, pantallas de la puerta (cargando, sin acceso, error, importar datos) y el título de la pestaña.
- **Glosario** de términos de la plataforma (Pase Fundador → Founder Pass, Fogón → Fireside…) en `lib/idioma/glosario.ts`, **confirmado por Gus** (15-oct-2026) con un cambio: **"Semillas" no se traduce**; en inglés también se dice "Semillas", con la explicación "Semillas (seeds)" la primera vez que aparece en una página. Los nombres propios no se traducen.
- **Textos de comunidades y de ejemplo traducidos, con su idioma original a la vista** (decisión de Gus): manifiestos, decisiones del Fogón y ofertas de ejemplo se traducen como cualquier dato de ejemplo, y en el otro idioma muestran "Translated from Spanish" / "Traducido del inglés". Lo que escribe la persona sigue **sin** traducción automática.
- **Revisión nativa pendiente, a la vista:** cada diccionario y cada archivo de datos con inglés queda anotado en `lib/idioma/revision-nativa.ts` como `pendiente` hasta que lo revise un hablante nativo (más adelante, decisión de Gus). Un test exige que todo diccionario esté anotado y `pnpm idioma:pendientes` genera la lista `docs/idioma/revisar-nativo.md` para que Gus la vaya pasando.
- **Tests que detectan textos sin traducir:** diccionarios sin textos vacíos ni `en` igual a `es` (fuera de una lista de neutros), sin rastros de español en el lado inglés, voseo en el lado español; y un e2e que recorre las páginas traducidas en inglés y falla si encuentra palabras en español fuera de `lang="es"`.

### Fuera de alcance

- **Traducir las páginas** (contenido de portada, Sumarte, tribus, territorio, Pasaporte, etc.): van en `idioma-portada-sumarte`, `idioma-tribus-territorio`, `idioma-pasaporte-semillas-pactos`, `idioma-fogon-mercado-perfil`, `idioma-legal` e `idioma-hifa-avisos`.
- Política de privacidad, términos y ⚖ en inglés (`idioma-legal`; su revisión legal es R14 / L10).
- Prefijo `/en/...`, SEO y `hreflang` fuera del Congreso, otros idiomas, traducción automática de lo que escribe la persona.
- La revisión de los textos en inglés por un hablante nativo (más adelante; este cambio solo deja la lista de pendientes).
- Que la preferencia de idioma siga a la persona a otro dispositivo: llega con `datos-en-la-nube`.
- La ventana de login de Privy (viene en inglés; su texto en español va en `idioma-hifa-avisos`).
- La página interna `/netx` y la bitácora del panel: siguen en español (uso interno).

## Capabilities

### New Capabilities
- `idioma-plataforma`: elección y recuerdo del idioma (cookie y preferencia por persona), enlace con `?lang=`, convivencia con `/congreso/en`, `lang`, diccionarios completos, caída marcada, formatos por idioma, marco traducido y detección de textos sin traducir.

### Modified Capabilities
- `barra-superior-configuracion`: la barra suma el selector de idioma y Configuración habilita "English".

## Impact

- Código nuevo: `lib/idioma/` (`tipos.ts`, `textos.ts` con el registro de diccionarios, `textos/marco.ts`, `formatos.ts`, `glosario.ts`, `neutros.ts`, `rutas.ts`, `servidor.ts`, `cliente.tsx`, `navegador.ts`, `revision-nativa.ts`), `docs/idioma/revisar-nativo.md` (generado), `middleware.ts`, `components/selector-idioma.tsx`, `components/texto-bilingue.tsx`, `components/aviso-sin-traducir.tsx`, `docs/decisiones/ADR-004-plataforma-bilingue.md`.
- Código que cambia: `app/layout.tsx` (lee la cookie: **todas las páginas pasan a renderizarse por pedido**), `lib/navegacion.ts` (etiquetas por clave), `components/rail*.tsx`, `barra-superior.tsx`, `menu-persona.tsx`, `campanita.tsx`, `pie.tsx`, `aviso-ejemplo.tsx`, `sesion/puerta.tsx`, `sesion/marca-admin.tsx`, `app/not-found.tsx`, `lib/configuracion/preferencias.ts` (`idiomaElegido: "es" | "en" | null`, design §4), `app/configuracion/configuracion-cliente.tsx` (radio "English"), `lib/configuracion/preferencias.ts` `formatearMonto` (con idioma), las piezas de preferencia y selector de `app/congreso/netx/`.
- Tests: unitarios de `lib/idioma/`, `e2e/ayudas-idioma.ts` y `e2e/idioma.spec.ts` nuevos; `e2e/accesibilidad.spec.ts` suma variantes en inglés. `playwright.config.ts` fija `locale: "es-AR"` para que los e2e actuales sigan en español (el Chromium de Playwright manda inglés por defecto). `package.json` suma el script `idioma:pendientes`.
- **Toca permisos de rutas (middleware) y una preferencia por persona: pendiente de revisión del agente arquitecto.** Sin base, sin integraciones nuevas, sin dependencias nuevas, sin plata.
- Depende de `congreso-bilingue` implementado (reutiliza `lib/congreso/idioma.ts` y sus piezas de preferencia).
