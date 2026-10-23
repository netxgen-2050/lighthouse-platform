# Proposal

## Why

Gus (23-oct-2026) pidió que la Vista NetX (`/netx`, solo super admin) deje de ser un tablero de embudo con un título atado al Congreso ("¿Vamos a vender en febrero?", y el Congreso de febrero 2027 se canceló el 23-oct) y pase a ser **un relato para una reunión**: convencer a Franz (CEO) y a Vagner (finanzas) de que NetX tiene un modelo de financiamiento sólido que **no necesita vender lotes**. También pidió que el simulador de la tokenomics (cambio `fogon-simulador-parametros`) salga del Fogón y viva como una pestaña de la Vista NetX: no es una decisión de la comunidad, es una herramienta del equipo.

Este es el **primer cambio de dos** (una noche cada uno). Arma la estructura con pestañas, mueve el simulador y el contenido actual, y pone la pestaña **Resumen**: en una pantalla, de dónde sale la plata sin vender lotes, con números que salen de funciones puras testeadas contra los RESULTS de `NS_Tokenomics`. El segundo cambio, `vista-netx-modelo-financiamiento`, suma la pestaña de detalle "Modelo de financiamiento".

## What Changes

- **Pestañas de la Vista NetX** (navegación con enlaces, una ruta por pestaña, todas detrás del mismo control de super admin):
  - `/netx` → **Resumen** (nuevo).
  - `/netx/simulador` → **Simulador** (movido desde `/fogon/simulador`).
  - `/netx/comunidad` → **Comunidad y embudo**: todo lo que hoy muestra `/netx` (indicadores, embudo, cumplimiento, tribus por proyecto, panel de personas, postulaciones de comunidades y bandeja de pedidos), sin cambios de comportamiento.
  - El cambio 2 agrega la pestaña "Modelo de financiamiento" (`/netx/financiamiento`) entre Resumen y Simulador.
- **Se va el hito del Congreso.** El título "¿Vamos a vender en febrero?" desaparece. El Resumen pregunta "¿Cómo se financia NetX sin vender lotes?"; Comunidad y embudo se llama así. Todo dato que dependa del Congreso se marca: el modelo de ingresos de la plataforma arranca con los registrados "en el encuentro de febrero 2027" y el Pase Fundador se pensó para esa cohorte; la pantalla lo dice ("supuesto del modelo: el Congreso se canceló, falta re-correrlo · NS_Tokenomics I-15") en vez de esconderlo.
- **Simulador movido:** la página y su cliente pasan a `app/netx/simulador/`, con encabezado de la Vista NetX (sin "← Fogón" ni "Fogón de decisiones"); `/fogon` deja de enlazarlo; `/fogon/simulador` redirige a `/netx/simulador` (quien no es super admin ve "No tenés acceso"). El simulador en sí no cambia.
- **Pestaña Resumen** (una pantalla, pensada para proyectar):
  - La respuesta en una frase (doc 30): NetX es la empresa que diseña, gestiona y opera la plataforma; cobra por su trabajo, no por vender tierra.
  - **Tres bolsillos** que nunca se mezclan: **NetX** (SAFE de la empresa, comisión de gestión por serie, comisión de desarrollo, membresías y Plan Tribu, contrato de diseño con BioPueblo "sin dato: a cotizar"), **Procomún · Fundación** (lo que paga cada serie: canon, regalía y excedente; el Pase Fundador va acá, no a NetX) e **Inversores de las series** (Unidades de Regeneración con tope, Notas Verdes, primera pérdida), cada uno con sus números de partida y sus plazos.
  - **Gráfico** "¿Adónde va lo que paga cada serie?" (viñedo y agrovoltaica, valores de partida), en SVG propio con tokens del tema y una tabla equivalente.
  - **Rangos de riesgo** en una línea por serie: TIR de las Unidades P10 / P50 / P90 y probabilidad de perder plata (Monte Carlo, 2.000 futuros).
  - **"Lo que tiene que ser cierto"**: el consumo del equipo (USD 31.000 por mes), cuánto capital bajo gestión hace falta para cubrirlo solo con comisiones (USD 24,8 M al 1,5 %, USD 37,2 M al 1 %) y qué cubre el puente mientras tanto (SAFE, contratos de diseño, comisiones de desarrollo). Las membresías cubren entre 1,7 % y 10,2 % del consumo al mes 36: se dice así.
  - **"¿Y vender lotes?"** en tres líneas: no se puede (Ordenanza 173: nada de ofrecer, reservar ni dar prioridad antes de la aprobación), no hace falta (la plata entra por series y por el trabajo de NetX) y en el diseño B la tierra del Lighthouse es de la Fundación. El detalle va en el cambio 2.
  - Avisos: "Prototipo interno · datos de ejemplo" y el aviso del simulador ("valores de partida, no son una oferta ni un pronóstico · el diseño legal no lo revisó un abogado"). Los supuestos a confirmar con Vagner llevan la marca "a confirmar con Vagner".
