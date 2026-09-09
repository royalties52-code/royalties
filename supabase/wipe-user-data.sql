-- ============================================================================
-- Royalties — wipe user & transaction data (keep admin + CMS)
-- ============================================================================
-- Run in Supabase Dashboard → SQL → New query
--
-- WHAT THIS DOES
--   • Deletes all member accounts EXCEPT the email you set below
--   • Removes their profiles, wallets, deposits, chat, transactions, etc.
--   • Clears audit logs and other admin history tables
--   • Keeps games, CMS pages, blog, FAQs, roles, site settings
--
-- WHAT THIS DOES NOT DO
--   • Does not delete files in Storage (avatars, payment proofs, chat images)
--     → clear buckets manually in Dashboard → Storage if needed
--   • Does not reset the database schema
--
-- BEFORE YOU RUN
--   1. Replace YOUR_ADMIN_EMAIL@example.com below with YOUR login email
--   2. Make sure you can still log in as that admin after the wipe
--   3. This is irreversible — back up first if you might need the data
-- ============================================================================

DO $$
DECLARE
  keep_email constant text := 'YOUR_ADMIN_EMAIL@example.com';  -- ← CHANGE THIS
  keep_user_id uuid;
  r record;
BEGIN
  SELECT id INTO keep_user_id
  FROM auth.users
  WHERE lower(email) = lower(keep_email)
  LIMIT 1;

  IF keep_user_id IS NULL THEN
    RAISE EXCEPTION 'No auth user found for %. Fix KEEP_ADMIN_EMAIL before running.', keep_email;
  END IF;

  -- Allow deletes on append-only tables (ledger, wallet_ledger, audit_logs)
  PERFORM set_config('app.allow_account_purge', 'true', true);

  -- Clear admin history (optional but removes old audit entries from /admin/audit)
  DELETE FROM public.audit_logs;

  -- Orphan / non-user tables that do not cascade from auth.users
  DELETE FROM public.contact_messages;
  DELETE FROM public.rate_limits;
  DELETE FROM public.newsletter_campaign_recipients;
  DELETE FROM public.player_reviews WHERE user_id IS DISTINCT FROM keep_user_id;

  -- Delete every auth user except admin (cascades to profiles, wallets, deposits, chat, etc.)
  FOR r IN
    SELECT id FROM auth.users WHERE id <> keep_user_id
  LOOP
    DELETE FROM auth.users WHERE id = r.id;
  END LOOP;

  -- Reset admin wallet balances to zero (optional — comment out if you want to keep yours)
  UPDATE public.profiles
  SET
    wallet_balance = 0,
    bonus_wallet = 0,
    cashout_wallet = 0,
    bonus_redeem_wallet = 0,
    coins_balance = 0,
    xp = 0,
    level = 1,
    current_streak = 0,
    role = 'admin'
  WHERE id = keep_user_id;

  RAISE NOTICE 'Done. Kept admin: % (%)', keep_email, keep_user_id;
END $$;

-- Verify: should show only your admin
-- SELECT id, email, role, wallet_balance FROM public.profiles ORDER BY created_at;
