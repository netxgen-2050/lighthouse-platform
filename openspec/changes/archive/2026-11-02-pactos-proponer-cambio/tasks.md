## 1. Estado

- [x] 1.1 `lib/pactos/estado.ts`: `version`, `cambio` e `historial`; acciones `retirar`, `proponerCambio`, `editarCambio`, `enviarCambio`, `aceptarCambio`, `rechazarCambio` y `descartarCambio`; lectura del formato anterior. Tests de Vitest: retirar vuelve a borrador con el contenido; el cambio no afecta `pactosAceptados` hasta aceptarse; aceptar sube la versión y agrega al historial; rechazar y descartar dejan la vigente; cambio incompleto no se envía; pacto aceptado viejo se lee como versión 1. Verificar con `pnpm test lib/pactos lib/semillas`.

## 2. Pantalla y eventos

- [x] 2.1 `app/pactos/pactos-cliente.tsx`: "Retirar y editar", "Proponer un cambio", bloque "Cambio propuesto" con sus pasos y botones simulados, "Descartar cambio", aviso de rechazo, número de versión real e historial plegable. Eventos nuevos en `lib/actividad/eventos.ts`. e2e en `e2e/pactos.spec.ts`: retirar y editar; aceptar un pacto, proponer 20 h/mes, ver que Semillas sigue en 10 h/mes, aceptar el cambio y ver versión 2 y Semillas en 20 h/mes; proponer otro y rechazarlo; historial con dos versiones; evento en `/panel`. Verificar con `pnpm test:e2e e2e/pactos.spec.ts`.

## Integración

- [x] F.1 `pnpm verificar` y `pnpm build` en verde; la auditoría de axe pasa en `/pactos` con un cambio en curso. PR desde `agente/pactos-proponer-cambio` que mencione "Closes #50", con guion de prueba (pacto aceptado → proponer cambio → Semillas → aceptar → historial → proponer otro → no aceptar).
