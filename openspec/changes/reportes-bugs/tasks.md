## 1. Lógica

- [x] 1.1 Crear `lib/reportes/` con el tipo de reporte, la validación (tipos, obligatorios, largos, campo trampa), el armado del contexto y el armado del título, cuerpo y etiquetas del issue. Tests de Vitest. Verificar con `pnpm test`.

## 2. Servidor

- [x] 2.1 Crear `app/api/reportes/route.ts` (POST) según el design: valida, responde 503 `{ configurado: false }` sin `REPORTES_GITHUB_TOKEN`, crea el issue con `fetch` y devuelve el número. Test unitario con `fetch` simulado (cuerpo enviado, etiquetas, token ausente en la respuesta). Verificar con `pnpm test`.

## 3. Interfaz

- [x] 3.1 Crear `components/boton-reportar.tsx` (botón fijo abajo a la derecha y diálogo modal accesible con el formulario, el contexto visible, los estados de envío, éxito y error con "Copiar el reporte") y montarlo en `app/layout.tsx`, reservando espacio abajo para no tapar contenido. Solo tokens del tema. Verificar en `pnpm dev` a 1280 px y 390 px.
- [x] 3.2 Escribir `e2e/reportes.spec.ts` con todos los escenarios, interceptando `/api/reportes` con `page.route` (éxito #42 y 503). Sumar el diálogo abierto a la auditoría de accesibilidad. Verificar con `pnpm test:e2e`.

## 4. Integración

- [x] 4.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba y con los pasos para que Gus cargue `REPORTES_GITHUB_TOKEN` en Vercel.
