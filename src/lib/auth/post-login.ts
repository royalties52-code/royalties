export const POST_LOGIN_PENDING_KEY = "ROYALTIES-post-login-pending";
export const POST_LOGIN_EVENT = "ROYALTIES:post-login";

export const POST_LOGIN_WELCOME_TEXT = "Hey! How can I help you today?\n\nAsk about Free Play tasks, deposits, games, or bonuses.";

export function triggerPostLoginPopups() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(POST_LOGIN_PENDING_KEY, String(Date.now()));
  window.dispatchEvent(new CustomEvent(POST_LOGIN_EVENT));
}

export function hasPostLoginPending(maxAgeMs = 5 * 60_000): boolean {
  if (typeof window === "undefined") return false;
  const raw = sessionStorage.getItem(POST_LOGIN_PENDING_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts <= maxAgeMs;
}

export function clearPostLoginPending() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(POST_LOGIN_PENDING_KEY);
}

export function shouldTriggerPostLoginFromUrl(search: string): boolean {
  const params = new URLSearchParams(search);
  return params.get("welcome") === "1" || params.get("verified") === "1";
}
