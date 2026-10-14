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

### 2. Política en dos idiomas
- `lib/privacidad/politica.ts` exporta `politica(idioma)` con la misma forma que hoy (`RESUMEN`, `DATOS_POR_PANTALLA`, …) para cada idioma: `const ES = {...}` y `const EN: Textos<typeof ES>`. Las constantes de hoy se mantienen como alias del español para no romper importaciones.
- `RESPONSABLE.contacto`, `UBICACION_DATOS` y nombres de encargados (Privy, Vercel, Neon, GitHub) son neutros.
- Fila nueva en `DATOS_POR_PANTALLA` (los dos idiomas): "Configuración · El idioma que elegís, en una cookie del navegador (`lh-idioma`) y en tus preferencias. · Hoy, en tu navegador. Con la base, en Neon."
- Versión nueva en `VERSIONES_POLITICA` con el cambio "Ahora guardamos en tu navegador el idioma que elegís, para mostrarte la plataforma en ese idioma." / inglés equivalente.

### 3. Aviso de traducción
- En `/privacidad` en inglés, arriba: "Draft translation, not reviewed by the legal team. The Spanish version is the reference." con enlace "Read it in Spanish" a `/privacidad?lang=es` (`hreflang="es"`). En la pantalla de consentimiento y el paso del alta, en inglés, la línea de borrador dice además "(draft translation)".

### 4. Idioma en el registro
- `Consentimiento` suma `idioma?: "es" | "en"`; `registrarConsentimiento` lo recibe del idioma de la plataforma en el momento de aceptar (en el alta, se guarda en la aceptación previa junto con la versión). `leerConsentimiento` acepta registros sin `idioma` (= `"es"`) y descarta valores fuera de `es`/`en`.
- Con la base: columna `idioma text null` en `consentimientos`, junto con `canal`, en el cambio que mude el consentimiento a la base.

## Risks / Trade-offs

- [Una persona acepta un texto en inglés que nadie revisó] → es el prototipo interno (CLAUDE.md); queda marcado en pantalla, en la bitácora y en la constancia; antes de mostrarlo fuera del equipo se revisa (R14, L10).
- [Subir la versión otra vez obliga a re-aceptar] → es lo correcto porque cambia lo informado; si Gus prefiere, se agrupa con la próxima versión.
- [42 traducciones legales en una noche] → son textos cortos; el test atrapa faltantes y copias, no la calidad.

## Migration Plan

- Rama `agente/idioma-legal`, después de `idioma-base` y `consentimiento-alta`.
- Volver atrás: revertir el PR; los registros con `idioma` se siguen leyendo con el código viejo (ignora el campo) pero son de la versión nueva, que el código viejo no conoce: vuelve a pedir el consentimiento una vez.

## Open Questions

- Revisión del agente arquitecto pendiente (campo nuevo en el registro del consentimiento).
