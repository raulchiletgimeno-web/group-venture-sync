import { useRef, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Camera, Loader2, Trash2, Image, X, ChevronLeft, ChevronRight, Video, Play } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDisplayName } from "@/lib/formatDisplayName";
import EmptyState from "@/components/EmptyState";
import { notifyTripEvent } from "@/lib/notifyTripEvent";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useMarkSectionSeen } from "@/hooks/use-mark-section-seen";

const isVideoFile = (photo: { media_type?: string; file_path: string }) => {
  if (photo.media_type === "video") return true;
  const ext = photo.file_path.split(".").pop()?.toLowerCase();
  return ["mp4", "mov", "webm", "avi", "m4v"].includes(ext || "");
};

const compressImage = (file: File, maxDim = 1920, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // Skip non-image or already small files
    if (!file.type.startsWith("image/") || file.size < 500_000) {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read_error"));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("decode_error"));
      img.onload = () => {
        let { width, height } = img;
        if (width <= maxDim && height <= maxDim && file.size < 1_000_000) {
          resolve(file);
          return;
        }
        const ratio = Math.min(maxDim / width, maxDim / height, 1);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(file); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : resolve(file),
          "image/jpeg",
          quality
        );
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const Photos = () => {
  const { tripId } = useParams();
  useMarkSectionSeen(tripId, "photos");
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [fadeKey, setFadeKey] = useState(0);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Members via useQuery for instant cache + parallel fetch
  const { data: members = [] } = useQuery({
    queryKey: ["trip-members-profiles", tripId],
    queryFn: async () => {
      const { data } = await supabase
        .from("trip_members")
        .select("user_id")
        .eq("trip_id", tripId!)
        .eq("status", "approved");
      if (!data?.length) return [];
      const ids = data.map((m) => m.user_id);
      const { data: profiles } = await supabase.from("profiles").select("id, name").in("id", ids);
      return profiles ?? [];
    },
    enabled: !!tripId,
    staleTime: 60_000,
  });

  const getMemberName = (userId: string) => {
    const m = members.find((p) => p.id === userId);
    return formatDisplayName(m?.name);
  };

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["trip-photos", tripId],
    queryFn: async () => {
      const { data, error } = await supabase.from("trip_photos").select("*").eq("trip_id", tripId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tripId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (photo: { id: string; file_path: string }) => {
      const { error: storageError } = await supabase.storage.from("trip-photos").remove([photo.file_path]);
      if (storageError) throw storageError;
      const { error } = await supabase.from("trip_photos").delete().eq("id", photo.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["trip-photos", tripId] }); toast.success(t.photoDeleted); },
    onError: () => toast.error(t.errorDeletingPhoto),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tripId || !user) return;
    setUploading(true);
    setUploadProgress(10);
    const isVideo = file.type.startsWith("video/");

    try {
      let uploadBlob: Blob = file;
      let ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");

      if (!isVideo) {
        setUploadStatus(t.optimizingPhoto || "Optimizando…");
        setUploadProgress(20);
        try {
          uploadBlob = await compressImage(file);
          ext = "jpg"; // compressed to JPEG
        } catch {
          // Compression failed, upload original
          uploadBlob = file;
        }
        setUploadProgress(40);
      } else {
        setUploadProgress(30);
      }

      setUploadStatus(t.uploadingMedia || "Subiendo…");
      const filePath = `${tripId}/${user.id}/${crypto.randomUUID()}.${ext}`;
      setUploadProgress(50);

      const { error: uploadError } = await supabase.storage
        .from("trip-photos")
        .upload(filePath, uploadBlob, { contentType: isVideo ? file.type : "image/jpeg" });
      if (uploadError) throw uploadError;

      setUploadProgress(80);
      setUploadStatus(t.savingMedia || "Guardando…");

      const { error: insertError } = await supabase.from("trip_photos").insert({
        trip_id: tripId,
        user_id: user.id,
        file_path: filePath,
        media_type: isVideo ? "video" : "image",
      });
      if (insertError) throw insertError;

      setUploadProgress(100);
      queryClient.invalidateQueries({ queryKey: ["trip-photos", tripId] });
      notifyTripEvent(tripId, "photos", user.id);
      toast.success(isVideo ? t.videoUploaded : t.photoUploaded);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("exceeded") || msg.includes("too large") || msg.includes("413")) {
        toast.error(t.fileTooLarge || "Archivo demasiado grande");
      } else if (msg.includes("network") || msg.includes("Failed to fetch")) {
        toast.error(t.networkError || "Error de conexión. Inténtalo de nuevo.");
      } else {
        toast.error(isVideo ? t.errorUploadingVideo : t.errorUploadingPhoto);
      }
    } finally {
      setUploading(false);
      setUploadStatus("");
      setUploadProgress(0);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };

  const getPublicUrl = (filePath: string) => supabase.storage.from("trip-photos").getPublicUrl(filePath).data.publicUrl;

  const navigateTo = useCallback((newIndex: number) => {
    if (newIndex >= 0 && newIndex < photos.length) {
      setFadeKey((k) => k + 1);
      setViewingIndex(newIndex);
    }
  }, [photos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (viewingIndex === null) return;
    const delta = touchStartX.current - touchEndX.current;
    if (delta > 50) navigateTo(viewingIndex + 1);
    else if (delta < -50) navigateTo(viewingIndex - 1);
  };

  useEffect(() => {
    if (viewingIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") navigateTo(viewingIndex + 1);
      else if (e.key === "ArrowLeft") navigateTo(viewingIndex - 1);
      else if (e.key === "Escape") setViewingIndex(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [viewingIndex, navigateTo]);

  const currentPhoto = viewingIndex !== null ? photos[viewingIndex] : null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">{t.photosTitle}</h2>
        <div className="flex gap-3">
          <Button size="icon" className="gradient-hero text-primary-foreground border-0 h-11 w-11" disabled={uploading} onClick={() => galleryInputRef.current?.click()} title={t.uploadFromGallery}>
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Image className="h-6 w-6" />}
          </Button>
          <Button size="icon" className="gradient-hero text-primary-foreground border-0 h-11 w-11" disabled={uploading} onClick={() => videoInputRef.current?.click()} title={t.recordVideoBtn}>
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Video className="h-6 w-6" />}
          </Button>
          <Button size="icon" className="gradient-hero text-primary-foreground border-0 h-11 w-11" disabled={uploading} onClick={() => cameraInputRef.current?.click()} title={t.takePhotoBtn}>
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
          </Button>
        </div>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
        <input ref={galleryInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
        <input ref={videoInputRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={handleFileUpload} />
      </div>

      {/* Upload progress banner */}
      {uploading && (
        <div className="mb-4 p-3 rounded-xl bg-muted/60 backdrop-blur-sm border border-border/50 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-medium text-foreground">{uploadStatus}</span>
          </div>
          <Progress value={uploadProgress} className="h-1.5" />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : photos.length === 0 ? (
        <EmptyState icon={Camera} title={t.noPhotosTitle} description={t.noPhotosDesc} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 landscape:grid-cols-4 gap-3">
          {photos.map((photo, index) => {
            const video = isVideoFile(photo);
            return (
              <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-muted">
                <div
                  className="aspect-square landscape:aspect-video cursor-pointer relative"
                  onClick={() => setViewingIndex(index)}
                >
                  {video ? (
                    <>
                      <video
                        src={getPublicUrl(photo.file_path)}
                        muted
                        preload="metadata"
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-black/50 p-2.5">
                          <Play className="h-5 w-5 text-white fill-white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img src={getPublicUrl(photo.file_path)} alt={t.tripPhoto} className="w-full h-full object-cover transition-opacity duration-300" loading="lazy" decoding="async" />
                  )}
                </div>
                <div className="px-2 py-1.5 bg-card">
                  <p className="text-xs text-muted-foreground truncate">{getMemberName(photo.user_id)}</p>
                </div>
              {photo.user_id === user?.id && (
                <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: photo.id, file_path: photo.file_path }); }} className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen viewer */}
      {currentPhoto && viewingIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-fade-in select-none"
          onClick={() => setViewingIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10" onClick={() => setViewingIndex(null)}>
            <X className="h-7 w-7" />
          </button>

          {viewingIndex > 0 && (
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); navigateTo(viewingIndex - 1); }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {viewingIndex < photos.length - 1 && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); navigateTo(viewingIndex + 1); }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {isVideoFile(currentPhoto) ? (
            <video
              key={fadeKey}
              src={getPublicUrl(currentPhoto.file_path)}
              controls
              autoPlay
              playsInline
              className="max-w-[95vw] max-h-[80vh] landscape:max-h-[88vh] landscape:max-w-[96vw] rounded-lg animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              key={fadeKey}
              src={getPublicUrl(currentPhoto.file_path)}
              alt={t.tripPhoto}
              className="max-w-[95vw] max-h-[80vh] landscape:max-h-[88vh] landscape:max-w-[96vw] object-contain rounded-lg animate-fade-in transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
          )}

          <div className="flex flex-col items-center mt-3 landscape:mt-1">
            <p className="text-white/70 text-sm landscape:text-xs">{getMemberName(currentPhoto.user_id)}</p>
            <p className="text-white/40 text-xs mt-1">{viewingIndex + 1} / {photos.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;
