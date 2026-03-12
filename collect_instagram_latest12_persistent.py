from patchright.sync_api import sync_playwright
from pathlib import Path
from datetime import datetime, timezone
import json
import time

account = "metmalbekasi"
profile_dir = str(Path.home() / "instagram-collector" / "profile-default")
output = Path.home() / "instagram-collector" / f"{account}-latest12.json"

result = {
 "account": account,
 "collected_at": datetime.now(timezone.utc).isoformat(),
 "source": "patchright-persistent-profile-collector",
 "posts": [],
 "warnings": [],
}

with sync_playwright() as p:
 context = p.chromium.launch_persistent_context(
 user_data_dir=profile_dir,
 headless=True,
 viewport={"width": 1440, "height": 900},
 )

 page = context.pages[0] if context.pages else context.new_page()
 page.goto(f"https://www.instagram.com/{account}/", wait_until="domcontentloaded", timeout=90000)
 time.sleep(20)

 result["final_url"] = page.url
 result["title"] = page.title()
 body = page.locator("body").inner_text(timeout=10000)
 result["body_preview"] = body[:2000]

 anchors = page.locator("a[href*='/p/'], a[href*='/reel/']")
 count = anchors.count()
 result["post_link_count"] = count

 hrefs = [anchors.nth(i).get_attribute("href") for i in range(min(count, 12))]
 links = []
 for href in hrefs:
 if href:
 if href.startswith("/"):
 href = "https://www.instagram.com" + href
 links.append(href.split("?")[0])

 result["post_links"] = links
 context.close()

output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(result, ensure_ascii=False, indent=2))
