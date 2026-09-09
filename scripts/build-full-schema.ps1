# Builds supabase/spinora-full-schema.sql - one paste for a fresh Supabase project.
# Usage: powershell -File scripts/build-full-schema.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$out = Join-Path $root "supabase/spinora-full-schema.sql"

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

$phaseC = @(
  "01-extensions-types.sql", "02-rbac.sql", "02b-profile-columns-spinora.sql",
  "03-vip.sql", "04-rewards-ledger.sql", "05-achievements.sql", "06-leaderboards.sql",
  "07-promotions-banners-broadcasts.sql", "08-support-cms-audit.sql", "09-claim-engine.sql",
  "10-rls-new-tables-only.sql", "11-storage-realtime.sql", "12-seed.sql",
  "13-contact-promo-seed.sql", "14-rate-limiting.sql", "15-function-grants.sql",
  "16-public-profiles-spinora.sql", "17-games-requests.sql", "18-blog-seed.sql",
  "19-fix-promotions.sql", "20-requests-user-id.sql", "21-games-play-urls.sql",
  "22-blog-posts-extra.sql", "23-ticket-messages-realtime.sql", "24-game-accounts.sql",
  "25-game-server-creds.sql", "26-payment-proofs-bucket.sql", "27-provision-jobs.sql",
  "28-ticket-messages-fix.sql", "29-grant-fns-bypass.sql", "30-payment-methods.sql",
  "31-geo-cms.sql", "32-blog-how-to-win.sql", "33-telegram-links.sql",
  "34-widen-requests-payment.sql", "35-blog-batch2.sql", "36-faq-wallet-flow.sql",
  "37-blog-payment-methods.sql", "38-geo-tampa.sql", "39-blog-post-status.sql",
  "40-geo-hero-image.sql", "41-telegram-promo.sql", "42-player-reviews.sql",
  "43-banner-popup.sql", "44-newsletters.sql", "45-admin-crm-stats.sql",
  "45-admin-hard-delete.sql", "46-blog-next-gen.sql", "17-profiles-admin-compat.sql",
  "99-grant-admin.sql"
)

$header = @"
-- =============================================================================
-- SPINORA - FULL SCHEMA (fresh Supabase project, no data)
-- =============================================================================
-- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm')
-- How to use:
--   1. Create a NEW Supabase project (empty database)
--   2. Dashboard -> SQL -> New query
--   3. Paste this ENTIRE file and click Run (may take 1-2 minutes)
--   4. If Supabase SQL editor times out, split at PHASE B or PHASE C markers
--   5. Edit YOUR_EMAIL in the last section, re-run only that block after signup
--   6. Set .env.local keys + Auth redirect URLs (see supabase/NEW-PROJECT-SETUP.md)
--
-- Safe for: brand-new empty projects only. Do NOT run on a live DB with users.
-- =============================================================================

"@

$sb = [System.Text.StringBuilder]::new()
[void]$sb.Append($header)

function Convert-FullSchemaForIdempotency([string]$sql) {
  # Standalone realtime ADD TABLE (skip lines already inside DO blocks with 4+ space indent)
  $realtimePattern = '(?im)^(?!\s{4})alter\s+publication\s+supabase_realtime\s+add\s+table\s+(?:public\.)?(\w+)\s*;\s*$'
  $sql = [regex]::Replace($sql, $realtimePattern, {
    param($m)
    $table = $m.Groups[1].Value
    $block = @'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = '{0}'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.{0};
  END IF;
END $$;
'@ -f $table
    return $block
  })

  # DROP + CREATE for RLS policies (safe to re-run; fixes duplicate policy errors)
  $policyPattern = '(?ims)^CREATE POLICY "([^"]+)"(\r?\n\s+ON ([^\r\n]+))'
  $sql = [regex]::Replace($sql, $policyPattern, {
    param($m)
    $name = $m.Groups[1].Value
    $rest = $m.Groups[2].Value
    $onClause = $m.Groups[3].Value.Trim()
    $tableRef = ($onClause -split '\s+')[0]
    $line = "DROP POLICY IF EXISTS ""$name"" ON $tableRef;"
    return ($line + [Environment]::NewLine + "CREATE POLICY ""$name""$rest")
  })

  return $sql
}

function Append-File($label, $relativePath) {
  $path = Join-Path $root $relativePath
  if (-not (Test-Path $path)) {
    throw "Missing file: $relativePath"
  }
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("-- =============================================================================")
  [void]$sb.AppendLine("-- $label")
  [void]$sb.AppendLine("-- Source: $relativePath")
  [void]$sb.AppendLine("-- =============================================================================")
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine((Get-Content $path -Raw -Encoding UTF8))
}

[void]$sb.AppendLine("-- ########## PHASE A - CORE ##########")
$i = 0
foreach ($f in $phaseA) {
  $i++
  Append-File "PHASE A ($i/$($phaseA.Count)): $f" "supabase/$f"
}

[void]$sb.AppendLine("-- ########## PHASE B - WALLETS AND GAME LOADS ##########")
$i = 0
foreach ($f in $phaseB) {
  $i++
  Append-File "PHASE B ($i/$($phaseB.Count)): $f" "supabase/$f"
}

[void]$sb.AppendLine("-- ########## PHASE C - ADMIN CMS SEED DATA ##########")
$i = 0
foreach ($f in $phaseC) {
  $i++
  Append-File "PHASE C ($i/$($phaseC.Count)): $f" "supabase/admin-essentials/$f"
}

[void]$sb.AppendLine("")
[void]$sb.AppendLine("-- =============================================================================")
[void]$sb.AppendLine("-- DONE - Register on your site, then run the YOUR_EMAIL block in 99-grant-admin")
[void]$sb.AppendLine("-- =============================================================================")

$content = $sb.ToString()
$content = Convert-FullSchemaForIdempotency $content
[System.IO.File]::WriteAllText($out, $content, [System.Text.UTF8Encoding]::new($false))

$sizeKb = [math]::Round((Get-Item $out).Length / 1KB, 1)
$lines = (Get-Content $out).Count
Write-Host "Wrote $out (${sizeKb} KB, ${lines} lines)" -ForegroundColor Green
