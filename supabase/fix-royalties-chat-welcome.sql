-- ============================================================================
-- Royalties — fix chat welcome (remove Spinora signup message)
-- ============================================================================
-- Run once in Supabase Dashboard → SQL → New query
--
-- 1. Rewrites old "Welcome to Spinora" chat messages already in the database
-- 2. Stops new signups from inserting the long Spinora welcome (bot handles greet)
-- ============================================================================

-- Fix messages already stored in chat
UPDATE public.messages
SET content = regexp_replace(
  regexp_replace(content, 'Spinora', 'Royalties', 'gi'),
  'WinSweeps', 'Royalties', 'gi'
)
WHERE content ~* 'spinora|winsweeps';

-- Fix notification titles/bodies
UPDATE public.notifications
SET
  title = regexp_replace(regexp_replace(title, 'Spinora', 'Royalties', 'gi'), 'WinSweeps', 'Royalties', 'gi'),
  message = regexp_replace(regexp_replace(message, 'Spinora', 'Royalties', 'gi'), 'WinSweeps', 'Royalties', 'gi')
WHERE title ~* 'spinora|winsweeps' OR message ~* 'spinora|winsweeps';

-- Optional: replace the long Spinora signup welcome with the short bot-style greet
UPDATE public.messages
SET content = E'Hey! How can I help you today?\n\nAsk about Free Play tasks, deposits, games, or bonuses.'
WHERE content ~* 'welcome to spinora';

-- Remove signup welcome insert from handle_new_user (re-run signup-email-phone.sql body)
-- Paste the full CREATE OR REPLACE from supabase/signup-email-phone.sql after this,
-- OR run supabase/signup-email-phone.sql in the SQL editor.

-- Quick patch: if your DB still has the welcome block inside handle_new_user,
-- re-run the updated file:
--   supabase/signup-email-phone.sql
