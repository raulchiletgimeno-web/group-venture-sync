import { useEffect, useRef, useState } from "react";
import { Route, Share2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { getSignedUrl } from "@/lib/signedUrl";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gpxPath: string | null;
  gpxName: string | null;
}

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
}

function ensureGpxName(name: string | null | undefined): string {
  const base = (name || "track.gpx").trim() || "track.gpx";
  return base.toLowerCase().endsWith(".gpx") ? base : `${base}.gpx`;
}

const GpxShareDialog = ({ open, onOpenChange, gpxPath, gpxName }: Props) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [preparing, setPreparing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const isIOS = detectIOS();

  useEffect(() => {
    if (!open || !gpxPath) return;
    let cancelled = false;
    setPreparing(true);
    setFile(null);
    setShowIosHint(false);
    (async () => {
      try {
        const url = await getSignedUrl(gpxPath);
        if (!url) throw new Error("no_url");
        const res = await fetch(url);
        if (!res.ok) throw new Error("bad_response");
        const blob = await res.blob();
        if (cancelled) return;
        const filename = ensureGpxName(gpxName);
        const f = new File([blob], filename, { type: "application/gpx+xml" });
        const obj = URL.createObjectURL(blob);
        objectUrlRef.current = obj;
        setObjectUrl(obj);
        setFile(f);
      } catch (e) {
        console.warn("gpx prepare failed");
        if (!cancelled) {
          toast({ title: t.error, description: t.gpxPrepareError, variant: "destructive" });
          onOpenChange(false);
        }
      } finally {
        if (!cancelled) setPreparing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, gpxPath]);

  useEffect(() => {
    if (!open) {
      if (objectUrlRef.current) {
        const url = objectUrlRef.current;
        objectUrlRef.current = null;
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setFile(null);
      setObjectUrl(null);
      setShowIosHint(false);
    }
  }, [open]);

  const handleShare = async () => {
    if (!file) return;
    const nav: any = navigator;
    const canShareFiles =
      typeof nav.canShare === "function" &&
      typeof nav.share === "function" &&
      nav.canShare({ files: [file] });
    if (canShareFiles) {
      try {
        await nav.share({ files: [file], title: file.name });
        return;
      } catch (e: any) {
        if (e && e.name === "AbortError") return;
        console.warn("gpx share failed");
      }
    } else {
      toast({ title: t.gpxShareUnsupported });
    }
    handleDownload();
  };

  const handleDownload = () => {
    if (!file || !objectUrl) return;
    try {
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = file.name;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (isIOS) setShowIosHint(true);
    } catch (e) {
      console.warn("gpx download failed");
      if (isIOS) setShowIosHint(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            {t.gpxOpenOrShare}
          </DialogTitle>
          {gpxName && (
            <DialogDescription className="truncate">{ensureGpxName(gpxName)}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-2">
          <Button
            className="w-full gradient-hero text-primary-foreground border-0"
            disabled={preparing || !file}
            onClick={handleShare}
          >
            {preparing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4 mr-2" />
            )}
            {t.gpxOpenWithApp}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            disabled={preparing || !file}
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            {t.gpxSaveFile}
          </Button>

          {(isIOS || showIosHint) && (
            <p className="text-xs text-muted-foreground pt-2 leading-relaxed">
              {t.gpxIosHint}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GpxShareDialog;
