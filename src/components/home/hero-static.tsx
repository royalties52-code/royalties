import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, DAILY_SPIN_ENABLED } from "@/lib/constants";

/** Server-rendered hero — paints immediately for mobile LCP (no client JS). */
export function HeroStatic() {
  return (
    <section className="relative pb-4" aria-label="Welcome">
      <div className="casino-hero-banner relative w-full overflow-hidden rounded-2xl min-h-[280px] sm:min-h-[320px] lg:min-h-[360px]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#0b0b0b] to-[#050505]" />
        <div className="absolute inset-0 casino-hero-cave opacity-90" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center h-full px-6 sm:px-10 py-10 sm:py-14">
          <div className="text-left max-w-xl">
            <p className="text-[#9a9a9a] text-xs sm:text-sm uppercase tracking-[0.2em] mb-3 font-medium">
              Premium Online Gaming
            </p>
            <h1 className="text-2xl sm:text-3xl lg:text-[2.35rem] font-extrabold leading-tight mb-3">
              <span className="text-[#f5f5f5]">ENTER THE WORLD OF </span>
              <span className="gradient-text drop-shadow-[0_0_24px_rgba(212,175,55,0.25)]">
                {SITE_NAME.toUpperCase()}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-[#9a9a9a] mb-8 max-w-md leading-relaxed">
              One wallet. Twelve premium games. Instant accounts, VIP rewards, and 24/7 live support.
            </p>
            <div className="flex flex-wrap gap-3">
              {DAILY_SPIN_ENABLED ? (
                <Link href="/spin" className="spin-now-btn">
                  SPIN NOW
                </Link>
              ) : null}
              <Link href="/register" className="premium-btn-outline text-sm">
                GET STARTED
              </Link>
              <Link href="/games" className="premium-btn-outline text-sm hidden sm:inline-flex">
                BROWSE GAMES
              </Link>
            </div>
          </div>

          <div className="relative flex items-center justify-center min-h-[200px] lg:min-h-[280px]">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-[#b00020]/10 blur-3xl" />
              <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#d4af37]/10 blur-2xl" />
            </div>
            <Link
              href="/spin"
              className="relative block w-[150px] h-[150px] sm:w-[190px] sm:h-[190px] lg:w-[220px] lg:h-[220px] shrink-0"
              aria-label={`${SITE_NAME} — spin now`}
            >
              <Image
                src="/logo.jpg"
                alt={SITE_NAME}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 640px) 150px, 220px"
                className="rounded-2xl object-contain shadow-[0_0_48px_rgba(212,175,55,0.35)]"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
