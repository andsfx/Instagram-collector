@'
# Instagram Collector

Script untuk mengambil 12 post terbaru dari akun Instagram dan menghitung metrik engagement berbasis follower count.

## Requirements

- Windows PowerShell
- Node.js dan npm
- Playwright
- Session/profile browser Instagram yang sudah login

## Install

```powershell
npm install

Usage

Single account via Node.js

node .\collect-instagram-posts-full.js metmalbekasi
node .\calc-instagram-metrics.js metmalbekasi 93505

Single account via PowerShell wrapper

powershell -ExecutionPolicy Bypass -File .\run-instagram-account.ps1 -Account grandmetropolitan -Followers 92455

All accounts

powershell -ExecutionPolicy Bypass -File .\run-all-instagram-accounts.ps1

Output

Setiap akun biasanya menghasilkan:

• <account>-latest12-full.json
• <account>-metrics.json

Example Accounts

• metmalbekasi
• grandmetropolitan
• metmalcileungsi
• summareconmal.bekasi
• pakuwonmallbekasi

Lihat ACCOUNTS.md untuk contoh command dan follower count.

Notes

• Gunakan profile/session browser yang sudah login Instagram
• Lihat README-POWERSHELL.txt untuk flow kerja cepat
• File sensitif dan cache seharusnya tidak ikut ke Git karena sudah di-ignore
'@ | Set-Content -Encoding utf8 README.md


Lalu commit final:

```powershell
git add README.md
git commit -m "Update README"
git push
