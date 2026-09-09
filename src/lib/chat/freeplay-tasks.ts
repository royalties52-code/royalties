import { SITE_NAME } from "@/lib/constants";
import { formatBotMessage } from "@/lib/chat/format-bot-message";

export function getFreeplayTasksAnswer(): string {
  return formatBotMessage(
    `Free Play on ${SITE_NAME}`,
    "Complete all 3 tasks, then send proof.",
    "📌 Task 1\nShare our post in 3 different Facebook groups.",
    "📌 Task 2\nPost on your Facebook Story and tag the ROYALTIES page.",
    "📌 Task 3\nComment on the post and mention 3 friends who should join.",
    "📷 Verification\nAfter all 3 tasks, send screenshots here or in Dashboard → Messages."
  );
}

export function getFreeplayTaskSummary(): string {
  return formatBotMessage(
    "Free Play tasks:",
    "1. Share post in 3 Facebook groups",
    "2. Facebook Story + tag ROYALTIES page",
    "3. Comment + mention 3 friends",
    "Then send screenshots to verify."
  );
}

export const FREEPLAY_TASK_PATTERNS: { pattern: RegExp; answer: string }[] = [
  {
    pattern:
      /\b(freeplay|free play|free entry|facebook task|daily task|what (are |is )?the task|how (do|to) (do|complete).*task|task instructions)\b/i,
    answer: "",
  },
  {
    pattern: /\b(task 1|share.*facebook|facebook group|3 different group|three group)\b/i,
    answer: formatBotMessage(
      "📌 Task 1",
      "Share our post in 3 different Facebook groups.",
      "When done, continue with Task 2 and Task 3."
    ),
  },
  {
    pattern: /\b(task 2|facebook story|story.*tag|tag.*page)\b/i,
    answer: formatBotMessage(
      "📌 Task 2",
      "Post on your Facebook Story.",
      "Tag the ROYALTIES page so we can verify your share."
    ),
  },
  {
    pattern: /\b(task 3|comment.*friend|mention.*friend|tag.*friend|3 friends|three friends)\b/i,
    answer: formatBotMessage(
      "📌 Task 3",
      "Drop a comment on the post.",
      "Mention 3 friends who should join the fun."
    ),
  },
  {
    pattern:
      /\b((freeplay|free play|task).*(screenshot|verify|verification|proof)|confirm your entry|mark done|submit.*task|verification required|all three task|finish.*three task)\b/i,
    answer: formatBotMessage(
      "📷 Verification",
      "Finish all 3 tasks first.",
      "Then send screenshots here or in Dashboard → Messages.",
      "Include proof for each task so we can confirm your entry."
    ),
  },
];

FREEPLAY_TASK_PATTERNS[0].answer = getFreeplayTasksAnswer();
