#!/usr/bin/env bash
# SessionStart: en las sesiones de la nube (Claude Code en la web y rutinas) instala dependencias.
# En la Mac no hace nada.
set -euo pipefail
if [[ "${CLAUDE_CODE_REMOTE:-}" != "true" ]]; then
  exit 0
fi
cd "${CLAUDE_PROJECT_DIR:-.}"
pnpm install --frozen-lockfile --prefer-offline > /dev/null 2>&1 || pnpm install --frozen-lockfile
echo "Dependencias instaladas (nube)."
