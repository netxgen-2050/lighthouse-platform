#!/usr/bin/env bash
# Integra uno o más PRs en dev (o en main, para una entrega) con la verificación completa.
# Lo corre Gus o Claude con el OK de Gus; nunca un agente de la noche (el guardia no deja pushear a dev ni a main).
#
# Uso:
#   scripts/integrar.sh <n> [<n>…]            integra los PRs en dev, en ese orden
#   scripts/integrar.sh --a main <n> [<n>…]   integra en main (entrega o arreglo urgente)
#   scripts/integrar.sh --probar <n> …        hace todo menos subir la rama y abrir el PR
#
# Pasos: copia aparte desde origin/<destino> → merge de cada PR → pnpm verificar, build y e2e
# → rama integracion/<fecha> y PR contra <destino> (dev y main solo aceptan PRs) → comentario en cada PR
# → entorno de Railway pr-<n> con su link en el PR, para probarlo antes de mergear.
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
    # La lista de textos para revisión nativa se genera sola: si es el único choque, se regenera.
    if [[ "$(git diff --name-only --diff-filter=U)" == "docs/idioma/revisar-nativo.md" ]]; then
      git checkout -q --theirs docs/idioma/revisar-nativo.md
      pnpm install --frozen-lockfile --silent >/dev/null 2>&1; pnpm idioma:pendientes >/dev/null 2>&1
      git add -A && git commit -q --no-edit
      paso "PR #$n: la lista de revisión nativa chocó y se regeneró"
    else
      echo "Conflicto al integrar #$n en:" >&2; git diff --name-only --diff-filter=U >&2
      echo "La copia queda en $DIR para resolverlo a mano." >&2; exit 1
    fi
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

# Desde el 23-oct, dev y main solo aceptan cambios por PR (regla de GitHub): la integración se sube
# como rama propia y se abre un PR que mergea Gus.
FECHA="$(date +%F-%H%M)"; RAMA_INT="integracion/$FECHA"
git switch -q -c "$RAMA_INT"
git push -q -u origin "$RAMA_INT"
LISTA="$(printf '#%s, ' "${PRS[@]}")"; LISTA="${LISTA%, }"
PR_INT="$(scripts/pr.sh crear "$DESTINO" "Integración en $DESTINO: $LISTA" "Integra en \`$DESTINO\` los PRs $LISTA con \`scripts/integrar.sh\`.

**Verificación local:** \`pnpm verificar\` (${UNIT:-ok}), \`pnpm build\` y e2e (${E2E:-ok}) en verde.

Al mergear este PR se pueden cerrar $LISTA.

🤖 Generated with [Claude Code](https://claude.com/claude-code)")"
paso "PR de integración: $PR_INT"
for n in "${PRS[@]}"; do
  gh api "repos/$REPO/issues/$n/comments" -X POST -f body="Incluido en el PR de integración ${PR_INT%% *} (verificado en local: ${UNIT:-ok}, e2e ${E2E:-ok})." -q .id >/dev/null
done
# Un link para probar el PR antes de mergear: un entorno propio en Railway (copia de "production", con el modo de prueba),
# mientras Vercel no despliega. Si falta la CLI de Railway o el proyecto no está enlazado, se avisa y se sigue.
NUM="${PR_INT%% *}"; NUM="${NUM#\#}"
if command -v railway >/dev/null && railway status >/dev/null 2>&1; then
  ENTORNO="pr-$NUM"
  railway environment new "$ENTORNO" --duplicate production >/dev/null 2>&1 || true
  railway environment "$ENTORNO" >/dev/null 2>&1 && railway service lighthouse-dev >/dev/null 2>&1
  railway up --detach >/dev/null 2>&1
  URL="$(railway domain 2>/dev/null | grep -Eo 'https://[^ ]+' | head -1)"
  if [[ -n "$URL" ]]; then
    scripts/pr.sh comentar "$NUM" "🔎 **Probalo antes de mergear:** $URL (Entrar como… → super@prueba.test, admin@prueba.test o persona@prueba.test). Datos de ejemplo; el entorno se borra después del merge." >/dev/null
    paso "Link para probar: $URL"
  fi
  railway environment production >/dev/null 2>&1 || true
else
  paso "Sin Railway enlazado: no hay link de prueba para este PR."
fi
cd "$RAIZ"; git worktree remove --force "$DIR"
paso "Listo: falta que Gus mergee #$NUM."