- **Números con fuente y test** (`lib/financiamiento/`, funciones puras): traducción de `sim/platform_revenue_sim.py` (determinístico) que reproduce `RESULTS_platform_revenue.md`; la cuenta de "capital bajo gestión necesario" del doc 30; los resultados de Monte Carlo copiados como tabla con versión (no se pueden reproducir en el navegador: ver ADR-014); y un armado del resumen que usa `correrSerie` de `lib/series` con los valores de partida. Cada número que falta es `null` → "sin dato".

**Depende de `fogon-simulador-parametros`** (spec PR #96, implementación PR #107, rama `agente/fogon-simulador-parametros`): hoy (23-oct) **no está en `dev`**. Este cambio usa su `lib/series/`, su pantalla y su ADR-010. Si cuando corra la noche `lib/series/` no está en `dev`, el implementador **frena y reporta**; no copia la rama.

**Supuestos que toma esta spec** (Gus puede cambiarlos):
- Pestañas como rutas (enlaces con `aria-current="page"`), no como pestañas ARIA dentro de una página: cada pestaña se puede abrir por dirección en una reunión y el lector de pantalla la anuncia como navegación.
- Las operaciones del super admin (personas, postulaciones, bandeja) quedan en "Comunidad y embudo" para que el Resumen sea solo el relato.
- `RESULTS_value_model.md` es de la tokenomics anterior al diseño B (RAIZ con curva y unidades sobre la tierra): **no se usa** en la vista.

## Fuera de alcance

- La pestaña "Modelo de financiamiento" (etapas en el tiempo, recorridos de inversores, Serie Madre y SAFU, comparación completa contra vender lotes, todos los supuestos): cambio 2, `vista-netx-modelo-financiamiento`.
- Datos reales de la base, plata real, cobros u ofertas: nada se capta, todo es de ejemplo.
- Editar los modelos de `NS_Tokenomics` o re-correrlos (por ejemplo sin el Congreso, I-15): si cambian, otro cambio actualiza números y versión (ADR-010).
- Cambiar el simulador (controles, modelo, textos) más allá de su ubicación y su encabezado.
- Correr Monte Carlo en el navegador o mover sus supuestos.
- Versión en inglés.
- Cambiar el modelo de permisos: `/netx/*` ya pide super admin (`lib/permisos/niveles.ts`); el simulador solo pasa de "participar" a "super admin" por estar dentro de `/netx`.

## Capabilities

### New Capabilities
- `vista-netx-financiamiento`: la Vista NetX como relato con pestañas para el equipo directivo: navegación, pestaña Resumen (cómo se financia NetX sin vender lotes), pestaña Comunidad y embudo, y la ubicación del simulador.
- `modelo-financiamiento`: los números del financiamiento de NetX, del procomún y de los inversores como funciones puras con fuente, versión y tests que reproducen los RESULTS de `NS_Tokenomics`.

### Modified Capabilities
- `fogon-simulador` (del cambio `fogon-simulador-parametros`, todavía sin archivar): el acceso pasa del Fogón a la Vista NetX.

## Impact

- Código nuevo: `lib/financiamiento/` (fuentes, plataforma, pista, riesgo, resumen y tests), `app/netx/layout.tsx` y `app/netx/pestanas.tsx`, `app/netx/comunidad/page.tsx`, `app/netx/resumen.tsx` (o similar), `components/barras-reparto.tsx` (gráfico de barras con tabla).
- Código movido: `app/netx/page.tsx` → `app/netx/comunidad/page.tsx`; `app/fogon/simulador/*` → `app/netx/simulador/*`; `app/fogon/simulador/page.tsx` queda como redirección. `app/fogon/page.tsx` pierde el bloque del simulador.
- Tests: `e2e/vista-netx.spec.ts` (rutas y título), `e2e/fogon-simulador.spec.ts` → `e2e/netx-simulador.spec.ts`, rutas de `/netx` en `e2e/contactos.spec.ts`, `e2e/postulacion.spec.ts`, `e2e/accesibilidad.spec.ts` y `e2e/login.spec.ts` donde prueban la bandeja, las postulaciones o el título viejo.
- Decisión: **ADR-014** (en Propuesta) amplía ADR-010: los resultados de Monte Carlo se copian como tabla versionada, no se recalculan.
- Sin dependencias nuevas, sin base de datos, sin pedidos de red, sin datos personales nuevos. Toca permisos solo en que el simulador queda detrás del control de super admin de `/netx`.
