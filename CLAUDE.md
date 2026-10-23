# CLAUDE.md — lighthouse-platform

Plataforma de NetX para el Lighthouse (Soluna, BioPueblo): descubrir el territorio, encontrar tribu, pactos y semillas. **El Congreso de febrero 2027 se canceló (23-oct-2026):** la salida al mercado son eventos de comunidad (`NS_platform`, nota 20); `/congreso` queda como vitrina a reutilizar o retirar. La documentación de producto, legal y de negocio vive en el repo `NS_platform` (carpeta `Documentation/`). Este repo es **solo código**.

## Quién hace qué
- **Gus (humano)** aprueba specs, prioriza, lee los reportes cada mañana y decide qué entra a `dev` y cuándo `dev` pasa a `main` (ver "Ramas").
- **Agentes de Claude Code** (`.claude/agents/`): especificador, arquitecto, implementador, revisor, tester, documentador. La corrida nocturna la orquesta `scripts/noche.sh` (ver `docs/agentes.md`).

## Ramas
- **`dev`**: donde se integra el trabajo de todos los días. Las noches parten de `dev` y sus PRs apuntan a `dev`. Su preview de Vercel es el entorno de desarrollo.
- **`main`**: producción estable, la que prueban las personas del equipo. Solo recibe a `dev` en una **entrega** (PR `dev` → `main`), cuando Gus lo decide.
- Ningún agente commitea, pushea ni mergea en `dev` ni en `main`.

## Cómo se trabaja
- **Spec primero (OpenSpec).** Ningún código sin un cambio aprobado en `openspec/changes/<id>/`. Comandos: `/opsx:propose`, `/opsx:apply`, `/opsx:archive`. Si `openspec` no está en el PATH, usar `pnpm exec openspec …`.
- **Una rama por cambio:** `agente/<id-del-cambio>`. PRs chicos. Nunca commitear ni pushear a `dev` ni a `main`.
- **Si no podés cumplir la spec, frená y reportá.** No improvises alcance ni inventes datos fuera de lo que pide la spec.
- Antes de abrir un PR: `pnpm verificar` (lint + tipos + tests unitarios) y `pnpm build` en verde.
- Commits en español, en imperativo, explicando el porqué.

## Cómo usar las herramientas (corridas sin humano)
Cada comando que no está en `.claude/settings.json` se rechaza solo. Para no trabarte:
- **Archivos:** crear y editar siempre con las herramientas Write y Edit, nunca con `sed -i`, `python3`, `cat > archivo` ni `echo >`. Borrar un archivo versionado: `git rm <ruta>`.
- **Un comando por llamada.** Sin `cd`, sin `git -C`, sin variables antes del comando (`U=… curl`), sin `;` ni `for` largos. La única excepción permitida es `BASE_URL=<url> pnpm test:e2e` (y con `PORT=`).
- **PRs y comentarios en GitHub: siempre con `scripts/pr.sh`** (crear, numero, ver, diff, comentarios, comentar, editar, listar). No uses `gh pr …` ni `gh repo …`: usan GraphQL, que la nube de Claude Code bloquea. Si necesitás otra cosa de GitHub, usá `gh api repos/netxgen-2050/lighthouse-platform/...` (REST).
- **Textos para GitHub** (PR, comentarios): `--body "…"` con el texto entre comillas dobles y **ninguna línea que empiece con `#`** (usá **negritas** como títulos). Los subagentes no pueden escribir archivos de reporte.
- **Procesos:** no uses `kill` ni `pkill`; puede haber otro carril en paralelo. Playwright levanta y baja su propio servidor.
- **Carpetas:** trabajá solo dentro del repo en el que arrancaste (en la noche es `.carriles/N`).

## Fase de prototipo interno (desde el 7-oct-2026, decisión de Gus)
Esto es un **prototipo para mostrar al equipo y hacer pruebas internas**. Nadie pone plata real. Por eso:
- **Plata e inversión: permitidas.** Se pueden mostrar planes, precios, Pase Fundador, montos, aportes, inversión y lotes. La plataforma tiene que dejar claro que **va a servir para captar plata de inversores y usuarios**. Ningún flujo cobra de verdad: los pagos son simulados.
- **Textos legales: los pueden redactar los agentes.** Todo término con peso legal sigue llevando el ⚖ (`components/termino-legal.tsx`) con su explicación en palabras simples, y los textos siguen viviendo en un solo catálogo (`lib/legal/terminos.ts`). Un texto nuevo que no venga del mock-up se marca como borrador (`borrador: true`) para revisarlo antes de cualquier uso real.
- **Aviso visible en todas las páginas:** "Prototipo interno · datos de ejemplo".
- Antes de mostrar la plataforma fuera del equipo, estas reglas se revisan (pendiente R14 en `NS_platform/Documentation/Desarrollo/Segunda revisión/`).

## Reglas que se mantienen
- **El dato que falta no es cero.** Mostrar "sin dato", nunca 0 ni un valor inventado.
- **Accesibilidad:** nada se comunica solo con color; todo es usable con teclado; la auditoría de axe pasa.
- **Estilo:** solo tokens del tema (nada de colores sueltos) y un único `<main>` (lo pone el layout).

## Seguridad
- Sin secretos en el repo. Las claves viven en Vercel y en `.env.local` (ignorado por git).
- Los agentes no tocan producción ni la base de producción; solo ramas y previews.

## Stack
Next.js 15 (App Router) · React 19 · TypeScript · Tailwind 4 · Vitest · Playwright · pnpm · Vercel. Más adelante: Neon + Drizzle, auth (Privy o alternativa, a decidir), Claude API.

## Comandos
| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor local |
| `pnpm verificar` | Lint + tipos + tests unitarios |
| `pnpm build` | Build de producción |
| `pnpm test:e2e` | Playwright; con `BASE_URL` apunta al preview de Vercel |
| `scripts/preview-url.sh <rama>` | Espera y devuelve la URL del preview de Vercel de una rama |

## Referencias
- Mock-up v6 (datos y estilo de referencia): `docs/referencia/netx-tribus-mockup-v6.html`.
- Reportes de cada noche: `docs/noches/AAAA-MM-DD.md`.
