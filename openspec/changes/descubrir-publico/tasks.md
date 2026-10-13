## 1. Rutas y puerta

- [ ] 1.1 `lib/sesion/rutas-publicas.ts` (lista y función `esPublica(ruta)`, con tests) y la puerta que deja pasar las rutas públicas sin sesión. Verificar con `pnpm test`.

## 2. Interfaz sin sesión

- [ ] 2.1 Llamados "Entrá para …" en las acciones con cuenta de Tribus, Manifiesto y la ficha del Territorio; rail con candados; barra superior solo con Entrar; Reportar solo con sesión; Hifa sin envío al equipo sin sesión. Verificar en `pnpm dev` sin sesión y con sesión.

## 3. Tests

- [ ] 3.1 e2e sin sesión para cada escenario (sin el fixture de login) y auditoría de accesibilidad de las páginas públicas sin sesión. Los e2e existentes con sesión siguen pasando. Verificar con `pnpm test:e2e`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba sin sesión y con sesión.
