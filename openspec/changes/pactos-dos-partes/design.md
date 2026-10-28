# Design

## Contexto

- `lib/pactos/estado.ts` guarda, por persona (`u:<id>:lh-pactos`), el pacto de tiempo de cada comunidad: contenido vigente, `paso` (0 borrador, 1 enviado, 2 aceptado), `version`, `historial` y un `cambio` opcional (paso 0 o 1). Hoy las acciones `avanzar` (1 → 2), `aceptarCambio` y `rechazarCambio` las dispara la misma persona con botones "Simular…".
- Todo lo de la demo se guarda con el prefijo de la persona (`lib/demo/claves.ts`): la otra parte **no puede leerlo**. Por eso hace falta un registro compartido.
- `lib/gobernanza/registros.ts` ya tiene una lista de solo agregar con forma de attestation (`id`, `esquema`, `afirma`, `sobre`, `apuntaA`, `cuando`, `datos`; revocar = agregar un `revoca`). Se copia la forma, no el módulo (sus esquemas son otros).
- Quién lidera sale de `useSesion().tribuLider` (Plan Tribu o `admin-tribu` con `tribuAdmin`); el super admin de `sesion.rol === "superadmin"`. Elegir el Plan Tribu en Sumarte crea la **tribu propia y nueva** de la persona, que la lidera sin aprobación de nadie (decisión de Gus, 28-oct; es lo que ya hace `calcularNivel`). A futuro el consejo del Lighthouse podría cambiar a quien lidera una tribu: **solo se anota**, no se diseña acá (ver §15). El id estable de la persona es `sesion.idPersona` (en prueba, `prueba:<email>`).

## Decisiones

### 1. Constancia de pacto (forma de EAS, ADR-012 y ADR-018)

```ts
type EsquemaPacto = "pacto-propone" | "pacto-acepta" | "pacto-no-acepta" | "revoca";
type ConstanciaPacto = {
  id: string;               // `p<n>-<esquema>`, n = largo de la lista + 1 (como gobernanza)
  esquema: EsquemaPacto;
  afirma: string;           // "persona:<idPersona>" | "tribu:<id>" | "comunidad:lighthouse"
  por: string;              // idPersona de quien apretó el botón (la persona misma, o quien lidera)
  sobre: string;            // "pacto:<comunidad>:<idPersona de la persona del pacto>"
  version: number;          // la versión que se propone o que se acepta
  apuntaA: string | null;   // acepta / no-acepta / revoca → la propuesta
  cuando: string;           // ISO
  revocable: boolean;       // true en propone y acepta; false en no-acepta y revoca
  datos: Record<string, string>; // propone: tipo ("nuevo"|"cambio"), rol, rolOtro, descripcion, horas, horasVigentes,
                                  //          nombre (del perfil) o iniciales, proponeLider ("1" si quien propone lidera esa tribu)
                                  // no-acepta: motivo
};
```

- `revocada` se **calcula** (existe un `revoca` que apunta a ella), nunca se guarda.
- Una propuesta está **pendiente** si no está revocada y no tiene `acepta` ni `no-acepta` que la apunte. Está **acordada** si tiene un `acepta` no revocado cuyo `afirma` es la contraparte (persona ↔ tribu) y cuyo `por` no es la persona del pacto.
- Funciones puras en `lib/pactos/constancias.ts`: `agregar`, `revocar`, `estaRevocada`, `pendientes(lista, comunidades)`, `respuestaDe(lista, propuestaId)`, `puedeResponder(sesion, comunidad, propuesta)`, `leerConstancias(crudo)`. Las fechas y los ids de persona vienen de afuera (sin `Date.now()` adentro).
- Para que la tribu sepa quién propone, la propuesta lleva `datos.nombre` = nombre del perfil (`cargarPerfil(...).nombre`, recortado) o, si está vacío, `datos.iniciales` = `inicialesDeEmail(sesion.email)` (`lib/sesion/iniciales.ts`). **El email nunca se copia a `datos` ni se muestra a la tribu** (decisión de Gus, 28-oct). Ojo: con personas de prueba el id interno es `prueba:<email>` y va en `sobre` y `por`; es un id técnico que la pantalla nunca muestra (con Privy es `did:privy:…`). Si no hay ni nombre ni iniciales, la vista dice "sin dato". Antes de firmar o publicar (etapas 2 y 3 de ADR-012) `datos` se reemplaza por un hash: nunca datos personales en la cadena.

### 2. Registro compartido en el navegador

- Clave nueva **sin prefijo de persona**: `compartido:pactos-constancias`, en `lib/demo/claves.ts` como `CLAVES_COMPARTIDAS` (fuera de `CLAVES`, que siempre prefija). El nombre no empieza con `lh-` a propósito: la fixtura de e2e prefija todo lo `lh-*`.
- Lectura y escritura en `lib/pactos/registro-compartido.ts`: `leerDelNavegador(): ConstanciaPacto[] | null` (null = el navegador no deja leer → "sin dato") y `agregarEnNavegador(nueva)`, que relee antes de escribir (dos pestañas).
- Solo se escribe al **enviar**, **retirar**, **aceptar** y **no aceptar**. El borrador nunca sale de la clave de la persona.

