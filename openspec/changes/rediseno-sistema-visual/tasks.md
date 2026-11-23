# Tasks

Primero de los cinco cambios del rediseño. No depende de otros cambios en curso: puede construirse ya sobre `dev`. Conviene que entre antes que los cambios del bien común se terminen de pintar, para que nazcan con los componentes nuevos.

## 1. Tokens y fuentes

- [ ] 1.1 Cargar Fraunces (ejes SOFT y opsz), Inter Tight y JetBrains Mono en `app/layout.tsx`, sacar Anek Latin y Figtree, y apuntar `--font-display`, `--font-sans` y `--font-mono` a las nuevas en `app/globals.css`; `h1`–`h3` con SOFT alto. **Verifica:** `grep -rn "Anek\|Figtree" app components` sin resultados; `pnpm build` en verde.
- [ ] 1.2 Reescribir los valores de los tokens de los dos temas según `design.md` §1, sumar `--color-regen-1…5` y `--color-vidrio`. **Verifica:** `pnpm test lib/sin-colores-sueltos` en verde.
- [ ] 1.3 Crear `lib/tema-contraste.test.ts`: lee `app/globals.css`, calcula contraste WCAG y prueba en los dos temas los pares texto/fondo usados (`ink`/`bg`, `ink`/`surface`, `ink`/`surface-2`, `muted`/`bg`, `muted`/`surface`, `on-deep`/`deep`, `gold-ink`/`gold-soft`, `warn-ink`/`warn-bg`, `danger`/`bg`, `ink` sobre vidrio mezclado con blanco y con negro) a 4,5:1, y la escala de regeneración contra `bg` y `surface` a 3:1. **Verifica:** `pnpm test lib/tema-contraste` en verde; cambiar a propósito `muted` del tema claro a `#9a9a9a` lo hace fallar (probar y revertir).

## 2. Tema oscuro por defecto

- [ ] 2.1 `PREFERENCIAS_INICIALES.tema = "oscuro"` y el script de apariencia sin preferencia → `oscuro`. **Verifica:** `pnpm test lib/configuracion` en verde, con casos nuevos: sin preferencia → oscuro; "claro" guardado → claro; "sistema" con sistema claro → claro.
- [ ] 2.2 E2E en `e2e/configuracion.spec.ts`: primera visita con `colorScheme: "light"` ve `data-tema="oscuro"`; elegir "Claro" y recargar lo mantiene. **Verifica:** `pnpm test:e2e e2e/configuracion.spec.ts` en verde.

## 3. Componentes base

- [ ] 3.1 `components/ui/indicador.tsx` con test (número, "sin dato", nombre accesible). **Verifica:** `pnpm test components/ui` en verde.
- [ ] 3.2 `components/ui/barra-avance.tsx` y `tonoDeAvance()` con test (quintos, 0, 1, null, fuera de rango, `aria-valuetext`). **Verifica:** `pnpm test components/ui` en verde.
- [ ] 3.3 `components/ui/panel-vidrio.tsx` con `@supports` y `prefers-reduced-transparency`. **Verifica:** test de render; el par de vidrio de la tarea 1.3 en verde.
- [ ] 3.4 `components/ui/tabla-libro.tsx` con test (`caption`, encabezados, "sin dato"). **Verifica:** `pnpm test components/ui` en verde.
- [ ] 3.5 `components/ui/sello-prototipo.tsx` (variantes general y venta) y `components/ui/chip-estado.tsx` (lista cerrada, ícono + texto), textos en `lib/idioma/textos/marco.ts` (es/en). **Verifica:** `pnpm test components/ui lib/idioma` en verde; ningún texto de estado escrito en el componente.

## 4. Revisión de toda la app

- [ ] 4.1 Correr axe en todas las rutas en los dos temas y los dos idiomas (`e2e/accesibilidad.spec.ts`, sumando el tema claro si hoy no se prueba) y corregir solo tokens si algo falla. **Verifica:** `pnpm test:e2e e2e/accesibilidad.spec.ts` en verde.
- [ ] 4.2 Revisar a mano en el preview `/`, `/lotes`, `/territorios/lighthouse`, `/bien-comun`, `/sumarte`, `/netx` y `/fogon` en oscuro y claro a 390 px y 1280 px; anotar en el PR cualquier pantalla que quede rara para los cambios 3 a 5. **Verifica:** capturas en el PR.

## 5. Cierre

- [ ] 5.1 **Verifica:** `pnpm verificar` y `pnpm build` en verde; `pnpm exec openspec validate rediseno-sistema-visual --strict` pasa.
