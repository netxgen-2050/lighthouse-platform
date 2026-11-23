#!/usr/bin/env bash
# Corre la noche de un carril, sin noche.sh, en una copia aparte (.carriles/m<n>), desde dev o desde BASE0.
# Lo usa Claude de día para lanzar cambios aprobados sin ocupar el checkout principal.
#
# Uso:
#   scripts/carril.sh <n> <cambio>[,<cambio>…]     los cambios se apilan: el segundo parte de la rama del primero
#   BASE0=agente/<cambio> scripts/carril.sh …       arranca apilado sobre otra rama
#   EXTRA="…" scripts/carril.sh …                   instrucciones extra que se suman al prompt de la noche
#
# Cada cambio corre .claude/noche.md con claude -p (Sonnet) en el puerto 3010+n. Si se corta por límite de uso
# o por la red, reintenta hasta 16 veces cada 30 min. Logs en .carriles/logs/ (carriles.log y m-<cambio>.txt).
set -u
RAIZ="$(git rev-parse --show-toplevel)"; cd "$RAIZ" || exit 1
n="${1:?falta el número de carril}"; IFS=, read -ra cambios <<< "${2:?faltan los cambios}"
LOGS="$RAIZ/.carriles/logs"; mkdir -p "$LOGS"
VECINOS="$(dirname "$RAIZ")"
F="$(date +%F)-m"; dir="$RAIZ/.carriles/m$n"; base="${BASE0:-dev}"
git fetch -q origin
git worktree remove --force "$dir" 2>/dev/null
git worktree add -q --detach "$dir" origin/dev || exit 1
[ "$(cd "$dir" && git rev-parse --show-toplevel)" = "$dir" ] || { echo "La copia $dir no quedó bien armada." >&2; exit 1; }
cp "$RAIZ/.env.local" "$dir/" 2>/dev/null
(cd "$dir" && pnpm install --frozen-lockfile --silent >/dev/null 2>&1)
for c in "${cambios[@]}"; do
  echo "[$(date +%T)] carril $n · $c (base $base)" >> "$LOGS/carriles.log"
  p="$(sed -e "s|{{CAMBIO}}|$c|g" -e "s|{{FECHA}}|$F|g" -e "s|{{BASE}}|$base|g" "$dir/.claude/noche.md")"
  [ -n "${EXTRA:-}" ] && p="$p

$EXTRA"
  for _ in $(seq 1 16); do
    (cd "$dir" && PORT=$((3010+n)) claude -p "$p" --permission-mode acceptEdits --model sonnet \
      --add-dir "$VECINOS/NS_Tokenomics" --add-dir "$VECINOS/NS_platform" --output-format text < /dev/null) > "$LOGS/m-$c.txt" 2>&1
    if tail -5 "$LOGS/m-$c.txt" | grep -qiE "limit|can't reach|ENOTFOUND|overloaded"; then sleep 1800; else break; fi
  done
  num="$(scripts/pr.sh numero "agente/$c")"
  echo "[$(date +%T)] carril $n · $c → PR ${num:-ninguno}" >> "$LOGS/carriles.log"
  [ -n "$num" ] || break
  base="agente/$c"
done
echo "[$(date +%T)] carril $n terminado" >> "$LOGS/carriles.log"
