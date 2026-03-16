import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Plane, Hotel, Receipt, Camera, MessageCircle, CloudSun, CalendarDays,
  Users, MapPin, Calendar, Share2, Pencil, Bell, Phone, Trash2, Check, X,
  MoreVertical, ShieldCheck, ShieldOff, UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useTripRole } from "@/hooks/use-trip-role";
import { useMemberStatus } from "@/hooks/use-member-status";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocale } from "@/i18n/translations";
import { formatDisplayName } from "@/lib/formatDisplayName";
import { useToast } from "@/hooks/use-toast";
import PendingApproval from "@/components/PendingApproval";
import MemberApprovalManager from "@/components/MemberApprovalManager";
import { useUnseenSectionCounts } from "@/hooks/use-unseen-section-counts";

interface TripData {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: string;
  invite_code: string;
  created_by: string;
}

interface MemberInfo {
  user_id: string;
  name: string | null;
  role: string;
}

const TripDashboard = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isCreator, isOriginalCreator } = useTripRole(tripId);
  const { status: memberStatus, loading: statusLoading } = useMemberStatus(tripId);
  const { t, language } = useLanguage();
  const sectionCounts = useUnseenSectionCounts(tripId);
  const [trip, setTrip] = useState<TripData | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  const [membersList, setMembersList] = useState<MemberInfo[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const sectionKey: Record<string, string> = {
    transport: "transport",
    accommodation: "accommodation",
    expenses: "expenses",
    photos: "photos",
    chat: "chat",
    schedule: "schedule",
  };

  const sections = [
    { path: "transport", label: t.transport, icon: Plane, color: "bg-primary/10 text-primary" },
    { path: "accommodation", label: t.accommodation, icon: Hotel, color: "bg-accent/10 text-accent" },
    { path: "expenses", label: t.expenses, icon: Receipt, color: "bg-secondary text-secondary-foreground" },
    { path: "photos", label: t.photos, icon: Camera, color: "bg-primary/10 text-primary" },
    { path: "chat", label: t.chat, icon: MessageCircle, color: "bg-accent/10 text-accent" },
    { path: "weather", label: t.weather, icon: CloudSun, color: "bg-secondary text-secondary-foreground" },
    { path: "schedule", label: t.activities, icon: CalendarDays, color: "bg-primary/10 text-primary" },
    { path: "phones", label: t.emergencyPhones, icon: Phone, color: "bg-accent/10 text-accent" },
  ];

  const statusLabels: Record<string, string> = {
    upcoming: t.upcoming,
    active: t.active,
    finished: t.finished,
  };


  useEffect(() => {
    if (!tripId) return;

    supabase
      .from("trips")
      .select("title, destination, start_date, end_date, status, invite_code, created_by")
      .eq("id", tripId)
      .single()
      .then(({ data }) => {
        if (data) setTrip(data);
      });

    supabase
      .from("trip_members")
      .select("user_id, role, status")
      .eq("trip_id", tripId)
      .then(async ({ data }) => {
        if (!data) return;
        const approved = data.filter((m) => m.status === "approved");
        setPendingCount(data.filter((m) => m.status === "pending").length);
        setMemberCount(approved.length);
        const userIds = approved.map((m) => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", userIds);
        setMembersList(
          approved.map((m) => ({
            user_id: m.user_id,
            name: profiles?.find((p) => p.id === m.user_id)?.name ?? null,
            role: m.role,
          }))
        );
      });

    const memberChannel = supabase
      .channel(`dashboard-members-${tripId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_members", filter: `trip_id=eq.${tripId}` },
        async () => {
          const { data } = await supabase
            .from("trip_members")
            .select("user_id, role, status")
            .eq("trip_id", tripId);
          if (!data) return;
          const approved = data.filter((m) => m.status === "approved");
          setPendingCount(data.filter((m) => m.status === "pending").length);
          setMemberCount(approved.length);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(memberChannel); };
  }, [tripId]);

  const handleShare = () => {
    if (!trip) return;
    const link = `${window.location.origin}/join/${trip.invite_code}`;
    const text = `${t.joinTripTitle} "${trip.title}"! ${link}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.location.href = whatsappUrl;
  };

  const startEditing = () => {
    if (!trip) return;
    setEditTitle(trip.title);
    setEditDestination(trip.destination);
    setEditStartDate(trip.start_date);
    setEditEndDate(trip.end_date);
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const handleSave = async () => {
    if (!tripId || !trip) return;
    setSaving(true);
    const { error } = await supabase
      .from("trips")
      .update({
        title: editTitle,
        destination: editDestination,
        start_date: editStartDate,
        end_date: editEndDate,
      })
      .eq("id", tripId);
    setSaving(false);
    if (error) {
      toast({ title: t.error, variant: "destructive" });
      return;
    }
    setTrip({ ...trip, title: editTitle, destination: editDestination, start_date: editStartDate, end_date: editEndDate });
    setEditing(false);
    toast({ title: t.tripUpdated });
  };

  const handleDelete = async () => {
    if (!tripId) return;
    const { error } = await supabase.from("trips").delete().eq("id", tripId);
    if (error) {
      toast({ title: t.error, variant: "destructive" });
      return;
    }
    toast({ title: t.tripDeleted });
    navigate("/dashboard");
  };

  const handlePromote = async (userId: string) => {
    if (!tripId) return;
    const { error } = await supabase.from("trip_members").update({ role: "co-creator" }).eq("trip_id", tripId).eq("user_id", userId);
    if (error) {
      toast({ title: t.error, variant: "destructive" });
      return;
    }
    setMembersList((prev) => prev.map((m) => m.user_id === userId ? { ...m, role: "co-creator" } : m));
    toast({ title: t.coCreatorAdded });
  };

  const handleDemote = async (userId: string) => {
    if (!tripId) return;
    const { error } = await supabase.from("trip_members").update({ role: "member" }).eq("trip_id", tripId).eq("user_id", userId);
    if (error) {
      toast({ title: t.error, variant: "destructive" });
      return;
    }
    setMembersList((prev) => prev.map((m) => m.user_id === userId ? { ...m, role: "member" } : m));
    toast({ title: t.coCreatorRemoved });
  };

  const handleRemoveMember = async (userId: string) => {
    if (!tripId) return;
    const { error } = await supabase.from("trip_members").delete().eq("trip_id", tripId).eq("user_id", userId);
    if (!error) {
      setMembersList((prev) => prev.filter((m) => m.user_id !== userId));
      setMemberCount((c) => c - 1);
      toast({ title: t.memberRemoved });
    }
  };

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString(getLocale(language), { day: "numeric", month: "short", year: "numeric" });
  };

  if (!trip || statusLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (memberStatus === "pending") {
    return <PendingApproval />;
  }

  return (
    <div className="animate-fade-in">
      {isCreator && tripId && <MemberApprovalManager tripId={tripId} />}

      <div className="rounded-xl bg-card p-5 shadow-card mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="text-xl font-bold" />
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <Input value={editDestination} onChange={(e) => setEditDestination(e.target.value)} className="text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <Input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="text-sm w-auto" />
                  <span className="text-muted-foreground">—</span>
                  <Input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className="text-sm w-auto" />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={handleSave} disabled={saving || !editTitle.trim() || !editDestination.trim()}>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    {t.save}
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEditing}>
                    <X className="h-3.5 w-3.5 mr-1" />
                    {t.cancel}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-card-foreground">{trip.title}</h2>
                <div className="flex items-center gap-1.5 mt-2 text-muted-foreground text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(trip.start_date)} — {formatDate(trip.end_date)}</span>
                </div>
              </>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm hover:text-foreground transition-colors cursor-pointer">
                  <Users className="h-3.5 w-3.5" />
                  <span>{memberCount} {memberCount !== 1 ? t.members : t.member}</span>
                  {isCreator && pendingCount > 0 && (
                    <span className="inline-flex items-center gap-0.5 ml-1 text-amber-600">
                      <Bell className="h-3.5 w-3.5 animate-pulse" />
                      <span className="text-xs font-semibold">{pendingCount}</span>
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="start">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{t.members}</p>
                <div className="space-y-2">
                  {membersList.map((m) => (
                    <div key={m.user_id} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {formatDisplayName(m.name).split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-foreground truncate flex-1">{formatDisplayName(m.name)}</span>
                      {(m.role === "creator" || m.role === "co-creator") && (
                        <Pencil className="h-3 w-3 text-primary shrink-0" />
                      )}
                      {m.role === "co-creator" && (
                        <span className="text-[10px] text-muted-foreground">{t.coCreator}</span>
                      )}
                      {isOriginalCreator && m.role !== "creator" && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-0.5 rounded hover:bg-muted transition-colors">
                              <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {m.role === "co-creator" ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <ShieldOff className="h-3.5 w-3.5 mr-2" />
                                    {t.removeCoCreator}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t.confirmRemoveCoCreator}</AlertDialogTitle>
                                    <AlertDialogDescription>{t.confirmRemoveCoCreatorDesc}</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDemote(m.user_id)}>
                                      {t.removeCoCreator}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <ShieldCheck className="h-3.5 w-3.5 mr-2" />
                                    {t.makeCoCreator}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t.confirmMakeCoCreator}</AlertDialogTitle>
                                    <AlertDialogDescription>{t.confirmMakeCoCreatorDesc}</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handlePromote(m.user_id)}>
                                      {t.makeCoCreator}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                  <UserMinus className="h-3.5 w-3.5 mr-2" />
                                  {t.removeMember}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t.removeMemberConfirm}</AlertDialogTitle>
                                  <AlertDialogDescription>{t.removeMemberDesc}</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveMember(m.user_id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    {t.removeMember}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2">
            {isCreator && !editing && (
              <button onClick={startEditing} className="p-1.5 rounded-md hover:bg-muted transition-colors" title={t.editTrip}>
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <span className="gradient-hero text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full">
              {statusLabels[trip.status] ?? trip.status}
            </span>
          </div>
        </div>
        {isCreator && (
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <Button variant="outline" size="sm" className="text-sm" onClick={handleShare}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              {t.inviteFriends}
            </Button>
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {t.code}: {trip.invite_code}
            </span>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="text-sm ml-auto">
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  {t.deleteTrip}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.deleteTripConfirm}</AlertDialogTitle>
                  <AlertDialogDescription>{t.deleteTripDesc}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {t.deleteTrip}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t.sections}</h3>
      <div className="grid grid-cols-2 gap-3">
        {sections.map(({ path, label, icon: Icon, color }) => {
          const count = sectionCounts[sectionKey[path] ?? ""] ?? 0;
          return (
            <Link
              key={path}
              to={`/trip/${tripId}/${path}`}
              className="relative flex items-center gap-3 rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-all duration-300"
            >
              <div className={`rounded-lg p-2.5 ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold text-card-foreground flex-1">{label}</span>
              <UnseenBadge count={count} size="sm" />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TripDashboard;
