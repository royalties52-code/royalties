export const SITE_NAME = "Royalties";

/** Daily spin wheel is live (win rates capped server-side in prize-engine). */
export const DAILY_SPIN_ENABLED = true;

/** VIP points awarded per successful referral */
export const REFERRAL_REWARD_POINTS = 10;
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://royaltiesonlinecasino.com";
export const SITE_DESCRIPTION =
  "Royalties Online Casino — premium sweepstakes gaming, Juwa, Game Vault, slot games, and fish games. Create game accounts fast, claim bonuses, earn VIP rewards, and get 24/7 live support.";

export const VIP_TIERS = [
  {
    id: "bronze",
    name: "Bronze",
    minPoints: 0,
    color: "from-amber-800 to-amber-600",
    benefits: ["Basic support", "5% referral bonus", "Weekly promotions"],
  },
  {
    id: "silver",
    name: "Silver",
    minPoints: 500,
    color: "from-zinc-400 to-zinc-300",
    benefits: ["Priority support", "10% referral bonus", "Exclusive games access"],
  },
  {
    id: "gold",
    name: "Gold",
    minPoints: 2000,
    color: "from-yellow-500 to-amber-400",
    benefits: ["24/7 VIP support", "15% referral bonus", "Early access to promotions"],
  },
  {
    id: "platinum",
    name: "Platinum",
    minPoints: 5000,
    color: "from-red-500 to-amber-400",
    benefits: ["Dedicated account manager", "25% referral bonus", "Custom rewards"],
  },
] as const;

export const REQUEST_STATUSES = [
  "pending",
  "processing",
  "completed",
  "rejected",
] as const;

export const PUBLIC_ROUTES = [
  { path: "/", priority: 1.0 },
  { path: "/games", priority: 0.95 },
  { path: "/blog", priority: 0.9 },
  { path: "/promotions", priority: 0.9 },
  { path: "/leaderboard", priority: 0.85 },
  { path: "/vip", priority: 0.9 },
  { path: "/about", priority: 0.8 },
  { path: "/support", priority: 0.8 },
  { path: "/contact", priority: 0.75 },
  { path: "/terms", priority: 0.5 },
  { path: "/privacy", priority: 0.5 },
  { path: "/spin", priority: 0.85 },
  { path: "/login", priority: 0.5 },
  { path: "/register", priority: 0.5 },
] as const;

/** Official Royalties social profile URLs — used in footer, tasks, and share buttons */
export const SOCIAL_LINKS = {
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL?.trim() || "",
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() || "",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "",
  tiktok:
    process.env.NEXT_PUBLIC_TIKTOK_URL?.trim() ||
    "https://www.tiktok.com/@royaltiesonlinecasino",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() || "",
} as const;
