## 1. Hifa

- [x] 1.1 `lib/hifa/` (guion con varias frases por tipo, estado de la conversación, armado del reporte) con tests. Verificar con `pnpm test`.
- [x] 1.2 Avatar SVG, botón y ventana de chat montados en `app/layout.tsx`; mover el botón Reportar a media altura del borde derecho. e2e (interceptando `/api/reportes` con `page.route`). Verificar con `pnpm test:e2e` a 1280 px y 390 px.

## Integración

- [x] F.1 `pnpm verificar` y `pnpm build` en verde, auditoría de accesibilidad sin violaciones serias (sumar las rutas nuevas a `e2e/accesibilidad.spec.ts`), solo tokens del tema y un único `<main>`; PR con guion de prueba.
