import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const platform = navigator.platform || "";
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("yormit-install-dismissed") === "true");

  const ua = navigator.userAgent || "";
  const isTouchDevice = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
  const isIOS = (/iPad|iPhone|iPod/.test(ua) || (platform === "MacIntel" && navigator.maxTouchPoints > 1)) && !(window as any).MSStream;
  const isAndroid = /Android/i.test(ua) || /Linux.*Mobile/i.test(ua);
  const isMobile =
    isIOS ||
    isAndroid ||
    /Mobi|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua) ||
    (isTouchDevice && window.matchMedia("(max-width: 1024px)").matches);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;

  useEffect(() => {
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, [isStandalone]);

  const canInstall = !!deferredPrompt && !isInstalled;

  const promptInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem("yormit-install-dismissed", "true");
  };

  const shouldShow = !isInstalled && !dismissed;
  const shouldShowMobileOnly = isMobile && !isInstalled && !dismissed;

  return { isIOS, isAndroid, isMobile, isInstalled, canInstall, promptInstall, shouldShow, shouldShowMobileOnly, dismiss };
}
