from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path


def parse_count(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return int(value)
    text = str(value).strip().lower().replace(",", "")
    multiplier = 1
    if text.endswith("k"):
        multiplier = 1_000
        text = text[:-1]
    elif text.endswith("m"):
        multiplier = 1_000_000
        text = text[:-1]
    elif text.endswith("b"):
        multiplier = 1_000_000_000
        text = text[:-1]
    try:
        return int(float(text) * multiplier)
    except ValueError:
        return None


def extract_from_ld_json(html: str):
    match = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S | re.I)
    if not match:
        return None
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError:
        return None


def extract_with_regex(html: str):
    followers = None
    following = None
    posts_count = None

    patterns = {
        "followers": [
            r'"edge_followed_by"\s*:\s*\{\s*"count"\s*:\s*(\d+)',
            r'([\d.,]+[kmb]?)\s+Followers',
        ],
        "following": [
            r'"edge_follow"\s*:\s*\{\s*"count"\s*:\s*(\d+)',
            r'([\d.,]+[kmb]?)\s+Following',
        ],
        "posts_count": [
            r'"edge_owner_to_timeline_media"\s*:\s*\{\s*"count"\s*:\s*(\d+)',
            r'([\d.,]+[kmb]?)\s+Posts',
        ],
    }

    for pat in patterns["followers"]:
        m = re.search(pat, html, re.I)
        if m:
            followers = parse_count(m.group(1))
            break
    for pat in patterns["following"]:
        m = re.search(pat, html, re.I)
        if m:
            following = parse_count(m.group(1))
            break
    for pat in patterns["posts_count"]:
        m = re.search(pat, html, re.I)
        if m:
            posts_count = parse_count(m.group(1))
            break

    return {
        "followers": followers,
        "following": following,
        "posts_count": posts_count,
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/collect/collect-profile-stats.py <username>", file=sys.stderr)
        raise SystemExit(1)

    username = sys.argv[1]
    repo_root = Path(__file__).resolve().parents[2]
    output_dir = repo_root / "data" / "raw" / "profiles"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{username}.json"
    legacy_output_path = repo_root / f"{username}-profile.json"

    try:
        from scrapling import Fetcher
    except Exception as exc:  # pragma: no cover
        result = {
            "username": username,
            "collected_at": datetime.now(timezone.utc).isoformat(),
            "source": "scrapling",
            "ok": False,
            "error": f"Scrapling import failed: {exc}",
            "followers": None,
            "following": None,
            "posts_count": None,
            "warnings": ["Install scrapling before running this script."],
        }
        output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
        legacy_output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(json.dumps(result, indent=2))
        raise SystemExit(2)

    url = f"https://www.instagram.com/{username}/"
    warnings = []

    try:
        fetcher = Fetcher(auto_match=False)
        response = fetcher.get(url)
        html = response.html if hasattr(response, "html") else str(response)
    except Exception as exc:
        result = {
            "username": username,
            "collected_at": datetime.now(timezone.utc).isoformat(),
            "source": "scrapling",
            "ok": False,
            "error": f"Fetch failed: {exc}",
            "followers": None,
            "following": None,
            "posts_count": None,
            "warnings": ["Instagram may require login/challenge handling."],
        }
        output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
        legacy_output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(json.dumps(result, indent=2))
        raise SystemExit(2)

    ld_json = extract_from_ld_json(html)
    regex_data = extract_with_regex(html)

    followers = regex_data.get("followers")
    following = regex_data.get("following")
    posts_count = regex_data.get("posts_count")

    if ld_json and isinstance(ld_json, dict):
        main_entity = ld_json.get("mainEntityofPage") or {}
        interaction = ld_json.get("interactionStatistic") or []
        if not isinstance(interaction, list):
            interaction = [interaction]
        for item in interaction:
            if not isinstance(item, dict):
                continue
            interaction_type = json.dumps(item).lower()
            count = parse_count(item.get("userInteractionCount"))
            if followers is None and "follow" in interaction_type:
                followers = count
        posts_count = posts_count or parse_count(ld_json.get("mainEntityofPage", {}).get("interactionStatistic", None))
        if main_entity and isinstance(main_entity, dict):
            alt = main_entity.get("name")
            if alt and alt != username:
                warnings.append(f"Resolved page name differs from username: {alt}")

    if followers is None and following is None and posts_count is None:
        warnings.append("Could not confidently extract profile stats from page HTML.")

    result = {
        "username": username,
        "collected_at": datetime.now(timezone.utc).isoformat(),
        "source": "scrapling",
        "ok": True,
        "followers": followers,
        "following": following,
        "posts_count": posts_count,
        "warnings": warnings,
        "url": url,
    }

    output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    legacy_output_path.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
