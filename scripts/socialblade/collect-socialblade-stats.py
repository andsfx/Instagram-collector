from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


def parse_number(value):
    if value is None:
        return None
    text = str(value).strip().replace(',', '')
    try:
        return int(float(text))
    except ValueError:
        return None


def extract_from_embedded_json(html: str):
    result = {
        'followers': None,
        'following': None,
        'posts_count': None,
    }

    patterns = {
        'followers': [
            r'"stats"\s*:\s*\{[^{}]*"followers"\s*:\s*"?(\d+)"?',
            r'"followers"\s*:\s*"?(\d+)"?'
        ],
        'following': [
            r'"stats"\s*:\s*\{[^{}]*"following"\s*:\s*"?(\d+)"?',
            r'"following"\s*:\s*"?(\d+)"?'
        ],
        'posts_count': [
            r'"stats"\s*:\s*\{[^{}]*"media_count"\s*:\s*"?(\d+)"?',
            r'"media_count"\s*:\s*"?(\d+)"?'
        ],
    }

    for key, pats in patterns.items():
        for pat in pats:
            m = re.search(pat, html, re.I | re.S)
            if m:
                result[key] = parse_number(m.group(1))
                break

    return result


def extract_from_html_blocks(html: str):
    result = {
        'followers': None,
        'following': None,
        'posts_count': None,
    }

    block_patterns = {
        'followers': [
            r'followers</p><p[^>]*>([\d,]+)</p>',
            r'followers</p><p class="text-sm">([\d,.KMBkmb]+)</p>',
        ],
        'following': [
            r'following</p><p[^>]*>([\d,]+)</p>',
            r'following</p><p class="text-sm">([\d,.KMBkmb]+)</p>',
        ],
        'posts_count': [
            r'media count</p><p[^>]*>([\d,]+)</p>',
            r'media count</p><p class="text-sm">([\d,.KMBkmb]+)</p>',
        ],
    }

    for key, pats in block_patterns.items():
        for pat in pats:
            m = re.search(pat, html, re.I)
            if m:
                result[key] = parse_number(m.group(1).replace('K', '000').replace('k', '000'))
                break

    return result


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
            'warnings': [f'Scrapling import/config failed: {exc}']
        }
        out_path.write_text(json.dumps(result, indent=2), encoding='utf-8')
        print(json.dumps(result, indent=2))
        raise SystemExit(2)

    url = f'https://socialblade.com/instagram/user/{username}'
    warnings = []
    try:
        fetcher = Fetcher()
        response = fetcher.get(url)
        html = response.html_content
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

    embedded = extract_from_embedded_json(html)
    blocks = extract_from_html_blocks(html)

    followers = embedded['followers'] or blocks['followers']
    following = embedded['following'] or blocks['following']
    posts_count = embedded['posts_count'] or blocks['posts_count']

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
        'debug': {
            'embedded': embedded,
            'html_blocks': blocks,
            'html_has_followers_value': followers is not None,
        }
    }
    out_path.write_text(json.dumps(result, indent=2), encoding='utf-8')
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
