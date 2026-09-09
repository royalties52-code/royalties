import "server-only";

import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { matchFaq } from "@/lib/chat/faq-match";
import {
  ROYALTIES_BOT_KNOWLEDGE,
  matchBotTopic,
  getBotHelpIntro,
  getBotWelcomeMessage,
} from "@/lib/chat/bot-knowledge";
import { chatWithGroq, type GroqChatMessage } from "@/lib/chat/groq-client";
import { royaltiesBrandText } from "@/lib/chat/royalties-brand-text";
import { createAdminClient } from "@/lib/supabase/admin";

type SupportFaq = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
};

const HUMAN_ESCALATION =
  /\b(human|real person|agent|manager|speak to someone|talk to someone|call me)\b/i;

const SUPPORT_SYSTEM_PROMPT = `You are the friendly ${SITE_NAME} website assistant at ${SITE_URL}. Always say "${SITE_NAME}" or "Royalties Online Casino" — never WinSweeps, Spinora, or other names.

Never open with long welcome speeches like "Welcome to Spinora" or "Welcome to our platform". Keep greetings short: one line, then help.

Your job: answer questions about the ${SITE_NAME} website — what users can do, how things work, and clear step-by-step instructions.

Formatting:
- Use short lines with blank lines between sections (never one big paragraph).
- Use numbered steps when helpful, with a blank line between each step.
- Plain text only — no markdown # or *.

Rules:
- Use ONLY facts from the ROYALTIES knowledge and FAQ below. Do not invent bonus rates, payout guarantees, or policies.
- Do not include Facebook URLs unless the user explicitly asks for a link.
- For Free Play tasks, describe the 3 Facebook tasks and screenshot verification — no links.
- If the question needs account-specific help (payment stuck, wrong balance), tell them to switch to Live agent in chat.
- Encourage responsible play. Must be 18+. Never help with cheating or bypassing rules.`;

