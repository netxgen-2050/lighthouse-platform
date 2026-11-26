# Tasks

Cuarto cambio `ux-*`. Va sobre la rama de `ux-explorar`.

## 1. Inicio

- [ ] 1.1 Héroe a sangre con degradado y sin caja (design §2), con test de contraste del texto sobre el degradado. **Verifica:** `pnpm test app/page lib/tema-contraste`.
- [ ] 1.2 Franjas de pilares, cifras y capitales (design §3), con dibujos SVG `aria-hidden`. **Verifica:** `pnpm test components/inicio`; los números siguen saliendo de su fuente (`lib/lotes/sin-numeros-escritos.test.ts` en verde).
- [ ] 1.3 Tres caminos por público, textos es/en (design §4). **Verifica:** `pnpm test:e2e e2e/portada.spec.ts e2e/idioma-portada-sumarte.spec.ts`.

## 2. Cierre

- [ ] 2.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate ux-inicio --strict` pasa; suite e2e completa en verde; axe sin violaciones. Capturas de `/` a 390 y 1440 px en claro y oscuro en el PR.
