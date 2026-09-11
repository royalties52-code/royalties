# Deploy Royalties to royalties52-1057/royalties (NOT dark's projects).
# Usage: cd S:\royalties; .\scripts\deploy-royalties-vercel.ps1
#
# When browser opens → complete login in your ROYALTIES52 Chrome profile only.

$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

$Scope = "royalties52-1057"
$Project = "royalties"
# Update after first deploy if you add a custom domain:
$SiteUrl = "https://royalties.vercel.app"

Write-Host ""
Write-Host "=== Royalties Vercel deploy ===" -ForegroundColor Cyan
Write-Host "Target team: $Scope / project: $Project"
Write-Host ""

Write-Host "[1/6] Logging out any old Vercel CLI session..." -ForegroundColor Yellow
npx vercel logout 2>$null | Out-Null

Write-Host "[2/6] Log in — use your ROYALTIES52 Chrome profile when the browser opens!" -ForegroundColor Yellow
npx vercel login
if ($LASTEXITCODE -ne 0) { throw "Vercel login failed." }

$user = (npx vercel whoami 2>&1 | Select-Object -Last 1).Trim()
Write-Host "Logged in as: $user" -ForegroundColor Green

Write-Host "[3/6] Checking team access..." -ForegroundColor Yellow
$teams = npx vercel teams ls 2>&1 | Out-String
if ($teams -notmatch "royalties52") {
  Write-Host ""
  Write-Host "ERROR: royalties52 team not found. You logged into the wrong account (probably dark)." -ForegroundColor Red
  Write-Host "Run: npx vercel logout" -ForegroundColor Red
  Write-Host "Then run this script again and approve login in ROYALTIES52 Chrome only." -ForegroundColor Red
  exit 1
}

Write-Host "[4/6] Linking folder to $Scope/$Project ..." -ForegroundColor Yellow
npx vercel link --yes --scope $Scope --project $Project
if ($LASTEXITCODE -ne 0) { throw "vercel link failed." }

Write-Host "[5/6] Pushing environment variables..." -ForegroundColor Yellow
& (Join-Path $PSScriptRoot "push-vercel-env.ps1") -Scope $Scope -Project $Project -SiteUrl $SiteUrl

Write-Host "[6/6] Production deploy..." -ForegroundColor Yellow
npx vercel --prod --yes
if ($LASTEXITCODE -ne 0) { throw "Deploy failed." }

Write-Host ""
Write-Host "Done! Open: https://vercel.com/$Scope/$Project" -ForegroundColor Green
Write-Host "Update NEXT_PUBLIC_SITE_URL in Vercel if your live URL is different from: $SiteUrl" -ForegroundColor Yellow
