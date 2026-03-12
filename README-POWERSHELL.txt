PowerShell wrappers

Single account:

powershell -ExecutionPolicy Bypass -File .\run-instagram-account.ps1 -Account grandmetropolitan -Followers 92455

All accounts:

powershell -ExecutionPolicy Bypass -File .\run-all-instagram-accounts.ps1

Outputs:
- <account>-latest12-full.json
- <account>-metrics.json

Recommended flow:
1. Activate the same Windows profile/session that already has the persistent Instagram browser profile.
2. Run single-account wrapper first.
3. Send back the generated <account>-metrics.json so the server-side workflow can update Sheets.
