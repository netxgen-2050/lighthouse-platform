# Agentes de desarrollo

Diseño completo en `NS_platform/Documentation/Desarrollo/05 - Agentes IA en el desarrollo.md`.

## El equipo

| Agente | Archivo | Modelo | Qué hace |
|---|---|---|---|
| Especificador | `.claude/agents/especificador.md` | Opus | Pedido → cambio OpenSpec. Lo usás de día, con Gus presente |
| Implementador | `.claude/agents/implementador.md` | Sonnet | Spec aprobada → rama `agente/<id>` → PR |
| Revisor | `.claude/agents/revisor.md` | Opus | PR vs. spec y reglas → comentario en el PR |
| Tester | `.claude/agents/tester.md` | Sonnet | Playwright + guion sobre el preview de Vercel → comentario |
| Documentador | `.claude/agents/documentador.md` | Sonnet | Reporte de la noche en `docs/noches/` |

Modelos pensados para Max 5x: Opus solo donde se piensa (spec y revisión). Con Max 20x se puede pasar el implementador a Opus.

## Ciclo

```
 día     Gus + especificador: cambio OpenSpec → Gus lo lee, ajusta y lo commitea en main (= aprobado)
 21:00   pnpm noche a,b,c d,e        (cada argumento es un carril; corren en paralelo)
 noche   por cada cambio: implementador → PR · revisor (hasta 2 vueltas de corrección) · tester · documentador
 cierre  integración de todas las ramas · el especificador propone 3 cambios · resumen
 08:30   Gus lee docs/noches/<fecha>-resumen.md (rama agente/propuestas-<fecha>) → merge en orden, aprueba propuestas
```

## Salvaguardas
- `.claude/hooks/guardia.mjs` corre antes de cada comando de los agentes: bloquea `gh pr merge`, push o commit a `main`, push forzado, leer `.env*`, imprimir secretos; antes de commitear busca secretos y corre `pnpm verificar`; antes de abrir PR corre `pnpm build`.
- `.claude/settings.json` define qué comandos pueden correr sin preguntar. Lo que no está en la lista, en la corrida nocturna se rechaza solo.
- La organización de GitHub está en el plan gratis, que no permite proteger ramas en repos privados: la regla de "nadie mergea a main" la aplica el guardia. Si se pasa al plan Team, sumar una regla de rama en GitHub.

## Vercel
- El repo se importa en Vercel; cada push a `agente/*` genera un preview y queda registrado como *deployment* en GitHub. `scripts/preview-url.sh <rama>` lo espera y devuelve la URL.
- Si los previews están protegidos (Vercel Authentication), crear el secreto en **Settings → Deployment Protection → Protection Bypass for Automation** y copiarlo en `.env.local` como `VERCEL_AUTOMATION_BYPASS_SECRET`. Playwright y `scripts/curl-preview.sh` lo usan sin mostrarlo.

## Para que la noche corra
- La Mac enchufada, **con la tapa abierta** (o con monitor externo). `caffeinate` evita el reposo por inactividad, no el de cerrar la tapa.
- Claude Code logueado con la cuenta Max (`/status`).
- El log completo queda en `.noches/<fecha>-<id>.jsonl` (ignorado por git).

## Más adelante
- Correr la noche en la nube (Claude Code en la web, con `/schedule`) para no depender de la Mac.
- Varios implementadores en paralelo con worktrees cuando haya cola de specs.

## Carriles
- Cada carril es una copia del repo en `.carriles/N` (worktree de git, ignorado) con su propio puerto local (`3000 + N`).
- Dentro de un carril los cambios se **apilan**: el segundo parte de la rama del primero y su PR apunta a esa rama. Se mergean en orden; al mergear el primero, GitHub reapunta el siguiente a `main`.
- Si se toca el límite de uso del plan, el script espera 30 minutos y retoma (hasta ~6 h).

## Nube (Claude Code en la web y rutinas)
- Entorno `lighthouse-noche` en claude.ai/code: red Full (o Custom con los dominios de Vercel, Google Fonts, Playwright y Esri), setup script con pnpm 12.4.2 y Chromium, y `VERCEL_AUTOMATION_BYPASS_SECRET` como variable del entorno.
- Al arrancar, el hook `scripts/nube-inicio.sh` instala dependencias (solo si `CLAUDE_CODE_REMOTE=true`).
- **GraphQL de GitHub está bloqueado en la nube**: los PRs se manejan con `scripts/pr.sh` (REST), que funciona igual en la Mac.
- La noche en la nube la arman rutinas que leen `noches/cola.md`: una por carril (`.claude/nube-carril.md`) y una de cierre (`.claude/nube-cierre.md`).
- Prueba del entorno del 8-oct: verificar 387, build y 284 e2e en verde; preview de Vercel accesible.
