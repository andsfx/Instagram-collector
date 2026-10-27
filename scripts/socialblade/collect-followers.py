#!/usr/bin/env python3
"""Collect Instagram follower stats with a fallback chain.

1. SocialBlade scraper (existing script) — free, but blocked by Cloudflare for
   datacenter IPs since 2026-10-27.
2. ScrapeCreators public Instagram profile API — paid (~$0.001/profile), called
   directly over REST with SCRAPECREATORS_API_KEY. No Composio hop.

Writes data/raw/stats/<username>-stats.json in the schema the rest of the
pipeline expects (followers, following, posts_count, ok, warnings, source).
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = REPO_ROOT / 'data' / 'raw' / 'stats'
SC_ENDPOINT = 'https://api.scrapecreators.com/v1/instagram/profile'
KEY_NAMES = ('SCRAPECREATORS_API_KEY', 'SCRAPECREATORS_KEY', 'SCRAPECREATORS_API_TOKEN')


def log(msg: str) -> None:
    print(f'[followers] {msg}', file=sys.stderr)


def load_key() -> str | None:
    for name in KEY_NAMES:
        value = os.environ.get(name)
        if value:
            return value.strip()
    env_files = (REPO_ROOT / '.env.daily-dashboard', REPO_ROOT / '.env',
                 Path.home() / '.hermes' / '.env')
    pattern = re.compile(r'^\s*(' + '|'.join(KEY_NAMES) + r')\s*=\s*(.+?)\s*$')
    for env_path in env_files:
        if not env_path.exists():
            continue
        for line in env_path.read_text(encoding='utf-8', errors='ignore').splitlines():
            m = pattern.match(line)
            if m:
                return m.group(2).strip().strip('"').strip("'")
    return None


def fetch_scrapecreators(username: str) -> dict | None:
    key = load_key()
    if not key:
        log('SCRAPECREATORS_API_KEY missing')
        return None
    query = urllib.parse.urlencode({'handle': username, 'trim': 'true'})
    req = urllib.request.Request(f'{SC_ENDPOINT}?{query}')
    req.add_header('x-api-key', key)
    req.add_header('Accept', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = json.loads(resp.read().decode())
    except urllib.error.HTTPError as exc:
        detail = exc.read()[:200].decode(errors='replace')
        log(f'scrapecreators HTTP {exc.code} for {username}: {detail}')
        return None
    except Exception as exc:
        log(f'scrapecreators call failed for {username}: {exc}')
        return None

    user = (body.get('data') or {}).get('user') if isinstance(body, dict) else None
    if not user:
        log(f'scrapecreators empty payload for {username}')
        return None

    # API langsung mengembalikan bentuk GraphQL mentah (edge_followed_by.count);
    # Composio mengembalikan versi yang sudah dinormalkan (follower_count).
    def pick(*paths):
        for path in paths:
            node = user
            for part in path.split('.'):
                if not isinstance(node, dict):
                    node = None
                    break
                node = node.get(part)
            if isinstance(node, int):
                return node
        return None

    followers = pick('follower_count', 'edge_followed_by.count')
    if not isinstance(followers, int) or followers <= 0:
        log(f'scrapecreators returned no follower_count for {username}')
        return None

    return {
        'followers': followers,
        'following': pick('following_count', 'edge_follow.count'),
        'posts_count': pick('timeline_media_count', 'media_count',
                            'edge_owner_to_timeline_media.count'),
    }


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
    today = datetime.now(timezone.utc).date().isoformat()

    # Baca stats bagus yang sudah ada SEBELUM collector SocialBlade jalan, karena
    # script itu menulis out_path sendiri (termasuk saat hasilnya null).
    existing = None
    if out_path.exists():
        try:
            existing = json.loads(out_path.read_text(encoding='utf-8'))
        except Exception:
            existing = None
    good_existing = (existing and existing.get('date') == today
                     and isinstance(existing.get('followers'), int) and existing['followers'] > 0)

    sb = run_socialblade(username)
    if sb and isinstance(sb.get('followers'), int) and sb['followers'] > 0:
        out_path.write_text(json.dumps(sb, indent=2), encoding='utf-8')
        print(json.dumps(sb, indent=2))
        return 0

    log(f'socialblade gave no followers for {username}; trying scrapecreators')
    data = fetch_scrapecreators(username)
    if data and data.get('followers'):
        payload = {
            'date': datetime.now(timezone.utc).date().isoformat(),
            'username': username,
            'followers': data['followers'],
            'following': data['following'],
            'posts_count': data['posts_count'],
            'source': 'scrapecreators',
            'ok': True,
            'warnings': [],
            'url': f'https://www.instagram.com/{username}/',
        }
        out_path.write_text(json.dumps(payload, indent=2), encoding='utf-8')
        print(json.dumps(payload, indent=2))
        return 0

    # Both sources failed. Jangan timpa angka bagus yang sudah didapat hari ini
    # (misal run pagi sukses, run siang kena blokir).
    if good_existing:
        prev_followers = (existing or {}).get('followers')
        log(f'keeping existing good stats for {username} ({prev_followers} followers)')
        out_path.write_text(json.dumps(existing, indent=2), encoding='utf-8')
        print(json.dumps(existing, indent=2))
        return 0

    payload = sb or {
        'date': today,
        'username': username,
        'followers': None,
        'following': None,
        'posts_count': None,
        'source': 'none',
        'ok': False,
        'warnings': ['socialblade blocked and scrapecreators fallback failed'],
    }
    out_path.write_text(json.dumps(payload, indent=2), encoding='utf-8')
    print(json.dumps(payload, indent=2))
    return 2


if __name__ == '__main__':
    raise SystemExit(main())
