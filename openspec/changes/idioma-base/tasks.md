# Tasks

Requisito previo: `congreso-bilingue` mergeado en `main`. Rama `agente/idioma-base`. Textos en español con voseo e idénticos a los de hoy (los e2e actuales tienen que seguir en verde).

**Si la noche no alcanza:** los grupos 1 y 2 no cambian nada visible y pueden ir en un primer PR; los grupos 3 a 5 (selector, middleware, marco en inglés y e2e) van juntos en el segundo.

## 1. Tipos, diccionarios y formatos

- [ ] 1.1 Crear `lib/idioma/tipos.ts` (reexporta de `@/lib/congreso/idioma` y define `Textos<T>`) con `tipos.test.ts` que prueba con `@ts-expect-error` que falta una clave, que una tupla corta no compila y que una función conserva su firma (design §3). Verificar con `pnpm verificar`.
- [ ] 1.2 Crear `lib/idioma/glosario.ts` (confirmado por Gus; "Semillas" igual en los dos idiomas con `explicada` "Semillas (seeds)", design §9) y `lib/idioma/neutros.ts` (con "Semillas"), y `lib/idioma/textos.ts` con el registro `DICCIONARIOS`. Verificar con `pnpm verificar`.
- [ ] 1.3 Crear `lib/idioma/formatos.ts` y pasar `formatearMonto` a usarlo con `idioma = "es"` por defecto; mover `NOTA_TIPO_DE_CAMBIO` a un texto por idioma (design §8). Tests en `formatos.test.ts` y `preferencias.test.ts`: "USD 1,200", "October 15, 2026", "no data", y en español exactamente lo de antes. Verificar con `pnpm test`.
- [ ] 1.4 Crear `lib/idioma/diccionarios.test.ts` con las reglas de design §11 (vacíos, copias, rastros de español, tuteo). Verificar con `pnpm test`.
- [ ] 1.5 Crear `lib/idioma/revision-nativa.ts` con `textos/marco`, `textos/comunes` y `glosario` como `pendiente`, y `revision-nativa.test.ts` (todo diccionario anotado; lista comparada con `toMatchFileSnapshot` contra `docs/idioma/revisar-nativo.md`); sumar el script `"idioma:pendientes": "vitest run lib/idioma/revision-nativa.test.ts -u"` a `package.json` y generar el archivo (design §12). Verificar con `pnpm idioma:pendientes` (crea la lista con las tres fuentes) y después `pnpm test` (en verde sin `-u`); sacar `glosario` de la lista a mano y comprobar que `pnpm test` falla nombrándolo.

## 2. Idioma del pedido y preferencia

- [ ] 2.1 `Preferencias.idiomaElegido: "es" | "en" | null` (por defecto `null`; el campo viejo `idioma` se ignora) en `lib/configuracion/preferencias.ts` con su test (design §4). Verificar con `pnpm test`.
- [ ] 2.1b Crear `lib/idioma/navegador.ts` (`idiomaDelNavegador`) con los casos de `navegador.test.ts` (design §4 y §11) y fijar `use.locale: "es-AR"` en `playwright.config.ts`. Verificar con `pnpm test` y con `pnpm test:e2e e2e/marco.spec.ts` en verde.
- [ ] 2.2 Crear `lib/idioma/servidor.ts` (`idiomaDelPedido`: cookie válida o, si no, `idiomaDelNavegador` del encabezado `Accept-Language`) y `lib/idioma/cliente.tsx` (`ProveedorIdioma`, `useIdioma`, `useTextos`, `cambiarIdioma`, `SincronizarIdioma` con las reglas de design §4). En `app/layout.tsx`: `<html lang={idioma}>` y `ProveedorIdioma`; `SincronizarIdioma` montado con sesión y consentimiento. Verificar con `pnpm build` y `pnpm test:e2e` (todo en español, en verde).
- [ ] 2.3 Crear `middleware.ts` con la lógica en una función pura `resolverIdioma` (design §5) y su test: `?lang=en` con UTM, `?lang=fr`, `/congreso?lang=en`, `/congreso/en?lang=es`, `/congreso` con cookie `en`, `/congreso` sin cookie y `Accept-Language: en-US` (redirige, sin escribir cookie), `/congreso` con cookie `es` y navegador en inglés (no redirige), `/congreso/en` con cookie `es` (no redirige). <!-- arquitecto --> Sumar: `?lang=en&next=https://otro.com` se queda en el mismo origen; la redirección por cookie lleva `Cache-Control: private, no-store`; una excepción deja pasar el pedido (design §5). Verificar con `pnpm test`.
- [ ] 2.4 Congreso: `preferencia-idioma.tsx` lee el idioma de la plataforma y el selector del evento usa `cambiarIdioma`; migración única de `lh-congreso-idioma` (design §4). Verificar con `pnpm test:e2e e2e/congreso-en.spec.ts` en verde.

