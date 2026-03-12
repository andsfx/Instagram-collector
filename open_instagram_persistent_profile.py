from patchright.sync_api import sync_playwright
from pathlib import Path

profile_dir = Path.home() / "instagram-collector" / "profile-default"
profile_dir.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
 context = p.chromium.launch_persistent_context(
 user_data_dir=str(profile_dir),
 headless=False,
 viewport={"width": 1440, "height": 900},
 )

 page = context.pages[0] if context.pages else context.new_page()
 page.goto("https://www.instagram.com/", wait_until="domcontentloaded", timeout=60000)

 print(f"Profile dir: {profile_dir}")
 print("Login manual dulu, lalu tekan Enter di terminal.")
 input()

 context.close()
