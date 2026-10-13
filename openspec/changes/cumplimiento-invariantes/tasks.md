## 1. Tests

- [ ] 1.1 Crear `lib/cumplimiento/invariantes.test.ts` con un `describe` por regla (C3, C18, C10, C20, C21). Para C3, importar cada módulo con `import * as` y revisar `Object.keys` (si un módulo no se puede importar en Vitest, por ejemplo un hook de cliente, leer sus nombres exportados del código fuente con `fs` y una expresión regular sobre `export`). Para C20, recorrer `PUERTAS` con una persona base (plan miembro, sin tribus, sin presencia, no residente) y los tres niveles de pase. Cada `expect` lleva un mensaje con la regla y una línea en palabras simples. Verificar con `pnpm test lib/cumplimiento`.
- [ ] 1.2 Comprobar que los tests muerden: agregar temporalmente `export function transferirSemillas() {}` en `lib/semillas/calculo.ts` y una fila "Prioridad para elegir lote" en `FILAS`, correr `pnpm test lib/cumplimiento` (tiene que fallar con C3 y C18) y deshacer los dos cambios con `git checkout -- lib/semillas/calculo.ts lib/sumarte/datos.ts`. Anotar el resultado en el PR. Si algún test falla con el código actual, frenar y reportar sin tocar la app.

## 2. Trazabilidad

- [ ] 2.1 Crear `docs/cumplimiento.md` con la tabla C1–C23 (regla en una línea, cómo se verifica, ruta del test o "revisión manual" o "relajada en el prototipo (R14)"). C1 apunta a `e2e/estado-administrativo.spec.ts`. Verificar que cada ruta citada existe con `ls` de cada una.

## 3. Integración

- [ ] 3.1 `pnpm verificar` y `pnpm build` en verde; PR desde `agente/cumplimiento-invariantes` con la tabla de trazabilidad en la descripción y el resultado de la prueba 1.2.
