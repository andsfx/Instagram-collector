#!/usr/bin/env bash
# Instagram daily dashboard — deterministic cron entry (no LLM).
set -o pipefail
REPO="/home/ubuntu/Instagram-collector"
LOG_FILE="/tmp/ig-daily-dashboard.log"
ENV_FILE="$REPO/.env.daily-dashboard"

cd "$REPO" || exit 1

# Prefer system python3 (scrapling lives there; Hermes venv lacks it)
export PATH="/usr/bin:/bin:/usr/local/bin:$PATH"
hash -r 2>/dev/null || true

# Load secrets without printing them
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

: > "$LOG_FILE"
node "$REPO/scripts/run/run-daily-dashboard.js" >"$LOG_FILE" 2>&1
code=$?
echo "__EXIT_CODE__=$code"
# Report summary only (last 160 lines of pipeline log)
tail -n 160 "$LOG_FILE"
exit $code
