#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${PREVIEW_URL:-}" ]]; then
  echo "ERROR: PREVIEW_URL is not set (e.g. 6001....worf.replit.dev:3000)"; exit 1
fi

echo "→ Checking UI root"
curl -sSIL "https://${PREVIEW_URL}/" | sed -n '1,3p'

echo "→ Checking API via proxy (/api/healthz)"
curl -sS "https://${PREVIEW_URL}/api/healthz" | jq .

echo "→ Checking aggregated status (/api/status)"
curl -sS "https://${PREVIEW_URL}/api/status" | jq .