import {
  dispatchOpenSupportChat,
  peekPendingSupportChatOpen,
  PENDING_SUPPORT_CHAT_KEY,
} from "@/lib/chat/events";
import { consumeLoginMoment, isRecentLoginMoment } from "@/lib/auth/login-moment";

export const BOT_WELCOME_SESSION_KEY = "ROYALTIES-bot-welcome-session";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function clearBotWelcomeSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(BOT_WELCOME_SESSION_KEY);
  sessionStorage.removeItem(PENDING_SUPPORT_CHAT_KEY);
}

/** Retry greet API until auth cookies are visible to the route handler. */
export async function requestBotWelcome(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const pending = peekPendingSupportChatOpen();
  if (pending) return pending;

  if (sessionStorage.getItem(BOT_WELCOME_SESSION_KEY)) {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const convId = await fetchBotGreetConversationId();
      if (convId) return convId;
      await sleep(300);
    }
    return null;
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const convId = await fetchBotGreetConversationId();
    if (convId) {
      sessionStorage.setItem(BOT_WELCOME_SESSION_KEY, "1");
      return convId;
    }
    await sleep(350);
  }

  return null;
}

async function fetchBotGreetConversationId(): Promise<string | null> {
  try {
    const res = await fetch("/api/chat/bot-greet", {
      method: "POST",
      credentials: "include",
    });

    if (res.status === 401) return null;
    if (!res.ok) return null;

    const data = (await res.json()) as {
      sent?: boolean;
      conversationId?: string;
    };

    if (data.conversationId) {
      sessionStorage.setItem(PENDING_SUPPORT_CHAT_KEY, data.conversationId);
      return data.conversationId;
    }

    return null;
  } catch {
    return null;
  }
}

export function scheduleOpenSupportChat(conversationId?: string) {
  const open = () => dispatchOpenSupportChat(conversationId);
  window.setTimeout(open, 500);
  window.setTimeout(open, 1500);
  window.setTimeout(open, 3000);
}

export async function runBotWelcomeOnLogin() {
  const conversationId = await requestBotWelcome();
  scheduleOpenSupportChat(conversationId ?? undefined);
}

export function shouldRunBotWelcomeOnLogin(wasLoggedIn: boolean | null, loggedIn: boolean): boolean {
  if (!loggedIn) return false;
  if (wasLoggedIn === false) return true;
  if (isRecentLoginMoment()) return true;
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "1" || params.get("welcome") === "1") return true;
  }
  return false;
}

export function finishBotWelcomeOnLogin() {
  consumeLoginMoment();
}
