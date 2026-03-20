import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallGuideDrawer } from "@/components/InstallAppBanner";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { useLanguage } from "@/contexts/LanguageContext";

const DISMISS_KEY = "yormit-push-dismissed";

const PushNotificationBanner = () => {
  const { isSupported, permission, isSubscribed, subscribe } = usePushNotifications();
  const { isIOS, isMobile, isInstalled, canInstall, promptInstall } = useInstallPrompt();
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "true");
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const requiresInstall = isMobile && !isInstalled && !isSupported;
  const canRequestPermission = isSupported && permission === "default";

  if (isSubscribed || permission === "denied" || dismissed) return null;
  if (!requiresInstall && !canRequestPermission) return null;

  const handleActivate = async () => {
    if (requiresInstall) {
      if (canInstall) {
        await promptInstall();
        return;
      }

      setShowGuide(true);
      return;
    }

    setLoading(true);
    await subscribe();
    setLoading(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 mx-5 mt-2">
        <Bell className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{t.pushTitle}</p>
        </div>
        <Button size="sm" onClick={handleActivate} disabled={loading} className="shrink-0 font-semibold">
          <Bell className="h-4 w-4 mr-1.5" />
          {requiresInstall ? t.installButton : t.pushButton}
        </Button>
        <button onClick={handleDismiss} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors" aria-label="Dismiss push banner">
          <X className="h-4 w-4" />
        </button>
      </div>
      <InstallGuideDrawer open={showGuide} onOpenChange={setShowGuide} isIOS={isIOS} />
    </>
  );
};

export default PushNotificationBanner;
