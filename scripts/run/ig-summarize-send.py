#!/usr/bin/env python3
"""IG daily dashboard - LLM-first summarizer with deterministic fallback.

Flow:
1. Read pipeline JSON from stdin (summary JSON produced by run-daily-dashboard.js)
2. Try LLM (9router combo, 60s timeout) to write a short summary
3. On LLM failure -> deterministic summary from the JSON (no fabricated data)
4. Send the result to Telegram via bot API
5. Exit 0 if the message was sent, nonzero otherwise
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error


def _chat(endpoint, model, token, payload):
    """Satu panggilan chat completion. Raise pada kegagalan apa pun."""
    req = urllib.request.Request(
        f"{endpoint}/chat/completions",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {token}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = resp.read().decode()
    # 9router-era SSE (stream=False tapi balas SSE) dan jawaban carte JSON.
    if raw.lstrip().startswith("data:"):
        content = ""
        for line in raw.splitlines():
            if line.startswith("data: ") and '"delta"' in line:
                try:
                    chunk = json.loads(line.removeprefix("data: "))
                    delta = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                    if delta:
                        content += delta
                except Exception:
                    continue
        if content.strip():
            return content.strip()
        raise ValueError("empty SSE content")
    body = json.loads(raw)
    msg = (body.get("choices") or [{}])[0].get("message") or {}
    content = msg.get("content")
    if not content or not str(content).strip():
        raise ValueError("model returned empty content (reasoning-only?)")
    return str(content).strip()


def llm_summarize(pipeline: dict) -> str:
    """Coba carte lokal (primary) lalu tiprouter (fallback). Gagal semua -> ''.

    9router combo sudah diuninstall 2026-10-14; endpoint :20128 sekarang carte
    lokal. Model deepseek-v4.1-flash (terbukti JSON/teks bersih di scorer).
    """
    payload = {
        "model": "deepseek-v4.1-flash",
        "messages": [
            {"role": "system", "content": (
                "Kamu asisten ringkas. Buat ringkasan pipeline Instagram dashboard "
                "metropolitan mall. Bahasa Indonesia, maksimal 120 kata, bullet singkat, "
                "tanpa emoji berlebihan, tanpa em/en dash. Hanya laporkan angka yang ada "
                "di data - jangan menambah data.")},
            {"role": "user", "content": json.dumps(pipeline, ensure_ascii=False)[:8000]},
        ],
        # 1000 pernah habis dimakan reasoning -> content kosong -> gagal palsu.
        "max_tokens": 4000,
        "stream": False,
    }
    # Model per endpoint: tiprouter TIDAK punya nama model carte.
    attempts = [
        ("http://127.0.0.1:20128/v1", "HERMES_CUSTOM_CARTETHYIA_LOCAL_API_KEY",
         "deepseek-v4.1-flash"),
        ("https://tiprouter.my.id/v1", "HERMES_CUSTOM_TIPROUTER_MY_ID_API_KEY",
         "deepseek-v4.1-flash-1017"),
    ]
    for ep, key_env, model in attempts:
        token = os.environ.get(key_env) or ""
        if not token:
            continue
        payload["model"] = model
        # Reasoning non-deterministik: empty content sekali belum tentu mati.
        for _ in range(2):
            try:
                return _chat(ep, model, token, payload)
            except Exception:
                continue
    return ""


def deterministic_summary(p: dict) -> str:
    """Build a summary strictly from the pipeline JSON. Handles both the
    happy-path summary object and the workflowStatus=error object.
    The summary nests account data inside hybridMaster.socialblade.accounts,
    apifyBatch inside hybridMaster.apifyBatch, and git at top level."""
    # Pipeline errored - report the failure honestly instead of fake numbers
    if p.get("workflowStatus") == "error":
        msg = str(p.get("message") or "").splitlines()
        err = msg[0] if msg else "unknown error"
        stage = p.get("errorStage") or "unknown"
        lines = [
            f"IG Dashboard {p.get('date', 'hari ini')}: PIPELINE ERROR",
            f"- stage: {stage} ({p.get('errorCode', '?')})",
            f"- {err[:200]}",
            "- Data lama tetap aman (previous payload preserved)",
        ]
        return "\n".join(lines)

    # Happy path: accounts live in hybridMaster.socialblade.accounts
    hm = p.get("hybridMaster", {})
    sb = hm.get("socialblade", {})
    accounts = sb.get("accounts", [])

    def has_followers(a):
        v = (a.get("output") or {}).get("followers")
        return isinstance(v, (int, float)) and v > 0

    real_ok = [a for a in accounts if has_followers(a)]
    missing = [a for a in accounts if not has_followers(a)]

    lines = []
    head = f"IG Dashboard {p.get('date', 'hari ini')}: {len(real_ok)} dari {len(accounts)} akun OK"
    if missing:
        head += f" | {len(missing)} tanpa data follower"
    lines.append(head)
    for a in accounts:
        o = a.get("output", {})
        fol = o.get("followers")
        if isinstance(fol, (int, float)) and fol > 0:
            lines.append(f"- {a.get('username')}: {fol} followers, {o.get('posts_count', '?')} posts")
        else:
            lines.append(f"- {a.get('username')}: TANPA DATA follower (scrape gagal, bukan nol)")
    if missing and len(missing) == len(accounts):
        lines.append("Catatan: sumber follower (SocialBlade) menolak request dari IP VPS. "
                     "Angka tidak diisi; dashboard tidak dapat baris baru untuk hari ini.")
    apify = hm.get("apifyBatch", {})
    if isinstance(apify, dict) and apify.get("processed"):
        lines.append(f"Apify: {apify.get('processed')} akun, errors {apify.get('errors', 0)}")
    db = p.get("dashboardBuild", {})
    if isinstance(db, dict) and db.get("history_days"):
        lines.append(f"Dashboard: {db.get('history_days')} hari, schema: {'OK' if db.get('schema_valid') else 'ERROR'}")
    git = p.get("git", {})
    if isinstance(git, dict) and git.get("commitMessage"):
        lines.append(f"Git: {git.get('commitMessage')} ({'pushed' if git.get('pushed') else 'not pushed'})")
    return "\n".join(lines)
    return "\n".join(lines)


def send_telegram(text: str) -> bool:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat = os.environ.get("TELEGRAM_CHAT_ID") or "7791584025"
    if not token:
        return False
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({"chat_id": chat, "text": text, "disable_web_page_preview": True}).encode()
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    # api.telegram.org is unreachable DIRECT from this VPS (ISP blackhole since 2026-10-20);
    # route through the same proxy the gateway uses.
    proxy = os.environ.get("TELEGRAM_PROXY", "").strip()
    if proxy:
        opener = urllib.request.build_opener(
            urllib.request.ProxyHandler({"http": proxy, "https": proxy})
        )
    else:
        opener = urllib.request.build_opener()
    for attempt in range(3):
        try:
            with opener.open(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
            if data.get("ok"):
                return True
        except Exception:
            pass
        if attempt < 2:
            time.sleep(30)
    return False


def extract_summary(raw: str) -> dict:
    """run-daily-dashboard.js writes progress lines + per-account JSON blobs
    to stdout, then prints the final summary JSON last. Find the LAST complete
    JSON object in the stream."""
    decoder = json.JSONDecoder()
    last = None
    i = 0
    while True:
        idx = raw.find("{", i)
        if idx == -1:
            break
        try:
            obj, end = decoder.raw_decode(raw[idx:])
            last = obj
            i = idx + end
        except Exception:
            i = idx + 1
    return last or {}


def main() -> int:
    try:
        pipeline = extract_summary(sys.stdin.read())
    except Exception:
        pipeline = {}

    llm_text = ""
    try:
        llm_text = llm_summarize(pipeline)
    except Exception:
        llm_text = ""

    if llm_text:
        text = "IG Dashboard (LLM)\n\n" + llm_text
        mode = "llm"
    else:
        # Penanda kualitas terlihat: fallback deterministik lebih miskin dari
        # LLM, jadi pembaca harus tahu mode mana yang dia terima hari ini.
        text = "IG Dashboard (mode ringkas, LLM tidak tersedia)\n\n" + deterministic_summary(pipeline)
        mode = "fallback"

    ok = send_telegram(text)
    print(f"summarize: mode={mode} sent={ok}", file=sys.stderr)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())