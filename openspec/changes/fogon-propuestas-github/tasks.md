# Tasks

Rama `agente/fogon-propuestas-github` desde `dev`, **después** de `fogon-consultas-panel`. Orden de la serie: `base-neon` → `consentimiento-en-la-base` → `fogon-cuadratico-en-la-base` → `fogon-consultas-panel` → **`fogon-propuestas-github`**. Si alguno no está en `dev`, frenar y reportar.

## 1. Modo decisión

- [ ] 1.1 `lib/fogon/consultas/tipos.ts` y `reglas.ts`:
  - agregar el modo `decision`, con sus tres opciones fijas;
  - escribir la función pura `resultadoDecision(votos, padron)`, que devuelve `aprobada`, `rechazada` o `sin-quorum` según design §2;
  - tests de empate, quórum justo, abstenciones y padrón de 1.

  Verificar con `pnpm test lib/fogon`.
- [ ] 1.2 Migración: agregar `decision` al enum `modo` y un trigger que, en ese modo, exija exactamente una opción con valor 1 por envío. Tests con PGlite del trigger y de que los modos `prioridades` y `presupuesto` no cambian. Verificar con `pnpm test lib/db`.
- [ ] 1.3 Pantalla de la consulta en modo decisión: grupo de radios, "Guardar mi voto", y el resultado al cierre con "votaron X de N". Verificar con el e2e de 5.1.

## 2. Tablas y configuración

- [ ] 2.1 Misma migración: crear `propuestas_github`, `propuestas_github_eventos` y `fogon_config` (design §3), con el trigger que impide dos consultas abiertas para un mismo PR. Tests con PGlite.
- [ ] 2.2 API de configuración, solo para el super admin, y sección "Propuestas desde GitHub" en `/netx`: padrón de socios, repos permitidos y días de cierre; la lista de consultas que nacieron de un PR, con "Reintentar aviso a GitHub" cuando corresponda. Verificar con `pnpm verificar`.

## 3. GitHub

- [ ] 3.1 `lib/github/firma.ts`: verificar `X-Hub-Signature-256` en tiempo constante, con tests (firma válida, inválida, ausente y cuerpo alterado).
- [ ] 3.2 `lib/github/app.ts`:
  - firmar el JWT de la App;
  - obtener el token de instalación y guardarlo en memoria;
  - funciones `archivosDelPr`, `comentar` y `etiquetar`, sin ninguna función que escriba contenido.

  Tests con `fetch` simulado.
- [ ] 3.3 `app/api/fogon/github/route.ts`: firma, tamaño máximo, entregas repetidas, repos permitidos y los eventos `labeled` (`propuesta`), `synchronize` y `closed` sin merge (design §1); 503 sin las variables. Tests de la ruta con PGlite y GitHub simulado.
- [ ] 3.4 Avisar el cierre a GitHub, tanto el cierre a mano como el cron `/api/fogon/cron/cierres` (cada hora, con `CRON_SECRET`, configurado en `vercel.json`). Que GitHub falle no impide cerrar la consulta. Tests.

## 4. Documentación

- [ ] 4.1 `docs/decisiones/ADR-010-webhook-github.md`, sumado a su índice: webhook de organización con etiqueta vs. Action por repo, GitHub App vs. token personal, variables solo en Production, corte de emergencia. Con su sección "En palabras simples".
- [ ] 4.2 `docs/guiones/github-propuestas.md`, el guion manual para Gus:
  - rulesets de `main` en los repos de conocimiento;
  - `CODEOWNERS`;
  - permiso base Read y rol Triage para los socios;
  - crear las etiquetas `propuesta`, `aprobada`, `rechazada` y `sin-quorum`;
  - crear e instalar la App "NetX Fogón" con permisos mínimos;
  - webhook de la organización solo con el evento `pull_request`;
  - variables en Vercel Production;
  - la prueba con un PR real.

## 5. Pruebas e integración

- [ ] 5.1 `e2e/fogon-propuestas.spec.ts`, con PGlite, modo de prueba y GitHub simulado:
  - un webhook firmado con `labeled` crea la consulta y la ven las personas del padrón (y no una persona de afuera);
  - votar y cambiar el voto;
  - cerrar a mano produce el comentario y la etiqueta en el simulador;
  - `synchronize` muestra el aviso de cambio;
  - una firma inválida no crea nada;
  - todo funciona con teclado y sin scroll horizontal a 390 px.

  Sumar la consulta de decisión a `e2e/accesibilidad.spec.ts`.
- [ ] 5.2 `pnpm verificar` y `pnpm build` en verde. Abrir el PR con `scripts/pr.sh`, con los pasos del guion 4.2 y las preguntas abiertas del design para que Gus las responda.
