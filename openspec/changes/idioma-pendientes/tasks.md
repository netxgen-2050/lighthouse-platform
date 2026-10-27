# Tasks

## 0. Antes de empezar

- [ ] 0.1 Confirmar que `idioma-fogon-mercado` ya está implementado antes del grupo 1 y que `idioma-pasaporte-semillas-pactos` ya está implementado antes del grupo 2 (reutilizan sus diccionarios). Si no, frenar y reportar. Verificación: los diccionarios `lib/idioma/textos/fogon*.ts` y de pactos existen en la rama base.
- [ ] 0.2 Si el rediseño holocrático del Fogón ya cambió `/fogon/consultas`, traducir la versión vigente y anotarlo en el reporte. Verificación: nota en el PR.

## 1. Consultas del Fogón

- [ ] 1.1 Pasar los textos de `app/fogon/consultas/lista-consultas.tsx`, `app/fogon/consultas/[id]/consulta-cliente.tsx` y `resultado-grupo.tsx` al diccionario, con español e inglés. Verificación: `pnpm verificar` (los tipos exigen el inglés).
- [ ] 1.2 `components/fogon/error-lectura.tsx` y `components/donut.tsx` (nombre accesible y leyenda) por idioma. Verificación: tests existentes actualizados en verde.
- [ ] 1.3 Consultas de ejemplo (`lib/fogon/consultas/ejemplo.ts`) a `Bilingue` con `original: "es"`. Verificación: escenario "Consulta de ejemplo".
- [ ] 1.4 Sumar `/fogon/consultas` y `/fogon/consultas/[id]` a `RUTAS_TRADUCIDAS` y a la lista de revisión nativa como `pendiente`. Verificación: `lib/idioma/rutas.test.ts`.
- [ ] 1.5 e2e en inglés de lista y resultado, con axe en inglés. Verificación: `pnpm test:e2e` en verde.

## 2. Cambios a un pacto

- [ ] 2.1 Pasar los textos de retiro, cambio, versión, historial y avisos (`app/pactos/pactos-cliente.tsx`, `lib/pactos/*`) al diccionario de pactos. Verificación: `pnpm verificar`.
- [ ] 2.2 Los eventos `cambioDePactoAceptado` y `cambioDePactoRechazado` se guardan con tipo y datos y se arman en el idioma actual. Verificación: test unitario de los eventos en los dos idiomas.
- [ ] 2.3 e2e "Cambio rechazado" e "Historial" en inglés. Verificación: `pnpm test:e2e`.

## 3. Regla para lo que venga

- [ ] 3.1 Extender `lib/idioma/rutas.test.ts` para que falle si una ruta de `lib/navegacion.ts` o de las rutas públicas no está traducida ni declarada interna (adelanta el test de cobertura de `idioma-hifa-avisos`; si ese cambio ya lo trajo, solo verificar que incluya las consultas). Verificación: el test falla si se quita una ruta de la lista.
- [ ] 3.2 Sumar la regla "toda pantalla nueva nace bilingüe" a `docs/agentes.md` (sección del especificador y del revisor). Verificación: el texto está en el documento.

## 4. Cierre

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde.
