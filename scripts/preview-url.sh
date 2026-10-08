#!/usr/bin/env bash
# Espera a que Vercel publique el preview de una rama y devuelve su URL.
# Uso: scripts/preview-url.sh <rama> [minutos-de-espera, por defecto 15]
set -euo pipefail

RAMA="${1:?Uso: scripts/preview-url.sh <rama> [minutos]}"
MINUTOS="${2:-15}"
REPO="$(git remote get-url origin | sed -E 's#^(git@github.com:|https://github.com/)##; s#\.git$##')"

git fetch -q origin "$RAMA"
SHA="$(git rev-parse "origin/$RAMA")"

for ((i = 0; i < MINUTOS * 4; i++)); do
  # Vercel registra cada deploy como un "deployment" de GitHub sobre el commit.
  for ID in $(gh api "repos/$REPO/deployments?sha=$SHA&per_page=10" -q '.[].id'); do
    ESTADO="$(gh api "repos/$REPO/deployments/$ID/statuses?per_page=1" -q '.[0] | "\(.state) \(.environment_url // "")"')"
    case "$ESTADO" in
      success\ http*) echo "${ESTADO#success }"; exit 0 ;;
      failure* | error*) echo "El deploy de Vercel falló para $SHA" >&2; exit 1 ;;
    esac
  done
  sleep 15
done

echo "No apareció el preview de $RAMA ($SHA) en $MINUTOS minutos. ¿Está conectado el repo a Vercel?" >&2
exit 1
