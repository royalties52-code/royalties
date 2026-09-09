"use client";

import { useEffect, useState } from "react";
import { Download, Share, Smartphone, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  clearPwaShowAfterLogin,
  dismissPwaPrompt,
  isIOSDevice,
  isPwaDismissed,
  isStandaloneApp,
  shouldShowPwaAfterLogin,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/install-utils";

interface InstallAppPromptProps {
  loggedIn: boolean;
  installEvent: BeforeInstallPromptEvent | null;
  onInstallEventClear: () => void;
}

export function InstallAppPrompt({
  loggedIn,
  installEvent,
  onInstallEventClear,
}: InstallAppPromptProps) {
  const [visible, setVisible] = useState(false);
  const [installing, setInstalling] = useState(false);
  const ios = isIOSDevice();

  useEffect(() => {
    if (!loggedIn || isStandaloneApp()) {
      setVisible(false);
      return;
    }

    const showAfterLogin = shouldShowPwaAfterLogin();
    if (showAfterLogin) {
      setVisible(true);
      return;
    }

    if (isPwaDismissed()) {
      setVisible(false);
      return;
    }

    if (ios) return;

    if (installEvent) {
      setVisible(true);
    }
  }, [loggedIn, installEvent, ios]);

  if (!visible) return null;

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
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") {
        dismissPwaPrompt(true);
        setVisible(false);
      }
      onInstallEventClear();
    } finally {
      setInstalling(false);
    }
  }

  function handleDismiss() {
    dismissPwaPrompt(true);
    setVisible(false);
  }

  function handleGotIt() {
    clearPwaShowAfterLogin();
    setVisible(false);
  }

  const canNativeInstall = Boolean(installEvent) && !ios;

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 right-3 sm:left-6 sm:right-auto sm:max-w-sm z-[9999] pointer-events-none">
      <div className="pointer-events-auto rounded-2xl border border-purple-500/35 bg-[#1a1a1a]/98 backdrop-blur-md shadow-2xl shadow-black/50 overflow-hidden">
        <div className="gradient-bg px-4 py-3 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Install ROYALTIES app</p>
            <p className="text-xs text-white/75 mt-0.5">
              Add ROYALTIES to your home screen — opens like a real app.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGotIt}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 shrink-0"
            aria-label="Close install prompt"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-3">
          {ios ? (
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                Tap <Share className="inline h-3.5 w-3.5 align-text-bottom mx-0.5" /> Share in Safari
              </li>
              <li>Select <strong className="text-foreground">Add to Home Screen</strong></li>
              <li>Tap <strong className="text-foreground">Add</strong></li>
            </ol>
          ) : canNativeInstall ? (
            <p className="text-xs text-muted-foreground">
              Tap Install below — your browser adds ROYALTIES to your home screen.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Open browser menu (⋮) → <strong className="text-foreground">Install app</strong> or{" "}
              <strong className="text-foreground">Add to Home screen</strong>.
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
            <Button
              size="sm"
              variant={ios || !canNativeInstall ? "default" : "outline"}
              className="flex-1"
              onClick={ios ? handleGotIt : handleDismiss}
            >
              {ios ? "Got it" : "Not now"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
