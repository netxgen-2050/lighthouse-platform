#!/usr/bin/env bash
# Integra uno o más PRs en dev (o en main, para una entrega) con la verificación completa.
# Lo corre Gus o Claude con el OK de Gus; nunca un agente de la noche (el guardia no deja pushear a dev ni a main).
#
# Uso:
#   scripts/integrar.sh <n> [<n>…]            integra los PRs en dev, en ese orden
#   scripts/integrar.sh --a main <n> [<n>…]   integra en main (entrega o arreglo urgente)
#   scripts/integrar.sh --probar <n> …        hace todo menos el push (para revisar antes)
#
# Pasos: copia aparte desde origin/<destino> → merge de cada PR → pnpm verificar, build y e2e
# → push a <destino> → comentario y cierre de cada PR → espera el deploy de Vercel de ese commit.
# Si algo falla, frena antes del push y deja la copia en .carriles/integrar para mirar.
set -euo pipefail

DESTINO="dev"; PROBAR=0; PRS=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --a) DESTINO="${2:?--a necesita una rama}"; shift 2 ;;
    --probar) PROBAR=1; shift ;;
    -h|--help) sed -n '2,13p' "$0"; exit 0 ;;
    *) PRS+=("$1"); shift ;;
  esac
done
[[ ${#PRS[@]} -gt 0 ]] || { sed -n '2,13p' "$0"; exit 1; }
[[ "$DESTINO" == "dev" || "$DESTINO" == "main" ]] || { echo "Destino inválido: $DESTINO" >&2; exit 1; }

RAIZ="$(git rev-parse --show-toplevel)"; cd "$RAIZ"
REPO="$(git remote get-url origin | sed -E 's#^(git@github.com:|https://github.com/)##; s#\.git$##')"
DIR="$RAIZ/.carriles/integrar"
paso() { echo "[$(date +%T)] $*"; }
LOGS="$(mktemp -d)"

git fetch -q --prune origin
git worktree remove --force "$DIR" 2>/dev/null || true
git worktree add -q --detach "$DIR" "origin/$DESTINO"
[[ -f .env.local ]] && cp .env.local "$DIR/"
cd "$DIR"

RAMAS=()
for n in "${PRS[@]}"; do
  read -r estado rama base < <(gh api "repos/$REPO/pulls/$n" -q '"\(.state) \(.head.ref) \(.base.ref)"')
  [[ "$estado" == "open" ]] || { echo "El PR #$n no está abierto ($estado)." >&2; exit 1; }
  paso "PR #$n · $rama (apunta a $base)"
  if ! git merge -q --no-edit "origin/$rama"; then
    echo "Conflicto al integrar #$n en:" >&2; git diff --name-only --diff-filter=U >&2
    echo "La copia queda en $DIR para resolverlo a mano." >&2; exit 1
  fi
  RAMAS+=("$rama")
done

paso "Instalando dependencias"; pnpm install --frozen-lockfile --silent >/dev/null 2>&1
paso "pnpm verificar"; pnpm verificar > $LOGS/verificar.log 2>&1 || { tail -30 $LOGS/verificar.log; exit 1; }
UNIT="$(grep -Eo 'Tests +[0-9]+ passed' $LOGS/verificar.log | tail -1 || true)"
paso "pnpm build"; pnpm build > $LOGS/build.log 2>&1 || { tail -30 $LOGS/build.log; exit 1; }
paso "e2e local"; PORT=3016 pnpm test:e2e > $LOGS/e2e.log 2>&1 || { grep -E "failed|✘" $LOGS/e2e.log | head -20; exit 1; }
E2E="$(grep -Eo '[0-9]+ passed' $LOGS/e2e.log | tail -1 || true)"
paso "Todo en verde: ${UNIT:-unitarios ok} · e2e ${E2E:-ok}"

if [[ $PROBAR -eq 1 ]]; then paso "Modo --probar: no pusheo. La copia queda en $DIR."; exit 0; fi

git fetch -q origin "$DESTINO"
git merge-base --is-ancestor "origin/$DESTINO" HEAD || { echo "$DESTINO avanzó mientras tanto; volvé a correr." >&2; exit 1; }
git push -q origin "HEAD:$DESTINO"
SHA="$(git rev-parse HEAD)"; CORTO="$(git rev-parse --short HEAD)"
paso "Subido a $DESTINO: $CORTO"

for n in "${PRS[@]}"; do
  gh api "repos/$REPO/issues/$n/comments" -X POST \
    -f body="Integrado en \`$DESTINO\` ($CORTO) con \`scripts/integrar.sh\`: verificar (${UNIT:-ok}), build y e2e local (${E2E:-ok})." -q .id >/dev/null
  if [[ "$(gh api "repos/$REPO/pulls/$n" -q .state)" == "open" ]]; then
    gh api "repos/$REPO/pulls/$n" -X PATCH -f state=closed -q .number >/dev/null
  fi
done
paso "PRs comentados y cerrados: ${PRS[*]}"

paso "Esperando el deploy de Vercel de $CORTO"
for ((i = 0; i < 60; i++)); do
  for ID in $(gh api "repos/$REPO/deployments?sha=$SHA&per_page=10" -q '.[].id'); do
    ESTADO="$(gh api "repos/$REPO/deployments/$ID/statuses?per_page=1" -q '.[0] | "\(.state) \(.environment_url // "")"')"
    case "$ESTADO" in
      success*) paso "Deploy listo: ${ESTADO#success }"; cd "$RAIZ"; git worktree remove --force "$DIR"; exit 0 ;;
      failure*|error*) echo "El deploy de Vercel falló para $CORTO." >&2; exit 1 ;;
    esac
  done
  sleep 15
done
echo "El deploy de $CORTO no terminó en 15 minutos; revisalo en Vercel." >&2
exit 1
