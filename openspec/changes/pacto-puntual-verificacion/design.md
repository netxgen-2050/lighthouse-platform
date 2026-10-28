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
- **Pedir revisar**: `pacto-no-acepta` que apunta a la `pacto-propone-horas`, con `datos.motivo` obligatorio (hasta 500 caracteres).
- `horasPendientes(lista, sesion)`: propuestas de horas no revocadas, sin respuesta, cuyo pacto la persona puede responder (`puedeResponderPostulacion` o `comunidadesQueResponde`). Nadie confirma sus propias horas (J11), con la misma regla `proponeLider` → otra persona o el super admin.
- **Una confirmación por propuesta de horas**: antes de escribir se relee el registro; si ya tiene respuesta, no se escribe ("Estas horas ya se respondieron").
- `leerConstancias` valida los dos esquemas nuevos (horas entero 1..200; `mes` `AAAA-MM` si está). Lo mal formado se ignora.

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
  uid: string;                    // `ejemplo-base-puntual-<comunidad>-<necesidadId>`
  schema: "semillas-base";
  afirma: "netx";
  sobre: string;                  // `puntual:<comunidad>:<necesidadId>`
  apunta_a: null;
  datos: { tipo: "puntual"; pacto: string; necesidad: string; fecha_tarea: string; horas: number;
           valor_hora_usd: number; periodo: string; version_pacto: 1; confirmacion: string; semillas: number };
  creada_en: string;              // ISO: el `cuando` de la verificación (no el reloj de quien concilia)
  revocada_en: null; vence_en: null;
};
function constanciaBasePuntual(comunidad, p: PactoPuntual, confirmacion: ConstanciaPacto): ConstanciaBase;
function leerConstanciaBase(x: unknown): ConstanciaBase | null;
```

- `semillas = Math.round(Number((horas × HOUR_REF_USD).toFixed(6)))`. Con `HOUR_REF_USD = 7049 / 1400`: 10 h → 50; 12 h → 60.
<!-- arquitecto (27-oct, se mantiene): `cuando` es ISO en UTC; el 30-nov a las 22 h de Argentina ya es diciembre en UTC y la constancia quedaría en el período equivocado, que después no se corrige. -->
- `periodo = mesDe(confirmacion.cuando)`: helper puro `mesDe(ahora: string): string` ("AAAA-MM") en `lib/pactos/mes.ts`, **en la hora de Argentina** (`America/Argentina/Buenos_Aires`, la misma zona que `lib/fogon/consultas/reglas.ts`). Nunca `slice(0, 7)`. Test: `2026-12-01T01:30:00Z` → `2026-11`. Lo reusa `pactos-horas-variables`.
- `uid` con prefijo `ejemplo-`: hoy la "afirma NetX" la arma el navegador al conciliar. <!-- arquitecto -->
- `datos.confirmacion` = id de la `pacto-confirma-horas` (ADR-018: la versión sale de la aceptación; `apunta_a` queda para la cadena base → ajuste de ADR-012).
- **Congelada**: `leerConstanciaBase` valida tipos y números finitos, pero **no** recalcula. Un test cambia `HOUR_REF_USD` (mock del módulo) y verifica que la constancia leída no cambia.
- `datos` no lleva email ni nombre (ADR-012: nunca datos personales en una cadena).
- Si `evaluacion-pares` llega antes a `dev` con su `lib/evaluacion/constancias.ts`, este módulo **reusa su tipo**.

### 4. Pantallas

- `/pactos`, en cada postulación pre-admitida: campo "Horas que te llevó" (`<input type="number">` con `<label>`) y "Marcar hecha". En `hecha`: "Hecha · esperando que <holón> verifique" y "Retirar". En `verificado`: "Horas verificadas por <holón>: N h · S Semillas". El aviso de "pidió revisar" con su motivo. Todo en `aria-live`.
- `/pactos/responder`, sección "Tareas para verificar": tarea, persona (nombre o iniciales), horas pactadas y horas que dice, cuándo. "Verificar" y "Pedir revisar" (con motivo). El texto aclara qué se verifica: "Confirmás que la tarea quedó hecha y las horas que lleva".
- Ficha de la tribu: `EstadoNecesidadPropio` suma "Hecha · esperando verificación", "Hecha por vos" y "Hecha" (otra persona, con verificación en el registro).

### 5. Semillas (`lib/semillas/estado.ts`)

<!-- arquitecto (27-oct, se mantiene): el total mezcla una proyección (fijo) con horas verificadas (puntual). -->
`SemillasDeComunidad` suma `puntual: Parte` (suma de `constancia.datos.semillas` de los puntuales `verificado`, o `null`) y `constancias: ConstanciaBase[]`. `total = totalConDato([tiempo, plata, puntual, presencia])`. La tarjeta rotula cada parte: "Pacto de tiempo: proyección de 3 meses" y "Pactos puntuales: horas verificadas por el holón". `pactoAceptado` sigue mirando solo el pacto recurrente: **un puntual nunca habilita la ronda** (decisión de Gus). Cada constancia se lista con la tarea (título en el idioma de la página; si la necesidad ya no existe, el id), horas, fecha (`creada_en`) y Semillas.

### 6. Eventos

`marcasteHecha(tarea, comunidad, id, necesidadId)` con `clave: hecha:<necesidadId>:<propuestaHorasId>`; `horasVerificadas(holon, tarea, id, necesidadId)` con `clave: verificada:<necesidadId>`; `horasARevisar(holon, tarea, id, respuestaId)` con `clave: revisar:<respuestaId>` (sin el motivo).

### 7. ⚖

No suma términos nuevos: el ⚖ `pactopuntual` de `pacto-puntual` ya dice que el holón verifica el resultado y que las Semillas no son un sueldo. "Verificar" se escribe siempre sobre la tarea ("la tarea quedó hecha"), nunca sobre la persona ("evaluar tu desempeño"), para no leerse como control laboral (ver design §9 de `pacto-puntual`).

## Riesgos

- **La verificación es del navegador.** Igual que en `pactos-dos-partes`. En la base, la constancia base la emite **solo el servidor** al registrarse `pacto-confirma-horas` (ADR-020).
- **Semillas sin ronda.** Una persona puede sumar Semillas solo con tareas sueltas. Es lo que decidió Gus: la verificación del holón es la validación. Las defensas de D13 acotan el abuso.
- **Periodo mal puesto.** Cubierto con `mesDe` en hora de Argentina y `creada_en` = momento de la verificación.

## Revisión de arquitectura

Toca constancias (dos esquemas nuevos y la constancia base) y permisos (quién verifica). **Pide revisión** del agente arquitecto. Los ajustes de la revisión del 27-oct sobre la versión anterior de `pacto-puntual` (idempotencia, mes en hora de Argentina, uid `ejemplo-`, rótulos en Semillas) ya están incorporados arriba y la decisión de emitir por tarea está en ADR-020.
