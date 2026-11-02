# Design

## Context

`/congreso` es una vitrina larga de un solo evento, con tema propio (ADR-002), piezas portables y una dirección por idioma (ADR-003). Eventos es otra cosa: una lista de muchos eventos chicos, dentro de una plataforma que ya es bilingüe en una sola dirección (ADR-004). El nombre "evento" ya se usa para dos cosas: `Evento` en `lib/congreso/evento.ts` y los eventos de actividad en `lib/actividad/eventos.ts`.

Las decisiones de contenido quedan abiertas (ver "Open Questions"): los datos son de ejemplo y están marcados.

## Goals / Non-Goals

**Goals:** la lista con todos los datos que pidió Gus; "Quiero ir" honesto; reutilizar lo que sirve sin romper la vitrina; dejar el modelo listo para sumar eventos de la red.

**Non-Goals:** todo lo que `proposal.md` deja fuera de alcance, en especial entradas, UnityHub, check-in, Genesis y convocatorias completas.

## Decisions

### 1. Modelo en `lib/eventos/`, con nombre propio

El tipo se llama `EventoComunidad`, para no confundirse con los otros dos. Sigue el patrón `Tx` del Congreso:

```ts
type TipoEventoComunidad = "encuentro" | "minga" | "jornada" | "taller" | "visita";
type FormatoConvocatoria = "voluntariado" | "jornada-minga" | "actividad-puntual"; // Backlog D26

type EventoComunidad<Tx = string> = {
  id: string;
  esEjemplo: boolean;
  /** Quién publica: hoy solo Lighthouse VRN; más adelante, otros nodos de la red. */
  nodo: "lighthouse-vrn";
  nombre: Tx;
  tipo: TipoEventoComunidad;
  fechas?: { inicio: string; fin: string }; // AAAA-MM-DD; ausente = sin dato
  lugar?: { ambito: "territorio" | "fuera"; detalle?: Tx };
  organiza?: { clase: "circulo" | "tribu"; id: string };
  cupo?: { clase: "limitado"; lugares: number } | { clase: "abierto" }; // ausente = sin dato
  pide: Tx[];    // vacío = sin dato
  recibe: Tx[];  // vacío = sin dato
  semillas?: "asistir" | "ayudar"; // nunca una cantidad
  formato?: FormatoConvocatoria;
  educativo?: boolean; // dibuja el ⚖ "Encuentro educativo para eventos"
};
```

- `lib/eventos/datos.ts`: `obtenerEventos(idioma)` es la **única** forma de leerlos. Hoy resuelve el contenido de ejemplo con `resolver` de `lib/congreso/idioma`, y es la costura para más adelante.
<!-- arquitecto: costura asíncrona, id estable y lista vacía; ver ADR-028 -->
- `obtenerEventos` es `async` y devuelve una promesa, igual que `obtenerEvento()`: si mañana los eventos vienen de otro lado, las pantallas no cambian.
- `id` es propio de NetX y **no se renombra**: es la clave que queda guardada en el navegador de cada persona y en su actividad. Si un evento sale de la lista, lo guardado se conserva y no rompe nada.
- Si no hay eventos próximos, la sección lo dice con una frase ("Todavía no hay eventos próximos" / "No upcoming events yet"), sin mostrar un 0.
- El nombre del organizador no se copia: sale de `CIRCULOS_DEL_COMUN` (`lib/gobernanza/datos.ts`) o de las tribus (`lib/tribus/datos.ts`). Un test verifica que todos los ids de ejemplo existan.
- `lib/eventos/agenda.ts`: función pura `agruparEventos(eventos, hoy)`, que devuelve `{ proximos, pasados }`. `hoy` entra como parámetro para que los tests no dependan de la fecha. La página lo calcula en la zona `America/Argentina/Buenos_Aires`. Como la página lee el idioma del pedido, es dinámica y no se congela en el build.

**Alternativa descartada:** extender `Evento` del Congreso. Exige voces, recorrido, entradas y cifras que estos eventos no tienen.

### 2. Una sola dirección con el idioma de la plataforma

