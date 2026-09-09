/** Join sections with blank lines so chat bubbles stay readable. */
export function formatBotMessage(...sections: string[]): string {
  return sections.map((s) => s.trim()).filter(Boolean).join("\n\n");
}

/** Turn numbered lines into spaced blocks (1. step → blank line → 2. step). */
export function formatNumberedSteps(intro: string, steps: string[], outro?: string): string {
  const numbered = steps.map((step, i) => `${i + 1}. ${step}`);
  return formatBotMessage(intro, ...numbered, outro ?? "");
}
