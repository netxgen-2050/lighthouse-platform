**Congreso fuera del menú: qué pasó y cómo volver**

Nota escrita el 3-nov-2026 con el cambio `openspec/changes/venta-lotes-regla/`.

**1. Qué pasó y por qué**

El 2-nov-2026 Franz decidió que la fase 1 es la venta simulada de lotes privados en Lighthouse VRN (ADR-030). El menú de fase 1 deja adelante Inicio, Territorio, Lotes y Sumarte, y saca el Congreso. Se relaciona con el backlog D16 (retirar o reutilizar `/congreso`, decide Gus) y con la cancelación del Congreso del 23-oct-2026. No se borró nada: la página sigue respondiendo en su dirección (`/congreso`).

Qué dejó de ofrecerse: el enlace "Congreso" del rail (computadora y celular). La tarjeta de la portada que enlaza al Congreso sigue hasta `portada-vrn`.

**2. Qué quedó en el código**

- Página: `app/congreso/` (`page.tsx`, `vitrina.tsx`, `registro-ticket.tsx`, `registro-ticket.textos.ts`, `tema-evento.css`) y la versión en inglés `app/congreso/en/`.
- Lógica: `lib/congreso/` (incluido el registro del ticket).
- Permiso: `lib/permisos/niveles.ts` (capacidad `congreso`, nivel explorador).
- Rutas públicas: `lib/sesion/rutas-publicas.ts` (`/congreso` y `/congreso/en` siguen sin sesión).

La marca que lo deja en pausa:
- `lib/navegacion.ts`: Congreso tiene `oculto: true` y `destinosDeGrupo` lo filtra.

**3. Pasos para volver**

1. Rail: en `lib/navegacion.ts`, quitar `oculto: true` de Congreso y ubicarlo en el grupo que corresponda.
2. Tests: ajustar `lib/navegacion.test.ts` (el test "Congreso existe pero no aparece en ningún grupo" y las listas de grupos).
3. e2e: ajustar `e2e/marco.spec.ts`, `e2e/descubrir-publico.spec.ts`, `e2e/sumarte-acceso.spec.ts`, `e2e/compromisos.spec.ts`, `e2e/idioma-fogon-mercado.spec.ts` y `e2e/congreso.spec.ts`.
4. Correr `pnpm verificar`, `pnpm build` y `pnpm test:e2e`.

**4. Qué no se tocó**

- La página, sus textos, su permiso, el registro del ticket y las rutas públicas.
- La decisión de retirarlo o reutilizarlo (D16), que es de Gus.
