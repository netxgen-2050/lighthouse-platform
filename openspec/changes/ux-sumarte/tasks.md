# Tasks

Octavo cambio `ux-*`. Va sobre la rama de `ux-bien-comun` (mismo carril).

## 1. Sumarte

- [ ] 1.1 Tres caminos arriba y tarjetas de destino al final (design §1). **Verifica:** `pnpm test:e2e e2e/idioma-portada-sumarte.spec.ts`.
- [ ] 1.2 Selector de planes con `radiogroup`, plan en la URL y lógica de cada plan intacta (design §2). **Verifica:** `pnpm test:e2e e2e/sumarte*.spec.ts e2e/membresia.spec.ts`; flechas del teclado cambian de plan.
- [ ] 1.3 Comparación: tabla con encabezado fijo en compu y lista por plan en el celular (design §3). **Verifica:** a 390 px la página no tiene scroll horizontal y no hay encabezados cortados.
- [ ] 1.4 Panel "Entrar como…" en un `details` "Modo de prueba" al final (design §4), sin tocar `components/sesion/`. **Verifica:** `pnpm test:e2e e2e/login.spec.ts` y los e2e que entran con "Entrar como…"; `git diff --stat` no muestra archivos de `components/sesion/`.

## 2. Cierre

- [ ] 2.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate ux-sumarte --strict` pasa; suite e2e completa en verde; axe sin violaciones. En el PR: alto de la página a 390 px antes y después, y capturas en claro y oscuro.