`/eventos` usa `idiomaDelPedido()` y un diccionario `textos("eventos", idioma)`, como Tribus. No repite `/eventos/en`: esa excepción (ADR-003) era para que los organizadores enlazaran una dirección en inglés. Se registra en `DICCIONARIOS`, `RUTAS_TRADUCIDAS` y `REVISION_NATIVA` (también `lib/eventos/datos.ts` como fuente, igual que `evento-ejemplo.ts`).

### 3. Qué se reutiliza de la vitrina

| Se reutiliza | Para qué |
|---|---|
| `TemaEvento` y `tema-evento.css` | La identidad visual de los eventos, con `className="ev-en-netx"` |
| `ChipFecha` y `rangoFechas` | La fecha de cada tarjeta |
| Clases `ev-seccion`, `ev-cont`, `ev-bajada`, `ev-caja`, `ev-boton`, `ev-legal-claro`, `ev-solo-lectores` | Estructura y botones |
| `queMostrarEnTicket` | Decide qué ve la persona en "Quiero ir": sus estados y reglas son los mismos (nada, sumate, politica, formulario) |
| `IrAlAncla` y `hrefSumarte` | La vuelta desde Sumarte a `#evento-<id>` |
| `resolver` y `Bilingue` | Textos de ejemplo en dos idiomas con caída al español |

**No se reutilizan:** `Heroe` (es de un solo evento, con cuenta regresiva y compra), `BarraEvento`, `VistaFuentes` y `BloqueFuente` (explican UnityHub), `Entradas`, `BotonDemo` y `TicketNetx`.

Las reglas nuevas van en `app/congreso/tema-evento.css`, bajo `.tema-evento .ev-agenda…`, para respetar ADR-002 y el test que prohíbe `--evento-` fuera de `app/congreso/`. Solo se agregan reglas. Si una combinación de color no está en la tabla de `app/congreso/tema-evento.test.ts`, se suma ahí.

**Consecuencia:** `/eventos` pasa a depender de `app/congreso/evento/`, de su hoja, de `app/congreso/netx/ir-al-ancla.tsx` y de `lib/congreso/{idioma,formatos,ancla,mostrar-ticket}.ts`. El cambio siguiente lo deja escrito en la nota para volver, para que nadie borre esos archivos creyendo que están sin uso. Se agrega una nota con fecha a ADR-002. El reparto con UnityHub va en ADR-028 (ver decisión 10).
<!-- arquitecto: IrAlAncla vive en app/congreso/netx/, no en evento/; la lista de dependencias estaba incompleta -->


### 4. Quiero ir: intención, no inscripción

- **Clave nueva:** `eventosQuieroIr: "lh-eventos-quiero-ir"` en `NOMBRES_BASE`, con la forma `{ [eventoId]: fechaISO }`. Pasa por `clave()`, así que queda separada por persona. `exportarMisDatos` y el resto de lo que recorre `NOMBRES_BASE` la toman sin cambios.
- **Lógica pura** en `lib/eventos/quiero-ir.ts`: `leer`, `anotar`, `retirar`. Un JSON inválido devuelve `{}`. Las escrituras que fallan se informan a la pantalla.
- **Pieza cliente** `app/eventos/quiero-ir.tsx`: el mensaje de estado va en una región `aria-live="polite"`, y el `aria-label` del botón incluye el nombre del evento, porque hay varios botones iguales en la página.
- **Actividad:** nuevo `EVENTOS.quisisteIr(nombre, id)`, con `tipo: "evento"`, `enlace: /eventos#evento-<id>`, `clave: quiero-ir:<id>` y sin notificación. Retirar la intención no borra el registro (la actividad es de solo agregar) ni agrega otro.
- **No toca** `lib/semillas`, `lib/pasaporte` ni `lib/permisos`. Anotarse no da Semillas: nunca hay Semillas por un clic propio (Backlog D31). El copy nunca dice "reservá" (Backlog T7).
<!-- arquitecto: aclaraciones de lo que la intención no hace, firma de lectura y nombre en la actividad -->
- **Quien organiza no ve la intención.** El dato queda en el navegador, así que la aclaración cerca de la acción también lo dice: "Por ahora queda solo en este navegador: quien organiza todavía no lo ve." Sin esa frase, "quien organiza confirma la participación" haría creer que el aviso le llegó.
- **`leer` recibe el texto crudo** (`string | null`), como `leerKyc` y `leerMembresia`, para que `leerProgreso` pueda usarla en el cambio siguiente. Quien llama lee el almacenamiento y maneja sus errores.
- **La línea de actividad no decide el resultado.** Primero se guarda la intención; si después falla la actividad, la persona igual queda anotada.
- **`DatosEvento` suma `evento?: string`** y `DATO_DEL_MENSAJE` suma `quisisteIr: "evento"`. La frase sale en el idioma actual, pero el nombre del evento queda en el idioma en que la persona se anotó, igual que `descripcion`. Se acepta en el prototipo para no guardar los dos idiomas en cada línea.

