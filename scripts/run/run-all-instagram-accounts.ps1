param(
  [switch]$SkipCollect,
  [switch]$SkipSheetSync
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $RepoRoot

$accountsPath = Join-Path $RepoRoot 'config\accounts.json'
if (-not (Test-Path $accountsPath)) {
  throw 'config\accounts.json not found'
}

$accounts = Get-Content $accountsPath -Raw | ConvertFrom-Json
foreach ($item in $accounts) {
  if (-not $item.enabled) { continue }
  Write-Host '========================================'
  Write-Host "Running $($item.username)"

  $args = @(
    '-ExecutionPolicy', 'Bypass',
    '-File', '.\scripts\run\run-instagram-account.ps1',
    '-Account', $item.username,
    '-Followers', ([int]$item.followers)
  )

  if ($SkipCollect.IsPresent) { $args += '-SkipCollect' }
  if ($SkipSheetSync.IsPresent) { $args += '-SkipSheetSync' }

  powershell @args
}
