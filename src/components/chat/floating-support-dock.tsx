"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { ChatWidgetLoader } from "@/components/chat/chat-widget-loader";
import { UserQuickChat } from "@/components/chat/user-quick-chat";
import { FloatingSocialLinks } from "@/components/layout/social-links";
import { ensureUserConversationClient } from "@/lib/chat/ensure-user-conversation-client";
import { ensureUserConversation } from "@/lib/actions/messages";
import { unlockMessageNotificationSound } from "@/lib/chat/message-notification-sound";
import {
  OPEN_SUPPORT_CHAT_EVENT,
  clearPendingSupportChatOpen,
  peekPendingSupportChatOpen,
  type OpenSupportChatDetail,
} from "@/lib/chat/events";
import { createClient } from "@/lib/supabase/client";

function LoggedInFloatingChat() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [quickChatOpen, setQuickChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    void supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openChat = useCallback(async (preferredConversationId?: string | null, autoOpen = false) => {
    void unlockMessageNotificationSound();

    if (quickChatOpen && !preferredConversationId && !autoOpen) {
      setQuickChatOpen(false);
      return true;
    }

    let uid = userId;
    if (!uid) {
      const supabase = createClient();
      const { data: { user } } = supabase
        ? await supabase.auth.getUser()
        : { data: { user: null } };
      uid = user?.id ?? null;
      if (uid) setUserId(uid);
    }

    if (!uid) {
      if (!autoOpen) router.push("/login");
      return false;
    }

    let convId = preferredConversationId ?? conversationId;
    if (!convId) {
      const supabase = createClient();
      if (supabase) {
        convId = await ensureUserConversationClient(supabase, uid);
      }
      if (!convId) {
        const ensured = await ensureUserConversation();
        convId = ensured.conversationId ?? null;
      }
    }

    if (!convId) {
      if (!autoOpen) router.push("/dashboard/messages");
      return false;
    }

    setConversationId(convId);
    setQuickChatOpen(true);
    clearPendingSupportChatOpen();
    clearPendingSupportChatOpen();
    return true;
  }, [conversationId, quickChatOpen, router, userId]);

  useEffect(() => {
    function onOpenSupportChat(event: Event) {
      const detail = (event as CustomEvent<OpenSupportChatDetail>).detail;
      void openChat(detail?.conversationId, true);
    }

    window.addEventListener(OPEN_SUPPORT_CHAT_EVENT, onOpenSupportChat);
    return () => window.removeEventListener(OPEN_SUPPORT_CHAT_EVENT, onOpenSupportChat);
  }, [openChat]);

  useEffect(() => {
    if (!userId) return;
    const pending = peekPendingSupportChatOpen();
    if (pending) void openChat(pending, true);
  }, [openChat, userId]);

  return (
    <>
      <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1rem,env(safe-area-inset-right))] sm:bottom-6 sm:right-6 z-[130] flex flex-col items-center gap-2 pointer-events-none">
        <FloatingSocialLinks />
        <button
          type="button"
          onClick={() => void openChat()}
          className="relative w-14 h-14 rounded-full gradient-bg flex items-center justify-center shadow-lg glow-purple touch-manipulation pointer-events-auto"
          aria-label="Open live chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </button>
      </div>

      {quickChatOpen && conversationId && userId && (
        <UserQuickChat
          open={quickChatOpen}
          conversationId={conversationId}
          userId={userId}
          onClose={() => setQuickChatOpen(false)}
        />
      )}
    </>
  );
}

/** Social icons + live chat on public pages (homepage, games, blog, etc.). */
export function FloatingSupportDock({ loggedIn }: { loggedIn: boolean }) {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin/chat") || pathname?.startsWith("/dashboard/messages")) {
    return null;
  }

  if (loggedIn) {
    return <LoggedInFloatingChat />;
  }

  return <ChatWidgetLoader />;
}
