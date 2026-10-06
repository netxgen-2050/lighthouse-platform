#!/usr/bin/env bash
# Corrida nocturna de los agentes sobre un cambio OpenSpec aprobado.
# Uso: pnpm noche <id-del-cambio>
set -euo pipefail

CAMBIO="${1:?Uso: pnpm noche <id-del-cambio>}"
cd "$(git rev-parse --show-toplevel)"

if [[ ! -d "openspec/changes/$CAMBIO" ]]; then
  echo "No existe openspec/changes/$CAMBIO" >&2
  exit 1
fi
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Hay cambios sin commitear. Dejá el repo limpio antes de la noche." >&2
  exit 1
fi

# Sin confianza en la carpeta, Claude Code ignora permisos y hooks del repo y la noche no avanza.
CONFIA="$(jq -r --arg p "$PWD" '.projects[$p].hasTrustDialogAccepted // false' ~/.claude.json 2>/dev/null || echo false)"
if [[ "$CONFIA" != "true" ]]; then
  echo "Claude Code todavía no confía en esta carpeta. Corré 'claude' acá una vez, aceptá el aviso y salí con /exit." >&2
  exit 1
fi

git switch -q main
git pull -q --ff-only

# Secretos locales (por ejemplo VERCEL_AUTOMATION_BYPASS_SECRET), nunca en git.
if [[ -f .env.local ]]; then
  set -a; source .env.local; set +a
fi

FECHA="$(date +%F)"
mkdir -p .noches
LOG=".noches/$FECHA-$CAMBIO.jsonl"
PROMPT="$(sed -e "s/{{CAMBIO}}/$CAMBIO/g" -e "s/{{FECHA}}/$FECHA/g" .claude/noche.md)"

# En macOS, caffeinate evita que la máquina se duerma mientras corre (con la tapa abierta).
DESPIERTO=()
command -v caffeinate >/dev/null && DESPIERTO=(caffeinate -i)

echo "🌙 Noche $FECHA · cambio $CAMBIO · log en $LOG"
"${DESPIERTO[@]}" claude -p "$PROMPT" \
  --permission-mode acceptEdits \
  --model sonnet \
  --output-format stream-json --verbose \
  > "$LOG" 2>&1 || echo "⚠️  La corrida terminó con error; mirá el log."

echo "☀️  Listo. Reporte: docs/noches/$FECHA.md en la rama agente/$CAMBIO"
