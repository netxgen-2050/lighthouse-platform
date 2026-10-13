## 0. Prerrequisitos

- [ ] 0.1 Confirmar que `sumarte-planes` y `login-privy` están en `main` (`app/sumarte/sumarte-cliente.tsx`, `lib/sumarte/estado.ts`, prefijo por persona en las claves). Si falta algo, frenar y reportar. Verificar con `git log origin/main --oneline` y `ls app/sumarte lib/sumarte`.
- [ ] 0.2 Listar los e2e que hoy activan un plan o un pase con un clic, para ajustarlos en 3.1. Verificar con `grep -rln "Hacerme miembro\|Quiero el Pase" e2e`.

## 1. Lógica

- [ ] 1.1 Sumar `TARIFA_SERVICIO_EJEMPLO = 0.05` a `lib/sumarte/datos.ts` y crear `lib/sumarte/pago.ts` con `Concepto`, `reparto`, `crearComprobante`, `agregarPago` y `leerPagos` (ver design). Sumar `pagos: "lh-pagos"` a `lib/demo/claves.ts`. Verificar con Vitest: los tres pases y las dos membresías dan los montos del design; las partes siempre suman el total; un comprobante mal formado se descarta sin perder el resto; JSON roto → lista vacía; `borrarDemo` quita `lh-pagos`. Correr `pnpm test`.
- [ ] 1.2 Agregar `pagodividido` y `arrepentimiento` a `lib/legal/terminos.ts` con `borrador: true` y el comentario de texto nuevo. Verificar con el test del catálogo (`esBorrador` verdadero para las dos) con `pnpm test`.

## 2. Pantalla

- [ ] 2.1 En `app/sumarte/sumarte-cliente.tsx`, reemplazar la activación directa por el resumen (foco al abrir, "Cancelar" devuelve el foco, se recalcula al cambiar nivel o facturación), con las leyendas y los ⚖. Verificar en `pnpm dev`: abrir y cancelar el resumen de Miembro y de cada pase; cambiar de nivel con el resumen abierto; cambiar la moneda en Configuración y ver los montos convertidos.
- [ ] 2.2 Confirmar guarda el comprobante y aplica la acción del reducer; sumar la sección "Tus pagos simulados". Verificar en `pnpm dev`: pagar Semilla, ver el comprobante, volver a Explorador y ver que el comprobante sigue.

## 3. Tests

- [ ] 3.1 Ampliar `e2e/sumarte.spec.ts`: abrir y cancelar; reparto del Raíz; membresía anual; cambio de nivel con el resumen abierto; ningún campo de texto en el resumen; pagar Semilla deja comprobante; comprobante roto; borrar todo; "Pedir invitación" no abre resumen; foco con teclado. Ajustar los e2e de 0.2 para que confirmen el pago simulado. Verificar con `pnpm test:e2e`.
- [ ] 3.2 Sumar a `e2e/accesibilidad.spec.ts` `/sumarte` con el resumen abierto y con un comprobante. Verificar sin violaciones `serious` ni `critical` con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/sumarte-pago-simulado` con guion de prueba (`/sumarte` → "Quiero el Pase Brote" → ver reparto Guardián/NetX y los dos ⚖ → confirmar → comprobante en "Tus pagos simulados" → "Pedir invitación" no abre pago). En el PR, recordar que la tarifa del 5 % es de ejemplo. Probar sobre el preview con `BASE_URL=<url de scripts/preview-url.sh agente/sumarte-pago-simulado> pnpm test:e2e e2e/sumarte.spec.ts`.
