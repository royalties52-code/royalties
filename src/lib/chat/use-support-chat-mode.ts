"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  readSupportChatMode,
  writeSupportChatMode,
  type SupportChatMode,
} from "@/lib/chat/support-mode";

export function useSupportChatMode() {
  const [mode, setModeState] = useState<SupportChatMode>("bot");

  useEffect(() => {
    setModeState(readSupportChatMode());
  }, []);

  const setMode = useCallback((next: SupportChatMode) => {
    setModeState((prev) => {
      if (prev === next) return prev;
      writeSupportChatMode(next);
      toast.message(next === "agent" ? "Live agent" : "Bot assistant", {
        description:
          next === "agent"
            ? "Your message goes straight to our team."
            : "Get instant AI help. Switch anytime for a human.",
      });
      return next;
    });
  }, []);

  return {
    mode,
    setMode,
    preferAgent: mode === "agent",
  };
}
