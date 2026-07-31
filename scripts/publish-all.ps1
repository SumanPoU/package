# Publish @itzsa packages that are not yet on npm at the local version.
# Usage:
#   .\scripts\publish-all.ps1 -Otp 123456
#   .\scripts\publish-all.ps1 -Otp 123456 -SkipBuild
#   .\scripts\publish-all.ps1 -Otp 123456 -Only @itzsa/captcha,@itzsa/nepal-pay
#
# OTP must be the 6-digit code from your authenticator app (not a hex token).
# After several wrong attempts npm rate-limits OTP — wait ~5–15 minutes.

param(
  [Parameter(Mandatory = $true)]
  [string]$Otp,
  [switch]$SkipBuild,
  [string]$Only = ""
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if ($Otp.Length -ne 6 -or $Otp -notmatch '^\d{6}$') {
  Write-Host "OTP should be exactly 6 digits from your authenticator (got length $($Otp.Length))." -ForegroundColor Red
  exit 1
}

$pkgs = @(
  "@itzsa/a11y-toolbar",
  "@itzsa/captcha",
  "@itzsa/nepal-pay",
  "@itzsa/nepali-datepicker",
  "@itzsa/table",
  "@itzsa/nepali-input",
  "@itzsa/bs-date",
  "@itzsa/nrb-forex",
  "@itzsa/nepal-geo",
  "@itzsa/nepal-geo-data",
  "@itzsa/editor"
)

if ($Only) {
  $want = $Only.Split(",") | ForEach-Object { $_.Trim() }
  $pkgs = $pkgs | Where-Object { $want -contains $_ }
}

function Get-LocalVersion([string]$name) {
  $dir = $name.Replace("@itzsa/", "")
  $pkg = Get-Content "packages/$dir/package.json" -Raw | ConvertFrom-Json
  return $pkg.version
}

function Get-NpmVersion([string]$name) {
  $v = npm view $name version 2>$null
  if (-not $v) { return $null }
  return "$v".Trim()
}

if (-not $SkipBuild) {
  Write-Host "Building packages..." -ForegroundColor Cyan
  pnpm run build:packages
  if ($LASTEXITCODE -ne 0) { throw "build:packages failed" }
} else {
  Write-Host "Skipping build (-SkipBuild)" -ForegroundColor DarkGray
}

$ok = @()
$skip = @()
$fail = @()

foreach ($p in $pkgs) {
  $local = Get-LocalVersion $p
  $remote = Get-NpmVersion $p
  if ($remote -eq $local) {
    Write-Host "SKIP $p@$local (already on npm)" -ForegroundColor DarkGray
    $skip += "$p@$local"
    continue
  }

  Write-Host "`n==== Publishing $p@$local (npm=$remote) ====" -ForegroundColor Cyan
  pnpm --filter $p publish --access public --no-git-checks --ignore-scripts --otp $Otp
  if ($LASTEXITCODE -eq 0) {
    $ok += "$p@$local"
    Write-Host "OK $p@$local" -ForegroundColor Green
  } else {
    $fail += $p
    Write-Host "FAIL $p — get a FRESH 6-digit OTP and retry remaining packages." -ForegroundColor Red
    break
  }
}

Write-Host "`n==== SUMMARY ====" -ForegroundColor Yellow
Write-Host ("Published: " + ($(if ($ok.Count) { $ok -join ', ' } else { '(none)' })))
Write-Host ("Skipped:   " + ($(if ($skip.Count) { $skip -join ', ' } else { '(none)' })))
Write-Host ("Failed:    " + ($(if ($fail.Count) { $fail -join ', ' } else { '(none)' })))
if ($fail.Count) { exit 1 }
