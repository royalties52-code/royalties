import Image from "next/image";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex premium-auth-panel">
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(176,0,32,0.12)_0%,transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,_rgba(212,175,55,0.08)_0%,transparent_50%)]" />
        <div className="relative text-center p-12 max-w-md">
          <Image
            src="/logo.jpg"
            alt={SITE_NAME}
            width={200}
            height={200}
            className="mx-auto rounded-2xl mb-8 shadow-[0_0_48px_rgba(212,175,55,0.3)]"
            priority
          />
          <h2 className="text-3xl font-extrabold gradient-text mb-3 uppercase tracking-wide">
            {SITE_NAME}
          </h2>
          <p className="text-[#9a9a9a] text-sm leading-relaxed">
            Premium gaming platform. Sign in to access your wallet, games, VIP rewards, and live support.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <Image src="/logo.jpg" alt={SITE_NAME} width={36} height={36} className="rounded-lg" />
            <span className="font-bold gradient-text uppercase tracking-wide">{SITE_NAME}</span>
          </Link>
          <div className="premium-auth-card rounded-2xl p-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