function clipPreview(text: string, max = 140): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max - 3)}...` : trimmed;
}

async function getSupportSenderId(admin: NonNullable<ReturnType<typeof createAdminClient>>) {
  const configured = process.env.CHAT_BOT_SENDER_ID?.trim();
  if (configured) {
    const { data } = await admin.from("profiles").select("id").eq("id", configured).eq("role", "admin").maybeSingle();
    if (data?.id) return data.id;
  }

  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

/** Skip bot only when a human admin (not the bot account) replied recently. */
async function recentHumanSupportReply(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  conversationId: string,
  customerId: string,
  botSenderId: string,
  withinMinutes: number
): Promise<boolean> {
  const since = new Date(Date.now() - withinMinutes * 60_000).toISOString();
  const { data } = await admin
    .from("messages")
    .select("sender_id")
    .eq("conversation_id", conversationId)
    .neq("sender_id", customerId)
    .neq("sender_id", botSenderId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}

function buildFaqContext(faqs: SupportFaq[]): string {
  if (faqs.length === 0) return "No FAQ entries loaded.";
  return faqs
    .slice(0, 20)
    .map((f) => `Q: ${royaltiesBrandText(f.question)}\nA: ${royaltiesBrandText(f.answer)}`)
    .join("\n\n");
}

function brandFaqs(faqs: SupportFaq[]): SupportFaq[] {
  return faqs.map((f) => ({
    ...f,
    question: royaltiesBrandText(f.question),
    answer: royaltiesBrandText(f.answer),
  }));
}

async function loadPublishedFaqs(
  admin: NonNullable<ReturnType<typeof createAdminClient>>
): Promise<SupportFaq[]> {
  const { data } = await admin
    .from("faqs")
    .select("id, question, answer, category, sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return data ?? [];
}

async function generateReply(userMessage: string, faqs: SupportFaq[]) {
  const brandedFaqs = brandFaqs(faqs);

  const topicHit = matchBotTopic(userMessage);
  if (topicHit) return topicHit;

  const faqHit = matchFaq(userMessage, brandedFaqs);
  if (faqHit) return faqHit.answer;

  if (HUMAN_ESCALATION.test(userMessage)) {
    return "Got it — switch to Live agent in this chat (toggle at the top) and a real ROYALTIES team member will follow up shortly. Thanks for your patience!";
  }

  const hasGroq = Boolean(process.env.GROQ_API_KEY?.trim());
  if (!hasGroq) return getBotHelpIntro();

  const messages: GroqChatMessage[] = [
    {
      role: "system",
      content: `${SUPPORT_SYSTEM_PROMPT}\n\nROYALTIES site knowledge:\n${ROYALTIES_BOT_KNOWLEDGE}\n\nOfficial FAQ:\n${buildFaqContext(brandedFaqs)}`,
    },
    { role: "user", content: userMessage },
  ];

  return chatWithGroq(messages, { maxTokens: 360 }).then(
    (reply) => reply ? royaltiesBrandText(reply) : getBotHelpIntro()
  );
}

export async function maybeReplyWithSupportBot(input: {
  conversationId: string;
  customerId: string;
  content: string;
  attachmentType?: "image" | "file" | null;
}): Promise<{ replied: boolean }> {
  const trimmed = input.content.trim();
  if (!trimmed && input.attachmentType) {
    return { replied: false };
  }
  if (!trimmed) return { replied: false };

  const enabled = process.env.CHAT_BOT_ENABLED !== "false";
  if (!enabled) return { replied: false };

  const admin = createAdminClient();
  if (!admin) {
    console.warn("[support-bot] missing SUPABASE_SERVICE_ROLE_KEY");
    return { replied: false };
  }

  const { data: conversation } = await admin
    .from("conversations")
    .select("user_id")
    .eq("id", input.conversationId)
    .single();

  if (!conversation || conversation.user_id !== input.customerId) {
    return { replied: false };
  }

  const senderId = await getSupportSenderId(admin);
  if (!senderId) {
    console.warn("[support-bot] no admin profile to send bot replies as");
    return { replied: false };
  }

  if (
    await recentHumanSupportReply(
      admin,
      input.conversationId,
      input.customerId,
      senderId,
      8
    )
  ) {
    return { replied: false };
  }

  const faqs = await loadPublishedFaqs(admin);
  const reply = await generateReply(trimmed, faqs);
  if (!reply) {
    console.warn("[support-bot] no reply generated (Groq/FAQ miss)");
    return { replied: false };
  }

  const now = new Date().toISOString();

  const { error: insertError } = await admin.from("messages").insert({
    conversation_id: input.conversationId,
    sender_id: senderId,
    content: reply,
    is_read: false,
  });

  if (insertError) {
    console.warn("[support-bot] insert failed:", insertError.message);
    return { replied: false };
  }

  await admin
    .from("conversations")
    .update({ updated_at: now, admin_id: senderId })
    .eq("id", input.conversationId);

  await admin.from("notifications").insert({
    user_id: conversation.user_id,
    title: "Support replied",
    message: clipPreview(reply),
    type: "info",
    is_read: false,
  });

  return { replied: true };
}

async function ensureConversationForUser(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  userId: string
): Promise<string | null> {
  const { data: existing } = await admin
    .from("conversations")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: created, error } = await admin
    .from("conversations")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error || !created?.id) return null;
  return created.id;
}

async function recentBotWelcome(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  conversationId: string,
  botSenderId: string,
  withinHours: number
): Promise<boolean> {
  const welcome = getBotWelcomeMessage();
  const since = new Date(Date.now() - withinHours * 60 * 60_000).toISOString();
  const { data } = await admin
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("sender_id", botSenderId)
    .eq("content", welcome)
    .gte("created_at", since)
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}

/** Sends a one-time bot greeting when the user logs in (deduped per 24h). */
export async function maybeSendBotWelcome(input: {
  customerId: string;
}): Promise<{ sent: boolean; conversationId?: string }> {
  const enabled = process.env.CHAT_BOT_ENABLED !== "false";
  if (!enabled) return { sent: false };

  const admin = createAdminClient();
  if (!admin) {
    console.warn("[support-bot] missing SUPABASE_SERVICE_ROLE_KEY");
    return { sent: false };
  }

  const senderId = await getSupportSenderId(admin);
  if (!senderId) {
    console.warn("[support-bot] no admin profile to send bot welcome as");
    return { sent: false };
  }

  const conversationId = await ensureConversationForUser(admin, input.customerId);
  if (!conversationId) return { sent: false };

  if (await recentBotWelcome(admin, conversationId, senderId, 24)) {
    return { sent: false, conversationId };
  }

  const welcome = getBotWelcomeMessage();
  const now = new Date().toISOString();

  const { error: insertError } = await admin.from("messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content: welcome,
    is_read: false,
  });

  if (insertError) {
    console.warn("[support-bot] welcome insert failed:", insertError.message);
    return { sent: false, conversationId };
  }

  await admin
    .from("conversations")
    .update({ updated_at: now, admin_id: senderId })
    .eq("id", conversationId);

  await admin.from("notifications").insert({
    user_id: input.customerId,
    title: "Support",
    message: clipPreview(welcome),
    type: "info",
    is_read: false,
  });

  return { sent: true, conversationId };
}
