# Noche 2026-10-27-m — idioma-pasaporte-semillas-pactos
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/113 (base `dev`) · **Preview:** NO DISPONIBLE (el deploy de Vercel falló)

## En una línea
El código está hecho, revisado tres veces y pasa todas las pruebas en local, pero **el preview de Vercel falló y por eso el tester no pudo probar nada contra el preview**. Hace falta que alguien con acceso a Vercel lea el log antes de mergear.

## Qué decidir a la mañana
1. **Bloqueo: el deploy de Vercel está en error** (commit `a8f8230`). Desde el commit anterior ya fallaba y, según el revisor, también falla otra rama (`agente/sumarte-periodo-coherente`), mientras `dev` sale en verde. Lo más probable es un problema del entorno de Vercel y no de este cambio, porque `pnpm build` local pasa (55/55 páginas). Pero no está confirmado: la causa real es desconocida.
   - Acción sugerida: correr `npx vercel inspect dpl_3yLfhpSPBpJs2AASPnTEtc24mybZ --logs` (con tus credenciales) o mirar https://vercel.com/net-xg-en/lighthouse-platform/3yLfhpSPBpJs2AASPnTEtc24mybZ. Si es el entorno, reintentar el deploy. No mergear hasta tener un preview en verde.
2. **Prueba manual pendiente.** Los pasos 1 a 6 del guion del tester no se ejecutaron contra el preview. Acción sugerida: una vez arreglado el deploy, volver a correr al tester (o hacer el guion a mano) sobre el preview.
3. **Decisión de diseño (hallazgo 5, severidad baja): datos de ejemplo.** La spec decía que los datos de ejemplo de Pactos y Semillas pasaran a `Bilingue`. El implementador dejó los datos en español y agregó tablas en inglés aparte (`_EN`) con funciones que eligen según el idioma (`lib/pactos/datos.ts`, `lib/semillas/datos.ts`). Funciona y está probado, pero se aparta del patrón de `idioma-base`. Acción sugerida: aceptarlo tal cual, o pedir una noche de migración a `Bilingue`.
4. **Limpieza menor en el PR.** Hay dos comentarios que dicen solo `--body` (14:22 y 14:34), restos de una publicación mal armada. Acción sugerida: borrarlos.
5. **Todo el inglés lo escribió un agente.** Está anotado como `pendiente` de revisión nativa en `lib/idioma/revision-nativa.ts` y listado en `docs/idioma/revisar-nativo.md`. El 🌱 de Semillas en inglés es borrador ("Draft: text under review"). Acción sugerida: pasar esos textos por una persona de habla inglesa antes de mostrarlos fuera del equipo.

## Qué quedó hecho (tareas 6/6)
- 1.1 Pasaporte en inglés: diccionario `lib/idioma/textos/pasaporte.ts`; sellos, datos y páginas leen de ahí. "Genesis" con `translate="no"`.
- 1.2 Verificación de identidad (KYC) con idioma, sin cambiar qué se pide ni dónde se guarda.
- 2.1 Semillas en inglés: "Semillas" no se traduce ("Semillas (seeds)" en la primera mención, con `translate="no"` en todas las menciones). Se agregó `components/marca-semillas.tsx` para eso.
- 2.2 Pactos en inglés, con montos y tipo de cambio según idioma. Lo que escribe la persona sale con `lang="es"` (incluido el rol "Otro").
- 3.1 Las rutas `/pasaporte`, `/semillas` y `/pactos` entran en `RUTAS_TRADUCIDAS`; e2e nuevos con los escenarios de la spec.
- 3.2 Las tres páginas en inglés y el diálogo de KYC suman a la auditoría de accesibilidad (axe).

Límites que quedaron a propósito:
- El consentimiento de datos sensibles del KYC sigue en español (marcado como tal) hasta el cambio `idioma-legal`.
- En las puertas solo se traducen nombre y estado, que es lo que muestra el Pasaporte.

## Revisor: veredicto y hallazgos
Veredicto final (ronda 3): listo para revisión humana, sin hallazgos nuevos.
- Ronda 1 (con observaciones): 1 media y 4 bajas.
  - Media: el sello "Eligible investor" en inglés citaba un título legal que no existe. Corregido: ahora remite a la explicación ⚖ que está al lado.
  - Baja: el rol "Otro" no tenía `lang`. Corregido.
  - Baja: faltaba `translate="no"` en varias menciones de Semillas. Corregido.
  - Baja: faltaban pruebas del error del KYC en inglés desde Sumarte y Pactos. Corregido.
  - Baja: la decisión de datos `Bilingue` frente a tablas `_EN`. Queda para vos (punto 3).
- Ronda 2 (con observaciones): 1 hallazgo bajo. Dos frases de Pactos ("… Semillas per month") sin `translate="no"`. Corregido en el commit `a8f8230`.
- Ronda 3: confirmó la corrección. `pnpm verificar` en verde (1336 tests unitarios) y 61 e2e en verde. Sin regresiones.
- Aviso del revisor: Vercel fallaba en los commits del PR y en otra rama, mientras el build local pasaba (punto 1).

## Tester: resultado
**Bloqueado.** `scripts/preview-url.sh` respondió "El deploy de Vercel falló para a8f8230411ca92da2487107382edc73915dac685". El estado del commit es `failure`. No se pudieron leer los logs de Vercel (hacen falta credenciales), así que la causa es desconocida.
- Local (no valida Vercel): `pnpm build` pasa (55/55 páginas) y `pnpm test:e2e` dio 730 pasaron, 0 fallaron.
- El guion manual (pasos 1 a 6) no se ejecutó contra el preview.
- No hubo vuelta de corrección: no es una falla de código sino de entorno.
- Reporte completo: https://github.com/netxgen-2050/lighthouse-platform/pull/113#issuecomment-6445028690

## Para la próxima noche
- Destrabar el deploy de Vercel y repetir al tester sobre el preview.
- Si pedís la migración a `Bilingue` de los datos de Pactos y Semillas, abrirla como cambio chico aparte.
- `idioma-legal`: traducir el consentimiento de datos sensibles del KYC, hoy en español dentro de un diálogo en inglés.
- Revisión nativa del inglés nuevo (ver `docs/idioma/revisar-nativo.md`).
- Observación menor: en la primera corrida del revisor, algunos e2e fallaron por arranque en frío y un build falló por la descarga de la fuente de Google (red). Pasaron al repetir; si vuelven a aparecer, conviene mirarlos.
