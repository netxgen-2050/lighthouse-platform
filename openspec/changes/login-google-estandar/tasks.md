# Tasks

Rama `agente/login-google-estandar` desde `dev`. Cambio chico: una sola noche, un solo PR. Antes de empezar, leer `proposal.md`, `design.md` y la spec, y **abrir las pautas de marca de Google** (developers.google.com/identity/branding-guidelines) para confirmar colores, tamaños, tipografía, texto y logo. Si algo no coincide con design §2, mandan las pautas y se anota en el PR con la fecha en que se leyeron.

## 1. Botón

- [x] 1.1 Tokens `--color-google-fondo`, `--color-google-borde` y `--color-google-texto` en `app/globals.css`, en `:root` y en `:root[data-tema="oscuro"]` (design §2). Medir el contraste del borde contra el fondo de la página en los dos temas (3:1, design §3) y anotarlo. **Verifica:** `pnpm verificar`.
- [x] 1.2 Roboto 500 con `next/font/google` en `app/layout.tsx` (variable `--font-roboto`, solo latín, `display: "swap"`), usada solo por el botón. Si rompe el build, usar la pila del sistema y anotarlo. **Verifica:** `pnpm build`.
- [x] 1.3 `components/sesion/boton-google.tsx`: logo SVG oficial en línea (`aria-hidden`, `focusable="false"`), texto "Continuar con Google", medidas de design §2, `aria-disabled` con `ocupado`, foco visible del tema. Test con Testing Library: nombre accesible exacto, el SVG no tiene nombre accesible, con `ocupado` el clic no llama al manejador. **Verifica:** `pnpm test components/sesion`.

## 2. Formulario

- [x] 2.1 `components/sesion/formulario-login.tsx`: en el paso del email, `BotonGoogle` primero y **fuera** del `<form>` del código, después el separador "o" (texto real, líneas con bordes), después el form del email. Sacar "O entrá con tu cuenta de Google." y el botón viejo. `conGoogle()` no cambia. El foco inicial sigue en el email. Tests: orden de los controles, el botón no está dentro del form "Entrar con un código por email", Enter en el email pide el código y no llama a `signIn.social`, el clic llama a `signIn.social` con `provider: "google"` y la `callbackURL` de la página. **Verifica:** `pnpm test components/sesion`.

## 3. Pruebas y guion

- [x] 3.1 `e2e/login-neon-auth.spec.ts`: buscar "Continuar con Google" en lugar de "Entrar con Google"; agregar el orden (Google antes que el email), Shift+Tab desde el email llega a Google, y axe del diálogo abierto en tema claro y oscuro. **Verifica:** `pnpm test:e2e e2e/login-neon-auth.spec.ts`.
- [x] 3.2 `docs/guiones/login-neon-auth.md`, paso 7.7: "Repetí con «Continuar con Google»". **Verifica:** el texto viejo no aparece con `grep -rn "Entrar con Google" docs e2e components`.
- [ ] 3.3 `pnpm verificar`, `pnpm build` y `pnpm test:e2e` en verde. PR a `dev` con `scripts/pr.sh`, con una captura del diálogo en los dos temas y la fecha en que se leyeron las pautas de Google. **Verifica:** los tres comandos en verde y el PR creado.
