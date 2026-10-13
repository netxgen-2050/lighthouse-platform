## 1. Barra y menú

- [x] 1.1 `components/barra-superior.tsx` con NetX, campanita y menú del avatar (movido del rail) montada en `app/layout.tsx`; rail solo con navegación. e2e del marco. Verificar con `pnpm test:e2e`.

## 2. Configuración

- [x] 2.1 `lib/configuracion/` (preferencias, lectura, aplicación) con tests. Verificar con `pnpm test`.
- [x] 2.2 `app/configuracion/` con todas las secciones; paleta oscura y tamaño de texto en `app/globals.css`; filtro de notificaciones; ocultar Hifa; moneda en Sumarte y Pactos; mover "Borrar todo" (enlace desde Mi recorrido). e2e con los escenarios. Verificar con `pnpm test:e2e`.

## Integración

- [x] F.1 `pnpm verificar` y `pnpm build` en verde, auditoría de accesibilidad sin violaciones serias (sumar las rutas nuevas), solo tokens del tema y un único `<main>`, sin scroll horizontal a 390 px; PR con guion de prueba en computadora y celular.
