export const PWA_DISMISS_KEY = "ROYALTIES-pwa-install-dismiss";
export const PWA_SESSION_DISMISS_KEY = "ROYALTIES-pwa-install-dismiss-session";
export const PWA_LOGIN_SHOW_KEY = "ROYALTIES-pwa-show-after-login";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function isStandaloneApp(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isPwaDismissed(): boolean {
  if (typeof localStorage === "undefined") return false;
  if (localStorage.getItem(PWA_DISMISS_KEY) === "1") return true;
  if (sessionStorage.getItem(PWA_SESSION_DISMISS_KEY) === "1") return true;
  return false;
}

export function markPwaShowAfterLogin() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(PWA_LOGIN_SHOW_KEY, "1");
}

export function shouldShowPwaAfterLogin(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(PWA_LOGIN_SHOW_KEY) === "1";
}

export function clearPwaShowAfterLogin() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(PWA_LOGIN_SHOW_KEY);
}

export function dismissPwaPrompt(forSessionOnly = false) {
  if (forSessionOnly) {
    sessionStorage.setItem(PWA_SESSION_DISMISS_KEY, "1");
  } else {
    localStorage.setItem(PWA_DISMISS_KEY, "1");
  }
  clearPwaShowAfterLogin();
}

export function clearPwaDismissOnLogout() {
  sessionStorage.removeItem(PWA_SESSION_DISMISS_KEY);
  clearPwaShowAfterLogin();
}
