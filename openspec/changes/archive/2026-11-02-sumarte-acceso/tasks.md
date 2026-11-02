## 1. Niveles

- [x] 1.1 Niveles en `lib/permisos/` (qué habilita cada uno), nivel por persona en `lib/sesion/` (navegador con prefijo de la persona; interfaz lista para `base-neon`), acceso abierto con `LH_PERSONAS` como ajustes y `LH_ACCESO=lista`. Tests. Verificar con `pnpm test`.

## 2. Sumarte y navegación

- [x] 2.1 `/sumarte` pública; elegir un plan sin sesión abre Privy (o "Entrar como…" en modo de prueba) y aplica el nivel; Plan Tribu con la elección de tribu; cambiar de nivel. Verificar en `pnpm dev`.
- [x] 2.2 Rail con destinos deshabilitados y ayuda, barra superior sin sesión con Sumarte y Entrar, redirección a Sumarte con aviso y vuelta, "Sumate para…", Hifa y Reportar desde Explorador; quitar la pantalla de entrada repetida. Verificar en `pnpm dev`.

## 3. Tests

- [x] 3.1 e2e de todos los escenarios; el fixture de login elige un nivel (por defecto Miembro para que los e2e existentes sigan pasando); auditoría de accesibilidad del rail con destinos deshabilitados. Verificar con `pnpm test:e2e`.

## 4. Integración

- [x] 4.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba para cada nivel y con la nota para Gus: `LH_PERSONAS` ya no es lista de acceso.
