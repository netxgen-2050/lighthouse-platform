# Design

## Contexto

- `pactos-dos-partes` (en `dev` antes que esto): `ConstanciaPacto`, registro compartido, `conciliar`, `/pactos/responder`, ADR-018. Su §6 de `pacto-puntual` (versión anterior) ya dejaba anotado el mapeo: marcar hecha → `pacto-propone-horas`; verificar → `pacto-confirma-horas`; pedir revisar → `pacto-no-acepta`.
- `pacto-puntual`: `PactoPuntual` con pasos `borrador | enviado | preadmitido`, `puedeResponderPostulacion`, `contraparteDe`, `EstadoNecesidadPropio` en la ficha.
- `lib/semillas/estado.ts` arma la tarjeta de cada comunidad (`semillasDeComunidad`) con `tiempo`, `plata` y `presencia`, y `totalConDato` (sin dato ≠ 0).
- ADR-012 (Semillas como constancias) y ADR-020 (Propuesta: una constancia base por tarea puntual).

## Decisiones

### 1. Esquemas de horas (`lib/pactos/constancias.ts`)

`EsquemaPacto` suma `"pacto-propone-horas" | "pacto-confirma-horas"`.

- **`pacto-propone-horas`**: `afirma: persona:<id>`, `por` = la persona, `sobre` = el mismo `sobre` del pacto (`puntual:<necesidadId>:<idPersona>` o `pacto:<comunidad>:<idPersona>`), `version` = la del pacto, `apuntaA` = la propuesta acordada (la postulación pre-admitida o el pacto aceptado), `revocable: true`, `datos`: `horas` (entero, como string) y, solo para un pacto recurrente, `mes` (`AAAA-MM`, lo usa `pactos-horas-variables`).
- **`pacto-confirma-horas`**: `afirma` = la contraparte de la propuesta (`contraparteDe`: el holón en un puntual, la tribu en un recurrente), `por` = quien actuó, `apuntaA` = la `pacto-propone-horas`, `revocable: true`, `datos.horas` = las horas que vio (copiadas de la propuesta de horas).
- **Círculos transversales: los administra y facilita Hifa** (decisión de Gus, 28-oct). Se reusa `loAdministraHifa(holon)` y `comunidadQueResponde` de `pacto-puntual`. En el prototipo Hifa es simulada y experimental: no responde, así que responde el **super admin como respaldo humano** y la `pacto-confirma-horas` (o el `pacto-no-acepta` de revisar) lleva `datos.respaldoDeHifa = "1"`. La decisión definitiva depende de probar que Hifa sea estable y fiable; si no lo es, vuelve a administrarlo una persona y cambia solo `comunidadQueResponde`.
- **Pedir revisar**: `pacto-no-acepta` que apunta a la `pacto-propone-horas`, con `datos.motivo` obligatorio (hasta 500 caracteres).
- `horasPendientes(lista, sesion)`: propuestas de horas no revocadas, sin respuesta, cuyo pacto la persona puede responder (`puedeResponderPostulacion` o `comunidadesQueResponde`). Nadie confirma sus propias horas (J11), con la misma regla `proponeLider` → otra persona o el super admin.
- **Una confirmación por propuesta de horas**: antes de escribir se relee el registro; si ya tiene respuesta, no se escribe ("Estas horas ya se respondieron").
- `leerConstancias` valida los dos esquemas nuevos (horas entero 1..200; `mes` `AAAA-MM` si está). Lo mal formado se ignora.
<!-- arquitecto (28-oct): la constancia base la arma el navegador de la persona al conciliar; si concilia una confirmación cualquiera, cualquiera que escriba en el registro le da Semillas. Y una confirmación que llega a una propuesta de horas que la persona retiró en otra pestaña tiene que tener una sola lectura. -->
- **Qué confirmación cuenta** (`confirmacionValida`, pura, la usan `conciliar` y `horasPendientes`): una `pacto-confirma-horas` cuenta solo si (a) `apuntaA` es una `pacto-propone-horas` de esa persona que apunta a **su** postulación pre-admitida; (b) `afirma === contraparteDe(postulación)` (el holón que pre-admitió); (c) `por` no es la persona del pacto (J11); (d) `datos.horas` es igual a las horas de la propuesta de horas (el holón confirma o pide revisar, no cambia las horas); (e) no está revocada. Si falla algo, se ignora y la tarea sigue "Hecha · esperando verificación".
- **Respuesta y retiro, una sola lectura.** Si una propuesta de horas tiene una respuesta que cuenta, un `revoca` posterior sobre ella **se ignora** (gana la respuesta, como en §3 de `pactos-dos-partes`). `retirarHecha` relee el registro antes de escribir: si ya hay respuesta, no escribe el `revoca`, concilia y la persona ve la respuesta.

