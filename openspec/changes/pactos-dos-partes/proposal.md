# Proposal

## Why

Hoy un pacto de tiempo pasa a "Aceptado" con un botón "Simular: la comunidad acepta" que aprieta **la misma persona que lo propuso**. Un pacto es un acuerdo entre dos partes (nota 16 §2.2 de `NS_platform`: "cada parte ve el borrador, propone cambios y acepta"), y en la consultoría web3 del 23-oct (punto 3) Gus mostró justo eso como lo que falta: la tribu tiene que aceptarlo o rechazarlo, y esa aceptación tiene que quedar como constancia. El estudio de Collabberry (27-oct) y la regla J11 de `NS_Tokenomics` 29 ("nadie se valida a sí mismo") lo confirman. Es la versión en el navegador de la propuesta P9 `aprobaciones-pactos` del backlog, que esperaba la base: Gus la pidió ahora, sin base, para poder mostrar el flujo.

## What Changes

- **Dos partes de verdad (simuladas con personas de prueba en el mismo navegador).** La persona propone; responde **quien lidera la tribu** de ese pacto (hoy `admin@prueba.test` para Valle Solar). Elegir el Plan Tribu en Sumarte crea **la tribu propia y nueva** de esa persona, que pasa a liderarla sin aprobación de nadie (decisión de Gus, 28-oct): responde los pactos de su tribu. Los pactos con el Lighthouse los responde el super admin (`super@prueba.test`). Se cambia de persona con "Entrar como…".
- **La tribu responde:** **acepta** o **rechaza con motivo** (obligatorio). Nadie responde su propio pacto: el pacto que propone quien lidera lo responde **otra persona que lidere esa tribu o, si no hay, el super admin**.
- **La tribu ve el nombre del perfil** de quien propone (o sus iniciales si el perfil no tiene nombre), **nunca el email**.
- **Se quitan los botones simulados** "Simular: la comunidad acepta", "Simular: la comunidad acepta el cambio" y "Simular: la comunidad no lo acepta". La persona ve "Esperando la respuesta de <tribu>" y puede **retirar** su pacto (como hoy).
- **Los cambios a un pacto aceptado** (lo que ya hace `pactos-proponer-cambio`) siguen el mismo camino: los acepta o rechaza la tribu, no la persona. Versión e historial no cambian: se reutilizan.
- **Constancias con forma de EAS** (ADR-012): cada propuesta, aceptación, rechazo y retiro queda como un registro de solo agregar: quién afirma (la persona o la tribu, y quién actuó por la tribu), sobre qué pacto y qué versión, cuándo, y si se puede revocar. Retirar es revocar la propuesta: nada se edita ni se borra. Viven en un registro **compartido en el navegador** (no por persona), porque la otra parte tiene que poder leerlo.
- **Vista de la tribu:** página nueva `/pactos/responder` con los pactos pendientes de su lado (persona, rol, horas, descripción, versión, cuándo se envió) y los botones para responder. En la ficha de la tribu, quien la lidera ve "Pactos para responder (N)" con el enlace.
- **Mi recorrido de la persona:** "Valle Solar aceptó tu pacto" y "Valle Solar no aceptó tu pacto" se registran cuando la persona vuelve a `/pactos` (las respuestas se concilian al leer). Semillas, Perfil y el panel leen el pacto ya conciliado.
- **Textos es/en** en el catálogo de idioma. Término ⚖ nuevo **"Pacto aceptado por las dos partes"** con `borrador: true`.
- **Mis datos:** la descarga incluye las constancias sobre los pactos de la persona, y retirar el consentimiento las quita del registro compartido.

**Fuera de alcance:**
- **"Pedir cambios"** (la tribu devuelve una contrapropuesta y la persona la acepta o retira): va en el cambio siguiente, `pactos-pedir-cambios`, para que este entre en una noche. Mientras tanto la tribu lo puede pedir en el motivo del rechazo.
- La base de datos y la verificación en el servidor de quién responde (va con P8 `aprobaciones-admin` y P9 en la base). Acá la verificación es del navegador: alcanza para un prototipo interno, no para uso real.
- Notificaciones reales (email, push, campanita con avisos de otras personas: P10 `avisos-en-la-base`).
- Firmas fuera de la cadena y constancias en la cadena (etapas 2 y 3 de ADR-012).
- Responder como **círculo** (gobernanza holocrática): hoy los círculos no tienen integrantes en el prototipo.
- Revocar desde la pantalla una aceptación ya hecha o dar de baja un pacto aceptado (consecuencias en Semillas sin decidir).
- La ronda de evaluación de pares y `f_eval` (cambio `evaluacion-pares`).
- Aportes en plata: siguen como hoy (no son pactos de dos partes).
- Cambiar a quien lidera una tribu. **Solo se anota, no se diseña:** en el futuro el consejo del Lighthouse podría cambiar a quien lidera una tribu (por ejemplo, la creada con el Plan Tribu). Como quién responde sale de un solo lugar (`comunidadesQueResponde`, design §10) y la constancia guarda la tribu como parte (no a la persona), un cambio de liderazgo no debería invalidar los pactos ya acordados.

## Capabilities

### New Capabilities
- `pactos-acuerdo`: cómo un pacto de tiempo (y cada cambio) se acuerda entre la persona y su tribu, con constancias de las dos partes.

### Modified Capabilities

(Ninguna archivada. Este cambio **reemplaza** el requisito "Respuesta simulada de la comunidad" del cambio `pactos-proponer-cambio` y el botón "Simular: la tribu acepta" de `pactos-tribu` y `pactos-v2`, que siguen sin archivar: al archivarlos hay que dejar constancia de que este cambio los supera.)

## Impact

- `lib/pactos/constancias.ts` (nuevo), `lib/pactos/estado.ts` (conciliar con las constancias; sin acciones "aceptar" del lado de la persona), `lib/pactos/registro-compartido.ts` (nuevo), `lib/demo/claves.ts` (clave compartida), `lib/privacidad/exportar.ts`, `app/mis-datos/mis-datos-cliente.tsx`.
- `app/pactos/pactos-cliente.tsx`, `app/pactos/responder/` (nuevo), `app/tribus/[id]/page.tsx` (enlace para quien lidera).
- Lectores de pactos: `lib/semillas/estado.ts`, `app/semillas/semillas-cliente.tsx`, `app/perfil/perfil-cliente.tsx`, `lib/panel/proximo-paso.ts`.
- `lib/idioma/textos/pactos.ts`, `lib/legal/terminos.ts`, `lib/actividad/eventos.ts`.
- e2e: `e2e/pactos.spec.ts` (los tests que apretaban "Simular…"), uno nuevo de dos personas, `e2e/accesibilidad.spec.ts` (ruta nueva).
- Decisión: `docs/decisiones/ADR-018-pactos-acordados-con-constancias.md` (Propuesta), porque ADR-012 dejó "la aceptación de los pactos por las dos partes" fuera.
