#!/usr/bin/env bash
# Mergea PRs en dev sin esperar a Gus, según los niveles que Gus aprobó el 2-nov-2026 (docs/agentes.md).
# Lo corre Gus o Claude; nunca un agente de la noche (el guardia lo bloquea, igual que integrar.sh).
#
# Uso:
#   scripts/mergear.sh --nivel orden <n> [<n>…]        archivo de specs, conflictos, números de ADR, gitignore
#   scripts/mergear.sh --nivel spec <n> [<n>…]         specs que Gus aprobó (contestó en el #79 o dejó "ok")
#   scripts/mergear.sh --nivel integracion <n> [<n>…]  PRs de integración de scripts/integrar.sh
#
# Para cada PR: tiene que apuntar a dev, estar abierto, sin conflictos y con todos los checks
# en verde salvo Vercel (no despliega por el pago desde el 16-oct). Mergea con el bypass de Gus,
# comenta el nivel y, en las integraciones, borra el entorno de Railway pr-<n>.
# Nunca mergea a main: la entrega a main la pasa Gus.
set -euo pipefail

NIVEL=""; PRS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --nivel) NIVEL="${2:-}"; shift 2 ;;
    -h|--help) sed -n '2,14p' "$0"; exit 0 ;;
    *) PRS+=("$1"); shift ;;
  esac
done
[[ "$NIVEL" =~ ^(orden|spec|integracion)$ && ${#PRS[@]} -gt 0 ]] || { sed -n '2,14p' "$0"; exit 1; }

paso() { echo "[$(date +%T)] $*"; }
for n in "${PRS[@]}"; do
  read -r base estado mergeable < <(gh pr view "$n" --json baseRefName,state,mergeable -q '"\(.baseRefName) \(.state) \(.mergeable)"')
  [[ "$base" == "dev" ]] || { paso "#$n apunta a $base, no a dev: no lo mergeo."; exit 1; }
  [[ "$estado" == "OPEN" ]] || { paso "#$n no está abierto ($estado)."; exit 1; }
  [[ "$mergeable" == "MERGEABLE" ]] || { paso "#$n tiene conflictos o GitHub todavía lo calcula ($mergeable)."; exit 1; }
  rojos="$(gh pr view "$n" --json statusCheckRollup -q '.statusCheckRollup[]
    | select((.context // .name) != "Vercel")
    | select(((.conclusion // .state) | ascii_upcase) as $s | ["SUCCESS","NEUTRAL","SKIPPED"] | index($s) | not)
    | (.context // .name)')"
  [[ -z "$rojos" ]] || { paso "#$n tiene checks sin pasar: $rojos"; exit 1; }
  gh pr merge "$n" --merge --admin
  gh pr comment "$n" -b "Mergeado por Claude (nivel **$NIVEL**, con el OK de Gus del 2-nov-2026; ver \`docs/agentes.md\`)." >/dev/null
  if [[ "$NIVEL" == "integracion" ]] && command -v railway >/dev/null; then
    railway environment delete "pr-$n" --yes >/dev/null 2>&1 && paso "Entorno de Railway pr-$n borrado." || true
  fi
  paso "#$n mergeado en dev."
done
