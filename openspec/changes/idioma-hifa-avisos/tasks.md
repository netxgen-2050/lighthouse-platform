# Tasks

Requisito previo: `idioma-base` y las demás zonas (`idioma-portada-sumarte`, `idioma-tribus-territorio`, `idioma-pasaporte-semillas-pactos`, `idioma-fogon-mercado`, `idioma-perfil-recorrido`, `idioma-legal`) mergeadas; si falta alguna, hacer los grupos 1 a 3 y dejar el 4.1 para cuando estén. Rama `agente/idioma-hifa-avisos`. Español idéntico al de hoy. Cada diccionario y archivo de datos con inglés se anota como `pendiente` en `lib/idioma/revision-nativa.ts` y se regenera la lista con `pnpm idioma:pendientes` (`idioma-base` design §12). "Semillas" no se traduce (§9).

## 1. Hifa

- [ ] 1.1 Crear `lib/idioma/textos/hifa.ts`; `lib/hifa/guion.ts` y las etiquetas de `lib/hifa/estado.ts` por idioma; `Mensaje` suma `idioma?` (ausente = `"es"`) y `reducir` recibe el idioma actual. Tests en `estado.test.ts`: mensajes nuevos con idioma, estado guardado sin idioma válido. Verificar con `pnpm test`.
- [ ] 1.2 `components/hifa/hifa.tsx` y `avatar-hifa.tsx` en inglés, cada mensaje con su `lang`. Verificar con `pnpm test:e2e e2e/hifa.spec.ts` (español en verde).

## 2. Reportar

- [ ] 2.1 Crear `lib/idioma/textos/reportar.ts` y pasar `components/boton-reportar.tsx`; `lib/reportes/reporte.ts` suma "Idioma de la persona: es|en" al cuerpo (plantilla en español). Test en `reporte.test.ts`. Verificar con `pnpm test` y `pnpm test:e2e e2e/reportes.spec.ts`.

## 3. Login

- [ ] 3.1 En `components/sesion/privy-puente.tsx`, `intl.textLocalization` con los textos principales en español cuando el idioma es `es` (revisar las claves disponibles en `PrivyI18nStrings` de `@privy-io/react-auth`). Verificar con `pnpm verificar` (tipos) y, en el preview, que "Entrar" (después del paso de `consentimiento-alta` o, si `entrar-por-email` ya está, después de escribir el email) muestra la ventana en español y en inglés según el idioma. Si Production ya pasó a `neon-auth` (ADR-009), esta tarea solo vale para los entornos que siguen con Privy y se borra con `retiro-privy`; el formulario propio ya está en el idioma de la plataforma.
  <!-- arquitecto: cambiar la configuración de Privy en caliente puede reiniciar su proveedor y cerrar o volver a verificar la sesión. -->
  - El objeto `config` de `PrivyProvider` se arma con `useMemo` y depende **solo** del idioma (no se recrea en cada render). En el preview, con sesión abierta, cambiar de idioma **no** cierra la sesión ni vuelve a pedir el código; si la cierra o la revalida (ventana en blanco, "Cargando…" largo), frenar y reportar: la alternativa es leer el idioma una sola vez al montar y que la ventana cambie de idioma recién en la próxima carga.
  - Si `textLocalization` no existe o no tipa en la versión instalada del SDK, frenar y reportar (no reemplazar con otra configuración de Privy). Anotar en el PR la versión de `@privy-io/react-auth` y la fecha de la verificación.
  - No cambia qué datos van a Privy: solo textos de su ventana. Si Privy falla al cargar, el login sigue funcionando como hoy (el idioma no agrega un modo de falla).

## 4. Cierre

- [ ] 4.1 Test en `lib/idioma/rutas.test.ts`: toda ruta de `DESTINOS` y de `RUTAS_PUBLICAS` (con un id de ejemplo para las dinámicas) está en `RUTAS_TRADUCIDAS`, salvo `/netx` y `/panel/bitacora`. Verificar con `pnpm test`.
- [ ] 4.2 Crear `e2e/idioma-hifa-avisos.spec.ts` con los escenarios de la spec (Hifa nueva y con conversación previa, reporte con la línea de idioma usando la ruta simulada de los e2e de reportes, `/netx` con el aviso) y sumar Hifa abierta en inglés a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm verificar`, `pnpm build` y `pnpm test:e2e`.
