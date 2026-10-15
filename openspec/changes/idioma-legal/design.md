# Design

## Context

- `congreso-bilingue` ya sumó `en` a 4 claves del catálogo, `idioma?` a `TerminoLegal` (por defecto `"es"`) y la regla de bitácora: `idioma` es el del texto mostrado y toda entrada `"en"` va con `borrador: true`.
- `consentimiento-alta` dejó `VERSIONES_POLITICA` con cambios por versión, `canal` en el registro, `bloque-consentimiento.tsx` y `paso-alta.tsx`.
- `idioma-base` dejó el idioma de la plataforma en un contexto (`useIdioma`), `idiomaDelPedido()` en el servidor y `RUTAS_TRADUCIDAS`.

## Goals / Non-Goals

**Goals:** todo lo legal legible en inglés, siempre marcado como borrador y como traducción no revisada; constancia del idioma aceptado.

**Non-Goals:** revisión legal, cambiar el fondo de la política, sumar R16 al catálogo.

## Decisions

### 1. Catálogo ⚖
- Cada clave de `TERMINOS` suma `en: { titulo, texto }` con el comentario "Traducción nueva: borrador a revisar antes de cualquier uso real". El tipo pasa a exigir `en` en todas (deja de ser opcional), así una clave nueva sin inglés no compila.
- `TerminoLegal` sin `idioma` usa `useIdioma()`. La anotación en la bitácora no cambia (ya cubre `idioma` y `borrador`).
<!-- arquitecto: la bitácora tiene que decir qué texto se mostró de verdad. -->
- `useIdioma()` devuelve el idioma **del contenido**, no el de la plataforma: dentro de una página sin traducir es `"es"` (la puerta anida `ProveedorIdioma idioma="es"`, `idioma-base` design §7). Así el ⚖ de una página en español se muestra y se anota en español aunque la plataforma esté en inglés, y nunca queda una entrada `idioma: "en"` de un texto que la persona vio en español. Test: `TerminoLegal` dentro del envoltorio anota `idioma: "es"`.
- La entrada sigue calculando `mostrado` y `huella` sobre el texto que se dibujó (regla de `congreso-bilingue`): la huella en inglés es distinta de la española, así que la bitácora distingue qué traducción se vio aunque el texto cambie después.

### 2. Política en dos idiomas
- `lib/privacidad/politica.ts` exporta `politica(idioma)` con la misma forma que hoy (`RESUMEN`, `DATOS_POR_PANTALLA`, …) para cada idioma: `const ES = {...}` y `const EN: Textos<typeof ES>`. Las constantes de hoy se mantienen como alias del español para no romper importaciones.
- `RESPONSABLE.contacto`, `UBICACION_DATOS` y nombres de encargados (Privy, Vercel, Neon, GitHub) son neutros.
- El español **no cambia**: la fila de la cookie `lh-idioma`, la finalidad de novedades por email y los tres cambios listados de `2026-10-15-borrador` ya los dejó `consentimiento-alta` (su design §5). Este cambio escribe su inglés, incluida la lista "What changed" de esa versión.
- `VERSIONES_POLITICA` **no suma versión**: `VERSION_POLITICA` sigue siendo `2026-10-15-borrador`.

### 3. Aviso de traducción
- En `/privacidad` en inglés, arriba: "Draft translation, not reviewed by the legal team. The Spanish version is the reference." con enlace "Read it in Spanish" a `/privacidad?lang=es` (`hreflang="es"`). En la pantalla de consentimiento y el paso del alta, en inglés, la línea de borrador dice además "(draft translation)".

### 4. Idioma en el registro
- `Consentimiento` suma `idioma?: "es" | "en"`; `registrarConsentimiento` lo recibe del idioma de la plataforma en el momento de aceptar (en el alta, se guarda en la aceptación previa junto con la versión). `leerConsentimiento` acepta registros sin `idioma` (= `"es"`) y descarta valores fuera de `es`/`en`. El registro de novedades (`lib/privacidad/novedades.ts`) suma `idioma` con la misma regla.
- Con la base: columna `idioma` enum `es` · `en` nula (nulo = `es`), que **ya crea la primera migración de `base-neon`** (decisión de Gus, 15-oct-2026; forma completa en `consentimiento-alta` design §7.1 y ADR-005).
- **Versión e idioma juntos identifican el texto aceptado:** la versión de la política cubre los dos idiomas. Publicar la **primera** traducción de una versión no la sube (no había otro texto en inglés con esa versión, así que no hay ambigüedad); **corregir** después una traducción ya publicada sí sube la versión: no puede haber dos textos en inglés distintos con la misma versión.

### 5. Una sola subida de versión (decisión de Gus, 15-oct-2026)
<!-- arquitecto: dos re-consentimientos seguidos para el mismo equipo. --> Resuelto: `consentimiento-alta` sube a `2026-10-15-borrador` e informa ya la cookie de idioma y las novedades; este cambio no sube. El equipo acepta una sola vez.
- Si `consentimiento-alta` llega a `main` antes que `idioma-base`, la política describe la cookie en condicional ("si elegís un idioma") antes de que exista el selector: informa de más, no de menos. Si llega después, la cookie existió unos días sin estar en la política: es una cookie de interfaz exenta de consentimiento y sin identidad (riesgo bajo).
- Una persona que aceptó `2026-10-15-borrador` en español **no** vuelve a ver la pantalla al mergear este cambio, aunque pase la plataforma a inglés: aceptó la misma versión. La constancia dice que aceptó en español.

## Risks / Trade-offs

- [Una persona acepta un texto en inglés que nadie revisó] → es el prototipo interno (CLAUDE.md); queda marcado en pantalla, en la bitácora y en la constancia; antes de mostrarlo fuera del equipo se revisa (R14, L10).
- [Una persona que aceptó en español y pasa a inglés no re-acepta en inglés] → es el mismo contenido y la misma versión; la constancia dice en qué idioma aceptó. Si Gus quiere pedir la aceptación en inglés a quien cambie de idioma, es otro cambio.
- [El inglés legal lo escribe un agente] → borrador marcado y `pendiente` en la lista de revisión nativa de `idioma-base` (`lib/legal/terminos.ts`, `lib/privacidad/politica.ts`, `lib/legal/estado-administrativo.ts`, `textos/legal`, `textos/privacidad`).
- [42 traducciones legales en una noche] → son textos cortos; el test atrapa faltantes y copias, no la calidad.

## Migration Plan

- Rama `agente/idioma-legal`, después de `idioma-base` y `consentimiento-alta`.
- Volver atrás: revertir el PR; los registros con `idioma` se siguen leyendo con el código viejo (ignora el campo) y son de la misma versión, así que nadie vuelve a aceptar.

## Open Questions

- Revisión del agente arquitecto pendiente (campo nuevo en el registro del consentimiento).
