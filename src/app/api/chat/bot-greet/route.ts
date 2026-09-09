import { NextResponse } from "next/server";
import { ensureUserConversation } from "@/lib/actions/messages";
import { maybeSendBotWelcome } from "@/lib/chat/support-bot";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const result = await maybeSendBotWelcome({ customerId: user.id });

  if (result.conversationId) {
    return NextResponse.json(result);
  }

  const ensured = await ensureUserConversation();
  return NextResponse.json({
    ...result,
    conversationId: ensured.conversationId ?? undefined,
  });
}