### 5. Política: se sube la versión

El dato es nuevo, y ADR-017 dice que lo que amplía sube `VERSION_POLITICA`. Hay que: sumar "eventos" al segundo punto de `RESUMEN`; agregar a `DATOS_POR_PANTALLA` la fila `{ pantalla: "Eventos", datos: "A qué eventos dijiste que querés ir. Si cambiás de idea se borra la intención, pero la línea queda en Mi recorrido.", donde: "Hoy, solo en tu navegador. Con la base, en Neon." }`; subir `VERSION_POLITICA` a `2026-11-02-borrador` y actualizar la aserción de `lib/privacidad/privacidad.test.ts:207`.

**Costo:** todas las personas vuelven a aceptar, también el consentimiento de datos sensibles del Pasaporte, porque `sensibles.version` se compara con la misma constante. Se acepta por coherencia con ADR-017; es una fricción menor en un prototipo con el equipo.
<!-- arquitecto: revisado contra el código -->
Revisado: el consentimiento sensible solo se usa en `components/kyc-dialogo.tsx`, que lo vuelve a pedir antes de seguir un KYC en curso. Lo ya cargado no se borra, y un KYC aprobado no vuelve atrás. Las fixturas de e2e importan la constante, así que no hay versión escrita a mano.

### 6. Término legal nuevo

Se agrega `eventoeducativo` a `lib/legal/terminos.ts`, con `borrador: true` y versión `en`. No se reescribe `encuentroeducativo`, que sigue usando la vitrina. Texto de borrador: *"Los eventos de la comunidad son encuentros educativos y de trabajo compartido, no una oferta de inversión. Los proyectos que buscan socios se presentan por separado, solo a quien lo pida, y sumarse es siempre opcional. Cualquier aporte pasa por los documentos propios de cada proyecto."*

Mingas y jornadas usan `obra`, y las Semillas usan `semillas`. No hacen falta más términos.

### 7. Datos de ejemplo

Son ilustrativos: se inspiran en los formatos de la nota 20 §3 y §6, cuyas cifras tampoco son un compromiso. Se traducen al inglés en `datos.ts`.

| id | Nombre | Tipo | Fecha | Lugar | Organiza | Cupo | Pide | Recibe | Extras |
|---|---|---|---|---|---|---|---|---|---|
| `encuentro-tribus` | Encuentro de tribus | encuentro | 2026-11-28 | fuera: General Roca, Río Negro | tribu `valle` | 30 lugares | Traer algo para compartir | Conocer a otras tribus | educativo |
| `taller-diseno` | Taller de diseño de la primera etapa | taller | 2026-12-05 | fuera: en línea | círculo `comun-permacultura` | 25 lugares | Dos horas de atención | Materiales del taller | educativo, Semillas por asistir, formato actividad puntual |
| `visita-primera-etapa` | Visita guiada a la primera etapa | visita | 2026-12-12 | territorio: primera etapa | círculo `comun-marketing` | 20 lugares | Calzado cerrado y agua | Recorrida guiada | educativo |
| `minga-agua` | Minga de retención de agua | minga | 2027-01-16 | territorio: primera etapa | círculo `comun-agua` | abierto | Cuatro horas de trabajo | Almuerzo compartido | Semillas por ayudar, formato jornada o minga |
| `jornada-siembra` | Jornada de siembra de nativas | jornada | 2027-01-30 | territorio: primera etapa | círculo `comun-permacultura` | 40 lugares | Una jornada de trabajo y guantes | Almuerzo compartido y plantines | Semillas por ayudar, formato jornada o minga |
| `encuentro-verano` | Encuentro de verano en el terreno | encuentro | sin dato | territorio: sin detalle | círculo `comun-marketing` | sin dato | sin dato | sin dato | educativo |

