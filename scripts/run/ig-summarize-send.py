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
import subprocess
import sys
import time
import urllib.request
import urllib.error

def llm_summarize(pipeline: dict) -> str:
    """Try 9router combo. Returns '' on any failure."""
    endpoint = "http://127.0.0.1:20128/v1/chat/completions"
    # 9router is permissive; try common auth keys if any are set
    token = (os.environ.get("ROUTER_API_KEY") or os.environ.get("NINE_ROUTER_KEY")
             or os.environ.get("OPENAI_API_KEY") or "sk-9router-local")
    payload = {
        "model": "combo",
        "messages": [
            {"role": "system", "content": (
                "Kamu asisten ringkas. Buat ringkasan pipeline Instagram dashboard "
                "metropolitan mall. Bahasa Indonesia, maksimal 120 kata, bullet singkat, "
                "tanpa emoji berlebihan, tanpa em/en dash. Hanya laporkan angka yang ada "
                "di data - jangan menambah data.")},
            {"role": "user", "content": json.dumps(pipeline, ensure_ascii=False)[:8000]},
        ],
        "max_tokens": 300,
        "stream": False,
    }
    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = json.loads(resp.read().decode())
    content = body["choices"][0]["message"]["content"].strip()
    return content

def deterministic_summary(p: dict) -> str:
    """Build a summary strictly from the pipeline JSON. Handles both the
    happy-path summary object and the workflowStatus=error object."""
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
    lines = []
    accounts = p.get("accounts", [])
    ok = [a for a in accounts if a.get("status") == "processed"]
    lines.append(f"IG Dashboard {p.get('date', 'hari ini')}: {len(ok)}/{len(accounts)} akun OK")
    for a in ok:
        t = a.get("transform", {})
        lines.append(
            f"- {a.get('username')}: {t.get('followers', '?')} followers, "
            f"{t.get('posts_analyzed', '?')} posts, avg {t.get('avg_likes', '?')} likes, "
            f"{t.get('avg_comments', '?')} comments"
        )
    apify = p.get("apifyBatch", {})
    if isinstance(apify, dict):
        lines.append(f"Apify: {apify.get('processed', '?')} akun, errors {apify.get('errors', '?')}")
    git = p.get("git", {})
    if isinstance(git, dict) and git.get("commitMessage"):
        lines.append(f"Git: {git.get('commitMessage')} ({'pushed' if git.get('pushed') else 'not pushed'})")
    return "\n".join(lines)

def send_telegram(text: str) -> bool:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    chat = os.environ.get("TELEGRAM_CHAT_ID") or "7791584025"
    if not token:
        return False
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = json.dumps({"chat_id": chat, "text": text, "disable_web_page_preview": True}).encode()
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    # api.telegram.org is intermittently flaky from this VPS - retry 3x/30s
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
            if data.get("ok"):
                return True
        except Exception:
            pass
        if attempt < 2:
            time.sleep(30)
    return False

def extract_summary(raw: str) -> dict:
    """run-daily-dashboard.js interleaves '>>> command' progress lines with
    per-account JSON blobs on stdout, then prints the final summary JSON last.
    Find the LAST complete JSON object in the stream and parse it."""
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
        text = "IG Dashboard (LLM summary)\n\n" + llm_text
        mode = "llm"
    else:
        text = "IG Dashboard (summary)\n\n" + deterministic_summary(pipeline)
        mode = "fallback"

    ok = send_telegram(text)
    print(f"summarize: mode={mode} sent={ok}", file=sys.stderr)
    return 0 if ok else 1

if __name__ == "__main__":
    sys.exit(main())
