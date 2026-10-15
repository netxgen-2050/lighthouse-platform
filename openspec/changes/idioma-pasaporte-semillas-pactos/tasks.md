# Tasks

Requisito previo: `idioma-base` mergeado. Rama `agente/idioma-pasaporte-semillas-pactos`. El cómo está en el design de `idioma-base` (§3, §7, §8 y §10). Español idéntico al de hoy. Si para traducir hay que tocar la lógica del KYC (qué se pide o dónde se guarda), frenar y reportar.

## 1. Pasaporte y verificación de identidad

- [ ] 1.1 Crear `lib/idioma/textos/pasaporte.ts`; pasar a `Bilingue` los textos de `lib/pasaporte/sellos.ts` y `datos.ts`, y pasar `app/pasaporte/**` a leerlos ("Genesis" con `translate="no"`). Test: cada sello con `es` y `en`. Verificar con `pnpm test` y `pnpm test:e2e e2e/pasaporte.spec.ts`.
- [ ] 1.2 `components/kyc-dialogo.tsx` y los mensajes de `lib/pasaporte/kyc.ts` con idioma (sacar el envoltorio `lang="es"` que dejó `idioma-portada-sumarte`). Test de `kyc.test.ts` con los mensajes en inglés. Verificar con `pnpm test`.

## 2. Semillas y Pactos

- [ ] 2.1 Crear `lib/idioma/textos/semillas.ts` ("Semillas" y "Semillas (seeds)" tomados del glosario, con `translate="no"`); pasar `app/semillas/**` y `lib/semillas/datos.ts` (textos de ejemplo como `Bilingue`); sumar `en` borrador a `TERMINOS_ECONOMICOS.semillas` (título "Semillas") y que `components/termino-economico.tsx` lo muestre con "Draft: text under review". Anotar los diccionarios y datos nuevos de la zona como `pendiente` en `lib/idioma/revision-nativa.ts` y regenerar con `pnpm idioma:pendientes`. Verificar con `pnpm test:e2e e2e/semillas.spec.ts`.
- [ ] 2.2 Crear `lib/idioma/textos/pactos.ts`; pasar `app/pactos/**` y `lib/pactos/datos.ts`, con montos y tipo de cambio según idioma; lo que escribe la persona con `lang` del idioma en que se escribió (por ahora siempre `"es"` si la interfaz está en inglés y el texto no tiene idioma guardado). Verificar con `pnpm test:e2e e2e/pactos.spec.ts`.

## 3. Pruebas

- [ ] 3.1 Sumar `/pasaporte`, `/semillas` y `/pactos` a `RUTAS_TRADUCIDAS` y crear `e2e/idioma-pasaporte-semillas-pactos.spec.ts` con los escenarios de la spec (incluido el error del KYC abierto desde Sumarte en inglés). Verificar con `pnpm test:e2e e2e/idioma-pasaporte-semillas-pactos.spec.ts e2e/idioma.spec.ts`.
- [ ] 3.2 Sumar las tres páginas en inglés y el diálogo de KYC abierto a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm verificar`, `pnpm build` y `pnpm test:e2e`.
