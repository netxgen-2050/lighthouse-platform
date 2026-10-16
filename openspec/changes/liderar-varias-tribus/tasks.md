## 1. Estado y sesión

- [x] 1.1 `lib/sumarte/estado.ts`: lista `tribus` y `tribuNueva`, acciones `tribu` y `dejarTribu`, lectura del formato anterior y descarte de ids inválidos. Tests de Vitest para: formato anterior con tribu y con tribu nueva, sumar sin duplicar, dejar una de dos, dejar la última (queda Miembro y conserva el Pase), cambiar a Explorador vacía todo. Verificar con `pnpm test lib/sumarte`.
- [x] 1.2 `lib/sesion/nivel.ts` y contexto de sesión: `tribusLider: string[]`, con la tribu de `LH_PERSONAS` como piso no removible. Actualizar `MarcaAdmin` y el menú del avatar. Tests de `calcularNivel`. Verificar con `pnpm test lib/sesion`.

## 2. Pantalla

- [x] 2.1 Plan Tribu en `/sumarte`: lista de tribus lideradas con "Dejar de liderar", "Sumar otra tribu" (sin las ya lideradas; sin "Proponer una tribu nueva" si ya hay una pendiente), diálogo de confirmación accesible y precio por tribu con total. e2e en `e2e/sumarte-acceso.spec.ts`: sumar Taller Común siendo líder de Valle Solar (con diálogo), cancelar con Escape, marca de admin en `/tribus/valle` y `/tribus/taller` y no en `/tribus/semilla`, total "USD 120/mes", volver a Explorador. Verificar con `pnpm test:e2e e2e/sumarte-acceso.spec.ts`.

## Integración

- [x] F.1 `pnpm verificar` y `pnpm build` en verde; la auditoría de axe pasa en `/sumarte` con el diálogo abierto. PR desde `agente/liderar-varias-tribus` con guion de prueba (Miembro → Plan Tribu Valle Solar → Sumar otra tribu → Taller Común → confirmar → ver las dos marcas → dejar Taller Común) y la nota sobre la columna de `base-neon`.
