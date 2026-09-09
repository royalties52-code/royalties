"use client";

import { Bot, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SupportChatMode } from "@/lib/chat/support-mode";

interface SupportModeToggleProps {
  mode: SupportChatMode;
  onChange: (mode: SupportChatMode) => void;
  className?: string;
  compact?: boolean;
}

export function SupportModeToggle({
  mode,
  onChange,
  className,
  compact = false,
}: SupportModeToggleProps) {
  return (
    <div
      className={cn(
        "flex rounded-xl border-2 border-orange-500/40 bg-[#1a1a1a] p-1 gap-1 shadow-lg shadow-orange-500/10",
        compact ? "mx-0 mt-0" : "mx-0 mt-0",
        className
      )}
      role="tablist"
      aria-label="Chat support mode"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "bot"}
        onClick={() => onChange("bot")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-colors",
          mode === "bot"
            ? "bg-gradient-to-r from-purple-600/30 to-orange-500/30 text-white border border-orange-500/30"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        )}
      >
        <Bot className="h-3.5 w-3.5 shrink-0" />
        <span className="font-semibold">{compact ? "Bot" : "Bot assistant"}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "agent"}
        onClick={() => onChange("agent")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-colors",
          mode === "agent"
            ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30"
            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
        )}
      >
        <Headphones className="h-3.5 w-3.5 shrink-0" />
        <span className="font-semibold">{compact ? "Agent" : "Live agent"}</span>
      </button>
    </div>
  );
}
