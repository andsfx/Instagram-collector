#!/usr/bin/env python3
"""Collect daily Instagram insights (new followers + reach) for the accounts that
are connected to the Composio Instagram toolkit.

Writes/merges data/insights/history.json:
  { "YYYY-MM-DD": { "<username>": { "new_followers": N, "reach": N } } }

The dashboard builder merges these keys into the matching history rows. Only
accounts in META_ACCOUNTS are queried; the rest have no Graph access.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_PATH = REPO_ROOT / 'data' / 'insights' / 'history.json'
MCP_URL = 'https://connect.composio.dev/mcp'
MCP_TOOL = 'COMPOSIO_MULTI_EXECUTE_TOOL'

META_ACCOUNTS = {
    'metmalbekasi': 'metmal',
    'grandmetropolitan': 'grandmet',
}
METRICS = ['follower_count', 'reach']


def log(msg: str) -> None:
    print(f'[insights] {msg}', file=sys.stderr)


def load_key() -> str | None:
    key = os.environ.get('MCP_COMPOSIO_API_KEY')
    if key:
        return key.strip()
    env_path = Path.home() / '.hermes' / '.env'
    if not env_path.exists():
        return None
    for line in env_path.read_text(encoding='utf-8', errors='ignore').splitlines():
        m = re.match(r'^\s*MCP_COMPOSIO_API_KEY\s*=\s*(.+?)\s*$', line)
        if m:
            return m.group(1).strip().strip('"').strip("'")
    return None


def mcp_post(payload: dict, key: str, sid: str | None = None, timeout: int = 120):
    req = urllib.request.Request(MCP_URL, data=json.dumps(payload).encode(), method='POST')
    req.add_header('Authorization', f'Bearer {key}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Accept', 'application/json, text/event-stream')
    if sid:
        req.add_header('Mcp-Session-Id', sid)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        sid = resp.headers.get('Mcp-Session-Id') or sid
        body = resp.read().decode()
    events = []
    for line in body.splitlines():
        if line.startswith('data: '):
            try:
                events.append(json.loads(line[6:]))
            except json.JSONDecodeError:
                continue
    return events, sid


def fetch_account(key: str, alias: str, since: str, until: str) -> dict[str, dict]:
    _, sid = mcp_post({'jsonrpc': '2.0', 'id': 1, 'method': 'initialize',
                       'params': {'protocolVersion': '2024-11-05', 'capabilities': {},
                                  'clientInfo': {'name': 'hermes-cron', 'version': '1.0'}}}, key)
    mcp_post({'jsonrpc': '2.0', 'method': 'notifications/initialized'}, key, sid, timeout=30)
    events, _ = mcp_post({'jsonrpc': '2.0', 'id': 2, 'method': 'tools/call',
                          'params': {'name': MCP_TOOL,
                                     'arguments': {
                                         'tools': [{
                                             'tool_slug': 'INSTAGRAM_GET_USER_INSIGHTS',
                                             'account': alias,
                                             'arguments': {
                                                 'ig_user_id': 'me',
                                                 'metric': METRICS,
                                                 'metric_type': 'time_series',
                                                 'period': 'day',
                                                 'since': since,
                                                 'until': until}}],
                                         'sync_response_to_workbench': False,
                                         'thought': 'daily reach + new followers'}}}, key, sid)

    out: dict[str, dict] = {}
    for event in events:
        if 'error' in event:
            log(f'mcp error for {alias}: {json.dumps(event["error"])[:200]}')
            continue
        for content in (event.get('result') or {}).get('content') or []:
            text = content.get('text') or ''
            try:
                payload = json.loads(text)
            except json.JSONDecodeError:
                continue
            rows = None
            inner = payload.get('data') if isinstance(payload, dict) else None
            if isinstance(inner, dict):
                # COMPOSIO_MULTI_EXECUTE_TOOL wraps each tool: data.results[].response.data.data
                for result in inner.get('results') or []:
                    block = ((result or {}).get('response') or {}).get('data') or {}
                    if isinstance(block.get('data'), list):
                        rows = block['data']
                        break
                if rows is None and isinstance(inner.get('data'), list):
                    rows = inner['data']
            if not isinstance(rows, list):
                continue
            for metric in rows:
                name = metric.get('name')
                key_name = {'follower_count': 'new_followers', 'reach': 'reach'}.get(name or '')
                if not key_name:
                    continue
                for point in metric.get('values') or []:
                    end = point.get('end_time') or ''
                    day = end[:10]
                    value = point.get('value')
                    if not day or not isinstance(value, int):
                        continue
                    out.setdefault(day, {})[key_name] = value
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--days', type=int, default=7)
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()

    key = load_key()
    if not key:
        log('MCP_COMPOSIO_API_KEY missing; nothing to do')
        return 0

    today = datetime.now(timezone.utc).date()
    since = (today - timedelta(days=args.days)).isoformat()
    until = today.isoformat()

    merged: dict[str, dict] = {}
    if OUT_PATH.exists():
        try:
            merged = json.loads(OUT_PATH.read_text(encoding='utf-8'))
        except Exception:
            merged = {}

    for username, alias in META_ACCOUNTS.items():
        try:
            data = fetch_account(key, alias, since, until)
        except Exception as exc:
            log(f'failed for {username} ({alias}): {exc}')
            continue
        days = 0
        for day, values in data.items():
            merged.setdefault(day, {})[username] = values
            days += 1
        log(f'{username}: {days} days')

    if args.dry_run:
        print(json.dumps(merged, indent=2, sort_keys=True)[:1500])
        return 0

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(merged, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    log(f'wrote {OUT_PATH} ({len(merged)} days)')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
