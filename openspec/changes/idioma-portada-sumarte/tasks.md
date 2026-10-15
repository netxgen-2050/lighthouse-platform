# Tasks

Requisito previo: `idioma-base` mergeado. Rama `agente/idioma-portada-sumarte`. El cómo (diccionarios, `Bilingue`, `TextoBilingue`, formatos, glosario, `translate="no"`) está en `openspec/changes/idioma-base/design.md` (o en `openspec/specs/idioma-plataforma/` si ya se archivó). Español idéntico al de hoy. Cada diccionario y archivo de datos con inglés se anota como `pendiente` en `lib/idioma/revision-nativa.ts` y se regenera la lista con `pnpm idioma:pendientes` (`idioma-base` design §12). Si Sumarte nombra las Semillas, en inglés dice "Semillas" (primera mención "Semillas (seeds)").

## 1. Portada

- [ ] 1.1 Crear `lib/idioma/textos/portada.ts` y pasar `app/page.tsx` y `lib/portada.ts` (`caminosDePortada(idioma)`, `descripcionBarrios(cantidad, idioma)`) a leerlo. Tests: `descripcionBarrios` en inglés con 0, 1 y 12. Verificar con `pnpm test` y `pnpm test:e2e e2e/portada.spec.ts` (español en verde).

## 2. Sumarte

- [ ] 2.1 Crear `lib/idioma/textos/sumarte.ts` (nombres de planes y niveles desde el glosario) y pasar `app/sumarte/page.tsx` y `sumarte-cliente.tsx` a leerlo, con `formatearMonto(…, idioma)`. Verificar con `pnpm verificar` y `pnpm test:e2e e2e/sumarte.spec.ts e2e/sumarte-acceso.spec.ts`.
- [ ] 2.2 `FILAS` de `lib/sumarte/datos.ts` como `Bilingue` (con `TextoBilingue` en la tabla) y `avisoDeNivel`/`avisoDeRuta` de `lib/permisos/niveles.ts` con idioma, con sus tests en inglés. Verificar con `pnpm test`.
- [ ] 2.3 `TEXTO_ESTADO` de `lib/tribus/tipos.ts` por idioma; `components/medidor.tsx`, `components/pedido-contacto.tsx`, `components/sesion/entrar-como.tsx` y `entrar-para.tsx` con diccionario (usando `comunes`). Envolver el diálogo de KYC y el paso "Crear tu cuenta" en `lang="es"` cuando el idioma es inglés y todavía no tienen traducción. Verificar con `pnpm test:e2e e2e/contactos.spec.ts` (español en verde).

## 3. Pruebas

- [ ] 3.1 Sumar `/` y `/sumarte` a `RUTAS_TRADUCIDAS` y crear `e2e/idioma-portada-sumarte.spec.ts`: caminos en inglés; `/?lang=en&utm_source=deck` guarda el origen; planes y "USD 1,500"; aviso de nivel desde `/pactos`; elegir "Member" con cuenta → "Your plan (simulated)"; ⚖ con "Only available in Spanish"; ARS con su nota en inglés. Verificar con `pnpm test:e2e e2e/idioma-portada-sumarte.spec.ts e2e/idioma.spec.ts`.
- [ ] 3.2 Sumar `/` y `/sumarte` en inglés a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm verificar`, `pnpm build` y `pnpm test:e2e`.
