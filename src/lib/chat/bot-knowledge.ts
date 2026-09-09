import { SITE_NAME, SITE_URL, REFERRAL_REWARD_POINTS } from "@/lib/constants";
import { GAME_BONUS_RULES } from "@/lib/games";
import {
  FREEPLAY_TASK_PATTERNS,
} from "@/lib/chat/freeplay-tasks";
import { formatBotMessage, formatNumberedSteps } from "@/lib/chat/format-bot-message";

/** Curated ROYALTIES site guide — steps, topics, and facts for the support bot. */
export const ROYALTIES_BOT_KNOWLEDGE = `
Website: ${SITE_URL}
Platform: ${SITE_NAME} — one wallet for 12+ sweepstakes games (fish tables & slots).

GAMES AVAILABLE:
Orion Stars, Game Vault, Juwa, Fire Kirin, MR All In One, Cash Machine, Cash Frenzy, Panda Master, Vblink, Milky Way, Vegas Sweeps, Ultrapanda, Gameroom, Mafia.

SIGN UP STEPS:
1. Go to ${SITE_URL}/register and create a free account (email or phone).
2. Confirm your email if prompted, then log in.
3. Open Dashboard — your ROYALTIES wallet is ready.

CREATE A GAME ACCOUNT & PLAY:
1. Log in and open Dashboard → Games (or browse ${SITE_URL}/games).
2. Pick a game and create your in-game account — username/password are generated instantly on ROYALTIES.
3. Fund your ROYALTIES wallet first (see deposit steps), then load credits into the game from Dashboard.
4. Download the game app from the game page if needed, log in with your game credentials, and play.

DEPOSIT STEPS (fund ROYALTIES wallet):
1. Log in → Dashboard → Deposit.
2. Choose CashApp, Zelle, Bitcoin, or USDT.
3. Send payment to the address shown and upload your payment proof/screenshot.
4. Wallet credits after verification — usually within about 2 minutes.
Minimum deposit: $${GAME_BONUS_RULES.minDeposit}. Maximum per load: $${GAME_BONUS_RULES.maxDeposit}.

LOAD CREDITS INTO A GAME:
1. Make sure your ROYALTIES wallet has balance (deposit first).
2. Dashboard → Games → select your game account.
3. Choose amount and load type — credits move from wallet to the game, usually instantly.

BONUSES:
- First deposit: ${GAME_BONUS_RULES.firstTimeBonus}% welcome bonus (automatic).
- Reload bonuses: about ${GAME_BONUS_RULES.regularBonus}%–15% depending on VIP tier.
- Daily spin, daily reward claims, streak rewards, and referrals add extra rewards.

VIP TIERS:
Earn VIP points from activity and referrals. Tiers: Bronze → Silver → Gold → Platinum with better reload bonuses and support.

REFERRALS:
Share your referral link from Dashboard → Referrals. You earn ${REFERRAL_REWARD_POINTS} VIP points per successful referral when friends sign up.

DAILY SPIN & REWARDS:
Dashboard → Spin for daily wheel. Claim daily rewards to build streaks for bigger weekly bonuses.

FREE PLAY TASKS (Facebook — complete all 3, then send screenshots):
Task 1: Share our post in 3 different Facebook groups.
Task 2: Post on Facebook Story and tag the ROYALTIES page.
Task 3: Comment on the post and mention 3 friends.
Verification: Send screenshots in chat or Dashboard → Messages after all three tasks.

LIVE CHAT MODES:
- Bot assistant: instant AI help (deposits, games, bonuses, steps).
- Live agent: message goes to the real ROYALTIES support team. Switch anytime in chat.

SUPPORT:
Dashboard → Messages, or the purple chat bubble on any page. For account-specific issues (payment stuck, wrong amount), switch to Live agent.

RESPONSIBLE PLAY:
ROYALTIES encourages setting limits and taking breaks. Never chase losses. Must be 18+.
`.trim();

const HELP_INTENT =
  /^(hi|hello|hey|help|menu|options|start|what can you|what do you|what can i ask|what questions|how can you help|what are you|who are you)\b/i;