### 2. Estado (`lib/pactos/estado.ts`)

- `PasoPuntual` suma `"hecha" | "verificado"`. `PactoPuntual` suma `horasReales?: number` (desde `hecha`), `avisoRevisar?: { motivo: string; cuando: string }` y `constancia?: ConstanciaBase` (solo en `verificado`).
- Acciones de la persona: `marcarHecha { horasReales }` (solo en `preadmitido`; escribe la `pacto-propone-horas`) y `retirarHecha` (solo en `hecha` y sin respuesta; escribe un `revoca` y vuelve a `preadmitido`).
- Respuestas del holón, **solo por conciliación**: `verificarHoras { confirmacion }` (hecha → verificado, crea la constancia base) y `pedirRevisarHoras { motivo, cuando }` (hecha → preadmitido con el aviso).
<!-- arquitecto (27-oct, se mantiene): "responde dos veces" — un doble clic o dos pestañas no pueden emitir dos constancias ni dos eventos. -->
- **Cada acción vale solo en su paso; fuera de él no cambia nada.** Conciliar dos veces la misma verificación deja **una** constancia (la primera) y un solo evento. Test: conciliar dos veces seguidas y comparar.
- Lo que vale es lo que el holón vio: las horas de la constancia base salen de `datos.horas` de la `pacto-confirma-horas`, no del estado local.
- `leer`: `hecha` sin `horasReales` válidas vuelve a `preadmitido`; `verificado` sin constancia válida vuelve a `hecha`.

### 3. Constancia base (`lib/pactos/constancia-base.ts`)

Misma forma que el design de `evaluacion-pares` §5 (ADR-012), para que después se unifiquen sin migrar:

```ts
type ConstanciaBase = {
  uid: string;                    // `ejemplo-base-puntual-<id de la postulación pre-admitida>`: una por persona y tarea
  schema: "semillas-base";
  afirma: "netx";
  sobre: string;                  // `puntual:<comunidad>:<necesidadId>` (la tarea; la persona la da `datos.pacto`)
  apunta_a: null;
  datos: { tipo: "puntual"; pacto: string; necesidad: string; fecha_tarea: string;
           horas: number;                       // verificadas
           horas_con_semillas: number; horas_sin_semillas: number;
           tope_unidad: "horas" | "semillas" | null; tope_valor: number | null; // máximo por persona, el de la propuesta pre-admitida
           tope_total_unidad: "horas" | "semillas" | null; tope_total_valor: number | null; // máximo total de la tarea, ídem
           valor_hora_usd: number; periodo: string; version_pacto: 1; confirmacion: string; semillas: number };
  creada_en: string;              // ISO: el `cuando` de la verificación (no el reloj de quien concilia)
  revocada_en: null; vence_en: null;
};
function constanciaBasePuntual(comunidad, p: PactoPuntual, confirmacion: ConstanciaPacto, anteriores: readonly HorasDePersona[]): ConstanciaBase;
function leerConstanciaBase(x: unknown): ConstanciaBase | null;
```

