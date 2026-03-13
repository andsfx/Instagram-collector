$ErrorActionPreference = 'Stop'
$RepoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $RepoRoot

if (-not $env:APIFY_TOKEN) {
  throw 'APIFY_TOKEN is required. Example: $env:APIFY_TOKEN = "your_token"'
}

node .\scripts\run\run-hybrid-master.js
