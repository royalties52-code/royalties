# Prints the SQL file order for a new Spinora Supabase project.
# Usage: powershell -File scripts/print-supabase-setup-order.ps1

$root = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path "$root/supabase/schema.sql")) {
  Write-Error "Run from Spinora repo (supabase/schema.sql not found)."
  exit 1
}

$phaseA = @(
  "schema.sql", "signup-email-phone.sql", "auth-phone.sql", "auth-email-otp.sql",
  "welcome-message.sql", "chat-attachments.sql", "deposit-requests.sql",
  "deposit-usdt-payment.sql", "wheel-spins.sql", "wallets.sql", "wallet-cashout.sql",
  "daily-tasks.sql", "daily-tasks-realtime.sql", "daily-tasks-claim.sql",
  "daily-tasks-claim-approval-guard.sql", "daily-tasks-reward-3usd.sql",
  "task-proof-attachments.sql", "reviews.sql", "reviews-admin-comment.sql",
  "reviews-public-read.sql", "message-notifications.sql", "notifications-rpc.sql",
  "admin-presence.sql", "game-requests-realtime.sql"
)

$phaseB = @(
  "game-load-requests.sql", "game-load-redeem.sql", "game-load-split-flow.sql",
  "game-load-minimum-5.sql", "game-load-refund-on-failure.sql", "game-account-replace.sql",
  "stale-game-load-recovery.sql", "deposit-wallet-credit.sql", "deposit-redeem-rollover.sql",
  "bonus-redeem-rollover.sql", "redeem-wallets-and-balance-check.sql",
  "redeem-wallet-source-guard.sql", "wallet-debit-reset.sql",
  "wallet-transactions-realtime.sql", "wheel-spin-caps.sql", "anti-spam-multi-account.sql",
  "profiles-realtime.sql", "admin-broadcast-message.sql", "fix-signup.sql"
)

$adminDir = Join-Path $root "supabase/admin-essentials"
$phaseC = Get-ChildItem $adminDir -Filter "*.sql" |
  Where-Object { $_.Name -match '^\d' } |
  Sort-Object {
    if ($_.Name -match '^(\d+)') { [int]$Matches[1] } else { 999 }
  } |
  ForEach-Object { $_.Name }

Write-Host "`n=== Spinora new Supabase SQL order ===" -ForegroundColor Cyan
Write-Host "Open: https://supabase.com/dashboard → SQL → New query`n"

$n = 1
foreach ($f in $phaseA) {
  $path = Join-Path $root "supabase/$f"
  $ok = if (Test-Path $path) { "OK" } else { "MISSING" }
  Write-Host ("{0,3}. [Phase A] supabase/{1}  [{2}]" -f $n, $f, $ok)
  $n++
}
foreach ($f in $phaseB) {
  $path = Join-Path $root "supabase/$f"
  $ok = if (Test-Path $path) { "OK" } else { "MISSING" }
  Write-Host ("{0,3}. [Phase B] supabase/{1}  [{2}]" -f $n, $f, $ok)
  $n++
}
foreach ($f in $phaseC) {
  Write-Host ("{0,3}. [Phase C] admin-essentials/{1}" -f $n, $f)
  $n++
}

Write-Host "`nFull guide: supabase/NEW-PROJECT-SETUP.md`n" -ForegroundColor Green
