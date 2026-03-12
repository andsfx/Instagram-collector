param(
  [Parameter(Mandatory=$true)][string]$Account,
  [int]$Followers,
  [switch]$SkipCollect,
  [switch]$SkipSheetSync
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $RepoRoot

if (-not $Followers) {
  $accountsPath = Join-Path $RepoRoot 'config\accounts.json'
  if (Test-Path $accountsPath) {
    $accounts = Get-Content $accountsPath -Raw | ConvertFrom-Json
    $match = $accounts | Where-Object { $_.username -eq $Account } | Select-Object -First 1
    if ($match) {
      $Followers = [int]$match.followers
    }
  }
}

if (-not $Followers) {
  throw "Followers value is required for $Account"
}

if (-not $SkipCollect) {
  Write-Host "[1/4] Collecting posts for $Account ..."
  if (Test-Path '.\collect-instagram-posts-full.js') {
    node .\collect-instagram-posts-full.js $Account
  } elseif (Test-Path '.\scripts\collect\collect-instagram-posts-full.js') {
    node .\scripts\collect\collect-instagram-posts-full.js $Account
  } else {
    Write-Warning 'collect-instagram-posts-full.js not found; skipping collection'
  }
} else {
  Write-Host "[1/4] Skipped collection"
}

Write-Host "[2/4] Calculating metrics for $Account ..."
node .\calc-instagram-metrics.js $Account $Followers | Out-Null

Write-Host "[3/4] Merging dataset for $Account ..."
node .\scripts\transform\merge-instagram-dataset.js $Account

if (-not $SkipSheetSync) {
  Write-Host "[4/4] Updating Google Sheet for $Account ..."
  node .\scripts\sync\update-google-sheet.js $Account
} else {
  Write-Host "[4/4] Skipped Google Sheet sync"
}

$metricsPath = Join-Path $RepoRoot ("data\processed\metrics\{0}-metrics.json" -f $Account)
$mergedPath = Join-Path $RepoRoot ("data\processed\merged\{0}.json" -f $Account)

Write-Host "Metrics file: $metricsPath"
Write-Host "Merged file:  $mergedPath"
