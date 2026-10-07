## 1. Componente

- [x] 1.1 Rehacer `components/termino-legal.tsx` como tooltip flotante (posición absoluta respecto del ⚖, por encima del contenido, sin librerías nuevas), con mouse (entrar/salir, incluido pasar al tooltip), foco/blur, Escape y toque en dispositivos sin hover (`matchMedia("(hover: none)")`). Usar solo tokens del tema. Verificar en `pnpm dev` en `/tribus/valle`.

## 2. Tests

- [x] 2.1 Reemplazar en los e2e los pasos de "clic para abrir" por los escenarios de la spec: hover y salida, pasar al tooltip, Tab + Escape, y un proyecto o test con `hasTouch: true` / `isMobile: true` para el toque. Agregar el escenario "Dos ⚖ cercanos" (que no se desplace el contenido y que el segundo ⚖ siga visible). Verificar con `pnpm test:e2e`, incluida la auditoría de accesibilidad.

## 3. Integración

- [x] 3.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba para mouse, teclado y celular.