const TOPIC_PATTERNS: { pattern: RegExp; answer: string }[] = [
  ...FREEPLAY_TASK_PATTERNS,
  {
    pattern: /\b(sign up|register|create an? account|how do i join|new account)\b/i,
    answer: formatNumberedSteps(
      `How to join ${SITE_NAME}:`,
      [
        `Go to ${SITE_URL}/register and sign up free`,
        "Confirm email if asked, then log in",
        "Open Dashboard — pick a game or deposit",
      ],
      "Ask me about deposits or game accounts anytime!"
    ),
  },
  {
    pattern: /\b(deposit|fund|wallet|cashapp|zelle|bitcoin|usdt|crypto|payment method)\b/i,
    answer: formatNumberedSteps(
      `How to deposit on ${SITE_NAME}:`,
      [
        "Log in → Dashboard → Deposit",
        "Pick CashApp, Zelle, Bitcoin, or USDT",
        "Send payment and upload proof",
        `Wallet credits after verification (~2 min). Min $${GAME_BONUS_RULES.minDeposit}, max $${GAME_BONUS_RULES.maxDeposit}`,
      ],
      `First deposit gets a ${GAME_BONUS_RULES.firstTimeBonus}% welcome bonus automatically!`
    ),
  },
  {
    pattern: /\b(load|credit|add money|fund game|wallet to game)\b/i,
    answer: formatNumberedSteps(
      "Load credits into a game:",
      [
        "Deposit to your ROYALTIES wallet first (Dashboard → Deposit)",
        "Dashboard → Games → pick your game",
        "Enter amount and confirm load — credits move instantly",
      ],
      "One ROYALTIES wallet works for all 12+ games!"
    ),
  },
  {
    pattern: /\b(game account|create game|play|download|which game|what game|games do you|games available|list game)\b/i,
    answer: formatBotMessage(
      `${SITE_NAME} has 12+ games:`,
      "Fire Kirin, Juwa, Orion Stars, Game Vault, Vegas Sweeps, Panda Master, Cash Frenzy, Mafia, Gameroom, and more.",
      formatNumberedSteps("Steps to play:", [
        "Dashboard → Games",
        "Create instant game account on ROYALTIES",
        "Deposit & load credits from your wallet",
        "Download the game app and log in",
      ])
    ),
  },
  {
    pattern: /\b(bonus|welcome|promo|promotion|50%|reload)\b/i,
    answer: formatBotMessage(
      `Bonuses on ${SITE_NAME}:`,
      `${GAME_BONUS_RULES.firstTimeBonus}% welcome bonus on first deposit (automatic)`,
      `${GAME_BONUS_RULES.regularBonus}%–15% reload bonus based on VIP tier`,
      "Daily spin, daily claims, streak rewards, and referral bonuses too",
      "Deposit from Dashboard → Deposit to activate the welcome bonus."
    ),
  },
  {
    pattern: /\b(vip|tier|points|level up)\b/i,
    answer: formatBotMessage(
      `VIP on ${SITE_NAME}:`,
      "Earn VIP points from deposits, activity, and referrals.",
      "Climb Bronze → Silver → Gold → Platinum for bigger reload bonuses.",
      "Check progress at Dashboard → VIP Status."
    ),
  },
  {
    pattern: /\b(referral|refer|invite|friend)\b/i,
    answer: formatNumberedSteps(
      `Referrals on ${SITE_NAME}:`,
      [
        "Dashboard → Referrals",
        "Copy your unique link and share it",
        `When friends sign up, you earn ${REFERRAL_REWARD_POINTS} VIP points per referral`,
      ],
      "No limit on how many friends you invite!"
    ),
  },
  {
    pattern: /\b(daily spin|spin wheel|streak)\b/i,
    answer: formatNumberedSteps(
      `Daily spin on ${SITE_NAME}:`,
      [
        "Dashboard → Spin for your free daily wheel spin",
        "Claim daily rewards to build a streak",
        "Check Dashboard home for claim buttons",
      ],
      'For Free Play tasks, ask: "What are the free play tasks?"'
    ),
  },
  {
    pattern: /\b(claim reward|rewards page|weekly bonus)\b/i,
    answer: formatBotMessage(
      `Rewards on ${SITE_NAME}:`,
      "Open Dashboard → Rewards for daily, weekly, and milestone bonuses.",
      "VIP tier boosts your payouts.",
      'For Free Play Facebook tasks, ask: "How do I complete free play tasks?"'
    ),
  },
  {
    pattern: /\b(message|chat|support|contact|talk to|live agent|bot assistant)\b/i,
    answer: formatBotMessage(
      `Need help on ${SITE_NAME}?`,
      "Bot assistant (this chat): instant answers about tasks, deposits, games, and bonuses.",
      'Live agent: switch the toggle to "Live agent" for a real team member.',
      "Also: Dashboard → Messages, or Telegram in the site footer. Support is 24/7."
    ),
  },
  {
    pattern: /\b(redeem|cash out|withdraw|payout)\b/i,
    answer: formatBotMessage(
      `Redeem / cashout on ${SITE_NAME}:`,
      "Rules depend on your game and wallet type.",
      "Switch to Live agent in this chat or open Dashboard → Messages for account-specific help."
    ),
  },
];

/** Short greeting sent automatically when a user logs in. */
export function getBotWelcomeMessage(): string {
  return formatBotMessage(
    "Hey! How can I help you today?",
    "Ask about Free Play tasks, deposits, games, or bonuses."
  );
}

export function getBotHelpIntro(): string {
  return formatBotMessage(
    `Hi! I'm the ${SITE_NAME} assistant.`,
    "I can help with:",
    "Free Play tasks",
    "Sign up & game accounts",
    "Deposits & loading credits",
    "Bonuses, VIP & referrals",
    'Try: "What are the free play tasks?"',
    "Switch to Live agent anytime for a real person. 18+ only."
  );
}

export function matchBotTopic(message: string): string | null {
  const trimmed = message.trim();
  if (!trimmed) return null;

  if (HELP_INTENT.test(trimmed)) {
    return getBotHelpIntro();
  }

  for (const { pattern, answer } of TOPIC_PATTERNS) {
    if (pattern.test(trimmed)) {
      return answer;
    }
  }

  return null;
}
