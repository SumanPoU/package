# Publish all @itzsa packages (requires npm OTP from authenticator)
# Usage (PowerShell):
#   $env:NPM_OTP = "123456"
#   .\scripts\publish-all.ps1
#
# Or one-shot:
#   .\scripts\publish-all.ps1 -Otp 123456

param(
  [Parameter(Mandatory = $true)]
  [string]$Otp
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

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

Write-Host "Building packages first..." -ForegroundColor Cyan
pnpm run build:packages
if ($LASTEXITCODE -ne 0) { throw "build:packages failed" }

$ok = @()
$fail = @()

foreach ($p in $pkgs) {
  Write-Host "`n==== Publishing $p ====" -ForegroundColor Cyan
  pnpm --filter $p publish --access public --no-git-checks --ignore-scripts --otp $Otp
  if ($LASTEXITCODE -eq 0) {
    $ok += $p
    Write-Host "OK $p" -ForegroundColor Green
  } else {
    $fail += $p
    Write-Host "FAIL $p" -ForegroundColor Red
    # Fresh OTP often required after first use — stop so you can re-run remaining
    break
  }
}

Write-Host "`n==== SUMMARY ====" -ForegroundColor Yellow
Write-Host ("Published: " + ($(if ($ok.Count) { $ok -join ', ' } else { '(none)' })))
Write-Host ("Failed/stopped: " + ($(if ($fail.Count) { $fail -join ', ' } else { '(none)' })))
if ($fail.Count) {
  Write-Host "Re-run with a NEW OTP for remaining packages." -ForegroundColor Yellow
  exit 1
}
