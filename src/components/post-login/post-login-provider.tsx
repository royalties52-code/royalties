"use client";

import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Headphones, Share, Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  clearPostLoginPending,
  hasPostLoginPending,
  POST_LOGIN_EVENT,
  POST_LOGIN_WELCOME_TEXT,
  shouldTriggerPostLoginFromUrl,
  triggerPostLoginPopups,
} from "@/lib/auth/post-login";
import { dispatchOpenSupportChat } from "@/lib/chat/events";
import { createClient } from "@/lib/supabase/client";
import {
  isIOSDevice,
  isStandaloneApp,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/install-utils";

function PostLoginModalInner({
  welcomeText,
  conversationId,
  installEvent,
  onClose,
  onInstallEventClear,
}: {
  welcomeText: string;
  conversationId: string | null;
  installEvent: BeforeInstallPromptEvent | null;
  onClose: () => void;
  onInstallEventClear: () => void;
}) {
  const [installing, setInstalling] = useState(false);
  const ios = isIOSDevice();
  const canNativeInstall = Boolean(installEvent) && !ios;

  async function handleInstall() {
    if (!installEvent) {
      toast.message("Use your browser menu", {
        description: "Tap ⋮ → Install app / Add to Home Screen.",
      });
      return;
    }

    setInstalling(true);
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
      onInstallEventClear();
    } finally {
      setInstalling(false);
    }
  }

  function handleStartChat() {
    dispatchOpenSupportChat(conversationId ?? undefined);
    onClose();
  }

  if (isStandaloneApp()) {
    return (
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1a1a] shadow-2xl overflow-hidden">
          <div className="gradient-bg px-4 py-3 flex items-center gap-3">
            <Headphones className="h-6 w-6 text-white shrink-0" />
            <p className="text-sm font-semibold text-white">ROYALTIES Support</p>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto p-1 rounded-lg hover:bg-white/10 text-white/80"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm text-foreground leading-relaxed">{welcomeText}</p>
            <Button className="w-full" onClick={handleStartChat}>
              Start chatting
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/75">
      <div className="w-full max-w-md rounded-2xl border border-purple-500/30 bg-[#1a1a1a] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="gradient-bg px-4 py-3 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Headphones className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Welcome to ROYALTIES</p>
            <p className="text-xs text-white/75 mt-0.5">Support is here if you need help.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 shrink-0"
            aria-label="Close welcome popup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3">
            <p className="text-sm text-foreground leading-relaxed">{welcomeText}</p>
          </div>
          <Button className="w-full" onClick={handleStartChat}>
            Start chatting
          </Button>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                <Smartphone className="h-4 w-4 text-purple-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Install ROYALTIES app</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Open ROYALTIES from your home screen like a real app.
                </p>
              </div>
            </div>

            {ios ? (
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>
                  Tap <Share className="inline h-3.5 w-3.5 align-text-bottom" /> Share in Safari
                </li>
                <li>
                  Tap <strong className="text-foreground">Add to Home Screen</strong>
                </li>
              </ol>
            ) : (
              <p className="text-xs text-muted-foreground">
                {canNativeInstall
                  ? "Tap Install below to add ROYALTIES to your home screen."
                  : "Use browser menu (⋮) → Install app / Add to Home screen."}
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              {!ios && (
                <Button
                  size="sm"
                  className="flex-1"
                  disabled={installing}
                  onClick={() => void handleInstall()}
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  {installing ? "Installing…" : canNativeInstall ? "Install ROYALTIES" : "How to install"}
                </Button>
              )}
              <Button size="sm" variant="outline" className="flex-1" onClick={onClose}>
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostLoginController() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [welcomeText, setWelcomeText] = useState(POST_LOGIN_WELCOME_TEXT);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const activatingRef = useRef(false);

  const close = useCallback(() => {
    clearPostLoginPending();
    setOpen(false);
  }, []);

  const activate = useCallback(async () => {
    if (activatingRef.current) return;

    activatingRef.current = true;
    setOpen(true);
    setWelcomeText(POST_LOGIN_WELCOME_TEXT);

    try {
      const supabase = createClient();
      if (supabase) {
        for (let i = 0; i < 12; i += 1) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) break;
          await new Promise((r) => setTimeout(r, 300));
        }
      }

      for (let i = 0; i < 8; i += 1) {
        const res = await fetch("/api/chat/bot-greet", {
          method: "POST",
          credentials: "include",
        });
        if (res.status === 401) {
          await new Promise((r) => setTimeout(r, 350));
          continue;
        }
        if (res.ok) {
          const data = (await res.json()) as {
            conversationId?: string;
            sent?: boolean;
          };
          if (data.conversationId) setConversationId(data.conversationId);
          break;
        }
        break;
      }
    } finally {
      activatingRef.current = false;
    }
  }, []);

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (shouldTriggerPostLoginFromUrl(searchParams.toString())) {
      triggerPostLoginPopups();
    }
  }, [searchParams]);

  useEffect(() => {
    function onPostLogin() {
      void activate();
    }

    if (hasPostLoginPending()) {
      void activate();
    }

    window.addEventListener(POST_LOGIN_EVENT, onPostLogin);
    return () => window.removeEventListener(POST_LOGIN_EVENT, onPostLogin);
  }, [activate]);

  if (!open) return null;

  return (
    <PostLoginModalInner
      welcomeText={welcomeText}
      conversationId={conversationId}
      installEvent={installEvent}
      onClose={close}
      onInstallEventClear={() => setInstallEvent(null)}
    />
  );
}

export function PostLoginProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Suspense fallback={null}>
        <PostLoginController />
      </Suspense>
    </>
  );
}
