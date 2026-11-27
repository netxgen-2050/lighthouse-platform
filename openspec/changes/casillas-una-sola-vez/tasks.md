# Tasks

Pedido de Gus del 27-nov-2026: las casillas de la política se marcan solo la primera vez. Una noche. Rama `agente/casillas-una-sola-vez` desde `spec/casillas-una-sola-vez` (sobre `dev` con el #241). Corre al mismo tiempo que el carril 14 (`sumarte-planes-v2`): no tocar `app/sumarte/*` ni `lib/sumarte/*` (design §6).

## 1. Flujo

- [x] 1.1 `components/sesion/proveedor-sesion.tsx`: "Entrar" y "Entrar como…" abren el login directo (design §1). El camino `alta` no cambia. **Verifica:** `pnpm test components/sesion lib/privacidad` en verde, con los dos tests nuevos de design §5.
- [x] 1.2 `components/sesion/paso-alta.tsx`: texto encima del formulario según el modo, y sacar el "cada vez que entrás" (design §3). Comentario de `PantallaConsentimiento` al día (design §2). **Verifica:** `pnpm test components/sesion` en verde.

## 2. Textos y ADR

- [x] 2.1 `lib/privacidad/politica.ts`: `BASE_LEGAL` y el cambio sumado a `2026-11-25-borrador`, sin subir la versión (design §3). Textos en inglés si existen. **Verifica:** `pnpm test lib/privacidad` en verde; `git grep -n "cada vez que entrás" -- app components lib` solo encuentra el texto histórico de `2026-11-23-borrador`.
- [x] 2.2 `docs/decisiones/ADR-005-consentimiento-antes-de-la-identidad.md`: la sección del 27-nov (design §4).

## 3. E2E

- [ ] 3.1 `e2e/ayudas.ts`: `aceptarPantalla` (design §5).
- [ ] 3.2 Adaptar los e2e que entraban por "Entrar" o "Entrar como…" (`consentimiento-alta`, `login`, `login-neon-auth`, `descubrir-publico`, `privacidad` y, solo en lo de "Entrar", `sumarte-acceso`), con los escenarios de la spec. **Verifica:** esos archivos en verde, en los proyectos `chromium` y `neon-auth`.
- [ ] 3.3 Axe del diálogo "Entrar" con el formulario, en los dos temas. **Verifica:** `e2e/accesibilidad.spec.ts` en verde.

## 4. Cierre

- [ ] 4.1 **Verifica:** `pnpm verificar`, `pnpm build` y `pnpm test:e2e` completos en verde; `pnpm exec openspec validate casillas-una-sola-vez --strict` pasa.
