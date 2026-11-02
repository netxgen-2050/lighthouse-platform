# Proposal

## Why

Decisión de Gus (14-oct-2026), que cierra el ciclo del POC antes de la base de datos: **la puerta de entrada es Sumarte**. Cómo se suma una persona define qué puede hacer; los roles dejan de venir de una lista fija. La pantalla de entrada que aparecía en cada sección bloqueada ya no hace falta.

## What Changes

- **Sumarte vuelve a ser pública** (junto con Descubrir). Es donde una persona sin cuenta elige cómo sumarse y, al elegir, **se registra o entra con Privy** (email o Google), sin salir de la página.
- **Niveles según cómo se suma** (en el orden de los planes de Sumarte):
  - **Sin cuenta**: Descubrir (Inicio, Territorio, Tribus) y Sumarte.
  - **Explorador** (gratis): además **Hifa**, **Congreso** y su espacio personal (Perfil, Pasaporte, Mi recorrido, Bandeja, Configuración), y el botón Reportar.
  - **Miembro** (plan Miembro o **Pase Fundador**): además **Participar** (Pactos, Semillas, Fogón, Compromisos) y adherir a tribus. El Pase Fundador suma sus sellos de fundador, como hoy.
  - **Líder de tribu** (**Plan Tribu**, la última opción): todo lo de Miembro y **admin de su tribu**. Al elegir el Plan Tribu, la persona elige qué tribu lidera entre las existentes (en el POC: Valle Solar u otra activa o en formación) o "Proponer una tribu nueva" (lleva a la postulación de un barrio vacante).
  - **Super admin**: solo por la variable `LH_PERSONAS` (Gus), además ve NetX.
- **El nivel se guarda por persona** (en el navegador, con el prefijo de la persona, hasta que `base-neon` lo pase a la base) y se puede cambiar volviendo a Sumarte (subir o bajar de plan, simulado, sin cobro).
- **Acceso abierto**: cualquier persona que se registre con Privy entra como Explorador como mínimo. `LH_PERSONAS` deja de ser una lista de acceso y pasa a ser solo **ajustes por email** (por ejemplo, quién es super admin o un nivel asignado de antemano para el equipo). La variable `LH_ACCESO=lista` permite volver a la lista cerrada si hiciera falta.
- **Sin pantallas de entrada repetidas**:
  - En el rail, los destinos que el nivel actual no habilita aparecen **deshabilitados** (no clicables, con `aria-disabled`) y con la ayuda "Sumate para participar" (o "Sumate gratis para usar esto" para lo de Explorador), más un enlace visible a Sumarte.
  - Si alguien abre por dirección una página que su nivel no habilita, va a **`/sumarte`** con un aviso de qué plan la habilita (y vuelve a esa página después de sumarse).
  - Los "Entrá para…" pasan a ser **"Sumate para…"** y llevan a Sumarte.
  - La barra superior sin sesión muestra **"Sumarte"** (destacado) y **"Entrar"** (para quien ya tiene cuenta).
- Los permisos de cada nivel salen del servicio de permisos (`lib/permisos/`), que ya calcula qué abre cada plan; el rail, las páginas y las acciones lo consultan.

**Fuera de alcance:** cobros reales, aprobación del super admin para ser líder de tribu (llega con la base), varias tribus por líder.

## Capabilities

### New Capabilities
- `sumarte-acceso`: registrarse desde Sumarte y que el nivel elegido defina qué se puede usar.

### Modified Capabilities

## Impact

`app/sumarte/` (registro y elección de nivel, elección de tribu en el Plan Tribu), `lib/sesion/` (nivel por persona, acceso abierto, `LH_PERSONAS` como ajustes, `LH_ACCESO`), `components/sesion/puerta.tsx` (sin pantalla de entrada; redirección a Sumarte), `lib/sesion/rutas-publicas.ts` (suma `/sumarte`), `components/rail.tsx`, `components/barra-superior.tsx`, Hifa y Reportar (desde Explorador), las acciones "Sumate para…", `lib/permisos/` (niveles), e2e (el fixture de login elige un nivel).
