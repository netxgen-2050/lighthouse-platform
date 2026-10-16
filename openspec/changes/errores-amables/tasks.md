# Tasks

## 0. Antes de empezar

- [ ] 0.1 Confirmar que `idioma-base` está en `dev` (`lib/idioma/textos/marco.ts` existe). Si no, frenar y reportar. Verificar con `git log --oneline -- lib/idioma/textos/marco.ts`.

## 1. Lógica pura y textos

- [ ] 1.1 Crear `lib/errores/aviso.ts` con `textoDelAviso({ caso: "error" | "no-encontrada", ruta, codigo, idioma })` y `pedirReporte({ tipo, quePaso })` (design §1). Verificar con `lib/errores/aviso.test.ts`: ruta con query y fragmento sale sin ellos; código ausente → "sin dato" ("no data" en inglés); textos exactos de la spec en los dos idiomas; `pedirReporte` dispara un `CustomEvent` `lh:abrir-reporte` con el detalle (con un `window` simulado). `pnpm verificar` en verde.
- [ ] 1.2 Sumar en `lib/idioma/textos/marco.ts` la clave `error` y ampliar `noEncontrada` (design §7), en español y en inglés. Verificar con el test de diccionarios existente (`lib/idioma/diccionarios.test.ts`) y `pnpm verificar`.

## 2. Reportar se abre desde afuera

- [ ] 2.1 En `components/boton-reportar.tsx`, escuchar `lh:abrir-reporte`: con "¿Qué pasó?" vacío pone tipo y texto; si no, los conserva; después llama a `abrir()`. Quitar la escucha al desmontar. Verificar con el e2e de 4.1 (casos de texto completado y de texto conservado) y que `e2e/reportes.spec.ts` sigue verde.

## 3. Pantallas

- [ ] 3.1 Crear `app/error.tsx` (cliente): título con foco, explicación, "Código del error:", "Probar de nuevo" (design §3), "Ir al inicio" y "Avisar al equipo" (`pedirReporte`). Tokens del tema, sin colores sueltos. Verificar con el e2e de 4.1.
- [ ] 3.2 Crear `app/global-error.tsx` (design §5). Verificar con un test de Vitest que lo dibuja con `renderToStaticMarkup` y comprueba un solo `<main>`, el aviso de prototipo, el título, el código ("sin dato" sin `digest`) y los dos controles, y `lang="en"` con la cookie en inglés.
- [ ] 3.3 Cambiar `app/not-found.tsx`: "Ir al inicio", "Ver las tribus" y "Avisar al equipo" (componente de cliente chico para el botón). Verificar con el e2e de 4.1.
- [ ] 3.4 Crear `app/prueba-error/page.tsx` y su componente de cliente (design §6). Verificar con un test de Vitest que con `VERCEL_ENV=production` llama a `notFound()` y con el e2e de 4.1.

## 4. E2E

- [ ] 4.1 Crear `e2e/errores.spec.ts`: (a) con sesión, `/prueba-error?donde=servidor` muestra el título con foco, el rail, "Código del error:" con un valor y no el mensaje lanzado; (b) `/prueba-error?donde=navegador` muestra la pantalla con "sin dato" o un código; (c) "Avisar al equipo" abre Reportar con "Algo no funciona" y el texto sin `?donde=`; cerrar sin enviar no hace ningún pedido a `/api/reportes` (`page.route` que falla el test si se llama); (d) con texto ya escrito en Reportar, "Avisar al equipo" lo conserva; (e) "Ir al inicio" lleva a `/`; (f) sin sesión, `/no-existe` muestra los dos enlaces y "Avisar al equipo" abre el modo sin cuenta con "Llegué a una página que no existe: /no-existe."; (g) con la cookie `lh-idioma=en`, la pantalla de error y el texto completado están en inglés; (h) todo con teclado (Tab y Enter). Verificar con `pnpm test:e2e e2e/errores.spec.ts`.
- [ ] 4.2 En `e2e/accesibilidad.spec.ts`, sumar la pantalla de error de `/prueba-error?donde=servidor` y `/no-existe`. Verificar con `pnpm test:e2e e2e/accesibilidad.spec.ts`.

## 5. Cierre

- [ ] 5.1 `pnpm verificar`, `pnpm build` y `pnpm test:e2e` completos en verde; con preview, `BASE_URL=<url> pnpm test:e2e e2e/errores.spec.ts`.