- **Varias personas, una constancia cada una** (decisión de Gus, 28-oct). `datos.pacto` es el id de la postulación pre-admitida de **esa** persona, y el uid sale de ahí: dos personas en la misma tarea tienen dos constancias, cada una con sus horas. El uid no lleva el `idPersona` (en el prototipo puede tener un email).
- `semillas`, `horas_con_semillas` y `horas_sin_semillas` salen de `repartirConTopeTotal(personas, tope, topeTotal, HOUR_REF_USD)` de `tribu-necesidades` (que usa `aplicarTope` para el máximo por persona), con los máximos de la propuesta pre-admitida (lo que vio el holón); sin máximos, `semillas = Math.round(Number((horas × HOUR_REF_USD).toFixed(6)))`. Con `HOUR_REF_USD = 7049 / 1400`: 10 h → 50; 12 h sin máximos → 60; 12 h con máximo por persona de 10 h (`valle-solar`) → 10 con Semillas, 2 sin, 50 Semillas.
- **Máximo total de la tarea, por orden de verificación** (decisión de Gus, 28-oct). `personas` = las verificaciones **anteriores** de la misma necesidad (`anteriores`) y, al final, la de esta persona; se toma el resultado de esta. `anteriores` sale del **registro compartido**, no del estado local: las `pacto-confirma-horas` que cuentan (`confirmacionValida`) de otras postulaciones pre-admitidas de la misma necesidad, ordenadas por `cuando` (desempate por id), con las horas de cada una y la propuesta de horas que confirman. Así dos personas en navegadores distintos reparten lo mismo. Ejemplo `valle-solar` (máximo por persona 10 h, total 20 h): A verifica 10 h → 10 con Semillas / 50; B verifica 12 h → 10 con Semillas (quedaban 10 del total) / 2 sin / 50; C verifica 6 h → 0 con Semillas / 6 sin / 0 Semillas ("el máximo total ya se completó"). Con el total en Semillas (`agua-plomeria`: 60 por persona, 150 en total): 16 h, 16 h, 16 h → 60, 60, 30 Semillas. La constancia ya emitida **no se recalcula** cuando verifican a otra persona; si una verificación con `cuando` anterior llega tarde al registro, la ya emitida queda como está y la nueva toma lo que queda (en la base, el servidor serializa y el orden es el de llegada).
- El resultado va congelado en la constancia, con `tope_total_unidad` y `tope_total_valor` (o nulos). Las horas que superan el total son horas verificadas sin Semillas, nunca 0.
<!-- arquitecto (27-oct, se mantiene): `cuando` es ISO en UTC; el 30-nov a las 22 h de Argentina ya es diciembre en UTC y la constancia quedaría en el período equivocado, que después no se corrige. -->
- `periodo = mesDe(confirmacion.cuando)`: helper puro `mesDe(ahora: string): string` ("AAAA-MM") en `lib/pactos/mes.ts`, **en la hora de Argentina** (`America/Argentina/Buenos_Aires`, la misma zona que `lib/fogon/consultas/reglas.ts`). Nunca `slice(0, 7)`. Test: `2026-12-01T01:30:00Z` → `2026-11`. Lo reusa `pactos-horas-variables`.
- `uid` con prefijo `ejemplo-`: hoy la "afirma NetX" la arma el navegador al conciliar. <!-- arquitecto -->
- `datos.confirmacion` = id de la `pacto-confirma-horas` (ADR-018: la versión sale de la aceptación; `apunta_a` queda para la cadena base → ajuste de ADR-012).
- **Congelada**: `leerConstanciaBase` valida tipos y números finitos, pero **no** recalcula. Un test cambia `HOUR_REF_USD` (mock del módulo) y verifica que la constancia leída no cambia.
- `datos` no lleva email ni nombre (ADR-012: nunca datos personales en una cadena).
- Si `evaluacion-pares` llega antes a `dev` con su `lib/evaluacion/constancias.ts`, este módulo **reusa su tipo**. <!-- arquitecto (28-oct): allá `version_pacto` es texto ("v1-ejemplo") y acá número; se unifican en el tipo que quede en `dev` para no tener dos formas de la misma constancia. -->`version_pacto` toma el tipo que tenga ese módulo (texto `"1"` si allá es texto).

### 4. Pantallas

- `/pactos`, en cada postulación pre-admitida: campo "Horas que te llevó" (`<input type="number">` con `<label>`) y "Marcar hecha". En `hecha`: "Hecha · esperando que <holón> verifique" y "Retirar". En `verificado`: "Horas verificadas por <holón>: N h · S Semillas"; si se aplicó un máximo, además "<C> h con Semillas · <X> h sin Semillas (máximo por persona: <tope>)". Las horas sin Semillas se muestran como horas verificadas, nunca se borran ni se muestran como 0. El aviso de "pidió revisar" con su motivo. Todo en `aria-live`.
- `/pactos/responder`, sección "Tareas para verificar": una fila por persona (cada una verifica sus propias horas), con tarea, persona (nombre o iniciales), horas pactadas y horas que dice, el máximo por persona si hay ("Con el máximo de 10 h, 2 h no generan Semillas"), el máximo total si hay y cuánto queda ("Máximo total de la tarea: 20 h · ya se verificaron 10 h con Semillas"), cuándo. En un círculo transversal, el aviso "Lo administra y facilita Hifa (experimental, simulado). Como Hifa no está disponible en el prototipo, respondés como su respaldo". "Verificar" y "Pedir revisar" (con motivo). El texto aclara qué se verifica: "Confirmás que la tarea quedó hecha y las horas que lleva".
- Ficha de la tribu: `EstadoNecesidadPropio` suma "Hecha · esperando verificación" y "Hecha por vos" para la persona, y "La hicieron <N> personas" (o "La hizo 1 persona") con las verificaciones de otras personas en el registro. Eso no cierra la necesidad: si sigue abierta, otra persona se puede postular.

