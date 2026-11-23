# Tasks

## 0. Antes de empezar (decisión de Gus, 23-nov)

- [ ] 0.1 Archivar `bien-comun-tokens` (`pnpm exec openspec archive bien-comun-tokens`) y sacar de su spec archivada los requisitos que este cambio reemplaza (tramos, staking, reparto fijo, tierra como reserva). **Verifica:** `openspec/changes/bien-comun-tokens` ya no existe y `pnpm exec openspec validate --specs` pasa.

## 1. Modelo

- [ ] 1.1 Reescribir `lib/bien-comun/modelo.ts` según `design.md` §1: `VERSION_PROPUESTA`, `FARO_POR_M2` con fuente, `CARRILES`, `PUENTES`, `PUERTAS`, `QUE_DA`, `QUE_NO_TIENE`, `POLITICA`, `DECISIONES` (8, todas `"abierta"`), `CAMBIOS_DESDE_V_ANTERIOR`. Mantener `faroDeLote`, `loteTraeFaro` y `centroDeAnillo` con la misma firma. `PUENTES.parteDeCadaPago` lee `MODELO_LOTES.aporteUnico`. **Verifica:** `pnpm exec tsc --noEmit` sin errores; `grep -rn "cotizar\|TRAMOS\|STAKING\|REPARTO\|SUMINISTRO" app lib components e2e` sin resultados.
- [ ] 1.2 Reescribir `lib/bien-comun/modelo.test.ts`: 8 decisiones y todas abiertas; 3 puentes, 3 puertas, 6 palancas de política, cada valor con `fuente` no vacía; `faroDeLote(null)` es `null`; la parte de cada pago es igual a `MODELO_LOTES.aporteUnico`. **Verifica:** `pnpm test lib/bien-comun` en verde.

## 2. ⚖

- [ ] 2.1 En `lib/legal/terminos.ts`: borrar `ventatramos`, `stakingbiencomun`, `partenetxgen`; reescribir `tokenbiencomun`; sumar `fideicomisobarrio`, `tokentierra`, `tokeninversor`, `tesorocomun`, todos con `borrador: true` y `en`. **Verifica:** `pnpm test lib/legal` en verde con `terminos.test.ts` actualizado (claves nuevas presentes y en borrador; claves viejas ausentes; `tokentierra` menciona la Ordenanza 173; `tokeninversor` dice que no hay fecha fija).
- [ ] 2.2 <!-- arquitecto: ADR-031 --> `tokenbiencomun` y los textos de "qué da" / "voz" presentan la membresía y la voz por FARO como propuesta y dicen que hoy ser parte del común sale de adherir al manifiesto (`design.md` §5 bis). **Verifica:** test en `terminos.test.ts` que exige "manifiesto" en `tokenbiencomun` (es) y "manifesto" (en); `grep -rn "bien-comun/modelo" lib/membresia lib/pactos lib/permisos lib/fogon` sin resultados.

## 3. Textos

- [ ] 3.1 Reescribir `lib/idioma/textos/bien-comun.ts` (es/en) con claves que espejan el módulo: sello, frase, carriles, puentes, puertas, qué da, qué no tiene, política, decisiones (pregunta y recomendación de Gus, del doc 34 §7), cambios, preguntas para el abogado (doc 34 §9), Ostrom y parcelas comunes revisados (sin "tribu", sin tramos ni staking). Conservar la clave `enlace` que usan otras pantallas. Actualizar la descripción de `/bien-comun` en `lib/idioma/revision-nativa.ts` (hoy nombra tramos y staking). **Verifica:** `lib/idioma/textos/bien-comun.test.ts` actualizado (mismas claves en es y en) en verde; `grep -niw "tramos\|staking" lib/idioma/revision-nativa.ts` sin resultados.

## 4. Componentes y página

- [ ] 4.1 Crear en `components/bien-comun/`: `SelloPropuesta`, `DiagramaCarriles`, `ListaPuertas`, `TarjetasPolitica`, `TablaDecisiones`, `ListaCambios`. Reciben datos y textos por props; no importan `lib/bien-comun/modelo.ts`. **Verifica:** `grep -rn "bien-comun/modelo" components/bien-comun` sin resultados.
- [ ] 4.2 Reescribir `app/bien-comun/page.tsx` en este orden: título, sello, aviso de prototipo, frase, diagrama, puertas + qué da + qué no tiene, política, decisiones, qué cambió, Ostrom, parcelas comunes, preguntas para el abogado, versión y enlace a `/lotes/hibrido`. `git rm app/bien-comun/calculadora.tsx`. **Verifica:** `pnpm build` en verde; la página en `pnpm dev` muestra el sello antes de cualquier número.

## 5. Reglas vigiladas

- [ ] 5.1 Actualizar `lib/lotes/sin-numeros-escritos.test.ts`: sumar `components/bien-comun/` a los archivos vigilados; afinar el test de promesas según `design.md` §4 (retorno permitido solo bajo `carriles.a`; sumar "precio de FARO" / "FARO price"); quitar del listado las claves de ⚖ borradas y sumar `tesorocomun`. **Verifica:** `pnpm test lib/lotes/sin-numeros-escritos` en verde, y falla si se agrega a propósito "retorno" en `puertas` del diccionario (probar y revertir).

## 6. E2E y accesibilidad

- [ ] 6.1 Reescribir `e2e/bien-comun.spec.ts`: sello antes de cualquier número (es y en); diagrama con dos carriles y una lista de tres puentes; tres puertas sin botón de compra; seis tarjetas de política; 8 decisiones con "abierta"; 4 líneas en "Qué cambió"; "tramo" y "staking" solo dentro de "Qué cambió"; sin "procomún", "tribu" ni "Hadron"; sin scroll horizontal a 390 px; navegación con Tab por toda la página. **Verifica:** `pnpm test:e2e e2e/bien-comun.spec.ts` en verde.
- [ ] 6.2 Confirmar que `/bien-comun` y `/bien-comun?lang=en` siguen en `e2e/accesibilidad.spec.ts`. **Verifica:** `pnpm test:e2e e2e/accesibilidad.spec.ts` en verde.

## 7. Cierre

- [ ] 7.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate bien-comun-propuesta --strict` pasa.
