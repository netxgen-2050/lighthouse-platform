## 1. Datos y catálogo

- [x] 1.1 Crear `lib/pasaporte/datos.ts` (tipo `DatosPersona`: nacionalidad, residencia fiscal, origen de fondos, tipo de inversor, modalidad y horas por mes; todos opcionales hasta que la persona los complete) y su estado en el navegador. Copiar al catálogo `lib/legal/terminos.ts` las claves ⚖ que pide la spec, textuales del objeto `LEGAL` del mock-up v6, y actualizar su test. Verificar con `pnpm test`.

## 2. Caminos

- [x] 2.1 Crear `lib/pasaporte/caminos.ts` con `caminos(datos, emision)` (función pura) que devuelve los 5 caminos con su estado en texto, o "Completá tus datos" cuando falta lo necesario. Tests de Vitest con los casos de la spec (residente argentino en obra, residente en el exterior y remoto, sin datos). Verificar con `pnpm test`.

## 3. Pantalla

- [x] 3.1 Crear `app/pasaporte/page.tsx` y un componente cliente con el formulario "Tus datos" y "Tus caminos", recalculando en vivo, solo tokens del tema y sin `<main>` propio. Agregar "Pasaporte" a `lib/navegacion.ts`. Verificar en `pnpm dev`.

## 4. Tests

- [x] 4.1 Escribir `e2e/pasaporte.spec.ts` con todos los escenarios de la spec (sin datos, recargar, los dos perfiles cargados con el formulario, cambio en vivo, ⚖ de tierra ribereña con teclado, navegación). Verificar con `pnpm test:e2e`.
- [x] 4.2 Sumar `/pasaporte` (vacío y con datos cargados) a `e2e/accesibilidad.spec.ts`. Verificar sin violaciones serias ni críticas.

## 5. Integración

- [x] 5.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba.
