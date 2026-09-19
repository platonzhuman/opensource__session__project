#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
exec mkdocs serve --dev-addr 127.0.0.1:8000
