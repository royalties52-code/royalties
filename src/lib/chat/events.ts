import type { Message } from "@/types/database";

export const CHAT_INCOMING_EVENT = "ROYALTIES:chat-incoming";

export const OPEN_SUPPORT_CHAT_EVENT = "ROYALTIES:open-support-chat";

export const PENDING_SUPPORT_CHAT_KEY = "ROYALTIES-pending-support-chat";

export interface OpenSupportChatDetail {
  conversationId?: string;
}

export interface ChatIncomingDetail {
  conversationId: string;
  message?: Message;
}

export const GAME_REQUEST_EVENT = "ROYALTIES:game-request-update";

export interface GameRequestEventDetail {
  kind: "new" | "updated" | "completed" | "rejected";
  requestId: string;
}

export function dispatchChatIncoming(conversationId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ChatIncomingDetail>(CHAT_INCOMING_EVENT, {
      detail: { conversationId },
    })
  );
}

export function dispatchOpenSupportChat(conversationId?: string) {
  if (typeof window === "undefined") return;
  if (conversationId) {
    sessionStorage.setItem(PENDING_SUPPORT_CHAT_KEY, conversationId);
  }
  window.dispatchEvent(
    new CustomEvent<OpenSupportChatDetail>(OPEN_SUPPORT_CHAT_EVENT, {
      detail: { conversationId },
    })
  );
}

export function consumePendingSupportChatOpen(): string | null {
  if (typeof window === "undefined") return null;
  const id = sessionStorage.getItem(PENDING_SUPPORT_CHAT_KEY);
  if (id) sessionStorage.removeItem(PENDING_SUPPORT_CHAT_KEY);
  return id;
}

export function peekPendingSupportChatOpen(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(PENDING_SUPPORT_CHAT_KEY);
}

export function clearPendingSupportChatOpen() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PENDING_SUPPORT_CHAT_KEY);
}

export function dispatchGameRequestUpdate(detail: GameRequestEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<GameRequestEventDetail>(GAME_REQUEST_EVENT, { detail }));
}

export const TASK_SUBMISSION_EVENT = "ROYALTIES:task-submission-update";

export interface TaskSubmissionEventDetail {
  kind: "submitted" | "resubmitted" | "approved" | "rejected";
  submissionId: string;
}

export function dispatchTaskSubmissionUpdate(detail: TaskSubmissionEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<TaskSubmissionEventDetail>(TASK_SUBMISSION_EVENT, { detail }));
}

export const DEPOSIT_REQUEST_EVENT = "ROYALTIES:deposit-request";

export interface DepositRequestEventDetail {
  kind: "new";
  depositId: string;
}

export function dispatchDepositRequestUpdate(detail: DepositRequestEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<DepositRequestEventDetail>(DEPOSIT_REQUEST_EVENT, { detail }));
}
