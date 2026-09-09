"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { clearLoginMoment } from "@/lib/auth/login-moment";
import {
  clearBotWelcomeSession,
  finishBotWelcomeOnLogin,
  runBotWelcomeOnLogin,
  shouldRunBotWelcomeOnLogin,
} from "@/lib/chat/bot-welcome-client";
import { clearPwaDismissOnLogout } from "@/lib/pwa/install-utils";

export function BotWelcomeOnLogin({ loggedIn }: { loggedIn: boolean | null }) {
  const prevLoggedInRef = useRef<boolean | null>(null);
  const inFlightRef = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearBotWelcomeSession();
        clearLoginMoment();
        clearPwaDismissOnLogout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loggedIn === null) return;

    const wasLoggedIn = prevLoggedInRef.current;
    prevLoggedInRef.current = loggedIn;

    if (!loggedIn) return;

    const verifiedLanding = searchParams.get("verified") === "1";
    if (!shouldRunBotWelcomeOnLogin(wasLoggedIn, loggedIn) && !verifiedLanding) {
      return;
    }

    if (inFlightRef.current) return;
    inFlightRef.current = true;

    void runBotWelcomeOnLogin()
      .finally(() => {
        finishBotWelcomeOnLogin();
        inFlightRef.current = false;
      });
  }, [loggedIn, pathname, searchParams]);

  return null;
}
