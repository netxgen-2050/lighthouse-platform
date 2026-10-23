# Tasks

## 0. Antes de empezar

- [ ] 0.1 Confirmar con Gus los dos supuestos del proposal (Plan Tribu USD 600/año y "de por vida" para el pase). Si cambian, actualizar spec y proposal antes de seguir. Verificación: respuesta de Gus anotada en el PR.

## 1. Datos

- [ ] 1.1 En `lib/sumarte/datos.ts`, reemplazar `PLAN_TRIBU_MENSUAL` por un objeto con precio mensual y anual (`{ mensual: 60, anual: 600 }`), con el mismo comentario de "cifras de ejemplo". Verificación: `pnpm verificar` sin errores de tipos.
- [ ] 1.2 Test unitario en `lib/sumarte/sumarte.test.ts`: el precio anual de Miembro y de Plan Tribu es 10 veces el mensual (regla "2 meses gratis"). Verificación: test en verde.

## 2. Pantalla

- [ ] 2.1 En `app/sumarte/sumarte-cliente.tsx`, el Plan Tribu muestra precio y "/mes" o "/año" según `estado.facturacion`, igual que Miembro. Verificación: e2e del escenario "Cambiar a anual".
- [ ] 2.2 Mostrar "2 meses gratis" junto al precio de Miembro y Plan Tribu solo en "Anual". Verificación: e2e "Ahorro en anual" y "Sin ahorro en mensual".
- [ ] 2.3 El precio del Pase Fundador dice "pago único · de por vida" en tamaño de texto de la tarjeta (no `text-muted` chico). Verificación: e2e "El pase no cambia con el selector".
- [ ] 2.4 Revisar que el monto del Fondo Común y los medidores no cambian con el selector. Verificación: e2e existente de `/sumarte` en verde.

## 3. Cierre

- [ ] 3.1 Escenario "Moneda en pesos": con ARS y Anual, los dos precios anuales se convierten y dicen "/año". Verificación: e2e o test de componente.
- [ ] 3.2 `pnpm verificar` y `pnpm build` en verde; auditoría de axe de `/sumarte` sin errores nuevos.
