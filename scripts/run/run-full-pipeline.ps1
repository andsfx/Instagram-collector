param(
  [string]$Account,
  [switch]$SkipSheetSync
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $RepoRoot

if (-not $Account) {
  Write-Host "Usage: powershell -ExecutionPolicy Bypass -File .\scripts\run\run-full-pipeline.ps1 -Account <username>"
  exit 1
}

Write-Host "[1/3] Calculating metrics for $Account"
if (Test-Path ".\scripts\transform\calc-instagram-metrics.js") {
  node .\scripts\transform\calc-instagram-metrics.js $Account
} elseif (Test-Path ".\calc-instagram-metrics.js") {
  node .\calc-instagram-metrics.js $Account
} else {
  Write-Warning "calc-instagram-metrics.js not found; skipping metrics calculation"
}

Write-Host "[2/3] Merging dataset for $Account"
node .\scripts\transform\merge-instagram-dataset.js $Account

if (-not $SkipSheetSync) {
  Write-Host "[3/3] Updating Google Sheet for $Account"
  node .\scripts\sync\update-google-sheet.js $Account
} else {
  Write-Host "[3/3] Skipped Google Sheet sync"
}
