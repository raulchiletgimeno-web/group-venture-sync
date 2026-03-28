import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Send, Camera, Mic, Square, Image as ImageIcon, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocale } from "@/i18n/translations";
import { useToast } from "@/hooks/use-toast";
import { formatDisplayName } from "@/lib/formatDisplayName";
import { useMarkSectionSeen } from "@/hooks/use-mark-section-seen";
import { notifyTripEvent } from "@/lib/notifyTripEvent";

interface Message {
  id: string;
  user_id: string;
  content: string | null;
  type: "text" | "audio" | "image";
  file_path: string | null;
  created_at: string;
}

interface Member {
  user_id: string;
  name: string;
}

const Chat = () => {
  const { tripId } = useParams();
  useMarkSectionSeen(tripId, "chat");
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!tripId) return;
    supabase.from("trip_members").select("user_id, profiles:user_id(name)").eq("trip_id", tripId)
      .then(({ data }) => {
        if (data) setMembers(data.map((m: any) => ({ user_id: m.user_id, name: m.profiles?.name || t.usuario })));
      });
  }, [tripId]);

  useEffect(() => {
    if (!tripId) return;
    supabase.from("trip_messages").select("*").eq("trip_id", tripId).order("created_at", { ascending: true })
      .then(({ data }) => { if (data) setMessages(data as Message[]); });
  }, [tripId]);

  useEffect(() => {
    if (!tripId) return;
    const channel = supabase.channel(`chat-${tripId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "trip_messages", filter: `trip_id=eq.${tripId}` },
        (payload) => { setMessages((prev) => prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new as Message]); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tripId]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const getMemberName = (userId: string) => formatDisplayName(members.find((m) => m.user_id === userId)?.name, t.usuario);
  const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const getFileUrl = (path: string) => supabase.storage.from("trip-photos").getPublicUrl(path).data.publicUrl;

  const deleteMessage = async (msg: Message) => {
    if (!user || msg.user_id !== user.id) return;
    // Remove from local state immediately
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    // Delete file from storage if exists
    if (msg.file_path) {
      await supabase.storage.from("trip-photos").remove([msg.file_path]);
      // Also remove from trip_photos if it was an image
      if (msg.type === "image") {
        await supabase.from("trip_photos").delete().eq("file_path", msg.file_path);
      }
    }
    // Delete the message row (RLS enforces author-only)
    const { error } = await supabase.from("trip_messages").delete().eq("id", msg.id);
    if (error) toast({ title: t.errorSending, variant: "destructive" });
  };

  const sendText = async () => {
    if (!text.trim() || !user || !tripId || sending) return;
    setSending(true);
    const { error } = await supabase.from("trip_messages").insert({ trip_id: tripId, user_id: user.id, content: text.trim(), type: "text" });
    if (error) toast({ title: t.errorSending, variant: "destructive" });
    else notifyTripEvent(tripId, "chat", user.id);
    setText(""); setSending(false);
  };

  const sendImage = async (file: File) => {
    if (!user || !tripId) return;
    setSending(true);
    const ext = file.name.split(".").pop();
    const path = `${tripId}/chat/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("trip-photos").upload(path, file, { upsert: true });
    if (uploadError) { toast({ title: t.errorUploadingImage, variant: "destructive" }); setSending(false); return; }
    await supabase.from("trip_messages").insert({ trip_id: tripId, user_id: user.id, type: "image", file_path: path });
    // Also add to trip_photos so it appears in the Photos tab
    await supabase.from("trip_photos").insert({ trip_id: tripId, user_id: user.id, file_path: path });
    notifyTripEvent(tripId, "chat", user.id);
    setImagePreview(null); setImageFile(null); setSending(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file); setImagePreview(URL.createObjectURL(file)); e.target.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (!user || !tripId) return;
        setSending(true);
        const path = `${tripId}/chat/${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage.from("trip-photos").upload(path, blob, { upsert: true, contentType: "audio/webm" });
        if (uploadError) { toast({ title: t.errorUploadingAudio, variant: "destructive" }); setSending(false); return; }
        await supabase.from("trip_messages").insert({ trip_id: tripId, user_id: user.id, type: "audio", file_path: path });
        notifyTripEvent(tripId, "chat", user.id);
        setSending(false);
      };
      mediaRecorder.start(); setRecording(true);
    } catch { toast({ title: t.errorMicrophone, variant: "destructive" }); }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString(getLocale(language), { hour: "2-digit", minute: "2-digit" });

  const formatDateSeparator = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return t.today;
    if (d.toDateString() === yesterday.toDateString()) return t.yesterday;
    return d.toLocaleDateString(getLocale(language), { day: "numeric", month: "long" });
  };

  const shouldShowDateSep = (idx: number) => {
    if (idx === 0) return true;
    return new Date(messages[idx].created_at).toDateString() !== new Date(messages[idx - 1].created_at).toDateString();
  };

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: "calc(100vh - 7rem)" }}>
      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col gap-1 py-2">
          {messages.map((msg, idx) => {
            const isOwn = msg.user_id === user?.id;
            return (
              <div key={msg.id}>
                {shouldShowDateSep(idx) && (
                  <div className="flex justify-center my-3">
                    <span className="text-xs bg-muted text-muted-foreground px-3 py-1 rounded-full">{formatDateSeparator(msg.created_at)}</span>
                  </div>
                )}
                <div className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                  {!isOwn && (
                    <Avatar className="h-7 w-7 mt-1 shrink-0">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{getInitials(getMemberName(msg.user_id))}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 shadow-sm group ${isOwn ? "bg-white text-foreground rounded-br-md" : "bg-white text-foreground rounded-bl-md"}`}>
                    <p className={`text-[11px] font-semibold mb-0.5 ${isOwn ? "text-foreground/70 text-right" : "text-foreground/70"}`}>
                      {isOwn ? t.you : getMemberName(msg.user_id)}
                    </p>
                    {msg.type === "text" && <p className="text-sm whitespace-pre-wrap break-words text-foreground">{msg.content}</p>}
                    {msg.type === "image" && msg.file_path && (
                      <img src={getFileUrl(msg.file_path)} alt={t.image} className="rounded-lg max-w-full max-h-60 object-cover cursor-pointer" loading="lazy" decoding="async" onClick={() => window.open(getFileUrl(msg.file_path!), "_blank")} />
                    )}
                    {msg.type === "audio" && msg.file_path && (
                      <audio controls src={getFileUrl(msg.file_path)} className="max-w-[260px] h-10" ref={(el) => { if (el) el.volume = 1.0; }} />
                    )}
                    <div className={`flex items-center gap-1.5 mt-0.5 ${isOwn ? "justify-end" : ""}`}>
                      <p className="text-[10px] text-foreground/50">{formatTime(msg.created_at)}</p>
                      {isOwn && (
                        <button
                          onClick={() => deleteMessage(msg)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive transition-colors" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {imagePreview && (
        <div className="px-3 py-2 border-t border-border bg-card">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg object-cover" />
            <button onClick={() => { setImagePreview(null); setImageFile(null); }} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-border bg-card px-2 py-2 flex items-center gap-1.5">
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageSelect} />
        <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={() => fileInputRef.current?.click()} disabled={sending || recording}>
          <Camera className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={() => galleryInputRef.current?.click()} disabled={sending || recording}>
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </Button>

        {recording ? (
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm text-muted-foreground">{t.recordingAudio}</span>
            </div>
            <Button variant="destructive" size="icon" className="h-9 w-9 shrink-0" onClick={stopRecording}>
              <Square className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder={t.writeMessage} className="flex-1 h-9 text-sm"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (imageFile) sendImage(imageFile); else sendText(); } }}
              disabled={sending}
            />
            {text.trim() || imageFile ? (
              <Button size="icon" className="shrink-0 h-9 w-9" onClick={() => { if (imageFile) sendImage(imageFile); else sendText(); }} disabled={sending}>
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={startRecording} disabled={sending}>
                <Mic className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