El último ejemplo muestra a propósito cómo se ve lo que falta. No se nombran personas ni nodos reales.

### 8. Bloque de la red

Es una sección estática al final, "Eventos de la red", sin formulario: "Todavía no hay eventos de otros nodos. Más adelante, cada nodo va a poder convocar a voluntariados, jornadas o mingas y actividades puntuales." No muestra un 0 ni nombra nodos.

### 9. Ruta pública

`/eventos` se suma a `RUTAS_PUBLICAS` con la misma justificación que tuvo la vitrina (decisión de Gus del 14-oct). `capacidadDeRuta` devuelve `descubrir` porque mira primero `esPublica`, sin más cambios.

<!-- arquitecto: faltaba; sin esto se pierde la campaña de los enlaces viejos a /congreso -->
La página guarda el origen de la campaña igual que la vitrina y la portada: `{hayCampana(origen) && <GuardarOrigen origen={origen} />}`, con `origen = leerParametros(searchParams)`. Eventos es la nueva puerta de entrada, y `eventos-reemplaza-congreso` promete que `/congreso?utm_source=…` sigue guardando el origen al llegar acá. La política ya nombra este dato ("Origen de la visita").

### 10. Reparto con UnityHub (ADR-028, en Propuesta)
<!-- arquitecto: decisión nueva; ADR-013 le da la convocatoria a UnityHub y pide un ADR para lo que se superpone -->
ADR-013 (también en Propuesta) le da a UnityHub la convocatoria a eventos, y su regla 4 pide un ADR para las funciones que se superponen. Este cambio no integra nada, pero sí crea una lista de eventos y una intención de ir dentro de NetX. ADR-028 propone:
- Hoy los eventos son de ejemplo, viven en un archivo de NetX y se leen solo por `obtenerEventos`.
- "Quiero ir" es una intención personal: no es una inscripción ni le llega a quien organiza. Inscribir de verdad no se construye en este cambio.
- Si la agenda viene después de otro servicio, se copia lo mínimo, con `proveedor`, `id_externo` y `sincronizado_at`, y el `id` de NetX no cambia. Las pantallas siguen sin enterarse.
- Cuando "Quiero ir" pase a la base, el servidor toma a la persona de la sesión, nunca del pedido, y exige consentimiento vigente (ADR-005).

## Risks / Trade-offs

- **Las fechas de ejemplo van a pasar, y un e2e atado a ellas fallaría solo a partir de esa fecha** → la agrupación corre en el servidor, así que `page.clock` no la mueve (solo cambia el reloj del navegador), y no se agrega ningún parámetro de prueba a la página. Próximos y pasados se prueban en unitarios y de componente, con `hoy` como parámetro. Los e2e buscan por nombre sin depender de la sección, y prueban "Quiero ir" con `encuentro-verano`, que no tiene fecha y por eso nunca pasa. Con el tiempo, la lista igual se ve bien: los eventos pasan a "Pasados".
- **El servidor y el cliente pueden ver días distintos** → la agrupación se calcula solo en el servidor y la pieza cliente recibe si el evento ya pasó.
- **Repetir consentimiento** → ver decisión 5.
- **Depender de piezas de una carpeta "en pausa"** → queda escrito en ADR-002 y en la nota del cambio siguiente.
- **Lugar "en línea" como "fuera del territorio"** → es una aproximación hasta que Gus responda la pregunta 3.

## Migration Plan

Se agrega solo. Para retirarlo alcanza con revertir el cambio, salvo la versión de la política, que no debería bajar (quien aceptó la nueva quedaría sin consentimiento vigente).

## Open Questions

Las preguntas para Gus están en el resumen del especificador y se repiten acá para quien implementa: **ninguna bloquea**, porque todo se resuelve con los ejemplos.

1. ¿Qué eventos reales hay, con fecha y organizador?
2. ¿Cuántas Semillas por asistir o ayudar?
3. ¿Los eventos en línea son un tercer tipo de lugar?
4. ¿Va el piloto de La Abuela Beba como primer evento de la red?