### 3. La persona: enviar y retirar escriben constancias; aceptar ya no

- `avanzar` de 0 → 1 y `enviarCambio` agregan una `pacto-propone` (versión = `version + 1`). `retirar` (pacto) y un `retirar` nuevo del cambio enviado (vuelve a paso 0 del cambio) agregan un `revoca` sobre la propuesta pendiente, **solo si sigue pendiente**; si ya hay respuesta, se concilia primero y no se retira.
- Se quitan de la pantalla los botones simulados. Las acciones `avanzar` de 1 → 2, `aceptarCambio` y `rechazarCambio` del reductor **se mantienen** pero solo las llama la conciliación (no la persona).

### 4. Conciliar al leer

- `conciliar(estado, constancias, idPersona, ahora)` en `lib/pactos/estado.ts`, pura: por cada comunidad con pacto o cambio en paso 1, busca la última propuesta de esa persona y aplica la respuesta: `acepta` → `avanzar` / `aceptarCambio` con la fecha de la constancia (no la de hoy); `no-acepta` → pacto a paso 0, o `rechazarCambio`, y deja `ultimaRespuesta = { tipo: "no-acepta", motivo, comunidad, cuando }` para el aviso. Devuelve también la lista de respuestas aplicadas, para que `/pactos` anuncie y registre eventos.
- **Quién la usa:** `/pactos` (guarda el resultado en la clave de la persona y registra los eventos con `clave` única por propuesta para no duplicarlos), y en memoria —sin guardar— `lib/semillas/estado.ts`, `app/semillas/semillas-cliente.tsx`, `app/perfil/perfil-cliente.tsx` y `lib/panel/proximo-paso.ts`. Un helper `leerPactosConciliados(lector, idPersona)` evita repetir el código.
- Si el registro compartido no se puede leer, se usa el estado de la persona sin conciliar (no se inventa una respuesta).

### 5. Eventos

- Nuevos: `pactoNoAceptado(comunidad, id, motivo)` (tipo `pacto`). Se reutilizan `pactoAceptado`, `rondaAbierta`, `cambioDePactoAceptado` y `cambioDePactoRechazado`, ahora disparados por la conciliación. El evento de "no aceptado" **no** copia el motivo al texto del evento (queda en el pacto); solo el nombre de la comunidad.

### 6. Pantalla de la tribu: `/pactos/responder`

- Página cliente (como `/pactos`), con el aviso de prototipo del layout. Lee `useSesion()`: comunidades que puede responder = `[tribuLider]` y, si es super admin, también `lighthouse`. Cada pendiente es un `<article>` con encabezado; "Aceptar" y "No aceptar"; "No aceptar" despliega un `<textarea>` con su `<label>` y "Confirmar". El resultado se anuncia en una región `role="status"` siempre montada y el foco va ahí.
- Antes de escribir, se relee el registro y se vuelve a comprobar que la propuesta siga pendiente (spec: "Este pacto ya no está pendiente").
- En `/tribus/[id]`, un componente cliente chico junto a `MarcaAdmin` muestra "Pactos para responder (N)" si `tribuLider === id`; con el registro ilegible muestra "Pactos para responder (sin dato)".

### 7. Descargar y borrar mis datos

- `borrarDemo` solo recibe un `quitar(clave)`: no sirve para sacar entradas de una lista compartida. Se agrega `quitarConstanciasDe(idPersona)` en `lib/pactos/registro-compartido.ts`, que reescribe `compartido:pactos-constancias` sin las constancias cuyo `sobre` es `pacto:*:<idPersona>`, y `/mis-datos` la llama junto a `borrarDemo` al retirar el consentimiento. Es la excepción al "solo agregar", en el navegador. En la base será anonimizar (ADR-005).
- `exportarMisDatos` suma `datos.pactosConstancias`: las constancias cuyo `sobre` es de la persona (`null` si el registro no se puede leer).
- Las constancias donde la persona solo aparece como `por` (respondió por su tribu) **no** se borran: son de la tribu y de la otra persona. Queda como pregunta para Gus. <!-- arquitecto: se anonimiza `por`, ver §12 -->Se anonimiza su `por` (ver §12).

### 8. Compatibilidad

- Un pacto guardado en paso 1 **sin** propuesta en el registro (de antes de este cambio) se publica como propuesta la primera vez que la persona abre `/pactos`, con `cuando` = ahora y `datos.migrada = "1"`. Los pactos ya aceptados (paso 2) quedan aceptados sin constancia (no se inventa una aceptación de la tribu); el historial ya dice "fecha sin dato" cuando corresponde.

## Riesgos

