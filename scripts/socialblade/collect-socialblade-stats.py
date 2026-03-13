from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


def parse_number(value: str | None):
    if value is None:
        return None
    text = str(value).strip().replace(',', '').replace('.', '', 0)
    try:
        return int(text)
    except ValueError:
        return None


def extract_stat(html: str, label: str):
    patterns = [
        rf'{label}</span>\s*<span[^>]*>([^<]+)</span>',
        rf'{label}</div>\s*<div[^>]*>([^<]+)</div>',
        rf'{label}[^\d]*([\d,]+)'
    ]
    for pat in patterns:
        m = re.search(pat, html, re.I)
        if m:
            raw = m.group(1).strip()
            num = parse_number(raw)
            if num is not None:
                return num
    return None


def main():
    if len(sys.argv) < 2:
        print('Usage: python scripts/socialblade/collect-socialblade-stats.py <username>', file=sys.stderr)
        raise SystemExit(1)

    username = sys.argv[1]
    repo_root = Path(__file__).resolve().parents[2]
    out_dir = repo_root / 'data' / 'raw' / 'stats'
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f'{username}-stats.json'

    try:
        from scrapling import Fetcher
    except Exception as exc:
        result = {
            'date': datetime.now(timezone.utc).date().isoformat(),
            'username': username,
            'followers': None,
            'following': None,
            'posts_count': None,
            'source': 'socialblade',
            'ok': False,
            'warnings': [f'Scrapling import failed: {exc}']
        }
        out_path.write_text(json.dumps(result, indent=2), encoding='utf-8')
        print(json.dumps(result, indent=2))
        raise SystemExit(2)

    url = f'https://socialblade.com/instagram/user/{username}'
    warnings = []
    try:
        fetcher = Fetcher(auto_match=False)
        response = fetcher.get(url)
        html = response.html if hasattr(response, 'html') else str(response)
    except Exception as exc:
        result = {
            'date': datetime.now(timezone.utc).date().isoformat(),
            'username': username,
            'followers': None,
            'following': None,
            'posts_count': None,
            'source': 'socialblade',
            'ok': False,
            'warnings': [f'Fetch failed: {exc}']
        }
        out_path.write_text(json.dumps(result, indent=2), encoding='utf-8')
        print(json.dumps(result, indent=2))
        raise SystemExit(2)

    followers = extract_stat(html, 'Followers')
    following = extract_stat(html, 'Following')
    posts_count = extract_stat(html, 'Posts')

    if followers is None:
        warnings.append('followers not confidently extracted')
    if following is None:
        warnings.append('following not confidently extracted')
    if posts_count is None:
        warnings.append('posts_count not confidently extracted')

    result = {
        'date': datetime.now(timezone.utc).date().isoformat(),
        'username': username,
        'followers': followers,
        'following': following,
        'posts_count': posts_count,
        'source': 'socialblade',
        'ok': True,
        'warnings': warnings,
        'url': url,
    }
    out_path.write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
