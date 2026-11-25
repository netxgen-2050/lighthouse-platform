## 1. Tipos y tabla

- [x] 1.1 Crear `lib/permisos/tipos.ts` (Persona, Puerta, Motivo, Grado, Resultado) y `lib/permisos/tabla.ts` con la tabla de la nota 18 §3 transcrita como datos, con un comentario que cite "NS_platform/Documentation/18 - Integración plataforma y tokenomics.md §3". Verificar con `pnpm typecheck`.

## 2. Cálculo

- [x] 2.1 Crear `lib/permisos/calcular.ts` con `calcularPermisos(persona)` y `puede(persona, puerta, tribuId?)`, sin efectos secundarios. Verificar con `lib/permisos/calcular.test.ts`: un test por cada escenario de la spec.
- [x] 2.2 Agregar `lib/permisos/tabla.test.ts` que recorra **todas las celdas** de la tabla (6 columnas de la nota 18 × 9 puertas, más los 3 pases por separado) con una persona que tiene solo esa fuente, y compare con lo esperado escrito a mano en el test. Verificar con `pnpm test`.

## 3. Documentación

- [x] 3.1 Crear `lib/permisos/README.md` con la tabla en Markdown, cómo se usa y lo que está "a decidir". Verificar que coincide con `tabla.ts` (lo revisa el revisor).

## 4. Integración

- [x] 4.1 `pnpm verificar` y `pnpm build` en verde; PR con el guion de prueba (cómo correr los tests y leer la tabla).
