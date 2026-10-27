## 1. Datos

- [ ] 1.1 `lib/tribus/necesidades.ts`: tipos, las 12 necesidades de ejemplo del design (es/en), `necesidadesDe`, `buscarNecesidad`, `circuloDeNecesidad` y `validarNecesidades`. Inglés de ejemplo listado en `lib/idioma/revision-nativa.ts`. Tests de Vitest en `lib/tribus/necesidades.test.ts`: una necesidad por etiqueta de `busca` en cada tribu activa o en formación, en los dos idiomas; ninguna en los vacantes; ids únicos; horas enteras positivas o null; fechas `AAAA-MM-DD` válidas o null; `habilidad` es una clave de `ROLES` y `habilidadOtra` existe solo con "otro"; el círculo es de la tribu o transversal con la tribu; un círculo de otra tribu (`semilla` con `valle-3`) da error. Verificar con `pnpm test lib/tribus`.

## 2. Ficha de la tribu

- [ ] 2.1 Textos es/en en `lib/idioma/textos/tribus.ts`: "De diseño" / "De campo" con su explicación, "Abierta" / "Tomada" / "Hecha", "Qué es", "Horas aproximadas", "Para cuándo", "Habilidad", "Círculo", "sin dato". Verificar con `pnpm verificar` (el test de diccionarios compara las claves de los dos idiomas).
- [ ] 2.2 `app/tribus/[id]/page.tsx`: lista de necesidades plegables en "Lo que busca" (activas y en formación), ancla `necesidad-<id>` y componente cliente que la abre al entrar con el hash. Verificar a mano en `pnpm dev` con `/tribus/valle`, `/tribus/agua#necesidad-agua-tratamiento` y `/tribus/grano` (sin cambios).
- [ ] 2.3 e2e (en el spec de la ficha de tribu que ya existe, o `e2e/tribus-necesidades.spec.ts`): los escenarios de la spec (Semilla Viva completa, horas y fecha sin dato, estado "Hecha", círculo de la tribu y transversal, teclado, ancla, inglés, vacante sin cambios) y axe en `/tribus/valle` con una necesidad abierta. Verificar con `pnpm test:e2e e2e/tribus-necesidades.spec.ts`.

## Integración

- [ ] F.1 `pnpm verificar` y `pnpm build` en verde. PR desde `agente/tribu-necesidades` hacia `dev` con guion de prueba: abrir `/tribus/valle`, desplegar las tres necesidades con el teclado, mirar el círculo transversal, cambiar a inglés, abrir `/tribus/grano`.
