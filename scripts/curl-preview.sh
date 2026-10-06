#!/usr/bin/env bash
# curl contra un preview protegido de Vercel, sin mostrar el secreto.
# Uso: scripts/curl-preview.sh <url> [opciones extra de curl]
set -euo pipefail
URL="${1:?Uso: scripts/curl-preview.sh <url> [opciones de curl]}"
shift
CABECERAS=()
if [[ -n "${VERCEL_AUTOMATION_BYPASS_SECRET:-}" ]]; then
  CABECERAS=(-H "x-vercel-protection-bypass: $VERCEL_AUTOMATION_BYPASS_SECRET")
fi
exec curl -sS -L "${CABECERAS[@]}" "$@" "$URL"
