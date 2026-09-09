import Image from "next/image";
import Link from "next/link";

import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { mark: 32, text: "text-base" },
  md: { mark: 40, text: "text-lg" },
  lg: { mark: 56, text: "text-xl" },
} as const;

export function Logo({
  size = "md",
  withWordmark = true,
  href = "/",
  className,
}: {
  size?: keyof typeof sizes;
  withWordmark?: boolean;
  href?: string | null;
  className?: string;
}) {
  const s = sizes[size];

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src="/logo.jpg"
        alt={withWordmark ? "" : SITE_NAME}
        width={s.mark}
        height={s.mark}
        priority
        className="rounded-md object-contain"
      />
      {withWordmark && (
        <span className={cn("gradient-text font-extrabold tracking-tight uppercase", s.text)}>
          {SITE_NAME}
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      aria-label={`${SITE_NAME} home`}
      className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {content}
    </Link>
  );
}
