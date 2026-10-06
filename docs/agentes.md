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
 21:00   pnpm noche <id-del-cambio>
 noche   implementador → PR · revisor comenta · tester prueba el preview · documentador reporta
 08:30   Gus lee docs/noches/<fecha>.md y el PR → merge o pide cambios
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