- **La verificación es del navegador.** Cualquiera con las herramientas del navegador puede escribir una aceptación. Aceptable en el prototipo interno; en la base, el servidor verifica quién responde y sobre qué tribu (P9).
- **Datos de una persona visibles para otra en el mismo navegador** (nombre o iniciales, rol, descripción del pacto; el email no). Es lo que pide el flujo; solo se comparte lo enviado, y el borrado lo quita.
- **Solo funciona en un mismo navegador.** Para mostrarlo entre dos computadoras hace falta la base.

## Revisión de arquitectura

<!-- arquitecto: revisión del 27-oct-2026; ajustes 9 a 14 agregados -->
Hecha el 27-oct-2026 (agente arquitecto). Decisión en ADR-018 (Propuesta). Ajustes incorporados:

### 9. Lo que vale es lo que la tribu vio
- Al conciliar una aceptación, el contenido del pacto (rol, rolOtro, descripción, horas) se toma de los `datos` de la **propuesta aceptada**, no del estado local de la persona. Si el estado local tiene otro contenido (otra pestaña, datos tocados a mano), gana la constancia. Así Semillas cuenta exactamente lo que la tribu aceptó, y `pactos-pedir-cambios` (que acepta horas de la tribu) usa la misma regla.
- Conciliar solo aplica una respuesta si su `version` es `version vigente + 1`; si no coincide, se ignora (no se inventa un salto de versión).

### 10. Quién puede responder, en un solo lugar
- `comunidadesQueResponde(sesion): string[]` en `lib/pactos/constancias.ts` es el **único** lugar que traduce la sesión en comunidades (hoy `[tribuLider]` más `lighthouse` si es super admin). `/pactos/responder`, la ficha de la tribu y `puedeResponder` la usan. Cuando entre `liderar-varias-tribus` (`tribusLider` como lista) se cambia solo esa función.
- **El pacto propio de quien lidera** (decisión de Gus, 28-oct): al enviar, si `comunidadesQueResponde(sesion)` de quien propone incluye esa comunidad, la propuesta lleva `datos.proponeLider = "1"`. Esa propuesta la puede responder otra persona que lidere esa tribu (como cualquier pacto de la tribu, nunca la misma persona) **y además el super admin**, que es quien responde cuando no hay otra. En el navegador no se puede saber si existe otra persona que lidere, así que el super admin la ve siempre; vale la primera respuesta (el re-chequeo de §6 evita la doble). En `/pactos/responder` del super admin aparece en la sección de esa tribu con "Lo propone quien lidera <tribu>", y la constancia afirma `tribu:<id>` con `por` = el super admin. El super admin **no** ve los pactos de personas que no lideran: esos los responde la tribu.
- `pendientes` solo cuenta propuestas cuyo `afirma` empieza con `persona:` (las de la tribu, que trae `pactos-pedir-cambios`, no le aparecen a la tribu misma).

### 11. Ids con dos puntos
- `idPersona` puede tener `:` (`prueba:<email>`, `did:privy:…`). `sobre` **nunca se parte con `split(":")`**: se compara armando el string completo (`pacto:${comunidad}:${idPersona}`) o con `startsWith("pacto:")` + `endsWith(":" + idPersona)` verificando la comunidad. Lo mismo en `quitarConstanciasDe` y en la descarga.

### 12. Borrar también desde Configuración, y anonimizar al que respondió
- "Borrar datos de la demo" en `/configuracion` también llama a `quitarConstanciasDe(idPersona)`: si no, la tribu ve pendiente un pacto que la persona ya no tiene (huérfano).
- Al borrar, en las constancias donde la persona solo es `por` (respondió por su tribu) se reemplaza `por` por `"persona-borrada"`: la constancia de la tribu sigue, sin dejar el id de quien se fue (ADR-001 y ADR-005: borrar es anonimizar). Es la segunda excepción al "solo agregar", solo en el navegador. Si Gus prefiere conservar el id, se saca este punto (ver pregunta abierta).

### 13. Compatibilidad sin inventar
- La publicación de §8 solo ocurre si el registro compartido se pudo leer (no `null`) y no hay ninguna propuesta de esa persona y comunidad, revocada o no. Con el registro ilegible no se publica nada.

### 14. Lo que la base hereda
- El nombre o las iniciales en `datos` son solo del prototipo (la tribu no puede leer el perfil de otra persona en el navegador). En la base (P9) la constancia guarda el id de la persona y la vista de la tribu resuelve el nombre del perfil con permiso; ni el nombre ni el email se copian a la tabla de constancias. Queda anotado para `aprobaciones-pactos`.

### 15. Cambio de liderazgo (solo anotado, no se diseña)
- A futuro el consejo del Lighthouse podría cambiar a quien lidera una tribu (incluida la creada con el Plan Tribu). No entra en este cambio. Lo que este diseño ya deja listo: la parte que acepta es la tribu (`afirma = tribu:<id>`), no la persona; `por` es solo auditoría, y quién responde sale de un único lugar (`comunidadesQueResponde`). Así, cambiar de líder no invalida los pactos acordados ni obliga a tocar las pantallas.
