# Tasks

Rama `agente/tribu-quienes-somos` desde `dev`. No depende de `fogon-gobernanza-fractal`, pero si ya está en `dev`, reutilizar su `Registro` (design §Context).

## 1. Modelo

- [ ] 1.1 `lib/personas-red/datos.ts` con personas de ejemplo (design §4) y test: ninguna tiene email, ciudad, edad ni datos de pasaporte; las tribus vacantes no tienen personas. Verificar con `pnpm test lib/personas-red`.
- [ ] 1.2 `lib/personas-red/relaciones.ts` (design §1): afirmar, confirmar, rechazar, retirar y `estadoRelacion(a, b)` calculado desde los registros; clave nueva en `lib/demo/claves.ts` incluida en "Borrar todo". Tests: solo vale con las dos partes; no se confirma la propia afirmación; no se afirma dos veces con una pendiente o activa; retirar no borra; datos guardados rotos se leen como lista vacía. Verificar con `pnpm test lib/personas-red lib/demo`.

## 2. Visibilidad

- [ ] 2.1 Opción "Mostrarme en el directorio de mi tribu" en `app/configuracion/` (apagada por defecto, oculta sin consentimiento aceptado) y filtro en las listas (design §3). Tests unitarios del filtro y e2e de los escenarios "Por defecto no aparece" y "Elige mostrarse". Verificar con `pnpm test lib/personas-red` y `pnpm test:e2e e2e/tribu-personas.spec.ts`.

## 3. Pantallas

- [ ] 3.1 Sección "Quiénes somos" en `app/tribus/[id]/` y directorio `/tribus/personas` con filtro y búsqueda; enlace "Ver personas" desde `/tribus`; textos es/en; ⚖ "Nos conocemos" con `borrador: true` (y su test). Verificar con `pnpm verificar`.
- [ ] 3.2 Botón "Nos conocemos" en cada tarjeta, pedidos en `app/bandeja/` con "Sí, nos conocemos" / "No la/lo conozco", "Simular que <nombre> confirma (simulado)", y "Ya no quiero mostrar que nos conocemos". Anuncios para lector de pantalla en cada cambio de estado. Verificar con el e2e de 3.3.
- [ ] 3.3 `e2e/tribu-personas.spec.ts`: todos los escenarios de la spec (confirmación, sin confirmación, rechazo, retirar, sin red interceptando pedidos, borrar todo, sin datos personales, vacante, filtro). Sumar `/tribus/personas` a `e2e/accesibilidad.spec.ts`. Verificar con `pnpm test:e2e e2e/tribu-personas.spec.ts e2e/accesibilidad.spec.ts`.

## 4. Integración

- [ ] 4.1 Revisión con la skill `revision-seguridad-datos`; `pnpm verificar`, `pnpm build` y los e2e en verde; PR a `dev` con `scripts/pr.sh`, anotando las dos preguntas abiertas (anti-spam y visibilidad del grafo) y que nada sale del navegador.
