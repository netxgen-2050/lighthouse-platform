# Tasks

Séptimo cambio `ux-*`. Va sobre la rama de `ux-celular`.

## 1. Bien común

- [ ] 1.1 `components/ui/indice-pagina.tsx` con sección visible y `aria-current="location"` (design §2), con tests. **Verifica:** `pnpm test components/ui`.
- [ ] 1.2 Disposición con índice fijo en compu y hoja "En esta página" en el celular (design §1). **Verifica:** e2e en `e2e/bien-comun.spec.ts`: a 1440 px el índice sigue visible al hacer scroll; a 390 px "En esta página" abre la hoja y un enlace lleva a su sección.
- [ ] 1.3 Secciones abiertas y plegadas con resumen, cajas de una sola capa y un solo aviso (design §3 y §4); textos de resumen es/en. **Verifica:** `pnpm test:e2e e2e/bien-comun.spec.ts`; `lib/lotes/sin-numeros-escritos.test.ts` en verde.
- [ ] 1.4 Tablas de decisiones y Ostrom en dos líneas debajo de 640 px (design §5). **Verifica:** a 390 px la página no tiene scroll horizontal.

## 2. Cierre

- [ ] 2.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate ux-bien-comun --strict` pasa; suite e2e completa en verde; axe sin violaciones. En el PR: alto de la página a 390 px antes y después, y capturas en claro y oscuro.
