# CLAUDE.md — lighthouse-platform

Plataforma de NetX para el Lighthouse (Soluna, BioPueblo): descubrir el territorio, encontrar tribu, pactos, semillas y el Congreso de febrero 2027. La documentación de producto, legal y de negocio vive en el repo `NS_platform` (carpeta `Documentation/`). Este repo es **solo código**.

## Quién hace qué
- **Gus (humano)** aprueba specs, prioriza, lee los reportes cada mañana y **es el único que mergea a `main`**.
- **Agentes de Claude Code** (`.claude/agents/`): especificador, implementador, revisor, tester, documentador. La corrida nocturna la orquesta `scripts/noche.sh` (ver `docs/agentes.md`).

## Cómo se trabaja
- **Spec primero (OpenSpec).** Ningún código sin un cambio aprobado en `openspec/changes/<id>/`. Comandos: `/opsx:propose`, `/opsx:apply`, `/opsx:archive`. Si `openspec` no está en el PATH, usar `pnpm exec openspec …`.
- **Una rama por cambio:** `agente/<id-del-cambio>`. PRs chicos. Nunca commitear ni pushear a `main`.
- **Si no podés cumplir la spec, frená y reportá.** No improvises alcance, no inventes datos, no "completes" textos legales.
- Antes de abrir un PR: `pnpm verificar` (lint + tipos + tests unitarios) y `pnpm build` en verde.
- Commits en español, en imperativo, explicando el porqué.

## Reglas de producto que no se negocian
- **Lenguaje legal:** todo término con peso legal lleva el ⚖ (`components/termino-legal.tsx`) con su explicación en palabras simples. Los textos salen **solo** de `lib/legal/terminos.ts`; los textos nuevos los escribe o aprueba Gabriel (abogado). Un agente **nunca** redacta un texto legal.
- **Ordenanza 173:** no ofrecer ni reservar lotes 7A antes de la aprobación preliminar; toda pantalla que muestre lotes lleva el banner de estado administrativo.
- **Plata:** la plataforma nunca cobra ni custodia aportes de inversión. Cualquier pantalla con montos, pagos o cupos es "de riesgo" y requiere revisión humana explícita.
- **El dato que falta no es cero.** Mostrar "sin dato", nunca 0 ni un valor inventado.
- **Datos de ejemplo siempre declarados** en pantalla ("Tribus, personas y cifras de ejemplo.").
- **Accesibilidad:** nada se comunica solo con color; todo es usable con teclado.

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