## 3. Selector y Configuración

- [ ] 3.1 Crear `components/selector-idioma.tsx` (design §6) con test de `renderToStaticMarkup` (dos enlaces, `href` con `?lang=`, `aria-current`, `lang`/`hreflang`, nombres accesibles) y sumarlo a la barra superior, también sin sesión. Verificar con `pnpm test`.
- [ ] 3.2 Habilitar "English" en Configuración → Idioma con `cambiarIdioma` y ajustar `e2e/configuracion.spec.ts` (ya no dice "próximamente"). Verificar con `pnpm test:e2e e2e/configuracion.spec.ts`.

## 4. Marco en inglés y caída marcada

- [ ] 4.1 Crear `lib/idioma/textos/comunes.ts` (design §3, todavía sin usarlo fuera del marco) y `lib/idioma/textos/marco.ts`, y pasar a leer el marco: `lib/navegacion.ts` (etiquetas y títulos de grupo por clave, del glosario), rail, barra superior, menú de la persona, campanita, pie, aviso de prototipo, "Saltar al contenido", `app/not-found.tsx`, pantallas de `components/sesion/puerta.tsx`, marca "Interno" y `metadata` del layout (con `generateMetadata`). Verificar con `pnpm verificar` y `pnpm test:e2e e2e/marco.spec.ts` (español sin cambios).
- [ ] 4.2 Crear `lib/idioma/rutas.ts` (`RUTAS_TRADUCIDAS` con `/congreso` y `/congreso/en`) y su test; `components/aviso-sin-traducir.tsx` y el envoltorio `lang="es"` en la puerta para las páginas fuera de la lista (design §7). <!-- arquitecto --> El envoltorio anida `ProveedorIdioma idioma="es"`; test: dentro, `useIdioma()` devuelve `"es"` con la plataforma en inglés. Verificar con `pnpm test` y con el e2e de 5.2.
- [ ] 4.3 Crear `components/texto-bilingue.tsx` (design §7 y §10) con test de `renderToStaticMarkup`: con inglés y `original: "es"`, el texto en inglés y la nota "Translated from Spanish"; en español con `original: "es"`, sin nota; con `original: "en"` en español, "Traducido del inglés"; sin inglés, `lang="es"`, "ES" y el texto `sr-only`. Verificar con `pnpm test`.

## 5. Pruebas y ADR

- [ ] 5.1 Crear `e2e/ayudas-idioma.ts` (`textosEnEspanol`, design §11). Verificar que detecta "Elegí un plan" en una página de prueba armada con `page.setContent` y que ignora `lang="es"` y `translate="no"`.
- [ ] 5.2 Crear `e2e/idioma.spec.ts` con los casos (a) a (j) de design §11 (incluido el idioma inicial según el navegador y "Semillas" en el rail) y sumar las variantes en inglés a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/idioma.spec.ts e2e/accesibilidad.spec.ts`.
- [ ] 5.3 Revisar que `docs/decisiones/ADR-004-plataforma-bilingue.md` (Propuesta, con la decisión de Gus anotada; no cambiar el estado: lo pasa Gus al mergear) coincide con lo implementado y que el índice lo lista. Verificar con `pnpm verificar`, `pnpm build` y `pnpm test:e2e` completos.
