import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Camera, Loader2, Trash2, Image } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTripRole } from "@/hooks/use-trip-role";
import { useLanguage } from "@/contexts/LanguageContext";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Photos = () => {
  const { tripId } = useParams();
  const { user } = useAuth();
  const { isCreator } = useTripRole(tripId);
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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
      toast.success(t.photoUploaded);
    } catch { toast.error(t.errorUploadingPhoto); } finally {
      setUploading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  const getPublicUrl = (filePath: string) => supabase.storage.from("trip-photos").getPublicUrl(filePath).data.publicUrl;

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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square bg-muted">
              <img src={getPublicUrl(photo.file_path)} alt={t.tripPhoto} className="w-full h-full object-cover" loading="lazy" />
              {(photo.user_id === user?.id || isCreator) && (
                <button onClick={() => deleteMutation.mutate({ id: photo.id, file_path: photo.file_path })} className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Photos;
