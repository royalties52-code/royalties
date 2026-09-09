"use client";

import { useEffect, type ReactNode } from "react";

interface PwaProviderProps {
  children: ReactNode;
  loggedIn: boolean;
}

/** Registers the service worker. Install UI is handled by PostLoginProvider after login. */
export function PwaProvider({ children }: PwaProviderProps) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  }, []);

  return <>{children}</>;
}
