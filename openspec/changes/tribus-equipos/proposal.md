# Proposal

## Why

Las 12 tribus de `/tribus` eran datos de ejemplo para arrancar, pero hoy se leen como si existieran. Lo que el Lighthouse necesita ahora son **equipos de trabajo** preliminares que resuelvan lo urgente: agua, acceso, vivero, papeles, comunicación. El 29-oct-2026 Gus aprobó un boceto (`NS_platform/Documentation/mockup/territorio-vistas-boceto.html`) y fijó tres cosas:

- los equipos **son los círculos del común** de la holarquía (`fogon-gobernanza-holarquia`) y del manifiesto (`manifiesto-lighthouse-vrn`), no una entidad nueva;
- un **frente de trabajo** es lo que un equipo hace en un lugar;
- las tribus por barrio quedan como **visión**, marcadas "ejemplo, a definir".

Este es el primero de dos cambios. Arma los datos (frentes y fases), la sección Tribus con dos pestañas y el "Quiero sumarme". El segundo, `territorio-vistas`, lleva los frentes al mapa con el selector de vistas y la línea de tiempo.

## What Changes

- **Fases del Lighthouse** (`lib/territorios/fases.ts`, es/en). Son tres:
  - 0 · hoy, equipos semilla;
  - 1 · 2027, primeras comunidades;
  - 2 · barrios con tribus.

  `FASE_ACTUAL = 0`. Las usa este cambio y, después, la línea de tiempo del mapa.
- **Frentes de trabajo de ejemplo** (`lib/equipos/frentes.ts`, es/en). Son los 8 del boceto. Cada frente tiene:
  - nombre;
  - equipo, que es el id de un círculo del común;
  - necesidad;
  - quién falta, o "sin dato";
  - para cuándo, o "sin dato";
  - fase desde la que corre;
  - lugar en el mapa del Macrolote 7 (punto ilustrativo), o "sin lugar en el mapa" (Legal y Comunicación).

  Todos llevan la marca de ejemplo. Un test valida varias cosas:
  - que el equipo exista entre los círculos del común;
  - que los ids no se repitan;
  - que cada punto caiga dentro del Macrolote 7;
  - que lo que falta sea `null` y nunca un texto vacío ni un 0.
- **Equipo de obra.** El boceto tiene un "Equipo de obra" que no existe entre los círculos de hoy. Se asigna a **Gestión de contratistas** (`comun-contratistas`), el círculo que agrega `manifiesto-lighthouse-vrn` (design §6). Si al implementar ese círculo todavía no está en `dev`, este cambio lo agrega con los mismos datos: mismo id, nombre, propósito y "Decide sobre". Así no importa cuál de los dos cambios entre primero.
- **Sección Tribus con dos pestañas**, como enlaces con `aria-current`:
  - **"Equipos · ahora"**: es la pestaña por defecto.
  - **"Tribus · visión"** (`/tribus?ver=tribus`).
- **Pestaña Equipos.** Tiene la explicación del boceto y una tarjeta por círculo del común. Primero van los que tienen frentes en la fase actual.

  Cada tarjeta muestra:
  - el nombre;
  - lo que decide;
  - sus frentes, cada uno con su necesidad, lo que falta, para cuándo y el lugar ("En el mapa del Lighthouse (ilustrativo)" o "Sin lugar en el mapa");
  - los frentes de una fase futura, como "Más adelante · fase N".

  Un círculo sin frentes dice "Sin frentes abiertos por ahora". La pestaña también aclara: "Un equipo puede volverse una tribu más adelante; el proceso está por definir".
