#!/usr/bin/env python3
"""Interpolate 3 missing dates in Supabase follower_history + engagement.

Midpoint of prev/next day for each account. Applies via REST insert.
Dry-run unless --apply passed.
"""
import os, sys, json, urllib.request

REPO = "/home/ubuntu/Instagram-collector"
ENV = {}
for line in open(os.path.join(REPO, ".env.daily-dashboard")):
    line = line.strip()
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        ENV[k] = v

URL = ENV["SUPABASE_URL"].rstrip("/")
KEY = ENV["SUPABASE_SERVICE_ROLE_KEY"]
HDR = {"apikey": KEY, "Authorization": "Bearer " + KEY}

ACCTS = ["metmalbekasi", "grandmetropolitan", "metmalcileungsi",
         "summareconmal.bekasi", "pakuwonmallbekasi"]

GAPS = [
    ("2026-07-05", "2026-07-04", "2026-07-06"),
    ("2026-07-21", "2026-07-20", "2026-07-22"),
    ("2026-07-29", "2026-07-28", "2026-07-30"),
]

APPLY = "--apply" in sys.argv


def q(path):
    req = urllib.request.Request(URL + path, headers=HDR)
    return json.load(urllib.request.urlopen(req, timeout=30))


def post(table, rows):
    req = urllib.request.Request(
        URL + "/rest/v1/" + table,
        data=json.dumps(rows).encode(),
        headers={**HDR, "Content-Type": "application/json",
                 "Prefer": "return=minimal"},
    )
    urllib.request.urlopen(req, timeout=30)


def fetch_rows(table, dates):
    d = ",".join(dates)
    return q(f"/rest/v1/{table}?select=*&date=in.({d})")


def mid(a, b):
    return round((a + b) / 2, 6)


def rint(a, b):
    return int(round((a + b) / 2))


def main():
    fh_prev = {}
    eng_prev = {}
    total = 0
    for gap, prev, nxt in GAPS:
        print(f"\n=== GAP {gap}  ({prev} <-> {nxt}) ===")
        fh = fetch_rows("follower_history", [prev, nxt])
        eng = fetch_rows("engagement", [prev, nxt])
        fh_by = {}
        for r in fh:
            fh_by.setdefault(r["date"], {})[r["username"]] = r
        eng_by = {}
        for r in eng:
            eng_by.setdefault(r["date"], {})[r["username"]] = r

        fh_inserts = []
        eng_inserts = []
        for a in ACCTS:
            p_f = fh_by[prev][a]
            n_f = fh_by[nxt][a]
            p_e = eng_by[prev][a]
            n_e = eng_by[nxt][a]

            fh_inserts.append({
                "date": gap, "username": a,
                "followers": rint(p_f["followers"], n_f["followers"]),
                "following": rint(p_f["following"], n_f["following"]),
                "posts": rint(p_f["posts"], n_f["posts"]),
            })
            eng_inserts.append({
                "date": gap, "username": a,
                "posts_analyzed": rint(p_e["posts_analyzed"] or 0, n_e["posts_analyzed"] or 0),
                "avg_likes": mid(p_e["avg_likes"] or 0, n_e["avg_likes"] or 0),
                "avg_comments": mid(p_e["avg_comments"] or 0, n_e["avg_comments"] or 0),
                "engagement_rate": mid(p_e["engagement_rate"] or 0, n_e["engagement_rate"] or 0),
                "total_likes_last12": rint(p_e["total_likes_last12"] or 0, n_e["total_likes_last12"] or 0),
                "total_comments_last12": rint(p_e["total_comments_last12"] or 0, n_e["total_comments_last12"] or 0),
            })
            print(f"  {a:<24} followers {fh_inserts[-1]['followers']:<7} "
                  f"avg_likes {eng_inserts[-1]['avg_likes']:<8} er {eng_inserts[-1]['engagement_rate']}")

        if APPLY:
            post("follower_history", fh_inserts)
            post("engagement", eng_inserts)
            print(f"  -> INSERTED {len(fh_inserts)} follower_history + {len(eng_inserts)} engagement")
        else:
            print(f"  -> [dry-run] would insert {len(fh_inserts)} + {len(eng_inserts)} rows")
        total += len(fh_inserts)

    print(f"\nTOTAL: {total} follower_history rows + {total} engagement rows "
          f"{'APPLIED' if APPLY else 'DRY-RUN'}")


if __name__ == "__main__":
    main()
