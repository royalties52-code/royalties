import type { PublicFaq } from "@/lib/data/faqs-public";

const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "is",
  "are",
  "do",
  "does",
  "how",
  "what",
  "when",
  "where",
  "why",
  "can",
  "i",
  "my",
  "me",
  "to",
  "on",
  "in",
  "for",
  "of",
  "and",
  "or",
  "it",
  "we",
  "you",
  "your",
  "with",
  "at",
  "from",
  "about",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

/** Simple keyword overlap — fast, free, no API. */
export function matchFaq(userMessage: string, faqs: PublicFaq[]): PublicFaq | null {
  const userTokens = new Set(tokenize(userMessage));
  if (userTokens.size === 0) return null;

  let best: { faq: PublicFaq; score: number } | null = null;

  for (const faq of faqs) {
    const questionTokens = tokenize(faq.question);
    if (questionTokens.length === 0) continue;

    let overlap = 0;
    for (const token of questionTokens) {
      if (userTokens.has(token)) overlap += 1;
    }

    const score = overlap / questionTokens.length;
    if (score >= 0.45 && (!best || score > best.score)) {
      best = { faq, score };
    }
  }

  return best?.faq ?? null;
}
