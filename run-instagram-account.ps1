param(
    [Parameter(Mandatory=$true)][string]$Account,
    [Parameter(Mandatory=$true)][int]$Followers
)

$ErrorActionPreference = 'Stop'
$BaseDir = Join-Path $HOME 'instagram-collector'

Set-Location $BaseDir

Write-Host "[1/3] Collecting posts for $Account ..."
node .\collect-instagram-posts-full.js $Account

Write-Host "[2/3] Calculating metrics for $Account ..."
$metrics = node .\calc-instagram-metrics.js $Account $Followers

$metricsPath = Join-Path $BaseDir ("{0}-metrics.json" -f $Account)
$metrics | Set-Content -Encoding utf8 $metricsPath

Write-Host "[3/3] Done."
Write-Host "Metrics file: $metricsPath"
Write-Host ""
Get-Content $metricsPath
