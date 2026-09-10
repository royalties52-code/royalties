-- ============================================================================
-- Royalties — wipe member data, keep admin login(s)
-- ============================================================================
-- Run in Supabase Dashboard → SQL → New query
--
-- Skips tables that are not installed yet (safe on partial migrations).
--
-- WHAT THIS DOES
--   • Deletes every member account EXCEPT profile.role = 'admin'
--   • Removes wallets, deposits, chat, game loads, reviews, referrals, etc.
--   • Clears audit logs, contact form spam, rate limits, newsletter sends
--   • Resets admin wallet balances to zero (optional block at bottom)
--
-- WHAT THIS KEEPS
--   • Admin auth login(s) + profiles (role = admin)
--   • Database schema (tables, RLS, functions)
--   • CMS content: games catalog, blog, FAQs, promotions, site settings
--
-- WHAT THIS DOES NOT DO
--   • Does not delete Storage files (avatars, payment proofs, chat images)
--     → Dashboard → Storage → empty buckets manually if needed
--
-- BEFORE YOU RUN
--   1. Confirm at least one admin exists:
--        SELECT u.id, u.email, p.role FROM public.profiles p
--        JOIN auth.users u ON u.id = p.id WHERE p.role = 'admin';
--   2. Back up if you might need the data — this is irreversible
-- ============================================================================

CREATE OR REPLACE FUNCTION pg_temp.safe_exec(p_sql text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE p_sql;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'Skipped (table missing): %', p_sql;
  WHEN undefined_column THEN
    RAISE NOTICE 'Skipped (column missing): %', p_sql;
END;
$$;

DO $$
DECLARE
  keep_count integer;
  r record;
BEGIN
  SELECT count(*) INTO keep_count
  FROM public.profiles
  WHERE role = 'admin';

  IF keep_count = 0 THEN
    RAISE EXCEPTION 'No admin profile found (role = admin). Promote yourself first: UPDATE profiles SET role = ''admin'' WHERE id = (SELECT id FROM auth.users WHERE email = ''you@email.com'');';
  END IF;

  -- Allow deletes on append-only tables (ledger, wallet_ledger, audit_logs)
  PERFORM set_config('app.allow_account_purge', 'true', true);

  -- ── Break FK links that block profile/auth deletes ─────────────────────────
  -- profiles.referred_by → profiles (older DBs may lack ON DELETE SET NULL)
  UPDATE public.profiles SET referred_by = NULL WHERE referred_by IS NOT NULL;

  PERFORM pg_temp.safe_exec('DELETE FROM public.referrals');
  PERFORM pg_temp.safe_exec(
    'UPDATE public.deposit_requests SET reviewed_by = NULL WHERE reviewed_by IS NOT NULL'
  );
  PERFORM pg_temp.safe_exec(
    'UPDATE public.user_task_submissions SET reviewed_by = NULL WHERE reviewed_by IS NOT NULL'
  );
  PERFORM pg_temp.safe_exec(
    'UPDATE public.wallet_transactions SET created_by = NULL WHERE created_by IS NOT NULL'
  );
  PERFORM pg_temp.safe_exec(
    'UPDATE public.conversations SET admin_id = NULL WHERE admin_id IS NOT NULL AND admin_id NOT IN (SELECT id FROM public.profiles WHERE role = ''admin'')'
  );
  PERFORM pg_temp.safe_exec(
    'UPDATE public.newsletter_campaigns SET created_by = NULL WHERE created_by IS NOT NULL AND created_by NOT IN (SELECT id FROM public.profiles WHERE role = ''admin'')'
  );

  -- ── Orphan / history tables (skip if migration not applied) ───────────────
  PERFORM pg_temp.safe_exec('DELETE FROM public.audit_logs');
  PERFORM pg_temp.safe_exec('DELETE FROM public.activity_log');
  PERFORM pg_temp.safe_exec('DELETE FROM public.contact_messages');
  PERFORM pg_temp.safe_exec('DELETE FROM public.rate_limits');
  PERFORM pg_temp.safe_exec('DELETE FROM public.newsletter_campaign_recipients');
  PERFORM pg_temp.safe_exec('DELETE FROM public.game_provision_jobs');
  PERFORM pg_temp.safe_exec('DELETE FROM public.telegram_link_codes');
  PERFORM pg_temp.safe_exec(
    'DELETE FROM public.telegram_links WHERE user_id NOT IN (SELECT id FROM public.profiles WHERE role = ''admin'')'
  );
  PERFORM pg_temp.safe_exec(
    'DELETE FROM public.player_reviews WHERE user_id NOT IN (SELECT id FROM public.profiles WHERE role = ''admin'')'
  );
  PERFORM pg_temp.safe_exec('DELETE FROM public.reviews');
  PERFORM pg_temp.safe_exec('DELETE FROM public.spin_history');
  PERFORM pg_temp.safe_exec('DELETE FROM public.wheel_spins');
  PERFORM pg_temp.safe_exec('DELETE FROM public.leaderboard_entries');
  PERFORM pg_temp.safe_exec('DELETE FROM public.ip_logs');
  PERFORM pg_temp.safe_exec('DELETE FROM public.device_map');
  PERFORM pg_temp.safe_exec('DELETE FROM public.fraud_scores');

  -- Optional: wipe sent newsletter campaign rows (keeps draft templates in DB)
  -- PERFORM pg_temp.safe_exec('DELETE FROM public.newsletter_campaigns WHERE status = ''sent''');

  -- ── Delete every auth user except admins (cascades profiles, wallets, etc.) ─
  FOR r IN
    SELECT u.id
    FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE coalesce(p.role, 'user') <> 'admin'
  LOOP
    DELETE FROM auth.users WHERE id = r.id;
  END LOOP;

  -- ── Reset kept admin wallets / gamification (comment out to preserve balances) ─
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
  WHERE role = 'admin';

  RAISE NOTICE 'Wipe complete. Kept % admin account(s).', keep_count;
END $$;

DROP FUNCTION IF EXISTS pg_temp.safe_exec(text);

-- ── Verify ──────────────────────────────────────────────────────────────────
-- Should list only admin(s):
-- SELECT u.id, u.email, p.role, p.wallet_balance, p.created_at
-- FROM auth.users u
-- JOIN public.profiles p ON p.id = u.id
-- ORDER BY p.created_at;

-- Should be 0 or admin-only rows:
-- SELECT count(*) AS member_profiles FROM public.profiles WHERE role <> 'admin';
-- SELECT count(*) AS game_loads FROM public.game_load_requests;
-- SELECT count(*) AS deposits FROM public.deposit_requests;
-- SELECT count(*) AS chat_messages FROM public.messages;
