# Design

## Context

- No hay `app/error.tsx` ni `app/global-error.tsx`. Con un error al dibujar, Next muestra su pantalla genérica en inglés.
- `app/layout.tsx` dibuja rail, barra, `<main>` con `<Puerta>{children}</Puerta>`, pie, `BotonReportar` y Hifa. Un `app/error.tsx` envuelve a `children` **dentro** del layout: el marco y el botón Reportar siguen en pie. `app/global-error.tsx` reemplaza al layout entero (tiene que traer su propio `<html>` y `<body>`).
- `components/boton-reportar.tsx` es autónomo: guarda el texto en su estado y arma el contexto al abrir. No hay forma de abrirlo desde afuera.
- En producción Next no manda al navegador el mensaje de un error del servidor: manda un `digest`, el mismo que queda en el log de Vercel junto al error completo.
- `idioma-base` (PR #90) pone los textos del marco en `lib/idioma/textos/marco.ts` (con `noEncontrada`) y el hook `useTextos("marco")` para componentes de cliente.

## Goals / Non-Goals

**Goals**
- Que una falla no deje a la persona sin salida ni sin forma de avisar.
- Que el equipo pueda encontrar el error en los logs con el código.
- No mandar nada sin que la persona lo decida.

**Non-Goals**
- Monitoreo automático (Sentry, Vercel Observability con alertas).
- Tocar la API de reportes.

## Decisions

### 1. Abrir Reportar desde afuera con un evento del navegador
`lib/errores/aviso.ts` exporta `pedirReporte({ tipo, quePaso })`, que dispara `window.dispatchEvent(new CustomEvent("lh:abrir-reporte", { detail }))`, y `textoDelAviso({ caso, ruta, codigo, idioma })` (pura) que arma el texto completado. `BotonReportar` escucha el evento: si "¿Qué pasó?" está vacío, pone el tipo y el texto; si no, conserva lo que había; después abre el diálogo con el mismo `abrir()` de siempre (mismo contexto, mismo modo con o sin cuenta).
- Alternativa descartada: un contexto de React compartido. El botón vive en el layout y la pantalla de error dentro de `children`; un evento no obliga a mover estado ni a cambiar el layout, y la pantalla de error tiene que andar aunque falle un proveedor.
- La ruta se toma con `sinQuery(window.location.pathname)` (de `lib/reportes/reporte.ts`): sin query ni fragmento, que pueden llevar códigos de login.

### 2. Qué se muestra del error
Solo `error.digest` ("Código del error: …") o "sin dato". Nunca `error.message` ni `error.stack`: en desarrollo traen detalles internos y en el navegador pueden incluir datos de la página. `console.error(error)` en un `useEffect`, para que quede en la consola de quien depura.

### 3. "Probar de nuevo"
Patrón de Next 15 para errores del servidor: `startTransition(() => { router.refresh(); reset(); })`. Solo `reset()` vuelve a dibujar en el cliente y no alcanza si el error vino del servidor.

### 4. Foco y anuncio
El título tiene `tabIndex={-1}` y recibe el foco al montarse (lo leen los lectores de pantalla y el siguiente Tab va a las acciones). Sin `role="alert"`: el cambio de foco ya lo anuncia y un alerta encima repetiría el texto.

### 5. `global-error.tsx`
Componente de cliente con su `<html lang>` y `<body>`, importa `./globals.css` para los tokens del tema, un único `<main>`, el aviso "Prototipo interno · datos de ejemplo" y los dos controles. No puede usar el proveedor de idioma (falló el marco): lee la cookie `lh-idioma` con `idiomaDeCookies(document.cookie)` de `lib/idioma/cookie.ts` (que no depende de React) y cae en español. Sin Reportar ni Hifa (no hay layout): el texto explica cómo avisar desde el inicio.

### 6. Ruta de prueba
`app/prueba-error/page.tsx` (servidor): si `process.env.VERCEL_ENV === "production"`, `notFound()`. Con `?donde=servidor` lanza un error al dibujar en el servidor; con `?donde=navegador` dibuja un componente de cliente que lanza al montarse. Sin nada en la portada ni en el rail que la enlace. Queda bajo las reglas de la puerta como cualquier ruta que no es pública (el e2e entra con la sesión de prueba).

### 7. Textos
En `lib/idioma/textos/marco.ts`, dentro de `noEncontrada` (amplía lo existente) y una clave nueva `error`, en español y en inglés, con voseo. Borradores de texto (español):
- Título: "Algo se rompió en esta página". Explicación: "No es tu culpa. Podés probar de nuevo, volver al inicio o avisarnos para que lo arreglemos."
- Global: "Algo se rompió" / "No pudimos mostrar la plataforma." / "Para avisarnos, andá al inicio y usá el botón Reportar con este código."
- Reporte: "Apareció la pantalla de error en {ruta}. Código del error: {codigo}." / "Llegué a una página que no existe: {ruta}."

## Risks / Trade-offs

- **El evento no llega si falla el propio botón**: entonces la falla es del marco y aparece `global-error`, que no ofrece Reportar. Aceptado.
- **Integración con `idioma-base` y `idioma-hifa-avisos`**: los dos tocan el marco y el botón de Reportar. Se implementa sobre `dev` con `idioma-base` integrado; si `idioma-hifa-avisos` cambió los textos de Reportar, el texto completado usa su catálogo.
- **La ruta de prueba en previews**: cualquiera con el enlace del preview puede ver una pantalla de error a propósito. No expone nada (no muestra el mensaje).

## Migration Plan

Sin datos ni migraciones. Se despliega con el PR; se vuelve atrás revirtiendo.

## Open Questions

- **Gus:** ¿sumamos más adelante un servicio de monitoreo (Sentry o la observabilidad de Vercel) para enterarnos de los errores sin esperar el reporte? Es una integración externa con costo y datos que salen a un tercero; iría con su propia spec y revisión del arquitecto.
