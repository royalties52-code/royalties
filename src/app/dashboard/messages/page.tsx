"use client";

import { UserMessagesInbox } from "@/components/chat/user-messages-inbox";
import { SupportChatModeBar } from "@/components/chat/support-chat-mode-bar";
import { CHAT_PAGE_SHELL_CLASS } from "@/lib/chat/chat-layout";

export default function MessagesPage() {
  return (
    <div className={CHAT_PAGE_SHELL_CLASS}>
      <div className="mb-6 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">Chat with our support team — pick bot or live agent below</p>
      </div>

      <SupportChatModeBar className="mb-4 shrink-0" />

      <div className="flex-1 min-h-0">
        <UserMessagesInbox />
      </div>
    </div>
  );
}
