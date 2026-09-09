import "server-only";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export type GroqChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function chatWithGroq(
  messages: GroqChatMessage[],
  options?: { maxTokens?: number; temperature?: number }
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant";

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.6,
        max_tokens: options?.maxTokens ?? 280,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn("[groq] chat failed:", res.status, errText.slice(0, 300));
      return null;
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (err) {
    console.warn("[groq] chat error:", err);
    return null;
  }
}
