-- Allow visitors to see reviewer display names on the home page.
-- Public review read is already in reviews.sql — do not recreate that policy here.
-- Run in Supabase SQL Editor (safe to re-run).

DROP POLICY IF EXISTS "Public can view reviewer profiles" ON public.profiles;
CREATE POLICY "Public can view reviewer profiles"
  ON public.profiles FOR SELECT
  TO anon
  USING (EXISTS (SELECT 1 FROM public.reviews WHERE user_id = profiles.id));
