export type SupportChatMode = "bot" | "agent";

export const SUPPORT_CHAT_MODE_STORAGE_KEY = "ROYALTIES-support-chat-mode";

export function readSupportChatMode(): SupportChatMode {
  if (typeof window === "undefined") return "bot";
  return localStorage.getItem(SUPPORT_CHAT_MODE_STORAGE_KEY) === "agent" ? "agent" : "bot";
}

export function writeSupportChatMode(mode: SupportChatMode) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SUPPORT_CHAT_MODE_STORAGE_KEY, mode);
}

export function supportModeLabel(mode: SupportChatMode): string {
  return mode === "agent" ? "Live agent" : "Bot assistant";
}

export function supportModeHint(mode: SupportChatMode): string {
  return mode === "agent" ? "Real team member replies here" : "Instant AI help";
}

export function composerPlaceholder(mode: SupportChatMode): string {
  return mode === "agent"
    ? "Message our team..."
    : "Ask the assistant anything...";
}
