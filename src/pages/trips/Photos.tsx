import { useRef, useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Camera, Loader2, Trash2, Image, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

import { useLanguage } from "@/contexts/LanguageContext";
import { formatDisplayName } from "@/lib/formatDisplayName";
import EmptyState from "@/components/EmptyState";
import { notifyTripEvent } from "@/lib/notifyTripEvent";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMarkSectionSeen } from "@/hooks/use-mark-section-seen";

interface MemberName {
  id: string;
  name: string | null;
}

const Photos = () => {
  const { tripId } = useParams();
  useMarkSectionSeen(tripId, "photos");
  const { user } = useAuth();
  
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [members, setMembers] = useState<MemberName[]>([]);
  const [fadeKey, setFadeKey] = useState(0);

  // Touch tracking refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (!tripId) return;
    supabase
      .from("trip_members")
      .select("user_id")
      .eq("trip_id", tripId)
      .eq("status", "approved")
      .then(async ({ data }) => {
        if (!data) return;
        const ids = data.map((m) => m.user_id);
        const { data: profiles } = await supabase.from("profiles").select("id, name").in("id", ids);
        setMembers(profiles ?? []);
      });
  }, [tripId]);

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
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${tripId}/${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("trip-photos").upload(filePath, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const { error: insertError } = await supabase.from("trip_photos").insert({ trip_id: tripId, user_id: user.id, file_path: filePath });
      if (insertError) throw insertError;
      queryClient.invalidateQueries({ queryKey: ["trip-photos", tripId] });
      notifyTripEvent(tripId, "photos", user.id);
      toast.success(t.photoUploaded);
    } catch { toast.error(t.errorUploadingPhoto); } finally {
      setUploading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
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

  // Keyboard navigation
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
        <div className="flex gap-2">
          <Button size="icon" variant="outline" disabled={uploading} onClick={() => galleryInputRef.current?.click()} title={t.uploadFromGallery}>
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Image className="h-5 w-5" />}
          </Button>
          <Button size="icon" className="gradient-hero text-primary-foreground border-0" disabled={uploading} onClick={() => cameraInputRef.current?.click()} title={t.takePhotoBtn}>
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
          </Button>
        </div>
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
        <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : photos.length === 0 ? (
        <EmptyState icon={Camera} title={t.noPhotosTitle} description={t.noPhotosDesc} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 landscape:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden bg-muted">
              <div
                className="aspect-square landscape:aspect-video cursor-pointer"
                onClick={() => setViewingIndex(index)}
              >
                <img src={getPublicUrl(photo.file_path)} alt={t.tripPhoto} className="w-full h-full object-cover transition-opacity duration-300" loading="lazy" decoding="async" />
              </div>
              <div className="px-2 py-1.5 bg-card">
                <p className="text-xs text-muted-foreground truncate">{getMemberName(photo.user_id)}</p>
              </div>
              {photo.user_id === user?.id && (
                <button onClick={() => deleteMutation.mutate({ id: photo.id, file_path: photo.file_path })} className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen photo viewer with swipe */}
      {currentPhoto && viewingIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center animate-fade-in select-none"
          onClick={() => setViewingIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close */}
          <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10" onClick={() => setViewingIndex(null)}>
            <X className="h-7 w-7" />
          </button>

          {/* Previous arrow */}
          {viewingIndex > 0 && (
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); navigateTo(viewingIndex - 1); }}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next arrow */}
          {viewingIndex < photos.length - 1 && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); navigateTo(viewingIndex + 1); }}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Photo */}
          <img
            key={fadeKey}
            src={getPublicUrl(currentPhoto.file_path)}
            alt={t.tripPhoto}
            className="max-w-[95vw] max-h-[80dvh] landscape:max-h-[85dvh] landscape:max-w-[95vw] object-contain rounded-lg animate-fade-in transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />

          {/* Info */}
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
