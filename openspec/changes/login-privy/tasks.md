## 1. Sesión en el servidor

- [ ] 1.1 Instalar `@privy-io/react-auth` y `@privy-io/server-auth`. `lib/sesion/personas.ts` (parser de `LH_PERSONAS`) y `app/api/sesion/route.ts` (verificación, 401/403, modo de prueba solo fuera de producción), con tests (simular el cliente de Privy). Verificar con `pnpm test`.

## 2. Cliente

- [ ] 2.1 Proveedor de Privy, hook de sesión, puerta de entrada, "Entrar" y "Salir" en la barra superior. Verificar en `pnpm dev` con el modo de prueba.
- [ ] 2.2 Prefijo por persona en todas las claves del navegador e importación única de los datos previos, con tests. Verificar con `pnpm test`.
- [ ] 2.3 Roles en la interfaz (NetX solo super admin, marca de admin en Valle Solar, panel "Personas y roles" en `/netx`), perfil precargado e iniciales, sello "Billetera creada". Verificar en `pnpm dev`.

## 3. Tests

- [ ] 3.1 e2e: entrar con el modo de prueba como cada rol, email fuera de la lista, salir, cambiar de cuenta (datos separados), NetX visible solo al super admin; adaptar todos los e2e existentes para que entren con el modo de prueba antes de navegar (un `beforeEach` o un fixture). Verificar con `pnpm test:e2e`.

## 4. Integración

- [ ] 4.1 `pnpm verificar` y `pnpm build` en verde; auditoría de accesibilidad incluida la pantalla de entrada; PR con guion de prueba y con los pasos para Gus: cargar `LH_PERSONAS` y `LH_AUTH_PRUEBA` en Vercel, revisar los dominios en Privy y, después del merge, sacar la protección de Vercel de producción.
