# Tasks

Rama `agente/fogon-cuadratico-en-la-base` desde `main`, **después** de que `fogon-cuadratico`, `base-neon` y `consentimiento-en-la-base` estén en `main`. Si alguno falta, frenar y reportar. Para archivar este cambio, antes hay que archivar `fogon-cuadratico` (este delta modifica su spec).

## 1. Base

- [ ] 1.1 Esquema en `lib/db/schema.ts` (enums y tablas de design §1) y migración generada con `pnpm db:generate`, revisada a mano. Tests con PGlite: las migraciones se aplican desde cero; `creditos` ≠ 100 falla; presupuesto sin moneda falla; prioridades con monto falla; piso > tope falla; estado `cerrada` sin `cerrada_at` falla. Verificar con `pnpm test lib/db`.
- [ ] 1.2 Migración de SQL propio (`drizzle-kit generate --custom`) con los triggers de design §1 (solo agregar en envíos y votos, incluido `TRUNCATE`; consulta cerrada por estado y por fecha; constraint diferido de créditos y votos en contra; reglas y opciones fijas con envíos; no reabrir), con un comentario de que una migración que recree estas tablas tiene que recrearlos. Tests con PGlite de cada uno, más la foránea compuesta (opción de otra consulta) y la del padrón. Verificar con `pnpm test lib/db`.

## 2. Servidor

- [ ] 2.1 `lib/fogon/consultas/servidor.ts`: `ultimoRepartoPorPersona`, `vista`, `guardarReparto`, `crearConsulta` (con validación pura y tests propios), `cerrarConsulta` (design §2). Tests con PGlite: vale el último envío; el envío vacío no cuenta como participación; `vista` de B serializada no contiene el id, el email ni el reparto de A; el super admin ve `participantes` sin votos ni nombres; resultado oculto o visible según la regla (al votar / al cierre, por estado y por fecha); errores de la base traducidos a 404/409/422. Test de fuente: nada en `app/` importa `ultimoRepartoPorPersona`. Verificar con `pnpm test lib/fogon`.
- [ ] 2.2 Rutas de design §3 con `sesionDelPedido` → `exigirConsentimiento` → rol o padrón; `no-store`. Tests de cada ruta: 401 sin sesión, 403 `{ consentimiento: false }`, 403 de rol en crear y cerrar, 404 fuera del padrón, 409 cerrada, 422 con motivos (102 créditos, voto en contra apagado, email desconocido en el padrón), 201/200 felices. Verificar con `pnpm test app/api/fogon`.

## 3. Cliente

- [ ] 3.1 `lib/fogon/consultas/api.ts` (`RepositorioApi`), `fuente.ts` apuntando a la API, `git rm` de la implementación del navegador y de las personas de ejemplo, textos de U1–U4 a `plantillas.ts`; pantalla sin sesión ("Las consultas del equipo se ven al entrar" + "Entrar"), "No encontramos esta consulta" y error al guardar con `role="alert"` y "Sin guardar" (design §4). Verificar con `pnpm verificar` y con el e2e de 4.1.

## 4. Pruebas de punta a punta

- [ ] 4.1 Reescribir `e2e/fogon-consultas.spec.ts` para PGlite + modo de prueba (design §6): la fixtura crea la consulta por la API como super admin de prueba; A y B reparten (incluidos bloqueo por créditos, teclado y 390 px que ya probaba `fogon-cuadratico`); la respuesta de red que recibe B no contiene el email de A; regla al cierre y al votar; el super admin cierra y se ve el acta; una persona fuera del padrón ve "No encontramos esta consulta"; sin sesión, la invitación a entrar; con la API interceptada respondiendo 500, el error y "Sin guardar". Actualizar las páginas en `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/fogon-consultas.spec.ts e2e/accesibilidad.spec.ts`.
- [ ] 4.2 `e2e/fogon-preview.spec.ts`: el mismo recorrido corto (crear, repartir A y B, ver que B no recibe a A, cerrar) contra un preview; se salta sin `BASE_URL` o si el preview no acepta el modo de prueba (lo detecta con un 401 en `/api/sesion` con la cabecera de prueba). Verificar con `BASE_URL=<preview> pnpm test:e2e e2e/fogon-preview.spec.ts` (URL con `scripts/preview-url.sh agente/fogon-cuadratico-en-la-base`) y anotar en el PR si corrió o se saltó y por qué.
- [ ] 4.3 `e2e/fogon-privy.spec.ts` (camino A de design §6): se salta sin `BASE_URL`, `PRIVY_PRUEBA_EMAIL` o `PRIVY_PRUEBA_CODIGO`; entra con la cuenta de prueba por la pantalla de Privy, acepta, abre la consulta de prueba y guarda un reparto. Verificar con `pnpm test:e2e e2e/fogon-privy.spec.ts` (sin variables, se salta en verde) y, si Gus habilitó la cuenta, con `BASE_URL=<preview> pnpm test:e2e e2e/fogon-privy.spec.ts`.

## 5. Documentación

- [ ] 5.1 `docs/guiones/fogon-privy-real.md`: guion manual para Gus, paso a paso en el preview (entrar con su email real, aceptar, crear una consulta de prueba con su email y el de otra persona del equipo, votar desde dos dispositivos, comprobar que ninguno ve el reparto del otro, cerrar, ver el acta) y qué anotar si algo falla. Verificar leyéndolo contra la pantalla del preview (cada paso nombra un botón que existe).
- [ ] 5.2 Revisar que `docs/decisiones/ADR-007-voto-secreto-y-padron.md` coincide con lo implementado (si cambió algo, anotarlo en el PR, sin cambiar el estado). Verificar leyendo el ADR contra design §1 y §5.

## 6. Integración

- [ ] 6.1 `pnpm verificar`, `pnpm build` y los e2e locales en verde; PR con el resultado de 4.2 y 4.3 y los pasos para Gus (variables del preview, cuenta de prueba de Privy, guion de 5.1). Verificar con los comandos y con `scripts/pr.sh`.