- **Pestaña Tribus · visión.** Muestra el listado de hoy (activas, en formación, vacantes y "Proponer una comunidad"), sin borrar nada. Arriba lleva el aviso "Ejemplo, a definir: estas tribus son ejemplos para pensar hacia dónde va el Lighthouse, no tribus reales", y cada tarjeta lleva la marca "Ejemplo · a definir". La ficha `/tribus/<id>` también muestra esa marca.
- **"Quiero sumarme a <equipo>"**: es postularse como **aspirante del círculo**. Se reusa la regla de `pacto-puntual`: la aspirante es quien pidió sumarse adhiriendo al manifiesto. Para un círculo del común, ese manifiesto es el del Lighthouse. Según quién mira:
  - Sin sesión: "Entrá para sumarte".
  - Con un plan que no puede adherir (la capacidad `adherir` de `lib/permisos`): el mismo aviso que ve hoy en el manifiesto.
  - Sin adhesión al Lighthouse (`lighthouse` ni pedido ni miembro): "Para sumarte, primero sumate como aspirante al Lighthouse", con enlace a `/tribus/lighthouse/manifiesto`.
  - Con adhesión: el botón abre una confirmación en el lugar. Dice que lo administra y facilita Hifa (simulado, experimental) y que, mientras tanto, responde el super admin. Al confirmar, se guarda el pedido en el navegador y se lee "Pediste sumarte a <equipo> · aspirante".
- **Clave nueva del navegador** `lh-equipos`: `{ [circuloId]: "pedido" }`, con el prefijo de la persona como las demás. La descarga y el borrado de `/mis-datos` la incluyen. No se usa la clave de membresía, para que un id de círculo no se cuele en Perfil, Pasaporte, Semillas ni Pactos, que recorren esa clave.
- Textos es/en con voseo. El inglés de los datos de ejemplo va a `lib/idioma/revision-nativa.ts`.

**Fuera de alcance:**
- **Postularse para tomar una tarea concreta de un frente** (necesidad con horas y pacto puntual). Hace falta que los círculos del común entren en `holonDeId` y `relacionConHolon`, y que el Lighthouse acepte pactos puntuales: Gus lo dejó "por ahora solo fijo" el 28-oct. Va en un cambio aparte cuando Gus lo decida (ver preguntas).
- **Aceptar o rechazar a la aspirante** desde la pantalla (B6), retirar el pedido y el aviso en Mi recorrido.
- **El proceso para que un equipo se vuelva tribu**: solo se anota.
- **Comunidades postulantes como entidad** (D1).
- Cambiar las 12 tribus en otras pantallas (portada, Fogón, holarquía, pactos): siguen como hoy.
- **El mapa**: frentes, vistas y línea de tiempo van en `territorio-vistas`.
- **Capas temporales con fechas (D17)**: solo se deja el modelo por fase.
- Términos ⚖ nuevos: no hacen falta.

## Capabilities

### New Capabilities
- `equipos-de-trabajo`: los equipos (círculos del común) con sus frentes de trabajo por fase y lugar, y el pedido para sumarse como aspirante del círculo.
- `tribus-secciones`: la sección Tribus con las pestañas "Equipos · ahora" y "Tribus · visión", y la marca "ejemplo, a definir" en las tribus.

### Modified Capabilities

`directorio-tribus` (de `tribus-directorio`) todavía no está archivada. Este cambio pasa su listado a la pestaña "Tribus · visión" sin cambiar sus requisitos y le suma la marca "ejemplo, a definir" (ver `tribus-secciones`).

## Impact

- **Código nuevo:**
  - `lib/territorios/fases.ts` y `lib/equipos/frentes.ts`, con sus tests;
  - `lib/equipos/equipos.ts`, puro: equipos con sus frentes, orden, lectura y escritura de `lh-equipos`, y la regla de qué puede hacer cada persona;
  - `components/sumarme-equipo.tsx` (cliente).
- **Código que cambia:**
  - `lib/gobernanza/datos.ts`: suma `comun-contratistas` si falta;
  - `lib/demo/claves.ts`: suma `equipos`;
  - `app/tribus/page.tsx`: pestañas y aviso;
  - `app/tribus/[id]/page.tsx`: la marca.
- **Diccionarios:** `lib/idioma/textos/tribus.ts`.
- **e2e:** `e2e/tribus-equipos.spec.ts` nuevo, y se ajustan `e2e/tribus.spec.ts` y `e2e/accesibilidad.spec.ts`.
- **Datos personales:** sin base y sin integraciones. Guarda en el navegador de la persona a qué equipos pidió sumarse. **Pide revisión del arquitecto.**
- **Dependencias:** `fogon-gobernanza-holarquia`, `pacto-puntual` y el manifiesto del Lighthouse (`/tribus/lighthouse/manifiesto`), todos ya en `dev`.
