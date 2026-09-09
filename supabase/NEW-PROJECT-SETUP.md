# ROYALTIES — new Supabase project (full setup)

Use this when you create a **brand-new** Supabase project and want **all features** working: auth, chat, bot, deposits, wallets, spin wheel, daily tasks, admin panel, CMS, etc.

**Time:** ~45–90 minutes (mostly copy/paste SQL + dashboard settings)

---

## Step 1 — Create the Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Pick a region close to your users (e.g. **US East**)
3. Save the **database password** somewhere safe
4. Wait until the project is ready

---

## Step 2 — Copy API keys → `.env.local`

Dashboard → **Project Settings → API**

Copy into `.env.local` (copy from `.env.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GROQ_API_KEY=your_groq_key
```

**Never commit** `.env.local` or share the **service role** key publicly.

---

## Step 3 — Run SQL (Supabase SQL Editor)

Open: **Dashboard → SQL → New query**

### Option A — One file (recommended)

Paste the entire contents of **`supabase/ROYALTIES-full-schema.sql`** into the SQL editor and click **Run**.

- ~10,500 lines / ~500 KB — may take 1–2 minutes
- If it **times out**, split at the markers inside the file:
  - `PHASE A - CORE` (start)
  - `PHASE B - WALLETS AND GAME LOADS`
  - `PHASE C - ADMIN CMS SEED DATA`
- Regenerate anytime: `powershell -File scripts/build-full-schema.ps1`

Safe for **brand-new empty** projects only. No user data — schema + seed CMS content only.

### Option B — File by file

Run each file **in order**. Paste contents → **Run** → next file.

If you see `already exists`, skip and continue.

### Phase A — Core (login, chat, deposits, spin, tasks)

| # | File in `supabase/` |
|---|---------------------|
| 1 | `schema.sql` |
| 2 | `signup-email-phone.sql` |
| 3 | `auth-phone.sql` |
| 4 | `auth-email-otp.sql` |
| 5 | `welcome-message.sql` |
| 6 | `chat-attachments.sql` |
| 7 | `deposit-requests.sql` |
| 8 | `deposit-usdt-payment.sql` |
| 9 | `wheel-spins.sql` |
| 10 | `wallets.sql` |
| 11 | `wallet-cashout.sql` |
| 12 | `daily-tasks.sql` |
| 13 | `daily-tasks-realtime.sql` |
| 14 | `daily-tasks-claim.sql` |
| 15 | `daily-tasks-claim-approval-guard.sql` |
| 16 | `daily-tasks-reward-3usd.sql` |
| 17 | `task-proof-attachments.sql` |
| 18 | `reviews.sql` |
| 19 | `reviews-admin-comment.sql` |
| 20 | `reviews-public-read.sql` |
| 21 | `message-notifications.sql` |
| 22 | `notifications-rpc.sql` |
| 23 | `admin-presence.sql` |
| 24 | `game-requests-realtime.sql` |

### Phase B — Wallets, game loads, security

| # | File in `supabase/` |
|---|---------------------|
| 25 | `game-load-requests.sql` |
| 26 | `game-load-redeem.sql` |
| 27 | `game-load-split-flow.sql` |
| 28 | `game-load-minimum-5.sql` |
| 29 | `game-load-refund-on-failure.sql` |
| 30 | `game-account-replace.sql` |
| 31 | `stale-game-load-recovery.sql` |
| 32 | `deposit-wallet-credit.sql` |
| 33 | `deposit-redeem-rollover.sql` |
| 34 | `bonus-redeem-rollover.sql` |
| 35 | `redeem-wallets-and-balance-check.sql` |
| 36 | `redeem-wallet-source-guard.sql` |
| 37 | `wallet-debit-reset.sql` |
| 38 | `wallet-transactions-realtime.sql` |
| 39 | `wheel-spin-caps.sql` |
| 40 | `anti-spam-multi-account.sql` |
| 41 | `profiles-realtime.sql` |
| 42 | `admin-broadcast-message.sql` |
| 43 | `fix-signup.sql` |

### Phase C — Admin panel, CMS, blog, newsletters

Run every file in `supabase/admin-essentials/` **in numeric order**:

| # | File |
|---|------|
| 1–46 | `01-extensions-types.sql` … `46-blog-next-gen.sql` |
| 47 | `17-profiles-admin-compat.sql` |
| **48** | **`99-grant-admin.sql`** ← edit your email first, run last |

See `supabase/admin-essentials/README.md` for the full numbered list.

---

## Step 4 — Auth settings (Dashboard)

**Authentication → URL Configuration**

| Setting | Local dev | Production |
|---------|-----------|------------|
| Site URL | `http://localhost:3000` | `https://royaltiesonlinecasino.com` |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://royaltiesonlinecasino.com/auth/callback` |

**Authentication → Providers → Email**

- Enable Email provider
- Turn on **Confirm email** if you want verification links

**Authentication → Email templates → Confirm signup** (optional)

Use token_hash callback (see `supabase/auth-email-confirm.sql` and `supabase/email-templates/` if present).

**Authentication → Providers → Google** (optional)

- Enable Google
- Add redirect: `https://YOUR_REF.supabase.co/auth/v1/callback`

---

## Step 5 — Storage buckets (verify)

Dashboard → **Storage**. You should see buckets from SQL, including:

- `chat-attachments`
- `payment-proofs`
- `task-proofs`
- `avatars`, `cms-media` (from admin-essentials)

If any are missing, re-run `chat-attachments.sql`, `admin-essentials/26-payment-proofs-bucket.sql`, and `task-proof-attachments.sql`.

---

## Step 6 — Realtime (verify)

Dashboard → **Database → Publications → supabase_realtime**

Should include tables like `messages`, `conversations`, `notifications`, `deposit_requests`, etc.

If chat live updates fail, re-run `game-requests-realtime.sql`, `daily-tasks-realtime.sql`, `admin-essentials/11-storage-realtime.sql`.

---

## Step 7 — First admin user

1. Start the app: `npm run dev`
2. Register at `http://localhost:3000/register`
3. Confirm email if required, then log in
4. SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL@example.com';
```

Or run `admin-essentials/99-grant-admin.sql` with your email.

5. Open `/admin` — you should see the admin panel

---

## Step 8 — Optional services

| Feature | Env var | Notes |
|---------|---------|-------|
| AI chat bot | `GROQ_API_KEY` | Required for bot replies |
| Bot welcome / insert messages | `SUPABASE_SERVICE_ROLE_KEY` | Required server-side |
| Auth emails | `RESEND_API_KEY` | Or use Supabase built-in email (limited) |
| Telegram deposit alerts | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID` | Optional |
| PWA / site | `NEXT_PUBLIC_SITE_URL` | Must match your domain |

---

## Step 9 — Production (Vercel)

Update env vars on Vercel (Project → Settings → Environment Variables):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL=https://royaltiesonlinecasino.com`
- `GROQ_API_KEY`

Then deploy:

```powershell
npm run deploy
```

Or push to GitHub if auto-deploy is connected.

**Also update Supabase Auth redirect URLs** to include `https://royaltiesonlinecasino.com/auth/callback`.

---

## Quick test checklist

After setup, verify:

- [ ] Register + login works
- [ ] Dashboard loads (`/dashboard`)
- [ ] Chat bubble opens; bot replies (Groq key set)
- [ ] Deposit page uploads screenshot
- [ ] Daily spin (`/spin`)
- [ ] Admin chat inbox (`/admin/chat`)
- [ ] Admin deposits (`/admin/deposits`)

---

## Migrating data from an old Supabase?

If you have an **existing** project with users/data, use `supabase/DATA-MIGRATION.md` instead of starting fresh.

---

## Need help?

If a SQL file errors, note:

1. **File name**
2. **Exact error message**
3. Whether this is a **new empty** project or a migration

Common fixes: skip `already exists`, or re-run an earlier file if `relation does not exist`.
