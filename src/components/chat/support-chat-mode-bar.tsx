"use client";

import { SupportModeToggle } from "@/components/chat/support-mode-toggle";
import { useSupportChatMode } from "@/lib/chat/use-support-chat-mode";
import { supportModeHint, supportModeLabel } from "@/lib/chat/support-mode";
import { cn } from "@/lib/utils";

export function SupportChatModeBar({ className }: { className?: string }) {
  const { mode, setMode } = useSupportChatMode();

  return (
    <div
      className={cn(
        "rounded-2xl border border-orange-500/35 bg-gradient-to-r from-purple-950/90 via-[#1a1028] to-orange-950/50 p-4 shadow-lg shadow-black/20",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Live chat mode</p>
          <p className="text-xs text-orange-200/80 mt-0.5">
            {supportModeLabel(mode)} · {supportModeHint(mode)}
          </p>
        </div>
        <SupportModeToggle mode={mode} onChange={setMode} className="sm:max-w-md sm:flex-1" />
      </div>
    </div>
  );
}
