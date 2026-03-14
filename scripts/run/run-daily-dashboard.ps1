param(
  [switch]$SkipCollect,
  [switch]$SkipCommit,
  [switch]$SkipPush
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir '..\..')
Set-Location $RepoRoot

$args = @('.\scripts\run\run-daily-dashboard.js')
if ($SkipCollect) { $args += '--skip-collect' }
if ($SkipCommit) { $args += '--skip-commit' }
if ($SkipPush) { $args += '--skip-push' }

node @args
