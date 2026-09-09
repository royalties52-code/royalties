"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Clock,
  Star,
  TrendingUp,
  Award,
  Search,
  Crown,
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Users,
  Headphones,
  ShieldCheck,
  StarHalf,
  Target,
  Gamepad2,
  Banknote,
} from "lucide-react";
import type { GameTab } from "@/lib/games";
import { cn } from "@/lib/utils";
import { useUnreadMessages } from "@/hooks/use-unread-messages";
import { UnreadBadge } from "@/components/ui/unread-badge";

const SIDEBAR_LINKS: { id: GameTab; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All Games", icon: LayoutGrid },
  { id: "upcoming", label: "Upcoming Games", icon: Clock },
  { id: "popular", label: "Popular Games", icon: Star },
  { id: "trending", label: "Trending Games", icon: TrendingUp },
  { id: "topRated", label: "Top Rated Games", icon: Award },
];

const ACCOUNT_LINKS = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/games", label: "All Games", icon: Gamepad2 },
  { href: "/blog", label: "Blog & Guides", icon: Target },
  { href: "/dashboard/deposit", label: "Deposit", icon: Banknote },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/vip", label: "VIP Status", icon: Crown },
  { href: "/dashboard/referrals", label: "Referrals", icon: Users },
  { href: "/dashboard/reviews", label: "Reviews", icon: StarHalf },
  { href: "/spin", label: "Daily Spin", icon: Sparkles },
];

const PREFETCH_ROUTES = ACCOUNT_LINKS.map((link) => link.href).filter(
  (href) => !href.startsWith("/#") && href !== "/"
);

interface HomeSidebarProps {
  activeTab: GameTab;
  onTabChange: (tab: GameTab) => void;
  onSearchClick: () => void;
  walletSlot?: React.ReactNode;
  className?: string;
  /** From server session — sidebar renders account links on first paint. */
  initialLoggedIn?: boolean;
}

function SidebarFooter({
  isLoggedIn,
  onWarmMessages,
}: {
  isLoggedIn: boolean;
  onWarmMessages?: () => void;
}) {
  return (
    <div className="mt-auto space-y-3 pt-2">
      <div className="rounded-xl p-4 bg-gradient-to-br from-[#111111] to-[#0b0b0b] border border-[rgba(212,175,55,0.15)]">
        <div className="flex items-center gap-2 mb-2">
          <Headphones className="h-4 w-4 text-[#d4af37]" />
          <p className="text-xs font-semibold text-[#f5f5f5]">24/7 Live Support</p>
        </div>
        <p className="text-[11px] text-[#9a9a9a] mb-3 leading-relaxed">
          Need help? Chat with our team anytime.
        </p>
        <Link
          href={isLoggedIn ? "/dashboard/messages" : "/support"}
          onTouchStart={() => isLoggedIn && onWarmMessages?.()}
          className="block text-center py-2 rounded-lg bg-[rgba(176,0,32,0.12)] text-[#ffd700] text-xs font-semibold hover:bg-[rgba(176,0,32,0.2)] transition-colors border border-[rgba(212,175,55,0.2)]"
        >
          {isLoggedIn ? "Open Messages" : "Contact Support"}
        </Link>
      </div>

      <div className="rounded-xl px-3 py-2.5 flex items-center gap-2 border border-[rgba(212,175,55,0.15)] bg-[#0b0b0b]">
        <ShieldCheck className="h-4 w-4 text-[#d4af37] shrink-0" />
        <p className="text-[10px] text-[#9a9a9a] leading-snug">
          Secure accounts · Fast setup · Trusted platform
        </p>
      </div>
    </div>
  );
}

export function HomeSidebar({
  activeTab,
  onTabChange,
  onSearchClick,
  walletSlot,
  className,
  initialLoggedIn = false,
}: HomeSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const prefetched = useRef(new Set<string>());
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);
  const { count: unreadMessages } = useUnreadMessages();

  function warmRoute(href: string) {
    if (prefetched.current.has(href) || href.startsWith("/#") || href === "/") return;
    prefetched.current.add(href);
    router.prefetch(href);
  }

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    void import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      if (!supabase) return;

      void supabase.auth.getSession().then(({ data: { session } }) => {
        const loggedIn = !!session?.user;
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
          for (const href of PREFETCH_ROUTES) {
            warmRoute(href);
          }
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session?.user);
      });

      unsubscribe = () => subscription.unsubscribe();
    });

    return () => unsubscribe?.();
  }, [router]);

  return (
    <aside
      className={cn(
        "premium-sidebar flex flex-col gap-4 p-4",
        "min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-6rem)]",
        className
      )}
    >
      {isLoggedIn && walletSlot}

      <button
        type="button"
        onClick={onSearchClick}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl premium-btn-gold text-sm"
      >
        <Search className="h-4 w-4" />
        Search Games
      </button>

      {isLoggedIn && (
        <div className="rounded-xl p-4 border border-[rgba(212,175,55,0.12)] bg-[#111111]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-3">
            My Account
          </p>
          <nav className="space-y-1">
            {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => {
              const active =
                pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={!href.startsWith("/#") && href !== "/"}
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
      )}

      <div className="rounded-xl p-4 border border-[rgba(212,175,55,0.12)] bg-[#111111]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] mb-3">
          Explore Games
        </p>
        <nav className="space-y-1">
          {SIDEBAR_LINKS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={cn(
                "premium-sidebar-link text-left",
                activeTab === id && "premium-sidebar-link--active"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {!isLoggedIn && (
        <>
          <div className="rounded-xl p-4 bg-[#111111] border border-[rgba(212,175,55,0.2)]">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-[#ffd700]" />
              <h3 className="font-semibold text-sm text-[#f5f5f5]">Unlock Premium Access</h3>
            </div>
            <p className="text-xs text-[#9a9a9a] mb-3">
              Experience VIP perks, bigger wins, and exclusive features.
            </p>
            <Link
              href="/login"
              className="block text-center py-2 rounded-lg premium-btn-outline text-xs"
            >
              Login & Access All
            </Link>
          </div>

          <div className="rounded-xl p-4 bg-[#0b0b0b] border border-[rgba(176,0,32,0.25)]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-[#d4af37]" />
              <h3 className="font-semibold text-sm text-[#f5f5f5]">New Here?</h3>
            </div>
            <p className="text-xs text-[#9a9a9a] mb-3">Claim your free account & start playing!</p>
            <Link
              href="/register"
              className="block text-center py-2 rounded-lg premium-btn-gold text-xs"
            >
              Sign Up
            </Link>
          </div>
        </>
      )}

      {isLoggedIn && (
        <div className="rounded-xl p-4 bg-[#111111] border border-[rgba(212,175,55,0.2)]">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-[#ffd700]" />
            <h3 className="font-semibold text-sm text-[#f5f5f5]">Level Up Now</h3>
          </div>
          <p className="text-xs text-[#9a9a9a] mb-3">Unlock VIP rewards and exclusive perks.</p>
          <Link
            href="/dashboard/vip"
            onTouchStart={() => warmRoute("/dashboard/vip")}
            className="block text-center py-2 rounded-lg premium-btn-gold text-xs"
          >
            View VIP Status
          </Link>
        </div>
      )}

      <SidebarFooter
        isLoggedIn={isLoggedIn}
        onWarmMessages={() => warmRoute("/dashboard/messages")}
      />
    </aside>
  );
}

export { SIDEBAR_LINKS };
