# Proposal

## Why

El menú de hoy tiene 14 destinos repartidos en grupos (Descubrir, Sumarte, Participar, el avatar y lo interno), y la mitad apunta a módulos que en la fase 1 están en pausa. La visión del lienzo "Lighthouse · direcciones visuales" (23-nov-2026) ordena la plataforma alrededor de tres públicos (quien quiere vivir, quien invierte, quien cuida lo común) y pide **cinco destinos**: Explorar, Bien común, Invertir, Sumarte y Mi tierra.

Es el **segundo de los cinco cambios** del pedido `rediseno-defi-tierra`. Depende de `rediseno-sistema-visual`.

## What Changes

- **Cinco destinos en el menú principal**, en este orden y sin títulos de grupo:
  1. **Explorar** (`/`): marca la sección en `/`, `/territorios/…`, `/barrios/…`, `/lotes/…` y `/tribus/…`.
  2. **Bien común** (`/bien-comun`).
  3. **Invertir** (`/invertir`): aparece cuando exista la página (cambio 5).
  4. **Sumarte** (`/sumarte`).
  5. **Mi tierra** (`/mi-tierra`): aparece cuando exista la página (cambio 4).
- **Subnavegación de Explorar:** una barra de pestañas arriba del contenido en las páginas de Explorar, con Territorio, Barrios (cuando exista, cambio 3), Lotes y Comunidades (`/tribus`).
- **Fogón, Pactos, Semillas, Compromisos y Congreso salen del menú.** Sus páginas, su código y su URL siguen funcionando igual: **no se borra nada**, se marcan como ocultos en la lista única.
- **Aspecto (preferencia de Gus, adoptada):** en la computadora, rail lateral angosto con ícono y nombre; en el celular (menos de 768 px), el rail pasa a un botón "Menú" en la barra superior que abre un panel desplegable con los cinco destinos.
- **Sin cambios** en el menú de la persona (Perfil, Pasaporte, Mi recorrido, Configuración, Mis datos), en NetX y Admin (para quien tiene permiso) ni en el botón "Entrar" sin sesión (sigue diciendo "Entrar" y usa el login que haya).

## Fuera de alcance

- Las páginas Mi tierra, Invertir y Barrio Norte (cambios 3 a 5). Hasta que existan, sus destinos no se ven.
- "Entrar con passkey" (cuentas Safe, ADR-011, `billeteras-candide-prueba`) y el login con Neon Auth (`login-neon-auth`): el botón solo cambia de texto cuando lleguen.
- Cambiar los textos de `/tribus` de "tribu" a "comunidad" dentro de la página: solo cambia el nombre en el menú.
- Retirar `/congreso` (D16) o cambiar cualquier página en pausa.

## Capabilities

### New Capabilities
- `menu-cinco-destinos`: los cinco destinos, la subnavegación de Explorar y el menú desplegable del celular.

### Modified Capabilities
- `navegacion-rail`: "Rail lateral", "Igual en computadora y celular" y "Teclado" pasan a los cinco destinos y al menú desplegable del celular.
- `rail-v2`: "Grupos" deja de tener títulos de grupo.
- `rail-destinos-ocultos`: "Compromisos fuera de la navegación principal" y "La lista única sigue declarando el destino" se amplían a los cinco destinos en pausa.
- `barra-superior-configuracion`: "Celular" suma el botón "Menú".

## Impact

- **Cambia:** `lib/navegacion.ts` (destinos nuevos, grupos `principal` y `explorar`, ocultos), `lib/navegacion.test.ts`, `components/rail.tsx`, `components/rail-enlaces.tsx`, `components/barra-superior.tsx`, `lib/idioma/textos/marco.ts` y el glosario (nombres Explorar, Invertir, Mi tierra, Barrios, Comunidades), `lib/ruta-activa.ts` si hace falta marcar Explorar por varias rutas.
- **Nuevo:** `components/subnav-explorar.tsx`, `components/menu-celular.tsx`.
- **Tests:** `e2e/marco.spec.ts`, e2e que hoy buscan enlaces de Participar en el rail (`e2e/compromisos.spec.ts`, `e2e/fogon*.spec.ts`, `e2e/pactos*.spec.ts`, `e2e/semillas.spec.ts`), `e2e/accesibilidad.spec.ts`.
- **Sin** tablas, migraciones, permisos, integraciones, datos personales ni dependencias nuevas. Ningún permiso de página cambia.
