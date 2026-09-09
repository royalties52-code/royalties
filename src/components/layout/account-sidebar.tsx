"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Crown,
  Users,
  StarHalf,
  Target,
  Trophy,
  Sparkles,
  Headphones,
  ShieldCheck,
  Gamepad2,
  Banknote,
  History,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadMessages } from "@/hooks/use-unread-messages";
import { UnreadBadge } from "@/components/ui/unread-badge";

const ACCOUNT_LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/games", label: "My Games", icon: Gamepad2 },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/deposit", label: "Deposit", icon: Banknote },
  { href: "/dashboard/deposits", label: "My Deposits", icon: History },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/vip", label: "VIP Status", icon: Crown },
  { href: "/dashboard/referrals", label: "Referrals", icon: Users },
  { href: "/dashboard/reviews", label: "Reviews", icon: StarHalf },
  { href: "/dashboard/rewards", label: "Rewards", icon: Target },
  { href: "/dashboard/achievements", label: "Achievements", icon: Trophy },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/activity", label: "Activity", icon: History },
  { href: "/spin", label: "Daily Spin", icon: Sparkles },
];

const PREFETCH_ROUTES = ACCOUNT_LINKS.map((link) => link.href).filter(
  (href) => !href.startsWith("/#")
);

interface AccountSidebarProps {
  walletSlot?: React.ReactNode;
  className?: string;
}

export function AccountSidebar({ walletSlot, className }: AccountSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const prefetched = useRef(new Set<string>());
  const { count: unreadMessages } = useUnreadMessages();

  function warmRoute(href: string) {
    if (prefetched.current.has(href) || href.startsWith("/#")) return;
    prefetched.current.add(href);
    router.prefetch(href);
  }

  useEffect(() => {
    for (const href of PREFETCH_ROUTES) {
      warmRoute(href);
    }
  }, [router]);

  return (
    <aside
      className={cn(
        "premium-sidebar flex flex-col gap-4 p-4",
        "min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-6rem)]",
        className
      )}
    >
      {walletSlot}

      <div className="rounded-xl p-4 border border-[rgba(212,175,55,0.12)] bg-[#111111]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-3">
          My Account
        </p>
        <nav className="space-y-1">
          {ACCOUNT_LINKS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                prefetch={!href.startsWith("/#")}
                onMouseEnter={() => warmRoute(href)}
                onFocus={() => warmRoute(href)}
                onTouchStart={() => warmRoute(href)}
                className={cn(
                  "premium-sidebar-link",
                  active && "premium-sidebar-link--active"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {href === "/dashboard/messages" && (
                  <UnreadBadge count={unreadMessages} />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-3 pt-2">
        <div className="rounded-xl p-4 bg-[#111111] border border-[rgba(212,175,55,0.12)]">
          <div className="flex items-center gap-2 mb-2">
            <Headphones className="h-4 w-4 text-[#d4af37]" />
            <p className="text-xs font-semibold text-[#f5f5f5]">24/7 Live Support</p>
          </div>
          <Link
            href="/dashboard/messages"
            prefetch
            onTouchStart={() => warmRoute("/dashboard/messages")}
            className="block text-center py-2 rounded-lg bg-[rgba(176,0,32,0.12)] text-[#ffd700] text-xs font-semibold hover:bg-[rgba(176,0,32,0.2)] transition-colors border border-[rgba(212,175,55,0.2)]"
          >
            Open Messages
          </Link>
        </div>
        <div className="rounded-xl px-3 py-2.5 flex items-center gap-2 border border-[rgba(212,175,55,0.15)] bg-[#0b0b0b]">
          <ShieldCheck className="h-4 w-4 text-[#d4af37] shrink-0" />
          <p className="text-[10px] text-[#9a9a9a] leading-snug">
            Secure accounts · Fast setup · Trusted platform
          </p>
        </div>
      </div>
    </aside>
  );
}
