"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { MessageRealtimeProvider } from "@/components/chat/message-realtime-provider";
import { FloatingSupportDock } from "@/components/chat/floating-support-dock";
import { PostLoginProvider } from "@/components/post-login/post-login-provider";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { triggerPostLoginPopups } from "@/lib/auth/post-login";
import { createClient } from "@/lib/supabase/client";
import { MessageRealtimeStubProvider } from "@/lib/chat/message-realtime-stub";

const REALTIME_ROUTE_PREFIXES = ["/dashboard", "/admin", "/spin"];

function needsRealtimeImmediately(pathname: string | null): boolean {
  if (!pathname) return false;
  return REALTIME_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function ClientProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoggedIn(false);
      return;
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setLoggedIn(!!session);
      if (event === "SIGNED_IN" && session?.user) {
        triggerPostLoginPopups();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const useRealtime =
    loggedIn === true && needsRealtimeImmediately(pathname);

  const showFloatingDock =
    loggedIn !== null &&
    !pathname?.startsWith("/admin/chat") &&
    !pathname?.startsWith("/dashboard/messages") &&
    !useRealtime;

  const Provider = useRealtime ? MessageRealtimeProvider : MessageRealtimeStubProvider;

  return (
    <PostLoginProvider>
      <PwaProvider loggedIn={loggedIn === true}>
        <Provider>{children}</Provider>
        {showFloatingDock && <FloatingSupportDock loggedIn={loggedIn === true} />}
        <Toaster richColors closeButton position="top-center" />
      </PwaProvider>
    </PostLoginProvider>
  );
}
