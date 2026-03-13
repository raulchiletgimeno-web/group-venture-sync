import { useState } from "react";
import { Download, X, Share, PlusSquare, Smartphone, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

interface InstallAppBannerProps {
  variant?: "landing" | "dashboard";
}

const InstallAppBanner = ({ variant = "dashboard" }: InstallAppBannerProps) => {
  const { isIOS, canInstall, promptInstall, shouldShow, shouldShowMobileOnly, dismiss } = useInstallPrompt();
  const { t } = useLanguage();
  const [showGuide, setShowGuide] = useState(false);

  const visible = variant === "landing" ? shouldShow : shouldShowMobileOnly;
  if (!visible) return null;

  const handleClick = () => {
    if (canInstall) {
      promptInstall();
    } else {
      setShowGuide(true);
    }
  };

  if (variant === "landing") {
    return (
      <>
        <div className="flex items-center justify-center gap-3 py-3 px-5 bg-primary/10 border-t border-primary/20">
          <Smartphone className="h-5 w-5 text-primary shrink-0" />
          <p className="text-sm font-medium text-foreground">{t.installTitle}</p>
          <Button size="sm" onClick={handleClick} className="shrink-0 font-semibold">
            <Download className="h-4 w-4 mr-1.5" />
            {t.installButton}
          </Button>
          <button onClick={dismiss} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <InstallGuideDrawer open={showGuide} onOpenChange={setShowGuide} isIOS={isIOS} />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 px-4 py-3 mx-5 mt-2">
        <Smartphone className="h-5 w-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{t.installTitle}</p>
        </div>
        <Button size="sm" onClick={handleClick} className="shrink-0 font-semibold">
          <Download className="h-4 w-4 mr-1.5" />
          {t.installButton}
        </Button>
        <button onClick={dismiss} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <InstallGuideDrawer open={showGuide} onOpenChange={setShowGuide} isIOS={isIOS} />
    </>
  );
};

export function InstallGuideDrawer({ open, onOpenChange, isIOS }: { open: boolean; onOpenChange: (v: boolean) => void; isIOS: boolean }) {
  const { t } = useLanguage();

  const iosSteps = [
    { icon: Share, text: t.installIOSStep1 },
    { icon: PlusSquare, text: t.installIOSStep2 },
    { icon: Download, text: t.installIOSStep3 },
  ];

  const androidSteps = [
    { icon: MoreVertical, text: t.installAndroidStep1 || "Pulsa el menú ⋮ de tu navegador" },
    { icon: PlusSquare, text: t.installAndroidStep2 || "Selecciona \"Añadir a pantalla de inicio\"" },
    { icon: Download, text: t.installAndroidStep3 || "Pulsa \"Añadir\" para confirmar" },
  ];

  const steps = isIOS ? iosSteps : androidSteps;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-center pb-2">
          <DrawerTitle className="text-xl font-extrabold">{t.installTitle}</DrawerTitle>
          <DrawerDescription>{isIOS ? t.installIOSDesc : (t.installAndroidDesc || "Sigue estos pasos para instalar YORMIT")}</DrawerDescription>
        </DrawerHeader>
        <div className="px-6 py-4 space-y-5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="shrink-0 h-12 w-12 rounded-full gradient-hero flex items-center justify-center shadow-card">
                <step.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {i + 1}
                </span>
                <p className="text-sm font-semibold text-foreground">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full font-semibold">
              {t.installDismiss}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default InstallAppBanner;
