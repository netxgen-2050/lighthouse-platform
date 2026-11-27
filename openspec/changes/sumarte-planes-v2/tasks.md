# Tasks

Va sobre `dev`. Reemplaza el selector de cuatro planes de `ux-sumarte` (design §3).

## 1. Datos y estado

- [x] 1.1 `lib/sumarte/datos.ts`: los planes de design §1 y `FARO_PREPAGO` de §2. Salen `PASSES`, `COHORT` y `PLAN_TRIBU`, y entra un medidor de cohorte "N de 100". **Verifica:** `pnpm test lib/sumarte`.
- [x] 1.2 `lib/sumarte/estado.ts`: migración del estado guardado (design §5), con tests para cada caso viejo. **Verifica:** `pnpm test lib/sumarte`.

## 2. Acceso

- [x] 2.1 `lib/permisos/niveles.ts`: `adherir` pasa a Explorador. Nombres visibles Amigo, Fundador y Aliado (design §4 y §5). **Verifica:** `pnpm test lib/permisos`. e2e: un Explorador se suma a un equipo en `/participa` y adhiere al manifiesto sin que le pidan un plan.

## 3. Vista

- [x] 3.1 Compu: tabla de precios, selector Mensual/Anual, franja de Aliados y comparación con encabezado fijo (design §3). **Verifica:** e2e a 1440 px: tres columnas, "El más elegido" en Amigo y "Anual" que cambia solo a Amigo.
- [x] 3.2 Celular: selector de tres opciones, Aliados como tarjeta, plan en la URL y direcciones viejas redirigidas (design §3). **Verifica:** e2e a 390 px sin scroll horizontal; `?plan=miembro` muestra Amigo.
- [x] 3.3 Bloque "Cómo funciona el FARO de tu plan" con "Borrador · a definir" y el reparto del pago en texto (design §2). **Verifica:** e2e: con Amigo elegido se leen las cinco reglas y "(a definir)".
- [x] 3.4 "Próximamente" en los beneficios que no existen, y "Darme de baja" para Amigo (design §1 y §6). **Verifica:** e2e: Amigo se da de baja y vuelve a Explorador; los beneficios marcados dicen "Próximamente" en texto.
- [x] 3.5 Sacar "Para inversores" de Sumarte. Quedan las tarjetas "Comprar un lote" e "Invertir". **Verifica:** e2e: `/sumarte` no dice "Pedir invitación"; la tarjeta Invertir lleva a `/invertir`.

## 4. Textos

- [x] 4.1 `lib/idioma/textos/sumarte.ts` y el glosario, en es y en (design §6). Regenerar `docs/idioma/revisar-nativo.md`. **Verifica:** `pnpm test lib/idioma`; test nuevo sin "inversión", "retorno", "rendimiento" ni "de por vida" en Sumarte.

## 5. Cierre

- [x] 5.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate sumarte-planes-v2 --strict` pasa; suite e2e completa en verde; axe sin violaciones en claro y oscuro, a 390 y 1440 px. En el PR: cómo se ve `/sumarte` en compu y en el celular.
