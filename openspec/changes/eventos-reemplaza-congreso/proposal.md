# Proposal

## Why

Gus decidió el 2-nov-2026 que la sección Congreso se reemplaza por Eventos (Backlog D16). `eventos` construye la página; este cambio hace el reemplazo: el rail ofrece Eventos, `/congreso` y `/congreso/en` redirigen, y nada sigue invitando a registrar un ticket de un Congreso que no va a ocurrir. El código de la vitrina se conserva, como se hizo con Compromisos, con una nota para volver.

**Depende de `eventos`:** se implementa cuando ese cambio ya esté en `dev`.

## What Changes

- **Rail.** En Participar, "Congreso" ("Congress") pasa a ser "Eventos" ("Events") y lleva a `/eventos`, en el mismo lugar y habilitado también sin cuenta. El destino `/congreso` queda declarado con `oculto: true`.
- **Redirección temporal (307).** `/congreso` va a `/eventos`, conservando query y ancla. `/congreso/en` también, y deja el idioma en inglés solo si la persona todavía no eligió uno. Se usa 307 y no 308, para que los navegadores no guarden la redirección y se pueda volver.
- **Enlaces internos.** Todo lo que enlazaba a `/congreso` pasa a `/eventos`: portada, próximo paso de Mi recorrido, sello Genesis del Pasaporte, Semillas y el enlace del evento de actividad del ticket.
- **Textos que invitan a algo que ya no se puede hacer.**
  - **Portada:** el camino pasa a "Eventos", sin "Feb 2027". `?camino=congreso` sigue funcionando como alias, porque hay enlaces y orígenes guardados.
  - **Mi recorrido:** el paso final deja de ser "Registrá tu ticket" y pasa a "Elegí un evento". Se cumple con un "Quiero ir" o con un ticket válido ya guardado, para que nadie retroceda.
  - **Pasaporte:** el sello Genesis deja de pedir un ticket y dice que se está definiendo cómo se obtiene. No promete la propuesta de la nota 20.
  - **Semillas:** el detalle de presencia deja de pedir el ticket y enlaza a Eventos.
  - **Sumarte:** Explorador dice "Hifa, Eventos y tu espacio personal", y sale "Registro de tu ticket del Congreso".
  - **Puerta `registrar-ticket`:** solo cambia el texto visible, a "Anotarte a eventos". Su id y la tabla de permisos no cambian.
- **Nota para volver.** Se crea `docs/notas/congreso-en-pausa.md`: qué pasó, qué quedó, de qué depende `/eventos`, qué se dejó sin resolver y los pasos para volver.
- **Tests.** Los e2e de la vitrina quedan con `test.describe.skip` y una referencia a la nota, sin borrarse. Se ajustan los que esperaban el enlace o los textos.

**Fuera de alcance (se anota en la nota):**
- Borrar o cambiar `app/congreso/`, `lib/congreso/`, los términos `ticket` y `encuentroeducativo`, la clave `lh-congreso-ticket` o el ticket ya guardado.
- Presencia Genesis y check-in (P3, D16): cómo se obtiene el sello, y el nivel del Pase que lo menciona.
- Lo que depende de `NS_Tokenomics` I-15: "Cohorte Génesis · Feb 2027", "Registro Genesis si venís al Congreso", el término `ronda0` y `SUPUESTO_CONGRESO` en `/netx`. Siguen como están y se listan como pendientes (ver preguntas abiertas).
- Las reglas del middleware y de `rutas.ts` sobre `/congreso`: la redirección las vuelve inalcanzables, pero siguen probadas con sus tests unitarios y sirven para volver.
- La tabla de permisos y el id `registrar-ticket`.
- Actualizar D16 y L10 del backlog en `NS_platform`: es documentación de producto, fuera de este repo.
- Venta de entradas, UnityHub y convocatorias completas de la red.

## Capabilities

### New Capabilities
- `eventos-reemplaza-congreso`: la plataforma ofrece Eventos en lugar del Congreso: navegación, redirecciones, enlaces, textos y conservación de la vitrina.

### Modified Capabilities

(ninguna: `rail-destinos-ocultos`, del cambio `rail-sin-compromisos`, todavía no está archivada en `openspec/specs/`. Su spec nombra Congreso en la lista de Participar: al archivarla hay que leerla junto con esta.)

## Impact

- Código: `next.config.ts`, `lib/navegacion.ts`, `lib/idioma/glosario.ts`, `lib/idioma/textos/{marco,portada,recorrido,pasaporte,semillas,sumarte}.ts`, `lib/sumarte/datos.ts`, `lib/portada.ts`, `lib/origen/origen.ts`, `lib/panel/proximo-paso.ts`, `lib/pasaporte/sellos.ts`, `lib/actividad/eventos.ts`, `app/semillas/semillas-cliente.tsx`.
- Tests: `lib/navegacion.test.ts`, `lib/portada.test.ts`, `lib/origen/origen.test.ts`, `lib/panel/panel.test.ts`, `lib/canales/puertas.test.ts`, los de sellos, y los e2e `marco`, `portada`, `idioma-portada-sumarte`, `descubrir-publico`, `sumarte-acceso`, `panel`, `semillas`, `bandeja`, `configuracion`, `idioma`, `accesibilidad`, `congreso` y `congreso-en`.
- Documentación: `docs/notas/congreso-en-pausa.md` (nuevo), notas en ADR-002 y ADR-003.
- **Permisos:** `/congreso` sigue siendo pública, pero no se llega a ella. **Datos personales:** se lee la clave del ticket ya existente y no se agrega ningún dato, sin cambios en la política. Sin tablas, sin migraciones y sin integraciones. **Pide revisión del arquitecto.**
