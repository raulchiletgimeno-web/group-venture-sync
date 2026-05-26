import { useEffect, useRef, useState } from "react";
import { Ticket, Upload, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  transport_id: string;
  user_id: string;
  file_path: string;
}

interface Props {
  transportId: string;
  tripId: string;
  isCreator: boolean;
}

const TicketManager = ({ transportId, tripId, isCreator }: Props) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [manageOpen, setManageOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [uploading, setUploading] = useState(false);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [myTicket, setMyTicket] = useState<TicketRecord | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchTickets = async () => {
    const { data } = await supabase
      .from("trip_transport_tickets")
      .select("*")
      .eq("transport_id", transportId);
    setTickets((data as TicketRecord[]) ?? []);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("trip_members")
      .select("user_id, profiles(name, email)")
      .eq("trip_id", tripId);
    setMembers((data as unknown as Member[]) ?? []);
  };

  const fetchMyTicket = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("trip_transport_tickets")
      .select("*")
      .eq("transport_id", transportId)
      .eq("user_id", user.id)
      .maybeSingle();
    setMyTicket((data as TicketRecord | null));
  };

  useEffect(() => {
    fetchTickets();
    if (isCreator) fetchMembers();
    else fetchMyTicket();
  }, [transportId]);

  const handleUpload = async (file: File) => {
    if (!selectedMember) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${tripId}/tickets/${transportId}_${selectedMember}.${ext}`;

    // Remove old file if exists
    const existing = tickets.find((tk) => tk.user_id === selectedMember);
    if (existing) {
      await supabase.storage.from("trip-photos").remove([existing.file_path]);
      await supabase.from("trip_transport_tickets").delete().eq("id", existing.id);
    }

    const { error: uploadErr } = await supabase.storage.from("trip-photos").upload(path, file, { upsert: true });
    if (uploadErr) {
      toast({ title: t.error, description: uploadErr.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { error: insertErr } = await supabase.from("trip_transport_tickets").insert({
      transport_id: transportId,
      user_id: selectedMember,
      file_path: path,
    } as any);

    if (insertErr) {
      toast({ title: t.error, description: insertErr.message, variant: "destructive" });
    } else {
      toast({ title: t.ticketUploaded });
    }
    setUploading(false);
    fetchTickets();
  };

  const handleDelete = async (ticket: TicketRecord) => {
    await supabase.storage.from("trip-photos").remove([ticket.file_path]);
    await supabase.from("trip_transport_tickets").delete().eq("id", ticket.id);
    toast({ title: t.ticketDeleted });
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
    return formatDisplayName(m?.profiles?.name, userId.slice(0, 8));
  };

  // For non-creator: show ticket button if they have a ticket
  if (!isCreator) {
    if (!myTicket) return null;
    return (
      <>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => openTicketView(myTicket.file_path)}>
          <Ticket className="h-4 w-4" />
        </Button>
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
      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => { setManageOpen(true); fetchMembers(); fetchTickets(); }}>
        <Ticket className="h-4 w-4" />
      </Button>

      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.manageTickets}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {/* Upload section */}
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
              <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
              <Button
                size="sm"
                className="w-full gradient-hero text-primary-foreground border-0"
                disabled={!selectedMember || uploading}
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-1" /> {t.uploadTicket}
              </Button>
            </div>

            {/* Existing tickets */}
            {tickets.length > 0 && (
              <div className="space-y-2">
                <Label>{t.tickets}</Label>
                {tickets.map((tk) => (
                  <div key={tk.id} className="flex items-center justify-between rounded-lg bg-muted p-2">
                    <span className="text-sm text-foreground truncate">{t.ticketFor} {memberName(tk.user_id)}</span>
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

export default TicketManager;
