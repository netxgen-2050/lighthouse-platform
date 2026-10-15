## 1. Datos y lógica

- [ ] 1.1 `lib/vista-netx/datos.ts`: dejar de declarar `EMISION` y reexportar (o importar) la de `lib/sumarte/datos.ts`; el bloque de cumplimiento de `/netx` sigue mostrando lo mismo. Verificar con `pnpm test lib/vista-netx` y `pnpm verificar`.
- [ ] 1.2 Función pura en `lib/vista-netx/` que arma los bloques A, B y C a partir de `MEMBRESIA`, `PLAN_TRIBU_MENSUAL`, `COHORT` y `EMISION` (cantidades y tarifas en `null` = "sin dato"), y otra que cuenta pedidos por motivo (`invitacion-circulo`, `charla-netx`) ignorando el resto. Verificar con tests de Vitest (precios; cohorte 142/300 y 46.000/75.000; emisión 480.000 y 22/35; conteo 2 + 1 ignorando `consulta-lote`; bandeja vacía) en `pnpm test lib/vista-netx`.

## 2. Interfaz

- [ ] 2.1 Componente `app/netx/captacion.tsx` con la sección "Captación · a quién va la plata" y los tres bloques rotulados, ⚖ `membresia`, `plantribu`, `guardian`, `circulo`, `safe` y `caja`, medidores con número en texto (reusar el `Medidor` de la página o moverlo a un componente común), y una parte cliente que lee la bandeja con `leerBandejaDelNavegador` en `useEffect` ("Cargando…" antes de leer) y enlaza a `#t-pedidos`. Montarlo en `app/netx/page.tsx` después de los indicadores. Solo tokens del tema. Verificar mirando `/netx` como super admin en `pnpm dev` a 1440 y 390 px.

## 3. Pruebas de punta a punta

- [ ] 3.1 `e2e/vista-netx.spec.ts`: la sección va antes del embudo; bloques en orden A, B, C; "sin dato" en cantidades del bloque A y sin "USD 0" fuera de "Fondos recibidos"; 142 / 300 y 46.000 / 75.000; con pedidos sembrados en el navegador (dos de invitación, uno de charla, uno de lote) muestra 2 y 1; sin pedidos, el texto vacío; quien no es super admin no ve la sección; auditoría de axe. Verificar con `pnpm test:e2e e2e/vista-netx.spec.ts`.

## Integración

- [ ] F.1 `pnpm verificar` y `pnpm build` en verde. PR desde `agente/vista-netx-captacion` con guion de prueba (pedir invitación y charla en /sumarte → abrir /netx como super admin → ver los conteos) y capturas a 1440 y 390 px.
