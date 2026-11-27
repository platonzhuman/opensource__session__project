#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

PORT=8010

MKDOCS="mkdocs"
if [ -x .venv/bin/mkdocs ]; then
  MKDOCS=".venv/bin/mkdocs"
fi

# Если порт занят прошлым `mkdocs serve` — останавливаем его.
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti tcp:"$PORT" || true)
  for pid in $PIDS; do
    if ps -p "$pid" -o args= | grep -q "mkdocs"; then
      echo "Порт $PORT занят прошлым mkdocs serve (pid $pid). Останавливаю..."
      kill "$pid" 2>/dev/null || true
      sleep 1
    fi
  done
  if lsof -ti tcp:"$PORT" >/dev/null 2>&1; then
    echo "Порт $PORT всё ещё занят другим процессом:"
    lsof -i tcp:"$PORT" || true
    echo "Освободи порт или поменяй PORT в serve.sh."
    exit 1
  fi
fi

exec "$MKDOCS" serve --dev-addr 0.0.0.0:"$PORT"
