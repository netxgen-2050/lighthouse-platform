# Proposal

## Why

Gus (23-oct-2026) pidió que la Vista NetX (`/netx`) deje de ser un tablero de embudo con un título atado al Congreso ("¿Vamos a vender en febrero?", y el Congreso de febrero 2027 se canceló el 23-oct) y pase a ser **un relato para el equipo**: mostrar que NetX tiene un modelo de financiamiento sólido que **no necesita vender lotes**. También pidió que el simulador de la tokenomics (cambio `fogon-simulador-parametros`) salga del Fogón y viva como una pestaña de la Vista NetX: no es una decisión de la comunidad, es una herramienta del equipo.

El 26-oct Gus respondió las preguntas del PR #108 y sumó tres cosas: el relato se cuenta como **Juego A** (el camino conocido: vender tierra) contra **Juego B** (procomún: la tierra queda y el valor crece para todos), los números incómodos quedan a la vista **con la palanca que los movería**, y la Vista NetX **deja de ser solo del super admin**: el relato lo ve toda persona con sesión (en esta etapa, gente de NetXGen); las operaciones siguen siendo del super admin.

Ese mismo día Gus eligió la **opción B** para las operaciones del super admin (pregunta 3 del PR #108): **una página de administración propia, separada de la Vista NetX** (`/admin`), protegida en el servidor y con su ítem en el rail. La Vista NetX queda solo con el relato y los números agregados, igual para toda persona con sesión.

Este es el **primer cambio de dos** (una noche cada uno, esta cargada: ver Riesgos en design). Arma la estructura con pestañas, mueve el simulador y el contenido actual, saca las operaciones a `/admin`, abre el relato a quien tiene sesión y pone la pestaña **Resumen**: en una pantalla, de dónde sale la plata sin vender lotes, con números que salen de funciones puras testeadas contra los RESULTS de `NS_Tokenomics`. El segundo cambio, `vista-netx-modelo-financiamiento`, suma la pestaña de detalle "Modelo de financiamiento".

## What Changes

- **Pestañas de la Vista NetX** (navegación con enlaces, una ruta por pestaña):
  - `/netx` → **Resumen** (nuevo).
  - `/netx/simulador` → **Simulador** (movido desde `/fogon/simulador`).
  - `/netx/comunidad` → **Comunidad y embudo**: los números agregados que hoy muestra `/netx` (indicadores, embudo, cumplimiento y tribus por proyecto, todos de ejemplo), sin operaciones y sin datos de personas.
  - El cambio 2 agrega la pestaña "Modelo de financiamiento" (`/netx/financiamiento`) entre Resumen y Simulador.
  - Las cuatro pestañas son **iguales para toda persona con sesión**: ninguna se esconde según el rol.
- **Página de administración `/admin`** (opción B de Gus, 26-oct), solo super admin, con tres pestañas (rutas):
  - `/admin` → **Pendientes**: postulaciones de comunidades y pedidos de contacto (lo que hoy está al final de `/netx`), con un contador de pendientes.
  - `/admin/personas` → **Personas y roles**: el panel de roles que hoy está en `/netx` (`PanelPersonas`), sin cambios de comportamiento.
  - `/admin/comunidades` → **Comunidades**: las tribus del directorio con su barrio, estado, hogares, roles cubiertos y forma jurídica (datos de ejemplo), con enlace a su ficha. Solo lectura.
  - **Protegida en el servidor:** la ruta entera (`/admin` y todo lo que cuelga) responde **403** a quien no es super admin, también si pide la dirección sin sesión; el servidor no arma el contenido. Además la pantalla lo oculta (`SoloSuperAdmin`), como capa de presentación. Ver design §3 y ADR-016.
  - **Ítem "Admin" en el rail** con el contador de pendientes, visible **solo para el super admin** (al resto no le aparece ni bloqueado).
- **Quién ve qué** (Gus, 26-oct):
  - **Vista NetX entera** (Resumen, Simulador, Comunidad y embudo y, en el cambio 2, Modelo de financiamiento): toda persona **con sesión**, de cualquier nivel. Sin sesión, la plataforma lleva a Sumarte como en cualquier página personal. No es pública: ver design §2.
  - **Operaciones** (`/admin`: pendientes, personas y roles, comunidades): **solo super admin**, controlado en el servidor. Las escrituras y lecturas de personas siguen protegidas también en `/api/personas` (403).
  - El enlace **"NetX"** de la barra superior aparece para toda persona con sesión.
- **Se va el hito del Congreso.** El título "¿Vamos a vender en febrero?" desaparece. El Resumen pregunta "¿Cómo se financia NetX sin vender lotes?"; Comunidad y embudo se llama así. Todo dato que dependa del Congreso se marca: el modelo de ingresos de la plataforma arranca con los registrados "en el encuentro de febrero 2027" y el Pase Fundador se pensó para esa cohorte; la pantalla lo dice ("supuesto del modelo: el Congreso se canceló, falta re-correrlo · NS_Tokenomics I-15") en vez de esconderlo.
- **Lenguaje: Juego A y Juego B.** La pantalla deja de decir "diseño B" (queda solo donde se cita el documento técnico, doc 28). El relato contrasta:
  - **Juego A · el camino conocido**: vender la tierra en lotes, lo que hace la mayoría. Se presenta con respeto y con sus costos en datos: antes de la aprobación no se puede (Ordenanza 173), la plata entra una sola vez y la tierra se va.
  - **Juego B · procomún**: lo que es de todos y se cuida entre todos. La tierra queda en una Fundación, la regeneración y la vida van al centro, y NetX sigue teniendo ingresos por su trabajo. Se presenta como una opción que suma, no como un ataque.
  - Ningún texto nombra a una persona como defensora del Juego A ni usa "capitalista", "extractivista" ni "colonialista". "Procomún" se explica en palabras simples. Elinor Ostrom puede aparecer solo en la nota de fuentes.
- **Simulador movido:** la página y su cliente pasan a `app/netx/simulador/`, con encabezado de la Vista NetX (sin "← Fogón" ni "Fogón de decisiones") y h1 "Simulador de la tokenomics" (la bajada cita "doc 28 · diseño B"). `/fogon` deja de enlazarlo y `/fogon/simulador` redirige a `/netx/simulador`. El simulador en sí no cambia.
- **Pestaña Resumen** (una pantalla, pensada para proyectar):
  - La respuesta en una frase (doc 30): NetX es la empresa que diseña, gestiona y opera la plataforma; cobra por su trabajo, no por vender tierra; **en el Juego B, la tierra queda en una Fundación**.
  - **Juego A y Juego B** en dos columnas cortas, con el tono de arriba.
  - **Tres bolsillos** que nunca se mezclan: **NetX** (SAFE de la empresa, comisión de gestión por serie, comisión de desarrollo, membresías y Plan Tribu, contrato de diseño con BioPueblo "sin dato: a cotizar"), **Procomún · Fundación** (lo que paga cada serie: canon, regalía y excedente; el Pase Fundador va acá, no a NetX) e **Inversores de las series** (Unidades de Regeneración con tope, Notas Verdes, primera pérdida), cada uno con sus números de partida y sus plazos.
  - **Gráfico** "¿Adónde va lo que paga cada serie?" (viñedo y agrovoltaica, valores de partida), en SVG propio con tokens del tema y una tabla equivalente.
  - **Rangos de riesgo** en una línea por serie: TIR de las Unidades P10 / P50 / P90 y probabilidad de perder plata (Monte Carlo, 2.000 futuros).
  - **"Lo que tiene que ser cierto"**, con los cuatro números incómodos a la vista y, al lado de cada uno, **la palanca que lo movería** (qué supuesto o parámetro habría que cambiar y en qué dirección), como texto informativo y sin números nuevos:
    1. NetX vive del SAFE y de contratos de diseño hasta tener ~USD 25 M bajo gestión (USD 24,8 M al 1,5 %, USD 37,2 M al 1 %, con un consumo de USD 31.000 por mes).
    2. Las membresías cubren entre 1,7 % y 10,2 % del consumo al mes 36.
    3. La primera pérdida no se recupera completa en ~60 % de los futuros (60 % viñedo, 61 % agrovoltaica).
    4. El contrato de diseño con BioPueblo, que es el puente, está "sin dato (a cotizar)".
  - **"¿Y vender lotes?"** en tres líneas: no se puede (Ordenanza 173: nada de ofrecer, reservar ni dar prioridad antes de la aprobación), no hace falta (la plata entra por series y por el trabajo de NetX) y en el Juego B la tierra queda en una Fundación. El detalle va en el cambio 2.
  - Avisos: "Prototipo interno · datos de ejemplo" y el aviso del simulador ("valores de partida, no son una oferta ni un pronóstico · el diseño legal no lo revisó un abogado"). Los supuestos a confirmar con Vagner llevan la marca "a confirmar con Vagner".
- **Números con fuente y test** (`lib/financiamiento/`, funciones puras): traducción de `sim/platform_revenue_sim.py` (determinístico) que reproduce `RESULTS_platform_revenue.md`; la cuenta de "capital bajo gestión necesario" del doc 30; los resultados de Monte Carlo copiados como tabla con versión (no se pueden reproducir en el navegador: ver ADR-014); los textos de Juego A, Juego B y las palancas como datos con fuente; y un armado del resumen que usa `correrSerie` de `lib/series` con los valores de partida. Cada número que falta es `null` → "sin dato".

**Depende de `fogon-simulador-parametros`** (spec PR #96, implementación PR #107, rama `agente/fogon-simulador-parametros`): hoy (26-oct) **no está en `dev`**. Este cambio usa su `lib/series/`, su pantalla y su ADR-010. Si cuando corra la noche `lib/series/` no está en `dev`, el implementador **frena y reporta**; no copia la rama.

**Decidido por Gus (26-oct-2026), ya no son preguntas:**
- Los números incómodos quedan visibles, cada uno con su palanca. Las palancas son texto: no se editan los modelos de `NS_Tokenomics` ni se inventan números.
- La vista trabaja bajo las asunciones legales del diseño definidas hasta ahora: es la excepción de prototipo interno a D9 del backlog ("documentar, no construir, hasta que haya abogado"). Los textos con peso legal llevan ⚖ y "a verificar con abogado".
- Instrumentos (SAFU, oferta privada, tokenización CNV): alcanza con ⚖ y "a verificar con abogado". No hay presupuesto para consultoría legal; se redacta desde lo que sabemos, en borrador.
- La Vista NetX se abre entera a toda persona con sesión; las operaciones salen a `/admin`.
- Operaciones del super admin: **opción B**, página de administración propia (`/admin`) con pestañas Pendientes, Personas y roles y Comunidades, ítem "Admin" en el rail con contador solo para el super admin, y la ruta protegida en el servidor (403) además de en la pantalla.

**Supuestos que toma esta spec** (Gus puede cambiarlos):
- Pestañas como rutas (enlaces con `aria-current="page"`), no como pestañas ARIA dentro de una página: cada pestaña se puede abrir por dirección en una reunión y el lector de pantalla la anuncia como navegación. Vale para `/netx` y para `/admin`.
- "Pendiente" = todo lo recibido en este navegador: hoy no hay forma de responder ni archivar un pedido o una postulación (están "Recibida (simulado)"), así que el contador es la suma de postulaciones y pedidos guardados. Cuando exista responder (backlog B6), el contador cuenta solo lo no respondido.
- "Comunidades" muestra las tribus del directorio (`listarTribus`, datos de ejemplo), solo lectura. Qué acciones tendría (aprobar, editar, cambiar líder) queda para otro cambio.
- El ítem "Admin" va en el rail en un grupo propio al final ("Interno"), y no reemplaza al enlace "NetX" de la barra superior.
- Para que el servidor sepa quién pide `/admin`, el navegador del super admin manda su sesión en una cookie limitada a `/admin` (design §3.3, ADR-016). Es el primer paso de "control en el servidor" de ADR-015, solo para `/admin`.
- `RESULTS_value_model.md` es de la tokenomics anterior al diseño B (RAIZ con curva y unidades sobre la tierra): **no se usa** en la vista.

## Fuera de alcance

- La pestaña "Modelo de financiamiento" (etapas en el tiempo, recorridos de inversores, Serie Madre y SAFU, comparación completa entre Juego A y Juego B, todos los supuestos): cambio 2, `vista-netx-modelo-financiamiento`.
- Responder, aprobar, archivar o borrar pendientes desde `/admin` (backlog B6, `aprobaciones-admin` P8): esta noche solo se listan.
- Pasar la bandeja de pedidos o las postulaciones a la base: siguen leyendo el almacenamiento de **este navegador**.
- Roles reales en la base más allá de lo que ya edita el panel (backlog B2), o un rol "admin" distinto del super admin.
- Proteger en el servidor otras páginas además de `/admin` (la Vista NetX sigue con el control en el navegador, ADR-015).
- Traducir `/admin` al inglés: queda en español con el aviso de página sin traducir.
- Datos reales de la base, plata real, cobros u ofertas: nada se capta, todo es de ejemplo.
- Editar los modelos de `NS_Tokenomics` o re-correrlos (por ejemplo sin el Congreso, I-15, o con las palancas movidas): si cambian, otro cambio actualiza números y versión (ADR-010).
- Cambiar el simulador (controles, modelo, textos) más allá de su ubicación, su encabezado y su h1.
- Correr Monte Carlo en el navegador o mover sus supuestos.
- Versión en inglés.
- Mostrar la Vista NetX fuera de NetXGen: antes se revisan estas reglas (R14).

## Capabilities

### New Capabilities
- `vista-netx-financiamiento`: la Vista NetX como relato con pestañas para el equipo: navegación, quién ve qué, pestaña Resumen (cómo se financia NetX sin vender lotes, Juego A y Juego B, palancas), pestaña Comunidad y embudo, y la ubicación del simulador.
- `modelo-financiamiento`: los números del financiamiento de NetX, del procomún y de los inversores como funciones puras con fuente, versión y tests que reproducen los RESULTS de `NS_Tokenomics`, más los textos del relato (juegos y palancas) como datos con fuente.
- `admin-operaciones`: la página de administración del super admin (`/admin`): pestañas Pendientes, Personas y roles y Comunidades, ítem "Admin" del rail con contador, y la protección de la ruta en el servidor (403).

### Modified Capabilities
- `fogon-simulador` (del cambio `fogon-simulador-parametros`, todavía sin archivar): el acceso pasa del Fogón a la Vista NetX, para toda persona con sesión.

## Impact

- Código nuevo: `lib/financiamiento/` (fuentes, plataforma, pista, riesgo, juegos, palancas, resumen y tests), `app/netx/layout.tsx` y `app/netx/pestanas.tsx`, `app/netx/comunidad/page.tsx`, `app/netx/resumen.tsx` (o similar), `components/barras-reparto.tsx` (gráfico de barras con tabla).
- Código nuevo de `/admin`: `app/admin/layout.tsx`, `app/admin/pestanas.tsx`, `app/admin/page.tsx` (Pendientes), `app/admin/personas/page.tsx`, `app/admin/comunidades/page.tsx`, `app/forbidden.tsx` (página 403), `lib/admin/pendientes.ts` (contador, función pura), `lib/sesion/pagina.ts` (`sesionDeLaPagina`, `exigirSuperAdmin`), `components/rail-admin.tsx` (ítem del rail con contador).
- Código movido: `app/netx/page.tsx` → `app/netx/comunidad/page.tsx` (sin las operaciones); `app/netx/bandeja-pedidos.tsx` y `app/netx/postulaciones-comunidades.tsx` → `app/admin/`; `app/fogon/simulador/*` → `app/netx/simulador/*`; `app/fogon/simulador/page.tsx` queda como redirección. `app/fogon/page.tsx` pierde el bloque del simulador.
- **Permisos:** `lib/permisos/niveles.ts` suma la capacidad `vista-netx` (nivel Explorador) para todo `/netx`, y la capacidad `netx` (super admin) pasa a llamarse `admin` y a cubrir `/admin`. `components/sesion/enlace-netx.tsx` muestra el enlace a toda persona con sesión. `SoloSuperAdmin` cambia su texto a "La administración es solo para el super admin del prototipo." `next.config.ts` activa `experimental.authInterrupts` para usar `forbidden()` (403). `components/sesion/proveedor-sesion.tsx` escribe y borra la cookie de sesión de `/admin` (solo para el super admin con Privy).
- Tests: `lib/permisos/niveles.test.ts`, `lib/admin/pendientes.test.ts`, `lib/sesion/pagina.test.ts`, `e2e/vista-netx.spec.ts` (rutas, título, acceso por rol), `e2e/admin.spec.ts` (nuevo: 403, rail, pestañas, contador), `e2e/fogon-simulador.spec.ts` → `e2e/netx-simulador.spec.ts`, rutas en `e2e/contactos.spec.ts`, `e2e/postulacion.spec.ts`, `e2e/accesibilidad.spec.ts` y `e2e/login.spec.ts` donde prueban la bandeja, las postulaciones, el panel de personas, el título viejo o el "sin acceso".
- Decisiones: **ADR-014** (en Propuesta) amplía ADR-010: los resultados de Monte Carlo se copian como tabla versionada. **ADR-016** (en Propuesta, nuevo): `/admin` se protege en el servidor con la sesión en una cookie limitada a `/admin`; es el primer paso de la opción C de ADR-015, solo para esa ruta.
- Sin dependencias nuevas, sin tablas ni migraciones, sin pedidos de red nuevos, sin datos personales nuevos. **Toca permisos e identidad**: la Vista NetX pasa de super admin a toda persona con sesión, y `/admin` lee la sesión en el servidor desde una cookie. Revisión del arquitecto pendiente (ver resumen del PR).
