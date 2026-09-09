/** Marks that the user just signed in (survives until consumed or sign-out). */
export const LOGIN_MOMENT_KEY = "ROYALTIES-login-moment";

export function markLoginMoment() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LOGIN_MOMENT_KEY, String(Date.now()));
}

export function clearLoginMoment() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(LOGIN_MOMENT_KEY);
}

export function isRecentLoginMoment(maxAgeMs = 3 * 60_000): boolean {
  if (typeof window === "undefined") return false;
  const raw = sessionStorage.getItem(LOGIN_MOMENT_KEY);
  if (!raw) return false;
  const ts = Number(raw);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts <= maxAgeMs;
}

export function consumeLoginMoment(maxAgeMs = 3 * 60_000): boolean {
  if (!isRecentLoginMoment(maxAgeMs)) return false;
  clearLoginMoment();
  return true;
}
