'use client';

import { useState, useEffect } from "react";
import { Download, Share2, X, Smartphone, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running in standalone app mode
    const isApp = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    setIsStandalone(Boolean(isApp));
    if (isApp) return;

    // Check if user dismissed prompt recently
    const dismissed = localStorage.getItem("mariotube_pwa_dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
      return;
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphoneOrIpad = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/crios|fxios|chrome/.test(userAgent);

    if (isIphoneOrIpad) {
      setIsIOS(true);
      // Show iOS banner after a brief delay for smoother UX
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Handle Android & Chrome beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("mariotube_pwa_dismissed", Date.now().toString());
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-card/95 backdrop-blur-xl border border-primary/30 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-card-foreground">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm leading-tight text-foreground">
              Install MarioTube App
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isIOS ? (
                <span className="flex items-center gap-1">
                  Tap <Share2 className="h-3 w-3 inline text-primary" /> then <PlusSquare className="h-3 w-3 inline text-primary" /> <strong>Add to Home Screen</strong>
                </span>
              ) : (
                "Fast, full-screen native experience"
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isIOS && (
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs px-3 shadow-sm h-8"
            >
              <Download className="h-3.5 w-3.5 mr-1" /> Install
            </Button>
          )}
          <button
            onClick={handleDismiss}
            aria-label="Close prompt"
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
