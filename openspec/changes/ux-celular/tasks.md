# Tasks

Segundo cambio `ux-*`. Va sobre la rama de `ux-base`.

## 1. Hoja

- [x] 1.1 `components/ui/hoja.tsx` con foco atrapado, Escape, arrastrar para cerrar y variante `persistente` (design §3), con tests. **Verifica:** `pnpm test components/ui`.

## 2. Barra inferior y Más

- [x] 2.1 Campo `barra` en `lib/navegacion.ts` y función `destinosDeLaBarra()` / `destinosDeMas()`, con tests. **Verifica:** `pnpm test lib/navegacion`.
- [x] 2.2 `components/barra-inferior.tsx` y hoja Más (design §1 y §2); se borra `components/menu-celular.tsx` y su test se reemplaza. **Verifica:** `pnpm test components/barra-inferior`.

## 3. Barra superior, idioma y flotantes

- [x] 3.1 Barra superior del celular con marca y Sumarte/avatar; selector de idioma al menú del avatar, a Más y a Configuración (design §4). **Verifica:** `pnpm test:e2e e2e/idioma.spec.ts e2e/marco.spec.ts`.
- [x] 3.2 "Reportar" en la barra superior (compu) y en Más (celular); se borra el disparador flotante; HIFA sobre la barra inferior (design §5). **Verifica:** `pnpm test:e2e e2e/reportes.spec.ts e2e/hifa.spec.ts`; e2e nuevo: a 390 px ningún botón flotante se superpone con el primer párrafo de `/`.

## 4. Cierre

- [ ] 4.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate ux-celular --strict` pasa; suite e2e completa en verde; axe sin violaciones con la hoja abierta. Capturas de `/` y `/explorar` a 390 px en claro y oscuro en el PR.
