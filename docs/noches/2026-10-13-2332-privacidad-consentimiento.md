# Noche 2026-10-13-2332 — privacidad-consentimiento
**PR:** https://github.com/netxgen-2050/lighthouse-platform/pull/63 (base: `agente/sumarte-acceso`) · **Preview:** https://lighthouse-platform-hnbaj3w1h-net-xg-en.vercel.app

## En una línea
Nada falló: el PR agrega la pantalla de consentimiento, la página /privacidad y /mis-datos; el revisor y el tester lo dieron por bueno, pero hay cinco decisiones tuyas, varias sobre textos legales y datos personales.

## Qué decidir a la mañana
Todas quedaron abiertas para vos (ninguna bloquea el PR, pero conviene resolverlas antes de mostrarlo fuera del equipo).

1. **(a) Quién retiró el consentimiento no puede pedir el borrado sin volver a aceptar** (media). /mis-datos exige consentimiento. Acción sugerida: decidir si quien retiró debe poder pedir el borrado sin re-aceptar; lo más razonable es permitirlo, porque es su derecho.
2. **(b) Textos legales fuera del catálogo** (media). Los textos de `lib/privacidad/politica.ts`, las casillas de consentimiento y `kyc-dialogo.tsx:236` no están en `lib/legal/terminos.ts` ni llevan `borrador: true`. Acción sugerida: pedir a un agente que los mueva al catálogo y los marque como borrador.
3. **(c) El pedido de borrado manda el email a un issue de GitHub** (media). No se pudo verificar si el repo es público. Acción sugerida: confirmar si es público; si lo es, cambiar el canal (por ejemplo un correo) o no incluir el email.
4. **(d) Datos agregados por el agente** (baja): plazo de conservación de 10 años ("UIF, Ley 25.246") y responsable en Honduras. Acción sugerida: que Gabriel los confirme o los saque (R14).
5. **(e) El servidor no verifica el consentimiento** (baja). Hoy solo se exige en el navegador. Acción sugerida: exigirlo también en `/api` cuando llegue `base-neon`.

Además, para Gabriel (R14): todo `politica.ts`, los textos de las dos pantallas de consentimiento (general y KYC) y los términos `datos` y `transferencia`. El email `privacidad@netx.example` es de ejemplo.

## Qué quedó hecho (tareas 5/5)
- 1.1 Lógica de privacidad (`lib/privacidad/consentimiento.ts`): versión de la política, registro, lectura y exportación. Hoy se guarda en el navegador. "Borrar todo" no lo borra; solo "Retirar mi consentimiento".
- 2.1 Pantalla de consentimiento al entrar (dos casillas obligatorias), antes de aplicar el plan de Sumarte. Hifa y Reportar quedan ocultos hasta aceptar. Consentimiento aparte para datos sensibles al iniciar el KYC.
- 2.2 /privacidad pública (borrador) y /mis-datos (descargar JSON, retirar consentimiento, pedir borrado). Enlaces en el pie, el menú del avatar y Configuración.
- 3.1 Tests e2e: 20 nuevos al principio, 22 al final; 6 existentes ajustados; /privacidad y /mis-datos en la auditoría de accesibilidad.
- 4.1 `pnpm verificar` y `pnpm build` en verde.

Límites a tener en cuenta:
- Las tareas 2.1 y 2.2 pedían verificar en `pnpm dev`; se verificaron con e2e sobre el build de producción, no a mano.
- Con el almacenamiento del navegador bloqueado, la persona queda en la pantalla de consentimiento con un aviso.
- Retirar el consentimiento no borra la cuenta de Privy; eso va por el pedido de borrado.
- Rama sin test: si falla el guardado del consentimiento, se restaura la hora previa del plan pendiente, pero eso no tiene test propio.

## Revisor: veredicto y hallazgos
Tres vueltas. Veredicto final: **listo para revisión humana, 0 hallazgos nuevos**.
- Vuelta 1 (con observaciones, 8 hallazgos: 4 medios, 4 bajos). Tres corregidos: el plan pendiente de Sumarte vencía a los 5 minutos y se perdía si se aceptaba tarde; el resumen decía "corregir" desde Mis datos; el enlace de descarga se liberaba justo después del clic (ahora a los 10 s). Los otros cinco son las decisiones (a) a (e) de arriba. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/63#issuecomment-6157239675
- Vuelta 2 (con observaciones): la corrección reviviría un pedido ya vencido (se aplicaría un plan abandonado) y renovaba antes de guardar. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/63#issuecomment-6157281276
- Vuelta 3 (final): las dos resueltas. 653 tests unitarios y 22/22 e2e de privacidad. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/63#issuecomment-6157324445

## Tester: resultado
**Pasa.** Contra el preview: 478 pasaron, 0 fallaron, 11 omitidos. `/privacidad` responde bien con curl. Comentario: https://github.com/netxgen-2050/lighthouse-platform/pull/63#issuecomment-6157372116
No se probó:
- El guion manual (pasos 1 a 8) no se recorrió a mano en un navegador; lo cubre `e2e/privacidad.spec.ts`, todo en verde.
- Cambiar `VERSION_POLITICA` a mano (lo cubre un e2e).
- Un issue real en GitHub (necesita `REPORTES_GITHUB_TOKEN`; el e2e lo simula).

## Para la próxima noche
- Mover los textos legales al catálogo con `borrador: true` (b).
- Resolver (a) y (c) según lo que decidas.
- Agregar un test para la restauración cuando falla el guardado del consentimiento.
- Con `base-neon`: guardar el consentimiento en la base y exigirlo en `/api`.
- Recorrer a mano el guion del PR (8 pasos) en el preview.
- Recordar que el PR apunta a `agente/sumarte-acceso`: se mergea después de ese.
