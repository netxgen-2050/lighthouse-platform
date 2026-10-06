## 1. Tokens y tipografías

- [ ] 1.1 Pasar la paleta de `:root` del mock-up v6 (`docs/referencia/netx-tribus-mockup-v6.html`, líneas 12–14) a `@theme` en `app/globals.css` y cargar Anek Latin, Figtree y JetBrains Mono con `next/font/google` en `app/layout.tsx`. Verificar con `pnpm build`.

## 2. Marco

- [ ] 2.1 Crear `components/encabezado.tsx` (marca, nav "Principal", `aria-current`), `components/pie.tsx` y el enlace "Saltar al contenido" en `app/layout.tsx`, con `<main id="contenido">`. Verificar en `pnpm dev`.
- [ ] 2.2 Rehacer `app/page.tsx` según la spec y reemplazar colores sueltos en `app/tribus/**` y `components/termino-legal.tsx` por los tokens. Verificar con `grep -rnE "#[0-9a-fA-F]{3,6}|emerald-|stone-|amber-" app components` (solo puede aparecer `app/globals.css`).
- [ ] 2.3 Escribir `e2e/marco.spec.ts` con los escenarios (navegación, `aria-current`, saltar al contenido, pie, portada). Correr también los e2e existentes. Verificar con `pnpm test:e2e`.

## 3. Integración

- [ ] 3.1 `pnpm verificar` y `pnpm build` en verde; PR con capturas descritas en el guion de prueba (qué mirar en el preview).
