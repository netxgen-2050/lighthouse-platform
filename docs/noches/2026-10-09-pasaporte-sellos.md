# Noche 2026-10-09 — pasaporte-sellos
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/47 · **Preview:** https://lighthouse-platform-qrxqfyz0v-net-xg-en.vercel.app

## En una línea
El pasaporte ahora junta en un solo lugar los sellos de la persona (membresía, identidad, inversor, pase, etc.) con una verificación de identidad simulada de 5 pasos. Quedó listo para revisar, con cuatro decisiones tuyas pendientes y un test intermitente que no es del PR.

## Qué quedó hecho (tareas 3/3)
- 1.1 Lógica de los sellos y del estado de la verificación, con tests: hecha.
- 1.2 Pantalla `/pasaporte` rehecha, diálogo de verificación, entradas desde Sumarte ("Pedir invitación") y Pactos ("Registrar aporte"), `/canales` redirige a `/pasaporte`, se quitó la escalera de Semillas: hecha.
- F.1 Verificación y build en verdes (437 tests), accesibilidad sin violaciones serias, PR con guion de prueba: hecha.

Ocho sellos: Explorador/a, Miembro de la red, Miembro de comunidad, Identidad verificada, Inversor habilitado, Pase Fundador, Genesis y Residente. Todo es simulado y vive en el navegador. Se quitó "Tus caminos". El texto legal nuevo `kyc` quedó como borrador.

## Qué decidir a la mañana
1. **Permisos escritos a mano (media).** Lo que abren "Identidad verificada" e "Inversor habilitado" está escrito a mano, no sale de `lib/permisos`, aunque la spec lo pide. Acción sugerida: sumarlo a `lib/permisos` en una próxima noche, o aceptar la excepción por ahora.
2. **Cuarto estado "No disponible todavía" (baja).** Se usa en Residente y en Inversor del exterior, porque "Disponible" con botón engañaría. La spec nombra tres estados y se contradice con su propia proposal sobre Residente. Acción sugerida: aprobar el cuarto estado y ajustar la spec.
3. **Genesis nunca se obtiene en la demo (baja).** No existe el check-in; con ticket queda "En trámite". Acción sugerida: agregar un botón "Simular: check-in confirmado" o aceptar que no se alcance.
4. **Tarjeta "Cómo vas a aportar" (baja).** No está en la spec; se mantuvo porque Pactos lee esos datos para sus avisos. Acción sugerida: dejarla y sumarla a la spec, o moverla a otro lugar.
5. **Cosas menores a confirmar.**
   - Las fechas de los sellos sin fecha propia son el primer día que se vieron en este navegador.
   - Semillas conserva el medidor de 120 y un enlace al pasaporte.
   - "Pedir una charla" no pide verificación, porque la spec solo menciona "Pedir invitación".
6. **Textos legales en borrador.** `kyc` e `inversorexterior` están marcados como borrador; hay que revisarlos antes de cualquier uso real.
7. **Mergear.** Nadie mergeó ni tocó `main`; el merge es tuyo.

## Revisor: veredicto y hallazgos
Veredicto final (3ª pasada): con observaciones, solo porque las decisiones 1 a 4 de arriba esperan tu respuesta. No quedan hallazgos nuevos.
- 7 hallazgos en la primera pasada (0 altos, 1 medio, 6 bajos).
- Corregidos en la vuelta 1: las fechas de sellos ya se limpian (solo al visitar `/pasaporte`); Pactos continúa el registro al aprobar la verificación; el texto de Ganancias pasó al catálogo legal.
- 2ª pasada: un hallazgo bajo (el sello Inversor tenía tres ⚖ y decía "Tocá el ⚖"). Corregido en la vuelta 2: un solo ⚖ en el título y otro junto al detalle.
- Comentarios: https://github.com/netxgen-2050/lighthouse-platform/pull/47#issuecomment-6078685331 y https://github.com/netxgen-2050/lighthouse-platform/pull/47#issuecomment-6078721412

## Tester: resultado
**Pasa, con un test intermitente.** Contra el preview: 317 pasan y 1 falla (`e2e/perfil.spec.ts:97`, vio un pedido HEAD/OPTIONS al servidor, ruido del preview de Vercel). Al repetirlo, pasó. El PR no toca esa pantalla. Los 13 tests de pasaporte pasan. Guion manual pasos 1 a 7: bien (1 a 6 por e2e, 7 por curl).

**No se probó:** recorrido a mano en un navegador, la rama "Exterior" del Inversor, menor de 18 años y "Atrás" del diálogo a mano, Genesis obtenido.

Reporte: https://github.com/netxgen-2050/lighthouse-platform/pull/47#issuecomment-6078787822

## Para la próxima noche
- Según lo que decidas en los puntos 1 a 4, ajustar la spec o el código.
- Investigar el test intermitente de `e2e/perfil.spec.ts:97` (no es de este PR).
- Probar a mano en el navegador lo que no cubrió el tester.
- Nota de proceso: en la primera revisión el permiso rechazó `scripts/pr.sh comentar` y `diff`; en las pasadas siguientes funcionó. Conviene revisar por qué fue intermitente.
