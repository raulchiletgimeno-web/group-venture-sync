import { useEffect, useRef, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Send, Camera, Mic, Square, Image as ImageIcon, X, Trash2, Reply, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

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
  type: "text" | "audio" | "image" | "location";
  file_path: string | null;
  created_at: string;
  reply_to_id: string | null;
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
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [attachOpen, setAttachOpen] = useState(false);

  // undefined = not yet fetched, null = no record (first visit)
  const [lastSeenAt, setLastSeenAt] = useState<string | null | undefined>(undefined);

  const viewportRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Swipe gesture refs (per-message tracking)
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const swipingId = useRef<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<{ id: string; x: number } | null>(null);

  // Fetch last_seen_at for this chat on mount (before marking seen)
  useEffect(() => {
    if (!tripId || !user) return;
    supabase.from("trip_last_seen")
      .select("last_seen_at")
      .eq("trip_id", tripId)
      .eq("user_id", user.id)
      .eq("section", "chat")
      .maybeSingle()
      .then(({ data }) => {
        setLastSeenAt(data?.last_seen_at ?? null);
      });
  }, [tripId, user]);

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

  // Compute first unread message index
  const firstUnreadIdx = useMemo(() => {
    if (lastSeenAt === undefined) return -1;
    if (lastSeenAt === null) return -1;
    const idx = messages.findIndex(m => m.user_id !== user?.id && m.created_at > lastSeenAt);
    return idx;
  }, [messages, lastSeenAt, user?.id]);

  // Scroll logic
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;

    if (!isInitialLoad.current) {
      const isNearBottom = vp.scrollHeight - vp.scrollTop - vp.clientHeight < 150;
      if (isNearBottom) {
        requestAnimationFrame(() => { vp.scrollTop = vp.scrollHeight; });
      }
      return;
    }

    if (lastSeenAt === undefined) return;
    if (messages.length === 0) return;

    const doScroll = () => {
      if (firstUnreadIdx > 0) {
        const el = vp.querySelector(`[data-msg-idx="${firstUnreadIdx}"]`);
        if (el) {
          (el as HTMLElement).scrollIntoView({ block: "start" });
          isInitialLoad.current = false;
          return;
        }
      }
      vp.scrollTop = vp.scrollHeight;
      isInitialLoad.current = false;
    };

    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS) {
      requestAnimationFrame(() => {
        setTimeout(doScroll, 300);
      });
    } else {
      requestAnimationFrame(doScroll);
    }
  }, [messages, lastSeenAt, firstUnreadIdx]);

  const getMemberName = (userId: string) => formatDisplayName(members.find((m) => m.user_id === userId)?.name, t.usuario);
  const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const getFileUrl = (path: string) => supabase.storage.from("trip-photos").getPublicUrl(path).data.publicUrl;

  const messageSnippet = (msg: Message) => {
    if (msg.type === "image") return t.imageMsg;
    if (msg.type === "audio") return t.audioMsg;
    if (msg.type === "location") return t.locationMsg;
    return msg.content || "";
  };

  const startReply = (msg: Message) => {
    setReplyTo(msg);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const scrollToMessage = (id: string) => {
    const vp = viewportRef.current;
    if (!vp) return;
    const el = vp.querySelector(`[data-msg-id="${id}"]`);
    if (el) {
      (el as HTMLElement).scrollIntoView({ block: "center", behavior: "smooth" });
      setHighlightedId(id);
      setTimeout(() => setHighlightedId(null), 1500);
    }
  };

  const deleteMessage = async (msg: Message) => {
    if (!user || msg.user_id !== user.id) return;
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    if (msg.file_path) {
      await supabase.storage.from("trip-photos").remove([msg.file_path]);
      if (msg.type === "image") {
        await supabase.from("trip_photos").delete().eq("file_path", msg.file_path);
      }
    }
    const { error } = await supabase.from("trip_messages").delete().eq("id", msg.id);
    if (error) toast({ title: t.errorSending, variant: "destructive" });
  };

  const sendText = async () => {
    if (!text.trim() || !user || !tripId || sending) return;
    setSending(true);
    const { error } = await supabase.from("trip_messages").insert({
      trip_id: tripId, user_id: user.id, content: text.trim(), type: "text",
      reply_to_id: replyTo?.id ?? null,
    });
    if (error) toast({ title: t.errorSending, variant: "destructive" });
    else notifyTripEvent(tripId, "chat", user.id);
    setText(""); setReplyTo(null); setSending(false);
  };

  const sendImage = async (file: File) => {
    if (!user || !tripId) return;
    setSending(true);
    const ext = file.name.split(".").pop();
    const path = `${tripId}/chat/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("trip-photos").upload(path, file, { upsert: true });
    if (uploadError) { toast({ title: t.errorUploadingImage, variant: "destructive" }); setSending(false); return; }
    await supabase.from("trip_messages").insert({
      trip_id: tripId, user_id: user.id, type: "image", file_path: path,
      reply_to_id: replyTo?.id ?? null,
    });
    await supabase.from("trip_photos").insert({ trip_id: tripId, user_id: user.id, file_path: path });
    notifyTripEvent(tripId, "chat", user.id);
    setImagePreview(null); setImageFile(null); setReplyTo(null); setSending(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file); setImagePreview(URL.createObjectURL(file)); e.target.value = "";
  };

  const sendLocation = async () => {
    if (!user || !tripId || sending) return;
    if (!("geolocation" in navigator)) {
      toast({ title: t.locationUnavailable, variant: "destructive" });
      return;
    }
    const replySnap = replyTo;
    setSending(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const content = JSON.stringify({ lat: coords.latitude, lng: coords.longitude });
        const { error } = await supabase.from("trip_messages").insert({
          trip_id: tripId, user_id: user.id, type: "location",
          content, reply_to_id: replySnap?.id ?? null,
        });
        if (error) {
          toast({ title: t.errorSending, description: error.message, variant: "destructive" });
        } else {
          notifyTripEvent(tripId, "chat", user.id);
        }
        setReplyTo(null); setSending(false);
      },
      (err) => {
        const title =
          err.code === err.PERMISSION_DENIED ? t.locationDenied :
          err.code === err.TIMEOUT ? t.locationTimeout :
          t.locationUnavailable;
        toast({ title, variant: "destructive" });
        setSending(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      const replySnap = replyTo;
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (!user || !tripId) return;
        setSending(true);
        const path = `${tripId}/chat/${Date.now()}.webm`;
        const { error: uploadError } = await supabase.storage.from("trip-photos").upload(path, blob, { upsert: true, contentType: "audio/webm" });
        if (uploadError) { toast({ title: t.errorUploadingAudio, variant: "destructive" }); setSending(false); return; }
        await supabase.from("trip_messages").insert({
          trip_id: tripId, user_id: user.id, type: "audio", file_path: path,
          reply_to_id: replySnap?.id ?? null,
        });
        notifyTripEvent(tripId, "chat", user.id);
        setReplyTo(null); setSending(false);
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

  // Swipe handlers
  const onTouchStart = (e: React.TouchEvent, msgId: string) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipingId.current = msgId;
  };

  const onTouchMove = (e: React.TouchEvent, msgId: string) => {
    if (swipingId.current !== msgId) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dy > 30) { swipingId.current = null; setSwipeOffset(null); return; }
    if (dx > 0) {
      const offset = Math.min(dx, 90);
      setSwipeOffset({ id: msgId, x: offset });
    }
  };

  const onTouchEnd = (msg: Message) => {
    if (swipingId.current !== msg.id) return;
    const offset = swipeOffset?.id === msg.id ? swipeOffset.x : 0;
    swipingId.current = null;
    setSwipeOffset(null);
    if (offset > 60) startReply(msg);
  };

  const renderQuotedBlock = (replyId: string, isOwn: boolean) => {
    const original = messages.find(m => m.id === replyId);
    if (!original) {
      return (
        <div className="mb-1.5 pl-2 py-1 border-l-2 border-muted-foreground/40 bg-muted/30 rounded text-xs text-muted-foreground italic">
          {t.messageUnavailable}
        </div>
      );
    }
    const snippet = messageSnippet(original);
    return (
      <button
        type="button"
        onClick={() => scrollToMessage(original.id)}
        className="block w-full text-left mb-1.5 pl-2 pr-2 py-1 border-l-[3px] border-primary bg-primary/5 hover:bg-primary/10 transition-colors rounded"
      >
        <p className="text-xs font-semibold text-primary truncate">{getMemberName(original.user_id)}</p>
        <p className="text-xs text-foreground/70 truncate">{snippet}</p>
      </button>
    );
  };

  return (
    <div className="animate-fade-in flex flex-col" style={{ height: "calc(100vh - 7rem)" }}>
      <div ref={viewportRef} className="flex-1 overflow-y-auto px-2">
        <div className="flex flex-col gap-1 py-2">
          {messages.map((msg, idx) => {
            const isOwn = msg.user_id === user?.id;
            const offset = swipeOffset?.id === msg.id ? swipeOffset.x : 0;
            const isHighlighted = highlightedId === msg.id;
            return (
              <div key={msg.id} data-msg-idx={idx} data-msg-id={msg.id}>
                {shouldShowDateSep(idx) && (
                  <div className="flex justify-center my-3">
                    <span className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded-full">{formatDateSeparator(msg.created_at)}</span>
                  </div>
                )}
                {firstUnreadIdx === idx && (
                  <div className="flex items-center gap-2 my-3">
                    <div className="flex-1 border-t border-primary/30" />
                    <span className="text-sm text-primary font-medium px-2">{t.newMessages}</span>
                    <div className="flex-1 border-t border-primary/30" />
                  </div>
                )}
                <div
                  className="relative"
                  onTouchStart={(e) => onTouchStart(e, msg.id)}
                  onTouchMove={(e) => onTouchMove(e, msg.id)}
                  onTouchEnd={() => onTouchEnd(msg)}
                  onTouchCancel={() => { swipingId.current = null; setSwipeOffset(null); }}
                >
                  {offset > 10 && (
                    <div
                      className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 transition-opacity"
                      style={{ opacity: Math.min(offset / 60, 1) }}
                    >
                      <Reply className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
                    style={{
                      transform: `translateX(${offset}px)`,
                      transition: swipingId.current === msg.id ? "none" : "transform 0.2s ease-out",
                    }}
                  >
                    {!isOwn && (
                      <Avatar className="h-9 w-9 mt-1 shrink-0">
                        <AvatarFallback className="text-sm bg-primary/10 text-primary">{getInitials(getMemberName(msg.user_id))}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] min-w-0 rounded-2xl px-4 py-3 shadow-sm group transition-shadow ${isOwn ? "bg-white text-foreground rounded-br-md" : "bg-white text-foreground rounded-bl-md"} ${isHighlighted ? "ring-2 ring-primary" : ""}`}
                    >
                      {msg.reply_to_id && renderQuotedBlock(msg.reply_to_id, isOwn)}
                      <p className={`text-sm font-semibold mb-0.5 ${isOwn ? "text-foreground/70 text-right" : "text-foreground/70"}`}>
                        {isOwn ? t.you : getMemberName(msg.user_id)}
                      </p>
                      {msg.type === "text" && <p className="text-[17px] whitespace-pre-wrap break-words overflow-hidden text-foreground" style={{ overflowWrap: "anywhere" }}>{msg.content}</p>}
                      {msg.type === "image" && msg.file_path && (
                        <img src={getFileUrl(msg.file_path)} alt={t.image} className="rounded-lg max-w-full max-h-60 object-cover cursor-pointer" loading="lazy" decoding="async" onClick={() => window.open(getFileUrl(msg.file_path!), "_blank")} />
                      )}
                      {msg.type === "audio" && msg.file_path && (
                        <audio controls src={getFileUrl(msg.file_path)} className="max-w-[260px] h-12" ref={(el) => { if (el) el.volume = 1.0; }} />
                      )}
                      {msg.type === "location" && msg.content && (() => {
                        try {
                          const { lat, lng } = JSON.parse(msg.content);
                          const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
                          const authorName = isOwn ? t.you : getMemberName(msg.user_id);
                          return (
                            <div className="space-y-2">
                              <p className="text-[15px] text-foreground/80 leading-snug">
                                <span className="font-semibold text-foreground">{authorName}</span>{" "}
                                {t.sharedCurrentLocationBy}
                              </p>
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/20"
                              >
                                <div className="h-11 w-11 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                                  <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-foreground">{t.sharedLocation}</p>
                                  <p className="text-xs text-primary font-medium">{t.viewOnMap} →</p>
                                </div>
                              </a>
                            </div>
                          );
                        } catch {
                          return null;
                        }
                      })()}
                      <div className={`flex items-center gap-1.5 mt-0.5 ${isOwn ? "justify-end" : ""}`}>
                        <p className="text-[13px] text-foreground/50">{formatTime(msg.created_at)}</p>
                        <button
                          onClick={() => startReply(msg)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-primary/10"
                          aria-label={t.reply}
                          title={t.reply}
                        >
                          <Reply className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                        </button>
                        {isOwn && (
                          <button
                            onClick={() => deleteMessage(msg)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {replyTo && (
        <div className="px-3 py-2 border-t border-border bg-card">
          <div className="flex items-stretch gap-2">
            <div className="w-1 rounded-full bg-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary">
                {t.replyingTo} {getMemberName(replyTo.user_id)}
              </p>
              <p className="text-sm text-foreground/70 truncate">{messageSnippet(replyTo)}</p>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="shrink-0 p-1 rounded hover:bg-muted transition-colors self-start"
              aria-label="Cancel reply"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}

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
        <Popover open={attachOpen} onOpenChange={setAttachOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-9 w-9 rounded-full"
              disabled={sending || recording}
              aria-label={t.attach}
            >
              <Plus className="h-5 w-5 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-64 p-2 rounded-2xl shadow-lg"
          >
            <button
              type="button"
              onClick={() => { setAttachOpen(false); fileInputRef.current?.click(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Camera className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground">{t.takePhoto}</span>
            </button>
            <button
              type="button"
              onClick={() => { setAttachOpen(false); galleryInputRef.current?.click(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ImageIcon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground">{t.chooseFromGallery}</span>
            </button>
            <button
              type="button"
              onClick={() => { setAttachOpen(false); sendLocation(); }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground">{t.sendCurrentLocation}</span>
            </button>
          </PopoverContent>
        </Popover>

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
            <Input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} placeholder={t.writeMessage} className="flex-1 h-9 text-sm"
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
