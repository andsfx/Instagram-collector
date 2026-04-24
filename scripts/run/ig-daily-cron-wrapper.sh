#!/usr/bin/env bash
set -o pipefail
LOG_FILE="/tmp/ig-daily-dashboard.log"
: > "$LOG_FILE"
node /root/Instagram-collector/scripts/run/run-daily-dashboard.js >"$LOG_FILE" 2>&1
code=$?
echo "__EXIT_CODE__=$code"
tail -n 160 "$LOG_FILE"
exit $code
