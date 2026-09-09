"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NotificationDropdown = dynamic(
  () =>
    import("@/components/notifications/notification-dropdown").then(
      (m) => m.NotificationDropdown
    ),
  { ssr: false, loading: () => null }
);

const UserAccountMenu = dynamic(
  () => import("@/components/layout/user-account-menu").then((m) => m.UserAccountMenu),
  {
    ssr: false,
    loading: () => <div className="hidden sm:block h-9 w-9 rounded-full bg-white/5" aria-hidden />,
  }
);

const navLinks = [
  { href: "/games", label: "Games" },
  { href: "/blog", label: "Blog" },
  { href: "/promotions", label: "Promotions" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/vip", label: "VIP" },
  { href: "/support", label: "Support" },
];

type NavbarProps = {
  onMenuClick?: () => void;
  onSearchClick?: () => void;
};

export function Navbar({ onMenuClick, onSearchClick }: NavbarProps = {}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  function closeMobile() {
    setOpen(false);
  }

  function isNavActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const authActions = isLoggedIn ? (
    <>
      <NotificationDropdown buttonClassName="w-9 h-9" />
      <Button size="sm" asChild className="hidden sm:inline-flex">
        <Link href="/dashboard/deposit">Deposit</Link>
      </Button>
      <UserAccountMenu compact />
    </>
  ) : (
    <>
      <Button variant="ghost" size="sm" asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/register">Get Started</Link>
      </Button>
    </>
  );

  const mobileAuthActions = isLoggedIn ? (
    <>
      <Button asChild>
        <Link href="/dashboard/deposit" onClick={closeMobile}>
          Deposit
        </Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/dashboard" onClick={closeMobile}>
          Dashboard
        </Link>
      </Button>
    </>
  ) : (
    <>
      <Button variant="outline" asChild>
        <Link href="/login" onClick={closeMobile}>
          <User className="h-4 w-4" /> Login
        </Link>
      </Button>
      <Button asChild>
        <Link href="/register" onClick={closeMobile}>
          Get Started
        </Link>
      </Button>
    </>
  );

  const searchBtnClass =
    "flex items-center justify-center w-9 h-9 rounded-lg border border-[rgba(212,175,55,0.35)] bg-[#111111] text-[#d4af37] hover:bg-[#161616] hover:shadow-[0_0_16px_rgba(212,175,55,0.2)] transition-all shrink-0";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 premium-navbar">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-[rgba(212,175,55,0.2)] bg-[#111111] text-[#f5f5f5] hover:border-[#d4af37] transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <AnimatedLogo textClassName="text-base sm:text-lg hidden xs:inline-flex" />
        </div>

        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "premium-nav-link",
                isNavActive(link.href) && "premium-nav-link--active"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {onSearchClick && (
            <button type="button" onClick={onSearchClick} className={searchBtnClass} aria-label="Search games">
              <Search className="h-4 w-4" />
            </button>
          )}
          {authActions}
        </div>

        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
          {onSearchClick && (
            <button type="button" onClick={onSearchClick} className={searchBtnClass} aria-label="Search games">
              <Search className="h-4 w-4" />
            </button>
          )}
          {isLoggedIn ? (
            <UserAccountMenu compact />
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="h-9 px-2.5 text-xs shrink-0">
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="h-9 px-2.5 text-xs shrink-0">
                <Link href="/register">Join</Link>
              </Button>
            </>
          )}
          {!onMenuClick && (
            <button
              className="p-2 text-[#f5f5f5] shrink-0"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {open && !onMenuClick && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[rgba(212,175,55,0.15)] bg-[#0b0b0b]/98 backdrop-blur-md"
          >
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2.5 text-sm rounded-lg transition-colors",
                    isNavActive(link.href)
                      ? "text-[#ffd700] bg-[rgba(176,0,32,0.15)]"
                      : "text-[#9a9a9a] hover:text-[#d4af37] hover:bg-[rgba(212,175,55,0.06)]"
                  )}
                  onClick={closeMobile}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-[rgba(212,175,55,0.12)]">
                {mobileAuthActions}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
