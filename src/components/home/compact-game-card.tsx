"use client";

import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/lib/games";
import { useInView } from "@/lib/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface CompactGameCardProps {
  game: Game;
  variant?: "slider" | "grid";
  featured?: boolean;
  className?: string;
  eager?: boolean;
}

export function CompactGameCard({
  game,
  variant = "grid",
  featured = false,
  className,
  eager = false,
}: CompactGameCardProps) {
  const { ref, inView } = useInView("800px", eager);
  const showImage = eager || inView;
  const href = `/games/${game.slug}`;

  const inner = (
    <>
      {showImage ? (
        <Image
          src={game.image}
          alt={game.name}
          fill
          priority={eager}
          loading={eager ? "eager" : "lazy"}
          className="object-cover object-center transition-transform duration-250 group-hover:scale-[1.04]"
          sizes={
            variant === "slider"
              ? "148px"
              : "(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 200px"
          }
        />
      ) : (
        <div className="absolute inset-0 bg-[#161616] animate-pulse" aria-hidden />
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 px-2.5 pb-2.5 pt-12 text-left bg-gradient-to-t from-black via-black/75 to-transparent">
        <p className="text-[10px] uppercase tracking-wider text-[#9a9a9a] mb-0.5">
        {game.category}
        </p>
        <p className="text-[11px] sm:text-xs font-bold text-[#f5f5f5] leading-tight line-clamp-2 group-hover:text-[#d4af37] transition-colors duration-200">
          {game.name}
        </p>
        {!game.upcoming && (
          <span className="inline-flex mt-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-gradient-to-r from-[#b00020] to-[#8b0018] text-[#ffd700] shadow-[0_0_12px_rgba(176,0,32,0.25)]">
            Play Now
          </span>
        )}
      </div>

      {featured && !game.upcoming && (
        <span className="premium-badge-featured absolute top-2 left-2 z-20">
          ★ FEATURED
        </span>
      )}

      {game.upcoming && (
        <span className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md bg-[#161616] border border-[rgba(212,175,55,0.25)] text-[9px] font-bold text-[#9a9a9a]">
          SOON
        </span>
      )}
    </>
  );

  const classNames = cn(
    "group relative block rounded-xl overflow-hidden text-left",
    variant === "slider"
      ? "game-slider-card w-[128px] sm:w-[148px] aspect-[3/4] shrink-0"
      : cn("game-card w-full aspect-[3/4]", featured && "game-card--featured"),
    className
  );

  return (
    <div ref={ref} className={classNames}>
      <Link
        href={href}
        className="absolute inset-0 z-20"
        aria-label={game.upcoming ? `${game.name} — coming soon` : `View ${game.name}`}
        onPointerDown={variant === "slider" ? (e) => e.stopPropagation() : undefined}
        draggable={false}
      >
        <span className="sr-only">{game.name}</span>
      </Link>
      <div className="game-card-shine" aria-hidden />
      {inner}
    </div>
  );
}
