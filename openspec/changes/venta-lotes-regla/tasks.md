# Tasks

**Corte por noche.** Serie de fase 1, que tiene que verse en el preview de `dev` antes de la reunión del lunes 9-nov:

| Noche | Cambios (carril) |
|---|---|
| **1** | **`venta-lotes-regla`**, `loteo-norte-7a` (`pnpm noche venta-lotes-regla,loteo-norte-7a`, apilados) |
| 2 | `lote-ficha-y-compra` |
| 3 | `sumarte-diseno-b` (revisado) |
| 4 | `modelo-hibrido-procomun` |
| Después | `portada-vrn` |

**Este cambio: noche 1, el primero del carril.** Rama `agente/venta-lotes-regla`. Textos exactos en `design.md`.

## 1. La regla escrita

- [ ] 1.1 Editar `CLAUDE.md` con la línea del encabezado, la sección "Fase 1" y la frase de "Plata e inversión" (design §6). Verificar con `git diff CLAUDE.md`: solo suma esas tres cosas, y `docs/decisiones/ADR-030-fase-1-venta-de-lotes-simulada.md` existe y figura en `docs/decisiones/README.md`.
- [ ] 1.2 Crear `docs/notas/congreso-en-pausa.md` (design §7). Verificar leyendo que cada archivo y marca que nombra existe, con `git grep -n "oculto" -- lib/navegacion.ts`.

## 2. Estado administrativo

- [ ] 2.1 En `lib/legal/estado-administrativo.ts`, sumar el tipo, el proyecto `lighthouse-norte` y `ventaSimulada` (design §1 y §2), y `textoTitular` y `textoFechaAprobacion`. `accionesDeLote` devuelve según `ventaSimulada`. Verificar con `lib/legal/estado-administrativo.test.ts`, sumando: Norte devuelve `consultar`, `reservar` y `comprar`; Soluna sigue en `["consultar"]`, incluso con `aprobacionMunicipal: true`; Norte tiene `aprobacionMunicipal: false`; titular y fecha de Norte son "sin dato"; `supuestoDeTrabajo` dice "no otorgada" en español y "not granted" en inglés. <!-- arquitecto: design §1 --> Reescribir los comentarios del archivo que dicen que no se ofrece compra ni reserva sin aprobación. `pnpm test lib/legal`.
- [ ] 2.2 En `lib/legal/terminos.ts`, sumar `loteonorte` con `borrador: true` y `en` (design §4). Verificar sumando en `lib/legal/terminos.test.ts` que es borrador, tiene inglés y nombra la Ordenanza 173. `pnpm test lib/legal`.
- [ ] 2.3 En `components/estado-administrativo.tsx`, sumar `idioma`, los textos de Norte y el ⚖ `loteonorte` (design §3); Soluna no cambia. Verificar con un test nuevo `components/estado-administrativo.test.tsx`: Norte completo dice "supuesto de trabajo, no otorgada", "Titular: sin dato", "Expediente: sin dato" y "Fecha: sin dato" y **no** dice "Aprobación municipal: aprobada"; en inglés dice "not granted"; Soluna sigue diciendo "Aprobación municipal: pendiente". Correr también `pnpm test:e2e e2e/estado-administrativo.spec.ts`.

## 3. Menú de fase 1

- [ ] 3.1 En `lib/navegacion.ts`, `lib/idioma/textos/marco.ts` y el glosario: grupo `viene` en lugar de `participar`, destino `lotes` con `existe: false`, `oculto: true` en Congreso, y el nuevo orden de `DESTINOS` y `GRUPOS_RAIL` (design §5). Actualizar `lib/navegacion.test.ts`: orden, grupos es/en, y un test "Congreso existe pero no aparece en ningún grupo" como el de Compromisos. Verificar con `pnpm test lib/navegacion`: el test de "`existe` coincide con app/" tiene que pasar con `/lotes` en `false`.
- [ ] 3.2 Ajustar los e2e que recorren el rail: empezar por `git grep -ln "Participar\|Take part" -- e2e` y seguir por `e2e/marco.spec.ts`, `e2e/descubrir-publico.spec.ts`, `e2e/sumarte-acceso.spec.ts`, `e2e/compromisos.spec.ts` y `e2e/idioma-fogon-mercado.spec.ts`. Sumar un e2e de Congreso: no está en el rail, `/congreso` responde igual por su dirección y ningún destino queda marcado. Verificar con `pnpm test:e2e e2e/marco.spec.ts e2e/descubrir-publico.spec.ts e2e/sumarte-acceso.spec.ts e2e/compromisos.spec.ts e2e/congreso.spec.ts`.
- [ ] 3.3 Comprobar el rail a 390 × 844 px, con "Lo que viene" visible y sin scroll horizontal, y la auditoría de axe de la portada. Verificar con `pnpm test:e2e e2e/accesibilidad.spec.ts e2e/marco.spec.ts`.
- [ ] 3.4 <!-- arquitecto: tarea nueva, design §8 --> Sumar `robots: { index: false, follow: false }` a `generateMetadata` de `app/layout.tsx`, sin crear `robots.txt`. Verificar con un test en `e2e/marco.spec.ts`: `/`, `/sumarte`, `/territorios/lighthouse` y `/congreso` traen `<meta name="robots" content="noindex, nofollow">` y siguen respondiendo sin sesión. `pnpm test:e2e e2e/marco.spec.ts e2e/vista-netx.spec.ts`.

## 4. Integración

- [ ] 4.1 Comprobar lo que no debe cambiar: `git diff --name-only origin/dev` no incluye `lib/permisos/`, `lib/sesion/rutas-publicas.ts` ni `package.json`. `pnpm verificar` y `pnpm build` en verde.
- [ ] 4.2 Abrir el PR con `scripts/pr.sh` hacia `dev`, aclarando en el cuerpo: que rompe reglas escritas a propósito (ADR-030); que ninguna pantalla ofrece lotes todavía; que `/lotes` aparece en el rail recién con `lote-ficha-y-compra`; que la portada sigue enlazando al Congreso hasta `portada-vrn`; que la confirmación escrita de Franz sigue pendiente; y que este PR también hace P7 (`noindex` en todas las páginas), que no pide sesión. Verificar con `scripts/preview-url.sh agente/venta-lotes-regla` y `BASE_URL=<url> pnpm test:e2e e2e/marco.spec.ts`.
