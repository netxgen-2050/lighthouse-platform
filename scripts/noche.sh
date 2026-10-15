#!/usr/bin/env bash
# Corrida nocturna de los agentes sobre cambios OpenSpec aprobados.
#
# Uso:
#   pnpm noche <cambio>                      un cambio
#   pnpm noche a,b,c d,e                     dos carriles en paralelo
#
# Cada argumento es un carril, que corre en su propia copia del repo (.carriles/N).
# Dentro de un carril los cambios se apilan: b parte de la rama de a, c de la de b.
# Al final corre el cierre: prueba de integración, propuestas para mañana y resumen.
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Uso: pnpm noche <c1,c2,...> [<c3,c4,...>] ..." >&2
  exit 1
fi

RAIZ="$(git rev-parse --show-toplevel)"
cd "$RAIZ"

# Sin confianza en la carpeta, Claude Code ignora permisos y hooks del repo y la noche no avanza.
CONFIA="$(jq -r --arg p "$RAIZ" '.projects[$p].hasTrustDialogAccepted // false' ~/.claude.json 2>/dev/null || echo false)"
if [[ "$CONFIA" != "true" ]]; then
  echo "Claude Code todavía no confía en esta carpeta. Corré 'claude' acá una vez, aceptá el aviso y salí con /exit." >&2
  exit 1
fi

TODOS=()
for carril in "$@"; do
  IFS=, read -ra cambios <<< "$carril"
  for c in "${cambios[@]}"; do
    if [[ ! -d "openspec/changes/$c" ]]; then
      echo "No existe openspec/changes/$c" >&2
      exit 1
    fi
    TODOS+=("$c")
  done
done

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Hay cambios sin commitear. Dejá el repo limpio antes de la noche." >&2
  exit 1
fi
git switch -q main
git pull -q --ff-only

# Secretos locales (por ejemplo VERCEL_AUTOMATION_BYPASS_SECRET), nunca en git.
if [[ -f .env.local ]]; then
  set -a; source .env.local; set +a
fi

FECHA="$(date +%F)"
# Segunda corrida del mismo día: sumar la hora para no chocar con las ramas y reportes de la primera.
if git ls-remote --exit-code --heads origin "agente/integracion-$FECHA" > /dev/null 2>&1; then
  FECHA="$(date +%F-%H%M)"
fi
mkdir -p .noches .carriles

# En macOS, caffeinate evita que la máquina se duerma por inactividad (no si se cierra la tapa).
if command -v caffeinate >/dev/null; then
  caffeinate -i -w $$ &
fi

toco_el_limite() {
  tail -n 5 "$1" | grep -qiE "usage limit|rate limit|hit your limit|hit your session limit|session limit|limit reached"
}

# Corre una sesión headless; si se toca el límite de uso, espera y reintenta (hasta 12 veces, ~6 h).
correr_claude() {
  local dir="$1" prompt="$2" log="$3"
  for _ in $(seq 1 12); do
    if (cd "$dir" && claude -p "$prompt" \
          --permission-mode acceptEdits \
          --model sonnet \
          --output-format stream-json --verbose) >> "$log" 2>&1 \
       && ! toco_el_limite "$log"; then
      return 0
    fi
    if toco_el_limite "$log"; then
      echo "[$(date +%T)] Límite de uso alcanzado; espero 30 minutos y retomo." | tee -a "$log"
      sleep 1800
    else
      return 1
    fi
  done
  return 1
}

plantilla() {
  sed -e "s|{{CAMBIO}}|$2|g" -e "s|{{FECHA}}|$FECHA|g" -e "s|{{BASE}}|$3|g" -e "s|{{CAMBIOS}}|$4|g" "$1"
}

correr_carril() {
  local n="$1" lista="$2" dir=".carriles/$1" base="main"
  export PORT=$((3000 + n))   # cada carril levanta su servidor local en su propio puerto

  git worktree remove --force "$dir" 2>/dev/null || true
  git worktree add -q --detach "$dir" origin/main
  [[ -f .env.local ]] && cp .env.local "$dir/"
  (cd "$dir" && pnpm install --frozen-lockfile --prefer-offline > /dev/null 2>&1)

  IFS=, read -ra cambios <<< "$lista"
  for c in "${cambios[@]}"; do
    local log="$RAIZ/.noches/$FECHA-$c.jsonl"
    echo "[$(date +%T)] Carril $n · $c (parte de $base)"
    correr_claude "$dir" "$(plantilla .claude/noche.md "$c" "$base" "")" "$log" \
      || echo "[$(date +%T)] Carril $n · $c terminó con error; mirá $log"

    # Solo se apila sobre un cambio que dejó PR abierto (es decir, que pasó por el revisor).
    if [[ -n "$(scripts/pr.sh numero "agente/$c" 2>/dev/null)" ]]; then
      base="agente/$c"
    else
      echo "[$(date +%T)] Carril $n · $c no dejó PR; el resto del carril se frena para no apilar sobre algo sin revisar."
      break
    fi
  done
  echo "[$(date +%T)] Carril $n terminado."
}

echo "🌙 Noche $FECHA · $# carril(es) · ${#TODOS[@]} cambio(s)"
n=0
CARRILES=()
for carril in "$@"; do
  n=$((n + 1))
  correr_carril "$n" "$carril" &
  CARRILES+=($!)
done
# Esperar solo a los carriles: caffeinate también corre en segundo plano y espera a este script.
wait "${CARRILES[@]}"

echo "[$(date +%T)] Cierre: integración, propuestas y resumen."
correr_claude "$RAIZ" "$(plantilla .claude/cierre.md "" "" "${TODOS[*]}")" "$RAIZ/.noches/$FECHA-cierre.jsonl" \
  || echo "El cierre terminó con error; mirá .noches/$FECHA-cierre.jsonl"
git switch -q main 2>/dev/null || true

echo "☀️  Listo. Resumen: docs/noches/$FECHA-resumen.md en la rama agente/propuestas-$FECHA"
