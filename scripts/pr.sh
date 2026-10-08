#!/usr/bin/env bash
# PRs por la API REST de GitHub (la nube de Claude Code bloquea GraphQL, que usa `gh pr …`).
# Funciona igual en la Mac y en la nube. No ofrece merge: solo Gus mergea.
#
# Uso:
#   scripts/pr.sh crear <base> "<título>" "<descripción>"   (head = rama actual; imprime número y URL)
#   scripts/pr.sh numero <rama>                              (número del PR abierto de esa rama, vacío si no hay)
#   scripts/pr.sh ver <n>                                    (título, estado, base, head, descripción)
#   scripts/pr.sh diff <n>
#   scripts/pr.sh comentarios <n>
#   scripts/pr.sh comentar <n> "<texto>"
#   scripts/pr.sh editar <n> "<descripción nueva>"
#   scripts/pr.sh listar                                     (PRs abiertos)
set -euo pipefail

remoto="$(git remote get-url origin)"
REPO="$(sed -E 's#^(git@github.com:|https://github.com/)##; s#\.git$##' <<< "$remoto")"
OWNER="${REPO%%/*}"

cmd="${1:-}"; shift || true
case "$cmd" in
  crear)
    base="${1:?base}"; titulo="${2:?título}"; cuerpo="${3:-}"
    rama="$(git rev-parse --abbrev-ref HEAD)"
    gh api "repos/$REPO/pulls" -X POST -f title="$titulo" -f head="$rama" -f base="$base" -f body="$cuerpo" \
      -q '"#\(.number) \(.html_url)"'
    ;;
  numero)
    rama="${1:?rama}"
    gh api "repos/$REPO/pulls?head=$OWNER:$rama&state=open" -q '.[0].number // empty'
    ;;
  ver)
    gh api "repos/$REPO/pulls/${1:?n}" -q '"#\(.number) \(.title)\nestado: \(.state)\(if .merged_at then " (mergeado)" else "" end)\nbase: \(.base.ref) ← head: \(.head.ref)\n\(.html_url)\n\n\(.body // "")"'
    ;;
  diff)
    gh api "repos/$REPO/pulls/${1:?n}" -H "Accept: application/vnd.github.diff"
    ;;
  comentarios)
    gh api "repos/$REPO/issues/${1:?n}/comments?per_page=100" -q '.[] | "--- \(.user.login) · \(.created_at)\n\(.body)\n"'
    ;;
  comentar)
    gh api "repos/$REPO/issues/${1:?n}/comments" -X POST -f body="${2:?texto}" -q '.html_url'
    ;;
  editar)
    gh api "repos/$REPO/pulls/${1:?n}" -X PATCH -f body="${2:?descripción}" -q '.html_url'
    ;;
  listar)
    gh api "repos/$REPO/pulls?state=open&per_page=50" -q '.[] | "#\(.number) \(.head.ref) → \(.base.ref) · \(.title)"'
    ;;
  *)
    sed -n '2,15p' "$0"; exit 1 ;;
esac
