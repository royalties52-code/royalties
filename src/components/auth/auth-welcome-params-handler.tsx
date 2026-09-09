"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { markLoginMoment } from "@/lib/auth/login-moment";
import { markPwaShowAfterLogin } from "@/lib/pwa/install-utils";

/** Reads ?welcome=1 / ?verified=1 from auth callback redirects. */
export function AuthWelcomeParamsHandler({ loggedIn }: { loggedIn: boolean | null }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loggedIn !== true) return;

    const welcome = searchParams.get("welcome") === "1";
    const verified = searchParams.get("verified") === "1";
    if (!welcome && !verified) return;

    markLoginMoment();
    markPwaShowAfterLogin();
  }, [loggedIn, searchParams]);

  return null;
}
