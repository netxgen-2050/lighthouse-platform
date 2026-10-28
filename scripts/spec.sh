#!/usr/bin/env bash
# De un pedido a un PR de specs: especificador → arquitecto (si aplica) → validación → PR contra dev
# → preguntas abiertas al issue "Decisiones de Gus". Sirve en la Mac y en la nube.
#
# Uso:
#   scripts/spec.sh <nombre> "<pedido>"                  rama spec/<nombre>, con revisión del arquitecto
#   scripts/spec.sh <nombre> --archivo pedido.md         el pedido en un archivo (para textos largos)
#   scripts/spec.sh <nombre> "<pedido>" --sin-arquitecto  solo pantallas y textos, sin base ni datos
#
# Si la red o la API se cortan, reintenta. No mergea nada: el PR lo aprueba Gus.
set -euo pipefail

NOMBRE="${1:?Uso: scripts/spec.sh <nombre> \"<pedido>\" [--sin-arquitecto]}"; shift
PEDIDO=""; ARQUITECTO=1
while [[ $# -gt 0 ]]; do
  case "$1" in
    --archivo) PEDIDO="$(cat "${2:?--archivo necesita un archivo}")"; shift 2 ;;
    --sin-arquitecto) ARQUITECTO=0; shift ;;
    *) PEDIDO="$1"; shift ;;
  esac
done
[[ -n "$PEDIDO" ]] || { echo "Falta el pedido." >&2; exit 1; }

RAIZ="$(git rev-parse --show-toplevel)"; cd "$RAIZ"
REPO="$(git remote get-url origin | sed -E 's#^(git@github.com:|https://github.com/)##; s#\.git$##')"
DOCS="$(cd "$RAIZ/.." && pwd)/NS_platform"
TOKENOMICS="$(cd "$RAIZ/.." && pwd)/NS_Tokenomics"
RAMA="spec/$NOMBRE"; DIR="$RAIZ/.carriles/spec-$NOMBRE"; LOGS="$(mktemp -d)"
paso() { echo "[$(date +%T)] $*"; }

# Corre un agente; reintenta si se corta la red o se toca el límite de uso.
agente() {
  local nombre="$1" prompt="$2" salida="$3" extra=()
  [[ -d "$DOCS" ]] && extra=(--add-dir "$DOCS")
  [[ -d "$TOKENOMICS" ]] && extra+=(--add-dir "$TOKENOMICS")
  for _ in $(seq 1 8); do
    (cd "$DIR" && claude -p "$prompt" --agent "$nombre" --permission-mode acceptEdits \
        "${extra[@]}" --output-format text < /dev/null) > "$salida" 2>&1 || true
    if tail -n 5 "$salida" | grep -qiE "can't reach the api server|ENOTFOUND|ECONNRESET|ETIMEDOUT|overloaded"; then
      paso "La red o la API no responden; reintento en 5 minutos."; sleep 300
    elif tail -n 5 "$salida" | grep -qiE "usage limit|session limit|hit your limit|rate limit"; then
      paso "Límite de uso; reintento en 30 minutos."; sleep 1800
    else
      return 0
    fi
  done
  echo "El agente $nombre no pudo terminar." >&2; return 1
}

git fetch -q origin dev
git worktree remove --force "$DIR" 2>/dev/null || true
git worktree add -q -B "$RAMA" "$DIR" origin/dev
(cd "$DIR" && pnpm install --frozen-lockfile --silent > /dev/null 2>&1)

paso "Especificador escribiendo la spec"
agente especificador "$PEDIDO

Rutas de la documentación de producto: $DOCS/Documentation (y el tokenomics en $TOKENOMICS, si existe). Escribí los cambios OpenSpec en la rama actual ($RAMA), validá cada uno con 'pnpm exec openspec validate <id> --strict' y hacé commit sin push. Terminá con un resumen corto y, al final, una sección que empiece exactamente con '**Preguntas abiertas**'." "$LOGS/especificador.txt"

if [[ $ARQUITECTO -eq 1 ]]; then
  paso "Arquitecto revisando"
  agente arquitecto "Revisá los cambios OpenSpec nuevos de la rama actual respecto de origin/dev (git diff origin/dev --stat). Seguí tus instrucciones y las skills que apliquen. Si hace falta un ADR, escribilo en Propuesta. Corregí si hace falta, validá con 'pnpm exec openspec validate <id> --strict' y hacé commit sin push. Terminá con tu veredicto por cambio y, al final, una sección que empiece exactamente con '**Preguntas para Gus**'." "$LOGS/arquitecto.txt"
fi

cd "$DIR"
[[ -z "$(git status --porcelain)" ]] || { git add -A && git commit -q -m "Cambios pendientes de los agentes de spec ($NOMBRE)"; }
[[ -n "$(git log --oneline origin/dev..HEAD)" ]] || { echo "Los agentes no dejaron commits." >&2; cat "$LOGS/especificador.txt" >&2; exit 1; }

paso "Validando"
for c in $(git diff --name-only origin/dev..HEAD -- openspec/changes | cut -d/ -f3 | sort -u); do
  [[ -d "openspec/changes/$c" ]] && pnpm exec openspec validate "$c" --strict
done

git push -q -u origin "$RAMA"
preguntas() { awk -v t="$2" 'index($0, t) { p = 1 } p' "$1"; }
CUERPO="**Pedido**
$PEDIDO

**Especificador**
$(cat "$LOGS/especificador.txt")"
[[ $ARQUITECTO -eq 1 ]] && CUERPO="$CUERPO

**Arquitecto**
$(cat "$LOGS/arquitecto.txt")"
CUERPO="${CUERPO:0:60000}

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
PR="$(scripts/pr.sh crear dev "Specs: $NOMBRE" "$CUERPO")"
paso "PR: $PR"

DECISIONES="$(gh api "repos/$REPO/issues?labels=decisiones&state=open" -q '.[0].number // empty')"
P1="$(preguntas "$LOGS/especificador.txt" '**Preguntas abiertas**')"
P2="$([[ $ARQUITECTO -eq 1 ]] && preguntas "$LOGS/arquitecto.txt" '**Preguntas para Gus**' || true)"
if [[ -n "$DECISIONES" && -n "$P1$P2" ]]; then
  gh api "repos/$REPO/issues/$DECISIONES/comments" -X POST -f body="### ${PR%% *} · Specs: $NOMBRE
$P1

$P2" -q .html_url >/dev/null
  paso "Preguntas anotadas en el issue #$DECISIONES"
fi
cd "$RAIZ" && git worktree remove --force "$DIR"
