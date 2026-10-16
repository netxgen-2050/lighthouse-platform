# Agentes desde el celular (Claude Code en la nube)

La app de Claude (Android o iOS) tiene una pestaña **Code**: lanza sesiones que corren en la nube de Anthropic, aunque la Mac esté apagada.

## Una vez

- La app instalada y logueada con la misma cuenta de claude.ai.
- GitHub conectado (ya hecho con `/web-setup`) y el entorno **`lighthouse-noche`** creado (ya hecho).

## Para construir un cambio

1. En la app, pestaña **Code** → nueva sesión.
2. Repo **`netxgen-2050/lighthouse-platform`**, rama **`dev`**, entorno **`lighthouse-noche`**.
3. Modo de permisos: **Auto** (o "Accept edits"; si algo pide permiso, lo aprobás desde el celular).
4. Pegá este mensaje, cambiando `<ID>` por el id de la spec (las carpetas de `openspec/changes/`):

```
Sos el orquestador de lighthouse-platform. Leé CLAUDE.md y seguí exactamente .claude/noche.md con {{CAMBIO}} = <ID>, {{BASE}} = dev y {{FECHA}} = la fecha de hoy (date +%F). Lanzá cada subagente en primer plano y esperá su resultado. Para los PRs usá siempre scripts/pr.sh (en la nube gh pr no funciona). Al final decime: el número del PR, el veredicto del revisor y el resultado del tester.
```

5. Seguí la sesión desde la app: podés responder preguntas o corregir el rumbo. Al terminar queda un PR y un reporte en `docs/noches/`.

**Una sesión por cambio.** Varias sesiones pueden correr en paralelo, pero si dos cambios tocan las mismas pantallas, mejor uno después del otro. Para apilar, usá `{{BASE}} = agente/<cambio anterior>` en el segundo.

## Specs listas (al 9-oct)

| Id | Qué hace |
|---|---|
| `reportar-circulo` | El botón de reportar como un círculo con el bicho y un anillo negro punteado |
| `barra-superior-configuracion` | NetX, campanita y avatar arriba a la derecha, más la página Configuración |

Sugerencia: primero `reportar-circulo` (es chico, sirve de prueba de la nube) y después `barra-superior-configuracion` con `{{BASE}} = agente/reportar-circulo`.

## Para pedir algo que no es una spec

Podés pedir directamente, por ejemplo: "Leé el issue #N (`gh api repos/netxgen-2050/lighthouse-platform/issues/N`) y escribí una spec OpenSpec para arreglarlo, en la rama `agente/spec-issue-N`, con un PR". Las specs las aprueba Gus antes de implementarlas.

## Para pedir una spec en un solo paso

En una sesión nueva (rama `dev`), pedí: "Corré `scripts/spec.sh <nombre> \"<lo que querés>\"`". Deja un PR de specs revisado por el arquitecto y anota las preguntas en el issue **🧭 Decisiones de Gus**, que podés contestar desde la app de GitHub.

## Lo que no hacen las sesiones

- No mergean a `dev` ni a `main`: eso lo hace Gus (o Claude con su OK, desde la Mac).
- No leen el secreto de Vercel ni lo muestran.
