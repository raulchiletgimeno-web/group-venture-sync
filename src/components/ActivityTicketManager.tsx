import { useEffect, useRef, useState } from "react";
import { Ticket, Upload, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDisplayName } from "@/lib/formatDisplayName";
import { getSignedUrl } from "@/lib/signedUrl";

interface Member {
  user_id: string;
  profiles: { name: string | null } | null;
}

interface TicketRecord {
  id: string;
  schedule_id: string;
  user_id: string | null;
  file_path: string;
  ticket_type: string;
}

interface Props {
  scheduleId: string;
  tripId: string;
  isCreator: boolean;
}

const ActivityTicketManager = ({ scheduleId, tripId, isCreator }: Props) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [manageOpen, setManageOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [ticketType, setTicketType] = useState<"group" | "personal">("group");
  const [selectedMember, setSelectedMember] = useState("");
  const [uploading, setUploading] = useState(false);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [myTicket, setMyTicket] = useState<TicketRecord | null>(null);
  const [groupTicket, setGroupTicket] = useState<TicketRecord | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchTickets = async () => {
    const { data } = await supabase
      .from("trip_schedule_tickets")
      .select("*")
      .eq("schedule_id", scheduleId);
    const records = (data as TicketRecord[]) ?? [];
    setTickets(records);
    return records;
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("trip_members")
      .select("user_id, profiles(name)")
      .eq("trip_id", tripId);
    setMembers((data as unknown as Member[]) ?? []);
  };

  const fetchMyTickets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch personal ticket for this user
    const { data: personal } = await supabase
      .from("trip_schedule_tickets")
      .select("*")
      .eq("schedule_id", scheduleId)
      .eq("ticket_type", "personal")
      .eq("user_id", user.id)
      .maybeSingle();
    setMyTicket(personal as TicketRecord | null);

    // Fetch group ticket
    const { data: group } = await supabase
      .from("trip_schedule_tickets")
      .select("*")
      .eq("schedule_id", scheduleId)
      .eq("ticket_type", "group")
      .maybeSingle();
    setGroupTicket(group as TicketRecord | null);
  };

  useEffect(() => {
    if (isCreator) {
      fetchTickets();
      fetchMembers();
    } else {
      fetchMyTickets();
    }
  }, [scheduleId]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const suffix = ticketType === "group" ? "group" : selectedMember;
    const path = `${tripId}/activity-tickets/${scheduleId}_${suffix}.${ext}`;

    // Remove old file if exists
    if (ticketType === "group") {
      const existing = tickets.find((tk) => tk.ticket_type === "group");
      if (existing) {
        await supabase.storage.from("trip-photos").remove([existing.file_path]);
        await supabase.from("trip_schedule_tickets").delete().eq("id", existing.id);
      }
    } else {
      const existing = tickets.find((tk) => tk.ticket_type === "personal" && tk.user_id === selectedMember);
      if (existing) {
        await supabase.storage.from("trip-photos").remove([existing.file_path]);
        await supabase.from("trip_schedule_tickets").delete().eq("id", existing.id);
      }
    }

    const { error: uploadErr } = await supabase.storage.from("trip-photos").upload(path, file, { upsert: true });
    if (uploadErr) {
      toast({ title: t.error, description: uploadErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { error: insertErr } = await supabase.from("trip_schedule_tickets").insert({
      schedule_id: scheduleId,
      user_id: ticketType === "personal" ? selectedMember : null,
      file_path: path,
      ticket_type: ticketType,
    } as any);

    if (insertErr) {
      toast({ title: t.error, description: insertErr.message, variant: "destructive" });
    } else {
      toast({ title: t.activityTicketUploaded });
    }
    setUploading(false);
    fetchTickets();
  };

  const handleDelete = async (ticket: TicketRecord) => {
    await supabase.storage.from("trip-photos").remove([ticket.file_path]);
    await supabase.from("trip_schedule_tickets").delete().eq("id", ticket.id);
    toast({ title: t.activityTicketDeleted });
    fetchTickets();
  };

  const openTicketView = async (filePath: string) => {
    const url = await getSignedUrl(filePath);
    if (!url) return;
    setViewUrl(url);
    setViewOpen(true);
  };

  const memberName = (userId: string) => {
    const m = members.find((m) => m.user_id === userId);
    return formatDisplayName(m?.profiles?.name, m?.profiles?.email || userId.slice(0, 8));
  };

  // Non-creator: show ticket icon only if they have a personal or group ticket
  if (!isCreator) {
    const visibleTicket = myTicket || groupTicket;
    if (!visibleTicket) return null;
    return (
      <>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openTicketView(visibleTicket.file_path)}>
              <Ticket className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t.tickets}</TooltipContent>
        </Tooltip>
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
            <DialogHeader><DialogTitle>{t.tickets}</DialogTitle></DialogHeader>
            {viewUrl && (
              viewUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)
                ? <img src={viewUrl} alt="Ticket" className="w-full rounded-lg" />
                : <iframe src={viewUrl} className="w-full h-[60vh] rounded-lg" title="Ticket" />
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Creator view
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => { setManageOpen(true); fetchMembers(); fetchTickets(); }}>
            <Ticket className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.manageActivityTickets}</TooltipContent>
      </Tooltip>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.manageActivityTickets}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Ticket type */}
            <div className="space-y-2">
              <Label>{t.ticketType}</Label>
              <Select value={ticketType} onValueChange={(v) => setTicketType(v as "group" | "personal")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="group">{t.groupTicket}</SelectItem>
                  <SelectItem value="personal">{t.personalTicket}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Member select (only for personal) */}
            {ticketType === "personal" && (
              <div className="space-y-2">
                <Label>{t.selectMember}</Label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger><SelectValue placeholder={t.selectMember} /></SelectTrigger>
                  <SelectContent>
                    {members.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {formatDisplayName(m.profiles?.name, m.profiles?.email || m.user_id.slice(0, 8))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Upload button */}
            <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
            <Button
              size="sm"
              className="w-full gradient-hero text-primary-foreground border-0"
              disabled={(ticketType === "personal" && !selectedMember) || uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-1" /> {t.uploadTicket}
            </Button>

            {/* Existing tickets */}
            {tickets.length > 0 && (
              <div className="space-y-2">
                <Label>{t.tickets}</Label>
                {tickets.map((tk) => (
                  <div key={tk.id} className="flex items-center justify-between rounded-lg bg-muted p-2">
                    <span className="text-sm text-foreground truncate">
                      {tk.ticket_type === "group"
                        ? t.groupTicket
                        : `${t.ticketFor} ${tk.user_id ? memberName(tk.user_id) : ""}`}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openTicketView(tk.file_path)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(tk)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>{t.tickets}</DialogTitle></DialogHeader>
          {viewUrl && (
            viewUrl.match(/\.(jpg|jpeg|png|webp|gif)$/i)
              ? <img src={viewUrl} alt="Ticket" className="w-full rounded-lg" />
              : <iframe src={viewUrl} className="w-full h-[60vh] rounded-lg" title="Ticket" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActivityTicketManager;
