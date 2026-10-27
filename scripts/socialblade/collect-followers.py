#!/usr/bin/env python3
"""Collect Instagram follower stats with a fallback chain.

1. SocialBlade scraper (existing script) — free but currently blocked by
   Cloudflare for datacenter IPs.
2. Composio -> ScrapeCreators Instagram profile (paid, ~$0.001/profile) via the
   Composio MCP endpoint, using MCP_COMPOSIO_API_KEY from ~/.hermes/.env.

Writes data/raw/stats/<username>-stats.json in the schema the rest of the
pipeline expects (followers, following, posts_count, ok, warnings, source).
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = REPO_ROOT / 'data' / 'raw' / 'stats'
MCP_URL = 'https://connect.composio.dev/mcp'


def log(msg: str) -> None:
    print(f'[followers] {msg}', file=sys.stderr)


def load_composio_key() -> str | None:
    key = os.environ.get('MCP_COMPOSIO_API_KEY')
    if key:
        return key
    env_path = Path.home() / '.hermes' / '.env'
    if not env_path.exists():
        return None
    for line in env_path.read_text(encoding='utf-8', errors='ignore').splitlines():
        m = re.match(r'^\s*MCP_COMPOSIO_API_KEY\s*=\s*(.+?)\s*$', line)
        if m:
            return m.group(1).strip().strip('"').strip("'")
    return None


def mcp_post(payload: dict, key: str, sid: str | None = None, timeout: int = 90):
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


def fetch_composio(username: str) -> dict | None:
    key = load_composio_key()
    if not key:
        log('MCP_COMPOSIO_API_KEY missing')
        return None
    try:
        _, sid = mcp_post({'jsonrpc': '2.0', 'id': 1, 'method': 'initialize',
                           'params': {'protocolVersion': '2024-11-05', 'capabilities': {},
                                      'clientInfo': {'name': 'hermes-cron', 'version': '1.0'}}}, key)
        mcp_post({'jsonrpc': '2.0', 'method': 'notifications/initialized'}, key, sid, timeout=30)
        events, _ = mcp_post({'jsonrpc': '2.0', 'id': 2, 'method': 'tools/call',
                              'params': {'name': 'COMPOSIO_MULTI_EXECUTE_TOOL',
                                         'arguments': {
                                             'tools': [{
                                                 'tool_slug': 'SCRAPECREATORS_GET_INSTAGRAM_PROFILE',
                                                 'arguments': {'handle': username, 'trim': True}}],
                                             'sync_response_to_workbench': False,
                                             'thought': 'daily follower count'}}}, key, sid)
    except Exception as exc:  # network/parse failures must not kill the pipeline
        log(f'composio call failed for {username}: {exc}')
        return None

    for event in events:
        if 'error' in event:
            log(f'composio error for {username}: {json.dumps(event["error"])[:300]}')
            continue
        for content in (event.get('result') or {}).get('content') or []:
            text = content.get('text') or ''
            m = re.search(r'"follower_count"\s*:\s*(\d+)', text)
            if not m:
                continue
            followers = int(m.group(1))
            following = re.search(r'"following_count"\s*:\s*(\d+)', text)
            posts = re.search(r'"timeline_media_count"\s*:\s*(\d+)', text)
            return {
                'followers': followers,
                'following': int(following.group(1)) if following else None,
                'posts_count': int(posts.group(1)) if posts else None,
            }
    return None


def run_socialblade(username: str) -> dict | None:
    script = REPO_ROOT / 'scripts' / 'socialblade' / 'collect-socialblade-stats.py'
    try:
        out = subprocess.run([sys.executable, str(script), username],
                             capture_output=True, text=True, timeout=180, cwd=str(REPO_ROOT))
    except Exception as exc:
        log(f'socialblade run failed for {username}: {exc}')
        return None
    try:
        return json.loads(out.stdout)
    except json.JSONDecodeError:
        return None


def main() -> int:
    if len(sys.argv) < 2:
        print('Usage: collect-followers.py <username>', file=sys.stderr)
        return 1
    username = sys.argv[1]
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / f'{username}-stats.json'

    sb = run_socialblade(username)
    if sb and isinstance(sb.get('followers'), int) and sb['followers'] > 0:
        out_path.write_text(json.dumps(sb, indent=2), encoding='utf-8')
        print(json.dumps(sb, indent=2))
        return 0

    log(f'socialblade gave no followers for {username}; trying composio')
    data = fetch_composio(username)
    if data and data.get('followers'):
        payload = {
            'date': datetime.now(timezone.utc).date().isoformat(),
            'username': username,
            'followers': data['followers'],
            'following': data['following'],
            'posts_count': data['posts_count'],
            'source': 'composio-scrapecreators',
            'ok': True,
            'warnings': [],
            'url': f'https://www.instagram.com/{username}/',
        }
        out_path.write_text(json.dumps(payload, indent=2), encoding='utf-8')
        print(json.dumps(payload, indent=2))
        return 0

    # Both sources failed: keep SocialBlade's null file so the caller still sees why.
    payload = sb or {
        'date': datetime.now(timezone.utc).date().isoformat(),
        'username': username,
        'followers': None,
        'following': None,
        'posts_count': None,
        'source': 'none',
        'ok': False,
        'warnings': ['socialblade blocked and composio fallback failed'],
    }
    out_path.write_text(json.dumps(payload, indent=2), encoding='utf-8')
    print(json.dumps(payload, indent=2))
    return 2


if __name__ == '__main__':
    raise SystemExit(main())
