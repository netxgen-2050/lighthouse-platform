## 1. Lógica

- [ ] 1.1 `lib/privacidad/` (versión de la política, `registrarConsentimiento`, lectura, exportación de los datos de la persona) y `borrador: true` en el catálogo legal, con tests. Verificar con `pnpm test`.

## 2. Pantallas

- [ ] 2.1 Pantalla de consentimiento dentro de la puerta de sesión; consentimiento específico al iniciar el KYC. Verificar en `pnpm dev`.
- [ ] 2.2 `/privacidad` (pública) y `/mis-datos` (descargar, retirar, pedir borrado); enlaces en el pie, Configuración y el menú del avatar. Verificar en `pnpm dev`.

## 3. Tests

- [ ] 3.1 e2e con todos los escenarios; el fixture de login acepta el consentimiento para los e2e existentes; `/privacidad` y `/mis-datos` en la auditoría de accesibilidad. Verificar con `pnpm test:e2e`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; PR con guion de prueba y la lista de textos borrador para Gabriel.
