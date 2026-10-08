## 1. Ajustes

- [ ] 1.1 Ícono de bug en el botón Reportar. Verificar con su e2e.
- [ ] 1.2 Inicio: héroe y tarjeta "Descubrir" según la spec; actualizar `e2e/portada.spec.ts`. Verificar con `pnpm test:e2e`.
- [ ] 1.3 Datos de tribus 3/5/4 según la spec y todos los tests que cuentan estados (unitarios y e2e). Verificar con `pnpm test` y `pnpm test:e2e`.
- [ ] 1.4 Mapa: paletas por grupo y leyenda agrupada (solo tokens del tema; agregar tokens nuevos en `app/globals.css` si hacen falta). Verificar en `pnpm dev`.
- [ ] 1.5 Quitar personas de ejemplo de Fogón, Pactos y Semillas y sus tests. Verificar con `grep -rn "Lucía\|Lucas" app components lib` (solo puede quedar en tests que verifiquen que no aparecen).

## Integración

- [ ] F.1 `pnpm verificar` y `pnpm build` en verde, auditoría de accesibilidad sin violaciones serias, solo tokens del tema y un único `<main>`; PR con guion de prueba.