### 5. Semillas (`lib/semillas/estado.ts`)

<!-- arquitecto (27-oct, se mantiene): el total mezcla una proyección (fijo) con horas verificadas (puntual). -->
`SemillasDeComunidad` suma `puntual: Parte` (suma de `constancia.datos.semillas` de los puntuales `verificado`, o `null`) y `constancias: ConstanciaBase[]`. `total = totalConDato([tiempo, plata, puntual, presencia])`. La tarjeta rotula cada parte: "Pacto de tiempo: proyección de 3 meses" y "Pactos puntuales: horas verificadas por el holón". `pactoAceptado` sigue mirando solo el pacto recurrente: **un puntual nunca habilita la ronda** (decisión de Gus). Cada constancia se lista con la tarea (título en el idioma de la página; si la necesidad ya no existe, el id), horas, las horas sin Semillas si las hay, fecha (`creada_en`) y Semillas. Son **Semillas** (recibidas): un puntual verificado no pasa por "Semillas pendientes", que son solo del compromiso recurrente (`pactos-horas-variables`). Cada persona ve solo sus propias constancias.

### 6. Eventos

`marcasteHecha(tarea, comunidad, id, necesidadId)` con `clave: hecha:<necesidadId>:<propuestaHorasId>`; `horasVerificadas(holon, tarea, id, necesidadId)` con `clave: verificada:<necesidadId>`; `horasARevisar(holon, tarea, id, respuestaId)` con `clave: revisar:<respuestaId>` (sin el motivo).

### 7. ⚖

No suma términos nuevos: el ⚖ `pactopuntual` de `pacto-puntual` ya dice que el holón verifica el resultado y que las Semillas no son un sueldo. "Verificar" se escribe siempre sobre la tarea ("la tarea quedó hecha"), nunca sobre la persona ("evaluar tu desempeño"), para no leerse como control laboral (ver design §9 de `pacto-puntual`).

## Riesgos

- **La verificación es del navegador.** Igual que en `pactos-dos-partes`. En la base, la constancia base la emite **solo el servidor** al registrarse `pacto-confirma-horas` (ADR-020). <!-- arquitecto (28-oct) --> Y con garantías en la base, no en un `if`: único por `uid`, único por `datos.confirmacion` y una base puntual por persona y necesidad; la tabla es de solo agregar (una corrección revoca y emite otra).
- **El motivo de "pedir revisar" es un juicio sobre el trabajo de una persona.** En el prototipo vive en `datos` del registro compartido, como el de `pactos-dos-partes`. En la base va en una columna con acceso solo para la persona y quien administra el holón, nunca en lo que se hashea o publica (ADR-018).
- **Semillas sin ronda.** Una persona puede sumar Semillas solo con tareas sueltas. Es lo que decidió Gus: la verificación del holón es la validación. Las defensas de D13 acotan el abuso.
- **Hifa simulada.** La verificación de un círculo transversal la da en realidad el super admin: el prototipo no demuestra que una IA pueda verificar tareas. Está marcado como experimental; la decisión definitiva depende de probar que Hifa sea estable y fiable. En la base, `respaldoDeHifa` pasa a decir quién respondió de verdad y queda auditado.
- **Máximo total y orden.** Quien verifica antes se queda con las Semillas del total; el orden es el de la verificación, no el de la postulación. Es lo que decidió Gus; se muestra a quien verifica cuánto queda para que no sea una sorpresa.
- **Tope que cambia.** Si el holón cambia el máximo después de pre-admitir, vale el de la propuesta pre-admitida: se copia ahí (`pacto-puntual`) y de ahí a la constancia. Un tope en Semillas redondea las horas con Semillas hacia abajo (ver `tribu-necesidades`).
- **Periodo mal puesto.** Cubierto con `mesDe` en hora de Argentina y `creada_en` = momento de la verificación.

## Revisión de arquitectura

Toca constancias (dos esquemas nuevos y la constancia base) y permisos (quién verifica). **Pide revisión** del agente arquitecto. Los ajustes de la revisión del 27-oct sobre la versión anterior de `pacto-puntual` (idempotencia, mes en hora de Argentina, uid `ejemplo-`, rótulos en Semillas) ya están incorporados arriba y la decisión de emitir por tarea está en ADR-020.
